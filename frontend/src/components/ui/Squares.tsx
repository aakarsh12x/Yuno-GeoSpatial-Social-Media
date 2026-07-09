'use client'

import { useRef, useEffect, useState } from 'react'

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'down' | 'left' | 'right'
  speed?: number
  borderColor?: string
  hoverFillColor?: string
  squareSize?: number
}

export default function Squares({
  direction = 'diagonal',
  speed = 1,
  borderColor = 'rgba(230, 220, 210, 0.4)',
  hoverFillColor = 'rgba(212, 69, 58, 0.05)',
  squareSize = 40
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredSquare, setHoveredSquare] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let offset = 0

    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const drawGrid = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const numCols = Math.ceil(canvas.width / squareSize) + 2
      const numRows = Math.ceil(canvas.height / squareSize) + 2

      offset = (offset + speed * 0.15) % squareSize

      ctx.strokeStyle = borderColor
      ctx.lineWidth = 0.5

      for (let col = -1; col < numCols; col++) {
        for (let row = -1; row < numRows; row++) {
          let x = col * squareSize
          let y = row * squareSize

          if (direction === 'diagonal') {
            x += offset
            y += offset
          } else if (direction === 'right') {
            x += offset
          } else if (direction === 'down') {
            y += offset
          } else if (direction === 'up') {
            y -= offset
          } else if (direction === 'left') {
            x -= offset
          }

          ctx.strokeRect(x, y, squareSize, squareSize)

          if (hoveredSquare) {
            // Adjust coordinates based on scroll and offset
            const mouseGridX = Math.floor(hoveredSquare.x / squareSize)
            const mouseGridY = Math.floor(hoveredSquare.y / squareSize)

            if (col === mouseGridX && row === mouseGridY) {
              ctx.fillStyle = hoverFillColor
              ctx.fillRect(x, y, squareSize, squareSize)
            }
          }
        }
      }
    }

    const render = () => {
      drawGrid()
      animationFrameId = requestAnimationFrame(render)
    }

    render()

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      setHoveredSquare({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    const handleMouseLeave = () => {
      setHoveredSquare(null)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
      }
      cancelAnimationFrame(animationFrameId)
    }
  }, [direction, speed, borderColor, hoverFillColor, squareSize, hoveredSquare])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-auto" />
}
