'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function NavigationLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleComplete = () => setIsLoading(false)

    // Listen for route changes
    window.addEventListener('beforeunload', handleStart)
    
    // Reset loading state when route changes
    setIsLoading(false)

    return () => {
      window.removeEventListener('beforeunload', handleStart)
    }
  }, [pathname])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          exit={{ width: '100%', opacity: 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="fixed top-0 left-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600 z-50 shadow-lg"
          style={{ boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)' }}
        />
      )}
    </AnimatePresence>
  )
}