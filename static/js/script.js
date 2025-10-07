// Global variables
let isAnalyzing = false;

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setDefaultValues();
    setupEventListeners();
    
    // Initialize Lucide icons if not already done
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function setDefaultValues() {
    const currentHour = new Date().getHours();
    document.getElementById('hour').value = currentHour;
}

function setupEventListeners() {
    // Form validation on input
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', validateField);
        input.addEventListener('blur', validateField);
    });
}

function validateField(event) {
    const field = event.target;
    const value = field.value;
    let isValid = true;
    
    // Remove existing error styles
    field.classList.remove('border-red-400', 'border-primary-400');
    
    if (!value) return;
    
    switch(field.id) {
        case 'amount':
            isValid = value > 0 && value <= 100000;
            break;
        case 'hour':
            isValid = value >= 0 && value <= 23;
            break;
        case 'customer_age':
            isValid = value >= 18 && value <= 100;
            break;
        case 'location_risk_score':
            isValid = value >= 0 && value <= 1;
            break;
        case 'transaction_frequency':
            isValid = value >= 1 && value <= 100;
            break;
    }
    
    // Apply validation styles
    if (isValid) {
        field.classList.add('border-primary-400');
    } else {
        field.classList.add('border-red-400');
    }
}

// Main analysis function
async function analyzeTransaction() {
    if (isAnalyzing) return;
    
    // Get form data
    const transactionData = {
        amount: parseFloat(document.getElementById('amount').value),
        hour: parseInt(document.getElementById('hour').value),
        merchant_category: document.getElementById('merchant_category').value,
        payment_method: document.getElementById('payment_method').value,
        customer_age: parseInt(document.getElementById('customer_age').value),
        transaction_frequency: parseInt(document.getElementById('transaction_frequency').value),
        location_risk_score: parseFloat(document.getElementById('location_risk_score').value)
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            displayResults(result, transactionData);
            // Add to history if the function is available
            if (typeof window.addToHistory === 'function') {
                window.addToHistory(result, transactionData);
            }
            showNotification('Analysis completed successfully!', 'success');
        } else {
            throw new Error(result.error || 'Analysis failed');
        }
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Fallback to local simulation
        const simulatedResult = simulateFraudDetection(transactionData);
        displayResults(simulatedResult, transactionData);
        // Add to history if the function is available
        if (typeof window.addToHistory === 'function') {
            window.addToHistory(simulatedResult, transactionData);
        }
        showNotification('Demo analysis completed (offline mode)', 'info');
    } finally {
        setLoadingState(false);
    }
}

function validateTransactionData(data) {
    if (!data.amount || data.amount <= 0 || data.amount > 100000) {
        showNotification('Please enter a valid transaction amount ($0.01 - $100,000)', 'error');
        return false;
    }
    
    if (data.hour < 0 || data.hour > 23) {
        showNotification('Please enter a valid hour (0-23)', 'error');
        return false;
    }
    
    if (!data.customer_age || data.customer_age < 18 || data.customer_age > 100) {
        showNotification('Please enter a valid customer age (18-100)', 'error');
        return false;
    }
    
    if (data.location_risk_score < 0 || data.location_risk_score > 1) {
        showNotification('Please enter a valid location risk score (0-1)', 'error');
        return false;
    }
    
    if (!data.transaction_frequency || data.transaction_frequency < 1 || data.transaction_frequency > 100) {
        showNotification('Please enter a valid transaction frequency (1-100)', 'error');
        return false;
    }
    
    return true;
}

