/**
 * Página de Onboarding
 * Primera vista después del login para seleccionar o crear una liga
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { FiSearch, FiBell, FiLoader, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../../auth/hooks/useAuth';
import { CreateLeagueModal } from '../../league';
import { ActionCard } from '../components/ActionCard';
import { LeagueCard } from '../components/LeagueCard';
import { OnboardingTabs, type TabFilter } from '../components/OnboardingTabs';
import { loadUserLeagues, toggleLigaFavorita } from '../services/onboardingApi';
import type { OnboardingUser, UserLeague } from '../types';

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
  const [togglingFavoriteId, setTogglingFavoriteId] = useState<number | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  // Obtener usuario desde el contexto de autenticación
  const { user, isInitializing } = useAuth();

  // Mapear usuario a formato local
  const onboardingUser: OnboardingUser | null = user ? {
    id: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    avatar: user.imagen_url,
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
    console.log('Unirme a una liga');
    // TODO: Abrir modal de unirse a liga
  };

  const handleEnterLeague = (leagueId: number) => {
    console.log('Entrar a liga:', leagueId);
    // TODO: Navegar al dashboard de la liga
  };

  const handleReactivateLeague = (leagueId: number) => {
    console.log('Reactivar liga:', leagueId);
    // TODO: Llamar API para reactivar
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
  // RENDER
  // ============================================

  const userName = onboardingUser?.nombre || 'Usuario';
  const userInitials = getInitials(userName);

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
          <div className="flex items-center gap-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
              <FiBell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-lime-400 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 rounded-lg p-2 transition-colors">
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
              <span className="text-white text-sm hidden sm:block">{userName}</span>
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
    </div>
  );
}