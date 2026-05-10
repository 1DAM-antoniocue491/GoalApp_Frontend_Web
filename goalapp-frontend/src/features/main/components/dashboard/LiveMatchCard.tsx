import type { MatchAction } from './MatchCardDashboard'

interface LiveMatchCardProps {
  home: string
  away: string
  minute: string
  homeScore: number
  awayScore: number
  actions: MatchAction[]
}

export default function LiveMatchCard({
  home,
  away,
  minute,
  homeScore,
  awayScore,
  actions,
}: LiveMatchCardProps) {
  const getVariantClasses = (variant: MatchAction['variant']) => {
    switch (variant) {
      case 'eventos':
        return 'bg-lime-800/40 text-lime-300 hover:bg-lime-800/60 border-lime-700'
      case 'convocatoria':
        return 'bg-cyan-800/30 text-cyan-700 hover:bg-cyan-800/50 border-cyan-700'
      case 'finalizar':
        return 'bg-yellow-800/30 text-yellow-700 hover:bg-yellow-800/50 border-yellow-700'
      default:
        return 'bg-gray-800 text-gray-400'
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-end gap-1 mb-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        <span className="text-red-400 text-sm font-medium">{minute}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white font-medium">{home}</p>
        </div>
        <div className="px-4 bg-zinc-800 rounded-lg">
          <span className="text-white text-xl font-bold">{homeScore}</span>
          <span className="text-zinc-500 mx-2">-</span>
          <span className="text-white text-xl font-bold">{awayScore}</span>
        </div>
        <div className="flex-1 text-right">
          <p className="text-white font-medium">{away}</p>
        </div>
      </div>
      <div className='w-full border border-zinc-900 mt-2'></div>
      <div className="flex gap-2 mt-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`
              flex-1 px-3 py-1.5 text-sm font-bold rounded-lg transition-colors border-2
              ${getVariantClasses(action.variant)}
              ${action.disabled ? 'opacity-40 cursor-not-allowed border-zinc-700 bg-zinc-800/30 text-zinc-600' : ''}
            `}
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}