function simulateFraudDetection(data) {
    // Simple fraud detection simulation
    let riskScore = 0;
    const factors = [];

    // Amount analysis
    if (data.amount > 1000) {
        riskScore += 0.3;
        factors.push('High transaction amount');
    } else if (data.amount < 5) {
        riskScore += 0.2;
        factors.push('Unusually low amount');
    }

    // Time analysis
    if (data.hour < 6 || data.hour > 22) {
        riskScore += 0.25;
        factors.push('Transaction during unusual hours');
    }

    // Location risk
    riskScore += data.location_risk_score * 0.4;
    if (data.location_risk_score > 0.7) {
        factors.push('High-risk location');
    }

    // Merchant category analysis
    if (['online', 'unknown'].includes(data.merchant_category)) {
        riskScore += 0.1;
        factors.push('Online/unknown merchant category');
    }

    // Frequency analysis
    if (data.transaction_frequency > 20) {
        riskScore += 0.2;
        factors.push('High transaction frequency');
    } else if (data.transaction_frequency < 2) {
        riskScore += 0.15;
        factors.push('Unusually low transaction frequency');
    }

    // Age analysis
    if (data.customer_age < 21 || data.customer_age > 70) {
        riskScore += 0.1;
        factors.push('Customer age outside typical range');
    }

    // Cap the risk score
    riskScore = Math.min(riskScore, 1);
    
    // Add some randomness for demo
    riskScore += (Math.random() - 0.5) * 0.2;
    riskScore = Math.max(0, Math.min(1, riskScore));

    const fraudProbability = riskScore;
    const isFraud = fraudProbability > 0.7;
    
    let riskLevel;
    if (fraudProbability < 0.3) riskLevel = 'low';
    else if (fraudProbability < 0.7) riskLevel = 'medium';
    else riskLevel = 'high';

    if (factors.length === 0) {
        factors.push('Standard transaction patterns');
    }

    return {
        success: true,
        fraud_probability: fraudProbability,
        is_fraud: isFraud,
        risk_level: riskLevel,
        risk_factors: factors,
        timestamp: new Date().toISOString(),
    };
}

