/**
 * Contexto de autenticación para GoalApp
 * Proporciona estado y funciones de autenticación a toda la aplicación
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getCurrentUser,
  getToken,
  getStoredUser,
  clearAuthData,
  isTokenExpiringSoon,
  refreshToken,
  saveToken,
  saveRefreshToken,
} from '../services/authApi';
import type { User } from '../services/authApi';

// ============================================
// TIPOS DEL CONTEXTO
// ============================================

export interface AuthContextType {
  /** Usuario actualmente autenticado */
  user: User | null;
  /** Token de acceso actual */
  token: string | null;
  /** Indica si está autenticado */
  isAuthenticated: boolean;
  /** Indica si está cargando (durante login/logout) */
  isLoading: boolean;
  /** Indica si está inicializando (carga inicial del usuario) */
  isInitializing: boolean;
  /** Error de autenticación si existe */
  error: string | null;
  /** Función para iniciar sesión */
  login: (email: string, password: string) => Promise<boolean>;
  /** Función para registrar un nuevo usuario */
  register: (nombre: string, email: string, password: string) => Promise<boolean>;
  /** Función para cerrar sesión */
  logout: () => Promise<void>;
  /** Función para limpiar el error */
  clearError: () => void;
  /** Función para refrescar los datos del usuario */
  refreshUser: () => Promise<boolean>;
}

// ============================================
// CONTEXTO
// ============================================

const AuthContext = createContext<AuthContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // CARGAR USUARIO AL INICIAR
  // ============================================
  useEffect(() => {
    async function loadUser() {
      const savedToken = getToken();
      const storedUser = getStoredUser();

      if (savedToken) {
        setToken(savedToken);

        // Usar usuario almacenado mientras carga
        if (storedUser) {
          setUser(storedUser);
        }

        // Verificar si el token está próximo a expirar
        if (isTokenExpiringSoon()) {
          try {
            await refreshToken();
          } catch {
            // Si falla el refresh, limpiar todo
            clearAuthData();
            setToken(null);
            setUser(null);
            setIsInitializing(false);
            return;
          }
        }

        // Obtener datos actualizados del usuario
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch {
          // Token inválido o error de red
          clearAuthData();
          setToken(null);
          setUser(null);
        }
      }

      setIsInitializing(false);
    }

    loadUser();
  }, []);

  // ============================================
  // FUNCIÓN DE LOGIN
  // ============================================
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Llamar a la API de login
      const response = await apiLogin(email, password);

      // Guardar el token en localStorage ANTES de llamar a getCurrentUser
      // para que el interceptor de Axios lo incluya en la petición /me
      saveToken(response.access_token);
      if (response.refresh_token) {
        saveRefreshToken(response.refresh_token);
      }

      // Obtener información del usuario
      const userData = await getCurrentUser();

      // Todo OK — guardar en el estado
      setToken(response.access_token);
      setUser(userData);

      return true;
    } catch (err) {
      // Si algo falla (login o getCurrentUser), limpiar todo para no dejar tokens huérfanos
      clearAuthData();
      setToken(null);
      setUser(null);

      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // FUNCIÓN DE REGISTRO
  // ============================================
  const register = useCallback(async (nombre: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Llamar a la API de registro
      const response = await apiRegister(nombre, email, password);

      if (!response.success) {
        setError(response.message);
        return false;
      }

      // Auto-login tras registro exitoso
      const loginResponse = await apiLogin(email, password);

      // Actualizar el estado con el token
      setToken(loginResponse.access_token);

      // Obtener información del usuario
      const userData = await getCurrentUser();
      setUser(userData);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // FUNCIÓN DE LOGOUT
  // ============================================
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await apiLogout();
    } catch {
      // Ignorar errores del logout en el servidor
    } finally {
      setToken(null);
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // FUNCIÓN PARA REFRESCAR USUARIO
  // ============================================
  const refreshUser = useCallback(async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const userData = await getCurrentUser();
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  }, [token]);

  // ============================================
  // LIMPIAR ERROR
  // ============================================
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================
  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    isInitializing,
    error,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK PARA USAR EL CONTEXTO
// ============================================

/**
 * Hook para acceder al contexto de autenticación
 * @returns AuthContextType con el estado y funciones de autenticación
 * @throws Error si se usa fuera de un AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return context;
}

// Exportar el contexto para casos especiales
export { AuthContext };