import { FaBell, FaEnvelope, FaCalendar, FaCalendarCheck, FaBan, FaStar, FaUser, FaTrophy, FaChartLine, FaExclamation } from 'react-icons/fa';
import type { NotificationType } from '../types';

const iconMap: Record<NotificationType | string, React.ElementType> = {
  partido_programado: FaCalendar,
  partido_en_juego: FaBell,
  partido_finalizado: FaCalendarCheck,
  partido_cancelado: FaBan,
  convocatoria: FaEnvelope,
  convocatoria_actualizada: FaUser,
  convocatoria_eliminada: FaUser,
  resultado: FaTrophy,
  clasificacion: FaChartLine,
  jugador_nuevo: FaUser,
  liga_actualizacion: FaBell,
  tarjeta: FaExclamation,
  gol: FaCalendarCheck,
  rol_asignado: FaStar,
  rol_revocado: FaStar,
  default: FaBell,
};

export default function NotificationIcon({ type }: { type: string }) {
  const Icon = iconMap[type as NotificationType] || iconMap['default'];
  return <Icon className="text-lime-400 w-5 h-5" />;
}
