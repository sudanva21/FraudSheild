'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Mail, Lock, User, Building, ArrowRight } from 'lucide-react'
import { signUp } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import toast from 'react-hot-toast'
// import FloatingElements from '@/components/3d/floating-elements'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    organization: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const router = useRouter()
  const { session } = useAuth()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoadingText('Validating...')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      setLoadingText('')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      setIsLoading(false)
      setLoadingText('')
      return
    }

    setLoadingText('Creating account...')

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        organization: formData.organization,
      })

      if (error) {
        toast.error(error.message || 'Failed to create account')
        console.error('Sign up error:', error)
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          setLoadingText('Success! Redirecting...')
          toast.success('Account created successfully! Redirecting to dashboard...')
          setTimeout(() => {
            router.push('/dashboard')
          }, 500)
        } else {
          setLoadingText('Account created!')
          toast.success('Account created! Please check your email to verify your account.')
          setTimeout(() => {
            setIsLoading(false)
            setLoadingText('')
          }, 2000)
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      const errorMessage = error?.message?.includes('fetch') 
        ? 'Network error. Please check your connection and try again.'
        : 'An unexpected error occurred'
      toast.error(errorMessage)
    } finally {
      if (!loadingText.includes('Success') && !loadingText.includes('created')) {
        setTimeout(() => {
          setIsLoading(false)
          setLoadingText('')
        }, 1000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center p-4 overflow-hidden">
      {/* <FloatingElements /> */}
      
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="card-3d bg-dark-800/70 backdrop-blur-md border border-dark-700 rounded-2xl p-8 shadow-3d"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <div className="p-3 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Shield className="h-8 w-8 text-dark-900" />
              </div>
              <span className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                FraudShield
              </span>
            </Link>
            <h1 className="text-3xl font-bold text-white mt-6 mb-2">Create Account</h1>
            <p className="text-gray-400">Start protecting your business today</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input pl-10 w-full"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-gray-300 mb-2">
                Organization (Optional)
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="form-input pl-10 w-full"
                  placeholder="Your company name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input pl-10 w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input pl-10 pr-10 w-full"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input pl-10 pr-10 w-full"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2 mt-1"
                required
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-300">
                I agree to the{' '}
                <Link href="/terms" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-cyber py-3 rounded-lg font-semibold text-dark-900 flex items-center justify-center space-x-2 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner"></div>
                  <span>{loadingText}</span>
                </div>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mt-6"
        >
          <Link
            href="/"
            className="text-gray-400 hover:text-primary-400 transition-colors inline-flex items-center space-x-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            <span>Back to home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}