'use client'

import React, { useRef, useState, useEffect } from 'react'

interface MagnetProps {
  children: React.ReactNode
  className?: string
  strength?: number
}

export default function Magnet({ children, className = '', strength = 18 }: MagnetProps) {
  const magnetRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const magnet = magnetRef.current
      if (!magnet) return

      const rect = magnet.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      const distance = Math.sqrt(x * x + y * y)
      const activeRadius = Math.max(rect.width, rect.height) * 1.2

      if (distance < activeRadius) {
        setPosition({
          x: (x / activeRadius) * strength,
          y: (y / activeRadius) * strength
        })
      } else {
        setPosition({ x: 0, y: 0 })
      }
    }

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 })
    }

    window.addEventListener('mousemove', handleMouseMove)
    magnetRef.current?.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [strength])

  return (
    <div
      ref={magnetRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0px)`,
        transition: position.x === 0 ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)'
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  )
}
