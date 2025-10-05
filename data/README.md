# Dataset Instructions

## UPI Transactions 2025 Dataset

Please download the UPI Transactions dataset from Kaggle and place the CSV file in this directory.

### Expected Dataset Structure

The system expects a CSV file with columns that may include:
- **amount** or **transaction_amount**: Transaction amount
- **timestamp** or **date** or **transaction_date**: Transaction timestamp
- **merchant_category** or **category**: Merchant category
- **payment_method** or **type**: Payment method (UPI, card, etc.)
- **customer_age** or **age**: Customer age
- **location** or **state**: Transaction location
- **is_fraud** or **fraud**: Target variable (0 for normal, 1 for fraud)

### Steps to Use Your Dataset:

1. Download the UPI dataset CSV from Kaggle
2. Place it in this `data/` directory
3. Rename it to `upi_transactions.csv` or update the path in `fraud_detector.py`
4. Run the application - it will automatically detect and use your real data

The system will automatically map common column names and adapt to your dataset structure.
