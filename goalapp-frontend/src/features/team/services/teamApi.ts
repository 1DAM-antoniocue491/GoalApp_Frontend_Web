/**
 * Servicio de API para el módulo de Equipos
 * Maneja las llamadas relacionadas con la gestión de equipos
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiGet, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

// ============================================
// TIPOS DE API
// ============================================

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

/**
 * Detalle completo de un equipo para la página de detalle
 */
export interface TeamDetailResponse extends TeamResponse {
  ciudad: string | null;
  estadio: string | null;
  posicion_liga: number;
  puntos: number;
  tasa_victoria: number;
  goles_favor: number;
  goles_contra: number;
}

/**
 * Resultado de un partido
 */
export interface MatchResult {
  id_partido: number;
  fecha: string;
  estado: string;
  id_equipo_local: number;
  id_equipo_visitante: number;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
  goles_local: number | null;
  goles_visitante: number | null;
  resultado?: 'W' | 'D' | 'L';
}

/**
 * Jugador con estadísticas para la plantilla
 */
export interface PlayerWithStatsResponse {
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  posicion: string;
  dorsal: number;
  activo: boolean;
  nombre: string;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
  rating?: number;
}

/**
 * Información del staff del equipo
 */
export interface TeamStaffResponse {
  entrenador: {
    id_usuario: number;
    nombre: string;
  } | null;
  capitan: {
    id_jugador: number;
    nombre: string;
    dorsal: number;
  } | null;
}

/**
 * Respuesta del backend para un jugador.
 * Coincide con JugadorResponse del backend (app/schemas/jugador.py).
 * El backend solo almacena posicion, dorsal y activo.
 * Los datos personales (nombre) vienen de la tabla usuario via id_usuario.
 * Las estadísticas (goles, asistencias, etc.) se calculan desde eventos_partido.
 */
