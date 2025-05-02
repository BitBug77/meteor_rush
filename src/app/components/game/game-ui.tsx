interface GameUIProps {
  score: number
  highScore: number
  gameSpeed: number
  width: number
  height: number
}

export default function GameUI({ score, highScore, gameSpeed, width, height }: GameUIProps) {
  const scale = width / 1000

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Top UI */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        {/* Score */}
        <div className="bg-slate-800 bg-opacity-70 px-3 py-1 rounded-md">
          <div className="text-white font-bold" style={{ fontSize: `${16 * scale}px` }}>
            Score: {score}
          </div>
        </div>

        {/* High Score */}
        <div className="bg-slate-800 bg-opacity-70 px-3 py-1 rounded-md">
          <div className="text-white font-bold" style={{ fontSize: `${16 * scale}px` }}>
            Best: {highScore}
          </div>
        </div>
      </div>

      {/* Speed indicator */}
      <div className="absolute bottom-4 right-4 bg-slate-800 bg-opacity-70 px-3 py-1 rounded-md">
        <div className="text-white font-bold" style={{ fontSize: `${14 * scale}px` }}>
          Speed: {Math.floor(gameSpeed * 10)}
        </div>
      </div>
    </div>
  )
}
