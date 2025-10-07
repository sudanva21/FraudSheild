# FraudShield - AI-Powered Fraud Detection System

An intelligent fraud detection system for digital payments built with Python, Flask, and machine learning. The system uses advanced algorithms to analyze transaction patterns and identify potentially fraudulent activities in real-time.

**Developed by [sudanva](https://github.com/sudanva)**

![FraudShield Interface](screenshot.png)

## Features

- **Real-time Fraud Detection**: Instant analysis of transaction data
- **Machine Learning Powered**: Uses Random Forest classifier for accurate predictions
- **Real Dataset Support**: Train with actual UPI transaction data from Kaggle
- **Automatic Data Processing**: Handles various CSV formats and column names
- **Modern UI/UX**: Cyberpunk-themed interface with 3D effects and animations
- **User Authentication**: Complete registration, login, and profile management system
- **Database Integration**: Supabase support for user management and data persistence
- **Risk Assessment**: Detailed risk level classification (Low, Medium, High)
- **Risk Factor Analysis**: Identifies specific factors contributing to fraud risk
- **Statistics Dashboard**: Real-time system performance metrics
- **Dataset Management**: Built-in tools for downloading and preparing datasets
- **Responsive Design**: Works seamlessly across devices
- **Demo Mode**: Interactive demo for users without registration
- **Session Management**: Secure user sessions with proper authentication

## Technology Stack

- **Backend**: Python, Flask, Supabase
- **Machine Learning**: scikit-learn, pandas, numpy
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Tailwind CSS
- **Database**: Supabase (PostgreSQL-based)
- **Authentication**: Session-based with password hashing
- **Model Storage**: joblib for serialization
- **UI Framework**: Tailwind CSS with custom 3D animations
- **Icons**: Lucide React icons

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fraudsheild
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (optional for Supabase):
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase credentials
   ```

5. **Run the application**:
   ```bash
   python app.py
   ```

6. **Access the application**:
   Open your browser and navigate to `http://localhost:5000`

## Using Real UPI Dataset

FraudShield now supports training with real UPI transaction datasets from Kaggle!

### Option 1: Automatic Dataset Download (Recommended)

1. **Set up Kaggle API** (one-time setup):
   ```bash
   # Install Kaggle CLI (already included in requirements.txt)
   pip install kaggle
   
   # Get your API key from https://www.kaggle.com/account
   # Download kaggle.json and place it in:
   # Windows: C:\Users\<username>\.kaggle\kaggle.json
   # Linux/Mac: ~/.kaggle/kaggle.json
   ```

2. **Search and download datasets**:
   ```bash
   # Search for UPI/fraud datasets
   python download_dataset.py search
   
   # View recommended datasets
   python download_dataset.py recommend
   
   # Download a specific dataset
   python download_dataset.py download rupakroy/online-payments-fraud-detection-dataset
   ```

### Option 2: Manual Dataset Upload

1. **Download UPI dataset** from Kaggle manually
2. **Place CSV file** in the `data/` directory
3. **Analyze the dataset**:
   ```bash
   python prepare_dataset.py data/your_dataset.csv analyze
   ```
4. **Prepare the dataset**:
   ```bash
   python prepare_dataset.py data/your_dataset.csv prepare
   ```

### Option 3: Use Synthetic Data (Default)

If no real dataset is found, the system automatically generates synthetic training data.

### Supported Dataset Formats

The system automatically handles various column names and formats:

- **Amount**: `amount`, `transaction_amount`, `txn_amount`, `Amount`, `AMOUNT`
- **Time**: `timestamp`, `date`, `transaction_date`, `Time`, `DATE`
- **Category**: `category`, `merchant_category`, `Category`, `merchant_type`
- **Payment Method**: `type`, `payment_type`, `txn_type`, `Type`
- **Age**: `age`, `customer_age`, `Age`, `customer_age_group`
- **Location**: `location`, `state`, `State`, `region`
- **Fraud Label**: `fraud`, `is_fraud`, `Fraud`, `fraudulent`, `label`, `target`

## Usage

### User Authentication

1. **Registration**: New users can create an account with email and password
2. **Login**: Existing users can log in to access the full dashboard
3. **Demo Mode**: Users can try the system without registration via the demo page

### Analyzing a Transaction

1. **Access the Dashboard**: 
   - Logged-in users: Navigate to `/dashboard`
   - Demo users: Use `/demo` for quick access

2. **Enter Transaction Details**:
   - **Amount**: Transaction value in USD
   - **Hour**: Time of transaction (0-23)
   - **Merchant Category**: Type of merchant (grocery, gas, restaurant, etc.)
   - **Payment Method**: Card, mobile, or online payment
   - **Customer Age**: Age of the customer
   - **Transaction Frequency**: Monthly transaction count for the customer
   - **Location Risk Score**: Geographic risk assessment (0-1, where 1 is highest risk)

3. **Click "Analyze Transaction"**: The system will process the data and provide results

4. **Review Results**:
   - **Fraud Status**: Clear indication of fraud detection
   - **Risk Level**: Low, Medium, or High risk classification
   - **Fraud Probability**: Percentage likelihood of fraud
   - **Risk Factors**: Specific elements contributing to the assessment
   - **Analysis History**: Previous analyses are saved locally

## Machine Learning Model

The system uses a **Random Forest Classifier** with the following characteristics:

- **Training Data**: 10,000 synthetic transactions (80% normal, 20% fraudulent)
- **Features**: 7 key transaction attributes
- **Accuracy**: ~89% on test data
- **Balanced Training**: Uses class weighting to handle imbalanced data

### Feature Engineering

The model considers these key factors:
- Transaction amount patterns
- Time-based anomalies
- Merchant risk profiles
- Customer behavior patterns
- Geographic risk indicators
- Payment method risks

## API Endpoints

### `POST /predict`
Analyze a transaction for fraud

**Request Body**:
```json
{
  "amount": 150.00,
  "hour": 14,
  "merchant_category": "grocery",
  "payment_method": "card",
  "customer_age": 35,
  "transaction_frequency": 5,
  "location_risk_score": 0.2
}
```

**Response**:
```json
{
  "success": true,
  "fraud_probability": 0.234,
  "is_fraud": false,
  "risk_level": "Low",
  "risk_factors": ["No specific risk factors identified"],
  "timestamp": "2024-01-15T10:30:00"
}
```

### `GET /stats`
Get system statistics

**Response**:
```json
{
  "total_predictions": 156,
  "fraud_detected": 23,
  "model_accuracy": 0.89
}
```

## Model Training

The system automatically trains the model on startup using synthetic data. The model considers various fraud patterns:

- **High-value transactions** at unusual hours
- **Multiple small transactions** in quick succession
- **Transactions from high-risk locations**
- **Unusual merchant categories** for the customer
- **Low-frequency customers** making large purchases

## File Structure

```
fraudsheild/
├── app.py                 # Flask application with authentication
├── fraud_detector.py      # ML model and prediction logic
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── download_dataset.py    # Dataset download utility
├── prepare_dataset.py     # Dataset preparation utility
├── .env.example          # Environment variables template
├── *.joblib              # Trained ML models and encoders
├── templates/            # Flask HTML templates
│   ├── landing.html      # Landing page with 3D effects
│   ├── demo.html         # Demo page for unregistered users
│   ├── dashboard.html    # Protected dashboard page
│   ├── login.html        # User login page
│   ├── register.html     # User registration page
│   └── profile.html      # User profile management
├── static/               # Static assets
│   ├── css/
│   │   └── styles.css    # Custom CSS with 3D animations
│   └── js/
│       └── script.js     # Enhanced JavaScript functionality
├── data/                 # Dataset storage
└── venv/                # Python virtual environment
```

## Security Considerations

- **Input Validation**: All transaction data is validated before processing
- **Model Security**: Trained model is stored securely using joblib
- **Error Handling**: Comprehensive error handling prevents system crashes
- **Rate Limiting**: Consider implementing rate limiting for production use

## Recent Updates

### Authentication System (v2.0)
- Complete user registration and login system
- Supabase integration for user management
- Session-based authentication with secure password hashing
- User profile management with avatar upload functionality

### Enhanced UI/UX (v2.1)
- Cyberpunk-themed design with 3D visual effects
- Animated background patterns and card hover effects
- Responsive navigation that adapts to user authentication state
- Demo mode hidden from logged-in users for cleaner experience
- Enhanced 3D card animations with glow effects

### Smart Navigation & Enhanced 3D Effects (v2.2)
- Context-aware navigation (demo options hidden when logged in)
- Improved user flow between landing, demo, and dashboard pages
- Better visual feedback for authenticated vs. guest users
- Enhanced 3D background patterns with proper visibility and layering
- Improved card hover effects with depth and glow animations
- Fixed background pattern visibility issues on all pages

## Future Enhancements

- **Advanced Analytics**: Dashboard with fraud trends and patterns
- **Real-time Learning**: Update model with new fraud patterns
- **API Authentication**: JWT-based API security for production use
- **Batch Processing**: Handle multiple transactions simultaneously
- **Mobile App**: Native mobile application for on-the-go analysis
- **Advanced Reporting**: Export fraud analysis reports
- **Team Management**: Multi-user organization support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation for common problems

---

**⚠️ Disclaimer**: This system is for educational and demonstration purposes. For production fraud detection, implement additional security measures, use real transaction data for training, and consider regulatory compliance requirements.
