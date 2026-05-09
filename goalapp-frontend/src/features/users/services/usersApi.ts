/**
 * Servicio de API para el módulo de Usuarios
 * Maneja las llamadas relacionadas con la gestión de usuarios de una liga
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiGet, apiPost, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

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
  id_equipo?: number;
  nombre_equipo?: string;
  estadio?: string;
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
 * Estadísticas deportivas de un usuario en una liga
 */
export interface UserSportsStats {
  id_jugador: number;
  id_usuario: number;
  nombre: string;
  nombre_equipo: string;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
  veces_mvp: number;
}

/**
 * Obtener todos los roles disponibles
 * GET /roles/
 */
export async function fetchRoles(): Promise<Rol[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchRoles();
  }

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
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamsByLeagueForUsers(ligaId);
  }

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
 * @param ligaId - ID de la liga
 * @param solo_activos - Si true, filtra solo usuarios activos (default: false)
 */
export async function fetchUsersByLeague(ligaId: number, solo_activos: boolean = false): Promise<UserWithRole[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchUsersByLeague(ligaId);
  }

  try {
    return await apiGet<UserWithRole[]>(`/usuarios/ligas/${ligaId}/usuarios?solo_activos=${solo_activos}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener estadísticas deportivas de un usuario en una liga
 * GET /estadisticas/liga/{ligaId}/jugador/{usuarioId}/estadisticas
 * Retorna null si el usuario no es jugador en esa liga
 */
export async function fetchUserSportsStats(
  ligaId: number,
  usuarioId: number
): Promise<UserSportsStats | null> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchPlayerPersonalStats(ligaId, usuarioId);
  }

  try {
    const { apiGet } = await import('../../../services/api');
    return await apiGet<UserSportsStats>(
      `/estadisticas/liga/${ligaId}/jugador/${usuarioId}/estadisticas`
    );
  } catch (error) {
    const apiError = error as ApiError;
    // Retornar null para 404 (usuario no es jugador en esta liga)
    if (apiError && typeof apiError === 'object' && 'status' in apiError && apiError.status === 404) {
      return null;
    }
    throw new Error(getErrorMessage(apiError));
  }
}

/**
 * Invitar usuario a una liga
 * POST /invitaciones/ligas/{ligaId}/invitar
 */
export async function inviteUser(payload: InviteUserPayload): Promise<void> {
  if (isMockEnabled()) {
    await mockApi.mockInviteUser(payload);
    return;
  }

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

/**
 * Obtener estadísticas de usuarios en una liga
 * GET /usuarios/ligas/{ligaId}/stats
 */
export async function fetchUserLeagueStats(ligaId: number): Promise<UserStats> {
  if (isMockEnabled()) {
    // Mock data
    return {
      total: 5,
      activos: 4,
      pendientes: 1,
      admin_activos: 1,
    };
  }

  try {
    const { apiGet } = await import('../../../services/api');
    return await apiGet<UserStats>(`/usuarios/ligas/${ligaId}/stats`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}
