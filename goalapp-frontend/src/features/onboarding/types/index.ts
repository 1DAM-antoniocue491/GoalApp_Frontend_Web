/**
 * Tipos para el módulo de Onboarding
 */

export type UserRole = 'admin' | 'entrenador' | 'jugador' | 'delegado';

export type LeagueStatus = 'activa' | 'finalizada' | 'pendiente';

export interface UserLeague {
  id: number;
  nombre: string;
  temporada: string;
  rol: UserRole;
  estado: LeagueStatus;
  esFavorita: boolean;
  miEquipo?: string;
  equiposTotal: number;
}

export interface OnboardingUser {
  id: number;
  nombre: string;
  email: string;
  avatar?: string;
}