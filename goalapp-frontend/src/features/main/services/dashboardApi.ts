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
  id_partido: number;
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
  id_partido: number;
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

/**
 * Respuesta del backend para un equipo.
 * Coincide con EquipoResponse del backend.
 */
interface EquipoApi {
  id_equipo: number;
  id_liga: number;
  nombre: string;
  escudo_url?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Respuesta del backend para una liga.
 * Coincide con LigaResponse del backend.
 */
interface LigaApi {
  id_liga: number;
  nombre: string;
  temporada: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener partidos en vivo para el dashboard
 * GET /partidos/?liga_id={leagueId} (filtrado en cliente por estado en_juego)
 *
 * @param leagueId - ID de la liga para filtrar los partidos
 */
export async function fetchLiveMatches(leagueId: number): Promise<DashboardLiveMatch[]> {
  if (isMockEnabled()) {
    const partidos = await mockApi.mockFetchLiveMatches();
    return partidos.map((p) => ({
      league: `Liga ${p.id_liga}`,
      home: p.nombre_equipo_local,
      away: p.nombre_equipo_visitante,
      homeScore: p.goles_local ?? 0,
      awayScore: p.goles_visitante ?? 0,
      minute: "En juego",
    }));
  }

  try {
    // Obtener partidos filtrados por liga y equipos de la liga en paralelo
    const [partidos, equipos, liga] = await Promise.all([
      apiGet<PartidoApi[]>('/partidos/', { liga_id: leagueId }),
      apiGet<EquipoApi[]>('/equipos/', { liga_id: leagueId }),
      apiGet<LigaApi>(`/ligas/${leagueId}`),
    ]);

    const liveMatches = partidos.filter((p) => p.estado === 'en_juego');

    // Crear mapa de equipos por ID para búsqueda rápida
    const equiposMap = new Map<number, string>();
    equipos.forEach((eq) => {
      equiposMap.set(eq.id_equipo, eq.nombre);
    });

    // Mapear a formato de dashboard con nombres reales
    return liveMatches.map((p) => ({
      id_partido: p.id_partido,
      league: liga.nombre,
      home: equiposMap.get(p.id_equipo_local) || `Equipo ${p.id_equipo_local}`,
      away: equiposMap.get(p.id_equipo_visitante) || `Equipo ${p.id_equipo_visitante}`,
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
 * GET /partidos/?liga_id={leagueId} (filtrado en cliente por estado finalizado)
 *
 * @param leagueId - ID de la liga para filtrar los partidos
 * @param limit - Número máximo de resultados a devolver
 */
export async function fetchRecentResults(leagueId: number, limit: number = 5): Promise<DashboardResult[]> {
  if (isMockEnabled()) {
    const partidos = await mockApi.mockFetchRecentMatches(limit);
    return partidos.map((p) => ({
      league: `Liga ${p.id_liga}`,
      home: p.nombre_equipo_local,
      away: p.nombre_equipo_visitante,
      homeScore: p.goles_local ?? 0,
      awayScore: p.goles_visitante ?? 0,
    }));
  }

  try {
    // Obtener partidos filtrados por liga y equipos de la liga en paralelo
    const [partidos, equipos, liga] = await Promise.all([
      apiGet<PartidoApi[]>('/partidos/', { liga_id: leagueId }),
      apiGet<EquipoApi[]>('/equipos/', { liga_id: leagueId }),
      apiGet<LigaApi>(`/ligas/${leagueId}`),
    ]);

    const finishedMatches = partidos
      .filter((p) => p.estado === 'finalizado')
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, limit);

    // Crear mapa de equipos por ID para búsqueda rápida
    const equiposMap = new Map<number, string>();
    equipos.forEach((eq) => {
      equiposMap.set(eq.id_equipo, eq.nombre);
    });

    return finishedMatches.map((p) => ({
      league: liga.nombre,
      home: equiposMap.get(p.id_equipo_local) || `Equipo ${p.id_equipo_local}`,
      away: equiposMap.get(p.id_equipo_visitante) || `Equipo ${p.id_equipo_visitante}`,
      homeScore: p.goles_local ?? 0,
      awayScore: p.goles_visitante ?? 0,
    }));
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener próximos partidos para el dashboard
 * GET /partidos/?liga_id={leagueId} (filtrado en cliente por estado programado)
 *
 * @param leagueId - ID de la liga para filtrar los partidos
 * @param limit - Número máximo de resultados a devolver
 */
export async function fetchUpcomingMatches(leagueId: number, limit: number = 5): Promise<DashboardUpcomingMatch[]> {
  if (isMockEnabled()) {
    const partidos = await mockApi.mockFetchUpcomingMatches(limit);
    return partidos.map((p) => {
      const date = new Date(p.fecha);
      return {
        league: `Liga ${p.id_liga}`,
        home: p.nombre_equipo_local,
        away: p.nombre_equipo_visitante,
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  }

  try {
    // Obtener partidos filtrados por liga y equipos de la liga en paralelo
    const [partidos, equipos, liga] = await Promise.all([
      apiGet<PartidoApi[]>('/partidos/', { liga_id: leagueId }),
      apiGet<EquipoApi[]>('/equipos/', { liga_id: leagueId }),
      apiGet<LigaApi>(`/ligas/${leagueId}`),
    ]);

    const upcomingMatches = partidos
      .filter((p) => p.estado === 'programado')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, limit);

    // Crear mapa de equipos por ID para búsqueda rápida
    const equiposMap = new Map<number, string>();
    equipos.forEach((eq) => {
      equiposMap.set(eq.id_equipo, eq.nombre);
    });

    return upcomingMatches.map((p) => {
      const date = new Date(p.fecha);
      return {
        id_partido: p.id_partido,
        league: liga.nombre,
        home: equiposMap.get(p.id_equipo_local) || `Equipo ${p.id_equipo_local}`,
        away: equiposMap.get(p.id_equipo_visitante) || `Equipo ${p.id_equipo_visitante}`,
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        time: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener estadísticas del dashboard admin para una liga específica
 *
 * NOTA: El backend NO tiene endpoint /dashboard/admin/stats.
 * Se calcula a partir de los endpoints existentes filtrados por liga:
 * - GET /equipos/?liga_id={leagueId} para contar equipos
 * - GET /partidos/?liga_id={leagueId} para contar partidos programados
 * - GET /usuarios/ligas/{liga_id}/usuarios para contar usuarios con rol en la liga
 * En modo mock se usan datos simulados.
 *
 * @param leagueId - ID de la liga para filtrar las estadísticas
 */
export async function fetchAdminDashboardStats(leagueId: number): Promise<AdminDashboardStats> {
  if (isMockEnabled()) {
    return mockApi.mockGetAdminDashboardStats();
  }

  try {
    // Obtener datos de endpoints existentes en paralelo, filtrados por liga
    const [equipos, partidos, usuariosEnLiga] = await Promise.all([
      apiGet<Array<unknown>>('/equipos/', { liga_id: leagueId }),
      apiGet<PartidoApi[]>('/partidos/', { liga_id: leagueId }),
      apiGet<Array<unknown>>(`/usuarios/ligas/${leagueId}/usuarios`),
    ]);

    return {
      equiposRegistrados: equipos.length,
      usuariosTotales: usuariosEnLiga.length,
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

/**
 * Obtener clasificación de una liga (top 10 equipos)
 * NOTA: El backend no tiene un endpoint directo para clasificación.
 * En modo mock se devuelve una clasificación simulada.
 *
 * @param leagueId - ID de la liga para obtener la clasificación
 * @returns Lista de equipos ordenados por posición
 */
export async function fetchLeagueStandings(leagueId: number): Promise<Array<{ posicion: number; equipo: string; pj: number; pts: number }>> {
  if (isMockEnabled()) {
    const equipos = await mockApi.mockFetchTeamsByLeague(leagueId);
    const partidos = await mockApi.mockFetchMatchesByLeague(leagueId);
    return calcularClasificacionMock(equipos, partidos);
  }
  return [];
}

function calcularClasificacionMock(
  equipos: any[],
  partidos: any[]
): Array<{ posicion: number; equipo: string; pj: number; pts: number }> {
  const estadisticasEquipo = new Map<string, { pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; pts: number }>();

  equipos.forEach((equipo) => {
    estadisticasEquipo.set(equipo.nombre, { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 });
  });

  partidos.forEach((partido) => {
    if (partido.estado !== 'finalizado' && partido.estado !== 'Finalizado') return;
    if (partido.goles_local === null || partido.goles_visitante === null) return;

    const equipoLocal = equipos.find((e) => e.id_equipo === partido.id_equipo_local);
    const equipoVisitante = equipos.find((e) => e.id_equipo === partido.id_equipo_visitante);
    
    if (!equipoLocal || !equipoVisitante) return;

    const estLocal = estadisticasEquipo.get(equipoLocal.nombre) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    const estVisitante = estadisticasEquipo.get(equipoVisitante.nombre) || { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };

    estLocal.pj += 1;
    estVisitante.pj += 1;
    estLocal.gf += partido.goles_local;
    estLocal.gc += partido.goles_visitante;
    estVisitante.gf += partido.goles_visitante;
    estVisitante.gc += partido.goles_local;

    if (partido.goles_local > partido.goles_visitante) {
      estLocal.pg += 1;
      estLocal.pts += 3;
      estVisitante.pp += 1;
    } else if (partido.goles_local < partido.goles_visitante) {
      estVisitante.pg += 1;
      estVisitante.pts += 3;
      estLocal.pp += 1;
    } else {
      estLocal.pe += 1;
      estVisitante.pe += 1;
      estLocal.pts += 1;
      estVisitante.pts += 1;
    }

    estadisticasEquipo.set(equipoLocal.nombre, estLocal);
    estadisticasEquipo.set(equipoVisitante.nombre, estVisitante);
  });

  const clasificacion = Array.from(estadisticasEquipo.entries())
    .map(([equipo, stats]) => ({
      equipo,
      pj: stats.pj,
      pts: stats.pts,
    }))
    .sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc));

  return clasificacion.map((fila, index) => ({
    posicion: index + 1,
    equipo: fila.equipo,
    pj: fila.pj,
    pts: fila.pts,
  })).slice(0, 10);
}