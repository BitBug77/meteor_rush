"use client"

interface LevelCompleteProps {
  level: number
  score: number
  diamonds: number
  onNextLevel: () => void
  width: number
  height: number
}

export default function LevelComplete({ level, score, diamonds, onNextLevel, width, height }: LevelCompleteProps) {
  const scale = width / 1000

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div
        className="bg-white rounded-lg shadow-lg p-6 text-center"
        style={{
          width: `${Math.min(400, width * 0.8)}px`,
          transform: `scale(${scale > 0.7 ? 1 : scale / 0.7})`,
        }}
      >
        <h2 className="text-2xl font-bold text-green-600 mb-4">Level {level} Complete!</h2>

        <div className="mb-6">
          <p className="text-lg mb-2">
            Your Score: <span className="font-bold">{score}</span>
          </p>
          <p className="text-lg">
            Diamonds Collected: <span className="font-bold">{diamonds}</span>
          </p>
        </div>

        <button
          onClick={onNextLevel}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full transition-colors duration-200"
        >
          Next Level
        </button>

        <p className="mt-4 text-sm text-gray-600">Press SPACE or ENTER to continue</p>
      </div>
    </div>
  )
}
