import React, { useState, useEffect } from 'react'
import Card from '../components/Finish/Card'
import CardPartidos from '../components/Finish/CardPartidos'
import SectionHeader from '../components/dashboard/SectionHeader'
import { useSelectedLeague } from '../../../context'
import { fetchMatchesWithTeams, fetchMatchEvents, type MatchWithTeams, type MatchEvent } from '../../match/services/matchApi'
import { FiLoader } from 'react-icons/fi'

interface FinishedMatch {
  fecha: string
  resultado: string
  equipo1: string
  equipo2: string
  goles1: string[]
  goles2: string[]
}

export default function Finish() {
  const { selectedLeague } = useSelectedLeague()
  const [finishedMatches, setFinishedMatches] = useState<FinishedMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar partidos finalizados al montar
  useEffect(() => {
    async function loadFinishedMatches() {
      if (!selectedLeague?.id) {
        setError('No hay liga seleccionada')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Obtener partidos con información de equipos
        const matches = await fetchMatchesWithTeams(selectedLeague.id)

        // Filtrar solo los finalizados y ordenar por fecha descendente
        const finished = matches
          .filter(m => m.estado === 'Finalizado')
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

        // Obtener eventos (goles) para cada partido
        const matchesWithEvents = await Promise.all(
          finished.map(async (match) => {
            try {
              const events = await fetchMatchEvents(match.id_partido)
              // Filtrar solo los goles
              const goles = events.filter(e => e.tipo_evento === 'gol')

              // Separar goles por equipo usando id_equipo
              const golesLocal: string[] = []
              const golesVisitante: string[] = []

              goles.forEach((gol) => {
                // Formatear gol con nombre del jugador y minuto
                const golText = gol.nombre_jugador
                  ? `${gol.nombre_jugador} ${gol.minuto}'`
                  : `Jugador ${gol.id_jugador} ${gol.minuto}'`

                // Asignar gol al equipo correspondiente
                if (gol.id_equipo === match.id_equipo_local) {
                  golesLocal.push(golText)
                } else if (gol.id_equipo === match.id_equipo_visitante) {
                  golesVisitante.push(golText)
                }
              })

              return {
                fecha: formatDate(match.fecha),
                resultado: `${match.goles_local ?? 0}-${match.goles_visitante ?? 0}`,
                equipo1: match.nombre_equipo_local,
                equipo2: match.nombre_equipo_visitante,
                goles1: golesLocal,
                goles2: golesVisitante,
              }
            } catch {
              // Si falla obtener eventos, devolver sin goles
              return {
                fecha: formatDate(match.fecha),
                resultado: `${match.goles_local ?? 0}-${match.goles_visitante ?? 0}`,
                equipo1: match.nombre_equipo_local,
                equipo2: match.nombre_equipo_visitante,
                goles1: [],
                goles2: [],
              }
            }
          })
        )

        setFinishedMatches(matchesWithEvents)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar resultados')
      } finally {
        setIsLoading(false)
      }
    }

    loadFinishedMatches()
  }, [selectedLeague?.id])

  // Formatear fecha a formato legible
  function formatDate(fechaStr: string): string {
    const fecha = new Date(fechaStr)
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

    const dayName = dias[fecha.getDay()]
    const day = fecha.getDate()
    const month = meses[fecha.getMonth()]
    const year = fecha.getFullYear()

    return `${dayName} ${day} ${month} ${year}`
  }

  // Calcular estadísticas
  const totalMatches = finishedMatches.length
  const totalGoals = finishedMatches.reduce((acc, m) => {
    const [g1, g2] = m.resultado.split('-').map(n => parseInt(n.trim()))
    return acc + (g1 || 0) + (g2 || 0)
  }, 0)
  const avgGoals = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : 0
  const draws = finishedMatches.filter(m => {
    const [g1, g2] = m.resultado.split('-').map(n => parseInt(n.trim()))
    return g1 === g2
  }).length

  if (isLoading) {
    return (
      <div className="bg-zinc-950 min-h-screen w-full text-white p-5 px-10 py-6 md:px-20 lg:px-60 flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-8 h-8 text-lime-400 animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Cargando resultados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 min-h-screen w-full text-white p-5 px-10 py-6 md:px-20 lg:px-60">
      {/* Header con título */}
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-white text-2xl font-semibold">
          Resultados
        </h1>
        <p className="text-zinc-400 text-sm">
          Resultados de los partidos finalizados esta semana
        </p>
      </div>

      {/* Estadísticas superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card number={totalMatches} texto={'Partidos'} color={'text-lime-600'} />
        <Card number={avgGoals} texto={'Goles por partido'} color={'text-blue-600'}/>
        <Card number={draws} texto={'Empates'} />
      </div>

      {/* Grid de Resultados */}
      <div className="flex flex-col gap-3">
        <SectionHeader
          title="Todos los resultados"
          badge={totalMatches}
        />

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {finishedMatches.length === 0 && !error ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">No hay resultados disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {finishedMatches.map((match, i) => (
              <CardPartidos
                key={i}
                fecha={match.fecha}
                resultado={match.resultado}
                equipo1={match.equipo1}
                equipo2={match.equipo2}
                goles1={match.goles1}
                goles2={match.goles2}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
