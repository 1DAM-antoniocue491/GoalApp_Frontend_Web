import { useState } from 'react';
import { FaBell, FaCheckCircle } from 'react-icons/fa';
import NotificationCard from './NotificationCard';
import EmptyNotifications from './EmptyNotifications';
import { markAllNotificationsAsRead } from '../services/notificationsApi';
import type { Notification } from '../types';

export type FilterType = 'all' | 'unread' | 'read' | 'important';

export default function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return !notification.leido;
    if (filter === 'read') return notification.leido;
    if (filter === 'important') return !notification.leido;
    return true;
  });

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">Notificaciones</h2>
        {notifications.length > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-xs text-lime-400 hover:text-lime-300 flex items-center gap-1"
          >
            <FaCheckCircle className="w-3 h-3" />
            Marcar todo
          </button>
        )}
      </div>
      
      <div className="flex gap-2 pt-2 mb-2">
        <FilterButton 
          label="Todas" 
          active={filter === 'all'} 
          onClick={() => setFilter('all')} 
        />
        <FilterButton 
          label="No leídas" 
          active={filter === 'unread'} 
          onClick={() => setFilter('unread')} 
        />
        <FilterButton 
          label="Leídas" 
          active={filter === 'read'} 
          onClick={() => setFilter('read')} 
        />
      </div>

      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <NotificationCard key={notification.id_notificacion} notification={notification} />
          ))
        ) : (
          <EmptyNotifications />
        )}
      </div>

    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700'
      }`}
    >
      {label}
    </button>
  );
}
