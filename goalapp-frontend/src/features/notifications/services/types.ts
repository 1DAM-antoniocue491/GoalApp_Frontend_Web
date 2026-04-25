/**
 * Tipos para el módulo de Notificaciones
 */

export type NotificationType =
  | 'partido_programado'
  | 'partido_en_juego'
  | 'partido_finalizado'
  | 'partido_cancelado'
  | 'convocatoria'
  | 'convocatoria_actualizada'
  | 'convocatoria_eliminada'
  | 'resultado'
  | 'clasificacion'
  | 'jugador_nuevo'
  | 'liga_actualizacion'
  | 'tarjeta'
  | 'gol'
  | 'rol_asignado'
  | 'rol_revocado'
  | 'sistema';

export interface Notification {
  id_notificacion: number;
  id_usuario: number;
  tipo: NotificationType | string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
  id_referencia?: number | null;
  tipo_referencia?: string | null;
}
