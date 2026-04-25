import { apiClient } from '../../../services/api';

export interface UsuarioLiga {
  id_usuario_rol: number;
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_rol: number;
  nombre_rol: string;
  activo: boolean;
}

export interface RolUpdatePayload {
  id_rol: number;
}

export interface EstadoUpdatePayload {
  activo: boolean;
}

/**
 * Obtener todos los usuarios de una liga
 */
export const fetchUsuariosLiga = async (ligaId: number): Promise<UsuarioLiga[]> => {
  return apiClient.get<UsuarioLiga[]>(`/ligas/${ligaId}/usuarios`);
};

/**
 * Actualizar el rol de un usuario en una liga
 */
export const updateUsuarioRol = async (
  ligaId: number,
  usuarioId: number,
  payload: RolUpdatePayload
): Promise<UsuarioLiga> => {
  return apiClient.put<UsuarioLiga>(`/ligas/${ligaId}/usuarios/${usuarioId}/rol`, payload);
};

/**
 * Actualizar el estado (activo/pendiente) de un usuario
 */
export const updateUsuarioEstado = async (
  ligaId: number,
  usuarioId: number,
  payload: EstadoUpdatePayload
): Promise<UsuarioLiga> => {
  return apiClient.put<UsuarioLiga>(`/ligas/${ligaId}/usuarios/${usuarioId}/estado`, payload);
};

/**
 * Eliminar un usuario de una liga
 */
export const deleteUsuarioLiga = async (
  ligaId: number,
  usuarioId: number
): Promise<{ mensaje: string }> => {
  return apiClient.delete<{ mensaje: string }>(`/ligas/${ligaId}/usuarios/${usuarioId}`);
};
