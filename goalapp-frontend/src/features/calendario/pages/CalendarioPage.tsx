import { useState, useEffect } from 'react';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { useToast } from '../../../contexts/ToastContext';
import AdminCalendar from '../roles/AdminCalendar';
import CoachCalendar from '../roles/CoachCalendar';
import DelegateCalendar from '../roles/DelegateCalendar';
import PlayerCalendar from '../roles/PlayerCalendar';
import ViewerCalendar from '../roles/ViewerCalendar';
import {
  fetchMatchesByJornada,
  fetchUpcomingMatches,
  fetchLiveMatches,
  createCalendar,
  fetchCalendarConfig,
  deleteCalendar,
  updateCalendar,
  startMatch,
  finishMatch,
  type MatchWithTeams,
  type Jornada,
  type FinishMatchPayload,
} from '../../match/services/matchApi';
import type { CalendarConfig } from '../components/CreateCalendarModal';
import CreateMatchModal from '../components/CreateMatchModal';
import InitMatchModal from '../../match/components/InitMatchModal';
import FinishMatchModal, { type FinishData } from '../../match/components/FinishMatchModal';
import EditMatchModal from '../../match/components/EditMatchModal';
import EventRecorderModal from '../../match/components/EventRecorderModal';
import ConvocatoriaModal from '../../match/components/ConvocatoriaModal';
import { fetchTeamSquad, type PlayerWithStatsResponse } from '../../team/services/teamApi';
import { apiGet } from '../../../services/api';
import TeamSelectorModal from '../components/TeamSelectorModal';

