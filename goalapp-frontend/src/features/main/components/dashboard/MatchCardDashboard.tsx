export interface MatchAction {
  label: string;
  icon?: string;
  variant: 'convocatoria' | 'iniciar' | 'finalizar' | 'eventos' | 'editar';
  onClick: () => void;
  disabled?: boolean;
}

interface MatchCardDashboardProps {
  home: string;
  away: string;
  time: string;
  homeScore?: number;
  awayScore?: number;
  isLive?: boolean;
  actions?: MatchAction[];
}

export default function MatchCardDashboard({
  home,
  away,
  time,
  homeScore,
  awayScore,
  isLive = false,
  actions = [],
}: MatchCardDashboardProps) {
  const getVariantClasses = (variant: MatchAction['variant']) => {
    switch (variant) {
      case 'convocatoria':
        return 'bg-cyan-800/30 text-cyan-300 hover:bg-cyan-800/50 border-cyan-700';
      case 'iniciar':
        return 'bg-lime-300 text-black hover:bg-lime-200/95 shadow shadow-lime-300';
      case 'finalizar':
        return 'bg-orange-600 text-white hover:bg-orange-500 shadow shadow-orange-600/30';
      case 'eventos':
        return 'bg-purple-600 text-white hover:bg-purple-500 shadow shadow-purple-600/30';
      case 'editar':
        return 'bg-purple-800/30 text-purple-300 hover:bg-purple-800/50 border-purple-700';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      {/* Header con hora o minuto en vivo */}
      <div className="flex items-center justify-end gap-1 mb-3">
        {isLive ? (
          <>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-red-400 text-sm font-medium">{time}</span>
          </>
        ) : (
          <>
            <svg className="text-zinc-500 text-sm w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
            </svg>
            <span className="text-zinc-400 text-sm font-medium">{time}</span>
          </>
        )}
      </div>

      {/* Equipos y resultado */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-white font-medium">{home}</p>
        </div>
        <div className="px-4">
          {isLive && homeScore !== undefined && awayScore !== undefined ? (
            <span className="text-white text-xl font-bold">
              {homeScore}<span className="text-zinc-500 mx-1">-</span>{awayScore}
            </span>
          ) : (
            <span className="text-zinc-500 text-sm">vs</span>
          )}
        </div>
        <div className="flex-1 text-right">
          <p className="text-white font-medium">{away}</p>
        </div>
      </div>

      {/* Botones de acción */}
      {actions.length > 0 && (
        <>
          <div className="w-full border border-zinc-900 mt-2 mb-3"></div>
          <div className="flex gap-2">
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
        </>
      )}
    </div>
  );
}
