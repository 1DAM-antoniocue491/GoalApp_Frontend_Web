import { useEffect, useState } from 'react';
import { useSelectedLeague } from '../../../context/SelectedLeagueContext';
import Nav from '../../../components/Nav';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationsApi';
import NotificationsList from '../components/NotificationsList';
import NotificationsSearch from '../components/NotificationsSearch';
import type { CategoryFilter } from '../components/NotificationsSearch';
import EmptyNotifications from '../components/EmptyNotifications';
import type { Notification } from '../types';

export default function NotificationsPage() {
  const { selectedLeague } = useSelectedLeague();
  const leagueName = selectedLeague?.nombre;
  const userRole = selectedLeague?.rol;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  const loadNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => 
        n.id_notificacion === id ? { ...n, leido: true } : n
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al marcar todas como leídas');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = notification.titulo.toLowerCase().includes(search.toLowerCase()) ||
                          notification.mensaje.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || 
                          (category === 'live' && notification.tipo === 'partido_en_juego') ||
                          (category === 'results' && notification.tipo === 'partido_finalizado') ||
                          (category === 'teams' && notification.tipo.includes('convocatoria')) ||
                          (category === 'players' && notification.tipo === 'jugador_nuevo') ||
                          (category === 'stats' && notification.tipo === 'clasificacion');
    return matchesSearch && matchesCategory;
  });

  if (!selectedLeague) {
    return (
      <>
        <Nav />
        <div className="bg-zinc-950 min-h-[calc(100vh-48px)] flex items-center justify-center p-6">
          <div className="text-center">
            <h2 className="text-zinc-500 text-lg mb-2">Selecciona una liga</h2>
            <p className="text-zinc-600 text-sm">Elige una liga para ver tus notificaciones</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Nav leagueName={leagueName} userRole={userRole} />
      <div className="bg-zinc-950 min-h-[calc(100vh-48px)] p-6">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold mb-2">Notificaciones</h1>
          <p className="text-zinc-400 text-sm">{leagueName}</p>
        </div>

        <NotificationsSearch 
          search={search} 
          onSearch={setSearch} 
          category={category} 
          onCategoryChange={setCategory} 
        />

        <div className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-lime-400 border-t-transparent"></div>
              <p className="text-zinc-400 text-sm ml-3">Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button 
                onClick={loadNotifications} 
                className="text-lime-400 text-sm hover:text-lime-300"
              >
                Reintentar
              </button>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <NotificationsList 
              notifications={filteredNotifications}
            />
          ) : (
            <EmptyNotifications />
          )}
        </div>
      </div>
    </>
  );
}
