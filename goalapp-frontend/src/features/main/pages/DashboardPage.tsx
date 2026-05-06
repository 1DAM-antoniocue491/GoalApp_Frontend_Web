/**
 * Página principal del Dashboard
 * Muestra contenido diferente según el rol del usuario en la liga seleccionada
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import Nav from '../../../components/Nav';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSelectedLeague } from '../../../context';
import {
  AdminDashboard,
  CoachDashboard,
  PlayerDashboard,
  DelegateDashboard,
} from '../components/dashboard/roles';

// Mapeo de roles a etiquetas legibles (soporta español e inglés del backend)
const roleLabels: Record<string, string> = {
  // Español
  admin: 'Administrador',
  entrenador: 'Entrenador',
  jugador: 'Jugador',
  delegado: 'Delegado',
  observador: 'Observador',
  // Inglés (backend)
  coach: 'Entrenador',
  delegate: 'Delegado',
  player: 'Jugador',
  viewer: 'Observador',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedLeague, isLoading, hasSelectedLeague } = useSelectedLeague();

  // Redirigir a onboarding si no hay liga seleccionada
  useEffect(() => {
    if (!isLoading && !hasSelectedLeague) {
      navigate('/onboarding', { replace: true });
    }
  }, [isLoading, hasSelectedLeague, navigate]);

  // Mostrar loading mientras se verifica la liga seleccionada
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    );
  }

  // Si no hay liga seleccionada, mostrar mensaje y redirigir
  if (!selectedLeague) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">No hay liga seleccionada</p>
          <p className="text-zinc-500 text-sm">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  const userName = user?.nombre || 'Usuario';
  const userRole = roleLabels[selectedLeague.rol] || selectedLeague.rol;

  // Renderizar dashboard según el rol (soporta español e inglés del backend)
  const renderDashboardByRole = () => {
    const rol = selectedLeague.rol.toLowerCase();
    switch (rol) {
      case 'admin':
        return (
          <AdminDashboard
            league={selectedLeague}
            userName={userName}
            userRole={userRole}
          />
        );
      case 'entrenador':
      case 'coach':
        return (
          <CoachDashboard
            league={selectedLeague}
            userName={userName}
            userRole={userRole}
          />
        );
      case 'jugador':
      case 'player':
        return (
          <PlayerDashboard
            league={selectedLeague}
            userName={userName}
            userRole={userRole}
          />
        );
      case 'delegado':
      case 'delegate':
        return (
          <DelegateDashboard
            league={selectedLeague}
            userName={userName}
            userRole={userRole}
          />
        );
      case 'observador':
      case 'viewer':
        // Viewer usa el dashboard de jugador pero con permisos limitados
        return (
          <PlayerDashboard
            league={selectedLeague}
            userName={userName}
            userRole={userRole}
          />
        );
      default:
        // Por defecto, mostrar dashboard de jugador
        return (
          <PlayerDashboard
            league={selectedLeague}
            userName={userName}
            userRole={userRole}
          />
        );
    }
  };

  return (
    <>
      <Nav leagueName={selectedLeague.nombre} userRole={userRole} />
      <div className="flex flex-col bg-zinc-950 p-5 px-10 py-6 md:px-20 lg:px-60 gap-5 sm:gap-6 min-h-screen">
        {renderDashboardByRole()}
      </div>
    </>
  );
}