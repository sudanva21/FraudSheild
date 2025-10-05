#!/usr/bin/env python3
"""
Kaggle Dataset Downloader for FraudShield
==========================================

This script downloads UPI transaction datasets from Kaggle for fraud detection.
"""

import os
import subprocess
import sys
import json

def check_kaggle_setup():
    """Check if Kaggle API is properly set up"""
    try:
        # Check if kaggle command exists
        result = subprocess.run(['kaggle', '--version'], 
                              capture_output=True, text=True, check=True)
        print(f"Kaggle API found: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Kaggle API not found or not properly configured")
        print("\nTo set up Kaggle API:")
        print("1. Install: pip install kaggle")
        print("2. Get API key from https://www.kaggle.com/account")
        print("3. Place kaggle.json in ~/.kaggle/ (Linux/Mac) or C:\\Users\\{username}\\.kaggle\\ (Windows)")
        print("4. Set permissions: chmod 600 ~/.kaggle/kaggle.json")
        return False

def search_upi_datasets():
    """Search for UPI-related datasets on Kaggle"""
    try:
        print("Searching for UPI transaction datasets...")
        result = subprocess.run([
            'kaggle', 'datasets', 'list', 
            '--search', 'upi transactions fraud',
            '--sort-by', 'votes'
        ], capture_output=True, text=True, check=True)
        
        print("\nAvailable UPI/Fraud datasets:")
        print("=" * 60)
        print(result.stdout)
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error searching datasets: {e.stderr}")
        return False

def download_dataset(dataset_name, output_dir='data'):
    """Download a specific dataset from Kaggle"""
    try:
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"Downloading dataset: {dataset_name}")
        print(f"Output directory: {output_dir}")
        
        result = subprocess.run([
            'kaggle', 'datasets', 'download', dataset_name,
            '--path', output_dir, '--unzip'
        ], capture_output=True, text=True, check=True)
        
        print("✅ Dataset downloaded successfully!")
        print(result.stdout)
        
        # List downloaded files
        print(f"\nDownloaded files in {output_dir}:")
        for file in os.listdir(output_dir):
            if file.endswith('.csv'):
                file_path = os.path.join(output_dir, file)
                size_mb = os.path.getsize(file_path) / (1024 * 1024)
                print(f"  📄 {file} ({size_mb:.1f} MB)")
        
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error downloading dataset: {e.stderr}")
        return False

def recommend_datasets():
    """Recommend popular UPI/fraud detection datasets"""
    recommendations = [
        {
            'name': 'pocketecommerce/creditcardfraud',
            'description': 'Credit Card Fraud Detection Dataset',
            'size': '150MB',
            'features': 'Time, Amount, V1-V28 (anonymized), Class (fraud indicator)'
        },
        {
            'name': 'kartik2112/fraud-detection',
            'description': 'Fraud Detection Dataset',
            'size': '470MB', 
            'features': 'Transaction details, merchant info, fraud labels'
        },
        {
            'name': 'rupakroy/online-payments-fraud-detection-dataset',
            'description': 'Online Payments Fraud Detection',
            'size': '45MB',
            'features': 'Step, type, amount, nameOrig, oldbalanceOrg, newbalanceOrig, etc.'
        }
    ]
    
    print("\nRecommended Fraud Detection Datasets:")
    print("=" * 60)
    
    for i, dataset in enumerate(recommendations, 1):
        print(f"{i}. {dataset['name']}")
        print(f"   Description: {dataset['description']}")
        print(f"   Size: {dataset['size']}")
        print(f"   Features: {dataset['features']}")
        print()

def main():
    """Main function"""
    print("FraudShield Kaggle Dataset Downloader")
    print("====================================")
    
    # Check if Kaggle is set up
    if not check_kaggle_setup():
        return
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python download_dataset.py <command> [dataset_name]")
        print("\nCommands:")
        print("  search     - Search for UPI/fraud datasets")
        print("  download   - Download a specific dataset")
        print("  recommend  - Show recommended datasets")
        print("\nExamples:")
        print("  python download_dataset.py search")
        print("  python download_dataset.py recommend")
        print("  python download_dataset.py download rupakroy/online-payments-fraud-detection-dataset")
        return
    
    command = sys.argv[1].lower()
    
    if command == 'search':
        search_upi_datasets()
        
    elif command == 'recommend':
        recommend_datasets()
        
    elif command == 'download':
        if len(sys.argv) < 3:
            print("Please specify a dataset name to download")
            print("Example: python download_dataset.py download rupakroy/online-payments-fraud-detection-dataset")
            return
            
        dataset_name = sys.argv[2]
        if download_dataset(dataset_name):
            print(f"\n✅ Next steps:")
            print("1. Run: python prepare_dataset.py data/<csv_file> analyze")
            print("2. Run: python app.py")
            print("3. Open: http://localhost:5000")
        
    else:
        print(f"Unknown command: {command}")
        print("Available commands: search, download, recommend")

if __name__ == "__main__":
    main()