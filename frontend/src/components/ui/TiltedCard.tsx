'use client'

import React, { useRef, useState } from 'react'

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  perspective?: number
  scale?: number
}

export default function TiltedCard({
  children,
  className = '',
  maxTilt = 6,
  perspective = 1000,
  scale = 1.01
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const midX = rect.width / 2
    const midY = rect.height / 2

    const tiltX = -((y - midY) / midY) * maxTilt
    const tiltY = ((x - midX) / midX) * maxTilt

    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`,
      transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)'
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`will-change-transform duration-300 ${className}`}
    >
      {children}
    </div>
  )
}
