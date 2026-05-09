/**
 * Módulo de Mocks para GoalApp
 * Exportaciones principales del sistema de datos simulados
 *
 * Se activa cuando VITE_USE_MOCKS=true en el archivo .env
 */

// Configuracion del toggle
export { isMockEnabled, logApiMode } from './env';

// API Mock (para uso directo si se necesita)
export * from './api';

// Tipos
export type * from './types';