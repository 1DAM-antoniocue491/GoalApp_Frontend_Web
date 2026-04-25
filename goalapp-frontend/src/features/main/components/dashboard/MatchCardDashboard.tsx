import { FaRegClock } from "react-icons/fa";

export interface MatchAction {
  label: string;
  icon?: string;
  variant: 'convocatoria' | 'plantillas' | 'iniciar' | 'finalizar' | 'eventos';
  onClick: () => void;
  disabled?: boolean;
}

interface MatchCardDashboardProps {
  home: string;
  away: string;
  time: string;
  actions?: MatchAction[];
}

export default function MatchCardDashboard({
  home,
  away,
  time,
  actions = [],
}: MatchCardDashboardProps) {
  const getVariantClasses = (variant: MatchAction['variant']) => {
    switch (variant) {
      case 'convocatoria':
        return 'bg-lime-800/40 text-lime-300 hover:bg-lime-800/60 border-lime-700';
      case 'plantillas':
        return 'bg-cyan-800/30 text-cyan-300 hover:bg-cyan-800/50 border-cyan-700';
      case 'iniciar':
        return 'bg-lime-300 text-black hover:bg-lime-200/95 shadow shadow-lime-300';
      case 'finalizar':
        return 'bg-orange-600 text-white hover:bg-orange-500 shadow shadow-orange-600/30';
      case 'eventos':
        return 'bg-purple-600 text-white hover:bg-purple-500 shadow shadow-purple-600/30';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
      {/* Header con hora */}
      <div className="flex items-center justify-end gap-1 mb-3">
        <FaRegClock className="text-zinc-500 text-sm" />
        <span className="text-zinc-400 text-sm font-medium">{time}</span>
      </div>

      {/* Equipos */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-white font-medium">{home}</p>
        </div>
        <div className="px-4">
          <span className="text-zinc-500 text-sm">vs</span>
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
