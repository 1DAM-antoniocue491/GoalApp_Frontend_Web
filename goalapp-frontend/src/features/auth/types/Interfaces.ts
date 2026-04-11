/**
 * Interfaces de autenticación para GoalApp
 * Re-exporta los tipos del servicio de autenticación para conveniencia
 */

// Re-exportar tipos del servicio de autenticación
export type {
  User,
  LoginResponse,
  UserRole,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
} from '../services/authApi';

// Re-exportar tipos comunes
export type { AuthContextType } from '../hooks/useAuth';