/**
 * Dashboard para el rol Admin
 * Muestra gestión completa de ligas, equipos y usuarios
 * con partidos en vivo, resultados y próximos partidos
 */

import { useState, useEffect } from 'react';
import { FiAward, FiSettings, FiLoader } from 'react-icons/fi';
import SummaryCard from '../SummaryCard';
import ResultCard from '../ResultCard';
import SectionHeader from '../SectionHeader';
import Badge from '../../../../../components/ui/Badge';
import { EditLeagueModal } from '../../../../league/components/EditLeagueModal';
import type { SelectedLeague } from '../../../../../context';
import type { LeagueResponse } from '../../../../league/services/leagueApi';
import {
  fetchAdminDashboardStats,
  fetchLiveMatches,
  fetchRecentResults,
  fetchUpcomingMatches,
  type DashboardLiveMatch,
  type DashboardResult,
  type DashboardUpcomingMatch,
  type AdminDashboardStats,
} from '../../../services/dashboardApi';

interface AdminDashboardProps {
  league: SelectedLeague;
  userName: string;
  userRole: string;
}

export default function AdminDashboard({ league, userName, userRole }: AdminDashboardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [liveMatches, setLiveMatches] = useState<DashboardLiveMatch[]>([]);
  const [recentResults, setRecentResults] = useState<DashboardResult[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<DashboardUpcomingMatch[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Liga en formato LeagueResponse para el modal de edición
  const leagueForEdit: LeagueResponse = {
    id_liga: league.id,
    nombre: league.nombre,
    temporada: league.temporada,
    categoria: undefined,
    activa: true,
    created_at: '',
    updated_at: '',
  };

  // Cargar datos del dashboard
  useEffect(() => {
    async function loadDashboardData() {
      setIsLoadingData(true);
      try {
        const [statsData, liveData, resultsData, upcomingData] = await Promise.allSettled([
          fetchAdminDashboardStats(league.id),
          fetchLiveMatches(league.id),
          fetchRecentResults(league.id, 3),
          fetchUpcomingMatches(league.id, 3),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (liveData.status === 'fulfilled') setLiveMatches(liveData.value);
        if (resultsData.status === 'fulfilled') setRecentResults(resultsData.value);
        if (upcomingData.status === 'fulfilled') setUpcomingMatches(upcomingData.value);
      } catch {
        // Los errores individuales se manejan con Promise.allSettled
      } finally {
        setIsLoadingData(false);
      }
    }

    loadDashboardData();
  }, [league.id]);

  const statsCards = stats
    ? [
        { label: 'Equipos Registrados', value: stats.equiposRegistrados, color: 'lime' as const },
        { label: 'Usuarios Totales', value: stats.usuariosTotales, color: 'blue' as const },
        { label: 'Partidos Programados', value: stats.partidosProgramados, color: 'orange' as const },
      ]
    : [
        { label: 'Equipos Registrados', value: 0, color: 'lime' as const },
        { label: 'Usuarios Totales', value: 0, color: 'blue' as const },
        { label: 'Partidos Programados', value: 0, color: 'orange' as const },
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
            Admin
          </Badge>
        </div>
        <p className="text-zinc-400 text-sm mt-1">
          {league.nombre} • Temporada {league.temporada}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoadingData ? (
          <div className="col-span-3 flex items-center justify-center py-4">
            <FiLoader className="w-5 h-5 text-lime-400 animate-spin mr-2" />
            <span className="text-zinc-400 text-sm">Cargando estadísticas...</span>
          </div>
        ) : (
          statsCards.map((stat, i) => (
            <SummaryCard
              key={i}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          ))
        )}
      </div>

      {/* Partidos en vivo */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Partidos en vivo"
          badge={liveMatches.length}
          badgeVariant="danger"
        />
        {liveMatches.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">No hay partidos en vivo ahora</p>
        ) : (
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resultados recientes */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Resultados recientes"
          linkText="Ver todos"
          linkHref="/results"
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
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Próximos partidos"
          linkText="Ver todos"
          linkHref="/calendar"
        />
        {upcomingMatches.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">No hay partidos programados</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingMatches.map((match, i) => (
              <div
                key={i}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{match.home} vs {match.away}</span>
                  <div className="flex items-center gap-2 text-blue-500 bg-blue-500/30 px-2 rounded-full text-sm">
                    <span>{match.date}, {match.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de configuración de liga */}
      <button
        onClick={() => setShowEditModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all bg-gradient-to-r from-lime-500 to-emerald-500 shadow-lg hover:from-lime-400 hover:to-emerald-400"
      >
        <FiSettings className="w-6 h-6 text-zinc-900" />
      </button>

      {/* Modal de edición de liga */}
      <EditLeagueModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => setShowEditModal(false)}
        league={leagueForEdit}
      />
    </div>
  );
}