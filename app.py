from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime
import os
from fraud_detector import FraudDetector

app = Flask(__name__)

# Initialize fraud detector
fraud_detector = FraudDetector()

@app.route('/')
def index():
    """Landing page with cyberpunk design matching Next.js app"""
    return render_template('landing.html')

@app.route('/demo')
def demo():
    """Interactive demo page"""
    return render_template('demo.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard page for authenticated users"""
    return render_template('dashboard.html')

@app.route('/auth/login')
def login():
    """User login page"""
    return render_template('login.html')

@app.route('/auth/register')  
def register():
    """User registration page"""
    return render_template('register.html')

@app.route('/predict', methods=['POST'])
def predict_fraud():
    """Analyze transaction and predict fraud probability"""
    try:
        # Get transaction data from form
        data = request.get_json()
        
        # Extract transaction features
        transaction_data = {
            'amount': float(data.get('amount', 0)),
            'hour': int(data.get('hour', 0)),
            'merchant_category': data.get('merchant_category', 'unknown'),
            'payment_method': data.get('payment_method', 'card'),
            'customer_age': int(data.get('customer_age', 25)),
            'transaction_frequency': int(data.get('transaction_frequency', 1)),
            'location_risk_score': float(data.get('location_risk_score', 0.5))
        }
        
        # Make prediction
        result = fraud_detector.predict(transaction_data)
        
        return jsonify({
            'success': True,
            'fraud_probability': result['fraud_probability'],
            'is_fraud': result['is_fraud'],
            'risk_level': result['risk_level'],
            'risk_factors': result['risk_factors'],
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/stats')
def get_stats():
    """Get system statistics"""
    return jsonify({
        'total_predictions': fraud_detector.total_predictions,
        'fraud_detected': fraud_detector.fraud_detected,
        'model_accuracy': fraud_detector.get_model_accuracy()
    })

if __name__ == '__main__':
    print("Starting FraudShield application...")
    
    # Ensure model is trained on startup
    print("Training fraud detection model...")
    fraud_detector.train_model()
    
    print("Starting Flask server on http://localhost:5000")
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)
