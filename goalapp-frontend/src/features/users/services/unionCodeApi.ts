/**
 * Servicio de API para códigos de unión a ligas
 * Maneja la generación y validación de códigos de invitación
 */

import { apiPost, apiDelete, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';

export interface UnionCodeResponse {
  codigo: string;
  rol: string;
  liga: string;
  expiracion: string;
  id_equipo?: number;
  dorsal?: number;
  posicion?: string;
}

export interface GenerateCodePayload {
  id_rol: number;
  nombre?: string;
  id_equipo?: number;
  dorsal?: string;  // El backend espera string (VARCHAR(10))
  posicion?: string;
}

/**
 * Generar código de unión para una liga
 * POST /invitaciones/ligas/{ligaId}/generar-codigo
 */
export async function generateUnionCode(
  ligaId: number,
  payload: GenerateCodePayload
): Promise<UnionCodeResponse> {
  try {
    return await apiPost<UnionCodeResponse>(
      `/invitaciones/ligas/${ligaId}/generar-codigo`,
      payload
    );
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Eliminar un código de invitación
 * DELETE /invitaciones/ligas/{ligaId}/codigos/{codigo}
 */
export async function deleteUnionCode(
  ligaId: number,
  codigo: string
): Promise<{ mensaje: string; codigo: string }> {
  try {
    return await apiDelete<{ mensaje: string; codigo: string }>(
      `/invitaciones/ligas/${ligaId}/codigos/${codigo}`
    );
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}
