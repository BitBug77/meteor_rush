"use client"

import { useEffect, useRef } from "react"

interface BackgroundProps {
  width: number
  height: number
  gameSpeed: number
}

export default function Background({ width, height, gameSpeed }: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<{ x: number; y: number; size: number; speed: number; color: string }[]>([])
  const planetsRef = useRef<{ x: number; y: number; size: number; color: string }[]>([])

  // Initialize stars and planets
  useEffect(() => {
    if (!canvasRef.current) return

    // Create stars
    const starCount = Math.floor((width * height) / 2000) // Adjust density based on screen size
    starsRef.current = Array.from({ length: starCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.1,
      color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
    }))

    // Create planets
    const planetCount = Math.floor(width / 300) // Fewer planets
    planetsRef.current = Array.from({ length: planetCount }).map(() => {
      const colors = [
        "#f87171", // Red
        "#fb923c", // Orange
        "#fbbf24", // Yellow
        "#4ade80", // Green
        "#60a5fa", // Blue
        "#a78bfa", // Purple
      ]
      return {
        x: Math.random() * width,
        y: Math.random() * (height * 0.7), // Keep planets in upper part
        size: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      }
    })
  }, [width, height])

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "#0f172a") // Dark blue
      gradient.addColorStop(1, "#1e293b") // Slightly lighter blue
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw stars
      starsRef.current.forEach((star) => {
        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Move stars
        star.x -= star.speed * gameSpeed
        if (star.x < 0) {
          star.x = width
          star.y = Math.random() * height
        }
      })

      // Draw planets
      planetsRef.current.forEach((planet) => {
        // Planet body
        ctx.fillStyle = planet.color
        ctx.beginPath()
        ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2)
        ctx.fill()

        // Planet details
        ctx.fillStyle = `${planet.color}33` // Transparent version of color
        ctx.beginPath()
        ctx.arc(planet.x - planet.size * 0.3, planet.y - planet.size * 0.3, planet.size * 0.5, 0, Math.PI * 2)
        ctx.fill()

        // Move planets very slowly
        planet.x -= 0.05 * gameSpeed
        if (planet.x + planet.size < 0) {
          planet.x = width + planet.size
          planet.y = Math.random() * (height * 0.7)
        }
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [width, height, gameSpeed])

  return <canvas ref={canvasRef} width={width} height={height} className="absolute inset-0" />
}
