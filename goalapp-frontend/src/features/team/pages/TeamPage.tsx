import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaExclamationCircle, FaShieldAlt, FaUser, FaCheck, FaMinus, FaTimes, FaSearch, FaPlus } from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { apiGet } from '../../../services/api';
import CreateTeamModal from '../components/CreateTeamModal';

interface EquipoRendimiento {
  id_equipo: number;
  nombre: string;
  escudo: string | null;
  colores: string | null;
  id_liga: number;
  partidos_jugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  porcentaje_victorias: number;
}

export default function TeamPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;
  const navigate = useNavigate();

  const [equipos, setEquipos] = useState<EquipoRendimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadEquipos = async () => {
    if (!selectedLeague) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiGet<EquipoRendimiento[]>(`/equipos/ligas/${selectedLeague.id}/rendimiento`);
      setEquipos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los equipos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadEquipos();
  };

  useEffect(() => {
    loadEquipos();
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

  // Filtrar equipos por búsqueda
  const equiposFiltrados = equipos.filter((equipo) =>
    equipo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <Nav leagueName={leagueName} userRole={userRole} />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] p-6">
        {/* Header con título y acciones */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-white text-xl font-semibold">Equipos</h1>
            <p className="text-zinc-400 text-sm">Rendimiento de los equipos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Barra de búsqueda */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar Equipo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full sm:w-64 bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
              />
            </div>
            {/* Botón Nuevo equipo */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus />
              <span>Nuevo equipo</span>
            </button>
          </div>
        </div>

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
              onClick={loadEquipos}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Mensaje no hay equipos */}
        {!isLoading && !error && equipos.length === 0 && (
          <div className="text-center py-8 border border-dashed border-zinc-700 rounded-xl mb-6">
            <FaShieldAlt className="text-zinc-600 text-3xl mx-auto mb-2" />
            <p className="text-zinc-400 text-sm">No hay equipos registrados</p>
            <p className="text-zinc-500 text-xs mt-1">Haz clic en "Nuevo equipo" para añadir el primero</p>
          </div>
        )}

        {/* Mensaje sin resultados de búsqueda */}

        {/* Teams grid con rendimiento */}
        {!isLoading && !error && equiposFiltrados.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equiposFiltrados.map((equipo) => (
              <div
                key={equipo.id_equipo}
                onClick={() => navigate(`/teams/${equipo.id_equipo}`)}
                className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer hover:bg-zinc-750"
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Escudo placeholder */}
                    <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-zinc-400 text-lg" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{equipo.nombre}</h3>
                      <p className="text-zinc-500 text-xs">La Liga</p>
                    </div>
                  </div>
                  {/* Porcentaje de victorias */}
                  <div className="text-lime-400 font-bold text-lg">
                    {equipo.porcentaje_victorias}%
                  </div>
                </div>

                {/* Estadísticas de rendimiento */}
                <div className="mb-3">
                  <p className="text-zinc-400 text-xs mb-2">
                    Victorias {equipo.victorias}/{equipo.partidos_jugados}
                  </p>
                  {/* Barra de progreso */}
                  <div className="flex h-2 rounded-full overflow-hidden bg-zinc-700">
                    <div
                      className="bg-lime-400 transition-all"
                      style={{ width: `${equipo.partidos_jugados > 0 ? (equipo.victorias / equipo.partidos_jugados) * 100 : 0}%` }}
                    />
                    <div
                      className="bg-zinc-500 transition-all"
                      style={{ width: `${equipo.partidos_jugados > 0 ? (equipo.empates / equipo.partidos_jugados) * 100 : 0}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${equipo.partidos_jugados > 0 ? (equipo.derrotas / equipo.partidos_jugados) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Contadores V/E/D */}
                <div className="flex justify-between text-xs">
                  <div className="flex items-center gap-1 text-lime-400">
                    <FaCheck className="text-xs" />
                    <span>{equipo.victorias} V</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <FaMinus className="text-xs" />
                    <span>{equipo.empates} E</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-400">
                    <FaTimes className="text-xs" />
                    <span>{equipo.derrotas} D</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para crear equipo */}
      {selectedLeague && (
        <CreateTeamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCreateSuccess}
          ligaId={selectedLeague.id}
        />
      )}
    </>
  );
}