import { FaBellSlash } from 'react-icons/fa';

export default function EmptyNotifications() {
  return (
    <div className="text-center py-12">
      <FaBellSlash className="text-zinc-600 text-4xl mx-auto mb-4" />
      <p className="text-zinc-400 text-sm">No tienes notificaciones</p>
      <p className="text-zinc-500 text-xs mt-1">Todavía no tienes alertas pendientes</p>
    </div>
  );
}
