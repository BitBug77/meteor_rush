interface PlatformProps {
  x: number
  y: number
  width: number
  height: number
  type: string
}

export default function Platform({ x, y, width, height, type }: PlatformProps) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: type === "ground" ? "#8B4513" : "#A0522D", // Brown colors
        borderTop: type === "ground" ? "8px solid #A0522D" : "4px solid #CD853F",
        borderRadius: type === "platform" ? "4px" : "0",
        zIndex: 10,
      }}
    >
      {/* Circular texture patterns */}
      {type === "ground" &&
        Array.from({ length: Math.floor(width / 20) }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-opacity-20 bg-yellow-900"
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * width}px`,
              top: `${Math.random() * height * 0.7 + height * 0.2}px`,
            }}
          />
        ))}
    </div>
  )
}
