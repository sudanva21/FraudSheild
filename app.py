from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash, send_from_directory
import pandas as pd
import numpy as np
from datetime import datetime
import os
from functools import wraps
from fraud_detector import FraudDetector
from supabase import create_client, Client
from dotenv import load_dotenv
import hashlib
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-change-in-production')

# Initialize Supabase client
try:
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if supabase_url and supabase_key:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("✅ Supabase connected successfully!")
    else:
        supabase = None
        print("⚠️ Supabase credentials not found. Using demo mode.")
except Exception as e:
    supabase = None
    print(f"⚠️ Supabase connection failed: {e}. Using demo mode.")

# Initialize fraud detector
fraud_detector = FraudDetector()

# In-memory storage for demo mode users
demo_users = {}

# Helper functions for user management
def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def get_user_by_email(email):
    """Get user by email from Supabase or demo mode"""
    if supabase:
        try:
            response = supabase.table('users').select('*').eq('email', email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None
    else:
        # Demo mode - check hardcoded user and in-memory storage
        if email == "admin@example.com":
            return {
                'id': 'demo-user-id',
                'email': 'admin@example.com',
                'password_hash': hash_password('password123'),
                'full_name': 'John Doe',
                'organization': 'FraudShield Demo',
                'phone': '+1 (555) 123-4567',
                'location': 'San Francisco, CA',
                'profile_picture': None,
                'created_at': '2023-01-01T00:00:00Z'
            }
        # Check in-memory demo users
        return demo_users.get(email, None)

def create_user(email, password, full_name, organization=None):
    """Create a new user in Supabase or demo mode"""
    if supabase:
        try:
            user_data = {
                'id': str(uuid.uuid4()),
                'email': email,
                'password_hash': hash_password(password),
                'full_name': full_name,
                'organization': organization,
                'created_at': datetime.now().isoformat()
            }
            response = supabase.table('users').insert(user_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error creating user: {e}")
            return None
    else:
        # Demo mode - simulate user creation and store in memory
        user_data = {
            'id': str(uuid.uuid4()),
            'email': email,
            'password_hash': hash_password(password),
            'full_name': full_name,
            'organization': organization,
            'created_at': datetime.now().isoformat()
        }
        # Store in in-memory demo users storage
        demo_users[email] = user_data
        return user_data

def update_user_profile(user_id, data):
    """Update user profile data"""
    if supabase:
        try:
            response = supabase.table('users').update(data).eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error updating user: {e}")
            return None
    else:
        # Demo mode - update in-memory storage
        for email, user_data in demo_users.items():
            if user_data['id'] == user_id:
                user_data.update(data)
                return user_data
        return None

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or not session['logged_in']:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/favicon.ico')
def favicon():
    """Serve the favicon"""
    return send_from_directory(app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def index():
    """Landing page with cyberpunk design matching Next.js app"""
    return render_template('landing.html')

@app.route('/demo')
def demo():
    """Interactive demo page"""
    return render_template('demo.html')

@app.route('/dashboard')
@login_required
def dashboard():
    """Dashboard page for authenticated users"""
    return render_template('dashboard.html')

@app.route('/auth/login', methods=['GET', 'POST'])
def login():
    """User login page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Get user from database
        user = get_user_by_email(email)
        
        if user and user['password_hash'] == hash_password(password):
            session['logged_in'] = True
            session['user_id'] = user['id']
            session['user_email'] = user['email']
            session['user_name'] = user['full_name']
            flash('Successfully logged in!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('login.html')

@app.route('/auth/logout')
def logout():
    """User logout"""
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/auth/register', methods=['GET', 'POST'])
def register():
    """User registration page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        full_name = request.form.get('fullName')
        organization = request.form.get('organization')
        
        # Check if user already exists
        if get_user_by_email(email):
            flash('Email already registered. Please use a different email.', 'error')
            return render_template('register.html')
        
        # Create new user
        user = create_user(email, password, full_name, organization)
        if user:
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('login'))
        else:
            flash('Failed to create account. Please try again.', 'error')
    
    return render_template('register.html')

@app.route('/profile')
@login_required
def profile():
    """User profile page"""
    user_id = session.get('user_id')
    user = None
    
    # Get user data from database
    if supabase and user_id:
        try:
            response = supabase.table('users').select('*').eq('id', user_id).execute()
            user = response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching user profile: {e}")
    
    # Fallback to demo data if no database user found
    if not user:
        user = {
            'full_name': session.get('user_name', 'Demo User'),
            'email': session.get('user_email', 'demo@example.com'),
            'organization': 'FraudShield Demo',
            'phone': '+1 (555) 123-4567',
            'location': 'San Francisco, CA',
            'profile_picture': None,
            'created_at': '2023-01-01T00:00:00Z'
        }
    
    return render_template('profile.html', user=user)

@app.route('/api/profile/update', methods=['POST'])
@login_required
def update_profile():
    """Update user profile"""
    user_id = session.get('user_id')
    
    data = {
        'full_name': request.form.get('full_name'),
        'phone': request.form.get('phone'),
        'location': request.form.get('location'),
        'organization': request.form.get('organization')
    }
    
    # Remove None values
    data = {k: v for k, v in data.items() if v is not None}
    
    if supabase and user_id:
        updated_user = update_user_profile(user_id, data)
        if updated_user:
            session['user_name'] = updated_user.get('full_name', session.get('user_name'))
            return jsonify({'success': True, 'message': 'Profile updated successfully!'})
        else:
            return jsonify({'success': False, 'message': 'Failed to update profile'}), 400
    else:
        # Demo mode - just update session
        session['user_name'] = data.get('full_name', session.get('user_name'))
        return jsonify({'success': True, 'message': 'Profile updated successfully (demo mode)!'})

@app.route('/api/profile/upload-avatar', methods=['POST'])
@login_required
def upload_avatar():
    """Upload profile picture"""
    user_id = session.get('user_id')
    
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No file selected'}), 400
    
    # Check file type
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in allowed_extensions):
        return jsonify({'success': False, 'message': 'Invalid file type. Please upload an image.'}), 400
    
    try:
        # For now, we'll just simulate upload success
        # In production, you'd upload to Supabase Storage or another service
        profile_picture_url = f"https://example.com/uploads/{user_id}/{file.filename}"
        
        if supabase and user_id:
            update_user_profile(user_id, {'profile_picture': profile_picture_url})
        
        return jsonify({
            'success': True, 
            'message': 'Profile picture uploaded successfully!',
            'profile_picture_url': profile_picture_url
        })
    
    except Exception as e:
        return jsonify({'success': False, 'message': f'Upload failed: {str(e)}'}), 500

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

@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': fraud_detector.model is not None,
        'supabase_connected': supabase is not None
    })

if __name__ == '__main__':
    print("Starting FraudShield application...")
    
    # Ensure model is trained on startup
    print("Training fraud detection model...")
    fraud_detector.train_model()
    
    # Get port from environment variable (for deployment platforms like Render)
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    print(f"Starting Flask server on port {port}")
    # Run the application
    app.run(debug=debug, host='0.0.0.0', port=port)
