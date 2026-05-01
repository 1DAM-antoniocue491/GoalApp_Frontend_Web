/**
 * Servicio de API para la gestión de convocatorias de partidos
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiGet, apiPost, apiDelete } from '../../../services/api';
import type {
  ConvocatoriaResponse,
  ConvocatoriaCreatePayload,
  Jugador,
} from '../types/convocatoria';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

/**
 * Obtiene la convocatoria de un equipo para un partido específico
 */
export async function fetchConvocatoria(
  partidoId: number,
  equipoId: number
): Promise<ConvocatoriaResponse> {
  if (isMockEnabled()) {
    return await mockApi.mockFetchConvocatoria(partidoId, equipoId);
  }

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
  if (isMockEnabled()) {
    return await mockApi.mockFetchJugadoresPorEquipo(equipoId);
  }

  return await apiGet<Jugador[]>(`/jugadores/?equipo_id=${equipoId}`);
}

/**
 * Crea o actualiza una convocatoria
 * Reemplaza cualquier convocatoria existente del partido
 */
export async function createConvocatoria(
  payload: ConvocatoriaCreatePayload
): Promise<void> {
  if (isMockEnabled()) {
    await mockApi.mockCreateConvocatoria(payload);
    return;
  }

  await apiPost<void>('/convocatorias/', payload);
}

/**
 * Elimina la convocatoria de un partido
 */
export async function deleteConvocatoria(partidoId: number): Promise<void> {
  if (isMockEnabled()) {
    await mockApi.mockDeleteConvocatoria(partidoId);
    return;
  }

  await apiDelete<void>(`/convocatorias/partido/${partidoId}`);
}