export default function CalendarioPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<MatchWithTeams[]>([]);
  const [partidosEnVivo, setPartidosEnVivo] = useState<MatchWithTeams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialConfig, setInitialConfig] = useState<CalendarConfig | null>(null);
  const toast = useToast();

  // Estados para modales de inicio/fin de partido
  const [showInitModal, setShowInitModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedMatchData, setSelectedMatchData] = useState<{
    localTeam: { nombre: string; id: number };
    visitanteTeam: { nombre: string; id: number };
    fecha: string;
  } | null>(null);

  // Estados para jugadores de los equipos
  const [localTeamPlayers, setLocalTeamPlayers] = useState<PlayerWithStatsResponse[]>([]);
  const [visitanteTeamPlayers, setVisitanteTeamPlayers] = useState<PlayerWithStatsResponse[]>([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  // Estados para modal de convocatoria
  const [showConvocatoriaModal, setShowConvocatoriaModal] = useState(false);
  const [convocatoriaMatchData, setConvocatoriaMatchData] = useState<{
    id_partido: number;
    id_equipo: number;
    nombre_equipo: string;
    fecha: string;
    estado: string;
  } | null>(null);

  // Estados para modal de crear partido
  const [showCreateMatchModal, setShowCreateMatchModal] = useState(false);

  // Estados para modal de editar partido
  const [showEditMatchModal, setShowEditMatchModal] = useState(false);
  const [matchToEdit, setMatchToEdit] = useState<MatchWithTeams | null>(null);

  // Estados para modal de selección de equipo (admin)
  const [showTeamSelectorModal, setShowTeamSelectorModal] = useState(false);
  const [teamSelectorData, setTeamSelectorData] = useState<{
    id_partido: number;
    nombre_equipo_local: string;
    id_equipo_local: number;
    nombre_equipo_visitante: string;
    id_equipo_visitante: number;
    accion: 'convocatoria';
  } | null>(null);

  // Estado para el ID del equipo del entrenador
  const [miEquipoId, setMiEquipoId] = useState<number | null>(null);
  const [isLoadingEquipo, setIsLoadingEquipo] = useState(false);
  const [equipoError, setEquipoError] = useState<string | null>(null);

  // Estado para el ID del equipo del delegado
  const [delegadoEquipoId, setDelegadoEquipoId] = useState<number | null>(null);
  const [isLoadingDelegadoEquipo, setIsLoadingDelegadoEquipo] = useState(false);

  // Calcular roles primero (necesario para el useEffect de carga de equipo)
  const isAdmin = userRole === 'admin';
  const isCoach = userRole === 'entrenador';
  const isDelegate = userRole === 'delegado';
  const isPlayer = userRole === 'jugador';
  const isViewer = userRole === 'observador' || !userRole;

  // Cargar ID del equipo del usuario al montar
  useEffect(() => {
    const cargarMiEquipo = async () => {
      if (!selectedLeague?.id || !isCoach) return;

      setIsLoadingEquipo(true);
      setEquipoError(null);
      try {
        const data = await apiGet<{ id_equipo: number }>('/equipos/usuario/mi-equipo', {
          liga_id: selectedLeague.id,
        });
        setMiEquipoId(data.id_equipo);
        console.log('Equipo del entrenador cargado:', data.id_equipo);
      } catch (error) {
        console.error('Error al cargar mi equipo:', error);
        setEquipoError('No se pudo cargar tu equipo. Asegúrate de estar registrado como entrenador en esta liga.');
        setMiEquipoId(null);
      } finally {
        setIsLoadingEquipo(false);
      }
    };
    cargarMiEquipo();
  }, [selectedLeague?.id, isCoach]);

  // Cargar ID del equipo del delegado al montar
  useEffect(() => {
    const cargarEquipoDelegado = async () => {
      if (!selectedLeague?.id || !isDelegate) return;

      setIsLoadingDelegadoEquipo(true);
      try {
        const data = await apiGet<{ id_equipo: number }>('/equipos/usuario/mi-equipo', {
          liga_id: selectedLeague.id,
        });
        setDelegadoEquipoId(data.id_equipo);
        console.log('Equipo del delegado cargado:', data.id_equipo);
      } catch (error) {
        console.error('Error al cargar equipo del delegado:', error);
        setDelegadoEquipoId(null);
      } finally {
        setIsLoadingDelegadoEquipo(false);
      }
    };
    cargarEquipoDelegado();
  }, [selectedLeague?.id, isDelegate]);

  const loadData = async () => {
    if (!selectedLeague) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [jornadasData, proximosData, enVivoData] = await Promise.all([
        fetchMatchesByJornada(selectedLeague.id),
        fetchUpcomingMatches(5, selectedLeague.id),
        fetchLiveMatches(selectedLeague.id),
      ]);

      setJornadas(jornadasData);
      setProximosPartidos(proximosData);
      setPartidosEnVivo(enVivoData);
    } catch (err) {
      // Manejo específico de errores según el tipo
      if (typeof err === 'object' && err !== null && 'statusCode' in err) {
        const apiError = err as { statusCode: number; message: string; isNetworkError: boolean };

        if (apiError.isNetworkError || apiError.statusCode === 0) {
          setError('No se puede conectar con el servidor. Verifica tu conexión a internet.');
        } else if (apiError.statusCode === 404) {
          setError('No se encontró el calendario. Es posible que la liga no tenga partidos creados.');
        } else if (apiError.statusCode >= 500) {
          setError('Error del servidor. Por favor, intenta más tarde.');
        } else if (apiError.statusCode === 401) {
          setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (apiError.statusCode === 403) {
          setError('No tienes permisos para acceder a esta liga.');
        } else {
          setError(apiError.message || 'Error al cargar el calendario');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Error al cargar el calendario');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague]);

  const handleCreateCalendar = async (config: CalendarConfig) => {
    if (!selectedLeague?.id) return;

    try {
      // Convertir de camelCase (frontend) a snake_case (backend)
      const configBackend = {
        tipo: config.tipo,
        fecha_inicio: config.fechaInicio,
        dias_partido: config.diasPartido,
        hora: config.hora,
      };

      if (isEditMode) {
        // Modo edición: actualizar calendario existente
        await updateCalendar(selectedLeague.id, configBackend);
        toast.showSuccess('Calendario actualizado exitosamente');
      } else {
        // Modo creación: crear nuevo calendario
        await createCalendar(selectedLeague.id, configBackend);
        toast.showSuccess('Calendario creado exitosamente');
      }
      setShowCreateCalendarModal(false);
      setIsEditMode(false);
      await loadData(); // Recargar datos
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar el calendario';
      toast.showError(message);
    }
  };

  const handleDeleteCalendar = async () => {
    if (!selectedLeague?.id) return;

    try {
      const resultado = await deleteCalendar(selectedLeague.id);
      toast.showSuccess(`Calendario eliminado: ${resultado.partidos_eliminados} partidos, ${resultado.jornadas_eliminadas} jornadas`);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar el calendario';
      toast.showError(message);
    }
  };

  const handleEditCalendar = async () => {
    if (!selectedLeague?.id) return;

    try {
      const configBackend = await fetchCalendarConfig(selectedLeague.id);
      // Convertir de snake_case (backend) a camelCase (frontend)
      const config: CalendarConfig = {
        tipo: configBackend.tipo,
        fechaInicio: configBackend.fecha_inicio,
        diasPartido: configBackend.dias_partido,
        hora: configBackend.hora,
      };
      // Cargar config en el modal y abrirlo en modo edición
      setInitialConfig(config);
      setIsEditMode(true);
      setShowCreateCalendarModal(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar la configuración del calendario';
      toast.showError(message);
    }
  };

  const handleCreateMatch = () => {
    if (!selectedLeague?.id) return;
    setShowCreateMatchModal(true);
  };

  const handleEditMatch = (idPartido: number) => {
    const partido = partidosFiltrados.find(p => p.id_partido === idPartido);
    if (!partido) return;
    setMatchToEdit(partido);
    setShowEditMatchModal(true);
  };

  const handleEditMatchSuccess = () => {
    setShowEditMatchModal(false);
    setMatchToEdit(null);
    loadData();
  };

  const handleOpenCreateCalendar = () => {
    setIsEditMode(false);
    setShowCreateCalendarModal(true);
  };

  const handleOpenEditCalendar = () => {
    setIsEditMode(true);
    setShowCreateCalendarModal(true);
  };

  const handleConfirmCreateMatch = () => {
    setShowCreateMatchModal(false);
    loadData();
  };

  const handleInitMatch = async (idPartido: number) => {
    // Buscar el partido en los datos cargados
    const partido = partidosFiltrados.find(p => p.id_partido === idPartido);
    if (!partido || !selectedLeague) return;

    // Guardar datos del partido para el modal
    setSelectedMatchId(idPartido);
    setSelectedMatchData({
      localTeam: {
        nombre: partido.nombre_equipo_local,
        id: partido.id_equipo_local,
      },
      visitanteTeam: {
        nombre: partido.nombre_equipo_visitante,
        id: partido.id_equipo_visitante,
      },
      fecha: partido.fecha,
    });
    setShowInitModal(true);
  };

  const handleConfirmInitMatch = async () => {
    if (!selectedMatchId) return;

    try {
      await startMatch(selectedMatchId);
      toast.showSuccess('Partido iniciado correctamente');
      setShowInitModal(false);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar el partido';
      toast.showError(message);
    }
  };

  const handleFinishMatch = async (idPartido: number) => {
    // Buscar el partido en los datos cargados
    const partido = partidosFiltrados.find(p => p.id_partido === idPartido);
    if (!partido || !selectedLeague) return;

    // Guardar datos del partido para el modal
    setSelectedMatchId(idPartido);
    setSelectedMatchData({
      localTeam: {
        nombre: partido.nombre_equipo_local,
        id: partido.id_equipo_local,
      },
      visitanteTeam: {
        nombre: partido.nombre_equipo_visitante,
        id: partido.id_equipo_visitante,
      },
      fecha: partido.fecha,
    });
    setShowFinishModal(true);
  };

  const handleConfirmFinishMatch = async (data: FinishData) => {
    if (!selectedMatchId) return;

    try {
      const payload: FinishMatchPayload = {
        goles_local: data.goles_local,
        goles_visitante: data.goles_visitante,
        id_mvp: data.id_mvp,
        puntuacion_mvp: data.puntuacion_mvp,
        incidencias: data.incidencias,
      };
      await finishMatch(selectedMatchId, payload);
      toast.showSuccess('Partido finalizado correctamente');
      setShowFinishModal(false);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al finalizar el partido';
      toast.showError(message);
    }
  };

  const handleManageConvocatoria = async (idPartido: number) => {
    // Buscar el partido para obtener los datos
    const partido = partidosFiltrados.find(p => p.id_partido === idPartido);
    if (!partido) return;

    // Si es admin, mostrar modal de selección de equipo
    if (isAdmin) {
      setTeamSelectorData({
        id_partido: idPartido,
        nombre_equipo_local: partido.nombre_equipo_local,
        id_equipo_local: partido.id_equipo_local,
        nombre_equipo_visitante: partido.nombre_equipo_visitante,
        id_equipo_visitante: partido.id_equipo_visitante,
        accion: 'convocatoria',
      });
      setShowTeamSelectorModal(true);
      return;
    }

    // Para entrenador: verificar si hay error al cargar el equipo
    if (equipoError) {
      toast.showError(equipoError);
      return;
    }

    // Verificar que miEquipoId esté cargado
    if (isLoadingEquipo) {
      toast.showInfo('Cargando información del equipo... Por favor, inténtalo de nuevo en un momento.');
      return;
    }

    if (!miEquipoId) {
      toast.showError('No se encontró tu equipo. Asegúrate de estar registrado como entrenador en esta liga.');
      return;
    }

    // Determinar el equipo del coach
    const equipoId = partido.id_equipo_local === miEquipoId
      ? partido.id_equipo_local
      : partido.id_equipo_visitante === miEquipoId
      ? partido.id_equipo_visitante
      : null;

    if (!equipoId) {
      toast.showError('No tienes un equipo asignado en este partido');
      return;
    }

    setConvocatoriaMatchData({
      id_partido: idPartido,
      id_equipo: equipoId,
      nombre_equipo: equipoId === partido.id_equipo_local
        ? partido.nombre_equipo_local
        : partido.nombre_equipo_visitante,
      fecha: partido.fecha,
      estado: partido.estado,
    });
    setShowConvocatoriaModal(true);
  };

  const handleManageLineup = async (idPartido: number) => {
    // Buscar el partido para obtener los datos
    const partido = partidosFiltrados.find(p => p.id_partido === idPartido);
    if (!partido) return;

    // Si es admin, mostrar modal de selección de equipo
    if (isAdmin) {
      setTeamSelectorData({
        id_partido: idPartido,
        nombre_equipo_local: partido.nombre_equipo_local,
        id_equipo_local: partido.id_equipo_local,
        nombre_equipo_visitante: partido.nombre_equipo_visitante,
        id_equipo_visitante: partido.id_equipo_visitante,
        accion: 'convocatoria',
      });
      setShowTeamSelectorModal(true);
      return;
    }

    // Para entrenador: verificar si hay error al cargar el equipo
    if (equipoError) {
      toast.showError(equipoError);
      return;
    }

    // Verificar que miEquipoId esté cargado
    if (isLoadingEquipo) {
      toast.showInfo('Cargando información del equipo... Por favor, inténtalo de nuevo en un momento.');
      return;
    }

    if (!miEquipoId) {
      toast.showError('No se encontró tu equipo. Asegúrate de estar registrado como entrenador en esta liga.');
      return;
    }

    const equipoId = partido.id_equipo_local === miEquipoId
      ? partido.id_equipo_local
      : partido.id_equipo_visitante === miEquipoId
      ? partido.id_equipo_visitante
      : null;

    if (!equipoId) {
      toast.showError('No tienes un equipo asignado en este partido');
      return;
    }

    setConvocatoriaMatchData({
      id_partido: idPartido,
      id_equipo: equipoId,
      nombre_equipo: equipoId === partido.id_equipo_local
        ? partido.nombre_equipo_local
        : partido.nombre_equipo_visitante,
      fecha: partido.fecha,
      estado: partido.estado,
    });

    setShowConvocatoriaModal(true);
  };

  // Handler para cuando el admin selecciona un equipo
  const handleTeamSelected = (equipoId: number, nombreEquipo: string) => {
    setShowTeamSelectorModal(false);

    if (!teamSelectorData) return;

    const partido = partidosFiltrados.find(p => p.id_partido === teamSelectorData.id_partido);
    if (!partido) return;

    if (teamSelectorData.accion === 'convocatoria') {
      setConvocatoriaMatchData({
        id_partido: teamSelectorData.id_partido,
        id_equipo: equipoId,
        nombre_equipo: nombreEquipo,
        fecha: partido.fecha,
        estado: partido.estado,
      });
      setShowConvocatoriaModal(true);
    }
  };

  const handleRegisterEvent = async (idPartido: number) => {
    // Buscar el partido para obtener los equipos
    const partido = partidosFiltrados.find(p => p.id_partido === idPartido);
    if (!partido) return;

    setIsLoadingPlayers(true);
    setSelectedMatchId(idPartido);
    setSelectedMatchData({
      localTeam: {
        nombre: partido.nombre_equipo_local,
        id: partido.id_equipo_local,
      },
      visitanteTeam: {
        nombre: partido.nombre_equipo_visitante,
        id: partido.id_equipo_visitante,
      },
      fecha: partido.fecha,
    });

    // Cargar jugadores de ambos equipos
    try {
      const [localPlayers, visitantePlayers] = await Promise.all([
        fetchTeamSquad(partido.id_equipo_local),
        fetchTeamSquad(partido.id_equipo_visitante),
      ]);
      setLocalTeamPlayers(localPlayers);
      setVisitanteTeamPlayers(visitantePlayers);
    } catch (error) {
      console.error('Error al cargar jugadores:', error);
      // Continuar aunque no se puedan cargar los jugadores (se mostrarán vacíos)
    } finally {
      setIsLoadingPlayers(false);
    }

    setShowEventModal(true);
  };

  const handleEventRegistered = async () => {
    // Recargar datos después de registrar evento
    await loadData();
  };

  // Calcular minuto del partido en vivo
  const getMatchMinute = (partidoId: number): number => {
    const partido = partidosEnVivo.find(p => p.id_partido === partidoId);
    if (!partido) return 0;

    const inicio = new Date(partido.fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - inicio.getTime();
    const minutos = Math.floor(diffMs / 60000);
    return Math.min(Math.max(minutos, 0), 120); // Limitar entre 0 y 120 minutos
  };

  // Filtrar partidos por jornada (se mantiene para futura implementación)
  const partidosFiltrados = jornadas.flatMap((j) => j.partidos);

  // Calcular estadísticas
  const totalPartidos = jornadas.reduce((acc, j) => acc + j.partidos.length, 0);
  const totalJornadas = jornadas.length;
  const proximosCount = proximosPartidos.length;
  const enVivoCount = partidosEnVivo.length;

  // Obtener jugadores de los equipos para el selector MVP
  const jugadoresParaMvp = selectedMatchData ? [
    // Se cargarán dinámicamente desde la API cuando se implemente
    // Por ahora se pasa array vacío, el modal mostrará solo los equipos
  ] : [];

  // Sin liga seleccionada
  if (!selectedLeague) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-400 text-sm">Selecciona una liga primero</p>
          </div>
        </div>
      </>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <>
        <Nav leagueName={leagueName} userRole={userRole} />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-400 text-sm">Cargando calendario...</p>
          </div>
        </div>
      </>
    );
  }

  // Error
  if (error) {
    return (
      <>
        <Nav leagueName={leagueName} userRole={userRole} />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadData}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </>
    );
  }

  // Renderizar componente según rol
  const commonProps = {
    jornadas,
    partidosEnVivo,
    partidosFiltrados,
    totalPartidos,
    totalJornadas,
    proximosCount,
    enVivoCount,
    onCreateCalendar: () => setShowCreateCalendarModal(true),
    onOpenCreateCalendar: handleOpenCreateCalendar,
    onOpenEditCalendar: handleOpenEditCalendar,
    onCreateMatch: handleCreateMatch,
    onInitMatch: handleInitMatch,
    onFinishMatch: handleFinishMatch,
    onManageConvocatoria: handleManageConvocatoria,
    onEditMatch: handleEditMatch,
    onEditCalendar: handleEditCalendar,
    onDeleteCalendar: handleDeleteCalendar,
    showCreateCalendarModal,
    setShowCreateCalendarModal,
    handleCreateCalendar,
    ligaId: selectedLeague?.id,
    partidos: partidosFiltrados,
  };

  return (
    <>
      <Nav leagueName={leagueName} userRole={userRole} />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-1">Calendario</h1>
          <p className="text-zinc-400 text-sm">Gestiona todos los encuentros de la liga</p>
        </div>

        {isAdmin && (
          <AdminCalendar
            {...commonProps}
            onManageConvocatoria={handleManageConvocatoria}
            onRegisterEvent={handleRegisterEvent}
            isEditMode={isEditMode}
            initialConfig={initialConfig}
            onOpenCreateCalendar={handleOpenCreateCalendar}
            onOpenEditCalendar={handleOpenEditCalendar}
          />
        )}
        {isCoach && (
          <CoachCalendar
            {...commonProps}
            onManageConvocatoria={handleManageConvocatoria}
            equipoId={miEquipoId || undefined}
            isLoadingEquipo={isLoadingEquipo}
            equipoError={equipoError}
          />
        )}
        {isDelegate && (
          <DelegateCalendar
            {...commonProps}
            onRegisterEvent={handleRegisterEvent}
            equipoId={delegadoEquipoId || undefined}
            isLoadingEquipo={isLoadingDelegadoEquipo}
          />
        )}
        {isPlayer && <PlayerCalendar {...commonProps} />}
        {isViewer && <ViewerCalendar {...commonProps} />}
      </div>

      {/* Modales de inicio y fin de partido */}
      {selectedMatchData && (
        <>
          <InitMatchModal
            isOpen={showInitModal}
            onClose={() => setShowInitModal(false)}
            onConfirm={handleConfirmInitMatch}
            localTeam={selectedMatchData.localTeam}
            visitanteTeam={selectedMatchData.visitanteTeam}
            fecha={selectedMatchData.fecha}
            competicion={leagueName || 'Competición'}
            campo="Campo Principal"
          />
          <FinishMatchModal
            isOpen={showFinishModal}
            onClose={() => setShowFinishModal(false)}
            onConfirm={handleConfirmFinishMatch}
            localTeam={selectedMatchData.localTeam}
            visitanteTeam={selectedMatchData.visitanteTeam}
            jugadores={jugadoresParaMvp}
          />
          <EventRecorderModal
            isOpen={showEventModal}
            onClose={() => setShowEventModal(false)}
            onEventRegistered={handleEventRegistered}
            partidoId={selectedMatchId!}
            localTeam={selectedMatchData.localTeam}
            visitanteTeam={selectedMatchData.visitanteTeam}
            localPlayers={localTeamPlayers}
            visitantePlayers={visitanteTeamPlayers}
            minuto={getMatchMinute(selectedMatchId!)}
          />
        </>
      )}

      {/* Modal de convocatoria */}
      {convocatoriaMatchData && (
        <ConvocatoriaModal
          isOpen={showConvocatoriaModal}
          onClose={() => setShowConvocatoriaModal(false)}
          onSuccess={loadData}
          partidoId={convocatoriaMatchData.id_partido}
          equipoId={convocatoriaMatchData.id_equipo}
          nombreEquipo={convocatoriaMatchData.nombre_equipo}
          partidoFecha={convocatoriaMatchData.fecha}
          competicion={leagueName || 'Competición'}
          estadoPartido={convocatoriaMatchData.estado}
          canEdit={isCoach || isAdmin}
        />
      )}

      {/* Modal de crear partido */}
      {selectedLeague?.id && showCreateMatchModal && (
        <CreateMatchModal
          isOpen={showCreateMatchModal}
          onClose={() => setShowCreateMatchModal(false)}
          ligaId={selectedLeague.id}
          onSuccess={handleConfirmCreateMatch}
        />
      )}

      {/* Modal de editar partido */}
      {matchToEdit && (
        <EditMatchModal
          isOpen={showEditMatchModal}
          onClose={() => { setShowEditMatchModal(false); setMatchToEdit(null); }}
          onSuccess={handleEditMatchSuccess}
          match={{
            id_partido: matchToEdit.id_partido,
            league: selectedLeague?.nombre || '',
            home: matchToEdit.nombre_equipo_local,
            away: matchToEdit.nombre_equipo_visitante,
            date: matchToEdit.fecha.split('T')[0],
            time: matchToEdit.fecha.split('T')[1]?.slice(0, 5) || '00:00',
            estado: matchToEdit.estado,
            fecha_completa: matchToEdit.fecha,
            id_equipo_local: matchToEdit.id_equipo_local,
            id_equipo_visitante: matchToEdit.id_equipo_visitante,
            nombre_equipo_local: matchToEdit.nombre_equipo_local,
            nombre_equipo_visitante: matchToEdit.nombre_equipo_visitante,
            goles_local: matchToEdit.goles_local,
            goles_visitante: matchToEdit.goles_visitante,
          }}
        />
      )}

      {/* Modal de selección de equipo (para admin) */}
      {teamSelectorData && (
        <TeamSelectorModal
          isOpen={showTeamSelectorModal}
          onClose={() => setShowTeamSelectorModal(false)}
          onTeamSelected={handleTeamSelected}
          nombreEquipoLocal={teamSelectorData.nombre_equipo_local}
          idEquipoLocal={teamSelectorData.id_equipo_local}
          nombreEquipoVisitante={teamSelectorData.nombre_equipo_visitante}
          idEquipoVisitante={teamSelectorData.id_equipo_visitante}
          accion={teamSelectorData.accion}
        />
      )}
    </>
  );
}
