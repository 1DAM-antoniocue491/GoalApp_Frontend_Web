/**
 * Servicio de API para el módulo de Ligas
 * Maneja las llamadas relacionadas con la gestión de ligas
 */

import { apiPost, apiGet, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';

// ============================================
// TIPOS DE API
// ============================================

/**
 * Datos para crear una nueva liga
 * Coincide con LigaCreate del backend
 */
export interface CreateLeagueRequest {
  nombre: string;
  temporada: string;
  activa?: boolean;
}

/**
 * Respuesta del endpoint de crear/listar ligas
 * Coincide con LigaResponse del backend
 */
export interface LeagueResponse {
  id_liga: number;
  nombre: string;
  temporada: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Resultado de crear una liga
 */
export interface CreateLeagueResult {
  success: boolean;
  data?: LeagueResponse;
  error?: string;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Crear una nueva liga
 * POST /ligas/
 *
 * @param data - Datos de la liga a crear
 * @returns Promesa con el resultado de la operación
 *
 * Requiere autenticación con rol Admin
 */
export async function createLeague(data: CreateLeagueRequest): Promise<CreateLeagueResult> {
  try {
    const response = await apiPost<LeagueResponse>('/ligas/', data);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error as ApiError),
    };
  }
}

/**
 * Obtener todas las ligas
 * GET /ligas/
 *
 * @returns Promesa con la lista de ligas
 */
export async function fetchAllLeagues(): Promise<LeagueResponse[]> {
  try {
    return await apiGet<LeagueResponse[]>('/ligas/');
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener una liga por su ID
 * GET /ligas/{id}
 *
 * @param id - ID de la liga
 * @returns Promesa con la liga
 */
export async function fetchLeagueById(id: number): Promise<LeagueResponse> {
  try {
    return await apiGet<LeagueResponse>(`/ligas/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// ============================================
// EXPORTACIONES DE TIPOS
// ============================================
// Los tipos ya están exportados con 'export interface' arriba