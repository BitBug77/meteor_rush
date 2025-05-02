"use client"

interface GameOverProps {
  score: number
  highScore: number
  onRestart: () => void
  width: number
  height: number
}

export default function GameOver({ score, highScore, onRestart, width, height }: GameOverProps) {
  const scale = width / 1000

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div
        className="bg-slate-800 rounded-lg shadow-lg p-6 text-center border-2 border-slate-600"
        style={{
          width: `${Math.min(400, width * 0.8)}px`,
          transform: `scale(${scale > 0.7 ? 1 : scale / 0.7})`,
        }}
      >
        <h2 className="text-2xl font-bold text-red-500 mb-4">Game Over!</h2>

        <div className="mb-6">
          <p className="text-lg mb-2 text-white">
            Your Score: <span className="font-bold">{score}</span>
          </p>
          <p className="text-lg text-white">
            High Score: <span className="font-bold">{highScore}</span>
          </p>
        </div>

        <button
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
        >
          Play Again
        </button>

        <p className="mt-4 text-sm text-slate-400">Press SPACE to restart</p>
      </div>
    </div>
  )
}
