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

/**
 * Respuesta del backend para un partido.
 * Coincide con PartidoResponse del backend.
 */
interface PartidoApi {
  id_partido: number;
  id_liga: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  fecha: string;
  estado: 'programado' | 'en_juego' | 'finalizado' | 'cancelado';
  goles_local: number | null;
  goles_visitante: number | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener partidos en vivo para el dashboard
 * GET /partidos/?estado=en_juego (filtrado en cliente)
 *
 * NOTA: El backend no soporta filtrado por query params en /partidos/.
 * Se obtienen todos los partidos y se filtran en el cliente por estado.
 * El endpoint público equivalente es GET /public/ligas/{liga_id}/partidos
 * pero requiere un liga_id específico.
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
    const partidos = await apiGet<PartidoApi[]>('/partidos/');
    const liveMatches = partidos.filter((p) => p.estado === 'en_juego');
    // Mapear a formato de dashboard
    return liveMatches.map((p) => ({
      league: `Liga ${p.id_liga}`,
      home: `Equipo ${p.id_equipo_local}`,
      away: `Equipo ${p.id_equipo_visitante}`,
      homeScore: p.goles_local ?? 0,
      awayScore: p.goles_visitante ?? 0,
      minute: "En juego",
    }));
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener resultados recientes para el dashboard
 * GET /partidos/ (filtrado en cliente por estado finalizado)
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
    const partidos = await apiGet<PartidoApi[]>('/partidos/');
    const finishedMatches = partidos
      .filter((p) => p.estado === 'finalizado')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, limit);

    return finishedMatches.map((p) => ({
      league: `Liga ${p.id_liga}`,
      home: `Equipo ${p.id_equipo_local}`,
      away: `Equipo ${p.id_equipo_visitante}`,
      homeScore: p.goles_local ?? 0,
      awayScore: p.goles_visitante ?? 0,
    }));
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener próximos partidos para el dashboard
 * GET /partidos/ (filtrado en cliente por estado programado)
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
    const partidos = await apiGet<PartidoApi[]>('/partidos/');
    const upcomingMatches = partidos
      .filter((p) => p.estado === 'programado')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, limit);

    return upcomingMatches.map((p) => {
      const date = new Date(p.fecha);
      return {
        league: `Liga ${p.id_liga}`,
        home: `Equipo ${p.id_equipo_local}`,
        away: `Equipo ${p.id_equipo_visitante}`,
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener estadísticas del dashboard admin
 *
 * NOTA: El backend NO tiene endpoint /dashboard/admin/stats.
 * Se calcula a partir de los endpoints existentes:
 * - GET /equipos/ para contar equipos
 * - GET /usuarios/ para contar usuarios
 * - GET /partidos/ para contar partidos programados
 * En modo mock se usan datos simulados.
 */
export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  if (isMockEnabled()) {
    return mockApi.mockGetAdminDashboardStats();
  }

  try {
    // Obtener datos de endpoints existentes en paralelo
    const [equipos, usuarios, partidos] = await Promise.all([
      apiGet<Array<unknown>>('/equipos/'),
      apiGet<Array<unknown>>('/usuarios/'),
      apiGet<PartidoApi[]>('/partidos/'),
    ]);

    return {
      equiposRegistrados: equipos.length,
      usuariosTotales: usuarios.length,
      partidosProgramados: partidos.filter((p) => p.estado === 'programado').length,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener estadísticas del dashboard entrenador
 *
 * NOTA: El backend NO tiene endpoint /dashboard/coach/stats.
 * Se calcula a partir de los endpoints existentes.
 * En modo mock se usan datos simulados.
 */
export async function fetchCoachDashboardStats(): Promise<CoachDashboardStats> {
  if (isMockEnabled()) {
    return mockApi.mockGetCoachDashboardStats();
  }

  try {
    // NOTA: Las estadísticas del entrenador requieren saber su equipo
    // y calcular desde los partidos y jugadores. Por ahora se devuelven
    // valores por defecto ya que no hay un endpoint directo.
    // Cuando el backend implemente un endpoint de stats, se actualizará aquí.
    return {
      jugadores: 0,
      partidosJugados: 0,
      victorias: 0,
      goles: 0,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}