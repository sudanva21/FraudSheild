#!/usr/bin/env python3
"""
Dataset Preparation Script for FraudShield
==========================================

This script helps prepare UPI transaction datasets for use with the fraud detection system.
"""

import pandas as pd
import numpy as np
import os
import sys

def analyze_dataset(file_path):
    """Analyze the structure of a dataset"""
    print(f"\nAnalyzing dataset: {file_path}")
    print("=" * 50)
    
    try:
        # Load the dataset
        df = pd.read_csv(file_path)
        
        print(f"Dataset shape: {df.shape}")
        print(f"Total transactions: {len(df):,}")
        
        print("\nColumn Information:")
        print("-" * 30)
        for i, col in enumerate(df.columns, 1):
            dtype = df[col].dtype
            null_count = df[col].isnull().sum()
            null_pct = (null_count / len(df)) * 100
            unique_count = df[col].nunique()
            
            print(f"{i:2}. {col:<25} | {str(dtype):<10} | {null_count:>6} nulls ({null_pct:5.1f}%) | {unique_count:>8} unique")
        
        print("\nSample Data:")
        print("-" * 30)
        print(df.head())
        
        # Check for potential fraud columns
        potential_fraud_cols = [col for col in df.columns 
                              if any(keyword in col.lower() for keyword in 
                                   ['fraud', 'label', 'target', 'class', 'is_fraud'])]
        
        if potential_fraud_cols:
            print(f"\nPotential fraud indicator columns: {potential_fraud_cols}")
            for col in potential_fraud_cols:
                print(f"{col} distribution:")
                print(df[col].value_counts())
        
        # Check for amount columns
        amount_cols = [col for col in df.columns 
                      if any(keyword in col.lower() for keyword in 
                           ['amount', 'value', 'sum', 'total', 'price'])]
        
        if amount_cols:
            print(f"\nPotential amount columns: {amount_cols}")
            for col in amount_cols:
                if df[col].dtype in ['int64', 'float64']:
                    print(f"{col} statistics:")
                    print(f"  Min: {df[col].min():,.2f}")
                    print(f"  Max: {df[col].max():,.2f}")
                    print(f"  Mean: {df[col].mean():,.2f}")
                    print(f"  Median: {df[col].median():,.2f}")
        
        return True
        
    except Exception as e:
        print(f"Error analyzing dataset: {e}")
        return False

def prepare_upi_dataset(input_file, output_file=None):
    """Prepare UPI dataset for fraud detection"""
    
    if output_file is None:
        output_file = os.path.join('data', 'upi_transactions_prepared.csv')
    
    print(f"\nPreparing dataset: {input_file}")
    print(f"Output file: {output_file}")
    print("=" * 50)
    
    try:
        # Load the dataset
        df = pd.read_csv(input_file)
        print(f"Loaded {len(df):,} transactions")
        
        # Basic data cleaning
        print("Performing basic data cleaning...")
        
        # Remove completely empty rows
        df = df.dropna(how='all')
        
        # If dataset is very large, sample it for faster processing
        if len(df) > 100000:
            print(f"Dataset is large ({len(df):,} rows). Sampling 100,000 rows...")
            df = df.sample(n=100000, random_state=42).reset_index(drop=True)
        
        print(f"Final dataset size: {len(df):,} transactions")
        
        # Save prepared dataset
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        df.to_csv(output_file, index=False)
        
        print(f"\nPrepared dataset saved to: {output_file}")
        print("You can now run the fraud detection system!")
        
        return True
        
    except Exception as e:
        print(f"Error preparing dataset: {e}")
        return False

def main():
    """Main function"""
    print("FraudShield Dataset Preparation Tool")
    print("====================================")
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python prepare_dataset.py <csv_file> [command]")
        print("\nCommands:")
        print("  analyze  - Analyze the dataset structure")
        print("  prepare  - Prepare the dataset for fraud detection")
        print("\nExamples:")
        print("  python prepare_dataset.py data/upi_data.csv analyze")
        print("  python prepare_dataset.py data/upi_data.csv prepare")
        print("  python prepare_dataset.py data/upi_data.csv")
        return
    
    file_path = sys.argv[1]
    command = sys.argv[2] if len(sys.argv) > 2 else 'prepare'
    
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found!")
        return
    
    if command.lower() == 'analyze':
        analyze_dataset(file_path)
    elif command.lower() == 'prepare':
        analyze_dataset(file_path)
        prepare_upi_dataset(file_path)
    else:
        print(f"Unknown command: {command}")
        print("Available commands: analyze, prepare")

if __name__ == "__main__":
    main()