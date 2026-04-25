/**
 * Servicio de API para la gestión de convocatorias de partidos
 */

import { apiGet, apiPost, apiDelete } from '../../../services/api';
import type {
  ConvocatoriaResponse,
  ConvocatoriaCreatePayload,
  Jugador,
} from '../types/convocatoria';

/**
 * Obtiene la convocatoria de un equipo para un partido específico
 */
export async function fetchConvocatoria(
  partidoId: number,
  equipoId: number
): Promise<ConvocatoriaResponse> {
  return await apiGet<ConvocatoriaResponse>(
    `/convocatorias/partido/${partidoId}/equipo/${equipoId}`
  );
}

/**
 * Obtiene todos los jugadores de un equipo
 */
export async function fetchJugadoresPorEquipo(
  equipoId: number
): Promise<Jugador[]> {
  return await apiGet<Jugador[]>(`/jugadores/?equipo_id=${equipoId}`);
}

/**
 * Crea o actualiza una convocatoria
 * Reemplaza cualquier convocatoria existente del partido
 */
export async function createConvocatoria(
  payload: ConvocatoriaCreatePayload
): Promise<void> {
  await apiPost<void>('/convocatorias/', payload);
}

/**
 * Elimina la convocatoria de un partido
 */
export async function deleteConvocatoria(partidoId: number): Promise<void> {
  await apiDelete<void>(`/convocatorias/partido/${partidoId}`);
}
