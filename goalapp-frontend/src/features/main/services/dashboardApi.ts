/**
 * Servicio de API para el módulo de Dashboard
 * Maneja las llamadas relacionadas con datos del dashboard principal
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';
import { apiGet, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';

// ============================================
// TIPOS
// ============================================

export interface DashboardLiveMatch {
  league: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  minute: string;
}

export interface DashboardResult {
  league: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
}

export interface DashboardUpcomingMatch {
  league: string;
  home: string;
  away: string;
  date: string;
  time: string;
}

export interface AdminDashboardStats {
  equiposRegistrados: number;
  usuariosTotales: number;
  partidosProgramados: number;
}

export interface CoachDashboardStats {
  jugadores: number;
  partidosJugados: number;
  victorias: number;
  goles: number;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener partidos en vivo para el dashboard
 * GET /public/matches?estado=en_vivo
 */
export async function fetchLiveMatches(): Promise<DashboardLiveMatch[]> {
  if (isMockEnabled()) {
    const partidos = await mockApi.mockFetchLiveMatches();
    return partidos.map((p) => ({
      league: `Liga ${p.id_liga}`,
      home: p.equipo_local,
      away: p.equipo_visitante,
      homeScore: p.goles_local,
      awayScore: p.goles_visitante,
      minute: "67'",
    }));
  }

  try {
    return await apiGet<DashboardLiveMatch[]>('/public/matches?estado=en_vivo');
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener resultados recientes para el dashboard
 * GET /public/matches?estado=finalizado&limit=5
 */
export async function fetchRecentResults(limit: number = 5): Promise<DashboardResult[]> {
  if (isMockEnabled()) {
    const partidos = await mockApi.mockFetchRecentMatches(limit);
    return partidos.map((p) => ({
      league: `Liga ${p.id_liga}`,
      home: p.equipo_local,
      away: p.equipo_visitante,
      homeScore: p.goles_local,
      awayScore: p.goles_visitante,
    }));
  }

  try {
    return await apiGet<DashboardResult[]>(`/public/matches?estado=finalizado&limit=${limit}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener próximos partidos para el dashboard
 * GET /public/matches?estado=programado&limit=5
 */
export async function fetchUpcomingMatches(limit: number = 5): Promise<DashboardUpcomingMatch[]> {
  if (isMockEnabled()) {
    const partidos = await mockApi.mockFetchUpcomingMatches(limit);
    return partidos.map((p) => {
      const date = new Date(p.fecha);
      return {
        league: `Liga ${p.id_liga}`,
        home: p.equipo_local,
        away: p.equipo_visitante,
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  }

  try {
    return await apiGet<DashboardUpcomingMatch[]>(`/public/matches?estado=programado&limit=${limit}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener estadísticas del dashboard admin
 */
export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (isMockEnabled()) {
    return mockApi.mockGetAdminDashboardStats();
  }

  try {
    return await apiGet<AdminDashboardStats>('/dashboard/admin/stats');
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener estadísticas del dashboard entrenador
 */
export async function fetchCoachDashboardStats(): Promise<CoachDashboardStats> {
  if (isMockEnabled()) {
    return mockApi.mockGetCoachDashboardStats();
  }

  try {
    return await apiGet<CoachDashboardStats>('/dashboard/coach/stats');
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}