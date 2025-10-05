import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
from datetime import datetime
import glob

class FraudDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = [
            'amount', 'hour', 'merchant_category_encoded', 'payment_method_encoded',
            'customer_age', 'transaction_frequency', 'location_risk_score'
        ]
        self.total_predictions = 0
        self.fraud_detected = 0
        self.model_path = 'fraud_model.joblib'
        self.scaler_path = 'scaler.joblib'
        self.encoders_path = 'encoders.joblib'
        self.data_path = 'data/'
        self.use_real_data = False
        self.model_accuracy = 0.89  # Default value
        
    def generate_synthetic_data(self, n_samples=10000):
        """Generate synthetic transaction data for training"""
        np.random.seed(42)
        
        # Generate normal transactions (80%)
        n_normal = int(n_samples * 0.8)
        normal_data = {
            'amount': np.random.lognormal(3, 1, n_normal),  # Most transactions are small
            'hour': np.random.choice(range(6, 23), n_normal),  # Business hours
            'merchant_category': np.random.choice(['grocery', 'gas', 'restaurant', 'retail', 'online'], n_normal),
            'payment_method': np.random.choice(['card', 'mobile', 'online'], n_normal, p=[0.6, 0.3, 0.1]),
            'customer_age': np.random.normal(40, 15, n_normal).clip(18, 80),
            'transaction_frequency': np.random.poisson(5, n_normal) + 1,
            'location_risk_score': np.random.beta(2, 8, n_normal),  # Most locations are safe
            'is_fraud': [0] * n_normal
        }
        
        # Generate fraudulent transactions (20%)
        n_fraud = n_samples - n_normal
        fraud_data = {
            'amount': np.concatenate([
                np.random.lognormal(2, 0.5, n_fraud//2),  # Small amounts
                np.random.lognormal(6, 1, n_fraud//2)     # Large amounts
            ]),
            'hour': np.random.choice(list(range(0, 6)) + list(range(22, 24)), n_fraud),  # Unusual hours
            'merchant_category': np.random.choice(['online', 'atm', 'unknown', 'retail'], n_fraud),
            'payment_method': np.random.choice(['card', 'mobile', 'online'], n_fraud, p=[0.3, 0.2, 0.5]),
            'customer_age': np.random.uniform(18, 80, n_fraud),
            'transaction_frequency': np.random.poisson(2, n_fraud) + 1,  # Lower frequency
            'location_risk_score': np.random.beta(6, 2, n_fraud),  # Higher risk locations
            'is_fraud': [1] * n_fraud
        }
        
        # Combine data
        data = {}
        for key in normal_data.keys():
            data[key] = np.concatenate([normal_data[key], fraud_data[key]])
        
        return pd.DataFrame(data)
    
    def load_real_data(self):
        """Load real UPI transaction data from CSV"""
        # Look for CSV files in data directory
        csv_files = glob.glob(os.path.join(self.data_path, '*.csv'))

        if not csv_files:
            print("No CSV files found in data directory. Using synthetic data.")
            return None

        # Use the first CSV file found
        data_file = csv_files[0]
        print(f"Loading real UPI data from: {data_file}")

        try:
            df = pd.read_csv(data_file)
            print(f"Loaded {len(df)} transactions from UPI dataset")

            # Process UPI data format
            df = self.process_upi_data(df)

            self.use_real_data = True
            return df

        except Exception as e:
            print(f"Error loading UPI data: {e}")
            print("Falling back to synthetic data")
            return None
    
    def map_column_names(self, df):
        """Map various column names to our standard format"""
        column_mapping = {
            # Amount columns
            'transaction_amount': 'amount',
            'txn_amount': 'amount',
            'Amount': 'amount',
            'AMOUNT': 'amount',
            
            # Time columns
            'timestamp': 'transaction_time',
            'date': 'transaction_time',
            'transaction_date': 'transaction_time',
            'txn_date': 'transaction_time',
            'Time': 'transaction_time',
            'DATE': 'transaction_time',
            
            # Category columns
            'category': 'merchant_category',
            'merchant_type': 'merchant_category',
            'Category': 'merchant_category',
            'CATEGORY': 'merchant_category',
            'merchant': 'merchant_category',
            
            # Payment method columns
            'type': 'payment_method',
            'payment_type': 'payment_method',
            'txn_type': 'payment_method',
            'Type': 'payment_method',
            'TYPE': 'payment_method',
            
            # Age columns
            'age': 'customer_age',
            'Age': 'customer_age',
            'AGE': 'customer_age',
            'customer_age_group': 'customer_age',
            
            # Location columns
            'location': 'location',
            'state': 'location',
            'State': 'location',
            'STATE': 'location',
            'region': 'location',
            
            # Fraud columns
            'fraud': 'is_fraud',
            'Fraud': 'is_fraud',
            'FRAUD': 'is_fraud',
            'is_fraudulent': 'is_fraud',
            'fraudulent': 'is_fraud',
            'label': 'is_fraud',
            'target': 'is_fraud'
        }
        
        # Apply mapping
        df = df.rename(columns=column_mapping)
        return df
    
    def process_real_data(self, df):
        """Process real data to match our expected format"""
        processed_df = df.copy()
        
        # Ensure we have required columns, create missing ones with defaults
        required_columns = ['amount', 'merchant_category', 'payment_method', 'customer_age', 'is_fraud']
        
        for col in required_columns:
            if col not in processed_df.columns:
                if col == 'amount':
                    # If no amount column, create random amounts
                    processed_df['amount'] = np.random.lognormal(4, 1, len(processed_df))
                elif col == 'merchant_category':
                    processed_df['merchant_category'] = 'unknown'
                elif col == 'payment_method':
                    processed_df['payment_method'] = 'upi'
                elif col == 'customer_age':
                    processed_df['customer_age'] = np.random.randint(18, 65, len(processed_df))
                elif col == 'is_fraud':
                    # If no fraud label, assume all are normal (will need manual labeling)
                    processed_df['is_fraud'] = 0
        
        # Process time column to extract hour
        if 'transaction_time' in processed_df.columns:
            try:
                processed_df['transaction_time'] = pd.to_datetime(processed_df['transaction_time'])
                processed_df['hour'] = processed_df['transaction_time'].dt.hour
            except:
                # If time parsing fails, use random hours
                processed_df['hour'] = np.random.randint(0, 24, len(processed_df))
        else:
            processed_df['hour'] = np.random.randint(0, 24, len(processed_df))
        
        # Create transaction frequency (simplified - based on customer appearance)
        if 'customer_id' in processed_df.columns:
            freq_map = processed_df.groupby('customer_id').size().to_dict()
            processed_df['transaction_frequency'] = processed_df['customer_id'].map(freq_map)
        else:
            processed_df['transaction_frequency'] = np.random.poisson(5, len(processed_df)) + 1
        
        # Create location risk score based on location
        if 'location' in processed_df.columns:
            # Simple risk scoring based on location frequency (rare locations = higher risk)
            location_counts = processed_df['location'].value_counts()
            total_transactions = len(processed_df)
            location_risk = {loc: min(0.9, 1.0 - (count / total_transactions * 10)) 
                           for loc, count in location_counts.items()}
            processed_df['location_risk_score'] = processed_df['location'].map(location_risk).fillna(0.5)
        else:
            processed_df['location_risk_score'] = np.random.beta(3, 7, len(processed_df))
        
        # Convert categorical data to appropriate types
        categorical_cols = ['merchant_category', 'payment_method']
        for col in categorical_cols:
            if col in processed_df.columns:
                processed_df[col] = processed_df[col].astype(str).str.lower()
        
        # Handle missing values
        processed_df['amount'] = pd.to_numeric(processed_df['amount'], errors='coerce').fillna(processed_df['amount'].median())
        processed_df['customer_age'] = pd.to_numeric(processed_df['customer_age'], errors='coerce').fillna(processed_df['customer_age'].median())
        processed_df['is_fraud'] = pd.to_numeric(processed_df['is_fraud'], errors='coerce').fillna(0)
        
        print(f"Processed data shape: {processed_df.shape}")
        print(f"Fraud percentage: {processed_df['is_fraud'].mean()*100:.2f}%")
        print("Available columns:", list(processed_df.columns))
        
        return processed_df
    
    def encode_categorical_features(self, df, fit=True):
        """Encode categorical features"""
        categorical_features = ['merchant_category', 'payment_method']
        
        for feature in categorical_features:
            if fit and feature not in self.label_encoders:
                self.label_encoders[feature] = LabelEncoder()
                df[f'{feature}_encoded'] = self.label_encoders[feature].fit_transform(df[feature])
            else:
                # Handle unseen categories by using the most frequent category
                encoder = self.label_encoders[feature]
                known_categories = encoder.classes_
                df_copy = df[feature].copy()
                
                # Replace unknown categories with the first known category
                mask = ~df_copy.isin(known_categories)
                if mask.any():
                    df_copy[mask] = known_categories[0]
                
                df[f'{feature}_encoded'] = encoder.transform(df_copy)
        
        return df
    
    def prepare_features(self, df, fit=True):
        """Prepare features for model training/prediction"""
        # Encode categorical features
        df = self.encode_categorical_features(df, fit=fit)
        
        # Select feature columns
        X = df[self.feature_names].copy()
        
        # Scale features
        if fit:
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = self.scaler.transform(X)
        
        return X_scaled
    
    def train_model(self):
        """Train the fraud detection model"""
        # Try to load real data first
        df = self.load_real_data()
        
        if df is None:
            print("Generating synthetic training data...")
            df = self.generate_synthetic_data()
        else:
            print("Using real UPI transaction data for training...")
        
        print("Preparing features...")
        X = self.prepare_features(df, fit=True)
        y = df['is_fraud'].values
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        print("Training fraud detection model...")
        # Use Random Forest for better performance
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Model accuracy: {accuracy:.3f}")
        print(classification_report(y_test, y_pred, target_names=['Normal', 'Fraud']))
        
        # Store accuracy for later use
        self.model_accuracy = accuracy
        
        # Save model and preprocessors
        self.save_model()
        
        return accuracy
    
    def save_model(self):
        """Save trained model and preprocessors"""
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        joblib.dump(self.label_encoders, self.encoders_path)
        print("Model saved successfully!")
    
    def load_model(self):
        """Load trained model and preprocessors"""
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            self.label_encoders = joblib.load(self.encoders_path)
            print("Model loaded successfully!")
            return True
        return False
    
    def predict(self, transaction_data):
        """Predict fraud for a single transaction"""
        if self.model is None:
            if not self.load_model():
                self.train_model()
        
        # Convert to DataFrame
        df = pd.DataFrame([transaction_data])
        
        # Prepare features
        X = self.prepare_features(df, fit=False)
        
        # Make prediction
        fraud_probability = self.model.predict_proba(X)[0, 1]  # Probability of fraud
        is_fraud = fraud_probability > 0.5
        
        # Update stats
        self.total_predictions += 1
        if is_fraud:
            self.fraud_detected += 1
        
        # Determine risk level
        if fraud_probability < 0.3:
            risk_level = 'Low'
        elif fraud_probability < 0.7:
            risk_level = 'Medium'
        else:
            risk_level = 'High'
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(transaction_data, fraud_probability)
        
        return {
            'fraud_probability': round(float(fraud_probability), 3),
            'is_fraud': bool(is_fraud),
            'risk_level': risk_level,
            'risk_factors': risk_factors
        }
    
    def _identify_risk_factors(self, transaction_data, fraud_prob):
        """Identify factors contributing to fraud risk"""
        factors = []
        
        # Check amount
        if transaction_data['amount'] > 1000:
            factors.append("High transaction amount")
        elif transaction_data['amount'] < 1:
            factors.append("Unusually low transaction amount")
        
        # Check time
        if transaction_data['hour'] < 6 or transaction_data['hour'] > 22:
            factors.append("Transaction during unusual hours")
        
        # Check location risk
        if transaction_data['location_risk_score'] > 0.7:
            factors.append("High-risk location")
        
        # Check transaction frequency
        if transaction_data['transaction_frequency'] < 2:
            factors.append("Low transaction frequency for customer")
        
        # Check merchant category
        if transaction_data['merchant_category'] in ['unknown', 'atm']:
            factors.append("High-risk merchant category")
        
        return factors if factors else ["No specific risk factors identified"]
    
    def get_model_accuracy(self):
        """Get current model accuracy"""
        return self.model_accuracy
