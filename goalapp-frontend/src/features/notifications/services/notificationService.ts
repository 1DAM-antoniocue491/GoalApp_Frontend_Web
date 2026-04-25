/**
 * Servicio de API para notificaciones
 * Maneja las llamadas relacionadas con notificaciones del usuario
 */

import { apiGet, apiPut, apiDelete, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import type { Notification } from './types';

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtener todas las notificaciones del usuario autenticado
 * GET /notificaciones/
 * @returns Promesa con la lista de notificaciones
 * @throws ApiError si hay error de autenticación o de red
 */
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const notifications = await apiGet<Notification[]>('/notificaciones/');
    return notifications;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Obtener solo las notificaciones no leídas
 * GET /notificaciones/no-leidas
 * @returns Promesa con la lista de notificaciones no leídas
 */
export async function fetchUnreadNotifications(): Promise<Notification[]> {
  try {
    const notifications = await apiGet<Notification[]>('/notificaciones/no-leidas');
    return notifications;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Marcar una notificación como leída
 * PATCH /notificaciones/{id}/leer
 * @param notificationId - ID de la notificación a marcar como leída
 * @returns Promesa que resuelve cuando la operación se completa
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  try {
    await apiPut(`/notificaciones/${notificationId}`, { leido: true });
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Marcar todas las notificaciones como leídas
 * PATCH /notificaciones/mark-all-read
 * @returns Promesa que resuelve cuando la operación se completa
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    await apiPut('/notificaciones/mark-all-read', {});
  } catch (error) {
    console.warn('Error al marcar todas como leídas:', error);
  }
}

/**
 * Eliminar una notificación
 * DELETE /notificaciones/{id}
 * @param notificationId - ID de la notificación a eliminar
 */
export async function deleteNotification(notificationId: number): Promise<void> {
  try {
    await apiDelete(`/notificaciones/${notificationId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// ============================================
// FUNCIONES PRINCIPALES (fachada pública)
// ============================================

/**
 * Cargar todas las notificaciones del usuario
 */
export async function loadNotifications(): Promise<Notification[]> {
  return fetchNotifications();
}

/**
 * Cargar solo las notificaciones no leídas
 */
export async function loadUnreadNotifications(): Promise<Notification[]> {
  return fetchUnreadNotifications();
}

/**
 * Marcar una notificación como leída
 */
export async function markAsRead(notificationId: number): Promise<void> {
  return markNotificationAsRead(notificationId);
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllAsRead(): Promise<void> {
  return markAllNotificationsAsRead();
}

/**
 * Eliminar una notificación
 */
export async function removeNotification(notificationId: number): Promise<void> {
  return deleteNotification(notificationId);
}
