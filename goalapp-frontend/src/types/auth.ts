/**
 * Interfaces de autenticación para GoalApp
 * Manejo de login, registro, tokens y recuperación de contraseña
 */

import { GeneroEnum } from './enums'

/**
 * Datos requeridos para iniciar sesión
 */
export interface LoginRequest {
  /** Email del usuario */
  email: string
  /** Contraseña del usuario */
  password: string
  /** Recordar sesión (opcional) */
  rememberMe?: boolean
}

/**
 * Respuesta exitosa de login
 */
export interface LoginResponse {
  /** Token JWT de acceso */
  accessToken: string
  /** Token de refresco para renovar sesión */
  refreshToken?: string
  /** Tiempo de expiración del token en segundos */
  expiresIn: number
  /** Tipo de token (normalmente 'Bearer') */
  tokenType: string
  /** Datos del usuario autenticado */
  user: AuthUser
}

/**
 * Datos requeridos para registrar un nuevo usuario
 */
export interface RegisterRequest {
  /** Nombre completo del usuario */
  nombre: string
  /** Email del usuario */
  email: string
  /** Contraseña del usuario */
  password: string
  /** Confirmación de contraseña */
  confirmPassword: string
  /** Género del usuario */
  genero?: GeneroEnum
  /** Teléfono de contacto */
  telefono?: string
  /** Fecha de nacimiento (formato ISO) */
  fecha_nacimiento?: string
  /** URL de imagen de perfil */
  imagen_url?: string
  /** Aceptar términos y condiciones */
  acceptTerms: boolean
}

/**
 * Respuesta del registro de usuario
 */
export interface RegisterResponse {
  /** Indica si el registro fue exitoso */
  success: boolean
  /** Mensaje descriptivo */
  message: string
  /** Datos del usuario registrado (si aplica) */
  user?: AuthUser
  /** Indica si se requiere confirmación por email */
  requiresEmailConfirmation?: boolean
}

/**
 * Solicitud de restablecimiento de contraseña
 */
export interface PasswordResetRequest {
  /** Email del usuario que solicita el reset */
  email: string
}

/**
 * Respuesta a la solicitud de restablecimiento
 */
export interface PasswordResetResponse {
  /** Indica si la solicitud fue exitosa */
  success: boolean
  /** Mensaje descriptivo (sin revelar si el email existe) */
  message: string
  /** Tiempo de expiración del token (minutos) */
  expires_in_minutes?: number
}

/**
 * Datos para confirmar el restablecimiento de contraseña
 */
export interface PasswordResetConfirmRequest {
  /** Token de reset recibido por email */
  token: string
  /** Nueva contraseña */
  new_password: string
  /** Confirmación de nueva contraseña */
  confirm_password: string
}

/**
 * Datos del usuario autenticado en sesión
 */
export interface AuthUser {
  /** ID único del usuario */
  id_usuario: number
  /** Nombre completo */
  nombre: string
  /** Email */
  email: string
  /** URL de imagen de perfil */
  imagen_url?: string
  /** Género */
  genero?: GeneroEnum
  /** Teléfono */
  telefono?: string
  /** Indica si el email está verificado */
  email_verified: boolean
  /** Roles asignados al usuario */
  roles: UserRole[]
  /** Permisos del usuario */
  permissions?: string[]
}

/**
 * Rol del usuario con información adicional
 */
export interface UserRole {
  /** ID del rol */
  id_rol: number
  /** Nombre del rol */
  nombre: string
  /** Descripción del rol */
  descripcion?: string
}

/**
 * Estado de autenticación en el frontend
 */
export interface AuthState {
  /** Usuario actualmente autenticado */
  user: AuthUser | null
  /** Token de acceso actual */
  accessToken: string | null
  /** Token de refresco */
  refreshToken: string | null
  /** Indica si está autenticado */
  isAuthenticated: boolean
  /** Indica si está cargando */
  isLoading: boolean
  /** Error de autenticación si existe */
  error: string | null
}

/**
 * Datos para actualizar contraseña (usuario autenticado)
 */
export interface ChangePasswordRequest {
  /** Contraseña actual */
  currentPassword: string
  /** Nueva contraseña */
  newPassword: string
  /** Confirmación de nueva contraseña */
  confirmNewPassword: string
}

/**
 * Datos para refrescar el token de acceso
 */
export interface RefreshTokenRequest {
  /** Token de refresco */
  refreshToken: string
}

/**
 * Respuesta del refresco de token
 */
export interface RefreshTokenResponse {
  /** Nuevo token de acceso */
  accessToken: string
  /** Nuevo token de refresco */
  refreshToken?: string
  /** Tiempo de expiración en segundos */
  expiresIn: number
}

/**
 * Datos para verificar email
 */
export interface VerifyEmailRequest {
  /** Token de verificación */
  token: string
}

/**
 * Respuesta de verificación de email
 */
export interface VerifyEmailResponse {
  success: boolean
  message: string
}

/**
 * Sesión de usuario para persistencia local
 */
export interface UserSession {
  accessToken: string
  refreshToken?: string
  user: AuthUser
  expiresAt: number
}