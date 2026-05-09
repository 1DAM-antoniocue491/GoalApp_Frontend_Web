/**
 * Servicio de API para notificaciones
 * Maneja las llamadas relacionadas con notificaciones del usuario
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import { apiGet, apiPut, getErrorMessage } from '../../../services/api';
import type { ApiError } from '../../../services/api';
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';
import type { Notification } from '../types';

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
  if (isMockEnabled()) {
    return mockApi.mockFetchNotifications() as Promise<Notification[]>;
  }

  try {
    const notifications = await apiGet<Notification[]>('/notificaciones/');
    return notifications;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Marcar una notificación como leída
 * PUT /notificaciones/{id}
 * @param notificationId - ID de la notificación a marcar como leída
 * @returns Promesa que resuelve cuando la operación se completa
 * @throws ApiError si hay error de autenticación o de red
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  if (isMockEnabled()) {
    await mockApi.mockMarkNotificationAsRead(notificationId);
    return;
  }

  try {
    await apiPut(`/notificaciones/${notificationId}`, { leido: true });
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

/**
 * Marcar todas las notificaciones como leídas
 * PUT /notificaciones/mark-all-read
 * @returns Promesa que resuelve cuando la operación se completa
 * @throws ApiError si hay error de autenticación o de red
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  if (isMockEnabled()) {
    await mockApi.mockMarkAllNotificationsAsRead();
    return;
  }

  try {
    // Nota: El backend puede no tener este endpoint aún
    // Se implementará cuando esté disponible
    await apiPut('/notificaciones/mark-all-read', {});
  } catch (error) {
    // Si el endpoint no existe, ignorar el error
    console.warn('Endpoint mark-all-read no disponible:', error);
  }
}

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Cargar las notificaciones del usuario
 * @returns Promesa con la lista de notificaciones
 */
export async function loadNotifications(): Promise<Notification[]> {
  return fetchNotifications();
}

/**
 * Marcar una notificación como leída
 * @param notificationId - ID de la notificación
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
