/**
 * Servicio de API para el módulo de Usuarios
 * Maneja las llamadas relacionadas con la gestión de usuarios de una liga
 */

import { apiGet, apiPost, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';

// ============================================
// TIPOS DE API
// ============================================

export type UserRole = 'admin' | 'entrenador' | 'delegado' | 'jugador' | 'observador';
export type UserStatus = 'activo' | 'pendiente';

export interface UserWithRole {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
  rol: UserRole;
  activo: boolean;
  created_at: string;
}

export interface InviteUserPayload {
  email: string;
  liga_id: number;
  id_rol: number;
  nombre?: string;
  id_equipo?: number;
  dorsal?: number;
  posicion?: string;
  tipo_jugador?: string;
}

export interface UserStats {
  total: number;
  activos: number;
  pendientes: number;
  admin_activos: number;
}

export interface TeamResponse {
  id_equipo: number;
  nombre: string;
  escudo: string | null;
  colores: string | null;
  id_liga: number;
  id_entrenador: number;
  id_delegado: number;
  created_at: string;
  updated_at: string;
}

export interface Rol {
  id_rol: number;
  nombre: string;
}

/**
 * Obtener todos los roles disponibles
 * GET /roles/
 */
export async function fetchRoles(): Promise<Rol[]> {
  try {
    return await apiGet<Rol[]>('/roles/');
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener equipos de una liga
 * GET /equipos/?liga_id={ligaId}
 */
export async function fetchTeamsByLeague(ligaId: number): Promise<TeamResponse[]> {
  try {
    const { apiGet } = await import('../../../services/api');
    return await apiGet<TeamResponse[]>('/equipos/', { liga_id: ligaId });
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener usuarios con rol en una liga
 * GET /usuarios/ligas/{ligaId}/usuarios
 */
export async function fetchUsersByLeague(ligaId: number): Promise<UserWithRole[]> {
  try {
    return await apiGet<UserWithRole[]>(`/usuarios/ligas/${ligaId}/usuarios`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Invitar usuario a una liga
 * POST /invitaciones/ligas/{ligaId}/invitar
 */
export async function inviteUser(payload: InviteUserPayload): Promise<void> {
  try {
    const { apiPost } = await import('../../../services/api');
    await apiPost(`/invitaciones/ligas/${payload.liga_id}/invitar`, {
      email: payload.email,
      id_rol: payload.id_rol,
      nombre: payload.nombre,
      id_equipo: payload.id_equipo,
      dorsal: payload.dorsal,
      posicion: payload.posicion,
      tipo_jugador: payload.tipo_jugador,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}
