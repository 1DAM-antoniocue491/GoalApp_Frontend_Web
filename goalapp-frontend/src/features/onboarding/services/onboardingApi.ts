/**
 * Servicio de API para el módulo de Onboarding
 * Maneja las llamadas relacionadas con ligas del usuario y seguimiento de ligas
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiGet, apiPost, apiDelete, apiPut, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';
import type { UserLeague, UserRole } from '../types';

// ============================================
// TIPOS DE API
// ============================================

/**
 * Respuesta del endpoint de ligas con rol
 * Coincide con LigaConRolResponse del backend
 */
export interface LigaConRolApi {
  id_liga: number;
  nombre: string;
  temporada: string;
  activa: boolean;
  rol: string;
  equipos_total: number;
}

/**
 * Respuesta del endpoint de ligas seguidas
 * Coincide con LigaSeguidaResponse del backend
 */
export interface LigaSeguidaApi {
  id_liga: number;
  nombre: string;
  temporada: string;
  activa: boolean;
}

/**
 * Respuesta del endpoint de seguir liga
 * Coincide con SeguimientoResponse del backend
 */
export interface SeguimientoResponseApi {
  id_seguimiento: number;
  id_usuario: number;
  id_liga: number;
  created_at: string;
}

/**
 * Respuesta del endpoint de dejar de seguir liga
 */
export interface DejarSeguirResponseApi {
  mensaje: string;
}

// ============================================
// FUNCIONES DE API - SEGUIMIENTO DE LIGAS
// ============================================

/**
 * Obtener las ligas donde el usuario tiene un rol
 * GET /usuarios/me/ligas
 * @returns Promesa con la lista de ligas con el rol del usuario
 * @throws ApiError si hay error de autenticación o de red
 */
