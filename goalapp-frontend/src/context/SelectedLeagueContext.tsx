/**
 * Contexto de Liga Seleccionada
 * Almacena la liga activa y el rol del usuario en esa liga
 * Persiste en localStorage para mantener la selección entre sesiones
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { UserRole } from '../features/onboarding/types';

// ============================================
// TIPOS
// ============================================

/**
 * Liga seleccionada con información del rol del usuario
 */
export interface SelectedLeague {
  id: number;
  nombre: string;
  temporada: string;
  rol: UserRole;
  miEquipo?: string;
}

/**
 * Valor almacenado en localStorage
 */
interface StoredLeague {
  id: number;
  nombre: string;
  temporada: string;
  rol: UserRole;
  miEquipo?: string;
}

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEY = 'goalapp_selected_league';

// ============================================
// FUNCIONES DE ALMACENAMIENTO
// ============================================

/**
 * Obtener la liga almacenada del localStorage
 */
function getStoredLeague(): StoredLeague | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as StoredLeague;
    }
  } catch (error) {
    console.error('Error al leer liga almacenada:', error);
  }
  return null;
}

/**
 * Guardar la liga en localStorage
 */
function storeLeague(league: StoredLeague | null): void {
  try {
    if (league) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(league));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error al guardar liga:', error);
  }
}

// ============================================
// CONTEXTO
// ============================================

export interface SelectedLeagueContextType {
  /** Liga actualmente seleccionada */
  selectedLeague: SelectedLeague | null;
  /** Indica si se está cargando desde localStorage */
  isLoading: boolean;
  /** Seleccionar una nueva liga */
  selectLeague: (league: SelectedLeague) => void;
  /** Limpiar la selección de liga */
  clearSelectedLeague: () => void;
  /** Verificar si hay una liga seleccionada */
  hasSelectedLeague: boolean;
}

const SelectedLeagueContext = createContext<SelectedLeagueContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface SelectedLeagueProviderProps {
  children: ReactNode;
}

export function SelectedLeagueProvider({ children }: SelectedLeagueProviderProps) {
  // Inicializar estado desde localStorage directamente
  const [selectedLeague, setSelectedLeague] = useState<SelectedLeague | null>(() => {
    const stored = getStoredLeague();
    return stored;
  });
  const [isLoading] = useState(false);

  // Seleccionar una nueva liga
  const selectLeague = useCallback((league: SelectedLeague) => {
    setSelectedLeague(league);
    storeLeague(league);
  }, []);

  // Limpiar la selección
  const clearSelectedLeague = useCallback(() => {
    setSelectedLeague(null);
    storeLeague(null);
  }, []);

  const value: SelectedLeagueContextType = {
    selectedLeague,
    isLoading,
    selectLeague,
    clearSelectedLeague,
    hasSelectedLeague: !!selectedLeague,
  };

  return (
    <SelectedLeagueContext.Provider value={value}>
      {children}
    </SelectedLeagueContext.Provider>
  );
}

// ============================================
// HOOK PARA USAR EL CONTEXTO
// ============================================

/**
 * Hook para acceder al contexto de liga seleccionada
 * @returns SelectedLeagueContextType con el estado y funciones
 * @throws Error si se usa fuera de un SelectedLeagueProvider
 */
export function useSelectedLeague(): SelectedLeagueContextType {
  const context = useContext(SelectedLeagueContext);

  if (!context) {
    throw new Error('useSelectedLeague debe usarse dentro de un SelectedLeagueProvider');
  }

  return context;
}

// Exportar el contexto para casos especiales
export { SelectedLeagueContext };