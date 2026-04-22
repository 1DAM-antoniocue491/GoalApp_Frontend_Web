import { useState, useEffect } from 'react';
import {
  FaSpinner,
  FaExclamationCircle,
  FaChartBar,
  FaTrophy,
  FaFutbol,
  FaExclamationTriangle,
  FaClipboardList,
  FaUsers,
  FaMedal,
  FaStar,
  FaUser,
} from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import {
  fetchSeasonStats,
  fetchTopScorers,
  fetchMatchdayMVP,
  fetchTeamGoalsStats,
  fetchPlayerPersonalStats,
  type SeasonStatsResponse,
  type TopScorerResponse,
  type MatchdayMVP,
  type TeamGoalsStats,
  type PlayerPersonalStats,
} from '../services/statisticsApi';

export default function StatisticPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [seasonStats, setSeasonStats] = useState<SeasonStatsResponse | null>(null);
  const [topScorers, setTopScorers] = useState<TopScorerResponse[]>([]);
  const [matchdayMVP, setMatchdayMVP] = useState<MatchdayMVP | null>(null);
  const [teamGoalsStats, setTeamGoalsStats] = useState<TeamGoalsStats[]>([]);
  const [myStats, setMyStats] = useState<PlayerPersonalStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!selectedLeague) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [stats, scorers, mvp, teams, myStatsData] = await Promise.all([
        fetchSeasonStats(selectedLeague.id),
        fetchTopScorers(selectedLeague.id, 5),
        fetchMatchdayMVP(selectedLeague.id),
        fetchTeamGoalsStats(selectedLeague.id),
        // Solo cargar stats personales si el usuario es jugador
        selectedLeague.rol === 'jugador' && selectedLeague.usuarioId
          ? fetchPlayerPersonalStats(selectedLeague.id, selectedLeague.usuarioId)
          : Promise.resolve(null),
      ]);
      setSeasonStats(stats);
      setTopScorers(scorers);
      setMatchdayMVP(mvp);
      setTeamGoalsStats(teams);
      setMyStats(myStatsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar estadísticas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedLeague]);

  // Calcular el máximo de goles para la escala del gráfico
  const maxGoals = Math.max(...teamGoalsStats.map((t) => t.goles_favor), 1);

  // Sin liga seleccionada
  if (!selectedLeague) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <FaChartBar className="text-zinc-600 text-5xl mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">Selecciona una liga primero</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav leagueName={leagueName} userRole={userRole} />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-2">Estadísticas</h1>
          <p className="text-zinc-400 text-sm">{leagueName} - Temporada 2025/26</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-lime-400 text-3xl mb-4" />
            <p className="text-zinc-400 text-sm">Cargando estadísticas...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaExclamationCircle className="text-red-400 text-4xl mb-4" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadStats}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Contenido principal */}
        {!isLoading && !error && (
          <div className="space-y-8">
            {/* Mis Estadísticas - Solo para jugadores */}
            {myStats && selectedLeague?.rol === 'jugador' && (
              <div className="bg-gradient-to-r from-lime-900/20 to-emerald-900/20 rounded-xl p-6 border border-lime-700/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-lime-500/20 rounded-full flex items-center justify-center">
                    <FaUser className="text-lime-400 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">Mis Estadísticas</h2>
                    <p className="text-zinc-400 text-sm">{myStats.nombre_equipo}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Goles */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <FaFutbol className="text-lime-400 text-2xl mx-auto mb-2" />
                    <p className="text-zinc-400 text-xs mb-1">Goles</p>
                    <p className="text-white text-2xl font-bold">{myStats.goles}</p>
                  </div>
                  {/* Asistencias */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FaClipboardList className="text-blue-400 text-lg" />
                    </div>
                    <p className="text-zinc-400 text-xs mb-1">Asistencias</p>
                    <p className="text-white text-2xl font-bold">{myStats.asistencias}</p>
                  </div>
                  {/* Partidos jugados */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FaChartBar className="text-purple-400 text-lg" />
                    </div>
                    <p className="text-zinc-400 text-xs mb-1">Partidos</p>
                    <p className="text-white text-2xl font-bold">{myStats.partidos_jugados}</p>
                  </div>
                  {/* MVPs */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <FaStar className="text-yellow-400 text-2xl mx-auto mb-2" />
                    <p className="text-zinc-400 text-xs mb-1">MVPs</p>
                    <p className="text-white text-2xl font-bold">{myStats.veces_mvp}</p>
                  </div>
                  {/* Amarillas */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <FaExclamationTriangle className="text-yellow-400 text-2xl mx-auto mb-2" />
                    <p className="text-zinc-400 text-xs mb-1">Amarillas</p>
                    <p className="text-white text-2xl font-bold">{myStats.tarjetas_amarillas}</p>
                  </div>
                  {/* Rojas */}
                  <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
                    <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-2" />
                    <p className="text-zinc-400 text-xs mb-1">Rojas</p>
                    <p className="text-white text-2xl font-bold">{myStats.tarjetas_rojas}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tarjetas de resumen de temporada */}
            {seasonStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Goles esta temporada */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-lime-500/10 rounded-lg flex items-center justify-center">
                      <FaFutbol className="text-lime-400 text-lg" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs mb-1">Goles esta temporada</p>
                  <p className="text-white text-2xl font-bold">{seasonStats.total_goles}</p>
                </div>

                {/* Tarjetas amarillas */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <FaExclamationTriangle className="text-yellow-400 text-lg" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs mb-1">Tarjetas amarillas</p>
                  <p className="text-white text-2xl font-bold">{seasonStats.total_amarillas}</p>
                </div>

                {/* Tarjetas rojas */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                      <FaExclamationTriangle className="text-red-400 text-lg" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs mb-1">Tarjetas rojas</p>
                  <p className="text-white text-2xl font-bold">{seasonStats.total_rojas}</p>
                </div>

                {/* Partidos jugados */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <FaClipboardList className="text-blue-400 text-lg" />
                    </div>
                  </div>
                  <p className="text-zinc-400 text-xs mb-1">Partidos jugados</p>
                  <p className="text-white text-2xl font-bold">{seasonStats.total_partidos}</p>
                </div>
              </div>
            )}

            {/* MVP de la jornada */}
            {matchdayMVP && (
              <div className="bg-gradient-to-r from-lime-900/30 to-yellow-900/30 rounded-xl p-6 border border-lime-700/30">
                <div className="flex items-center gap-2 mb-4">
                  <FaStar className="text-yellow-400 text-xl" />
                  <h2 className="text-white text-lg font-bold">MVP de la Jornada</h2>
                </div>
                <div className="flex items-center gap-6">
                  {/* Avatar del jugador */}
                  <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-lime-400">
                    <span className="text-white text-2xl font-bold">
                      {matchdayMVP.nombre.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  {/* Información del jugador */}
                  <div className="flex-1">
                    <p className="text-white text-xl font-bold">{matchdayMVP.nombre}</p>
                    <p className="text-zinc-400 text-sm">{matchdayMVP.nombre_equipo}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <FaFutbol className="text-lime-400 text-sm" />
                        <span className="text-white font-semibold">{matchdayMVP.goles} goles</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaClipboardList className="text-blue-400 text-sm" />
                        <span className="text-white font-semibold">{matchdayMVP.asistencias} asistencias</span>
                      </div>
                    </div>
                  </div>
                  {/* Rating */}
                  <div className="text-right">
                    <div className="text-4xl font-bold text-lime-400">{matchdayMVP.rating}</div>
                    <p className="text-zinc-400 text-xs">Rating</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tabla de máximos goleadores */}
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
              <div className="p-4 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                  <FaTrophy className="text-yellow-400 text-lg" />
                  <h2 className="text-white text-lg font-bold">Máximos Goleadores</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-900">
                    <tr>
                      <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3">#</th>
                      <th className="text-left text-zinc-400 text-xs font-medium px-4 py-3">Jugador</th>
                      <th className="text-center text-zinc-400 text-xs font-medium px-4 py-3">Equipo</th>
                      <th className="text-center text-zinc-400 text-xs font-medium px-4 py-3">PJ</th>
                      <th className="text-center text-zinc-400 text-xs font-medium px-4 py-3">Goles</th>
                      <th className="text-center text-zinc-400 text-xs font-medium px-4 py-3">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topScorers.map((scorer, index) => (
                      <tr
                        key={scorer.id_jugador}
                        className="border-b border-zinc-700 hover:bg-zinc-750 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${index === 0 ? 'bg-yellow-500 text-yellow-950' :
                              index === 1 ? 'bg-zinc-400 text-zinc-950' :
                              index === 2 ? 'bg-amber-700 text-amber-100' :
                              'bg-zinc-700 text-zinc-400'}">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">
                                {scorer.nombre.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                              </span>
                            </div>
                            <span className="text-white font-medium text-sm">{scorer.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-400 text-sm">{scorer.nombre_equipo}</td>
                        <td className="px-4 py-3 text-center text-zinc-400 text-sm">{scorer.partidos_jugados}</td>
                        <td className="px-4 py-3 text-center text-lime-400 font-bold text-sm">{scorer.goles}</td>
                        <td className="px-4 py-3 text-center text-zinc-300 text-sm">{scorer.promedio_goles.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Gráfico de barras - Goles promedio por equipo */}
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
              <div className="p-4 border-b border-zinc-700">
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-lime-400 text-lg" />
                  <h2 className="text-white text-lg font-bold">Goles por Equipo (Top 5)</h2>
                </div>
              </div>
              <div className="p-6">
                {teamGoalsStats.length > 0 ? (
                  <div className="space-y-4">
                    {teamGoalsStats.slice(0, 5).map((team, index) => {
                      const barWidth = (team.goles_favor / maxGoals) * 100;
                      return (
                        <div key={team.id_equipo} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">
                                  {team.nombre.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                                </span>
                              </div>
                              <span className="text-white font-medium text-sm">{team.nombre}</span>
                            </div>
                            <span className="text-lime-400 font-bold text-sm">{team.goles_favor} goles</span>
                          </div>
                          {/* Barra de progreso */}
                          <div className="h-3 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-lime-500 to-yellow-400 rounded-full transition-all duration-500"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaChartBar className="text-zinc-600 text-3xl mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm">No hay datos de goles disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
