/**
 * Servicio de API para el módulo de Partidos
 * Maneja las llamadas relacionadas con la gestión de partidos
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiGet, apiPost, apiPut, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

// ============================================
// TIPOS DE API
// ============================================

export interface MatchResponse {
  id_partido: number;
  id_liga: number;
  id_jornada: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha: string;
  estado: 'Programado' | 'En Juego' | 'Finalizado' | 'Suspendido';
  created_at: string;
  updated_at: string;
}

export interface MatchCreatePayload {
  id_liga: number;
  id_jornada?: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  fecha: string;
}

export interface MatchUpdatePayload {
  goles_local?: number;
  goles_visitante?: number;
  estado?: 'Programado' | 'En Juego' | 'Finalizado' | 'Suspendido';
  fecha?: string;
}

export interface MatchWithTeams extends MatchResponse {
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
}

export interface Jornada {
  numero: number;
  nombre: string;
  partidos: MatchWithTeams[];
}

export interface CalendarCreatePayload {
  tipo: 'ida' | 'ida_vuelta';
  fecha_inicio: string;
  dias_partido: number[];
  hora: string;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener todos los partidos de una liga
 * GET /partidos/ligas/{ligaId}
 */
export async function fetchMatchesByLeague(ligaId: number): Promise<MatchResponse[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchMatchesByLeague(ligaId);
  }

  try {
    return await apiGet<MatchResponse[]>(`/partidos/ligas/${ligaId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener partidos de una liga con información de equipos
 * GET /partidos/ligas/{ligaId}/con-equipos
 */
export async function fetchMatchesWithTeams(ligaId: number): Promise<MatchWithTeams[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchMatchesWithTeams(ligaId);
  }

  try {
    return await apiGet<MatchWithTeams[]>(`/partidos/ligas/${ligaId}/con-equipos`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener próximos partidos (todos)
 * GET /partidos/proximos
 */
export async function fetchUpcomingMatches(limit?: number): Promise<MatchWithTeams[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchUpcomingMatches(limit);
  }

  try {
    const url = limit ? `/partidos/proximos?limit=${limit}` : '/partidos/proximos';
    return await apiGet<MatchWithTeams[]>(url);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener partidos en vivo
 * GET /partidos/en-vivo
 */
export async function fetchLiveMatches(): Promise<MatchWithTeams[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchLiveMatches();
  }

  try {
    return await apiGet<MatchWithTeams[]>('/partidos/en-vivo');
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener un partido por ID
 * GET /partidos/{partidoId}
 */
export async function fetchMatchById(partidoId: number): Promise<MatchWithTeams> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchMatchById(partidoId);
  }

  try {
    return await apiGet<MatchWithTeams>(`/partidos/${partidoId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Crear un nuevo partido
 * POST /partidos/
 */
export async function createMatch(match: MatchCreatePayload): Promise<MatchResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockCreateMatch(match);
  }

  try {
    return await apiPost<MatchResponse>('/partidos/', match);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Actualizar un partido
 * PUT /partidos/{partidoId}
 */
export async function updateMatch(
  partidoId: number,
  match: MatchUpdatePayload
): Promise<MatchResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockUpdateMatch(partidoId, match);
  }

  try {
    return await apiPut<MatchResponse>(`/partidos/${partidoId}`, match);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener partidos agrupados por jornada
 * GET /partidos/ligas/{ligaId}/jornadas
 */
export async function fetchMatchesByJornada(ligaId: number): Promise<Jornada[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchMatchesByJornada(ligaId);
  }

  try {
    return await apiGet<Jornada[]>(`/partidos/ligas/${ligaId}/jornadas`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Crear calendario automático para una liga
 * POST /partidos/ligas/{ligaId}/crear-calendario
 */
export async function createCalendar(
  ligaId: number,
  config: CalendarCreatePayload
): Promise<{ mensaje: string; partidos_creados: number }> {
  if (isMockEnabled()) {
    return await mockApi.mockCreateCalendar(ligaId, config);
  }

  try {
    return await apiPost<{ mensaje: string; partidos_creados: number }>(
      `/partidos/ligas/${ligaId}/crear-calendario`,
      config
    );
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}
