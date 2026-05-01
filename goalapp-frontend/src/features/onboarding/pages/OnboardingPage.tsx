/**
 * Página de Onboarding
 * Primera vista después del login para seleccionar o crear una liga
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { FiSearch, FiBell, FiLoader, FiAlertCircle, FiRefreshCw, FiX } from 'react-icons/fi';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaSignOutAlt, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSelectedLeague } from '../../../context';
import { updateProfile, getCurrentUser } from '../../auth/services/authApi';
import { getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { CreateLeagueModal } from '../../league';
import { JoinLeagueModal } from '../components/JoinLeagueModal';
import { ActionCard } from '../components/ActionCard';
import { LeagueCard } from '../components/LeagueCard';
import { OnboardingTabs, type TabFilter } from '../components/OnboardingTabs';
import { loadUserLeagues, toggleLigaFavorita, reactivarLiga } from '../services/onboardingApi';
import type { OnboardingUser, UserLeague } from '../types';
import { ReactivateLeagueModal } from '../components/ReactivateLeagueModal';
import { NotificationsDropdown } from '../components/NotificationsDropdown';
import { useNotificationsBadge } from '../../notificaciones/services/unreadBadgeApi';

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtener iniciales del nombre del usuario
 */
function getInitials(nombre: string): string {
  if (!nombre) return 'U';
  const parts = nombre.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
}

/**
 * Obtener primer nombre
 */
function getFirstName(nombre: string): string {
  if (!nombre) return 'Usuario';
  return nombre.split(' ')[0];
}

// ============================================
// COMPONENTE DE ESTADOS
// ============================================

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <FiLoader className="w-8 h-8 text-lime-400 animate-spin" />
      <span className="ml-3 text-zinc-400">Cargando tus ligas...</span>
    </div>
  );
}

