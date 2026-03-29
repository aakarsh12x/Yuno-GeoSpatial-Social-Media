'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CoverProps {
  children: React.ReactNode
  className?: string
}

export default function Cover({ children, className }: CoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative inline-block px-2 py-1",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="relative z-10 text-red-600 font-bold drop-shadow-sm filter drop-shadow-[0_0_8px_rgba(220,38,38,0.4)]"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
