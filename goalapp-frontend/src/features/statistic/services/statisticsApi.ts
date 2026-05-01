/**
 * Servicio de API para Estadísticas
 * Maneja las llamadas relacionadas con estadísticas de la liga
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiGet, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

// ============================================
// TIPOS DE API
// ============================================

/**
 * Estadísticas generales de la temporada
 */
export interface SeasonStatsResponse {
  total_partidos: number;
  total_goles: number;
  promedio_goles_por_partido: number;
  total_amarillas: number;
  total_rojas: number;
  total_asistencias: number;
  equipos_participantes: number;
  jugadores_registrados: number;
}

/**
 * Jugador con estadísticas para top goleadores
 */
export interface TopScorerResponse {
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  nombre: string;
  nombre_equipo: string;
  escudo_equipo: string | null;
  goles: number;
  partidos_jugados: number;
  promedio_goles: number;
}

/**
 * MVP de la jornada
 */
export interface MatchdayMVP {
  id_jugador: number;
  id_usuario: number;
  nombre: string;
  nombre_equipo: string;
  escudo_equipo: string | null;
  rating: number;
  goles: number;
  asistencias: number;
  jornada: number;
}

/**
 * Estadísticas de goles por equipo
 */
export interface TeamGoalsStats {
  id_equipo: number;
  nombre: string;
  escudo: string | null;
  goles_favor: number;
  goles_contra: number;
  diferencia_goles: number;
  promedio_goles_favor: number;
  partidos_jugados: number;
}

/**
 * Estadísticas personales de un jugador
 */
export interface PlayerPersonalStats {
  id_jugador: number;
  id_usuario: number;
  nombre: string;
  nombre_equipo: string;
  escudo_equipo: string | null;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
  veces_mvp: number;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener estadísticas generales de la temporada
 * GET /estadisticas/liga/{ligaId}/temporada
 */
export async function fetchSeasonStats(ligaId: number): Promise<SeasonStatsResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchSeasonStats(ligaId);
  }

  try {
    return await apiGet<SeasonStatsResponse>(`/estadisticas/liga/${ligaId}/temporada`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener top goleadores de la liga
 * GET /estadisticas/liga/{ligaId}/goleadores
 */
export async function fetchTopScorers(ligaId: number, limit: number = 5): Promise<TopScorerResponse[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTopScorers(ligaId, limit);
  }

  try {
    return await apiGet<TopScorerResponse[]>(`/estadisticas/liga/${ligaId}/goleadores?limit=${limit}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener MVP de la jornada
 * GET /estadisticas/liga/{ligaId}/mvp
 */
export async function fetchMatchdayMVP(ligaId: number): Promise<MatchdayMVP | null> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchMatchdayMVP(ligaId);
  }

  try {
    return await apiGet<MatchdayMVP>(`/estadisticas/liga/${ligaId}/mvp`);
  } catch (error) {
    // Si no hay MVP (404), retornar null
    return null;
  }
}

/**
 * Obtener estadísticas de goles por equipo
 * GET /estadisticas/liga/{ligaId}/equipos/goles
 */
export async function fetchTeamGoalsStats(ligaId: number): Promise<TeamGoalsStats[]> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchTeamGoalsStats(ligaId);
  }

  try {
    return await apiGet<TeamGoalsStats[]>(`/estadisticas/liga/${ligaId}/equipos/goles`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener estadísticas personales de un jugador
 * GET /estadisticas/liga/{ligaId}/jugador/{usuarioId}/estadisticas
 */
export async function fetchPlayerPersonalStats(
  ligaId: number,
  usuarioId: number
): Promise<PlayerPersonalStats | null> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchPlayerPersonalStats(ligaId, usuarioId);
  }

  try {
    return await apiGet<PlayerPersonalStats>(
      `/estadisticas/liga/${ligaId}/jugador/${usuarioId}/estadisticas`
    );
  } catch (error) {
    // Si no es jugador (404 o null), retornar null
    return null;
  }
}
