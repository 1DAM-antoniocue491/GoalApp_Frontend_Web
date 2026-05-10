/**
 * Dashboard para el rol Entrenador
 * Muestra gestión de equipo, convocatorias y alineaciones
 * con partidos en vivo, resultados y próximos partidos
 */

import { useState, useEffect } from 'react';
import { FiAward, FiLoader } from 'react-icons/fi';
import { useToast } from '../../../../../contexts/ToastContext';
import { apiGet } from '../../../../../services/api';
import SummaryCard from '../SummaryCard';
import ResultCard from '../ResultCard';
import SectionHeader from '../SectionHeader';
import MatchCardDashboard, { type MatchAction } from '../MatchCardDashboard';
import Badge from '../../../../../components/ui/Badge';
import type { SelectedLeague } from '../../../../../context';
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
import ConvocatoriaModal from '../../../../match/components/ConvocatoriaModal';

interface CoachDashboardProps {
  league: SelectedLeague;
  userName: string;
  userRole: string;
}

export default function CoachDashboard({ league, userName, userRole }: CoachDashboardProps) {
  const toast = useToast();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [liveMatches, setLiveMatches] = useState<DashboardLiveMatch[]>([]);
  const [recentResults, setRecentResults] = useState<DashboardResult[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<DashboardUpcomingMatch[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [coachTeamId, setCoachTeamId] = useState<number | null>(null);
  const [showConvocatoriaModal, setShowConvocatoriaModal] = useState(false);
  const [convocatoriaMatchData, setConvocatoriaMatchData] = useState<{
    id_partido: number;
    id_equipo: number;
    nombre_equipo: string;
    fecha: string;
    estado: string;
  } | null>(null);

  // Cargar equipo del entrenador
  useEffect(() => {
    const cargarEquipo = async () => {
      try {
        const data = await apiGet<{ id_equipo: number; nombre: string }>('/equipos/usuario/mi-equipo');
        setCoachTeamId(data.id_equipo);
      } catch (error) {
        console.error('Error al cargar equipo:', error);
      }
    };
    cargarEquipo();
  }, []);

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

  // Función para verificar si el equipo del entrenador está jugando este partido
  const isCoachTeamPlaying = (match: DashboardLiveMatch | DashboardUpcomingMatch): boolean => {
    if (!coachTeamId) return false;
    return match.id_equipo_local === coachTeamId || match.id_equipo_visitante === coachTeamId;
  };

  // Función para abrir el modal de convocatoria (partidos próximos)
  const handleOpenConvocatoriaModal = (match: DashboardUpcomingMatch) => {
    const equipoId = match.id_equipo_local === coachTeamId ? match.id_equipo_local : match.id_equipo_visitante;
    const nombreEquipo = match.id_equipo_local === coachTeamId ? match.nombre_equipo_local || match.home : match.nombre_equipo_visitante || match.away;
    setConvocatoriaMatchData({
      id_partido: match.id_partido,
      id_equipo: equipoId || 0,
      nombre_equipo: nombreEquipo,
      fecha: match.fecha_completa || `${match.date} ${match.time}`,
      estado: match.estado || 'PROGRAMADO',
    });
    setShowConvocatoriaModal(true);
  };

  // Función para abrir el modal de convocatoria (partidos en vivo) — solo lectura
  const handleOpenLineupModal = (match: DashboardLiveMatch) => {
    const equipoId = match.id_equipo_local === coachTeamId ? match.id_equipo_local : match.id_equipo_visitante;
    const nombreEquipo = match.id_equipo_local === coachTeamId ? match.nombre_equipo_local || match.home : match.nombre_equipo_visitante || match.away;
    setConvocatoriaMatchData({
      id_partido: match.id_partido,
      id_equipo: equipoId || 0,
      nombre_equipo: nombreEquipo,
      fecha: new Date().toISOString(),
      estado: 'en_juego',
    });
    setShowConvocatoriaModal(true);
  };

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
            Entrenador
          </Badge>
        </div>
        <p className="text-zinc-400 text-sm mt-1">
          {league.nombre} &bull; Temporada {league.temporada}
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
          linkText="Ver todos"
          linkHref="/live"
          badge={liveMatches.length}
          badgeVariant="danger"
        />
        {liveMatches.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">No hay partidos en vivo ahora</p>
        ) : (
          <div className="flex flex-col gap-3">
            {liveMatches.map((match, i) => {
              const actions: MatchAction[] = [];
              // Solo mostrar botón de alineación si es el equipo del entrenador
              if (isCoachTeamPlaying(match)) {
                actions.push({
                  label: 'Alineación',
                  variant: 'convocatoria',
                  icon: '👥',
                  onClick: () => handleOpenLineupModal(match),
                });
              }
              return (
                <MatchCardDashboard
                  key={i}
                  home={match.home}
                  away={match.away}
                  time={match.minute}
                  actions={actions.length > 0 ? actions : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Resultados recientes */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Resultados recientes"
          linkText="Ver todos"
          linkHref="/finish"
        />
        {recentResults.length === 0 ? (
          <p className="text-zinc-500 text-sm py-4">No hay resultados recientes</p>
        ) : (
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
        )}
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
            {upcomingMatches.map((match, i) => {
              const actions: MatchAction[] = [];
              // Solo mostrar botón de convocatoria si es el equipo del entrenador
              if (isCoachTeamPlaying(match)) {
                actions.push({
                  label: 'Convocatoria',
                  variant: 'convocatoria',
                  icon: '📋',
                  onClick: () => handleOpenConvocatoriaModal(match),
                });
              }
              return (
                <MatchCardDashboard
                  key={i}
                  home={match.home}
                  away={match.away}
                  time={`${match.date}, ${match.time}`}
                  actions={actions.length > 0 ? actions : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de convocatoria (próximos partidos) */}
      {convocatoriaMatchData && (
        <ConvocatoriaModal
          isOpen={showConvocatoriaModal}
          onClose={() => setShowConvocatoriaModal(false)}
          onSuccess={async () => {
            const upcomingData = await fetchUpcomingMatches(league.id, 3);
            setUpcomingMatches(upcomingData);
          }}
          partidoId={convocatoriaMatchData.id_partido}
          equipoId={convocatoriaMatchData.id_equipo}
          nombreEquipo={convocatoriaMatchData.nombre_equipo}
          partidoFecha={convocatoriaMatchData.fecha}
          competicion={league.nombre}
          estadoPartido={convocatoriaMatchData.estado}
          canEdit={true}
        />
      )}

    </div>
  );
}