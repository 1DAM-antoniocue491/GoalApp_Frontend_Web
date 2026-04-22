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
import { fetchUsersByLeague, type UserWithRole, type UserStats } from '../services/usersApi';
import InviteUserModal from '../components/InviteUserModal';

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

  // Calcular estadísticas
  const stats: UserStats = useMemo(() => {
    const total = users.length;
    const activos = users.filter((u) => u.activo).length;
    const pendientes = users.filter((u) => !u.activo).length;
    const admin_activos = users.filter((u) => u.rol === 'admin' && u.activo).length;
    return { total, activos, pendientes, admin_activos };
  }, [users]);

  // Filtrar usuarios
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
          <h2 className="text-white text-lg font-semibold mb-4">Colaboración</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          </div>
        </div>

        {/* Miembros de la liga */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-white text-lg font-semibold">Miembros de la liga</h2>
              <p className="text-zinc-400 text-sm">{usuariosFiltrados.length} miembros</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filtros */}
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-400"
              >
                <option value="todos">Todos los roles</option>
                <option value="admin">Admin</option>
                <option value="entrenador">Entrenador</option>
                <option value="delegado">Delegado</option>
                <option value="jugador">Jugador</option>
                <option value="observador">Observador</option>
              </select>

              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-400"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="pendiente">Pendientes</option>
              </select>

              {/* Barra de búsqueda */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
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
              {usuariosFiltrados.map((user) => (
                <div
                  key={user.id_usuario}
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
                        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                          <FaEllipsisV />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin resultados */}
          {!isLoading && !error && usuariosFiltrados.length === 0 && (
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
    </>
  );
}
