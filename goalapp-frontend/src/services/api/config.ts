/**
 * Configuración del API de GoalApp
 * Centraliza todas las URLs y configuraciones del backend
 */

// URL base del API - cambiar según el ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://goalapp-backend-j2cx.onrender.com/api/v1';

// Tiempos de espera
export const API_TIMEOUT = 60000; // 60 segundos (para cold start de Render)
export const API_RETRY_COUNT = 2; // Reintentos automáticos
export const API_RETRY_DELAY = 2000; // 2 segundos entre reintentos
export const AUTH_TOKEN_KEY = 'goalapp_token';
export const AUTH_REFRESH_TOKEN_KEY = 'goalapp_refresh_token';
export const AUTH_USER_KEY = 'goalapp_user';

// Endpoints de autenticación
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

// Endpoints públicos
export const PUBLIC_ENDPOINTS = {
  PUBLIC_LEAGUES: '/public/leagues',
  PUBLIC_TEAMS: '/public/teams',
  PUBLIC_MATCHES: '/public/matches',
} as const;

// Configuración de reintentos
export const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
} as const;

export { API_BASE_URL };