export interface PlayerResponse {
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  posicion: string;
  dorsal: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Datos extendidos de un jugador para la UI.
 * Incluye información del usuario y estadísticas calculadas.
 * Se construye combinando datos de jugador, usuario y eventos.
 */
export interface PlayerWithStatsResponse {
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  posicion: string;
  dorsal: number;
  activo: boolean;
  nombre: string;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener equipos de una liga
 * GET /equipos/?id_liga={ligaId}
 */
export async function fetchTeamsByLeague(ligaId: number): Promise<TeamResponse[]> {
  if (isMockEnabled()) {
    const teams = await mockApi.mockFetchTeamsByLeague(ligaId);
    return teams as TeamResponse[];
  }

  try {
    return await apiGet<TeamResponse[]>(`/equipos/?id_liga=${ligaId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener jugadores de un equipo
 * GET /jugadores/?id_equipo={equipoId}
 */
export async function fetchPlayersByTeam(equipoId: number): Promise<PlayerResponse[]> {
  if (isMockEnabled()) {
    const players = await mockApi.mockFetchPlayersByTeam(equipoId);
    return players as PlayerResponse[];
  }

  try {
    return await apiGet<PlayerResponse[]>(`/jugadores/?id_equipo=${equipoId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener jugadores de un equipo con estadísticas calculadas
 * Combina datos de /jugadores/ con estadísticas de eventos.
 *
 * NOTA: El backend no tiene un endpoint que devuelva jugadores con stats directamente.
 * Las estadísticas (goles, asistencias, tarjetas) se calculan desde eventos_partido.
 * En modo real, se obtienen jugadores base y se inicializan stats en 0,
 * ya que el endpoint de eventos no está integrado aún en este servicio.
 *
 * GET /jugadores/?id_equipo={equipoId}
 */
export async function fetchPlayersWithStatsByTeam(equipoId: number): Promise<PlayerWithStatsResponse[]> {
  if (isMockEnabled()) {
    const players = await mockApi.mockFetchPlayersByTeam(equipoId);
    return players as PlayerWithStatsResponse[];
  }

  try {
    const players = await apiGet<PlayerResponse[]>(`/jugadores/?id_equipo=${equipoId}`);
    // Mapear a formato con stats - los valores se inicializan en 0
    // ya que el backend no devuelve estadísticas en este endpoint
    return players.map((player) => ({
      ...player,
      nombre: `Jugador #${player.dorsal}`, // El nombre real viene de /usuarios/{id}
      goles: 0,
      asistencias: 0,
      tarjetas_amarillas: 0,
      tarjetas_rojas: 0,
      partidos_jugados: 0,
    }));
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// ============================================
// CREAR EQUIPO
// ============================================

export interface CreateTeamPayload {
  nombre: string;
  escudo?: string;
  colores?: string;
  id_liga: number;
  id_entrenador?: number;
  id_delegado?: number;
}

/**
 * Crear un nuevo equipo
 * POST /equipos/
 */
export async function createTeam(team: CreateTeamPayload): Promise<TeamResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockCreateTeam(team);
  }

  try {
    const { apiPost } = await import('../../../services/api');
    return await apiPost<TeamResponse>('/equipos/', team);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// ============================================
// DETALLE DE EQUIPO
// ============================================

/**
 * Obtener detalle de un equipo
 * GET /equipos/{equipoId}/detalle
 */
export async function fetchTeamDetail(equipoId: number): Promise<TeamDetailResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamDetail(equipoId);
  }

  try {
    return await apiGet<TeamDetailResponse>(`/equipos/${equipoId}/detalle`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener próximos partidos de un equipo
 * GET /equipos/{equipoId}/partidos/proximos
 */
export async function fetchTeamNextMatches(equipoId: number): Promise<MatchResult[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamNextMatches(equipoId);
  }

  try {
    return await apiGet<MatchResult[]>(`/equipos/${equipoId}/partidos/proximos`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener últimos partidos de un equipo
 * GET /equipos/{equipoId}/partidos/ultimos
 */
export async function fetchTeamLastMatches(equipoId: number): Promise<MatchResult[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamLastMatches(equipoId);
  }

  try {
    return await apiGet<MatchResult[]>(`/equipos/${equipoId}/partidos/ultimos`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener máximos goleadores de un equipo
 * GET /equipos/{equipoId}/goleadores
 */
export async function fetchTeamTopScorers(equipoId: number): Promise<PlayerWithStatsResponse[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamTopScorers(equipoId);
  }

  try {
    return await apiGet<PlayerWithStatsResponse[]>(`/equipos/${equipoId}/goleadores`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener plantilla completa de un equipo
 * GET /equipos/{equipoId}/plantilla
 */
export async function fetchTeamSquad(equipoId: number): Promise<PlayerWithStatsResponse[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamSquad(equipoId);
  }

  try {
    return await apiGet<PlayerWithStatsResponse[]>(`/equipos/${equipoId}/plantilla`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener staff de un equipo (entrenador, capitán)
 * GET /equipos/{equipoId}/staff
 */
export async function fetchTeamStaff(equipoId: number): Promise<TeamStaffResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamStaff(equipoId);
  }

  try {
    return await apiGet<TeamStaffResponse>(`/equipos/${equipoId}/staff`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// ============================================
// ACTUALIZAR EQUIPO
// ============================================

export interface UpdateTeamPayload {
  nombre?: string;
  ciudad?: string;
  estadio?: string;
  escudo?: string;
  colores?: string;
}

/**
 * Actualizar un equipo existente
 * PATCH /equipos/{equipoId}
 */
export async function updateTeam(equipoId: number, team: UpdateTeamPayload): Promise<TeamResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockUpdateTeam(equipoId, team);
  }

  try {
    const { apiPatch } = await import('../../../services/api');
    return await apiPatch<TeamResponse>(`/equipos/${equipoId}`, team);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Eliminar un equipo
 * DELETE /equipos/{equipoId}
 */
export async function deleteTeam(equipoId: number): Promise<void> {
  if (isMockEnabled()) {
    return await mockApi.mockDeleteTeam(equipoId);
  }

  try {
    const { apiDelete } = await import('../../../services/api');
    return await apiDelete(`/equipos/${equipoId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}