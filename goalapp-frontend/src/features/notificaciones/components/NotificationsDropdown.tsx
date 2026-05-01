import { useState, useEffect, useRef } from 'react';
import { FiBell, FiCheck, FiCheckSquare, FiInbox } from 'react-icons/fi';
import { Link } from 'react-router';
import { loadNotifications, markAsRead, markAllAsRead } from '../services/notificationsApi';
import type { Notification } from '../types';

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

const typeIcons: Record<string, React.ReactNode> = {
  partido_programado: <span className="text-blue-400">📅</span>,
  partido_en_juego: <span className="text-green-400">⚽</span>,
  partido_finalizado: <span className="text-purple-400">🏁</span>,
  partido_cancelado: <span className="text-red-400">❌</span>,
  convocatoria: <span className="text-yellow-400">📋</span>,
  convocatoria_actualizada: <span className="text-orange-400">🔄</span>,
  convocatoria_eliminada: <span className="text-red-400">🗑️</span>,
  resultado: <span className="text-green-400">📊</span>,
  clasificacion: <span className="text-blue-400">📈</span>,
  jugador_nuevo: <span className="text-cyan-400">👤</span>,
  liga_actualizacion: <span className="text-indigo-400">🏆</span>,
  tarjeta: <span className="text-red-400">🟥</span>,
  gol: <span className="text-green-400">⚽</span>,
  rol_asignado: <span className="text-yellow-400">🎯</span>,
  rol_revocado: <span className="text-orange-400">📤</span>,
};

const typeLabels: Record<string, string> = {
  partido_programado: 'Partido programado',
  partido_en_juego: 'Partido en juego',
  partido_finalizado: 'Partido finalizado',
  partido_cancelado: 'Partido cancelado',
  convocatoria: 'Convocatoria',
  convocatoria_actualizada: 'Convocatoria actualizada',
  convocatoria_eliminada: 'Convocatoria eliminada',
  resultado: 'Resultado',
  clasificacion: 'Clasificación',
  jugador_nuevo: 'Nuevo jugador',
  liga_actualizacion: 'Actualización de liga',
  tarjeta: 'Tarjeta',
  gol: 'Gol',
  rol_asignado: 'Rol asignado',
  rol_revocado: 'Rol revocado',
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Ahora mismo';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays < 7) return `Hace ${diffDays} d`;

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function NotificationsDropdown({ isOpen, onClose, triggerRef }: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadNotificationsData();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      
      const isInsideDropdown = dropdownRef.current?.contains(target);
      const isInsideTrigger = triggerRef?.current?.contains(target);
      
      if (!isInsideDropdown && !isInsideTrigger) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const loadNotificationsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    setMarkingId(notificationId);
    try {
      await markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id_notificacion === notificationId ? { ...n, leido: true } : n
        )
      );
    } catch (err) {
      console.error('Error al marcar como leída:', err);
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.leido).length;

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 bg-gradient-to-b from-zinc-800 to-70% to-zinc-950 border border-zinc-700 rounded-lg shadow-lg z-50 w-96"
    >
      <div className="flex items-center justify-between p-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <FiBell className="text-zinc-400" />
          <span className="text-zinc-300 text-sm font-semibold">
            {unreadCount > 0
              ? `${unreadCount} no leída${unreadCount > 1 ? 's' : ''}`
              : 'Todas leídas'}
          </span>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-lime-400 hover:text-lime-300 hover:bg-lime-900/20 rounded transition-colors disabled:opacity-50"
          >
            <FiCheckSquare className="w-3.5 h-3.5" />
            Marcar todas
          </button>
        )}
      </div>

      <div className="space-y-1.5 p-3 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full" />
            <span className="ml-2 text-zinc-400 text-sm">Cargando...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <FiInbox className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={loadNotificationsData}
              className="mt-3 px-4 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <FiInbox className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const icon = typeIcons[notification.tipo] || <FiBell className="text-zinc-400" />;
            const label = typeLabels[notification.tipo] || notification.tipo;

            return (
              <div
                key={notification.id_notificacion}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.leido
                    ? 'bg-zinc-900/50 border-zinc-800'
                    : 'bg-zinc-800/50 border-lime-900/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          notification.leido ? 'text-zinc-400' : 'text-white'
                        }`}>
                          {notification.titulo}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                      </div>

                      {!notification.leido && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id_notificacion)}
                          disabled={markingId === notification.id_notificacion}
                          className="shrink-0 p-1.5 text-zinc-500 hover:text-lime-400 hover:bg-lime-900/20 rounded transition-colors disabled:opacity-50"
                          title="Marcar como leída"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className={`text-xs mt-2 ${
                      notification.leido ? 'text-zinc-500' : 'text-zinc-300'
                    }`}>
                      {notification.mensaje}
                    </p>

                    <p className="text-xs text-zinc-600 mt-2">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="text-center p-2 border-t border-zinc-700">
        <Link className="text-lime-400 hover:underline" to={'/notifications'}>Ver todas las notificaciones</Link>
      </div>
    </div>
  );
}
