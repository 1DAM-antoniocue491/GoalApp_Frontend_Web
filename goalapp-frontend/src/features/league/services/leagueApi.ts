/**
 * Servicio de API para el módulo de Ligas
 * Maneja las llamadas relacionadas con la gestión de ligas
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiPost, apiPut, apiGet, apiDelete, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

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
  categoria?: string;
  activa?: boolean;
  cantidad_partidos?: number;
  duracion_partido?: number;
  logo_url?: string;
}

/**
 * Respuesta del endpoint de crear/listar ligas
 * Coincide con LigaResponse del backend
 */
export interface LeagueResponse {
  id_liga: number;
  nombre: string;
  temporada: string;
  categoria?: string;
  activa: boolean;
  cantidad_partidos?: number;
  duracion_partido?: number;
  logo_url?: string;
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

/**
 * Datos para actualizar una liga existente
 * Coincide con LigaUpdate del backend
 */
export interface UpdateLeagueRequest {
  nombre?: string;
  temporada?: string;
  categoria?: string;
  activa?: boolean;
  cantidad_partidos?: number;
  duracion_partido?: number;
  logo_url?: string;
}

/**
 * Configuración de una liga
 * Coincide con LigaConfiguracionResponse del backend
 */
export interface LeagueConfigResponse {
  id_configuracion: number;
  id_liga: number;
  hora_partidos: string;
  min_equipos: number;
  max_equipos: number;
  min_convocados: number;
  max_convocados: number;
  min_plantilla: number;
  max_plantilla: number;
  min_jugadores_equipo: number;
  min_partidos_entre_equipos: number;
  minutos_partido: number;
  max_partidos: number;
  created_at: string;
  updated_at: string;
}

/**
 * Datos para actualizar la configuración de una liga
 */
export interface UpdateLeagueConfigRequest {
  hora_partidos?: string;
  min_equipos?: number;
  max_equipos?: number;
  min_convocados?: number;
  max_convocados?: number;
  min_plantilla?: number;
  max_plantilla?: number;
  min_jugadores_equipo?: number;
  min_partidos_entre_equipos?: number;
  minutos_partido?: number;
  max_partidos?: number;
}

export interface UpdateLeagueConfigResult {
  success: boolean;
  data?: LeagueConfigResponse;
  error?: string;
}

/**
 * Resultado de actualizar una liga
 */
export interface UpdateLeagueResult {
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
  // Modo mock: simular creación exitosa
  if (isMockEnabled()) {
    const result = await mockApi.mockCreateLeague(data);
    return {
      success: result.success,
      data: result.data as LeagueResponse | undefined,
      error: result.error,
    };
  }

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
  // Modo mock: devolver ligas mock
  if (isMockEnabled()) {
    const ligas = await mockApi.mockFetchAllLeagues();
    return ligas as LeagueResponse[];
  }

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
  // Modo mock: buscar liga mock por ID
  if (isMockEnabled()) {
    const liga = await mockApi.mockFetchLeagueById(id);
    return liga as LeagueResponse;
  }

  try {
    return await apiGet<LeagueResponse>(`/ligas/${id}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Actualizar una liga existente
 * PUT /ligas/{id}
 *
 * @param id - ID de la liga a actualizar
 * @param data - Campos a actualizar
 * @returns Promesa con el resultado de la operación
 *
 * Requiere autenticación con rol Admin
 */
export async function updateLeague(id: number, data: UpdateLeagueRequest): Promise<UpdateLeagueResult> {
  if (isMockEnabled()) {
    const result = await mockApi.mockUpdateLeague(id, data);
    return {
      success: result.success,
      data: result.data as LeagueResponse | undefined,
      error: result.error,
    };
  }

  try {
    const response = await apiPut<LeagueResponse>(`/ligas/${id}`, data);
    return { success: true, data: response };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error as ApiError),
    };
  }
}

/**
 * Obtener la configuración de una liga
 * GET /ligas/{id}/configuracion
 */
export async function fetchLeagueConfig(id: number): Promise<LeagueConfigResponse> {
  if (isMockEnabled()) {
    return mockApi.mockFetchLeagueConfig(id) as Promise<LeagueConfigResponse>;
  }

  try {
    return await apiGet<LeagueConfigResponse>(`/ligas/${id}/configuracion`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Actualizar la configuración de una liga
 * PUT /ligas/{id}/configuracion
 */
export async function updateLeagueConfig(id: number, data: UpdateLeagueConfigRequest): Promise<UpdateLeagueConfigResult> {
  if (isMockEnabled()) {
    return mockApi.mockUpdateLeagueConfig(id, data) as Promise<UpdateLeagueConfigResult>;
  }

  try {
    const response = await apiPut<LeagueConfigResponse>(`/ligas/${id}/configuracion`, data);
    return { success: true, data: response };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error as ApiError),
    };
  }
}

/**
 * Eliminar una liga
 * DELETE /ligas/{id}
 */
export async function deleteLeague(id: number): Promise<{ success: boolean; error?: string }> {
  if (isMockEnabled()) {
    return mockApi.mockDeleteLeague(id);
  }

  try {
    await apiDelete(`/ligas/${id}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error as ApiError) };
  }
}

// ============================================
// EXPORTACIONES DE TIPOS
// ============================================
// Los tipos ya están exportados con 'export interface' arriba