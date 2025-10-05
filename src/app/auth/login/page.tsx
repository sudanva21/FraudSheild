'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { signIn } from '@/lib/supabase'
import { useAuth } from '@/components/providers'
import toast from 'react-hot-toast'
// import FloatingElements from '@/components/3d/floating-elements'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const router = useRouter()
  const { session } = useAuth()

  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoadingText('Signing in...')

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        toast.error(error.message || 'Failed to sign in')
        console.error('Sign in error:', error)
      } else if (data.user) {
        setLoadingText('Success! Redirecting...')
        toast.success('Successfully signed in!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      const errorMessage = error?.message?.includes('fetch') 
        ? 'Network error. Please check your connection and try again.'
        : 'An unexpected error occurred'
      toast.error(errorMessage)
    } finally {
      if (!loadingText.includes('Success')) {
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
            <h1 className="text-3xl font-bold text-white mt-6 mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your account to continue</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10 w-full"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 bg-dark-700 border-dark-600 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
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
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
              >
                Sign up
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