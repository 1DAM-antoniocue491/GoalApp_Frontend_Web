/**
 * Dashboard para el rol Admin
 * Muestra gestión completa de ligas, equipos y usuarios
 * con partidos en vivo, resultados y próximos partidos
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FiAward, FiSettings, FiLoader } from 'react-icons/fi';
import { useToast } from '../../../../../contexts/ToastContext';
import SummaryCard from '../SummaryCard';
import ResultCard from '../ResultCard';
import SectionHeader from '../SectionHeader';
import MatchCardDashboard, { type MatchAction } from '../MatchCardDashboard';
import Badge from '../../../../../components/ui/Badge';
import { EditLeagueModal } from '../../../../league/components/EditLeagueModal';
import InitMatchModal from '../../../../match/components/InitMatchModal';
import FinishMatchModal, { type FinishData } from '../../../../match/components/FinishMatchModal';
import ConvocatoriaModal from '../../../../match/components/ConvocatoriaModal';
import EventRecorderModal from '../../../../match/components/EventRecorderModal';
import EditMatchModal from '../../../../match/components/EditMatchModal';
import TeamSelectorModal from '../../../../calendario/components/TeamSelectorModal';
import { useSelectedLeague, type SelectedLeague } from '../../../../../context';
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
import { fetchTeamSquad, type PlayerWithStatsResponse } from '../../../../team/services/teamApi';
import { startMatch } from '../../../../match/services/matchApi';

interface AdminDashboardProps {
  league: SelectedLeague;
  userName: string;
  userRole: string;
}

export default function AdminDashboard({ league, userName, userRole }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { clearSelectedLeague } = useSelectedLeague();
  const toast = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInitMatchModal, setShowInitMatchModal] = useState(false);
  const [showFinishMatchModal, setShowFinishMatchModal] = useState(false);
  const [showConvocatoriaModal, setShowConvocatoriaModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);
  const [showTeamSelectorModal, setShowTeamSelectorModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<DashboardUpcomingMatch | null>(null);
  const [selectedLiveMatch, setSelectedLiveMatch] = useState<DashboardLiveMatch | null>(null);
  const [matchForTeamSelector, setMatchForTeamSelector] = useState<{
    id_partido: number;
    id_equipo_local: number;
    nombre_equipo_local: string;
    id_equipo_visitante: number;
    nombre_equipo_visitante: string;
    fecha: string;
  } | null>(null);
  const [finishMatchData, setFinishMatchData] = useState<{
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
  const [convocatoriaType, setConvocatoriaType] = useState<'upcoming' | 'live'>('upcoming');
  const [eventMatchData, setEventMatchData] = useState<{
    id_partido: number;
    localTeam: { nombre: string; id: number };
    visitanteTeam: { nombre: string; id: number };
    fecha: string;
  } | null>(null);
  const [localTeamPlayers, setLocalTeamPlayers] = useState<PlayerWithStatsResponse[]>([]);
  const [visitanteTeamPlayers, setVisitanteTeamPlayers] = useState<PlayerWithStatsResponse[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<DashboardUpcomingMatch | null>(null);
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

  // Callback para cuando se elimina la liga - limpiar y redirigir al onboarding
  const handleLeagueDeleted = () => {
    clearSelectedLeague();
    navigate('/onboarding', { replace: true });
  };

  // Función para abrir el modal de finalizar partido
  const handleOpenFinishMatchModal = async (match: DashboardLiveMatch) => {
    try {
      // Cargar jugadores de ambos equipos
      const equipoLocalId = match.id_equipo_local || 0;
      const equipoVisitanteId = match.id_equipo_visitante || 0;

      const [localPlayers, visitantePlayers] = await Promise.all([
        fetchTeamSquad(equipoLocalId),
        fetchTeamSquad(equipoVisitanteId),
      ]);

      // Combinar jugadores de ambos equipos para el selector MVP
      const todosLosJugadores = [
        ...localPlayers.map(p => ({
          id: p.id_jugador,
          nombre: p.nombre_jugador || p.nombre,
          id_equipo: equipoLocalId,
          dorsal: p.dorsal,
        })),
        ...visitantePlayers.map(p => ({
          id: p.id_jugador,
          nombre: p.nombre_jugador || p.nombre,
          id_equipo: equipoVisitanteId,
          dorsal: p.dorsal,
        })),
      ];

      setFinishMatchData({
        id_partido: match.id_partido,
        localTeam: { nombre: match.nombre_equipo_local || match.home, id: equipoLocalId },
        visitanteTeam: { nombre: match.nombre_equipo_visitante || match.away, id: equipoVisitanteId },
      });
      setShowFinishMatchModal(true);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      toast.showError('No se pudo cargar la información de los jugadores');
    }
  };

  // Función para confirmar la finalización del partido desde el modal
  const handleConfirmFinishMatch = async (data: FinishData) => {
    if (!finishMatchData) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/partidos/${finishMatchData.id_partido}/finalizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error al finalizar el partido');

      setShowFinishMatchModal(false);
      setFinishMatchData(null);

      // Recargar datos del dashboard
      const liveData = await fetchLiveMatches(league.id);
      setLiveMatches(liveData);
      toast.showSuccess('Partido finalizado correctamente');
    } catch (error) {
      console.error('Error al finalizar partido:', error);
      toast.showError('No se pudo finalizar el partido');
      throw error;
    }
  };

  // Función para abrir el modal de iniciar partido
  const handleOpenInitMatchModal = (match: DashboardUpcomingMatch) => {
    setSelectedMatch(match);
    setShowInitMatchModal(true);
  };

  // Función para confirmar el inicio del partido desde el modal
  const handleInitMatchConfirm = async () => {
    if (!selectedMatch) return;
    try {
      await startMatch(selectedMatch.id_partido);
      // Cerrar modal
      setShowInitMatchModal(false);
      setSelectedMatch(null);
      // Recargar datos del dashboard
      const [upcomingData, liveData] = await Promise.all([
        fetchUpcomingMatches(league.id, 3),
        fetchLiveMatches(league.id),
      ]);
      setUpcomingMatches(upcomingData);
      setLiveMatches(liveData);
      toast.showSuccess('Partido iniciado correctamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar el partido';
      toast.showError(message);
    }
  };

  // Función para abrir el modal de convocatoria (ahora muestra TeamSelectorModal primero)
  const handleOpenConvocatoriaModal = (match: DashboardUpcomingMatch) => {
    setMatchForTeamSelector({
      id_partido: match.id_partido,
      id_equipo_local: match.id_equipo_local || 0,
      nombre_equipo_local: match.nombre_equipo_local || match.home,
      id_equipo_visitante: match.id_equipo_visitante || 0,
      nombre_equipo_visitante: match.nombre_equipo_visitante || match.away,
      fecha: match.fecha_completa || `${match.date} ${match.time}`,
    });
    setConvocatoriaType('upcoming');
    setShowTeamSelectorModal(true);
  };

  // Callback cuando se selecciona un equipo en el TeamSelectorModal
  const handleTeamSelected = (equipoId: number, nombreEquipo: string) => {
    setShowTeamSelectorModal(false);
    if (matchForTeamSelector) {
      const isLive = convocatoriaType === 'live';
      setConvocatoriaMatchData({
        id_partido: matchForTeamSelector.id_partido,
        id_equipo: equipoId,
        nombre_equipo: nombreEquipo,
        fecha: matchForTeamSelector.fecha,
        estado: isLive ? 'en_juego' : 'PROGRAMADO',
      });
      setShowConvocatoriaModal(true);
      setMatchForTeamSelector(null);
    }
  };

  // Función para abrir modal de editar partido
  const handleEditMatch = (match: DashboardUpcomingMatch) => {
    setMatchToEdit(match);
    setShowEditMatchModal(true);
  };

  // Función para manejar éxito al editar partido
  const handleEditMatchSuccess = async () => {
    setShowEditMatchModal(false);
    setMatchToEdit(null);
    // Recargar datos del dashboard
    const upcomingData = await fetchUpcomingMatches(league.id, 3);
    setUpcomingMatches(upcomingData);
  };

  // Función para abrir el modal de registro de eventos
  const handleOpenEventModal = async (match: DashboardLiveMatch) => {
    setIsLoadingPlayers(true);
    setSelectedLiveMatch(match);

    try {
      // Cargar jugadores de ambos equipos usando los IDs reales
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
        fecha: new Date().toISOString(),
      });
      setShowEventModal(true);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      toast.showError('No se pudo cargar la información de los jugadores');
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  // Función para abrir el modal de convocatoria para partidos en vivo (ahora muestra TeamSelectorModal primero)
  const handleOpenConvocatoriaModalLive = (match: DashboardLiveMatch) => {
    setMatchForTeamSelector({
      id_partido: match.id_partido,
      id_equipo_local: match.id_equipo_local || 0,
      nombre_equipo_local: match.nombre_equipo_local || match.home,
      id_equipo_visitante: match.id_equipo_visitante || 0,
      nombre_equipo_visitante: match.nombre_equipo_visitante || match.away,
      fecha: new Date().toISOString(),
    });
    setConvocatoriaType('live');
    setShowTeamSelectorModal(true);
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
              const actions: MatchAction[] = [
                {
                  label: 'Eventos',
                  variant: 'eventos',
                  icon: '📋',
                  onClick: () => handleOpenEventModal(match),
                },
                {
                  label: 'Convocatoria',
                  variant: 'convocatoria',
                  icon: '👥',
                  onClick: () => handleOpenConvocatoriaModalLive(match),
                },
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
            {upcomingMatches.map((match, i) => {
              const actions: MatchAction[] = [
                {
                  label: 'Convocatoria',
                  variant: 'convocatoria',
                  icon: '📋',
                  onClick: () => handleOpenConvocatoriaModal(match),
                },
                {
                  label: 'Editar',
                  variant: 'editar',
                  icon: '✏️',
                  onClick: () => handleEditMatch(match),
                },
                {
                  label: 'Iniciar',
                  variant: 'iniciar',
                  icon: '⚽',
                  onClick: () => handleOpenInitMatchModal(match),
                },
              ];
              return (
                <MatchCardDashboard
                  key={i}
                  home={match.home}
                  away={match.away}
                  time={`${match.date}, ${match.time}`}
                  actions={actions}
                />
              );
            })}
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
        onLeagueDeleted={handleLeagueDeleted}
        league={leagueForEdit}
      />

      {/* Modal de iniciar partido */}
      {selectedMatch && (
        <InitMatchModal
          isOpen={showInitMatchModal}
          onClose={() => {
            setShowInitMatchModal(false);
            setSelectedMatch(null);
          }}
          onConfirm={handleInitMatchConfirm}
          localTeam={{
            nombre: selectedMatch.nombre_equipo_local || selectedMatch.home,
          }}
          visitanteTeam={{
            nombre: selectedMatch.nombre_equipo_visitante || selectedMatch.away,
          }}
          fecha={selectedMatch.fecha_completa || `${selectedMatch.date} ${selectedMatch.time}`}
          competicion={selectedMatch.league}
          campo={selectedMatch.campo || 'Campo principal'}
        />
      )}

      {/* Modal de selección de equipo para admin (único para próximos y en vivo) */}
      {matchForTeamSelector && (
        <TeamSelectorModal
          isOpen={showTeamSelectorModal}
          onClose={() => {
            setShowTeamSelectorModal(false);
            setMatchForTeamSelector(null);
          }}
          onTeamSelected={handleTeamSelected}
          nombreEquipoLocal={matchForTeamSelector.nombre_equipo_local}
          idEquipoLocal={matchForTeamSelector.id_equipo_local}
          nombreEquipoVisitante={matchForTeamSelector.nombre_equipo_visitante}
          idEquipoVisitante={matchForTeamSelector.id_equipo_visitante}
          accion="convocatoria"
        />
      )}

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

      {/* Modal de edición de partido */}
      {matchToEdit && (
        <EditMatchModal
          isOpen={showEditMatchModal}
          onClose={() => {
            setShowEditMatchModal(false);
            setMatchToEdit(null);
          }}
          onSuccess={handleEditMatchSuccess}
          match={matchToEdit as DashboardUpcomingMatch & { nombre_equipo_local: string; nombre_equipo_visitante: string }}
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
          minuto={parseInt(selectedLiveMatch?.minute || '0') || 0}
        />
      )}

      {/* Modal de finalizar partido */}
      {finishMatchData && (
        <FinishMatchModal
          isOpen={showFinishMatchModal}
          onClose={() => {
            setShowFinishMatchModal(false);
            setFinishMatchData(null);
          }}
          onConfirm={handleConfirmFinishMatch}
          localTeam={finishMatchData.localTeam}
          visitanteTeam={finishMatchData.visitanteTeam}
          jugadores={[]}
        />
      )}
    </div>
  );
}