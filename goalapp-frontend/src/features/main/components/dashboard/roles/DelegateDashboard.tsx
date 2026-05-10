/**
 * Dashboard para el rol Delegado
 * Muestra gestión completa de ligas, equipos y usuarios
 * con partidos en vivo, resultados y próximos partidos
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiAward, FiLoader } from 'react-icons/fi';
import { useToast } from '../../../../../contexts/ToastContext';
import { useAuth } from '../../../../../features/auth/hooks/useAuth';
import SummaryCard from '../SummaryCard';
import ResultCard from '../ResultCard';
import SectionHeader from '../SectionHeader';
import MatchCardDashboard, { type MatchAction } from '../MatchCardDashboard';
import Badge from '../../../../../components/ui/Badge';
import type { SelectedLeague } from '../../../../../context';
import { apiGet } from '../../../../../services/api';
import {
  fetchAdminDashboardStats,
  fetchLiveMatches,
  fetchRecentResults,
  fetchUpcomingMatches,
  type AdminDashboardStats,
  type DashboardLiveMatch,
  type DashboardResult,
  type DashboardUpcomingMatch,
} from '../../../services/dashboardApi';
import { fetchTeamSquad, type PlayerWithStatsResponse } from '../../../../team/services/teamApi';
import { finishMatch } from '../../../../match/services/matchApi';
import FinishMatchModal, { type FinishData } from '../../../../match/components/FinishMatchModal';
import EventRecorderModal from '../../../../match/components/EventRecorderModal';
import ConvocatoriaModal from '../../../../match/components/ConvocatoriaModal';

interface DelegateDashboardProps {
  league: SelectedLeague;
  userName: string;
  userRole: string;
}

export default function DelegateDashboard({ league, userName, userRole }: DelegateDashboardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [liveMatches, setLiveMatches] = useState<DashboardLiveMatch[]>([]);
  const [recentResults, setRecentResults] = useState<DashboardResult[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<DashboardUpcomingMatch[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estados para modales
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showConvocatoriaModal, setShowConvocatoriaModal] = useState(false);
  const [finishMatchData, setFinishMatchData] = useState<{
    id_partido: number;
    localTeam: { nombre: string; id: number };
    visitanteTeam: { nombre: string; id: number };
  } | null>(null);
  const [finishPlayers, setFinishPlayers] = useState<{ id: number; nombre: string; id_equipo: number; dorsal?: number }[]>([]);
  const [eventMatchData, setEventMatchData] = useState<{
    id_partido: number;
    localTeam: { nombre: string; id: number };
    visitanteTeam: { nombre: string; id: number };
  } | null>(null);
  const [convocatoriaMatchData, setConvocatoriaMatchData] = useState<{
    id_partido: number;
    id_equipo: number;
    nombre_equipo: string;
    fecha: string;
    estado: string;
  } | null>(null);
  const [localTeamPlayers, setLocalTeamPlayers] = useState<PlayerWithStatsResponse[]>([]);
  const [visitanteTeamPlayers, setVisitanteTeamPlayers] = useState<PlayerWithStatsResponse[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [delegadoEquipoId, setDelegadoEquipoId] = useState<number | null>(null);

  const toast = useToast();

  // Cargar el equipo asignado al delegado
  useEffect(() => {
    const cargarEquipo = async () => {
      try {
        const data = await apiGet<{ id_equipo: number }>('/equipos/usuario/mi-equipo', {
          liga_id: league.id,
        });
        setDelegadoEquipoId(data.id_equipo);
      } catch (error) {
        console.error('Error al cargar equipo del delegado:', error);
        setDelegadoEquipoId(null);
      }
    };
    cargarEquipo();
  }, [league.id]);

  // Función para verificar si el usuario puede registrar eventos en un partido
  // Solo muestra el botón si es admin o si el partido es de uno de sus equipos (para delegado)
  const canRegisterEvents = (match: DashboardLiveMatch): boolean => {
    // Admin siempre puede registrar eventos
    if (user?.rol_principal?.toLowerCase() === 'admin') {
      return true;
    }

    // Para delegado: solo puede registrar eventos si el partido es de su equipo
    if (!delegadoEquipoId) return false;
    return match.id_equipo_local === delegadoEquipoId || match.id_equipo_visitante === delegadoEquipoId;
  };

  // Función para verificar si el equipo del delegado está jugando
  const isDelegadoTeamPlaying = (match: DashboardLiveMatch | DashboardUpcomingMatch): boolean => {
    if (!delegadoEquipoId) return false;
    return match.id_equipo_local === delegadoEquipoId || match.id_equipo_visitante === delegadoEquipoId;
  };

  // Función para abrir el modal de convocatoria (partidos próximos)
  const handleOpenConvocatoriaModal = (match: DashboardUpcomingMatch) => {
    const equipoId = match.id_equipo_local === delegadoEquipoId ? match.id_equipo_local : match.id_equipo_visitante;
    const nombreEquipo = match.id_equipo_local === delegadoEquipoId ? match.nombre_equipo_local || match.home : match.nombre_equipo_visitante || match.away;
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
    const equipoId = match.id_equipo_local === delegadoEquipoId ? match.id_equipo_local : match.id_equipo_visitante;
    const nombreEquipo = match.id_equipo_local === delegadoEquipoId ? match.nombre_equipo_local || match.home : match.nombre_equipo_visitante || match.away;
    setConvocatoriaMatchData({
      id_partido: match.id_partido,
      id_equipo: equipoId || 0,
      nombre_equipo: nombreEquipo,
      fecha: new Date().toISOString(),
      estado: 'en_juego',
    });
    setShowConvocatoriaModal(true);
  };

  // Función para abrir el modal de finalizar partido
  const handleOpenFinishMatchModal = async (match: DashboardLiveMatch) => {
    try {
      const equipoLocalId = match.id_equipo_local || 0;
      const equipoVisitanteId = match.id_equipo_visitante || 0;

      const [localPlayers, visitantePlayers] = await Promise.all([
        fetchTeamSquad(equipoLocalId),
        fetchTeamSquad(equipoVisitanteId),
      ]);

      const todosLosJugadores = [
        ...localPlayers.map(p => ({ id: p.id_jugador, nombre: p.nombre_jugador || p.nombre, id_equipo: equipoLocalId, dorsal: p.dorsal })),
        ...visitantePlayers.map(p => ({ id: p.id_jugador, nombre: p.nombre_jugador || p.nombre, id_equipo: equipoVisitanteId, dorsal: p.dorsal })),
      ];

      setFinishMatchData({
        id_partido: match.id_partido,
        localTeam: { nombre: match.nombre_equipo_local || match.home, id: equipoLocalId },
        visitanteTeam: { nombre: match.nombre_equipo_visitante || match.away, id: equipoVisitanteId },
      });
      setFinishPlayers(todosLosJugadores);
      setShowFinishModal(true);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      toast.showError('No se pudo cargar la información de los jugadores');
    }
  };

  // Función para confirmar la finalización del partido
  const handleConfirmFinishMatch = async (data: FinishData) => {
    if (!finishMatchData) return;

    try {
      await finishMatch(finishMatchData.id_partido, data);

      setShowFinishModal(false);
      setFinishMatchData(null);
      toast.showSuccess('Partido finalizado correctamente');
      window.location.reload();
    } catch (error) {
      console.error('Error al finalizar partido:', error);
      toast.showError('No se pudo finalizar el partido');
      throw error;
    }
  };

  // Función para abrir el modal de registro de eventos
  const handleOpenEventModal = async (match: DashboardLiveMatch) => {
    setIsLoadingPlayers(true);
    try {
      const equipoLocalId = match.id_equipo_local || 0;
      const equipoVisitanteId = match.id_equipo_visitante || 0;

      const [localPlayers, visitantePlayers] = await Promise.all([
        fetchTeamSquad(equipoLocalId),
        fetchTeamSquad(equipoVisitanteId),
      ]);
      setLocalTeamPlayers(localPlayers);
      setVisitanteTeamPlayers(visitantePlayers);

      setEventMatchData({
        id_partido: match.id_partido,
        localTeam: { nombre: match.nombre_equipo_local || match.home, id: equipoLocalId },
        visitanteTeam: { nombre: match.nombre_equipo_visitante || match.away, id: equipoVisitanteId },
      });
      setShowEventModal(true);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      toast.showError('No se pudo cargar la información de los jugadores');
    } finally {
      setIsLoadingPlayers(false);
    }
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
          <Badge variant="warning" className="flex items-center gap-1">
            <FiAward className="w-3 h-3" />
            Delegado
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
              const puedeRegistrarEventos = canRegisterEvents(match);
              const accionesConvocatoria = isDelegadoTeamPlaying(match);
              const actions: MatchAction[] = [
                ...(puedeRegistrarEventos ? [{
                  label: 'Eventos',
                  variant: 'eventos',
                  icon: '📋',
                  onClick: () => handleOpenEventModal(match),
                }] : []),
                ...(accionesConvocatoria ? [{
                  label: 'Convocatoria',
                  variant: 'convocatoria',
                  icon: '👥',
                  onClick: () => handleOpenLineupModal(match),
                }] : []),
                {
                  label: 'Finalizar',
                  variant: 'finalizar',
                  icon: '🔒',
                  onClick: () => handleOpenFinishMatchModal(match),
                },
              ];
              return (
                <MatchCardDashboard
                  key={i}
                  home={match.home}
                  away={match.away}
                  time={match.minute}
                  actions={actions}
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
              const accionesConvocatoria = isDelegadoTeamPlaying(match);
              const actions: MatchAction[] = [];
              if (accionesConvocatoria) {
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

      {/* Modal de finalizar partido */}
      {finishMatchData && (
        <FinishMatchModal
          isOpen={showFinishModal}
          onClose={() => {
            setShowFinishModal(false);
            setFinishMatchData(null);
            setFinishPlayers([]);
          }}
          onConfirm={handleConfirmFinishMatch}
          localTeam={finishMatchData.localTeam}
          visitanteTeam={finishMatchData.visitanteTeam}
          partidoId={finishMatchData.id_partido}
          jugadores={finishPlayers}
        />
      )}

      {/* Modal de registro de eventos */}
      {eventMatchData && (
        <EventRecorderModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setEventMatchData(null);
          }}
          onEventRegistered={async () => {
            const liveData = await fetchLiveMatches(league.id);
            setLiveMatches(liveData);
            setShowEventModal(false);
          }}
          partidoId={eventMatchData.id_partido}
          localTeam={eventMatchData.localTeam}
          visitanteTeam={eventMatchData.visitanteTeam}
          localPlayers={localTeamPlayers}
          visitantePlayers={visitanteTeamPlayers}
          minuto={0}
        />
      )}

    </div>
  );
}
