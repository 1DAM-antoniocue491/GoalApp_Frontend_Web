import { useState, useEffect } from 'react';
import { FaCalendar, FaFilter, FaPlus, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import MatchCard from '../components/MatchCard';
import StatsCard from '../components/StatsCard';
import CardAdmin from '../components/CardAdmin';
import CreateCalendarModal, { type CalendarConfig } from '../components/CreateCalendarModal';
import {
  fetchMatchesByJornada,
  fetchUpcomingMatches,
  fetchLiveMatches,
  createCalendar,
  type MatchWithTeams,
  type Jornada,
} from '../../match/services/matchApi';

export default function CalendarioPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [jornadas, setJornadas] = useState<Jornada[]>([]);
  const [proximosPartidos, setProximosPartidos] = useState<MatchWithTeams[]>([]);
  const [partidosEnVivo, setPartidosEnVivo] = useState<MatchWithTeams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroJornada, setFiltroJornada] = useState<number | 'all'>('all');
  const [showCreateCalendarModal, setShowCreateCalendarModal] = useState(false);

  const isAdmin = userRole === 'admin';
  const isCoach = userRole === 'entrenador';
  const isDelegate = userRole === 'delegado';

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
        fetchUpcomingMatches(5),
        fetchLiveMatches(),
      ]);

      setJornadas(jornadasData);
      setProximosPartidos(proximosData);
      setPartidosEnVivo(enVivoData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el calendario';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedLeague]);

  const handleCreateCalendar = async (config: CalendarConfig) => {
    if (!selectedLeague?.id) return;

    try {
      await createCalendar(selectedLeague.id, config);
      setShowCreateCalendarModal(false);
      await loadData(); // Recargar datos
      alert('Calendario creado exitosamente');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el calendario';
      alert(message);
    }
  };

  const handleCreateMatch = () => {
    // TODO: Implementar creación de nuevo partido
    console.log('Crear nuevo encuentro para liga:', selectedLeague?.id);
  };

  const handleInitMatch = async (idPartido: number) => {
    // TODO: Implementar inicio de partido
    console.log('Iniciar partido:', idPartido);
  };

  const handleManageConvocatoria = async (idPartido: number) => {
    // TODO: Implementar gestión de convocatoria
    console.log('Gestionar convocatoria:', idPartido);
  };

  const handleManageLineup = async (idPartido: number) => {
    // TODO: Implementar gestión de plantilla
    console.log('Gestionar plantilla:', idPartido);
  };

  // Filtrar partidos por jornada
  const partidosFiltrados =
    filtroJornada === 'all'
      ? jornadas.flatMap((j) => j.partidos)
      : jornadas
          .filter((j) => j.numero === filtroJornada)
          .flatMap((j) => j.partidos);

  // Calcular estadísticas
  const totalPartidos = jornadas.reduce((acc, j) => acc + j.partidos.length, 0);
  const totalJornadas = jornadas.length;
  const proximosCount = proximosPartidos.length;
  const enVivoCount = partidosEnVivo.length;

  // Sin liga seleccionada
  if (!selectedLeague) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <FaCalendar className="text-zinc-600 text-5xl mx-auto mb-4" />
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
        <div className="mb-6">
          <h1 className="text-white text-3xl font-bold mb-1">Calendario</h1>
          <p className="text-zinc-400 text-sm">Gestiona todos los encuentros de la liga</p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 mb-8">
          <StatsCard number={totalPartidos} texto="Total partidos" />
          <StatsCard number={totalJornadas} texto="Jornadas" />
          <StatsCard number={proximosCount} texto="Próximos" color="text-blue-400" />
          <StatsCard number={0} texto="Mañana" color="text-purple-400" />
          <StatsCard number={enVivoCount} texto="Hoy" color="text-lime-400" />
        </div>

        {/* CardAdmin - Solo para admin */}
        <CardAdmin
          isadmin={isAdmin}
          onCreateCalendar={() => setShowCreateCalendarModal(true)}
          onCreateMatch={handleCreateMatch}
        />

        {/* Modal para crear calendario */}
        <CreateCalendarModal
          isOpen={showCreateCalendarModal}
          onClose={() => setShowCreateCalendarModal(false)}
          onSave={handleCreateCalendar}
          ligaId={selectedLeague?.id}
        />

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-lime-400 text-3xl mb-4" />
            <p className="text-zinc-400 text-sm">Cargando calendario...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FaExclamationCircle className="text-red-400 text-4xl mb-4" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadData}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Sin partidos */}
        {!isLoading && !error && totalPartidos === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-700 rounded-xl">
            <FaCalendar className="text-zinc-600 text-5xl mx-auto mb-4" />
            <p className="text-zinc-400 text-sm mb-2">No hay partidos programados</p>
            <p className="text-zinc-500 text-xs">
              {isAdmin ? 'Crea partidos desde la gestión de la liga' : 'Los partidos aparecerán cuando el admin los cree'}
            </p>
          </div>
        )}

        {/* Partidos en vivo */}
        {!isLoading && !error && partidosEnVivo.length > 0 && (
          <div className="mb-8">
            <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-lime-400 animate-pulse">🔴</span>
              En Vivo
            </h2>
            <div className="space-y-4">
              {partidosEnVivo.map((partido) => (
                <MatchCard
                  key={partido.id_partido}
                  id_partido={partido.id_partido}
                  equipo_local={partido.nombre_equipo_local}
                  equipo_visitante={partido.nombre_equipo_visitante}
                  fecha={partido.fecha}
                  isToday
                  isAdmin={isAdmin}
                  isCoach={isCoach}
                  onInitMatch={handleInitMatch}
                  onManageConvocatoria={handleManageConvocatoria}
                />
              ))}
            </div>
          </div>
        )}

        {/* Listado de partidos por jornada */}
        {!isLoading && !error && partidosFiltrados.length > 0 && (
          <div className="space-y-6">
            {filtroJornada === 'all'
              ? jornadas.map((jornada) => (
                  <div key={jornada.numero}>
                    <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="text-lime-400">{jornada.nombre}</span>
                      <span className="text-zinc-500 text-sm">({jornada.partidos.length} partidos)</span>
                    </h2>
                    <div className="space-y-4">
                      {jornada.partidos.map((partido) => (
                        <MatchCard
                          key={partido.id_partido}
                          id_partido={partido.id_partido}
                          equipo_local={partido.nombre_equipo_local}
                          equipo_visitante={partido.nombre_equipo_visitante}
                          fecha={partido.fecha}
                          isToday={new Date(partido.fecha).toDateString() === new Date().toDateString()}
                          isAdmin={isAdmin}
                          isCoach={isCoach}
                          onInitMatch={handleInitMatch}
                          onManageConvocatoria={handleManageConvocatoria}
                        />
                      ))}
                    </div>
                  </div>
                ))
              : partidosFiltrados.map((partido) => (
                  <MatchCard
                    key={partido.id_partido}
                    id_partido={partido.id_partido}
                    equipo_local={partido.nombre_equipo_local}
                    equipo_visitante={partido.nombre_equipo_visitante}
                    fecha={partido.fecha}
                    isToday={new Date(partido.fecha).toDateString() === new Date().toDateString()}
                    isAdmin={isAdmin}
                    isCoach={isCoach}
                    onInitMatch={handleInitMatch}
                    onManageConvocatoria={handleManageConvocatoria}
                  />
                ))}
          </div>
        )}
      </div>
    </>
  );
}
