interface CharacterProps {
  x: number
  y: number
  isJumping: boolean
  isWallSliding: boolean
  wallSlideSide: "left" | "right" | null
  isDashing: boolean
  dashDirection: "left" | "right"
  direction: "left" | "right"
  size: number
}

export default function Character({
  x,
  y,
  isJumping,
  isWallSliding,
  wallSlideSide,
  isDashing,
  dashDirection,
  direction,
  size,
}: CharacterProps) {
  return (
    <svg
      className={`absolute z-20 ${isDashing ? "animate-pulse" : ""}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: direction === "left" ? "scaleX(-1)" : "none",
        filter: isDashing
          ? "drop-shadow(0 0 8px rgba(255,215,0,0.7))"
          : isJumping
            ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            : "none",
        transition: "transform 0.1s ease-out", // Smooth rotation
      }}
      viewBox="0 0 60 60"
    >
      {/* Simple stick figure character */}
      <g>
        {/* Head */}
        <circle cx="30" cy="15" r="10" fill={isDashing ? "#FFD700" : "#333"} />

        {/* Body */}
        <line x1="30" y1="25" x2="30" y2="40" stroke={isDashing ? "#FFD700" : "#333"} strokeWidth="4" />

        {/* Arms - different poses based on state */}
        {isWallSliding ? (
          // Wall sliding pose
          <>
            <line
              x1="30"
              y1="30"
              x2={wallSlideSide === "left" ? "40" : "20"}
              y2="25"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="30"
              x2={wallSlideSide === "left" ? "40" : "20"}
              y2="35"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : isDashing ? (
          // Dashing pose
          <>
            <line
              x1="30"
              y1="30"
              x2={dashDirection === "right" ? "45" : "15"}
              y2="30"
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="30"
              x2={dashDirection === "right" ? "40" : "20"}
              y2="20"
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : isJumping ? (
          // Jumping pose
          <>
            <line
              x1="30"
              y1="30"
              x2="45"
              y2="15"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="30"
              x2="15"
              y2="15"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : (
          // Running pose
          <>
            <line
              x1="30"
              y1="30"
              x2="20"
              y2="30"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="30"
              x2="40"
              y2="30"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Legs - different poses based on state */}
        {isWallSliding ? (
          // Wall sliding legs
          <>
            <line
              x1="30"
              y1="40"
              x2={wallSlideSide === "left" ? "20" : "40"}
              y2="50"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="40"
              x2={wallSlideSide === "left" ? "25" : "35"}
              y2="55"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : isDashing ? (
          // Dashing legs
          <>
            <line
              x1="30"
              y1="40"
              x2={dashDirection === "right" ? "15" : "45"}
              y2="45"
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="40"
              x2={dashDirection === "right" ? "20" : "40"}
              y2="50"
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : isJumping ? (
          // Jumping legs
          <>
            <line
              x1="30"
              y1="40"
              x2="15"
              y2="45"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="40"
              x2="45"
              y2="45"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        ) : (
          // Running legs
          <>
            <line
              x1="30"
              y1="40"
              x2="25"
              y2="55"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="40"
              x2="35"
              y2="55"
              stroke={isDashing ? "#FFD700" : "#333"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Add motion lines when dashing */}
        {isDashing && (
          <>
            <line
              x1={dashDirection === "right" ? "10" : "50"}
              y1="15"
              x2={dashDirection === "right" ? "0" : "60"}
              y2="15"
              stroke="#FFD700"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <line
              x1={dashDirection === "right" ? "10" : "50"}
              y1="30"
              x2={dashDirection === "right" ? "0" : "60"}
              y2="30"
              stroke="#FFD700"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            <line
              x1={dashDirection === "right" ? "10" : "50"}
              y1="45"
              x2={dashDirection === "right" ? "0" : "60"}
              y2="45"
              stroke="#FFD700"
              strokeWidth="2"
              strokeDasharray="4,4"
            />
          </>
        )}

        {/* Add motion lines when jumping */}
        {isJumping && !isDashing && (
          <>
            <line x1="20" y1="55" x2="15" y2="60" stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="40" y1="55" x2="45" y2="60" stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="30" y1="55" x2="30" y2="60" stroke="#333" strokeWidth="1" strokeDasharray="2,2" />
          </>
        )}
      </g>
    </svg>
  )
}
