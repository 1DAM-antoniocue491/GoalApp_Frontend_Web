import { useState, useEffect } from 'react';
import { FaSpinner, FaExclamationCircle, FaShieldAlt } from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { fetchTeamsByLeague, type TeamResponse } from '../services/teamApi';

export default function TeamPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [teams, setTeams] = useState<TeamResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = async () => {
    if (!selectedLeague) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTeamsByLeague(selectedLeague.id);
      setTeams(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los equipos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [selectedLeague]);

  // Sin liga seleccionada
  if (!selectedLeague) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <FaShieldAlt className="text-zinc-600 text-5xl mx-auto mb-4" />
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
        <h1 className="text-white text-xl font-semibold mb-6">Equipos</h1>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-lime-400 text-3xl mb-4" />
            <p className="text-zinc-400 text-sm">Cargando equipos...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaExclamationCircle className="text-red-400 text-4xl mb-4" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadTeams}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && teams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaShieldAlt className="text-zinc-600 text-5xl mb-4" />
            <p className="text-zinc-400 text-sm">No hay equipos en esta liga</p>
          </div>
        )}

        {/* Teams grid */}
        {!isLoading && !error && teams.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <div
                key={team.id_equipo}
                className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Escudo placeholder */}
                  <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt className="text-zinc-400 text-lg" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{team.nombre}</h3>
                    {team.colores && <p className="text-zinc-500 text-xs">{team.colores}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}