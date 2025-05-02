interface EnemyProps {
  x: number
  y: number
  width: number
  height: number
  type: string
}

export default function Enemy({ x, y, width, height, type }: EnemyProps) {
  if (type === "crocodile") {
    return (
      <div
        className="absolute z-15"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <svg width={width} height={height} viewBox="0 0 100 20" className="overflow-visible">
          {/* Crocodile body */}
          <rect x="10" y="0" width="80" height="15" rx="5" fill="#2E8B57" />

          {/* Crocodile head */}
          <path d="M10,7.5 L0,2 V13 Z" fill="#2E8B57" />

          {/* Crocodile eyes */}
          <circle cx="15" cy="5" r="2" fill="white" />
          <circle cx="15" cy="5" r="1" fill="black" />

          {/* Crocodile back spikes */}
          <path
            d="M20,0 L25,5 L30,0 L35,5 L40,0 L45,5 L50,0 L55,5 L60,0 L65,5 L70,0 L75,5 L80,0"
            fill="none"
            stroke="#1D6E42"
            strokeWidth="1"
          />

          {/* Crocodile tail */}
          <path d="M90,7.5 L100,0 V15 Z" fill="#2E8B57" />
        </svg>

        {/* Animated water ripples */}
        <div className="absolute -top-2 left-1/4 w-2 h-2 rounded-full bg-white opacity-50 animate-ping"></div>
        <div
          className="absolute -top-2 left-2/3 w-2 h-2 rounded-full bg-white opacity-50 animate-ping"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>
    )
  }

  return null
}
