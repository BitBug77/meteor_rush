"use client"

import { useState, useEffect, useRef } from "react"
import { useWindowSize } from "@/app/hooks/use-window-size"
import Player from "./game/player"
import Obstacle from "./game/obstacle"
import Background from "./game/background"
import GameUI from "./game/game-ui"
import GameOver from "./game/game-over"
import StartScreen from "./game/start-screen"
import HandController from "./HandController"

const GRAVITY = 0.7
const JUMP_FORCE = -15
const INITIAL_GAME_SPEED = 5
const MAX_GAME_SPEED = 12
const SPEED_INCREMENT = 0.0001
const OBSTACLE_INTERVAL_MIN = 1500
const OBSTACLE_INTERVAL_MAX = 3000
const OBSTACLE_TYPES = ["meteor", "satellite", "asteroid", "spacejunk"]

const OBSTACLE_SIZES = {
  meteor: { minWidth: 40, maxWidth: 60, minHeight: 40, maxHeight: 60 },
  satellite: { minWidth: 80, maxWidth: 120, minHeight: 30, maxHeight: 40 },
  asteroid: { minWidth: 50, maxWidth: 80, minHeight: 50, maxHeight: 80 },
  spacejunk: { minWidth: 60, maxWidth: 100, minHeight: 40, maxHeight: 60 },
};

interface ObstacleType {
  id: number
  x: number
  y: number
  width: number
  height: number
  type: string
  passed: boolean
}

