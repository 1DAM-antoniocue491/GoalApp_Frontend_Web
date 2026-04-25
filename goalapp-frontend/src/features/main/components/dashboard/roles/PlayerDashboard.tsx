/**
 * Dashboard para el rol Jugador
 * Muestra gestión de partidos, eventos y resultados
 * con partidos en vivo, resultados y próximos partidos
 */

import { FiAward } from 'react-icons/fi';
import SummaryCard from '../SummaryCard';
import ResultCard from '../ResultCard';
import UpcomingMatchCard from '../UpcomingMatchCard';
import SectionHeader from '../SectionHeader';
import Badge from '../../../../../components/ui/Badge';
import type { SelectedLeague } from '../../../../../context';

interface PlayerDashboardProps {
  league: SelectedLeague;
  userName: string;
  userRole: string;
}

export default function PlayerDashboard({ league, userName, userRole }: PlayerDashboardProps) {
  // Datos de ejemplo - en producción vendrían de la API
  const stats = [
    { label: 'Equipos Registrados', value: 156, color: 'lime' as const },
    { label: 'Usuarios Totales', value: 2847, color: 'blue' as const },
    { label: 'Partidos Programados', value: 48, color: 'orange' as const },
  ];

  const liveMatches = [
    {
      league: 'La Liga',
      home: 'Atlético Madrid',
      away: 'Sevilla',
      homeScore: 1,
      awayScore: 0,
      minute: "67'",
      actions: {
        verPlantillas: false,
      } as const,
    },
    {
      league: 'Premier League',
      home: 'Liverpool',
      away: 'Chelsea',
      homeScore: 2,
      awayScore: 2,
      minute: "81'",
      actions: {
        verPlantillas: false,
      } as const,
    },
    {
      league: 'Serie A',
      home: 'Inter',
      away: 'Napoli',
      homeScore: 0,
      awayScore: 1,
      minute: "34'",
      actions: {
        verPlantillas: false,
      } as const,
    },
  ];

  const recentResults = [
    { league: 'La Liga', home: 'Real Madrid', away: 'Barcelona', homeScore: 2, awayScore: 1 },
    { league: 'Premier League', home: 'Man City', away: 'Arsenal', homeScore: 1, awayScore: 1 },
    { league: 'Ligue 1', home: 'PSG', away: 'Lyon', homeScore: 3, awayScore: 0 },
  ];

  const upcomingMatches = [
    { teams: 'Sevilla VS Betis', league: league.nombre, time: 'Hoy, 21:00' },
    { teams: 'Athletic VS Real Sociedad', league: league.nombre, time: 'Mañana, 18:00' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header con saludo y estado */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-white text-2xl font-semibold">
            Hola, {userName.split(' ')[0]}
          </h1>
          <Badge variant="success" className="flex items-center gap-1">
            <FiAward className="w-3 h-3" />
            Jugador
          </Badge>
        </div>
        <p className="text-zinc-400 text-sm mt-1">
          {league.nombre} &bull; Temporada {league.temporada}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <SummaryCard
            key={i}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Partidos en vivo */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Partidos en vivo"
          linkText="Ver todos"
          linkHref="/live"
          badge={liveMatches.length}
          badgeVariant="danger"
        />
        <div className="flex flex-col gap-3">
          {liveMatches.map((match, i) => (
            <div
              key={i}
              className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-center justify-end gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-red-400 text-sm font-medium">{match.minute}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{match.home}</p>
                </div>
                <div className="px-4 bg-zinc-800 rounded-lg">
                  <span className="text-white text-xl font-bold">{match.homeScore}</span>
                  <span className="text-zinc-500 mx-2">-</span>
                  <span className="text-white text-xl font-bold">{match.awayScore}</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-medium">{match.away}</p>
                </div>
              </div>
              <div className='w-full border border-zinc-900 mt-2'></div>
              <div className="flex gap-2 mt-3">
                <button
                  disabled={!match.actions.verPlantillas}
                  className={`w-full px-3 py-1.5 text-sm font-bold rounded-lg transition-colors border-2 ${
                    !match.actions.verPlantillas
                      ? 'opacity-40 cursor-not-allowed bg-zinc-800/30 text-zinc-600 border-zinc-700'
                      : 'bg-cyan-800/30 text-cyan-700 hover:bg-cyan-800/50 border-cyan-700'
                  }`}
                >
                  Ver Plantillas
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resultados recientes */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Resultados recientes"
          linkText="Ver todos"
          linkHref="/finish"
        />
        <div className="flex flex-col gap-2">
          {recentResults.map((match, i) => (
            <ResultCard
              key={i}
              league={match.league}
              home={match.home}
              away={match.away}
              score={`${match.homeScore} - ${match.awayScore}`}
              status="FT"
            />
          ))}
        </div>
      </div>

      {/* Próximos partidos */}
      <div className="flex flex-col gap-2">
        <SectionHeader title="Próximos partidos" />
        <div className="flex flex-col gap-2">
          {upcomingMatches.map((match, i) => (
            <UpcomingMatchCard
              key={i}
              teams={match.teams}
              league={match.league}
              time={match.time}
            />
          ))}
        </div>
      </div>
    </div>
  );
}