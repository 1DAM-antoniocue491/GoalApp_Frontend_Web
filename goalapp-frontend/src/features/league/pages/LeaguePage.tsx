import { useState, useEffect } from 'react';
import { FaPlus, FaSpinner, FaExclamationCircle, FaTrophy } from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { fetchAllLeagues, type LeagueResponse } from '../services/leagueApi';
import { CreateLeagueModal } from '../components/CreateLeagueModal';

export default function LeaguePage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [leagues, setLeagues] = useState<LeagueResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadLeagues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllLeagues();
      setLeagues(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar las ligas';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeagues();
  }, []);

  return (
    <>
      <Nav leagueName={leagueName} userRole={userRole} />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-xl font-semibold">Ligas</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-lime-300 text-zinc-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-lime-400 transition-colors"
          >
            <FaPlus className="text-xs" />
            Crear liga
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-lime-400 text-3xl mb-4" />
            <p className="text-zinc-400 text-sm">Cargando ligas...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaExclamationCircle className="text-red-400 text-4xl mb-4" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadLeagues}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && leagues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaTrophy className="text-zinc-600 text-5xl mb-4" />
            <p className="text-zinc-400 text-sm">No hay ligas disponibles</p>
          </div>
        )}

        {/* League grid */}
        {!isLoading && !error && leagues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {leagues.map((league) => (
              <div
                key={league.id_liga}
                className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold text-sm">{league.nombre}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      league.activa
                        ? 'bg-lime-400/15 text-lime-400'
                        : 'bg-zinc-600/30 text-zinc-400'
                    }`}
                  >
                    {league.activa ? 'Activa' : 'Finalizada'}
                  </span>
                </div>
                <p className="text-zinc-400 text-xs">Temporada {league.temporada}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateLeagueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadLeagues}
      />
    </>
  );
}