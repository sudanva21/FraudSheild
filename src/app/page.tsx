'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Eye, TrendingUp, ArrowRight, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/ui/navigation'
// import FloatingElements from '@/components/3d/floating-elements'
import { useAuth } from '@/components/providers'

export default function LandingPage() {
  const { session } = useAuth()

  const features = [
    {
      icon: Shield,
      title: 'AI-Powered Detection',
      description: 'Advanced machine learning algorithms analyze transactions in real-time to detect fraudulent patterns.',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get fraud risk assessments in milliseconds with our optimized detection engine.',
    },
    {
      icon: Eye,
      title: 'Comprehensive Analysis',
      description: 'Multi-factor analysis including amount, location, time, merchant category, and behavioral patterns.',
    },
    {
      icon: TrendingUp,
      title: 'Continuous Learning',
      description: 'Our AI model continuously learns and adapts to new fraud patterns and emerging threats.',
    },
  ]

  const stats = [
    { value: '99.7%', label: 'Accuracy Rate' },
    { value: '<50ms', label: 'Response Time' },
    { value: '10M+', label: 'Transactions Analyzed' },
    { value: '24/7', label: 'Monitoring' },
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'CTO, FinanceFlow',
      content: 'FraudShield reduced our false positives by 80% while catching 15% more actual fraud attempts.',
      rating: 5,
    },
    {
      name: 'Michael Rodriguez',
      role: 'Security Director, PaySecure',
      content: 'The real-time analysis and dashboard have been game-changers for our fraud prevention strategy.',
      rating: 5,
    },
    {
      name: 'Emily Watson',
      role: 'Risk Manager, TechBank',
      content: 'Implementation was seamless, and the ROI was evident within the first month.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-hidden">
      {/* <FloatingElements /> */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-primary-400 to-primary-600 bg-clip-text text-transparent">
                Fraud Detection
                <br />
                <span className="glow-text">Redefined</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
                Protect your business with AI-powered fraud detection that learns, adapts, and delivers precision at scale.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              {session ? (
                <Link
                  href="/dashboard"
                  className="btn-cyber px-8 py-4 rounded-lg font-semibold text-dark-900 flex items-center space-x-2 hover:scale-105 transition-all duration-300 shadow-3d"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="btn-cyber px-8 py-4 rounded-lg font-semibold text-dark-900 flex items-center space-x-2 hover:scale-105 transition-all duration-300 shadow-3d"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/demo"
                    className="px-8 py-4 rounded-lg border-2 border-primary-500 text-primary-400 font-semibold hover:bg-primary-500 hover:text-dark-900 transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>Try Demo</span>
                    <Eye className="h-5 w-5" />
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm md:text-base">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Why Choose <span className="text-primary-400">FraudShield</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our advanced AI technology provides comprehensive fraud detection with unmatched accuracy and speed.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-3d bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300"
                >
                  <div className="bg-gradient-to-br from-primary-400 to-primary-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-dark-900" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Trusted by <span className="text-primary-400">Industry Leaders</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card-3d bg-dark-700/50 backdrop-blur-sm border border-dark-600 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-primary-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-300 mb-4 leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div className="border-t border-dark-600 pt-4">
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-dark-800 to-dark-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Stop Fraud?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses protecting themselves with FraudShield's AI-powered detection system.
            </p>
            {!session && (
              <Link
                href="/auth/register"
                className="btn-cyber px-8 py-4 rounded-lg font-semibold text-dark-900 inline-flex items-center space-x-2 hover:scale-105 transition-all duration-300 shadow-3d"
              >
                <span>Start Your Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-dark-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-primary-400" />
            <span className="text-xl font-bold text-white">FraudShield</span>
          </div>
          <p className="text-gray-400">
            © 2025 FraudShield. All rights reserved. Protecting digital payments with AI.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Developed by <span className="text-primary-400 font-semibold">sudanva</span>
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}
