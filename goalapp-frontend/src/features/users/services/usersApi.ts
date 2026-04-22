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

// ============================================
// FUNCIONES DE API
// ============================================

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
      id_rol: getRolId(payload.rol),
      id_equipo: payload.id_equipo,
      dorsal: payload.dorsal,
      posicion: payload.posicion,
      tipo_jugador: payload.tipo_jugador,
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener ID de rol según el nombre
 */
function getRolId(rol: UserRole): number {
  const roles: Record<UserRole, number> = {
    admin: 1,
    entrenador: 2,
    delegado: 3,
    jugador: 4,
    observador: 5,
  };
  return roles[rol] || 4; // Default: jugador
}
