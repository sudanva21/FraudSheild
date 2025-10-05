'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield, AlertTriangle, CheckCircle, DollarSign, Clock, MapPin, CreditCard, User, Hash, Zap, ArrowLeft } from 'lucide-react'
import Navigation from '@/components/ui/navigation'
// import FloatingElements from '@/components/3d/floating-elements'
import toast from 'react-hot-toast'

interface TransactionData {
  amount: number
  hour: number
  merchant_category: string
  payment_method: string
  customer_age: number
  transaction_frequency: number
  location_risk_score: number
}

interface FraudResult {
  fraud_probability: number
  is_fraud: boolean
  risk_level: 'low' | 'medium' | 'high'
  risk_factors: string[]
  timestamp: string
}

export default function DemoPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentResult, setCurrentResult] = useState<FraudResult | null>(null)
  const [formData, setFormData] = useState<TransactionData>({
    amount: 150.00,
    hour: 14,
    merchant_category: 'online',
    payment_method: 'card',
    customer_age: 32,
    transaction_frequency: 5,
    location_risk_score: 0.3,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'location_risk_score' ? parseFloat(value) : 
              name === 'hour' || name === 'customer_age' || name === 'transaction_frequency' ? parseInt(value) : 
              value
    }))
  }

  const simulateFraudDetection = (data: TransactionData): FraudResult => {
    // Simple fraud detection simulation
    let riskScore = 0
    const factors: string[] = []

    // Amount analysis
    if (data.amount > 1000) {
      riskScore += 0.3
      factors.push('High transaction amount')
    } else if (data.amount < 5) {
      riskScore += 0.2
      factors.push('Unusually low amount')
    }

    // Time analysis
    if (data.hour < 6 || data.hour > 22) {
      riskScore += 0.25
      factors.push('Transaction during unusual hours')
    }

    // Location risk
    riskScore += data.location_risk_score * 0.4

    if (data.location_risk_score > 0.7) {
      factors.push('High-risk location')
    }

    // Merchant category analysis
    if (['online', 'unknown'].includes(data.merchant_category)) {
      riskScore += 0.1
      factors.push('Online/unknown merchant category')
    }

    // Frequency analysis
    if (data.transaction_frequency > 20) {
      riskScore += 0.2
      factors.push('High transaction frequency')
    } else if (data.transaction_frequency < 2) {
      riskScore += 0.15
      factors.push('Unusually low transaction frequency')
    }

    // Age analysis
    if (data.customer_age < 21 || data.customer_age > 70) {
      riskScore += 0.1
      factors.push('Customer age outside typical range')
    }

    // Cap the risk score
    riskScore = Math.min(riskScore, 1)
    
    // Add some randomness for demo
    riskScore += (Math.random() - 0.5) * 0.2
    riskScore = Math.max(0, Math.min(1, riskScore))

    const fraudProbability = Math.round(riskScore * 100)
    const isFraud = fraudProbability > 70
    
    let riskLevel: 'low' | 'medium' | 'high'
    if (fraudProbability < 30) riskLevel = 'low'
    else if (fraudProbability < 70) riskLevel = 'medium'
    else riskLevel = 'high'

    if (factors.length === 0) {
      factors.push('Standard transaction patterns')
    }

    return {
      fraud_probability: fraudProbability,
      is_fraud: isFraud,
      risk_level: riskLevel,
      risk_factors: factors,
      timestamp: new Date().toISOString(),
    }
  }

  const analyzeTransaction = async () => {
    setIsAnalyzing(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    try {
      const result = simulateFraudDetection(formData)
      setCurrentResult(result)
      toast.success('Demo analysis completed!')
    } catch (error) {
      toast.error('Demo analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'high': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return CheckCircle
      case 'medium': return AlertTriangle
      case 'high': return Shield
      default: return Shield
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* <FloatingElements /> */}
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">
              Try <span className="text-primary-400">FraudShield Demo</span>
            </h1>
            <p className="text-gray-400">
              Experience our AI-powered fraud detection system with this interactive demo
            </p>
            <div className="mt-4 p-4 bg-primary-400/10 border border-primary-400/30 rounded-lg">
              <p className="text-sm text-primary-300">
                📝 This is a demo version with simulated results. <Link href="/auth/register" className="underline">Sign up</Link> for full access to our real-time fraud detection system.
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Transaction Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="card-3d bg-dark-800/70 backdrop-blur-md border border-dark-700 rounded-xl p-6">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center space-x-2">
                  <Zap className="h-6 w-6 text-primary-400" />
                  <span>Transaction Analysis</span>
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Transaction Amount ($)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      className="form-input w-full"
                      placeholder="150.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Transaction Hour (0-23)
                    </label>
                    <input
                      type="number"
                      name="hour"
                      value={formData.hour}
                      onChange={handleInputChange}
                      min="0"
                      max="23"
                      className="form-input w-full"
                      placeholder="14"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Hash className="inline h-4 w-4 mr-1" />
                      Merchant Category
                    </label>
                    <select
                      name="merchant_category"
                      value={formData.merchant_category}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    >
                      <option value="grocery">Grocery</option>
                      <option value="gas">Gas Station</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="retail">Retail</option>
                      <option value="online">Online</option>
                      <option value="atm">ATM</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <CreditCard className="inline h-4 w-4 mr-1" />
                      Payment Method
                    </label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleInputChange}
                      className="form-input w-full"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="mobile">Mobile Payment</option>
                      <option value="online">Online Banking</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Customer Age
                    </label>
                    <input
                      type="number"
                      name="customer_age"
                      value={formData.customer_age}
                      onChange={handleInputChange}
                      min="18"
                      max="100"
                      className="form-input w-full"
                      placeholder="32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Hash className="inline h-4 w-4 mr-1" />
                      Monthly Transaction Frequency
                    </label>
                    <input
                      type="number"
                      name="transaction_frequency"
                      value={formData.transaction_frequency}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="form-input w-full"
                      placeholder="5"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Location Risk Score (0-1)
                    </label>
                    <input
                      type="number"
                      name="location_risk_score"
                      value={formData.location_risk_score}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="1"
                      className="form-input w-full"
                      placeholder="0.3"
                    />
                    <p className="text-xs text-gray-500 mt-1">0 = Very Safe, 1 = High Risk</p>
                  </div>
                </div>

                <button
                  onClick={analyzeTransaction}
                  disabled={isAnalyzing}
                  className="w-full mt-8 btn-cyber py-4 rounded-lg font-semibold text-dark-900 flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isAnalyzing ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <Shield className="h-5 w-5" />
                      <span>Analyze Transaction (Demo)</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Results Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="card-3d bg-dark-800/70 backdrop-blur-md border border-dark-700 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Analysis Results</h2>
                
                {currentResult ? (
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="text-center">
                      <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                        currentResult.is_fraud ? 'bg-red-400/20 text-red-400' : 'bg-green-400/20 text-green-400'
                      }`}>
                        <Shield className="h-4 w-4" />
                        <span>{currentResult.is_fraud ? 'FRAUD DETECTED' : 'TRANSACTION APPROVED'}</span>
                      </div>
                    </div>

                    {/* Risk Level */}
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2">Risk Level</div>
                      {(() => {
                        const RiskIcon = getRiskIcon(currentResult.risk_level)
                        return (
                          <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${getRiskColor(currentResult.risk_level)}`}>
                            <RiskIcon className="h-4 w-4" />
                            <span className="uppercase">{currentResult.risk_level}</span>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Fraud Probability */}
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-2">Fraud Probability</div>
                      <div className="text-3xl font-bold text-white">{currentResult.fraud_probability}%</div>
                    </div>

                    {/* Risk Factors */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-300 mb-3">Risk Factors</h3>
                      <div className="space-y-2">
                        {currentResult.risk_factors.map((factor, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <div className="w-2 h-2 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-400">{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 pt-4 border-t border-dark-600">
                      Analysis completed at {new Date(currentResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Analyze Transaction" to see demo results</p>
                  </div>
                )}
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 card-3d bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-xl p-6 text-center"
              >
                <h3 className="text-lg font-semibold text-white mb-2">Ready for the Full Experience?</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Sign up now to access real-time fraud detection, historical analysis, and advanced reporting features.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-400 text-dark-900 px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
                >
                  <span>Get Started Free</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}