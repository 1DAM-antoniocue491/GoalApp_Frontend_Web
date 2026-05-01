import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaShieldAlt,
  FaTrophy,
  FaBullseye,
  FaCalendarAlt,
  FaUsers,
  FaUserTie,
  FaMedal,
  FaSpinner,
  FaExclamationCircle,
  FaCheck,
  FaMinus,
  FaTimes,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import {
  fetchTeamDetail,
  fetchTeamNextMatches,
  fetchTeamLastMatches,
  fetchTeamTopScorers,
  fetchTeamSquad,
  fetchTeamStaff,
  type TeamDetailResponse,
  type MatchResult,
  type PlayerWithStatsResponse,
  type TeamStaffResponse,
  updateTeam,
  deleteTeam,
} from '../services/teamApi';
import { useAuth } from '../../auth/hooks/useAuth';
import EditTeamModal from '../components/EditTeamModal';
import DeleteTeamConfirmModal from '../components/DeleteTeamConfirmModal';

export default function TeamDetailPage() {
  const { equipoId } = useParams<{ equipoId: string }>();
  const navigate = useNavigate();
  const { selectedLeague } = useSelectedLeague();
  const { user } = useAuth();
  const isAdmin = selectedLeague?.rol === 'admin';

  const [equipo, setEquipo] = useState<TeamDetailResponse | null>(null);
  const [proximosPartidos, setProximosPartidos] = useState<MatchResult[]>([]);
  const [ultimosPartidos, setUltimosPartidos] = useState<MatchResult[]>([]);
  const [goleadores, setGoleadores] = useState<PlayerWithStatsResponse[]>([]);
  const [plantilla, setPlantilla] = useState<PlayerWithStatsResponse[]>([]);
  const [staff, setStaff] = useState<TeamStaffResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadData = async () => {
    if (!equipoId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [
        equipoData,
        proximos,
        ultimos,
        goles,
        squad,
        staffData,
      ] = await Promise.all([
        fetchTeamDetail(parseInt(equipoId)),
        fetchTeamNextMatches(parseInt(equipoId)),
        fetchTeamLastMatches(parseInt(equipoId)),
        fetchTeamTopScorers(parseInt(equipoId)),
        fetchTeamSquad(parseInt(equipoId)),
        fetchTeamStaff(parseInt(equipoId)),
      ]);

      setEquipo(equipoData);
      setProximosPartidos(proximos);
      setUltimosPartidos(ultimos);
      setGoleadores(goles);
      setPlantilla(squad);
      setStaff(staffData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar los datos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [equipoId]);

  const handleEditEquipo = async (equipoIdParam: number, datos: any) => {
    try {
      await updateTeam(equipoIdParam, datos);
      alert('Equipo actualizado exitosamente');
      setShowEditModal(false);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar el equipo');
    }
  };

  const handleDeleteEquipo = async () => {
    try {
      await deleteTeam(parseInt(equipoId!));
      alert('Equipo eliminado exitosamente');
      navigate('/teams');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar el equipo');
    }
  };

  // Agrupar plantilla por posición
  const plantillaPorPosicion = {
    porteros: plantilla.filter((p) => p.posicion?.toLowerCase() === 'portero'),
    defensas: plantilla.filter((p) =>
      ['defensa', 'lateral', 'central', 'carirero'].some((pos) =>
        p.posicion?.toLowerCase().includes(pos)
      )
    ),
    centrocampistas: plantilla.filter((p) =>
      ['centrocampista', 'medio', 'interior', 'pivote'].some((pos) =>
        p.posicion?.toLowerCase().includes(pos)
      )
    ),
    delanteros: plantilla.filter((p) =>
      ['delantero', 'extremo', 'delantera'].some((pos) =>
        p.posicion?.toLowerCase().includes(pos)
      )
    ),
  };

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

  if (isLoading) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-lime-400 text-3xl mx-auto mb-4" />
            <p className="text-zinc-400 text-sm">Cargando datos del equipo...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !equipo) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <FaExclamationCircle className="text-red-400 text-4xl mx-auto mb-4" />
            <p className="text-red-400 text-sm mb-4">{error || 'Equipo no encontrado'}</p>
            <button
              onClick={() => navigate('/teams')}
              className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
            >
              Volver a equipos
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] p-6">
        <div className="flex flex-row justify-between">
          {/* Header con botón volver */}
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <FaArrowLeft />
          <span className="text-sm">Volver a equipos</span>
        </button>

        {isAdmin && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-lime-900/30 border border-lime-700/50 text-lime-400 hover:bg-lime-900/50 rounded-lg transition-colors text-sm font-semibold"
            >
              <FaEdit className="w-4 h-4" />
              Editar equipo
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-700/50 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors text-sm font-semibold"
            >
              <FaTrash className="w-4 h-4" />
              Eliminar equipo
            </button>
          </div>
        )}


        </div>        {/* Card principal del equipo */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Información básica */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                {/* Escudo */}
                <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-zinc-600">
                  {equipo.escudo ? (
                    <img src={equipo.escudo} alt={equipo.nombre} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <FaShieldAlt className="text-zinc-400 text-3xl" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-white text-2xl font-bold mb-1">{equipo.nombre}</h1>
                  <p className="text-zinc-400 text-sm">{equipo.ciudad || 'Sin ciudad'}</p>
                  {equipo.estadio && (
                    <p className="text-zinc-500 text-xs mt-1">Estadio: {equipo.estadio}</p>
                  )}
                </div>
              </div>

              {/* Posición y puntos */}
              <div className="flex gap-3 mb-4">
                <div className="bg-zinc-700/50 rounded-lg px-4 py-2">
                  <p className="text-zinc-400 text-xs"># en la tabla</p>
                  <p className="text-lime-400 text-xl font-bold">#{equipo.posicion_liga}</p>
                </div>
                <div className="bg-zinc-700/50 rounded-lg px-4 py-2">
                  <p className="text-zinc-400 text-xs">Puntos</p>
                  <p className="text-white text-xl font-bold">{equipo.puntos} pts</p>
                </div>
              </div>

              {/* Colores del equipo */}
              {equipo.colores && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-sm">Colores:</span>
                  <div
                    className="w-6 h-6 rounded-full border border-zinc-600"
                    style={{ backgroundColor: equipo.colores }}
                  />
                  <span className="text-zinc-500 text-xs font-mono">{equipo.colores}</span>
                </div>
              )}
            </div>

            {/* Stats principales */}
            <div className="flex lg:flex-col gap-4">
              {/* Tasa de victoria */}
              <div className="bg-zinc-700/30 rounded-xl p-4 border border-zinc-600">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrophy className="text-yellow-400" />
                  <span className="text-zinc-400 text-sm">Tasa victoria</span>
                </div>
                <p className="text-lime-400 text-2xl font-bold">{equipo.tasa_victoria}%</p>
              </div>

              {/* Goles */}
              <div className="bg-zinc-700/30 rounded-xl p-4 border border-zinc-600">
                <div className="flex items-center gap-2 mb-2">
                  <FaBullseye className="text-lime-400" />
                  <span className="text-zinc-400 text-sm">Goles</span>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-zinc-500 text-xs">A favor</p>
                    <p className="text-lime-400 font-bold">{equipo.goles_favor}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs">En contra</p>
                    <p className="text-red-400 font-bold">{equipo.goles_contra}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Próximo partido */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-lime-400" />
            Próximo Partido
          </h2>

          {proximosPartidos.length > 0 ? (
            <div className="bg-zinc-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                {/* Equipo local */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                    {proximosPartidos[0].escudo_equipo_local ? (
                      <img
                        src={proximosPartidos[0].escudo_equipo_local}
                        alt={proximosPartidos[0].nombre_equipo_local}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FaShieldAlt className="text-zinc-400" />
                    )}
                  </div>
                  <span className="text-white font-semibold">
                    {proximosPartidos[0].nombre_equipo_local}
                  </span>
                </div>

                {/* VS y fecha */}
                <div className="flex flex-col items-center px-4">
                  <div className="bg-zinc-800 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                    <span className="text-zinc-400 font-bold text-sm">VS</span>
                  </div>
                  <p className="text-zinc-400 text-xs">
                    {proximosPartidos[0].fecha
                      ? new Date(proximosPartidos[0].fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Por confirmar'}
                  </p>
                </div>

                {/* Equipo visitante */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="text-white font-semibold">
                    {proximosPartidos[0].nombre_equipo_visitante}
                  </span>
                  <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                    {proximosPartidos[0].escudo_equipo_visitante ? (
                      <img
                        src={proximosPartidos[0].escudo_equipo_visitante}
                        alt={proximosPartidos[0].nombre_equipo_visitante}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FaShieldAlt className="text-zinc-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No hay próximos partidos programados</p>
          )}
        </div>

        {/* Últimos 5 partidos */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-lime-400" />
            Últimos 5 partidos
          </h2>

          {ultimosPartidos.length > 0 ? (
            <>
              {/* Resultados en línea */}
              <div className="flex gap-2 mb-4">
                {ultimosPartidos.map((partido, idx) => {
                  const resultadoColor =
                    partido.resultado === 'W'
                      ? 'bg-lime-500'
                      : partido.resultado === 'D'
                      ? 'bg-zinc-500'
                      : 'bg-red-500';

                  return (
                    <div
                      key={partido.id_partido}
                      className={`${resultadoColor} text-zinc-950 font-bold text-sm w-10 h-10 rounded-full flex items-center justify-center`}
                      title={`${partido.nombre_equipo_local} ${partido.goles_local} - ${partido.goles_visitante} ${partido.nombre_equipo_visitante}`}
                    >
                      {partido.resultado}
                    </div>
                  );
                })}
              </div>

              {/* Estadísticas */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2 text-lime-400">
                  <FaCheck />
                  <span>
                    {ultimosPartidos.filter((p) => p.resultado === 'W').length} Victorias
                  </span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <FaMinus />
                  <span>
                    {ultimosPartidos.filter((p) => p.resultado === 'D').length} Empates
                  </span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <FaTimes />
                  <span>
                    {ultimosPartidos.filter((p) => p.resultado === 'L').length} Derrotas
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">No hay partidos finalizados</p>
          )}
        </div>

        {/* Máximos goleadores */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMedal className="text-yellow-400" />
            Los 3 máximos goleadores
          </h2>

          {goleadores.length > 0 ? (
            <div className="space-y-3">
              {goleadores.map((jugador, idx) => (
                <div
                  key={jugador.id_jugador}
                  className="flex items-center justify-between bg-zinc-900 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Número de ranking */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        idx === 0
                          ? 'bg-yellow-500 text-zinc-950'
                          : idx === 1
                          ? 'bg-zinc-600 text-white'
                          : 'bg-orange-700 text-white'
                      }`}
                    >
                      #{idx + 1}
                    </div>
                    {/* Info jugador */}
                    <div>
                      <p className="text-white font-semibold">{jugador.nombre}</p>
                      <p className="text-zinc-500 text-xs">
                        {jugador.posicion} · #{jugador.dorsal}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lime-400 font-bold text-lg">{jugador.goles}</p>
                    <p className="text-zinc-500 text-xs">goles</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm">No hay goleadores registrados</p>
          )}
        </div>

        {/* Plantilla */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700 mb-6">
          <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUsers className="text-lime-400" />
            Plantilla
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Porteros */}
            <div>
              <h3 className="text-zinc-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Porteros
              </h3>
              <div className="space-y-2">
                {plantillaPorPosicion.porteros.length > 0 ? (
                  plantillaPorPosicion.porteros.map((jugador) => (
                    <div
                      key={jugador.id_jugador}
                      className="flex items-center justify-between bg-zinc-900 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono text-sm w-6">
                          #{jugador.dorsal}
                        </span>
                        <span className="text-white">{jugador.nombre}</span>
                      </div>
                      <span className="text-zinc-400 text-sm">{jugador.rating || '8.0'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">Sin porteros</p>
                )}
              </div>
            </div>

            {/* Defensas */}
            <div>
              <h3 className="text-zinc-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Defensas
              </h3>
              <div className="space-y-2">
                {plantillaPorPosicion.defensas.length > 0 ? (
                  plantillaPorPosicion.defensas.map((jugador) => (
                    <div
                      key={jugador.id_jugador}
                      className="flex items-center justify-between bg-zinc-900 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono text-sm w-6">
                          #{jugador.dorsal}
                        </span>
                        <span className="text-white">{jugador.nombre}</span>
                      </div>
                      <span className="text-zinc-400 text-sm">{jugador.rating || '8.0'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">Sin defensas</p>
                )}
              </div>
            </div>

            {/* Centrocampistas */}
            <div>
              <h3 className="text-zinc-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Centrocampistas
              </h3>
              <div className="space-y-2">
                {plantillaPorPosicion.centrocampistas.length > 0 ? (
                  plantillaPorPosicion.centrocampistas.map((jugador) => (
                    <div
                      key={jugador.id_jugador}
                      className="flex items-center justify-between bg-zinc-900 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono text-sm w-6">
                          #{jugador.dorsal}
                        </span>
                        <span className="text-white">{jugador.nombre}</span>
                      </div>
                      <span className="text-zinc-400 text-sm">{jugador.rating || '8.0'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">Sin centrocampistas</p>
                )}
              </div>
            </div>

            {/* Delanteros */}
            <div>
              <h3 className="text-zinc-400 text-sm font-semibold mb-3 uppercase tracking-wider">
                Delanteros
              </h3>
              <div className="space-y-2">
                {plantillaPorPosicion.delanteros.length > 0 ? (
                  plantillaPorPosicion.delanteros.map((jugador) => (
                    <div
                      key={jugador.id_jugador}
                      className="flex items-center justify-between bg-zinc-900 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-500 font-mono text-sm w-6">
                          #{jugador.dorsal}
                        </span>
                        <span className="text-white">{jugador.nombre}</span>
                      </div>
                      <span className="text-zinc-400 text-sm">{jugador.rating || '8.0'}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm">Sin delanteros</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información del club */}
        <div className="bg-zinc-800 rounded-2xl p-6 border border-zinc-700">
          <h2 className="text-white text-lg font-semibold mb-4">Información del Club</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Entrenador */}
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FaUserTie className="text-lime-400" />
                <span className="text-zinc-400 text-sm">Entrenador</span>
              </div>
              {staff?.entrenador ? (
                <p className="text-white font-semibold">{staff.entrenador.nombre}</p>
              ) : (
                <p className="text-zinc-500 text-sm">Sin entrenador asignado</p>
              )}
            </div>

            {/* Capitán */}
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FaMedal className="text-yellow-400" />
                <span className="text-zinc-400 text-sm">Capitán</span>
              </div>
              {staff?.capitan ? (
                <p className="text-white font-semibold">
                  {staff.capitan.nombre} #{staff.capitan.dorsal}
                </p>
              ) : (
                <p className="text-zinc-500 text-sm">Sin capitán asignado</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && equipo && (
        <EditTeamModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          ligaId={selectedLeague?.id!}
          equipoId={equipo.id_equipo}
          initialData={equipo}
          onSave={handleEditEquipo}
        />
      )}
      {showDeleteModal && equipo && (
        <DeleteTeamConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          equipoNombre={equipo.nombre}
          ligaId={selectedLeague?.id!}
          equipoId={equipo.id_equipo}
          onConfirm={handleDeleteEquipo}
        />
      )}
    </>
  );
}
