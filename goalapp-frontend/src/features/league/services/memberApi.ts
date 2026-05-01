import { apiClient } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

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
  if (isMockEnabled()) {
    return await mockApi.mockFetchUsuariosLiga(ligaId);
  }
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
  if (isMockEnabled()) {
    return await mockApi.mockUpdateUsuarioRol(ligaId, usuarioId, payload);
  }
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
  if (isMockEnabled()) {
    return await mockApi.mockUpdateUsuarioEstado(ligaId, usuarioId, payload);
  }
  return apiClient.put<UsuarioLiga>(`/ligas/${ligaId}/usuarios/${usuarioId}/estado`, payload);
};

/**
 * Eliminar un usuario de una liga
 */
export const deleteUsuarioLiga = async (
  ligaId: number,
  usuarioId: number
): Promise<{ mensaje: string }> => {
  if (isMockEnabled()) {
    return await mockApi.mockDeleteUsuarioLiga(ligaId, usuarioId);
  }
  return apiClient.delete<{ mensaje: string }>(`/ligas/${ligaId}/usuarios/${usuarioId}`);
};
