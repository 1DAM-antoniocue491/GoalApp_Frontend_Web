import { FaCalendar, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import StatsCard from '../components/StatsCard';
import CreateCalendarModal, { type CalendarConfig } from '../components/CreateCalendarModal';
import MatchCardDashboard, { type MatchAction } from '../../main/components/dashboard/MatchCardDashboard';
import { type Jornada, type MatchWithTeams } from '../../match/services/matchApi';

interface AdminCalendarProps {
  jornadas: Jornada[];
  partidosEnVivo: Array<{
    id_partido: number;
    nombre_equipo_local: string;
    nombre_equipo_visitante: string;
    fecha: string;
  }>;
  partidosFiltrados: Array<{
    id_partido: number;
    nombre_equipo_local: string;
    nombre_equipo_visitante: string;
    fecha: string;
  }>;
  totalPartidos: number;
  totalJornadas: number;
  proximosCount: number;
  enVivoCount: number;
  onInitMatch: (id: number) => void;
  onFinishMatch: (id: number) => void;
  onManageConvocatoria: (id: number) => void;
  onManageLineup: (id: number) => void;
  onEditCalendar: () => void;
  onOpenCreateCalendar: () => void;
  onOpenEditCalendar: () => void;
  onCreateMatch: () => void;
  onDeleteCalendar: () => void;
  showCreateCalendarModal: boolean;
  setShowCreateCalendarModal: (open: boolean) => void;
  handleCreateCalendar: (config: CalendarConfig) => Promise<void>;
  ligaId?: number;
  partidos?: MatchWithTeams[];
  isEditMode?: boolean;
  initialConfig?: CalendarConfig | null;
}

export default function AdminCalendar({
  jornadas,
  partidosEnVivo,
  partidosFiltrados,
  totalPartidos,
  totalJornadas,
  proximosCount,
  enVivoCount,
  onInitMatch,
  onFinishMatch,
  onManageConvocatoria,
  onManageLineup,
  onEditCalendar,
  onOpenCreateCalendar,
  onOpenEditCalendar,
  onDeleteCalendar,
  onCreateMatch,
  showCreateCalendarModal,
  setShowCreateCalendarModal,
  handleCreateCalendar,
  ligaId,
  partidos,
  isEditMode,
  initialConfig,
}: AdminCalendarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Determinar el estado del calendario
  const hasMatches = partidos && partidos.length > 0;
  const hasMatchesInPlayOrFinished = partidos?.some(
    (p) => p.estado === 'En Juego' || p.estado === 'Finalizado'
  );

  // 3 estados: Crear (no hay partidos), Edición (hay partidos), Bloqueado (en juego/finalizados)
  const calendarState = hasMatchesInPlayOrFinished
    ? 'bloqueado'
    : hasMatches
    ? 'edicion'
    : 'crear';
  const formatTime = (fecha: string) => {
    const date = new Date(fecha);
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
    <>
      {/* Stats Cards */}
      <div className="flex gap-4 overflow-x-auto pb-2 mb-8">
        <StatsCard number={totalPartidos} texto="Total partidos" />
        <StatsCard number={totalJornadas} texto="Jornadas" />
        <StatsCard number={proximosCount} texto="Próximos" color="text-blue-400" />
        <StatsCard number={0} texto="Mañana" color="text-purple-400" />
        <StatsCard number={enVivoCount} texto="Hoy" color="text-lime-400" />
      </div>

      {/* CardAdmin */}
      <div className="w-full mt-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TARJETA 1: CALENDARIO AUTOMÁTICO - 3 estados */}
        <div className="bg-zinc-900 border border-gray-800 p-8 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                calendarState === 'bloqueado' ? 'bg-yellow-800/30' : 'bg-gray-800/50'
              }`}>
                <FaCalendar className={`text-2xl ${
                  calendarState === 'bloqueado' ? 'text-yellow-500' : 'text-[#c5f52a]'
                }`} />
              </div>
              {calendarState === 'edicion' && (
                <span className="px-3 py-1 bg-lime-900/30 border border-lime-700/50 text-lime-400 text-xs font-semibold rounded-full">
                  Activo
                </span>
              )}
              {calendarState === 'bloqueado' && (
                <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 text-xs font-semibold rounded-full">
                  En juego
                </span>
              )}
            </div>

            {/* Título y descripción según estado */}
            {calendarState === 'crear' && (
              <>
                <h3 className="text-2xl font-bold text-white mb-3">Crear calendario automático</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  Genera todos los encuentros de la liga de forma automática según los equipos, días y horarios configurados.
                </p>
              </>
            )}
            {calendarState === 'edicion' && (
              <>
                <h3 className="text-2xl font-bold text-white mb-3">Editar calendario</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  El calendario ya está generado. Puedes modificar la configuración o eliminarlo completamente.
                </p>
              </>
            )}
            {calendarState === 'bloqueado' && (
              <>
                <h3 className="text-2xl font-bold text-white mb-3">Calendario en juego</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  No se puede editar o eliminar el calendario mientras haya partidos en juego o finalizados.
                </p>
              </>
            )}
          </div>

          {/* Botones según estado */}
          {calendarState === 'crear' && (
            <button
              onClick={onOpenCreateCalendar}
              className="w-full bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black font-bold py-4 rounded-2xl flex justify-between px-6 items-center group transition-all hover:scale-[1.02]"
            >
              <span>Crear calendario</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
          {calendarState === 'edicion' && (
            <div className="flex gap-3">
              <button
                onClick={onOpenEditCalendar}
                className="flex-1 bg-lime-800/30 border border-lime-700/50 text-lime-400 font-bold py-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-lime-800/50 transition-all"
              >
                <FaEdit className="text-lg" />
                <span>Editar configuración</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 bg-red-900/20 border border-red-800/50 text-red-400 font-bold py-4 rounded-2xl flex justify-center items-center gap-2 hover:bg-red-900/40 transition-all"
              >
                <FaTrash className="text-lg" />
                <span>Eliminar</span>
              </button>
            </div>
          )}
          {calendarState === 'bloqueado' && (
            <button
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 text-gray-500 font-bold py-4 rounded-2xl flex justify-between px-6 items-center cursor-not-allowed"
            >
              <span>Calendario bloqueado</span>
              <span>🔒</span>
            </button>
          )}
        </div>

        {/* TARJETA 2: NUEVO ENCUENTRO */}
        <div className="bg-zinc-900 border border-gray-800 p-8 rounded-3xl flex flex-col justify-between shadow-xl">
          <div>
            <div className="bg-gray-800/50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <FaPlus className="text-[#c5f52a] text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Nuevo encuentro</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Crea y programa manualmente un partido individual, definiendo fecha, hora y equipos sin afectar al resto del calendario.
            </p>
          </div>

          <button
            onClick={onCreateMatch}
            className="w-full bg-gradient-to-r from-[#c5f52a] via-[#c5f52a] to-[#2a5a55] text-black font-bold py-4 rounded-2xl flex justify-between px-6 items-center group transition-all hover:scale-[1.02]"
          >
            <span>Crear encuentro</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Modal para crear calendario */}
      <CreateCalendarModal
        isOpen={showCreateCalendarModal}
        onClose={() => {
          setShowCreateCalendarModal(false);
          setIsEditMode(false);
        }}
        onSave={handleCreateCalendar}
        ligaId={ligaId}
        isEditMode={isEditMode}
        initialConfig={initialConfig}
      />

      {/* Modal de confirmación para eliminar calendario */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1e] border border-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-800/50 flex items-center justify-center">
                <FaTrash className="text-red-400 text-xl" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Eliminar calendario</h2>
                <p className="text-gray-400 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-6">
              Se eliminarán <strong className="text-white">{totalPartidos}</strong> partidos de {totalJornadas} jornadas.
              Los equipos y jugadores no se verán afectados.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 rounded-xl border border-gray-800 text-white font-semibold hover:bg-gray-800/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteCalendar();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Eliminar calendario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partidos en vivo */}
      {partidosEnVivo.length > 0 && (
        <div className="mb-8">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-lime-400 animate-pulse">🔴</span>
            En Vivo
          </h2>
          <div className="space-y-4">
            {partidosEnVivo.map((partido) => {
              const actions: MatchAction[] = [
                {
                  label: 'Convocatoria',
                  icon: '👥',
                  variant: 'convocatoria',
                  onClick: () => onManageConvocatoria(partido.id_partido),
                },
                {
                  label: 'Plantillas',
                  icon: '📋',
                  variant: 'plantillas',
                  onClick: () => onManageLineup(partido.id_partido),
                },
                {
                  label: 'Finalizar',
                  icon: '🏁',
                  variant: 'finalizar',
                  onClick: () => onFinishMatch(partido.id_partido),
                },
              ];
              return (
                <MatchCardDashboard
                  key={partido.id_partido}
                  home={partido.nombre_equipo_local}
                  away={partido.nombre_equipo_visitante}
                  time={formatTime(partido.fecha)}
                  actions={actions}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Listado de partidos por jornada */}
      {partidosFiltrados.length > 0 && (
        <div className="space-y-6">
          {jornadas.map((jornada) => (
            <div key={jornada.numero}>
              <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-lime-400">{jornada.nombre}</span>
                <span className="text-zinc-500 text-sm">({jornada.partidos.length} partidos)</span>
              </h2>
              <div className="space-y-4">
                {jornada.partidos.map((partido) => {
                  const isTodayMatch = new Date(partido.fecha).toDateString() === new Date().toDateString();
                  const isEnJuego = partido.estado === 'En Juego';
                  const actions: MatchAction[] = [
                    {
                      label: 'Convocatoria',
                      icon: '👥',
                      variant: 'convocatoria',
                      onClick: () => onManageConvocatoria(partido.id_partido),
                    },
                    {
                      label: 'Plantillas',
                      icon: '📋',
                      variant: 'plantillas',
                      onClick: () => onManageLineup(partido.id_partido),
                    },
                    ...(isEnJuego
                      ? [{
                          label: 'Finalizar',
                          icon: '🏁',
                          variant: 'finalizar' as const,
                          onClick: () => onFinishMatch(partido.id_partido),
                        }]
                      : [{
                          label: 'Iniciar',
                          icon: '▶️',
                          variant: 'iniciar' as const,
                          onClick: () => onInitMatch(partido.id_partido),
                          disabled: !isTodayMatch,
                        }]),
                  ];
                  return (
                    <MatchCardDashboard
                      key={partido.id_partido}
                      home={partido.nombre_equipo_local}
                      away={partido.nombre_equipo_visitante}
                      time={formatTime(partido.fecha)}
                      actions={actions}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin partidos */}
      {partidosFiltrados.length === 0 && partidosEnVivo.length === 0 && (
        <div className="text-center py-20 border border-dashed border-zinc-700 rounded-xl">
          <p className="text-zinc-400 text-sm mb-2">No hay partidos programados</p>
          <p className="text-zinc-500 text-xs">
            Los partidos aparecerán cuando el admin los cree
          </p>
        </div>
      )}
    </>
  );
}
