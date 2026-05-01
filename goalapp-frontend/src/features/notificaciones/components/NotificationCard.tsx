import { FaBell, FaEnvelope, FaCalendar, FaCalendarCheck, FaBan, FaStar, FaUser, FaTrophy, FaChartLine, FaExclamation } from 'react-icons/fa';
import type { Notification } from '../types';
import NotificationIcon from './NotificationIcon';

export default function NotificationCard({ 
  notification 
}: { 
  notification: Notification;
}) {
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 hover:border-zinc-600 transition-colors">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <NotificationIcon type={notification.tipo} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <h3 className={`text-sm font-semibold ${notification.leido ? 'text-zinc-500' : 'text-white'}`}>
              {notification.titulo}
            </h3>
            <span className="text-xs text-zinc-600 whitespace-nowrap">
              {formatDate(notification.created_at)}
            </span>
          </div>
          <p className={`text-sm mt-1 ${notification.leido ? 'text-zinc-500' : 'text-zinc-300'}`}>
            {notification.mensaje}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `Hace ${minutes} min`;
    }
    return `Hace ${hours}h`;
  } else if (days === 1) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
}
