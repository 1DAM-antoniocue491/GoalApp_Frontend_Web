/**
 * Servicio de autenticación para GoalApp
 * Maneja todas las operaciones relacionadas con autenticación usando el cliente HTTP centralizado
 */

import {
  apiPost,
  apiGet,
  apiLogin,
  getErrorMessage,
} from '../../../services/api';
import {
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_ENDPOINTS,
} from '../../../services/api/config';
import type { ApiError } from '../../../services/api';

// ============================================
// TIPOS
// ============================================

/**
 * Respuesta del endpoint de login
 * El backend usa OAuth2PasswordRequestForm que devuelve access_token
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * Datos del usuario autenticado
 */
export interface User {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  rol_principal?: string;
  imagen_url?: string;
  activo?: boolean;
  roles?: UserRole[];
}

/**
 * Rol del usuario
 */
export interface UserRole {
  id_rol: number;
  nombre: string;
  descripcion?: string;
}

/**
 * Solicitud de recuperación de contraseña
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Respuesta de recuperación de contraseña
 */
export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

/**
 * Datos para restablecer contraseña
 */
export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

/**
 * Iniciar sesión con email y contraseña
 * @param email - Email del usuario (se envía como username para OAuth2)
 * @param password - Contraseña del usuario
 * @returns Promesa con la respuesta del login (access_token)
 * @throws ApiError si las credenciales son inválidas o hay error de red
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    // El backend espera form-data con 'username' y 'password' (OAuth2PasswordRequestForm)
    const response = await apiLogin<LoginResponse>(AUTH_ENDPOINTS.LOGIN, email, password);

    // Guardar tokens en localStorage
    if (response.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, response.refresh_token);
    }

    return response;
  } catch (error) {
    // Transformar el error en un mensaje amigable
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Obtener información del usuario autenticado
 * @returns Promesa con los datos del usuario
 * @throws ApiError si el token es inválido o expiró
 */
export async function getCurrentUser(): Promise<User> {
  try {
    const user = await apiGet<User>(AUTH_ENDPOINTS.ME);

    // Guardar usuario en localStorage para acceso rápido
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

    return user;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Cerrar sesión del usuario
 * - Limpia tokens del localStorage
 * - Limpia datos del usuario
 * - Opcionalmente llama al endpoint de logout en el backend
 */
export async function logout(): Promise<void> {
  try {
    // Intentar notificar al backend (opcional)
    await apiPost(AUTH_ENDPOINTS.LOGOUT).catch(() => {
      // Ignorar errores del logout en el servidor
    });
  } finally {
    // Siempre limpiar el almacenamiento local
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }
}

/**
 * Solicitar recuperación de contraseña
 * @param email - Email del usuario
 * @returns Promesa con la respuesta
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  try {
    const response = await apiPost<ForgotPasswordResponse>(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
      email,
    });
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Restablecer contraseña con token
 * @param data - Token y nueva contraseña
 * @returns Promesa con la respuesta
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  try {
    const response = await apiPost<{ message: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
    return response;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Refrescar el token de acceso usando el refresh token
 * @returns Promesa con el nuevo access token
 */
export async function refreshToken(): Promise<LoginResponse> {
  const storedRefreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

  if (!storedRefreshToken) {
    throw new Error('No hay refresh token disponible');
  }

  try {
    const response = await apiPost<LoginResponse>(AUTH_ENDPOINTS.REFRESH, {
      refresh_token: storedRefreshToken,
    });

    // Actualizar tokens
    if (response.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, response.refresh_token);
    }

    return response;
  } catch (error) {
    // Si falla el refresh, limpiar todo
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    throw new Error(getErrorMessage(error));
  }
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Guardar token manualmente (para casos especiales)
 * @param token - Token JWT
 */
export function saveToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Guardar refresh token manualmente
 * @param refreshToken - Refresh token
 */
export function saveRefreshToken(refreshToken: string): void {
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Obtener token del localStorage
 * @returns Token JWT o null si no existe
 */
export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Obtener refresh token del localStorage
 * @returns Refresh token o null si no existe
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);
}

/**
 * Obtener usuario del localStorage
 * @returns Datos del usuario o null si no existe
 */
export function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Verificar si hay un token guardado
 * @returns true si hay token, false si no
 */
export function hasToken(): boolean {
  return !!getToken();
}

/**
 * Verificar si el usuario está autenticado
 * @returns true si hay token y usuario, false si no
 */
export function isAuthenticated(): boolean {
  return hasToken();
}

/**
 * Limpiar todos los datos de autenticación
 */
export function clearAuthData(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/**
 * Verificar si el token está próximo a expirar
 * Nota: Esto es una verificación básica, el backend valida la expiración real
 * @param thresholdMs - Umbral en milisegundos antes de considerar expirado
 * @returns true si está próximo a expirar, false si no
 */
export function isTokenExpiringSoon(thresholdMs: number = 5 * 60 * 1000): boolean {
  const token = getToken();
  if (!token) return true;

  try {
    // Decodificar el JWT para obtener la fecha de expiración
    // Nota: Esto es solo para UX, la validación real la hace el backend
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = Date.now();
      return expirationTime - currentTime < thresholdMs;
    }
  } catch {
    // Si no podemos decodificar el token, asumimos que está expirado
    return true;
  }

  return false;
}

// Re-exportar tipos útiles
export type { ApiError };