function displayResults(result, transactionData) {
    const resultsSection = document.getElementById('results-section');
    
    // Determine colors and icons based on risk level
    const riskConfig = getRiskConfig(result.risk_level, result.is_fraud);
    const percentage = Math.round(result.fraud_probability * 100);
    
    // Create results HTML
    const resultsHTML = `
        <div class="space-y-6">
            <!-- Status -->
            <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-4 ${riskConfig.bgColor} rounded-full flex items-center justify-center">
                    <i data-lucide="${riskConfig.icon}" class="h-8 w-8 ${riskConfig.textColor}"></i>
                </div>
                <h3 class="text-lg font-semibold ${riskConfig.textColor} mb-2">
                    ${riskConfig.title}
                </h3>
                <p class="text-sm text-gray-400">${riskConfig.subtitle}</p>
            </div>

            <!-- Risk Score -->
            <div class="text-center">
                <div class="text-3xl font-bold ${riskConfig.textColor} mb-2">
                    ${percentage}%
                </div>
                <div class="w-full bg-dark-700 rounded-full h-3 mb-2">
                    <div class="${riskConfig.barColor} h-3 rounded-full transition-all duration-500" 
                         style="width: ${percentage}%"></div>
                </div>
                <p class="text-xs text-gray-400">Fraud Probability</p>
            </div>

            <!-- Risk Level Badge -->
            <div class="text-center">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${riskConfig.badgeColor}">
                    ${result.risk_level.charAt(0).toUpperCase() + result.risk_level.slice(1)} Risk
                </span>
            </div>

            <!-- Risk Factors -->
            <div>
                <h4 class="text-sm font-medium text-gray-300 mb-3">Risk Factors</h4>
                <div class="space-y-2">
                    ${result.risk_factors.map(factor => `
                        <div class="text-xs p-2 bg-dark-700 rounded border-l-2 ${riskConfig.borderColor}">
                            ${factor}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Transaction Summary -->
            <div class="border-t border-dark-600 pt-4">
                <h4 class="text-sm font-medium text-gray-300 mb-3">Transaction Details</h4>
                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="text-gray-400">Amount:</div>
                    <div class="text-white">$${transactionData.amount.toFixed(2)}</div>
                    <div class="text-gray-400">Time:</div>
                    <div class="text-white">${formatHour(transactionData.hour)}</div>
                    <div class="text-gray-400">Category:</div>
                    <div class="text-white">${transactionData.merchant_category}</div>
                    <div class="text-gray-400">Payment:</div>
                    <div class="text-white">${transactionData.payment_method}</div>
                </div>
            </div>

            <!-- Analysis Time -->
            <div class="text-center text-xs text-gray-500 border-t border-dark-600 pt-3">
                Analysis completed at ${new Date().toLocaleString()}
            </div>
        </div>
    `;
    
    resultsSection.innerHTML = resultsHTML;
    
    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function getRiskConfig(riskLevel, isFraud) {
    if (isFraud) {
        return {
            title: 'FRAUD DETECTED',
            subtitle: 'High risk transaction flagged',
            icon: 'alert-triangle',
            textColor: 'text-red-400',
            bgColor: 'bg-red-400/20',
            barColor: 'bg-red-400',
            badgeColor: 'bg-red-400/20 text-red-400',
            borderColor: 'border-red-400'
        };
    }
    
    switch (riskLevel) {
        case 'low':
            return {
                title: 'Low Risk',
                subtitle: 'Transaction appears safe',
                icon: 'check-circle',
                textColor: 'text-green-400',
                bgColor: 'bg-green-400/20',
                barColor: 'bg-green-400',
                badgeColor: 'bg-green-400/20 text-green-400',
                borderColor: 'border-green-400'
            };
        case 'medium':
            return {
                title: 'Medium Risk',
                subtitle: 'Requires monitoring',
                icon: 'alert-circle',
                textColor: 'text-yellow-400',
                bgColor: 'bg-yellow-400/20',
                barColor: 'bg-yellow-400',
                badgeColor: 'bg-yellow-400/20 text-yellow-400',
                borderColor: 'border-yellow-400'
            };
        default:
            return {
                title: 'High Risk',
                subtitle: 'Potentially fraudulent',
                icon: 'shield-alert',
                textColor: 'text-red-400',
                bgColor: 'bg-red-400/20',
                barColor: 'bg-red-400',
                badgeColor: 'bg-red-400/20 text-red-400',
                borderColor: 'border-red-400'
            };
    }
}

function setLoadingState(loading) {
    isAnalyzing = loading;
    const btn = document.getElementById('analyze-btn');
    const btnContent = btn.querySelector('span');
    const btnIcon = btn.querySelector('i');
    
    if (loading) {
        btn.disabled = true;
        btn.classList.add('opacity-70');
        btnContent.textContent = 'Analyzing...';
        btnIcon.outerHTML = '<div class="spinner"></div>';
    } else {
        btn.disabled = false;
        btn.classList.remove('opacity-70');
        btnContent.textContent = 'Analyze Transaction';
        btn.querySelector('.spinner')?.outerHTML = '<i data-lucide="shield" class="h-5 w-5"></i>';
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm';
        document.body.appendChild(notification);
    }
    
    // Set notification style based on type
    let bgColor, textColor, iconName;
    switch (type) {
        case 'success':
            bgColor = 'bg-green-600';
            textColor = 'text-white';
            iconName = 'check-circle';
            break;
        case 'error':
            bgColor = 'bg-red-600';
            textColor = 'text-white';
            iconName = 'x-circle';
            break;
        default:
            bgColor = 'bg-primary-500';
            textColor = 'text-dark-900';
            iconName = 'info';
    }
    
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${bgColor} ${textColor}`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i data-lucide="${iconName}" class="h-5 w-5"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${period}`;
}

// Utility functions for navigation
function scrollToDemo() {
    document.getElementById('demo').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
        analyzeTransaction();
    }
});

// Auto-focus on amount field when demo section is visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id === 'demo') {
            setTimeout(() => {
                document.getElementById('amount').focus();
            }, 500);
        }
    });
}, { threshold: 0.5 });

// Observe demo section
const demoSection = document.getElementById('demo');
if (demoSection) {
    observer.observe(demoSection);
}

// Export functions to global scope
window.analyzeTransaction = analyzeTransaction;
window.scrollToDemo = scrollToDemo;
window.scrollToFeatures = scrollToFeatures;