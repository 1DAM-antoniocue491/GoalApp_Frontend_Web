/**
 * Componente de ruta protegida
 * Verifica que el usuario esté autenticado antes de mostrar el contenido
 */

import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { FaSpinner } from 'react-icons/fa';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras se inicializa la autenticación
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-lime-400 text-3xl" />
          <p className="text-zinc-400 text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login guardando la ubicación actual
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, mostrar el contenido protegido
  return <>{children}</>;
}