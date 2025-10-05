'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
  backdrop?: boolean
}

export function LoadingOverlay({ 
  isVisible, 
  text = 'Loading...', 
  backdrop = true 
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            fixed inset-0 z-50 flex items-center justify-center
            ${backdrop ? 'bg-black/50 backdrop-blur-sm' : ''}
          `}
          style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-4 bg-dark-800 px-6 py-4 rounded-xl border border-primary-600/30 shadow-2xl"
          >
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            <p className="text-sm text-gray-300 font-medium">{text}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Button loading spinner component
interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function LoadingButton({ 
  isLoading, 
  children, 
  className = '', 
  onClick,
  disabled,
  type = 'button',
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}