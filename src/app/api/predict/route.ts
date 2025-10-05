import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Try to forward to Flask backend first
    const flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5000'
    
    try {
      const flaskResponse = await fetch(`${flaskUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      
      if (flaskResponse.ok) {
        const result = await flaskResponse.json()
        return NextResponse.json(result)
      }
    } catch (error) {
      console.log('Flask backend not available, using local simulation')
    }
    
    // Fallback to local simulation
    const result = simulateFraudDetection(body)
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error in fraud prediction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function simulateFraudDetection(data: any) {
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
    success: true,
    fraud_probability: fraudProbability,
    is_fraud: isFraud,
    risk_level: riskLevel,
    risk_factors: factors,
    timestamp: new Date().toISOString(),
  }
}