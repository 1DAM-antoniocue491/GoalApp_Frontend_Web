import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationCircle, FaChartBar } from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { fetchTeamsByLeague } from '../../team/services/teamApi';
import { fetchPlayersWithStatsByTeam, type PlayerWithStatsResponse } from '../../team/services/teamApi';

interface PlayerWithTeam extends PlayerWithStatsResponse {
  nombreEquipo: string;
}

export default function StatisticPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
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
      const teams = await fetchTeamsByLeague(selectedLeague.id);
      const allPlayers: PlayerWithTeam[] = [];

      for (const team of teams) {
        const teamPlayers = await fetchPlayersWithStatsByTeam(team.id_equipo);
        const playersWithTeam = teamPlayers.map((p: PlayerWithStatsResponse) => ({
          ...p,
          nombreEquipo: team.nombre,
        }));
        allPlayers.push(...playersWithTeam);
      }

      // Ordenar por goles descendente
      allPlayers.sort((a, b) => b.goles - a.goles);
      setPlayers(allPlayers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las estadísticas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedLeague]);

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
        <h1 className="text-white text-xl font-semibold mb-6">Estadísticas</h1>

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

        {/* Empty */}
        {!isLoading && !error && players.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaChartBar className="text-zinc-600 text-5xl mb-4" />
            <p className="text-zinc-400 text-sm">No hay estadísticas disponibles</p>
          </div>
        )}

        {/* Stats table */}
        {!isLoading && !error && players.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left text-zinc-400 font-semibold py-3 px-2">#</th>
                  <th className="text-left text-zinc-400 font-semibold py-3 px-2">Jugador</th>
                  <th className="text-left text-zinc-400 font-semibold py-3 px-2">Equipo</th>
                  <th className="text-center text-zinc-400 font-semibold py-3 px-2">Goles</th>
                  <th className="text-center text-zinc-400 font-semibold py-3 px-2">Asist.</th>
                  <th className="text-center text-zinc-400 font-semibold py-3 px-2">TA</th>
                  <th className="text-center text-zinc-400 font-semibold py-3 px-2">TR</th>
                  <th className="text-center text-zinc-400 font-semibold py-3 px-2">PJ</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={player.id_jugador} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-2 text-zinc-500">{index + 1}</td>
                    <td className="py-3 px-2 text-white font-medium">{player.nombre}</td>
                    <td className="py-3 px-2 text-zinc-400">{player.nombreEquipo}</td>
                    <td className="py-3 px-2 text-center text-lime-400 font-semibold">{player.goles}</td>
                    <td className="py-3 px-2 text-center text-zinc-300">{player.asistencias}</td>
                    <td className="py-3 px-2 text-center text-yellow-400">{player.tarjetas_amarillas}</td>
                    <td className="py-3 px-2 text-center text-red-400">{player.tarjetas_rojas}</td>
                    <td className="py-3 px-2 text-center text-zinc-400">{player.partidos_jugados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}