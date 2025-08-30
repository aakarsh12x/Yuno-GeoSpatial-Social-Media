'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, X } from 'lucide-react'

interface RealTimeNotificationProps {
  message: string
  userData?: {
    name: string
    city: string
    distance: number
  }
  onClose: () => void
  duration?: number
}

export default function RealTimeNotification({ 
  message, 
  userData, 
  onClose, 
  duration = 5000 
}: RealTimeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-surface/95 backdrop-blur-sm border border-border-medium rounded-xl p-4 shadow-glow">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary mb-1">
                  {message}
                </p>
                
                {userData && (
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <MapPin className="w-3 h-3" />
                    <span>{userData.name} • {userData.city}</span>
                    <span>• {userData.distance.toFixed(1)}km away</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  setIsVisible(false)
                  setTimeout(onClose, 300)
                }}
                className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
