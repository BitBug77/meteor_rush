import { Zap, Diamond } from "lucide-react"

interface CollectibleProps {
  x: number
  y: number
  type: string
  size: number
}

export default function Collectible({ x, y, type, size }: CollectibleProps) {
  return (
    <div
      className={`absolute z-10 flex items-center justify-center ${
        type === "coin" ? "animate-bounce" : type === "diamond" ? "animate-pulse" : "animate-float"
      }`}
      style={{
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        animationDuration: type === "coin" ? "1.5s" : "2s",
        animationDelay: `${Math.random() * 0.5}s`,
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
      }}
    >
      {type === "coin" && (
        <div className="w-full h-full rounded-full bg-yellow-400 border-2 border-yellow-600 shadow-md flex items-center justify-center">
          <div className="w-1/2 h-1/2 rounded-full bg-yellow-300"></div>
        </div>
      )}

      {type === "diamond" && (
        <div className="w-full h-full flex items-center justify-center">
          <Diamond size={size} className="text-blue-400" fill="#60a5fa" />
        </div>
      )}

      {type === "lightning" && (
        <div className="w-full h-full flex items-center justify-center">
          <Zap size={size} className="text-yellow-400" fill="#facc15" />
        </div>
      )}
    </div>
  )
}
