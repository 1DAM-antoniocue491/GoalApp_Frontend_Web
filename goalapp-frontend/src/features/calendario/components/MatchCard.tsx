import { FaClock } from 'react-icons/fa';

export interface MatchCardAction {
  label: string;
  icon?: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}

interface MatchCardProps {
  equipo_local: string;
  equipo_visitante: string;
  fecha: string;
  isToday?: boolean;
  actions?: MatchCardAction[];
  message?: string;
}

export default function MatchCard({
  equipo_local,
  equipo_visitante,
  fecha,
  isToday = false,
  actions = [],
  message,
}: MatchCardProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Mañana, ${date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVariantClasses = (variant: MatchCardAction['variant'], isTodayMatch: boolean) => {
    const variants = {
      primary: 'bg-lime-900/20 border border-lime-500/30 text-lime-400 hover:bg-lime-500/20',
      secondary: 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50',
      success: isTodayMatch
        ? 'bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black shadow-[0_10px_20px_rgba(197,245,42,0.3)]'
        : 'bg-gradient-to-r from-[#4a5d23] to-[#2a3a1a] text-black/70 opacity-80',
      warning: 'bg-yellow-800/30 border border-yellow-700 text-yellow-700 hover:bg-yellow-800/50',
      danger: 'bg-red-800/30 border border-red-700 text-red-700 hover:bg-red-800/50',
    };
    return variants[variant];
  };

  return (
    <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl p-6 w-full">
      {/* Encabezado del partido */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <FaClock className="text-gray-500 text-lg" />
          <h4 className="text-white font-bold text-lg">
            {equipo_local} vs {equipo_visitante}
          </h4>
        </div>
        <span className={`text-xs px-3 py-1.5 rounded-full border ${
          isToday
            ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50'
            : 'text-gray-500 bg-gray-900/50 border-gray-800'
        }`}>
          {formatTime(fecha)}
        </span>
      </div>

      {/* Botones de acción */}
      {actions.length > 0 && (
        <div className="flex gap-3 mt-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm
                ${getVariantClasses(action.variant, isToday)}
                ${action.disabled ? 'opacity-40 cursor-not-allowed' : ''}
              `}
            >
              {action.icon && <span className="text-xs">{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje opcional */}
      {message && (
        <div className="border border-dashed border-gray-800 p-3 rounded-xl text-center mt-4">
          <p className="text-gray-500 text-xs">{message}</p>
        </div>
      )}
    </div>
  );
}
