import { useState, useEffect, useMemo } from 'react';
import {
  FaSpinner,
  FaExclamationCircle,
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaCheck,
  FaClock,
  FaCrown,
  FaUserTie,
  FaUserShield,
  FaUser,
  FaEllipsisV,
} from 'react-icons/fa';
import Nav from '../../../components/Nav';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import { fetchUsersByLeague, fetchRoles, type UserWithRole, type UserStats, type Rol } from '../services/usersApi';
import InviteUserModal from '../components/InviteUserModal';
import UserActionsModal from '../../league/components/UserActionsModal';
import TeamMemberActionsModal from '../../team/components/TeamMemberActionsModal';
import { fetchMiembrosEquipo, type MiembroEquipo } from '../../team/services/teamMembersApi';
import { apiGet } from '../../../services/api';

export default function UsersPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isUserActionsModalOpen, setIsUserActionsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);

  // Estados para vista de entrenador
  const [isCoachView, setIsCoachView] = useState(false);
  const [miEquipoId, setMiEquipoId] = useState<number | null>(null);
  const [miembrosEquipo, setMiembrosEquipo] = useState<MiembroEquipo[]>([]);
  const [usuariosParaDelegado, setUsuariosParaDelegado] = useState<UserWithRole[]>([]);
  const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
  const [selectedMiembro, setSelectedMiembro] = useState<MiembroEquipo | null>(null);

  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Cargar equipo del entrenador si es coach
  useEffect(() => {
    if (userRole === 'entrenador' && selectedLeague?.id) {
      setIsCoachView(true);
      cargarEquipoEntrenador();
    } else {
      setIsCoachView(false);
    }
  }, [userRole, selectedLeague]);

  const cargarEquipoEntrenador = async () => {
    try {
      const data = await apiGet<{ id_equipo: number }>('/equipos/usuario/mi-equipo', {
        liga_id: selectedLeague!.id,
      });
      setMiEquipoId(data.id_equipo);
      await cargarMiembrosEquipo(data.id_equipo);
      // Cargar usuarios disponibles para asignar delegado
      const usuarios = await fetchUsersByLeague(selectedLeague!.id);
      setUsuariosParaDelegado(usuarios);
    } catch (error) {
      console.error('Error al cargar equipo:', error);
    }
  };

  const cargarMiembrosEquipo = async (equipoId: number) => {
    try {
      const miembros = await fetchMiembrosEquipo(equipoId);
      setMiembrosEquipo(miembros);
    } catch (error) {
      console.error('Error al cargar miembros:', error);
    }
  };

  const loadUsers = async () => {
    if (!selectedLeague) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUsersByLeague(selectedLeague.id);
      setUsers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedLeague]);

  // Calcular estadísticas para vista de admin
  const stats: UserStats = useMemo(() => {
    const total = users.length;
    const activos = users.filter((u) => u.activo).length;
    const pendientes = users.filter((u) => !u.activo).length;
    const admin_activos = users.filter((u) => u.rol === 'admin' && u.activo).length;
    return { total, activos, pendientes, admin_activos };
  }, [users]);

  // Calcular estadísticas para vista de entrenador
  const coachStats = useMemo(() => {
    const total = miembrosEquipo.length;
    const activos = miembrosEquipo.filter((m) => m.activo).length;
    const inactivos = total - activos;
    const delegados = miembrosEquipo.filter((m) => m.tipo === 'delegado').length;
    return { total, activos, inactivos, delegados };
  }, [miembrosEquipo]);

  // Filtrar usuarios (vista admin)
  const usuariosFiltrados = useMemo(() => {
    return users.filter((user) => {
      // Filtro por búsqueda
      const matchBusqueda =
        user.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        user.email.toLowerCase().includes(busqueda.toLowerCase());

      // Filtro por rol
      const matchRol = filtroRol === 'todos' || user.rol === filtroRol;

      // Filtro por estado
      const matchEstado = filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && user.activo) ||
        (filtroEstado === 'pendiente' && !user.activo);

      return matchBusqueda && matchRol && matchEstado;
    });
  }, [users, busqueda, filtroRol, filtroEstado]);

  // Filtrar miembros del equipo (vista entrenador)
  const miembrosFiltrados = useMemo(() => {
    return miembrosEquipo.filter((miembro) => {
      const matchBusqueda =
        miembro.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        miembro.email.toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado = filtroEstado === 'todos' ||
        (filtroEstado === 'activo' && miembro.activo) ||
        (filtroEstado === 'inactivo' && !miembro.activo);

      const matchTipo = filtroRol === 'todos' ||
        (filtroRol === 'jugador' && miembro.tipo === 'jugador') ||
        (filtroRol === 'delegado' && miembro.tipo === 'delegado');

      return matchBusqueda && matchEstado && matchTipo;
    });
  }, [miembrosEquipo, busqueda, filtroEstado, filtroRol]);

  // Obtener icono según el rol
  const getRoleIcon = (rol: UserRole) => {
    switch (rol) {
      case 'admin':
        return <FaCrown className="text-lime-400" />;
      case 'entrenador':
        return <FaUserTie className="text-blue-400" />;
      case 'delegado':
        return <FaUserShield className="text-purple-400" />;
      case 'jugador':
        return <FaUser className="text-zinc-400" />;
      default:
        return <FaUser className="text-zinc-400" />;
    }
  };

  // Obtener etiqueta del rol
  const getRoleLabel = (rol: UserRole) => {
    const labels: Record<UserRole, string> = {
      admin: 'Admin',
      entrenador: 'Entrenador',
      delegado: 'Delegado',
      jugador: 'Jugador',
      observador: 'Observador',
    };
    return labels[rol] || rol;
  };

  // Obtener iniciales del nombre
  const getInitials = (nombre: string) => {
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  // Sin liga seleccionada
  if (!selectedLeague) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center">
            <FaUsers className="text-zinc-600 text-5xl mx-auto mb-4" />
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
          <h1 className="text-white text-2xl font-bold mb-2">Usuarios y roles</h1>
          <p className="text-zinc-400 text-sm">
            {leagueName} - Temporada 2025/26
          </p>
        </div>

        {/* Sección de Colaboración - Estadísticas */}
        <div className="mb-8">
          <h2 className="text-white text-lg font-semibold mb-4">
            {isCoachView ? 'Mi Equipo' : 'Colaboración'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isCoachView ? (
              // Estadísticas para entrenador
              <>
                {/* Total Miembros */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-lime-500/10 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-lime-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Miembros</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{coachStats.total}</p>
                </div>

                {/* Activos */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <FaCheck className="text-green-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Activos</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{coachStats.activos}</p>
                </div>

                {/* Inactivos */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gray-500/10 rounded-lg flex items-center justify-center">
                      <FaUser className="text-gray-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Inactivos</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{coachStats.inactivos}</p>
                </div>

                {/* Delegados */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <FaUserTie className="text-purple-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Delegado</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{coachStats.delegados}</p>
                </div>
              </>
            ) : (
              // Estadísticas para admin
              <>
                {/* Total Usuarios */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-lime-500/10 rounded-lg flex items-center justify-center">
                      <FaUsers className="text-lime-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Usuarios</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{stats.total}</p>
                </div>

                {/* Activos */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                      <FaCheck className="text-green-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Activos</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{stats.activos}</p>
                </div>

                {/* Pendientes */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                      <FaClock className="text-yellow-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Pendientes</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{stats.pendientes}</p>
                </div>

                {/* Admin Activos */}
                <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                      <FaCrown className="text-purple-400" />
                    </div>
                    <span className="text-zinc-400 text-xs">Admin activos</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{stats.admin_activos}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Miembros */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white text-lg font-semibold">
                {isCoachView ? 'Miembros del equipo' : 'Miembros de la liga'}
              </h2>
              <p className="text-zinc-400 text-sm">
                {isCoachView ? miembrosFiltrados.length : usuariosFiltrados.length} miembros
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filtros */}
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-400"
              >
                {isCoachView ? (
                  <>
                    <option value="todos">Todos los tipos</option>
                    <option value="jugador">Jugadores</option>
                    <option value="delegado">Delegado</option>
                  </>
                ) : (
                  <>
                    <option value="todos">Todos los roles</option>
                    <option value="admin">Admin</option>
                    <option value="entrenador">Entrenador</option>
                    <option value="delegado">Delegado</option>
                    <option value="jugador">Jugador</option>
                    <option value="observador">Observador</option>
                  </>
                )}
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-400"
              >
                {isCoachView ? (
                  <>
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="inactivo">Inactivos</option>
                  </>
                ) : (
                  <>
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="pendiente">Pendientes</option>
                  </>
                )}
              </select>

              {/* Barra de búsqueda */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder={isCoachView ? "Buscar miembro..." : "Buscar usuario..."}
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full sm:w-48 bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>

              {/* Botón Invitar usuario - Solo admin */}
              {userRole === 'admin' && (
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-400 text-zinc-950 font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  <FaUserPlus />
                  <span className="hidden sm:inline">Invitar usuario</span>
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-lime-400 text-3xl mb-4" />
              <p className="text-zinc-400 text-sm">Cargando miembros...</p>
            </div>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <FaExclamationCircle className="text-red-400 text-4xl mb-4" />
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={loadUsers}
                className="text-lime-300 text-sm font-semibold hover:text-lime-400 transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Lista de miembros */}
          {!isLoading && !error && usuariosFiltrados.length > 0 && (
            <div className="space-y-3">
              {usuariosFiltrados.map((user, index) => (
                <div
                  key={`${user.id_usuario}-${index}`}
                  className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar con iniciales */}
                      <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-zinc-900 font-bold text-sm">
                          {getInitials(user.nombre)}
                        </span>
                      </div>

                      {/* Información del usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">{user.nombre}</h3>
                          {/* Badge de rol */}
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-lime-500/10 border border-lime-500/20 rounded text-lime-400 text-xs font-semibold whitespace-nowrap">
                            {getRoleIcon(user.rol)}
                            {getRoleLabel(user.rol)}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className="flex items-center gap-4">
                      {/* Estado */}
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                          user.activo
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}
                      >
                        {user.activo ? (
                          <>
                            <FaCheck className="text-xs" />
                            Activo
                          </>
                        ) : (
                          <>
                            <FaClock className="text-xs" />
                            Pendiente
                          </>
                        )}
                      </span>

                      {/* Botón de acciones */}
                      {userRole === 'admin' && (
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserActionsModalOpen(true);
                          }}
                          className="p-2 text-zinc-400 hover:text-white transition-colors"
                        >
                          <FaEllipsisV />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista de miembros del equipo (vista entrenador) */}
          {!isLoading && !error && isCoachView && miembrosFiltrados.length > 0 && (
            <div className="space-y-3">
              {miembrosFiltrados.map((miembro, index) => (
                <div
                  key={`${miembro.id_miembro}-${index}`}
                  className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar con iniciales */}
                      <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-zinc-900 font-bold text-sm">
                          {getInitials(miembro.nombre)}
                        </span>
                      </div>

                      {/* Información del miembro */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold truncate">{miembro.nombre}</h3>
                          {/* Badge de tipo */}
                          {miembro.tipo === 'delegado' ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400 text-xs font-semibold whitespace-nowrap">
                              <FaUserTie />
                              Delegado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 text-xs font-semibold whitespace-nowrap">
                              <FaUser />
                              {miembro.posicion}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-sm truncate">{miembro.email}</p>
                        {miembro.tipo === 'jugador' && (
                          <p className="text-zinc-500 text-xs mt-0.5">
                            Dorsal {miembro.dorsal}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Estado y acciones */}
                    <div className="flex items-center gap-4">
                      {/* Estado */}
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                          miembro.activo
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}
                      >
                        {miembro.activo ? (
                          <>
                            <FaCheck className="text-xs" />
                            Activo
                          </>
                        ) : (
                          <>
                            <FaClock className="text-xs" />
                            Inactivo
                          </>
                        )}
                      </span>

                      {/* Botón de acciones */}
                      <button
                        onClick={() => {
                          setSelectedMiembro(miembro);
                          setIsTeamMemberModalOpen(true);
                        }}
                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                      >
                        <FaEllipsisV />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados (vista entrenador) */}
          {!isLoading && !error && isCoachView && miembrosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="text-zinc-600 text-4xl mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">No se encontraron miembros en tu equipo</p>
              <p className="text-zinc-500 text-xs mt-1">
                Prueba ajustando los filtros o búsqueda
              </p>
            </div>
          )}

          {/* Sin resultados (vista admin) */}
          {!isLoading && !error && !isCoachView && usuariosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="text-zinc-600 text-4xl mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">No se encontraron usuarios</p>
              <p className="text-zinc-500 text-xs mt-1">
                Prueba ajustando los filtros o búsqueda
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para invitar usuario */}
      {selectedLeague && (
        <InviteUserModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={() => {
            loadUsers();
            setIsInviteModalOpen(false);
          }}
          ligaId={selectedLeague.id}
        />
      )}

      {/* Modal para acciones de usuario (admin) */}
      {selectedLeague && selectedUser && (
        <UserActionsModal
          isOpen={isUserActionsModalOpen}
          onClose={() => {
            setIsUserActionsModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            loadUsers();
            setIsUserActionsModalOpen(false);
            setSelectedUser(null);
          }}
          usuario={{
            id_usuario_rol: 0,
            id_usuario: selectedUser.id_usuario,
            nombre_usuario: selectedUser.nombre,
            email: selectedUser.email,
            id_rol: selectedUser.id_rol,
            nombre_rol: selectedUser.rol,
            activo: selectedUser.activo,
          }}
          ligaId={selectedLeague.id}
          rolesDisponibles={roles}
        />
      )}

      {/* Modal para acciones de miembro del equipo (entrenador) */}
      {selectedLeague && selectedMiembro && miEquipoId && (
        <TeamMemberActionsModal
          isOpen={isTeamMemberModalOpen}
          onClose={() => {
            setIsTeamMemberModalOpen(false);
            setSelectedMiembro(null);
          }}
          onSuccess={() => {
            cargarMiembrosEquipo(miEquipoId);
            setIsTeamMemberModalOpen(false);
            setSelectedMiembro(null);
          }}
          miembro={selectedMiembro}
          equipoId={miEquipoId}
          usuariosDisponibles={usuariosParaDelegado.map(u => ({
            id_usuario: u.id_usuario,
            nombre: u.nombre,
            email: u.email,
          }))}
          esEntrenador={true}
        />
      )}
    </>
  );
}