export async function fetchUserLeaguesWithRole(): Promise<LigaConRolApi[]> {
  // Modo mock: devolver ligas mock con rol
  if (isMockEnabled()) {
    return mockApi.mockFetchUserLeaguesWithRole() as Promise<LigaConRolApi[]>;
  }

  try {
    const ligas = await apiGet<LigaConRolApi[]>('/usuarios/me/ligas');
    return ligas;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener las ligas que el usuario está siguiendo
 * GET /usuarios/me/ligas-seguidas
 * @returns Promesa con la lista de IDs de ligas seguidas
 * @throws ApiError si hay error de autenticación o de red
 */
export async function fetchLigasSeguidas(): Promise<number[]> {
  // Modo mock: devolver IDs de ligas seguidas mock
  if (isMockEnabled()) {
    return mockApi.mockFetchLigasSeguidasIds();
  }

  try {
    const ligas = await apiGet<LigaSeguidaApi[]>('/usuarios/me/ligas-seguidas');
    // Retornar solo los IDs para facilitar verificación
    return ligas.map((liga) => liga.id_liga);
  } catch (error) {
    // Si hay error, retornar lista vacía para no bloquear la UI
    console.error('Error al obtener ligas seguidas:', error);
    return [];
  }
}

/**
 * Seguir una liga
 * POST /usuarios/me/ligas/{liga_id}/seguir
 * @param ligaId - ID de la liga a seguir
 * @returns Promesa con la respuesta del seguimiento
 * @throws ApiError si hay error de autenticación, validación o de red
 */
export async function seguirLiga(ligaId: number): Promise<SeguimientoResponseApi> {
  // Modo mock: simular seguimiento exitoso
  if (isMockEnabled()) {
    const response = await mockApi.mockSeguirLiga(ligaId);
    return response as SeguimientoResponseApi;
  }

  try {
    const response = await apiPost<SeguimientoResponseApi>(
      `/usuarios/me/ligas/${ligaId}/seguir`
    );
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Dejar de seguir una liga
 * DELETE /usuarios/me/ligas/{liga_id}/seguir
 * @param ligaId - ID de la liga a dejar de seguir
 * @returns Promesa con mensaje de confirmación
 * @throws ApiError si hay error de autenticación o de red
 */
export async function dejarDeSeguirLiga(ligaId: number): Promise<DejarSeguirResponseApi> {
  // Modo mock: simular dejar de seguir exitoso
  if (isMockEnabled()) {
    const response = await mockApi.mockDejarDeSeguirLiga(ligaId);
    return response as DejarSeguirResponseApi;
  }

  try {
    const response = await apiDelete<DejarSeguirResponseApi>(
      `/usuarios/me/ligas/${ligaId}/seguir`
    );
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// ============================================
// FUNCIONES DE TRANSFORMACIÓN
// ============================================

/**
 * Mapear rol del backend al tipo del frontend
 */
function mapRol(rol: string): UserRole {
  const rolMap: Record<string, UserRole> = {
    admin: 'admin',
    entrenador: 'entrenador',
    jugador: 'jugador',
    delegado: 'delegado',
    observador: 'observador',
  };
  return rolMap[rol.toLowerCase()] || 'jugador';
}

/**
 * Transformar ligas del backend al formato del frontend
 * Combina información de rol y estado de favorito
 * @param ligasConRol - Lista de ligas con rol desde la API
 * @param ligasSeguidasIds - Lista de IDs de ligas seguidas
 * @returns Lista de ligas formateadas para UI
 */
export function transformLeaguesForUI(
  ligasConRol: LigaConRolApi[],
  ligasSeguidasIds: number[]
): UserLeague[] {
  return ligasConRol.map((liga) => ({
    id: liga.id_liga,
    nombre: liga.nombre,
    temporada: liga.temporada,
    rol: mapRol(liga.rol),
    estado: liga.activa ? 'activa' : 'finalizada',
    esFavorita: ligasSeguidasIds.includes(liga.id_liga),
    equiposTotal: liga.equipos_total || 0,
  }));
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

/**
 * Cargar las ligas donde el usuario tiene un rol, incluyendo estado de favoritos
 * Obtiene tanto las ligas con rol como las ligas seguidas
 * @returns Promesa con la lista de ligas formateadas
 */
export async function loadUserLeagues(): Promise<UserLeague[]> {
  // Cargar ambas en paralelo para optimizar rendimiento
  const [ligasConRol, ligasSeguidasIds] = await Promise.all([
    fetchUserLeaguesWithRole(),
    fetchLigasSeguidas(),
  ]);

  return transformLeaguesForUI(ligasConRol, ligasSeguidasIds);
}

/**
 * Reactivar una liga finalizada
 * PUT /ligas/{liga_id}/reactivar
 * @param ligaId - ID de la liga a reactivar
 * @returns Promesa que resuelve cuando la operación se completa
 * @throws Error si la operación falla
 */
export async function reactivarLiga(ligaId: number): Promise<void> {
  if (isMockEnabled()) {
    await mockApi.mockReactivarLiga(ligaId);
    return;
  }

  try {
    await apiPut(`/ligas/${ligaId}/reactivar`, {});
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Alternar el estado de favorito de una liga
 * Si es favorito, deja de seguir; si no es favorito, comienza a seguir
 * @param ligaId - ID de la liga
 * @param esFavorita - Estado actual de favorito
 * @returns Promesa que resuelve cuando la operación se completa
 * @throws Error si la operación falla
 */
export async function toggleLigaFavorita(
  ligaId: number,
  esFavorita: boolean
): Promise<void> {
  // Modo mock: delegar al mock API
  if (isMockEnabled()) {
    await mockApi.mockToggleLigaFavorita(ligaId, esFavorita);
    return;
  }

  if (esFavorita) {
    // Si ya es favorita, dejar de seguir
    await dejarDeSeguirLiga(ligaId);
  } else {
    // Si no es favorita, seguir
    await seguirLiga(ligaId);
  }
}

// ============================================
// UNIRSE A LIGA CON CÓDIGO DE INVITACIÓN
// ============================================

/**
 * Respuesta del endpoint de unirse a liga por código
 */
export interface JoinLeagueResponse {
  id_seguimiento: number;
  id_usuario: number;
  id_liga: number;
  created_at: string;
}

/**
 * Unirse a una liga mediante código de invitación
 * POST /usuarios/me/ligas/codigo/{codigo}
 *
 * NOTA: El backend NO tiene un endpoint específico para unirse por código.
 * El endpoint actual usa liga_id: POST /usuarios/me/ligas/{liga_id}/seguir
 * Se usa este endpoint como alternativa mientras el backend implementa
 * el endpoint por código de invitación.
 *
 * @param codigo - Código de invitación de la liga
 * @returns Promesa con la respuesta del seguimiento
 * @throws Error si el código es inválido o la operación falla
 */
export async function joinLeagueByCode(codigo: string): Promise<JoinLeagueResponse> {
  // Modo mock: simular unión exitosa
  if (isMockEnabled()) {
    const response = await mockApi.mockJoinLeagueByCode(codigo);
    return response as JoinLeagueResponse;
  }

  try {
    // NOTA: El backend no tiene endpoint por código aún.
    // Se intenta usar el código como si fuera el id_liga temporalmente.
    // Cuando el backend implemente el endpoint correcto, se cambiará aquí.
    const ligaId = parseInt(codigo, 10);
    if (isNaN(ligaId)) {
      throw new Error('Código de invitación inválido. Debe ser un número de liga válido.');
    }
    const response = await apiPost<JoinLeagueResponse>(
      `/usuarios/me/ligas/${ligaId}/seguir`
    );
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}