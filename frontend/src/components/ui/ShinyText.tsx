'use client'

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

export default function ShinyText({ text, disabled = false, speed = 5, className = '' }: ShinyTextProps) {
  const animationDuration = `${speed}s`

  return (
    <span
      className={`inline-block text-[#8B7E74] bg-clip-text text-transparent bg-gradient-to-r from-[#8B7E74] via-[#1E1616] to-[#8B7E74] bg-[length:200%_100%] ${
        disabled ? '' : 'animate-shine'
      } ${className}`}
      style={{
        animationDuration,
        backgroundImage: 'linear-gradient(120deg, rgba(139,126,116,0.8) 30%, rgba(212,69,58,1) 50%, rgba(139,126,116,0.8) 70%)',
        backgroundSize: '200% auto'
      }}
    >
      {text}
    </span>
  )
}
