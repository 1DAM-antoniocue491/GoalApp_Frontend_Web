/**
 * Exportaciones del módulo de autenticación
 */

// Contexto y hooks
export { AuthProvider, useAuth } from './hooks/useAuth';
export type { AuthContextType } from './hooks/useAuth';

// Servicio de autenticación
export {
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  refreshToken,
  saveToken,
  saveRefreshToken,
  getToken,
  getRefreshToken,
  getStoredUser,
  hasToken,
  isAuthenticated,
  clearAuthData,
  isTokenExpiringSoon,
} from './services/authApi';
export type { User, LoginResponse, UserRole } from './services/authApi';

// Componentes
export { default as PrivateRoute } from './components/PrivateRoute';

// Páginas
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as SendEmailForgottenPasswd } from './pages/SendEmailForgottenPasswd';