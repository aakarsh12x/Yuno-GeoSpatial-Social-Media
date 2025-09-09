'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Logo({ className, size = 'lg' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateY: -90 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.0, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 group-hover:scale-110 transition-transform duration-300"
      >
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotateY: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Image
            src="/icon.png"
            alt="Yuno Logo"
            width={96}
            height={64}
            className="w-full h-full object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
