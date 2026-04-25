/**
 * Tipos para el módulo de Onboarding
 */

export type UserRole = 'admin' | 'entrenador' | 'jugador' | 'delegado' | 'observador';

export type LeagueStatus = 'activa' | 'finalizada' | 'pendiente';

export interface UserLeague {
  id: number;
  nombre: string;
  temporada: string;
  rol: UserRole;
  estado: LeagueStatus;
  esFavorita: boolean;
  miEquipo?: string;
  equiposTotal: number;
}

export interface OnboardingUser {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
}

// ============================================
// TIPOS DE NOTIFICACIONES
// ============================================

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
  | 'rol_revocado';

export interface Notification {
  id_notificacion: number;
  id_usuario: number;
  tipo: NotificationType | string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}