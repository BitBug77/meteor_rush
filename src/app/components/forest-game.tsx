"use client"

import { useState, useEffect, useRef } from "react"
import Background from "./game/background"
import Platform from "./game/platform"
import Character from "./game/character"
import Collectible from "./game/collectible"
import Enemy from "./game/enemy"
import GameUI from "./game/game-ui"
import GameOver from "./game/game-over"
import LevelComplete from "./game/level-complete"
import { useWindowSize } from "@/hooks/use-window-size"

// Game constants
const GRAVITY = 0.6
const JUMP_FORCE = -15
const MOVEMENT_SPEED = 5
const MAX_JUMP_HEIGHT = 200
const WALL_JUMP_FORCE_X = 8
const WALL_JUMP_FORCE_Y = -12
const DASH_FORCE = 15
const DASH_DURATION = 10
const DASH_COOLDOWN = 60

export default function ForestGame() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const [gameSize, setGameSize] = useState({ width: 1000, height: 600 })
  const [playerPosition, setPlayerPosition] = useState({ x: 150, y: 300 })
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 })
  const [isJumping, setIsJumping] = useState(false)
  const [isWallSliding, setIsWallSliding] = useState(false)
  const [wallSlideSide, setWallSlideSide] = useState<"left" | "right" | null>(null)
  const [isDashing, setIsDashing] = useState(false)
  const [dashCooldown, setDashCooldown] = useState(0)
  const [dashDirection, setDashDirection] = useState<"left" | "right">("right")
  const [dashTimer, setDashTimer] = useState(0)
  const [score, setScore] = useState(0)
  const [diamonds, setDiamonds] = useState(0)
  const [lightning, setLightning] = useState(0)
  const [health, setHealth] = useState(3)
  const [energy, setEnergy] = useState(100)
  const [playerName] = useState("FOREST RUNNER")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [levelComplete, setLevelComplete] = useState(false)
  const [autoRunning, setAutoRunning] = useState(false)
  const [jumpCount, setJumpCount] = useState(0)
  const [jumpStartY, setJumpStartY] = useState(0)
  const [cameraOffset, setCameraOffset] = useState(0)
  const lastUpdateTime = useRef(Date.now())
  const [currentLevel, setCurrentLevel] = useState(1)
  const [showControls, setShowControls] = useState(true)

  // Level data
  const levels = [
    {
      // Level 1
      platforms: [
        { id: 1, x: 0, y: 450, width: 400, height: 50, type: "ground" },
        { id: 2, x: 600, y: 450, width: 400, height: 50, type: "ground" },
        { id: 3, x: 450, y: 350, width: 100, height: 20, type: "platform" },
        { id: 4, x: 600, y: 250, width: 100, height: 20, type: "platform" },
        { id: 5, x: 800, y: 300, width: 100, height: 20, type: "platform" },
        { id: 6, x: 1100, y: 450, width: 400, height: 50, type: "ground" },
        { id: 7, x: 1300, y: 350, width: 100, height: 20, type: "platform" },
        { id: 8, x: 1500, y: 450, width: 200, height: 50, type: "ground" },
        { id: 9, x: 1800, y: 450, width: 400, height: 50, type: "finish" },
      ],
      dangerZones: [
        { id: 1, x: 400, y: 450, width: 200, height: 150, type: "water" },
        { id: 2, x: 1000, y: 450, width: 100, height: 150, type: "water" },
        { id: 3, x: 1700, y: 450, width: 100, height: 150, type: "water" },
      ],
      enemies: [
        { id: 1, x: 450, y: 430, width: 100, height: 20, type: "crocodile" },
        { id: 2, x: 1200, y: 430, width: 100, height: 20, type: "crocodile" },
        { id: 3, x: 1600, y: 430, width: 100, height: 20, type: "crocodile" },
      ],
      collectibles: [
        { id: 1, type: "coin", x: 300, y: 350, collected: false },
        { id: 2, type: "coin", x: 350, y: 350, collected: false },
        { id: 3, type: "coin", x: 400, y: 250, collected: false },
        { id: 4, type: "coin", x: 450, y: 300, collected: false },
        { id: 5, type: "coin", x: 500, y: 250, collected: false },
        { id: 6, type: "coin", x: 700, y: 350, collected: false },
        { id: 7, type: "coin", x: 750, y: 350, collected: false },
        { id: 8, type: "coin", x: 800, y: 250, collected: false },
        { id: 9, type: "diamond", x: 600, y: 200, collected: false },
        { id: 10, type: "lightning", x: 850, y: 250, collected: false },
        { id: 11, type: "coin", x: 1100, y: 350, collected: false },
        { id: 12, type: "coin", x: 1200, y: 350, collected: false },
        { id: 13, type: "coin", x: 1300, y: 300, collected: false },
        { id: 14, type: "diamond", x: 1400, y: 300, collected: false },
        { id: 15, type: "lightning", x: 1600, y: 350, collected: false },
        { id: 16, type: "diamond", x: 1900, y: 350, collected: false },
      ],
    },
    // Add more levels here
  ]

  const [platforms, setPlatforms] = useState(levels[0].platforms)
  const [dangerZones, setDangerZones] = useState(levels[0].dangerZones)
  const [enemies, setEnemies] = useState(levels[0].enemies)
  const [collectibles, setCollectibles] = useState(levels[0].collectibles)

  const windowSize = useWindowSize()

  // Resize game container based on window size
  useEffect(() => {
    if (!gameContainerRef.current || !windowSize.width) return

    const aspectRatio = 1000 / 600
    let newWidth, newHeight

    // For mobile devices in portrait mode
    if (windowSize.width < windowSize.height && windowSize.width < 768) {
      newWidth = windowSize.width - 16 // Less padding on mobile
      newHeight = newWidth / aspectRatio

      // If the height is too tall for the screen, adjust it
      if (newHeight > windowSize.height - 100) {
        newHeight = windowSize.height - 100
        newWidth = newHeight * aspectRatio
      }
    }
    // For landscape and desktop
    else {
      newWidth = Math.min(windowSize.width - 32, 1000)
      newHeight = newWidth / aspectRatio

      // If the height is too tall for the screen, adjust it
      if (newHeight > windowSize.height - 64) {
        newHeight = windowSize.height - 64
        newWidth = newHeight * aspectRatio
      }
    }

    setGameSize({ width: newWidth, height: newHeight })
  }, [windowSize])

  // Function to check for obstacles ahead
  const checkForObstaclesAhead = (playerX: number, playerY: number, distance: number) => {
    const scaleFactor = gameSize.width / 1000

    // Check for water ahead
    for (const zone of dangerZones) {
      const scaledX = zone.x * scaleFactor
      const scaledY = zone.y * scaleFactor
      const scaledWidth = zone.width * scaleFactor

      if (playerX + distance > scaledX && playerX < scaledX + scaledWidth && playerY + 60 > scaledY && !isJumping) {
        return true
      }
    }

    // Check for gaps between platforms
    let onPlatformAhead = false
    for (const platform of platforms) {
      const scaledX = platform.x * scaleFactor
      const scaledY = platform.y * scaleFactor
      const scaledWidth = platform.width * scaleFactor

      if (
        playerX + distance > scaledX &&
        playerX + distance < scaledX + scaledWidth &&
        playerY + 60 >= scaledY - 10 &&
        playerY + 60 <= scaledY + 10
      ) {
        onPlatformAhead = true
        break
      }
    }

    // If there's no platform ahead within jump distance, we need to jump
    return !onPlatformAhead
  }

  // Reset game function
  const resetGame = () => {
    setPlayerPosition({ x: 150, y: 300 })
    setPlayerVelocity({ x: 0, y: 0 })
    setIsJumping(false)
    setIsWallSliding(false)
    setWallSlideSide(null)
    setIsDashing(false)
    setDashCooldown(0)
    setDashTimer(0)
    setScore(0)
    setDiamonds(0)
    setLightning(0)
    setHealth(3)
    setEnergy(100)
    setGameOver(false)
    setLevelComplete(false)
    setAutoRunning(false)
    setJumpCount(0)
    setCameraOffset(0)
    setCollectibles(levels[currentLevel - 1].collectibles.map((c) => ({ ...c, collected: false })))
  }

  // Load level function
  const loadLevel = (level: number) => {
    if (level > levels.length) {
      // Game completed
      return
    }

    const levelIndex = level - 1
    setPlatforms(levels[levelIndex].platforms)
    setDangerZones(levels[levelIndex].dangerZones)
    setEnemies(levels[levelIndex].enemies)
    setCollectibles(levels[levelIndex].collectibles)
    setCurrentLevel(level)
    setPlayerPosition({ x: 150, y: 300 })
    setPlayerVelocity({ x: 0, y: 0 })
    setIsJumping(false)
    setIsWallSliding(false)
    setWallSlideSide(null)
    setIsDashing(false)
    setDashCooldown(0)
    setDashTimer(0)
    setLevelComplete(false)
    setCameraOffset(0)
  }

  // Start auto-running
  const startAutoRun = () => {
    if (!gameStarted) {
      setGameStarted(true)
    }

    if (!autoRunning && !gameOver && !levelComplete) {
      setAutoRunning(true)
      setPlayerVelocity((prev) => ({ ...prev, x: MOVEMENT_SPEED }))
    }
  }

  // Perform dash
  const performDash = () => {
    if (dashCooldown === 0 && !isDashing && energy >= 30) {
      setIsDashing(true)
      setDashTimer(DASH_DURATION)
      setEnergy((prev) => prev - 30)

      // Set dash direction based on current movement or facing direction
      const direction = playerVelocity.x < 0 ? "left" : "right"
      setDashDirection(direction)

      // Apply dash force
      setPlayerVelocity((prev) => ({
        ...prev,
        x: direction === "left" ? -DASH_FORCE : DASH_FORCE,
      }))
    }
  }

  // Game loop
  useEffect(() => {
    if (gameOver || levelComplete) return

    const gameLoop = () => {
      const now = Date.now()
      const deltaTime = (now - lastUpdateTime.current) / (1000 / 60) // Normalize to 60 FPS
      lastUpdateTime.current = now

      // Handle dash cooldown
      if (dashCooldown > 0) {
        setDashCooldown((prev) => Math.max(0, prev - 1))
      }

      // Handle dash timer
      if (isDashing) {
        setDashTimer((prev) => {
          if (prev <= 0) {
            setIsDashing(false)
            setDashCooldown(DASH_COOLDOWN)
            return 0
          }
          return prev - 1
        })
      }

      // Apply gravity if not dashing
      if (!isDashing) {
        setPlayerVelocity((prev) => ({
          ...prev,
          y: isWallSliding ? Math.min(prev.y + GRAVITY * 0.4, 4) : prev.y + GRAVITY * Math.min(deltaTime, 2),
        }))
      }

      // Auto-jump logic when in auto-run mode
      if (autoRunning && !isJumping && !isDashing) {
        const shouldJump = checkForObstaclesAhead(playerPosition.x, playerPosition.y, 100 * (gameSize.width / 1000))

        if (shouldJump) {
          setPlayerVelocity((prev) => ({ ...prev, y: JUMP_FORCE }))
          setIsJumping(true)
          setJumpStartY(playerPosition.y)
          setJumpCount(1)
        }
      }

      // Update player position with smooth interpolation
      setPlayerPosition((prev) => {
        // Calculate new position with smooth movement
        let newX = prev.x

        if (isDashing) {
          // During dash, maintain dash velocity
          newX = prev.x + playerVelocity.x * Math.min(deltaTime, 2)
        } else if (autoRunning) {
          newX = prev.x + playerVelocity.x * Math.min(deltaTime, 2)
        } else {
          newX = prev.x + playerVelocity.x * Math.min(deltaTime, 2)
        }

        // Calculate new Y position
        let newY = prev.y + playerVelocity.y * Math.min(deltaTime, 2)

        // Limit jump height
        if (isJumping && playerVelocity.y < 0 && jumpStartY - newY > MAX_JUMP_HEIGHT * (gameSize.height / 600)) {
          setPlayerVelocity((prev) => ({ ...prev, y: 0 })) // Stop upward movement
          newY = jumpStartY - MAX_JUMP_HEIGHT * (gameSize.height / 600)
        }

        // Reset wall sliding state
        let newWallSliding = false
        let newWallSlideSide: "left" | "right" | null = null

        // Check platform collisions
        let onPlatform = false
        for (const platform of platforms) {
          const scaleFactor = gameSize.width / 1000
          const scaledX = platform.x * scaleFactor - cameraOffset
          const scaledY = platform.y * scaleFactor
          const scaledWidth = platform.width * scaleFactor
          const scaledHeight = platform.height * scaleFactor

          // Check if landing on platform
          if (
            newX + 30 > scaledX &&
            newX < scaledX + scaledWidth &&
            newY + 60 > scaledY &&
            newY + 60 < scaledY + scaledHeight / 2 &&
            playerVelocity.y > 0
          ) {
            newY = scaledY - 60
            setPlayerVelocity((prev) => ({ ...prev, y: 0 }))
            setIsJumping(false)
            setJumpCount(0)
            onPlatform = true

            // Check if this is the finish platform
            if (platform.type === "finish") {
              setLevelComplete(true)
            }

            break
          }

          // Check for wall sliding (left wall)
          if (
            !isDashing &&
            newY + 30 > scaledY &&
            newY < scaledY + scaledHeight &&
            newX - 5 < scaledX + scaledWidth &&
            newX - 5 > scaledX + scaledWidth - 10 &&
            playerVelocity.x < 0
          ) {
            newX = scaledX + scaledWidth + 5
            newWallSliding = true
            newWallSlideSide = "right"
            setPlayerVelocity((prev) => ({ ...prev, x: 0 }))
          }

          // Check for wall sliding (right wall)
          if (
            !isDashing &&
            newY + 30 > scaledY &&
            newY < scaledY + scaledHeight &&
            newX + 35 > scaledX &&
            newX + 35 < scaledX + 10 &&
            playerVelocity.x > 0
          ) {
            newX = scaledX - 35
            newWallSliding = true
            newWallSlideSide = "left"
            setPlayerVelocity((prev) => ({ ...prev, x: 0 }))
          }
        }

        // Update wall sliding state
        setIsWallSliding(newWallSliding)
        setWallSlideSide(newWallSlideSide)

        // Check collectible collisions
        setCollectibles((prev) =>
          prev.map((collectible) => {
            if (collectible.collected) return collectible

            const scaleFactor = gameSize.width / 1000
            const scaledX = collectible.x * scaleFactor - cameraOffset
            const scaledY = collectible.y * scaleFactor

            if (newX + 30 > scaledX - 15 && newX < scaledX + 15 && newY + 30 > scaledY - 15 && newY < scaledY + 15) {
              // Handle collectible
              if (collectible.type === "coin") {
                setScore((prev) => prev + 10)
              } else if (collectible.type === "diamond") {
                setDiamonds((prev) => prev + 1)
                setScore((prev) => prev + 50)
              } else if (collectible.type === "lightning") {
                setLightning((prev) => prev + 1)
                setEnergy((prev) => Math.min(100, prev + 30))
                setScore((prev) => prev + 30)
              }
              return { ...collectible, collected: true }
            }
            return collectible
          }),
        )

        // Check danger zone collisions
        for (const zone of dangerZones) {
          const scaleFactor = gameSize.width / 1000
          const scaledX = zone.x * scaleFactor - cameraOffset
          const scaledY = zone.y * scaleFactor
          const scaledWidth = zone.width * scaleFactor
          const scaledHeight = zone.height * scaleFactor

          if (
            newX + 30 > scaledX &&
            newX < scaledX + scaledWidth &&
            newY + 60 > scaledY &&
            newY < scaledY + scaledHeight &&
            zone.type === "water" &&
            !isDashing // Immune to water during dash
          ) {
            // Player touched water
            setHealth((prev) => {
              const newHealth = prev - 1
              if (newHealth <= 0) {
                setGameOver(true)
                setAutoRunning(false)
              }
              return newHealth
            })

            // Bounce back from water
            newY = scaledY - 60
            setPlayerVelocity((prev) => ({ ...prev, y: JUMP_FORCE * 0.7 }))
            setIsJumping(true)
            break
          }
        }

        // Check enemy collisions
        for (const enemy of enemies) {
          const scaleFactor = gameSize.width / 1000
          const scaledX = enemy.x * scaleFactor - cameraOffset
          const scaledY = enemy.y * scaleFactor
          const scaledWidth = enemy.width * scaleFactor
          const scaledHeight = enemy.height * scaleFactor

          if (
            newX + 30 > scaledX &&
            newX < scaledX + scaledWidth &&
            newY + 60 > scaledY &&
            newY < scaledY + scaledHeight &&
            !isDashing // Immune to enemies during dash
          ) {
            // Player touched enemy
            setHealth((prev) => {
              const newHealth = prev - 1
              if (newHealth <= 0) {
                setGameOver(true)
                setAutoRunning(false)
              }
              return newHealth
            })

            // Bounce back from enemy
            setPlayerVelocity((prev) => ({
              x: prev.x > 0 ? -5 : 5,
              y: JUMP_FORCE * 0.7,
            }))
            setIsJumping(true)
            break
          }
        }

        // Boundary check - falling off the bottom
        if (newY > gameSize.height) {
          setHealth((prev) => {
            const newHealth = prev - 1
            if (newHealth <= 0) {
              setGameOver(true)
              setAutoRunning(false)
            } else {
              // Respawn
              newX = 150
              newY = 300
              setPlayerVelocity({ x: 0, y: 0 })
              setCameraOffset(0)
            }
            return newHealth
          })
        }

        // Update camera offset for scrolling (only when player moves past 40% of screen width)
        if (newX > gameSize.width * 0.4 && autoRunning) {
          const newOffset = cameraOffset + (newX - gameSize.width * 0.4)
          setCameraOffset(newOffset)
          newX = gameSize.width * 0.4
        }

        return { x: newX, y: newY }
      })

      // Slowly regenerate energy over time
      if (!isDashing && dashCooldown === 0) {
        setEnergy((prev) => Math.min(100, prev + 0.1))
      }

      if (!gameOver && !levelComplete) {
        requestAnimationFrame(gameLoop)
      }
    }

    const animationId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationId)
  }, [
    playerVelocity,
    playerPosition,
    gameSize,
    isJumping,
    autoRunning,
    gameOver,
    jumpStartY,
    isWallSliding,
    isDashing,
    dashCooldown,
    dashDirection,
    cameraOffset,
    levelComplete,
  ])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hide controls after first input
      setShowControls(false)

      if (gameOver) {
        if (e.key === "Enter" || e.key === " ") {
          resetGame()
        }
        return
      }

      if (levelComplete) {
        if (e.key === "Enter" || e.key === " ") {
          loadLevel(currentLevel + 1)
        }
        return
      }

      if (e.key === " ") {
        // Start auto-running when spacebar is pressed
        startAutoRun()

        // Jump if not already jumping or perform wall jump if wall sliding
        if (isWallSliding) {
          // Wall jump
          setIsWallSliding(false)
          setIsJumping(true)
          setJumpCount(1)
          setJumpStartY(playerPosition.y)
          setPlayerVelocity({
            x: wallSlideSide === "left" ? WALL_JUMP_FORCE_X : -WALL_JUMP_FORCE_X,
            y: WALL_JUMP_FORCE_Y,
          })
        } else if (!isJumping) {
          // Normal jump
          setPlayerVelocity((prev) => ({ ...prev, y: JUMP_FORCE }))
          setIsJumping(true)
          setJumpStartY(playerPosition.y)
          setJumpCount(1)
        } else if (jumpCount < 2) {
          // Double jump
          setPlayerVelocity((prev) => ({ ...prev, y: JUMP_FORCE * 0.9 }))
          setJumpCount(2)
        }

        // Prevent default space bar behavior (page scrolling)
        e.preventDefault()
      }

      // Manual controls
      if (e.key === "ArrowLeft" || e.key === "a") {
        setPlayerVelocity((prev) => ({ ...prev, x: -MOVEMENT_SPEED }))
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        setPlayerVelocity((prev) => ({ ...prev, x: MOVEMENT_SPEED }))
      }
      if ((e.key === "ArrowUp" || e.key === "w") && !isJumping) {
        setPlayerVelocity((prev) => ({ ...prev, y: JUMP_FORCE }))
        setIsJumping(true)
        setJumpStartY(playerPosition.y)
        setJumpCount(1)
      }

      // Dash with Shift
      if (e.key === "Shift") {
        performDash()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!autoRunning) {
        if ((e.key === "ArrowLeft" || e.key === "a") && playerVelocity.x < 0) {
          setPlayerVelocity((prev) => ({ ...prev, x: 0 }))
        }
        if ((e.key === "ArrowRight" || e.key === "d") && playerVelocity.x > 0) {
          setPlayerVelocity((prev) => ({ ...prev, x: 0 }))
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [
    isJumping,
    playerVelocity.x,
    autoRunning,
    gameOver,
    playerPosition.y,
    isWallSliding,
    wallSlideSide,
    jumpCount,
    levelComplete,
    currentLevel,
  ])

  // Touch controls for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()

      // Hide controls after first input
      setShowControls(false)

      if (gameOver) {
        resetGame()
        return
      }

      if (levelComplete) {
        loadLevel(currentLevel + 1)
        return
      }

      const touch = e.touches[0]
      const gameRect = gameContainerRef.current?.getBoundingClientRect()

      if (!gameRect) return

      const touchX = touch.clientX - gameRect.left
      const touchY = touch.clientY - gameRect.top

      // Start auto-running on first touch
      startAutoRun()

      // Bottom right corner - dash
      if (touchX > gameRect.width * 0.7 && touchY > gameRect.height * 0.7) {
        performDash()
        return
      }

      // Jump on touch
      if (!isJumping) {
        setPlayerVelocity((prev) => ({ ...prev, y: JUMP_FORCE }))
        setIsJumping(true)
        setJumpStartY(playerPosition.y)
        setJumpCount(1)
      } else if (jumpCount < 2) {
        // Double jump
        setPlayerVelocity((prev) => ({ ...prev, y: JUMP_FORCE * 0.9 }))
        setJumpCount(2)
      }
    }

    if (gameContainerRef.current) {
      gameContainerRef.current.addEventListener("touchstart", handleTouchStart)
    }

    return () => {
      if (gameContainerRef.current) {
        gameContainerRef.current.removeEventListener("touchstart", handleTouchStart)
      }
    }
  }, [isJumping, gameOver, playerPosition.y, jumpCount, levelComplete, currentLevel])

  return (
    <>
      <div
        ref={gameContainerRef}
        className="relative overflow-hidden rounded-lg shadow-lg"
        style={{
          width: `${gameSize.width}px`,
          height: `${gameSize.height}px`,
          backgroundColor: "#87CEEB", // Sky blue background
        }}
      >
        {/* Game background */}
        <Background width={gameSize.width} height={gameSize.height} />

        {/* Platforms */}
        {platforms.map((platform) => (
          <Platform
            key={platform.id}
            x={platform.x * (gameSize.width / 1000) - cameraOffset}
            y={platform.y * (gameSize.height / 600)}
            width={platform.width * (gameSize.width / 1000)}
            height={platform.height * (gameSize.height / 600)}
            type={platform.type}
          />
        ))}

        {/* Water and danger zones */}
        {dangerZones.map((zone) => (
          <div
            key={zone.id}
            className="absolute"
            style={{
              left: `${zone.x * (gameSize.width / 1000) - cameraOffset}px`,
              top: `${zone.y * (gameSize.height / 600)}px`,
              width: `${zone.width * (gameSize.width / 1000)}px`,
              height: `${zone.height * (gameSize.height / 600)}px`,
              backgroundColor: "#4FA4DE",
              borderTop: "4px solid #7CBAE7",
              overflow: "hidden",
            }}
          >
            {/* Water animation */}
            <div className="absolute inset-0 opacity-30">
              <div
                className="absolute w-full h-2 bg-white animate-[wave_2s_ease-in-out_infinite]"
                style={{ top: "10%" }}
              ></div>
              <div
                className="absolute w-full h-2 bg-white animate-[wave_2.5s_ease-in-out_infinite]"
                style={{ top: "30%" }}
              ></div>
              <div
                className="absolute w-full h-2 bg-white animate-[wave_1.8s_ease-in-out_infinite]"
                style={{ top: "50%" }}
              ></div>
              <div
                className="absolute w-full h-2 bg-white animate-[wave_2.2s_ease-in-out_infinite]"
                style={{ top: "70%" }}
              ></div>
            </div>

            {/* Underwater plants */}
            <div className="absolute bottom-0 left-1/4 w-4 h-16 bg-green-700 rounded-t-full"></div>
            <div className="absolute bottom-0 left-2/3 w-4 h-20 bg-green-600 rounded-t-full"></div>
            <div className="absolute bottom-0 right-1/4 w-4 h-12 bg-green-800 rounded-t-full"></div>

            {/* Treasure chest */}
            <div className="absolute bottom-2 right-8 w-10 h-8 bg-yellow-800 border-2 border-yellow-600 rounded"></div>
          </div>
        ))}

        {/* Enemies */}
        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            x={enemy.x * (gameSize.width / 1000) - cameraOffset}
            y={enemy.y * (gameSize.height / 600)}
            width={enemy.width * (gameSize.width / 1000)}
            height={enemy.height * (gameSize.height / 600)}
            type={enemy.type}
          />
        ))}

        {/* Collectibles */}
        {collectibles
          .filter((c) => !c.collected)
          .map((collectible) => (
            <Collectible
              key={collectible.id}
              x={collectible.x * (gameSize.width / 1000) - cameraOffset}
              y={collectible.y * (gameSize.height / 600)}
              type={collectible.type}
              size={30 * (gameSize.width / 1000)}
            />
          ))}

        {/* Player character */}
        <Character
          x={playerPosition.x}
          y={playerPosition.y}
          isJumping={isJumping}
          isWallSliding={isWallSliding}
          wallSlideSide={wallSlideSide}
          isDashing={isDashing}
          dashDirection={dashDirection}
          direction={playerVelocity.x < 0 ? "left" : "right"}
          size={60 * (gameSize.width / 1000)}
        />

        {/* Game UI */}
        <GameUI
          playerName={playerName}
          health={health}
          energy={energy}
          diamonds={diamonds}
          lightning={lightning}
          score={score}
          width={gameSize.width}
          height={gameSize.height}
          dashCooldown={dashCooldown}
          maxDashCooldown={DASH_COOLDOWN}
        />

        {/* Game start instructions */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-4 rounded-lg text-center">
              <h2 className="text-xl font-bold mb-2">Forest Runner</h2>
              <p className="mb-4">Press SPACE to start running and jump!</p>
              <p className="text-sm text-gray-600">Avoid obstacles and collect items</p>
              <p className="text-sm text-gray-600 mt-2">Press SHIFT to dash</p>
            </div>
          </div>
        )}

        {/* Controls overlay */}
        {showControls && gameStarted && !gameOver && !levelComplete && (
          <div className="absolute inset-0 pointer-events-none z-40">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 text-white p-4 rounded-lg text-center">
              <p className="mb-2">SPACE / TAP - Jump (double tap for double jump)</p>
              <p className="mb-2">SHIFT / BOTTOM RIGHT - Dash</p>
              <p className="text-sm opacity-70">Press any key to dismiss</p>
            </div>
          </div>
        )}

        {/* Game over screen */}
        {gameOver && (
          <GameOver
            score={score}
            diamonds={diamonds}
            onRestart={resetGame}
            width={gameSize.width}
            height={gameSize.height}
          />
        )}

        {/* Level complete screen */}
        {levelComplete && (
          <LevelComplete
            level={currentLevel}
            score={score}
            diamonds={diamonds}
            onNextLevel={() => loadLevel(currentLevel + 1)}
            width={gameSize.width}
            height={gameSize.height}
          />
        )}
      </div>

      {windowSize.width && windowSize.width < 768 && !gameOver && !gameStarted && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Tap the screen to start and jump</p>
          <p>Tap bottom right to dash</p>
        </div>
      )}
    </>
  )
}
