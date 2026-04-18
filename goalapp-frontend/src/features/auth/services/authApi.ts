/**
 * Servicio de autenticación para GoalApp
 * Maneja todas las operaciones relacionadas con autenticación usando el cliente HTTP centralizado
 * Soporta modo mock cuando VITE_USE_MOCKS=true
 */

import {
  apiPost,
  apiGet,
  apiPut,
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
import { isMockEnabled } from '../../../mocks/env';
import * as mockApi from '../../../mocks/api';

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
 * Coincide con UsuarioResponse del backend (app/schemas/usuario.py)
 */
export interface User {
  id_usuario: number;
  nombre: string;
  email: string;
  genero?: string | null;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  imagen_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // Campos computados que no vienen del backend directamente
  // pero se usan en el frontend. Se llenan desde otros endpoints
  // como /usuarios/me/ligas
  rol_principal?: string;
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
 * Coincide con PasswordResetResponse del backend
 */
export interface ForgotPasswordResponse {
  mensaje: string;
  success: boolean;
}

/**
 * Datos para restablecer contraseña
 * Coincide con PasswordResetConfirm del backend
 */
export interface ResetPasswordRequest {
  token: string;
  nueva_contrasena: string;
}

/**
 * Respuesta del registro
 * El backend POST /usuarios/ devuelve UsuarioResponse directamente.
 * Para el frontend, envolvemos en un objeto con success/message
 * para mantener consistencia con la lógica de registro.
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: User;
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
  // Modo mock: simular login exitoso
  if (isMockEnabled()) {
    const response = await mockApi.mockLogin(email, password);

    // NO guardar tokens aquí — se guardan en useAuth después de que getCurrentUser tenga éxito

    return response;
  }

  try {
    // El backend espera form-data con 'username' y 'password' (OAuth2PasswordRequestForm)
    const response = await apiLogin<LoginResponse>(AUTH_ENDPOINTS.LOGIN, email, password);

    // NO guardar tokens aquí — se guardan después de que getCurrentUser() tenga éxito
    // en el hook useAuth, para evitar tokens huérfanos si /me falla

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
  // Modo mock: devolver usuario mock
  if (isMockEnabled()) {
    const user = await mockApi.mockGetCurrentUser();
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user as unknown as User;
  }

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
  // Modo mock: solo limpiar localStorage
  if (isMockEnabled()) {
    await mockApi.mockLogout();
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

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
  // Modo mock: simular respuesta exitosa
  if (isMockEnabled()) {
    const response = await mockApi.mockForgotPassword(email);
    return response as ForgotPasswordResponse;
  }

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
 * Registrar un nuevo usuario
 * @param nombre - Nombre del usuario
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @returns Promesa con la respuesta del registro
 */
export async function register(nombre: string, email: string, password: string): Promise<RegisterResponse> {
  // Modo mock: simular registro exitoso
  if (isMockEnabled()) {
    const response = await mockApi.mockRegister(nombre, email, password);
    if (response.success && response.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    }
    return response as RegisterResponse;
  }

  try {
    // El backend POST /usuarios/ devuelve UsuarioResponse directamente
    const userResponse = await apiPost<User>(AUTH_ENDPOINTS.REGISTER, {
      nombre,
      email,
      password,
    });

    return {
      success: true,
      message: 'Registro exitoso.',
      user: userResponse,
    };
  } catch (error) {
    // Transformar error del backend en formato esperado
    const errorMsg = getErrorMessage(error as ApiError);
    return {
      success: false,
      message: errorMsg,
    };
  }
}

/**
 * Restablecer contraseña con token
 * @param data - Token y nueva contraseña
 * @returns Promesa con la respuesta
 */
export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
  // Modo mock: simular respuesta exitosa
  if (isMockEnabled()) {
    const response = await mockApi.mockResetPassword(data.token, data.nueva_contrasena);
    return response;
  }

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
  // Modo mock: simular refresh exitoso
  if (isMockEnabled()) {
    const response = await mockApi.mockRefreshToken();
    if (response.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, response.refresh_token);
    }
    return response;
  }

  const storedRefreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

  if (!storedRefreshToken) {
    throw new Error('No hay refresh token disponible');
  }

  try {
    const response = await apiPost<LoginResponse>(AUTH_ENDPOINTS.REFRESH, {
      token: storedRefreshToken,
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

// ============================================
// ACTUALIZACIÓN DE PERFIL
// ============================================

/**
 * Datos para actualizar el perfil del usuario
 * Coincide con UsuarioUpdate del backend
 */
export interface UpdateProfileRequest {
  nombre?: string;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  imagen_url?: string | null;
}

/**
 * Actualizar el perfil del usuario autenticado
 * PUT /usuarios/{usuario_id}
 *
 * @param userId - ID del usuario a actualizar
 * @param data - Campos a actualizar
 * @returns Promesa con los datos del usuario actualizado
 * @throws Error si la actualización falla
 */
export async function updateProfile(userId: number, data: UpdateProfileRequest): Promise<User> {
  // Modo mock: simular actualización exitosa
  if (isMockEnabled()) {
    const mockUser = await mockApi.mockGetCurrentUser();
    const updatedUser = {
      ...mockUser,
      ...(data.nombre !== undefined && { nombre: data.nombre }),
      ...(data.telefono !== undefined && { telefono: data.telefono }),
      ...(data.fecha_nacimiento !== undefined && { fecha_nacimiento: data.fecha_nacimiento }),
    } as unknown as User;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }

  try {
    const updatedUser = await apiPut<User>(`/usuarios/${userId}`, data);
    // Actualizar usuario en localStorage
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    throw new Error(getErrorMessage(error as ApiError));
  }
}

// Re-exportar tipos útiles
export type { ApiError };