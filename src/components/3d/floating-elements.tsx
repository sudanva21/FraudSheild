'use client'

import { Suspense, useMemo, useRef, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Dynamically import Three.js components to avoid SSR issues
const ThreeBackground = dynamic(() => import('./three-background'), {
  ssr: false,
  loading: () => <GeometricBackground />
})

// Fallback component without 3D
function GeometricBackground() {
  const prefersReducedMotion = useReducedMotion()

  const geometricElements = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 15 + Math.random() * 35,
      rotation: Math.random() * 360,
      delay: Math.random() * 3,
      duration: 6 + Math.random() * 8,
    }))
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900" />

      {/* Animated geometric shapes */}
      {geometricElements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: element.size,
            height: element.size,
          }}
          initial={{
            opacity: 0,
            scale: 0,
            rotate: 0
          }}
          animate={{
            opacity: [0, 0.15, 0],
            scale: [0, 1, 0],
            rotate: prefersReducedMotion ? 0 : [0, 360],
            y: prefersReducedMotion ? 0 : [-30, 30, -30],
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : element.duration,
            repeat: prefersReducedMotion ? 0 : Infinity,
            repeatType: "reverse",
            delay: element.delay,
            ease: "easeInOut",
          }}
        >
          {/* Different geometric shapes */}
          {element.id % 4 === 0 && (
            <div className="w-full h-full border border-primary-500/20 rounded-full" />
          )}
          {element.id % 4 === 1 && (
            <div className="w-full h-full border border-primary-400/15 transform rotate-45" />
          )}
          {element.id % 4 === 2 && (
            <div className="w-full h-full bg-gradient-to-r from-primary-600/10 to-transparent rounded-lg transform rotate-12" />
          )}
          {element.id % 4 === 3 && (
            <div className="w-full h-full border-2 border-primary-300/20 rounded-full opacity-30" />
          )}
        </motion.div>
      ))}

      {/* Enhanced grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-dark-900/50 to-dark-900" />

      {/* Additional floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }, (_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Main FloatingElements component
function FloatingElementsInner() {
  const [mounted, setMounted] = useState(false)
  const [is3DSupported, setIs3DSupported] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    setMounted(true)

    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      setIs3DSupported(!!gl && !prefersReducedMotion)
    } catch (e) {
      setIs3DSupported(false)
    }
  }, [prefersReducedMotion])

  // Don't render anything during SSR
  if (!mounted) {
    return null
  }

  // Use 3D background if supported, otherwise fallback to geometric
  return <ThreeBackground />
}

// Main export with suspense boundary
export default function FloatingElements() {
  return (
    <Suspense fallback={<GeometricBackground />}>
      <FloatingElementsInner />
    </Suspense>
  )
}
