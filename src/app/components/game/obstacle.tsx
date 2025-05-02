interface ObstacleProps {
  x: number
  y: number
  width: number
  height: number
  type: string
}

export default function Obstacle({ x, y, width, height, type }: ObstacleProps) {
  return (
    <div
      className="absolute z-10"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {type === "meteor" && (
        <svg width={width} height={height} viewBox="0 0 50 50" className="drop-shadow-md">
          <circle cx="25" cy="25" r="20" fill="#f97316" />
          <circle cx="15" cy="15" r="5" fill="#fdba74" />
          <circle cx="30" cy="20" r="3" fill="#fdba74" />
          <path
            d="M25,5 L35,15 L45,25 L35,35 L25,45 L15,35 L5,25 L15,15 Z"
            fill="none"
            stroke="#ea580c"
            strokeWidth="2"
            strokeDasharray="5,5"
            className="animate-spin"
            style={{ animationDuration: "10s" }}
          />
        </svg>
      )}

      {type === "satellite" && (
        <svg width={width} height={height} viewBox="0 0 100 40" className="drop-shadow-md">
          <rect x="30" y="15" width="40" height="10" fill="#64748b" stroke="#475569" strokeWidth="1" />
          <rect x="10" y="10" width="80" height="20" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
          <rect x="45" y="5" width="10" height="30" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
          <rect x="20" y="0" width="60" height="5" fill="#64748b" stroke="#475569" strokeWidth="1" />
          <rect x="20" y="35" width="60" height="5" fill="#64748b" stroke="#475569" strokeWidth="1" />
          <circle cx="50" cy="20" r="5" fill="#0ea5e9" stroke="#0284c7" strokeWidth="1" />
        </svg>
      )}

      {type === "asteroid" && (
        <svg width={width} height={height} viewBox="0 0 60 60" className="drop-shadow-md">
          <path
            d="M30,5 L40,10 L50,20 L55,30 L50,40 L40,50 L30,55 L20,50 L10,40 L5,30 L10,20 L20,10 Z"
            fill="#78716c"
            stroke="#57534e"
            strokeWidth="2"
          />
          <circle cx="20" cy="20" r="5" fill="#a8a29e" />
          <circle cx="35" cy="30" r="7" fill="#a8a29e" />
          <circle cx="25" cy="45" r="4" fill="#a8a29e" />
          <circle cx="40" cy="15" r="3" fill="#a8a29e" />
        </svg>
      )}

      {type === "spacejunk" && (
        <svg width={width} height={height} viewBox="0 0 80 50" className="drop-shadow-md">
          <rect x="10" y="10" width="60" height="30" fill="#475569" stroke="#334155" strokeWidth="1" rx="5" />
          <rect x="20" y="5" width="10" height="40" fill="#64748b" stroke="#475569" strokeWidth="1" />
          <rect x="50" y="5" width="10" height="40" fill="#64748b" stroke="#475569" strokeWidth="1" />
          <rect x="30" y="20" width="20" height="10" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
          <line x1="0" y1="25" x2="80" y2="25" stroke="#94a3b8" strokeWidth="1" strokeDasharray="5,5" />
        </svg>
      )}
    </div>
  )
}
