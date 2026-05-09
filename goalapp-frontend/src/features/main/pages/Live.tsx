import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import Card from '../components/Finish/Card'
import SectionHeader from '../components/dashboard/SectionHeader'
import { FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '../../auth/hooks/useAuth'
import { useSelectedLeague } from '../../../context'
import { useToast } from '../../../contexts/ToastContext'
import { apiGet } from '../../../services/api'
import { fetchLiveMatches, type MatchWithTeams } from '../../match/services/matchApi'
import FinishMatchModal, { type FinishData } from '../../match/components/FinishMatchModal'
import ConvocatoriaModal from '../../match/components/ConvocatoriaModal'
import EventRecorderModal from '../../match/components/EventRecorderModal'
import TeamSelectorModal from '../../calendario/components/TeamSelectorModal'
import { fetchTeamSquad, type PlayerWithStatsResponse } from '../../team/services/teamApi'

export default function Live() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedLeague } = useSelectedLeague()
  const toast = useToast()

  const [liveMatches, setLiveMatches] = useState<MatchWithTeams[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [finishMatchData, setFinishMatchData] = useState<{
    id_partido: number
    localTeam: { nombre: string; id: number }
    visitanteTeam: { nombre: string; id: number }
  } | null>(null)
  const [localTeamPlayers, setLocalTeamPlayers] = useState<PlayerWithStatsResponse[]>([])
  const [visitanteTeamPlayers, setVisitanteTeamPlayers] = useState<PlayerWithStatsResponse[]>([])
  const [delegadoEquipoId, setDelegadoEquipoId] = useState<number | null>(null)
  const [showConvocatoriaModal, setShowConvocatoriaModal] = useState(false)
  const [convocatoriaMatchData, setConvocatoriaMatchData] = useState<{
    id_partido: number
    id_equipo: number
    nombre_equipo: string
    fecha: string
    estado: string
  } | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventMatchData, setEventMatchData] = useState<{
    id_partido: number
    localTeam: { nombre: string; id: number }
    visitanteTeam: { nombre: string; id: number }
  } | null>(null)
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
  const [showTeamSelectorModal, setShowTeamSelectorModal] = useState(false)
  const [teamSelectorData, setTeamSelectorData] = useState<{
    id_partido: number
    nombre_equipo_local: string
    id_equipo_local: number
    nombre_equipo_visitante: string
    id_equipo_visitante: number
    accion: 'convocatoria'
  } | null>(null)

  // Determinar rol del usuario
  const userRole = user?.rol_principal?.toLowerCase() || ''
  const isAdmin = userRole === 'admin'
  const isDelegado = userRole === 'delegado'

  // Función para verificar si el usuario puede registrar eventos en un partido
  const canRegisterEvents = (match: MatchWithTeams): boolean => {
    // Admin siempre puede registrar eventos
    if (isAdmin) {
      return true;
    }
    // Para delegado: solo puede registrar eventos si el partido es de su equipo
    if (!delegadoEquipoId) return false;
    return match.id_equipo_local === delegadoEquipoId || match.id_equipo_visitante === delegadoEquipoId;
  };

  // Cargar el equipo asignado al delegado
  useEffect(() => {
    const cargarEquipo = async () => {
      if (!isDelegado || !selectedLeague?.id) return;
      try {
        const data = await apiGet<{ id_equipo: number }>('/equipos/usuario/mi-equipo', {
          liga_id: selectedLeague.id,
        });
        setDelegadoEquipoId(data.id_equipo);
      } catch (error) {
        console.error('Error al cargar equipo del delegado:', error);
        setDelegadoEquipoId(null);
      }
    };
    cargarEquipo();
  }, [selectedLeague?.id, isDelegado]);

  // Calcular minuto de juego desde fecha_inicio
  const calcularMinuto = (fechaInicio: string): string => {
    const inicio = new Date(fechaInicio)
    const ahora = new Date()
    const diffMs = ahora.getTime() - inicio.getTime()
    const minutos = Math.floor(diffMs / 60000)

    return `${minutos}'`
  }

  // Función para abrir el modal de finalizar partido
  const handleOpenFinishMatchModal = async (match: MatchWithTeams) => {
    try {
      const [localPlayers, visitantePlayers] = await Promise.all([
        fetchTeamSquad(match.id_equipo_local),
        fetchTeamSquad(match.id_equipo_visitante),
      ])

      setLocalTeamPlayers(localPlayers)
      setVisitanteTeamPlayers(visitantePlayers)

      setFinishMatchData({
        id_partido: match.id_partido,
        localTeam: { nombre: match.nombre_equipo_local, id: match.id_equipo_local },
        visitanteTeam: { nombre: match.nombre_equipo_visitante, id: match.id_equipo_visitante },
      })
      setShowFinishModal(true)
    } catch (error) {
      console.error('Error al cargar jugadores:', error)
      toast.showError('No se pudo cargar la información de los jugadores')
    }
  }

  // Función para confirmar la finalización del partido
  const handleConfirmFinishMatch = async (data: FinishData) => {
    if (!finishMatchData) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/v1/partidos/${finishMatchData.id_partido}/finalizar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Error al finalizar el partido')

      setShowFinishModal(false)
      setFinishMatchData(null)
      toast.showSuccess('Partido finalizado correctamente')

      // Recargar partidos en vivo
      if (selectedLeague?.id) {
        const matches = await fetchLiveMatches(selectedLeague.id)
        setLiveMatches(matches)
      }
    } catch (error) {
      console.error('Error al finalizar partido:', error)
      toast.showError('No se pudo finalizar el partido')
      throw error
    }
  }

  // Handler para abrir modal de convocatoria (solo lectura en partidos en vivo)
  const handleOpenConvocatoria = (match: MatchWithTeams) => {
    if (isAdmin) {
      setTeamSelectorData({
        id_partido: match.id_partido,
        nombre_equipo_local: match.nombre_equipo_local,
        id_equipo_local: match.id_equipo_local,
        nombre_equipo_visitante: match.nombre_equipo_visitante,
        id_equipo_visitante: match.id_equipo_visitante,
        accion: 'convocatoria',
      })
      setShowTeamSelectorModal(true)
      return
    }

    // Para coach/delegado, mostrar convocatoria de su equipo si está jugando
    const equipoId = match.id_equipo_local === delegadoEquipoId
      ? match.id_equipo_local
      : match.id_equipo_visitante === delegadoEquipoId
      ? match.id_equipo_visitante
      : null

    if (!equipoId) {
      toast.showError('No tienes un equipo asignado en este partido')
      return
    }

    setConvocatoriaMatchData({
      id_partido: match.id_partido,
      id_equipo: equipoId,
      nombre_equipo: equipoId === match.id_equipo_local
        ? match.nombre_equipo_local
        : match.nombre_equipo_visitante,
      fecha: match.fecha,
      estado: 'en_juego',
    })
    setShowConvocatoriaModal(true)
  }

  // Handler para cuando el admin selecciona un equipo en el TeamSelector
  const handleTeamSelected = (equipoId: number, nombreEquipo: string) => {
    setShowTeamSelectorModal(false)
    if (!teamSelectorData) return

    setConvocatoriaMatchData({
      id_partido: teamSelectorData.id_partido,
      id_equipo: equipoId,
      nombre_equipo: nombreEquipo,
      fecha: new Date().toISOString(),
      estado: 'en_juego',
    })
    setShowConvocatoriaModal(true)
    setTeamSelectorData(null)
  }

  // Handler para abrir modal de eventos
  const handleOpenEventModal = async (match: MatchWithTeams) => {
    setIsLoadingPlayers(true)
    try {
      const [localPlayers, visitantePlayers] = await Promise.all([
        fetchTeamSquad(match.id_equipo_local),
        fetchTeamSquad(match.id_equipo_visitante),
      ])
      setLocalTeamPlayers(localPlayers)
      setVisitanteTeamPlayers(visitantePlayers)

      setEventMatchData({
        id_partido: match.id_partido,
        localTeam: { nombre: match.nombre_equipo_local, id: match.id_equipo_local },
        visitanteTeam: { nombre: match.nombre_equipo_visitante, id: match.id_equipo_visitante },
      })
      setShowEventModal(true)
    } catch (error) {
      console.error('Error al cargar jugadores:', error)
      toast.showError('No se pudo cargar la información de los jugadores')
    } finally {
      setIsLoadingPlayers(false)
    }
  }

  // Cargar partidos en vivo al montar
  useEffect(() => {
    async function loadLiveMatches() {
      if (!selectedLeague?.id) {
        setError('No hay liga seleccionada')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Obtener partidos en vivo de la liga seleccionada
        const matches = await fetchLiveMatches(selectedLeague.id)

        setLiveMatches(matches)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar partidos')
      } finally {
        setIsLoading(false)
      }
    }

    loadLiveMatches()
  }, [selectedLeague?.id])

  if (isLoading) {
    return (
      <div className="bg-zinc-950 min-h-screen w-full text-white p-5 px-10 py-6 md:px-20 lg:px-60 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 text-sm">Cargando partidos en vivo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 min-h-screen w-full text-white p-5 px-10 py-6 md:px-20 lg:px-60">
      {/* Header con título y botón volver */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
          </span>
          <h1 className="text-white text-2xl font-semibold">
            Partidos en vivo
          </h1>
        </div>
        <p className="text-zinc-400 text-sm">
          Resultados en vivo este momento
        </p>
      </div>

      {/* Estadísticas superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card number={liveMatches.length} texto={'Vivo'} color={'text-red-600'} />
        <Card
          number={liveMatches.reduce((acc, m) => acc + (m.goles_local || 0) + (m.goles_visitante || 0), 0)}
          texto={'Goles totales'}
          color={'text-lime-600'}
        />
        <Card
          number={liveMatches.length > 0
            ? (liveMatches.reduce((acc, m) => acc + (m.goles_local || 0) + (m.goles_visitante || 0), 0) / liveMatches.length).toFixed(1)
            : 0
          }
          texto={'Goles por partido'}
          color={'text-blue-600'}
        />
      </div>

      {/* Grid de Partidos en Vivo */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Todos los partidos"
          badge={liveMatches.length}
          badgeVariant="danger"
        />

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {liveMatches.length === 0 && !error ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No hay partidos en vivo ahora</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {liveMatches.map((match) => (
              <div
                key={match.id_partido}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-end gap-1 mb-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="text-red-400 text-sm font-medium">
                    {calcularMinuto(match.fecha)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-white font-medium">{match.nombre_equipo_local}</p>
                  </div>
                  <div className="px-4 bg-zinc-800 rounded-lg">
                    <span className="text-white text-xl font-bold">{match.goles_local ?? 0}</span>
                    <span className="text-zinc-500 mx-2">-</span>
                    <span className="text-white text-xl font-bold">{match.goles_visitante ?? 0}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-white font-medium">{match.nombre_equipo_visitante}</p>
                  </div>
                </div>
                <div className='w-full border border-zinc-900 mt-2'></div>
                <div className="flex gap-2 mt-3">
                  {canRegisterEvents(match) && (
                    <button
                      onClick={() => handleOpenEventModal(match)}
                      className="flex-1 px-3 py-1.5 text-sm font-bold rounded-lg transition-colors border-2 bg-lime-800/40 text-lime-300 hover:bg-lime-800/60 border-lime-700"
                    >
                      🏆 Eventos
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenConvocatoria(match)}
                    className="flex-1 px-3 py-1.5 text-sm font-bold rounded-lg transition-colors border-2 bg-cyan-800/30 text-cyan-700 hover:bg-cyan-800/50 border-cyan-700"
                  >
                    👥 Convocatoria
                  </button>
                  {(isAdmin || canRegisterEvents(match)) && (
                    <button
                      onClick={() => handleOpenFinishMatchModal(match)}
                      className="flex-1 px-3 py-1.5 text-sm font-bold rounded-lg transition-colors border-2 bg-yellow-800/30 text-yellow-700 hover:bg-yellow-800/50 border-yellow-700"
                    >
                      🔒 Finalizar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de finalizar partido */}
      {finishMatchData && (
        <FinishMatchModal
          isOpen={showFinishModal}
          onClose={() => {
            setShowFinishModal(false)
            setFinishMatchData(null)
          }}
          onConfirm={handleConfirmFinishMatch}
          localTeam={finishMatchData.localTeam}
          visitanteTeam={finishMatchData.visitanteTeam}
          jugadores={[
            ...localTeamPlayers.map(p => ({
              id: p.id_jugador,
              nombre: p.nombre,
              id_equipo: finishMatchData.localTeam.id,
              dorsal: p.dorsal,
            })),
            ...visitanteTeamPlayers.map(p => ({
              id: p.id_jugador,
              nombre: p.nombre,
              id_equipo: finishMatchData.visitanteTeam.id,
              dorsal: p.dorsal,
            })),
          ]}
        />
      )}

      {/* Modal de convocatoria (solo lectura) */}
      {convocatoriaMatchData && (
        <ConvocatoriaModal
          isOpen={showConvocatoriaModal}
          onClose={() => {
            setShowConvocatoriaModal(false)
            setConvocatoriaMatchData(null)
          }}
          onSuccess={() => {}}
          partidoId={convocatoriaMatchData.id_partido}
          equipoId={convocatoriaMatchData.id_equipo}
          nombreEquipo={convocatoriaMatchData.nombre_equipo}
          partidoFecha={convocatoriaMatchData.fecha}
          competicion={selectedLeague?.nombre || 'Competición'}
          estadoPartido={convocatoriaMatchData.estado}
          canEdit={false}
        />
      )}

      {/* Modal de registro de eventos */}
      {eventMatchData && (
        <EventRecorderModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false)
            setEventMatchData(null)
          }}
          onEventRegistered={async () => {
            setShowEventModal(false)
            if (selectedLeague?.id) {
              const matches = await fetchLiveMatches(selectedLeague.id)
              setLiveMatches(matches)
            }
          }}
          partidoId={eventMatchData.id_partido}
          localTeam={eventMatchData.localTeam}
          visitanteTeam={eventMatchData.visitanteTeam}
          localPlayers={localTeamPlayers}
          visitantePlayers={visitanteTeamPlayers}
          minuto={0}
        />
      )}

      {/* Modal de selección de equipo para convocatoria */}
      {teamSelectorData && (
        <TeamSelectorModal
          isOpen={showTeamSelectorModal}
          onClose={() => {
            setShowTeamSelectorModal(false)
            setTeamSelectorData(null)
          }}
          onTeamSelected={handleTeamSelected}
          nombreEquipoLocal={teamSelectorData.nombre_equipo_local}
          idEquipoLocal={teamSelectorData.id_equipo_local}
          nombreEquipoVisitante={teamSelectorData.nombre_equipo_visitante}
          idEquipoVisitante={teamSelectorData.id_equipo_visitante}
          accion={teamSelectorData.accion}
        />
      )}
    </div>
  )
}
