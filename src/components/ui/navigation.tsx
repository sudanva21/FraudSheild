'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Menu, X, User, LogOut, BarChart3, Home } from 'lucide-react'
import { useAuth } from '@/components/providers'
import { signOut } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { LoadingOverlay } from './loading-overlay'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const { user, session } = useAuth()

  const handleSignOut = async () => {
    setIsLoading(true)
    setLoadingText('Signing out...')
    try {
      await signOut()
      setLoadingText('Redirecting...')
      toast.success('Signed out successfully')
      setTimeout(() => {
        router.push('/')
        setIsProfileOpen(false)
        setIsLoading(false)
        setLoadingText('')
      }, 500)
    } catch (error) {
      toast.error('Error signing out')
      setIsLoading(false)
      setLoadingText('')
    }
  }

  const handleNavigation = (href: string, label: string) => {
    if (pathname === href) return
    setIsLoading(true)
    setLoadingText(`Loading ${label}...`)
    router.push(href)
    setTimeout(() => {
      setIsLoading(false)
      setLoadingText('')
    }, 1000)
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3, requiresAuth: true },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      <LoadingOverlay isLoading={isLoading} message={loadingText} />
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Shield className="h-6 w-6 text-dark-900" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
              FraudShield
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon
              if (item.requiresAuth && !session) return null
              
              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href, item.label)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-400 bg-primary-400/10'
                      : 'text-gray-300 hover:text-primary-400 hover:bg-dark-800'
                  }`}
                  disabled={isLoading}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}

            {/* Auth buttons */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-dark-900" />
                  </div>
                  <span className="hidden sm:block">{user?.email?.split('@')[0]}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-2"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-primary-400 hover:bg-dark-700 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-dark-700 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleNavigation('/auth/login', 'Sign In')}
                  className="text-gray-300 hover:text-primary-400 transition-colors"
                  disabled={isLoading}
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavigation('/auth/register', 'Registration')}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-dark-900 px-4 py-2 rounded-lg font-medium hover:from-primary-400 hover:to-primary-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  disabled={isLoading}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-200"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-dark-800 py-4"
            >
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  if (item.requiresAuth && !session) return null
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'text-primary-400 bg-primary-400/10'
                          : 'text-gray-300 hover:text-primary-400 hover:bg-dark-800'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                {session ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-primary-400 hover:bg-dark-800 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-dark-800 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-dark-800">
                    <Link
                      href="/auth/login"
                      className="px-3 py-2 text-gray-300 hover:text-primary-400 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-dark-900 px-3 py-2 rounded-lg font-medium hover:from-primary-400 hover:to-primary-500 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
    </>
  )
}
