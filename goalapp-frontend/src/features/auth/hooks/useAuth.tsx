import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  getCurrentUser,
  saveToken,
  getToken,
} from '../services/authApi';
import type { User } from '../services/authApi';

// Tipos del contexto
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitializing: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  isAuthenticated: boolean;
}

// Contexto
const AuthContext = createContext<AuthContextType | null>(null);

// Proveedor
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario al montar si hay token guardado
  useEffect(() => {
    async function loadUser() {
      const savedToken = getToken();
      if (savedToken) {
        try {
          const userData = await getCurrentUser(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch {
          // Token inválido, limpiar
          apiLogout();
          setToken(null);
          setUser(null);
        }
      }
      setIsInitializing(false);
    }
    loadUser();
  }, []);

  // Función de login
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // Llamar a la API
      const response = await apiLogin(email, password);

      // Guardar token
      saveToken(response.access_token);
      setToken(response.access_token);

      // Obtener información del usuario
      const userData = await getCurrentUser(response.access_token);
      setUser(userData);

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función de logout
  const logout = () => {
    apiLogout();
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Limpiar error
  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isInitializing,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}