function ErrorState({
  error,
  onRetry
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="text-center py-12">
      <FiAlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-zinc-400 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
      >
        <FiRefreshCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-zinc-500 mb-2">No sigues ninguna liga todavía</p>
      <p className="text-zinc-600 text-sm">
        Crea una nueva liga o únete a una existente para empezar
      </p>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function OnboardingPage() {
  // Estados locales
  const [activeTab, setActiveTab] = useState<TabFilter>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [leagues, setLeagues] = useState<UserLeague[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);
  const [isJoinLeagueModalOpen, setIsJoinLeagueModalOpen] = useState(false);
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<number | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [reactivatingLeagueId, setReactivatingLeagueId] = useState<number | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);
  const [reactivateError, setReactivateError] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({ nombre: '', telefono: '', fecha_nacimiento: '' });
  const profileRef = useRef<HTMLDivElement>(null);

  // Hooks de navegación y contexto
  const navigate = useNavigate();
  const { selectLeague } = useSelectedLeague();

  // Obtener usuario desde el contexto de autenticación
  const { user, logout, isInitializing, refreshUser } = useAuth();
  const { unreadCount } = useNotificationsBadge();

  // Cargar datos completos al abrir el dropdown de perfil
  useEffect(() => {
    if (isProfileOpen && user?.id_usuario) {
      refreshUser();
    }
  }, [isProfileOpen]);

  // Cerrar perfil al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileOpen]);

  // Obtener iniciales y nombre del usuario
  const userDisplayName = user?.nombre?.split(' ').slice(0, 2).join(' ') || 'Usuario';

  // Formatear fecha en español
  const formatDateSpanish = (dateStr: string) => {
    try {
      const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return `${date.getDate()} de ${meses[date.getMonth()]}, ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Obtener etiqueta del rol
  const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    entrenador: 'Entrenador',
    delegado: 'Delegado',
    jugador: 'Jugador',
    observador: 'Observador',
    viewer: 'Espectador',
  };
  const getRoleLabel = (role: string) => roleLabels[role.toLowerCase()] || role;

  // Mapear usuario a formato local
  const onboardingUser: OnboardingUser | null = user ? {
    id: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    avatar: user.imagen_url ?? undefined,
  } : null;

  // ============================================
  // CARGAR LIGAS DEL USUARIO
  // ============================================

  const fetchLeagues = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userLeagues = await loadUserLeagues();
      setLeagues(userLeagues);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las ligas';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar ligas al montar el componente
  useEffect(() => {
    if (!isInitializing && user) {
      fetchLeagues();
    }
  }, [isInitializing, user, fetchLeagues]);

  // ============================================
  // FILTRADO DE LIGAS
  // ============================================

  const filteredLeagues = useMemo(() => {
    let result = [...leagues];

    // Filtrar por tab
    switch (activeTab) {
      case 'activas':
        result = result.filter((l) => l.estado === 'activa');
        break;
      case 'finalizadas':
        result = result.filter((l) => l.estado === 'finalizada');
        break;
      case 'favoritas':
        result = result.filter((l) => l.esFavorita);
        break;
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((l) => l.nombre.toLowerCase().includes(query));
    }

    return result;
  }, [leagues, activeTab, searchQuery]);

  // Contadores para tabs
  const counts = useMemo(() => ({
    todas: leagues.length,
    activas: leagues.filter((l) => l.estado === 'activa').length,
    finalizadas: leagues.filter((l) => l.estado === 'finalizada').length,
    favoritas: leagues.filter((l) => l.esFavorita).length,
  }), [leagues]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreateLeague = () => {
    setIsCreateLeagueModalOpen(true);
  };

  const handleCreateLeagueSuccess = () => {
    // Recargar ligas después de crear una nueva
    fetchLeagues();
  };

  const handleJoinLeague = () => {
    setIsJoinLeagueModalOpen(true);
  };

  const handleEnterLeague = (leagueId: number) => {
    // Encontrar la liga seleccionada
    const league = leagues.find((l) => l.id === leagueId);
    if (!league) {
      console.error('Liga no encontrada:', leagueId);
      return;
    }

    // Guardar la liga seleccionada en el contexto con el usuarioId
    selectLeague({
      id: league.id,
      nombre: league.nombre,
      temporada: league.temporada,
      rol: league.rol,
      usuarioId: onboardingUser?.id,
      miEquipo: league.miEquipo,
    });

    // Redirigir al dashboard
    navigate('/dashboard');
  };

  const handleReactivateLeague = (leagueId: number) => {
    setReactivatingLeagueId(leagueId);
    setReactivateError(null);
    setIsReactivateModalOpen(true);
  };

  const handleConfirmReactivate = async () => {
    if (!reactivatingLeagueId || isReactivating) return;

    setIsReactivating(true);
    setReactivateError(null);

    try {
      await reactivarLiga(reactivatingLeagueId);

      // Actualizar estado local
      setLeagues((prev) =>
        prev.map((l) =>
          l.id === reactivatingLeagueId ? { ...l, estado: 'activa' as const } : l
        )
      );

      setIsReactivateModalOpen(false);
      setReactivatingLeagueId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reactivar la liga';
      setReactivateError(errorMessage);
    } finally {
      setIsReactivating(false);
    }
  };

  const handleCloseReactivateModal = () => {
    if (isReactivating) return;
    setIsReactivateModalOpen(false);
    setReactivatingLeagueId(null);
    setReactivateError(null);
  };

  const handleToggleFavorite = async (leagueId: number) => {
    // Evitar múltiples clicks mientras se procesa
    if (togglingFavoriteId === leagueId) return;

    // Encontrar la liga para obtener el estado actual
    const league = leagues.find((l) => l.id === leagueId);
    if (!league) return;

    // Limpiar error previo
    setFavoriteError(null);
    setTogglingFavoriteId(leagueId);

    try {
      // Llamar a la API para toggle
      await toggleLigaFavorita(leagueId, league.esFavorita);

      // Actualizar estado local solo si la API tuvo éxito
      setLeagues((prev) =>
        prev.map((l) =>
          l.id === leagueId ? { ...l, esFavorita: !l.esFavorita } : l
        )
      );
    } catch (err) {
      // Mostrar error al usuario
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar favorito';
      setFavoriteError(errorMessage);
      // Limpiar error después de 5 segundos
      setTimeout(() => setFavoriteError(null), 5000);
    } finally {
      setTogglingFavoriteId(null);
    }
  };

  // ============================================
  // EDITAR PERFIL
  // ============================================

  const openEditProfile = () => {
    setProfileForm({
      nombre: user?.nombre || '',
      telefono: user?.telefono || '',
      fecha_nacimiento: user?.fecha_nacimiento || '',
    });
    setProfileError(null);
    setIsEditProfileOpen(true);
    setIsProfileOpen(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileError(null);

    try {
      if (user?.id_usuario) {
        await updateProfile(user.id_usuario, {
          nombre: profileForm.nombre,
          telefono: profileForm.telefono || null,
          fecha_nacimiento: profileForm.fecha_nacimiento || null,
        });
      }
      await refreshUser();
      setIsEditProfileOpen(false);
    } catch (err) {
      setProfileError(getErrorMessage(err as ApiError));
    } finally {
      setProfileSubmitting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  const userName = onboardingUser?.nombre || 'Usuario';
  const userInitials = getInitials(userName);
  const userFirstName = userName.split(' ')[0];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lime-400 rounded-lg flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-xl">G</span>
            </div>
            <div>
              <h1 className="text-white font-semibold">Onboarding Deportivo</h1>
              <p className="text-zinc-500 text-xs">Sistema de Gestión Deportiva</p>
            </div>
          </div>

          {/* Notificaciones y usuario */}
          <div className="flex items-center gap-4 relative">
            {/* Notificaciones Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 text-zinc-400 hover:text-white transition-colors relative"
              >
                <FiBell className="w-5 h-5" />
                <span 
                  className={`absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full transition-all duration-300 ${
                    unreadCount > 0 ? 'opacity-100 scale-110 animate-pulse' : 'opacity-0 scale-75'
                  }`}
                />
              </button>
              <NotificationsDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            </div>

            {/* Perfil Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 rounded-lg p-1.5 transition-colors"
              >
                {onboardingUser?.avatar ? (
                  <img
                    src={onboardingUser.avatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-zinc-900 font-semibold text-sm">
                      {userInitials}
                    </span>
                  </div>
                )}
                <span className="text-white text-sm hidden sm:block">{userFirstName}</span>
              </button>

              {/* Perfil Dropdown Content */}
              {isProfileOpen && (
                <div className="absolute right-0 top-12 bg-gradient-to-b from-zinc-800 to-70% to-zinc-950 border border-zinc-700 rounded-lg shadow-lg z-50 md:w-96">
                  <div className="p-3">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <div className="flex flex-row items-center justify-between gap-2 text-zinc-400 w-full">
                        <div className="flex flex-row items-center gap-2 text-white text-sm">
                          <FaUser className="w-3 h-3 text-white" />
                          <p>Mi perfil</p>
                        </div>
                        <div
                          className="bg-zinc-700/50 p-1 rounded-md cursor-pointer hover:bg-zinc-600/50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiX />
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-lime-300 to-blue-300 rounded-full py-5 px-5">
                        <p className="font-bold text-3xl">{userInitials}</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-white font-semibold text-sm">{userDisplayName}</p>
                        {user?.rol_principal && (
                          <span className="text-xs text-lime-400">{getRoleLabel(user.rol_principal)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 mx-5 space-y-2 text-sm border border-zinc-700 rounded-lg bg-zinc-950">
                    {user?.nombre && (
                      <div className="flex items-start gap-2 text-zinc-400">
                        <div className="flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg">
                          <FaUser className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">Nombre</p>
                          <span className="truncate text-zinc-400">{user.nombre}</span>
                        </div>
                      </div>
                    )}
                    {user?.email && (
                      <div className="flex items-start gap-2 text-zinc-400">
                        <div className="flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg">
                          <FaEnvelope className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">Email</p>
                          <span className="truncate text-zinc-400">{user.email}</span>
                        </div>
                      </div>
                    )}
                    {user?.telefono && (
                      <div className="flex items-start gap-2 text-zinc-400">
                        <div className="flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg">
                          <FaPhone className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">Teléfono</p>
                          <span className="truncate text-zinc-400">{user.telefono}</span>
                        </div>
                      </div>
                    )}
                    {user?.fecha_nacimiento && (
                      <div className="flex items-start gap-2 text-zinc-400">
                        <div className="flex flex-row text-sm bg-zinc-700/50 py-2 px-2 rounded-lg">
                          <FaBirthdayCake className="w-5 h-5 shrink-0" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-sm">Fecha de nacimiento</p>
                          <span className="truncate text-zinc-400">{formatDateSpanish(user.fecha_nacimiento)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 m-5">
                    <button
                      onClick={openEditProfile}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-lime-900 hover:bg-lime-800 rounded-lg border border-lime-700 transition-colors text-sm text-lime-300 font-semibold"
                    >
                      <FaEdit className="w-3.5 h-3.5" />
                      Editar perfil
                    </button>
                    <button
                      onClick={async () => {
                        await logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-900 hover:bg-red-800 rounded-lg border border-red-700 transition-colors text-sm text-red-300 font-semibold"
                    >
                      <FaSignOutAlt className="w-3.5 h-3.5" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Saludo */}
        <div className="mb-8">
          <h2 className="text-white text-2xl font-semibold mb-1">
            Hola, {getFirstName(userName)}
          </h2>
          <p className="text-zinc-400">Panel de administración del sistema</p>
        </div>

        {/* Sección de acciones */}
        <section className="mb-10">
          <div className="mb-4">
            <h3 className="text-white text-lg font-semibold mb-1">
              ¿Qué quieres hacer ahora?
            </h3>
            <p className="text-zinc-400 text-sm">
              Antes de entrar al dashboard necesitas crear una liga, unirte a una existente
              o elegir una de las ligas en las que ya participas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ActionCard
              icon="plus"
              title="Crear nueva liga"
              description="Configura una nueva competición y empieza a gestionarla"
              buttonText="Crear liga"
              onClick={handleCreateLeague}
            />
            <ActionCard
              icon="link"
              title="Unirme a una liga"
              description="Introduce un código de invitación o accede mediante enlace"
              buttonText="Unirme"
              onClick={handleJoinLeague}
            />
          </div>
        </section>

        {/* Sección de mis ligas */}
        <section>
          <h3 className="text-white text-lg font-semibold mb-4">Mis ligas</h3>

          {/* Tabs y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <OnboardingTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={counts}
            />
            <div className="relative flex-1 max-w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar liga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Error de favorito */}
          {favoriteError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm flex items-center justify-between">
              <span>{favoriteError}</span>
              <button
                onClick={() => setFavoriteError(null)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          )}

          {/* Lista de ligas con estados */}
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={fetchLeagues} />
          ) : leagues.length === 0 ? (
            <EmptyState />
          ) : filteredLeagues.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeagues.map((league) => (
                <LeagueCard
                  key={league.id}
                  league={league}
                  onEnter={handleEnterLeague}
                  onReactivate={handleReactivateLeague}
                  onToggleFavorite={handleToggleFavorite}
                  isTogglingFavorite={togglingFavoriteId === league.id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-500">No se encontraron ligas con ese filtro</p>
            </div>
          )}
        </section>
      </main>

      {/* Modal de crear liga */}
      <CreateLeagueModal
        isOpen={isCreateLeagueModalOpen}
        onClose={() => setIsCreateLeagueModalOpen(false)}
        onSuccess={handleCreateLeagueSuccess}
      />

      {/* Modal de unirse a liga */}
      <JoinLeagueModal
        isOpen={isJoinLeagueModalOpen}
        onClose={() => setIsJoinLeagueModalOpen(false)}
        onSuccess={fetchLeagues}
      />

      {/* Modal de reactivar liga */}
      <ReactivateLeagueModal
        isOpen={isReactivateModalOpen}
        onClose={handleCloseReactivateModal}
        onConfirm={handleConfirmReactivate}
        leagueName={leagues.find((l) => l.id === reactivatingLeagueId)?.nombre || ''}
        isSubmitting={isReactivating}
        error={reactivateError}
      />

      {/* Modal de editar perfil */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsEditProfileOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-3xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-xl font-semibold">Editar Perfil</h2>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                disabled={profileSubmitting}
                className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {profileError && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{profileError}</p>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={profileForm.nombre}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, nombre: e.target.value }))}
                  disabled={profileSubmitting}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={profileForm.telefono}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Ej: +34 612 345 678"
                  disabled={profileSubmitting}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-lime-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1">Fecha de nacimiento</label>
                <input
                  type="date"
                  value={profileForm.fecha_nacimiento}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, fecha_nacimiento: e.target.value }))}
                  disabled={profileSubmitting}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-lime-500 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  disabled={profileSubmitting}
                  className="flex-1 py-2.5 text-white font-medium rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-lime-500 to-emerald-500 text-zinc-900 font-semibold rounded-lg hover:from-lime-400 hover:to-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {profileSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}