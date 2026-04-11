/**
 * Tarjeta de liga para el onboarding
 * Muestra información de una liga con su rol y estado
 */

import { FiStar } from 'react-icons/fi';
import type { UserLeague } from '../types';

interface LeagueCardProps {
  league: UserLeague;
  onEnter: (leagueId: number) => void;
  onReactivate?: (leagueId: number) => void;
  onToggleFavorite?: (leagueId: number) => void;
  isTogglingFavorite?: boolean;
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  entrenador: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  jugador: 'bg-green-500/20 text-green-400 border-green-500/30',
  delegado: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  entrenador: 'Entrenador',
  jugador: 'Jugador',
  delegado: 'Delegado',
};

export function LeagueCard({ league, onEnter, onReactivate, onToggleFavorite, isTogglingFavorite }: LeagueCardProps) {
  const isFinished = league.estado === 'finalizada';

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors flex flex-col justify-between">
      <div>
        {/* Header con nombre y badges */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-white font-semibold">{league.nombre}</h4>

              {/* Rol badge */}
              <span className={`px-2 py-0.5 text-xs font-medium rounded border ${roleColors[league.rol]}`}>
                {roleLabels[league.rol]}
              </span>

              {/* Estado badge */}
              {isFinished && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-zinc-700/50 text-zinc-400 border border-zinc-600/30">
                  Finalizada
                </span>
              )}
            </div>

            {/* Temporada */}
            <p className="text-zinc-500 text-sm mt-1">Temporada {league.temporada}</p>
          </div>

          {/* Botón favorito */}
          <button
            onClick={() => onToggleFavorite?.(league.id)}
            disabled={isTogglingFavorite}
            className={`p-2 rounded-lg transition-colors ${
              isTogglingFavorite
                ? 'text-zinc-600 cursor-wait'
                : league.esFavorita
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-zinc-500 hover:text-yellow-400 hover:bg-zinc-800'
            }`}
            title={league.esFavorita ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            <FiStar className={league.esFavorita ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Información adicional */}
        <div className="space-y-1 mb-4">
          {league.miEquipo && (
            <p className="text-zinc-400 text-sm">
              <span className="text-zinc-500">Mi equipo:</span> {league.miEquipo}
            </p>
          )}
          <p className="text-zinc-400 text-sm">
            <span className="text-zinc-500">Equipos en la liga:</span> {league.equiposTotal}
          </p>
        </div>
      </div>

      {/* Botón de acción */}
      {isFinished ? (
        <button
          onClick={() => onReactivate?.(league.id)}
          className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-lime-400 hover:to-emerald-400 transition-all"
        >
          Reactivar liga
          <span>→</span>
        </button>
      ) : (
        <button
          onClick={() => onEnter(league.id)}
          className="w-full bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:from-lime-400 hover:to-emerald-400 transition-all"
        >
          Entrar
          <span>→</span>
        </button>
      )}
    </div>
  );
}