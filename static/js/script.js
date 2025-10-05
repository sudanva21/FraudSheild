// DOM elements
const form = document.getElementById('fraud-detection-form');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const resultsSection = document.getElementById('results-section');
const resultCard = document.getElementById('result-card');
const notification = document.getElementById('notification');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    setupEventListeners();
    setDefaultValues();
});

function setupEventListeners() {
    form.addEventListener('submit', handleFormSubmit);
    clearBtn.addEventListener('click', clearForm);
}

function setDefaultValues() {
    // Set default values for better UX
    const currentHour = new Date().getHours();
    document.getElementById('hour').value = currentHour;
    document.getElementById('customer_age').value = 35;
    document.getElementById('transaction_frequency').value = 5;
    document.getElementById('location_risk_score').value = 0.2;
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(form);
    const transactionData = {
        amount: parseFloat(formData.get('amount')),
        hour: parseInt(formData.get('hour')),
        merchant_category: formData.get('merchant_category'),
        payment_method: formData.get('payment_method'),
        customer_age: parseInt(formData.get('customer_age')),
        transaction_frequency: parseInt(formData.get('transaction_frequency')),
        location_risk_score: parseFloat(formData.get('location_risk_score'))
    };
    
    // Validate data
    if (!validateTransactionData(transactionData)) {
        return;
    }
    
    setLoadingState(true);
    
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transactionData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result);
            loadStats(); // Refresh stats
        } else {
            showNotification('Error: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Failed to analyze transaction. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
}

function validateTransactionData(data) {
    if (data.amount <= 0) {
        showNotification('Please enter a valid transaction amount.', 'error');
        return false;
    }
    
    if (data.hour < 0 || data.hour > 23) {
        showNotification('Please enter a valid hour (0-23).', 'error');
        return false;
    }
    
    if (data.customer_age < 18 || data.customer_age > 100) {
        showNotification('Please enter a valid customer age (18-100).', 'error');
        return false;
    }
    
    if (data.location_risk_score < 0 || data.location_risk_score > 1) {
        showNotification('Please enter a valid location risk score (0-1).', 'error');
        return false;
    }
    
    return true;
}

function displayResults(result) {
    // Update fraud indicator
    const indicatorIcon = document.getElementById('indicator-icon');
    const indicatorText = document.getElementById('indicator-text');
    const riskLevel = document.getElementById('risk-level');
    
    if (result.is_fraud) {
        indicatorIcon.textContent = '🚨';
        indicatorText.textContent = 'FRAUD DETECTED';
        indicatorText.style.color = '#dc2626';
        resultCard.className = 'result-card fraud';
    } else {
        indicatorIcon.textContent = '✅';
        indicatorText.textContent = 'TRANSACTION SAFE';
        indicatorText.style.color = '#059669';
        resultCard.className = 'result-card safe';
    }
    
    // Update risk level
    riskLevel.textContent = result.risk_level + ' Risk';
    riskLevel.className = 'risk-level ' + result.risk_level.toLowerCase();
    
    // Update probability bar
    const probabilityFill = document.getElementById('probability-fill');
    const probabilityValue = document.getElementById('probability-value');
    const percentage = Math.round(result.fraud_probability * 100);
    
    probabilityFill.style.width = percentage + '%';
    probabilityValue.textContent = percentage + '%';
    
    // Update risk factors
    const riskFactorsList = document.getElementById('risk-factors-list');
    riskFactorsList.innerHTML = '';
    
    result.factors.forEach(factor => {
        const li = document.createElement('li');
        li.textContent = factor;
        riskFactorsList.appendChild(li);
    });
    
    // Update timestamp
    const timestamp = new Date(result.timestamp);
    document.getElementById('timestamp').textContent = 
        `Analysis completed at ${timestamp.toLocaleString()}`;
    
    // Show results section with animation
    resultsSection.style.display = 'block';
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    // Show success notification
    const statusText = result.is_fraud ? 'Fraud detected!' : 'Transaction appears safe';
    showNotification(statusText, result.is_fraud ? 'error' : 'success');
}

async function loadStats() {
    try {
        const response = await fetch('/stats');
        const stats = await response.json();
        
        // Update stats with animation
        animateStatUpdate('total-predictions', stats.total_predictions);
        animateStatUpdate('fraud-detected', stats.fraud_detected);
        document.getElementById('model-accuracy').textContent = 
            Math.round(stats.model_accuracy * 100) + '%';
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function animateStatUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;
    
    if (newValue === currentValue) return;
    
    const duration = 500;
    const startTime = performance.now();
    const difference = newValue - currentValue;
    
    function updateStat(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const value = Math.round(currentValue + (difference * progress));
        element.textContent = value;
        
        if (progress < 1) {
            requestAnimationFrame(updateStat);
        }
    }
    
    requestAnimationFrame(updateStat);
}

function setLoadingState(isLoading) {
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        analyzeBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

function clearForm() {
    form.reset();
    setDefaultValues();
    resultsSection.style.display = 'none';
    showNotification('Form cleared successfully', 'success');
}

function showNotification(message, type = 'error') {
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.className = 'notification ' + (type === 'success' ? 'success' : '');
    notification.style.display = 'block';
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 4000);
}

// Format currency inputs
document.getElementById('amount').addEventListener('input', function(e) {
    let value = e.target.value;
    if (value && !isNaN(value)) {
        const formatted = parseFloat(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        // Don't update if user is still typing decimals
        if (!value.endsWith('.') && !value.includes('.')) {
            // Store raw value but don't change display while typing
        }
    }
});

// Auto-select current time
document.getElementById('hour').addEventListener('focus', function() {
    if (!this.value) {
        this.value = new Date().getHours();
    }
});

// Real-time validation feedback
const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        validateField(this);
    });
});

function validateField(field) {
    const value = field.value;
    let isValid = true;
    let message = '';
    
    switch(field.id) {
        case 'amount':
            isValid = value > 0;
            message = 'Amount must be greater than 0';
            break;
        case 'hour':
            isValid = value >= 0 && value <= 23;
            message = 'Hour must be between 0 and 23';
            break;
        case 'customer_age':
            isValid = value >= 18 && value <= 100;
            message = 'Age must be between 18 and 100';
            break;
        case 'location_risk_score':
            isValid = value >= 0 && value <= 1;
            message = 'Risk score must be between 0 and 1';
            break;
    }
    
    if (!isValid && value) {
        field.style.borderColor = '#ef4444';
        if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
            const errorDiv = document.createElement('small');
            errorDiv.classList.add('error-message');
            errorDiv.style.color = '#ef4444';
            errorDiv.textContent = message;
            field.parentNode.insertBefore(errorDiv, field.nextSibling);
        }
    } else {
        field.style.borderColor = '#e5e7eb';
        const errorMsg = field.nextElementSibling;
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.remove();
        }
    }
}