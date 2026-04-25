import { apiClient, apiGet, apiPut, apiDelete } from '../../../services/api';

export interface MiembroEquipo {
  id_miembro: number;
  id_usuario: number;
  tipo: 'jugador' | 'delegado';
  nombre: string;
  email: string;
  activo: boolean;
  posicion?: string;
  dorsal?: number;
}

export interface DelegadoResponse {
  id_usuario: number;
  nombre: string;
  email: string;
}

export interface MiembroEstadoResponse {
  id_usuario: number;
  nombre: string;
  activo: boolean;
}

/**
 * Obtener todos los miembros del equipo (solo entrenador)
 */
export const fetchMiembrosEquipo = async (equipoId: number): Promise<MiembroEquipo[]> => {
  return apiGet<MiembroEquipo[]>(`/equipos/${equipoId}/miembros`);
};

/**
 * Asignar delegado al equipo
 */
export const asignarDelegado = async (
  equipoId: number,
  idUsuario: number
): Promise<DelegadoResponse> => {
  return apiPut<DelegadoResponse>(`/equipos/${equipoId}/delegado`, { id_usuario: idUsuario });
};

/**
 * Actualizar estado de un miembro (activo/inactivo)
 */
export const updateMiembroEstado = async (
  equipoId: number,
  usuarioId: number,
  activo: boolean
): Promise<MiembroEstadoResponse> => {
  return apiPut<MiembroEstadoResponse>(`/equipos/${equipoId}/miembros/${usuarioId}/estado`, { activo });
};

/**
 * Eliminar un miembro del equipo
 */
export const deleteMiembroEquipo = async (
  equipoId: number,
  usuarioId: number
): Promise<{ mensaje: string }> => {
  return apiDelete<{ mensaje: string }>(`/equipos/${equipoId}/miembros/${usuarioId}`);
};
