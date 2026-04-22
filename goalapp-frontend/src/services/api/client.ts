/**
 * Cliente HTTP centralizado para GoalApp
 * Configuración de Axios con interceptors para autenticación y manejo de errores
 */

import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import {
  API_BASE_URL,
  API_TIMEOUT,
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  API_RETRY_COUNT,
  API_RETRY_DELAY,
} from './config';

// Tipos para el manejo de errores
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
  isNetworkError: boolean;
  isAuthError: boolean;
}

// Tipo para la respuesta de refresh token
interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
}

// Cola de peticiones pendientes durante refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Procesa la cola de peticiones pendientes
 */
const processQueue = (error: Error | null, token: string | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Crea y configura una instancia de Axios
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // ============================================
  // INTERCEPTOR DE REQUEST - Añadir token JWT
  // ============================================
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // ============================================
  // INTERCEPTOR DE RESPONSE - Manejo de errores y refresh token
  // ============================================
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Error de red (sin respuesta del servidor)
      if (!error.response) {
        // Intentar reintento si no se ha excedido el límite
        if (!originalRequest._retry && API_RETRY_COUNT > 0) {
          originalRequest._retry = true;

          // Esperar antes de reintentar
          await new Promise(resolve => setTimeout(resolve, API_RETRY_DELAY));

          // Reintentar la petición
          try {
            return await client(originalRequest);
          } catch {
            // Si el reintento también falla, continuar con el error
          }
        }

        const networkError: ApiError = {
          message: 'El servidor está iniciando. Por favor, espera un momento e intenta de nuevo.',
          statusCode: 0,
          isNetworkError: true,
          isAuthError: false,
        };
        return Promise.reject(networkError);
      }

      const statusCode = error.response.status;

      // Error 401 - Token expirado o inválido
      // No interceptar 401 en endpoints de autenticación (login, registro, etc.)
      // ya que son errores esperados de credenciales incorrectas, no de sesión expirada
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/forgot-password') ||
        originalRequest.url?.includes('/auth/reset-password');

      if (statusCode === 401 && !originalRequest._retry && !isAuthEndpoint) {
        // Si ya estamos refrescando, encolar la petición
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

        // Si no hay refresh token, cerrar sesión
        if (!refreshToken) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
          localStorage.removeItem('goalapp_user');
          window.location.href = '/login';

          const authError: ApiError = {
            message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
            statusCode: 401,
            isNetworkError: false,
            isAuthError: true,
          };
          return Promise.reject(authError);
        }

        try {
          // Intentar refrescar el token
          const response = await axios.post<RefreshTokenResponse>(
            `${API_BASE_URL}/auth/refresh`,
            { token: refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const newToken = response.data.access_token;
          localStorage.setItem(AUTH_TOKEN_KEY, newToken);

          if (response.data.refresh_token) {
            localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, response.data.refresh_token);
          }

          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          return client(originalRequest);
        } catch (refreshError) {
          processQueue(new Error('Error al refrescar token'), null);

          // Limpiar tokens y redirigir a login
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
          localStorage.removeItem('goalapp_user');
          window.location.href = '/login';

          const authError: ApiError = {
            message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
            statusCode: 401,
            isNetworkError: false,
            isAuthError: true,
          };
          return Promise.reject(authError);
        } finally {
          isRefreshing = false;
        }
      }

      // Error 403 - Sin permisos
      if (statusCode === 403) {
        const forbiddenError: ApiError = {
          message: 'No tienes permisos para realizar esta acción.',
          statusCode: 403,
          isNetworkError: false,
          isAuthError: true,
        };
        return Promise.reject(forbiddenError);
      }

      // Error 422 - Error de validación
      if (statusCode === 422) {
        const data = error.response.data as { detail?: string | Array<{ msg: string }> };
        let message = 'Error de validación';

        if (typeof data?.detail === 'string') {
          message = data.detail;
        } else if (Array.isArray(data?.detail)) {
          message = data.detail.map((e) => e.msg).join(', ');
        }

        const validationError: ApiError = {
          message,
          statusCode: 422,
          details: data as Record<string, unknown>,
          isNetworkError: false,
          isAuthError: false,
        };
        return Promise.reject(validationError);
      }

      // Error 429 - Rate limiting
      if (statusCode === 429) {
        const rateLimitError: ApiError = {
          message: 'Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.',
          statusCode: 429,
          isNetworkError: false,
          isAuthError: false,
        };
        return Promise.reject(rateLimitError);
      }

      // Error 500+ - Error del servidor
      if (statusCode >= 500) {
        const serverError: ApiError = {
          message: 'Error del servidor. Por favor, intenta más tarde.',
          statusCode,
          isNetworkError: false,
          isAuthError: false,
        };
        return Promise.reject(serverError);
      }

      // Otros errores
      const data = error.response.data as { detail?: string };
      const genericError: ApiError = {
        message: data?.detail || 'Ha ocurrido un error inesperado.',
        statusCode,
        isNetworkError: false,
        isAuthError: false,
      };
      return Promise.reject(genericError);
    }
  );

  return client;
};

// Instancia singleton del cliente
export const apiClient = createApiClient();

/**
 * Función para hacer peticiones GET
 */
export const apiGet = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
};

/**
 * Función para hacer peticiones POST
 */
export const apiPost = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.post<T>(url, data);
  return response.data;
};

/**
 * Función para hacer peticiones POST con FormData (imágenes, archivos)
 */
export const apiPostRaw = async <T>(url: string, data: FormData): Promise<T> => {
  const response = await apiClient.post<T>(url, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Función para hacer peticiones PUT
 */
export const apiPut = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.put<T>(url, data);
  return response.data;
};

/**
 * Función para hacer peticiones PATCH
 */
export const apiPatch = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.patch<T>(url, data);
  return response.data;
};

/**
 * Función para hacer peticiones DELETE
 */
export const apiDelete = async <T>(url: string): Promise<T> => {
  const response = await apiClient.delete<T>(url);
  return response.data;
};

/**
 * Función específica para login (usa form-data)
 */
export const apiLogin = async <T = unknown>(
  url: string,
  username: string,
  password: string
): Promise<T> => {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await apiClient.post<T>(url, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

/**
 * Helper para verificar si un error es de autenticación
 */
export const isAuthError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'isAuthError' in error) {
    return (error as ApiError).isAuthError;
  }
  return false;
};

/**
 * Helper para verificar si un error es de red
 */
export const isNetworkError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'isNetworkError' in error) {
    return (error as ApiError).isNetworkError;
  }
  return false;
};

/**
 * Helper para obtener mensaje de error
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado';
};