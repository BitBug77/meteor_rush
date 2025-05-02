interface PlayerProps {
  x: number
  y: number
  isJumping: boolean
  doubleJumpAvailable: boolean
  size: number
}

export default function Player({ x, y, isJumping, doubleJumpAvailable, size }: PlayerProps) {
  return (
    <div
      className={`absolute z-20 ${isJumping ? "animate-pulse" : ""}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transition: "transform 0.1s ease-out",
      }}
    >
      {/* Spaceship/Player */}
      <svg width={size} height={size} viewBox="0 0 60 60" className="drop-shadow-lg">
        {/* Main body */}
        <path d="M10,30 L25,15 L50,25 L50,35 L25,45 L10,30 Z" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />

        {/* Cockpit */}
        <circle cx="30" cy="30" r="8" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1" />

        {/* Engine flames */}
        <g className={isJumping ? "animate-pulse" : ""}>
          <path d="M10,30 L5,27 L2,30 L5,33 L10,30 Z" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          <path
            d="M5,27 L0,25 L-2,30 L0,35 L5,33 Z"
            fill="#f59e0b"
            className="animate-pulse"
            style={{ animationDuration: "0.3s" }}
          />
        </g>

        {/* Wings */}
        <path d="M25,15 L20,5 L30,10 L25,15 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />
        <path d="M25,45 L20,55 L30,50 L25,45 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" />

        {/* Double jump indicator */}
        {doubleJumpAvailable && (
          <circle
            cx="30"
            cy="30"
            r="15"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-spin"
            style={{ animationDuration: "3s" }}
          />
        )}
      </svg>
    </div>
  )
}
