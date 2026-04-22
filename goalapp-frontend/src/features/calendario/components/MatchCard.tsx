import { FaClock } from 'react-icons/fa';

interface MatchCardProps {
  id_partido: number;
  equipo_local: string;
  equipo_visitante: string;
  fecha: string;
  isToday?: boolean;
  isAdmin?: boolean;
  isCoach?: boolean;
  onInitMatch?: (id: number) => void;
  onManageConvocatoria?: (id: number) => void;
}

export default function MatchCard({
  id_partido,
  equipo_local,
  equipo_visitante,
  fecha,
  isToday = false,
  isAdmin = false,
  isCoach = false,
  onInitMatch,
  onManageConvocatoria,
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
      <div className="flex gap-3 mt-4">
        {/* Botón Convocatoria - para Admin o Entrenador */}
        {(isAdmin || isCoach) && (
          <button
            onClick={() => onManageConvocatoria?.(id_partido)}
            className="flex-1 bg-lime-900/20 border border-lime-500/30 text-lime-400 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold hover:bg-lime-500/20 transition-all"
          >
            <span>👥</span>
            <span>Convocatoria</span>
          </button>
        )}

        {/* Botón Iniciar - para Admin */}
        {isAdmin && (
          <button
            onClick={() => onInitMatch?.(id_partido)}
            className={`
              flex-1 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all
              ${
                isToday
                  ? 'bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black shadow-[0_10px_20px_rgba(197,245,42,0.3)]'
                  : 'bg-gradient-to-r from-[#4a5d23] to-[#2a3a1a] text-black/70 opacity-80'
              }
            `}
          >
            <span className="text-xs">▶️</span>
            <span>Iniciar</span>
          </button>
        )}
      </div>

      {/* Mensaje para usuario no autorizado */}
      {!isAdmin && !isCoach && (
        <div className="border border-dashed border-gray-800 p-3 rounded-xl text-center mt-4">
          <p className="text-gray-500 text-xs">
            Información del encuentro disponible para el equipo técnico.
          </p>
        </div>
      )}
    </div>
  );
}
