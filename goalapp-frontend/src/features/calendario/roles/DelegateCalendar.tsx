import StatsCard from '../components/StatsCard';
import MatchCardDashboard, { type MatchAction } from '../../main/components/dashboard/MatchCardDashboard';
import { type Jornada } from '../../match/services/matchApi';

interface DelegateCalendarProps {
  jornadas: Jornada[];
  partidosEnVivo: Array<{
    id_partido: number;
    nombre_equipo_local: string;
    nombre_equipo_visitante: string;
    fecha: string;
    estado?: string;
  }>;
  partidosFiltrados: Array<{
    id_partido: number;
    nombre_equipo_local: string;
    nombre_equipo_visitante: string;
    fecha: string;
    estado?: string;
  }>;
  totalPartidos: number;
  totalJornadas: number;
  proximosCount: number;
  enVivoCount: number;
  onInitMatch: (id: number) => void;
  onFinishMatch: (id: number) => void;
  onRegisterEvent: (id: number) => void;
}

export default function DelegateCalendar({
  jornadas,
  partidosEnVivo,
  partidosFiltrados,
  totalPartidos,
  totalJornadas,
  proximosCount,
  enVivoCount,
  onInitMatch,
  onFinishMatch,
  onRegisterEvent,
}: DelegateCalendarProps) {
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

      {/* Info card para delegate */}
      <div className="bg-[#1a1a1e] border border-gray-800 p-6 rounded-2xl w-full mt-6">
        <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">
            Como delegado, puedes registrar eventos de los partidos en vivo.
          </p>
        </div>
      </div>

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
                  label: 'Eventos',
                  icon: '⚽',
                  variant: 'eventos',
                  onClick: () => onRegisterEvent(partido.id_partido),
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
                    ...(isEnJuego
                      ? [
                          {
                            label: 'Eventos',
                            icon: '⚽',
                            variant: 'eventos' as const,
                            onClick: () => onRegisterEvent(partido.id_partido),
                          },
                          {
                            label: 'Finalizar',
                            icon: '🏁',
                            variant: 'finalizar' as const,
                            onClick: () => onFinishMatch(partido.id_partido),
                          },
                        ]
                      : [
                          {
                            label: 'Iniciar',
                            icon: '▶️',
                            variant: 'iniciar' as const,
                            onClick: () => onInitMatch(partido.id_partido),
                            disabled: !isTodayMatch,
                          },
                        ]),
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