export default function MeteorDash() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const [gameSize, setGameSize] = useState({ width: 1000, height: 500 })
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 0 })
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 })
  const [isJumping, setIsJumping] = useState(false)
  const [doubleJumpAvailable, setDoubleJumpAvailable] = useState(false)
  const [obstacles, setObstacles] = useState<ObstacleType[]>([])
  const [gameSpeed, setGameSpeed] = useState(INITIAL_GAME_SPEED)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [groundY, setGroundY] = useState(0)
  const [handControlEnabled, setHandControlEnabled] = useState(true)
  const lastUpdateTime = useRef(Date.now())
  const lastObstacleTime = useRef(0)
  const nextObstacleTime = useRef(getRandomObstacleInterval())
  const obstacleIdCounter = useRef(0)
  const animationFrameId = useRef<number | null>(null)
  const lastJumpTime = useRef(Date.now())
  const windowSize = useWindowSize()

  function getRandomObstacleInterval() {
    return Math.random() * (OBSTACLE_INTERVAL_MAX - OBSTACLE_INTERVAL_MIN) + OBSTACLE_INTERVAL_MIN
  }

  function getRandomObstacleType() {
    return OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)]
  }

  function getRandomObstacleSize(type: string) {
    const sizes = OBSTACLE_SIZES[type as keyof typeof OBSTACLE_SIZES]
    return {
      width: Math.random() * (sizes.maxWidth - sizes.minWidth) + sizes.minWidth,
      height: Math.random() * (sizes.maxHeight - sizes.minHeight) + sizes.minHeight,
    }
  }

  useEffect(() => {
    if (!gameContainerRef.current || !windowSize.width) return

    const aspectRatio = 2
    let newWidth, newHeight

    if (windowSize.width < windowSize.height && windowSize.width < 768) {
      newWidth = windowSize.width - 16
      newHeight = newWidth / aspectRatio
      if (newHeight > windowSize.height - 100) {
        newHeight = windowSize.height - 100
        newWidth = newHeight * aspectRatio
      }
    } else {
      newWidth = Math.min(windowSize.width - 32, 1000)
      newHeight = newWidth / aspectRatio
      if (newHeight > windowSize.height - 64) {
        newHeight = windowSize.height - 64
        newWidth = newHeight * aspectRatio
      }
    }

    setGameSize({ width: newWidth, height: newHeight })
    setGroundY(newHeight - 50)
    setPlayerPosition({ x: 100, y: newHeight - 110 })
  }, [windowSize])

  useEffect(() => {
    const savedHighScore = localStorage.getItem("meteorDashHighScore")
    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore))
  }, [])

  useEffect(() => {
    if (highScore > 0) localStorage.setItem("meteorDashHighScore", highScore.toString())
  }, [highScore])

  const resetGame = () => {
    setPlayerPosition({ x: 100, y: groundY - 60 })
    setPlayerVelocity({ x: 0, y: 0 })
    setIsJumping(false)
    setDoubleJumpAvailable(false)
    setObstacles([])
    setGameSpeed(INITIAL_GAME_SPEED)
    setScore(0)
    setGameOver(false)
    lastObstacleTime.current = 0
    nextObstacleTime.current = getRandomObstacleInterval()
    obstacleIdCounter.current = 0
    lastJumpTime.current = Date.now()
  }

  const startGame = () => {
    if (!gameStarted) setGameStarted(true)
    if (gameOver) resetGame()
  }

  const jump = () => {
    if (!gameStarted) return startGame()
    if (gameOver) return resetGame()

    const now = Date.now()
    if (now - lastJumpTime.current < 500) return
    lastJumpTime.current = now

    if (!isJumping) {
      setPlayerVelocity(prev => ({ ...prev, y: JUMP_FORCE }))
      setIsJumping(true)
      setDoubleJumpAvailable(true)
    } else if (doubleJumpAvailable) {
      setPlayerVelocity(prev => ({ ...prev, y: JUMP_FORCE * 0.8 }))
      setDoubleJumpAvailable(false)
    }
  }

  const toggleHandControl = () => setHandControlEnabled(prev => !prev)

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateTime.current) / (1000 / 60)
      lastUpdateTime.current = now

      setGameSpeed(prev => Math.min(MAX_GAME_SPEED, prev + SPEED_INCREMENT * deltaTime))

      if (now - lastObstacleTime.current > nextObstacleTime.current) {
        const obstacleType = getRandomObstacleType()
        const { width, height } = getRandomObstacleSize(obstacleType)

        setObstacles(prev => [
          ...prev,
          {
            id: obstacleIdCounter.current++,
            x: gameSize.width,
            y: groundY - height,
            width,
            height,
            type: obstacleType,
            passed: false,
          },
        ])

        lastObstacleTime.current = now
        nextObstacleTime.current = getRandomObstacleInterval() / (gameSpeed / INITIAL_GAME_SPEED)
      }

      setPlayerPosition(prev => {
        let newVelocityY = playerVelocity.y + GRAVITY * deltaTime
        let newY = prev.y + newVelocityY * deltaTime

        if (newY >= groundY - 60) {
          newY = groundY - 60
          newVelocityY = 0
          setIsJumping(false)
          setDoubleJumpAvailable(false)
        }

        setPlayerVelocity(prev => ({ ...prev, y: newVelocityY }))
        return { ...prev, y: newY }
      })

      setObstacles(prev => prev
        .map(obstacle => ({
          ...obstacle,
          x: obstacle.x - gameSpeed * deltaTime,
          passed: obstacle.passed || obstacle.x + obstacle.width < playerPosition.x
        }))
        .filter(obstacle => obstacle.x + obstacle.width > 0)
      )

      obstacles.forEach(obstacle => {
        if (playerPosition.x + 40 > obstacle.x &&
          playerPosition.x < obstacle.x + obstacle.width &&
          playerPosition.y + 60 > obstacle.y &&
          playerPosition.y < obstacle.y + obstacle.height) {
          setGameOver(true)
          if (score > highScore) setHighScore(score)
        }
      })

      animationFrameId.current = requestAnimationFrame(gameLoop)
    }

    animationFrameId.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current)
    }
  }, [gameStarted, gameOver, playerVelocity, playerPosition, obstacles, gameSize, gameSpeed, score, highScore, groundY])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "ArrowUp" || e.key === "w") {
        e.preventDefault()
        jump()
      }
      if (e.key === "h") toggleHandControl()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isJumping, doubleJumpAvailable, gameStarted, gameOver])

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      jump()
    }

    const container = gameContainerRef.current
    container?.addEventListener("touchstart", handleTouchStart)
    return () => container?.removeEventListener("touchstart", handleTouchStart)
  }, [isJumping, doubleJumpAvailable, gameStarted, gameOver])

  return (
    <>
      <HandController onJump={jump} enabled={handControlEnabled} />
      
      <div
        ref={gameContainerRef}
        className="relative overflow-hidden rounded-lg shadow-lg"
        style={{
          width: `${gameSize.width}px`,
          height: `${gameSize.height}px`,
          backgroundColor: "#0f172a",
        }}
      >
        <Background width={gameSize.width} height={gameSize.height} gameSpeed={gameSpeed} />
        
        <div className="absolute bottom-0 w-full" style={{
          height: "50px",
          backgroundImage: "linear-gradient(to bottom, #1e293b, #0f172a)",
          borderTop: "2px solid #334155",
        }}></div>

        <Player
          x={playerPosition.x}
          y={playerPosition.y}
          isJumping={isJumping}
          doubleJumpAvailable={doubleJumpAvailable}
          size={60}
        />

        {obstacles.map(obstacle => (
          <Obstacle
            key={obstacle.id}
            x={obstacle.x}
            y={obstacle.y}
            width={obstacle.width}
            height={obstacle.height}
            type={obstacle.type}
          />
        ))}

        <GameUI
          score={score}
          highScore={highScore}
          gameSpeed={gameSpeed}
          width={gameSize.width}
          height={gameSize.height}
        />

        {!gameStarted && !gameOver && (
          <StartScreen onStart={startGame} width={gameSize.width} height={gameSize.height} />
        )}

        {gameOver && (
          <GameOver
            score={score}
            highScore={highScore}
            onRestart={resetGame}
            width={gameSize.width}
            height={gameSize.height}
          />
        )}

        <button 
          onClick={toggleHandControl}
          className="absolute top-4 right-4 px-2 py-1 text-xs bg-gray-800 text-white rounded z-10 opacity-70 hover:opacity-100"
        >
          {handControlEnabled ? 'Disable' : 'Enable'} Motion Control
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Space/Up/W or tap screen to jump</p>
        <p>Press H to toggle motion control</p>
      </div>
    </>
  )
}