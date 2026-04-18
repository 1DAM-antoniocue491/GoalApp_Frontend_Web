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