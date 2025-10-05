'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, TrendingUp, DollarSign, Clock, MapPin, CreditCard, User, Hash, Zap } from 'lucide-react'
import Navigation from '@/components/ui/navigation'
// import FloatingElements from '@/components/3d/floating-elements'
import { useAuth } from '@/components/providers'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { TransactionData, FraudResult } from '@/types/database'

interface AnalysisResult extends FraudResult {
  id: string
  transaction_data: TransactionData
  created_at: string
}

export default function DashboardPage() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisResult[]>([])
  const [formData, setFormData] = useState<TransactionData>({
    amount: 150.00,
    hour: 14,
    merchant_category: 'online',
    payment_method: 'card',
    customer_age: 32,
    transaction_frequency: 5,
    location_risk_score: 0.3,
  })

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/login')
    }
  }, [session, loading, router])

  useEffect(() => {
    // Load recent analyses from localStorage for demo
    const saved = localStorage.getItem('fraud_analyses')
    if (saved) {
      setRecentAnalyses(JSON.parse(saved))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'location_risk_score' ? parseFloat(value) : 
              name === 'hour' || name === 'customer_age' || name === 'transaction_frequency' ? parseInt(value) : 
              value
    }))
  }

  const analyzeTransaction = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate API call to Flask backend
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      let result: FraudResult
      if (response.ok) {
        result = await response.json()
      } else {
        // Fallback to local simulation for demo
        result = simulateFraudDetection(formData)
      }

      const analysisResult: AnalysisResult = {
        id: Date.now().toString(),
        ...result,
        transaction_data: formData,
        created_at: new Date().toISOString(),
      }

      setCurrentResult(analysisResult)
      
      // Update recent analyses
      const updated = [analysisResult, ...recentAnalyses.slice(0, 9)]
      setRecentAnalyses(updated)
      localStorage.setItem('fraud_analyses', JSON.stringify(updated))
      
      toast.success('Analysis completed successfully!')
      
    } catch (error) {
      toast.error('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!session) {
    return null
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
            <h1 className="text-4xl font-bold text-white mb-2">
              Fraud Detection <span className="text-primary-400">Dashboard</span>
            </h1>
            <p className="text-gray-400">
              Analyze transactions in real-time with our AI-powered fraud detection system
            </p>
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
                      <TrendingUp className="inline h-4 w-4 mr-1" />
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
                      <span>Analyze Transaction</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Current Result */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {currentResult && (
                <div className="card-3d bg-dark-800/70 backdrop-blur-md border border-dark-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Analysis Result</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Risk Level</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getRiskColor(currentResult.risk_level)}`}>
                        {(() => {
                          const Icon = getRiskIcon(currentResult.risk_level)
                          return <Icon className="h-3 w-3" />
                        })()}
                        <span className="capitalize">{currentResult.risk_level}</span>
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Fraud Probability</span>
                        <span className="text-white font-medium">{currentResult.fraud_probability}%</span>
                      </div>
                      <div className="w-full bg-dark-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ${
                            currentResult.fraud_probability > 70 ? 'bg-red-500' :
                            currentResult.fraud_probability > 30 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${currentResult.fraud_probability}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Risk Factors</h4>
                      <ul className="space-y-1">
                        {currentResult.risk_factors.map((factor, index) => (
                          <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Analyses Summary */}
              <div className="card-3d bg-dark-800/70 backdrop-blur-md border border-dark-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                
                {recentAnalyses.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No analyses yet. Run your first transaction analysis above.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAnalyses.slice(0, 5).map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between p-3 bg-dark-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            analysis.risk_level === 'high' ? 'bg-red-500' :
                            analysis.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="text-sm font-medium text-white">
                              ${analysis.transaction_data.amount}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(analysis.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-300">
                          {analysis.fraud_probability}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}