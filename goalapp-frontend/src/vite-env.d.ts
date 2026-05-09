/// <reference types="vite/client" />

/**
 * Tipado de las variables de entorno de Vite para GoalApp
 */
interface ImportMetaEnv {
  /** URL del API Backend */
  readonly VITE_API_URL: string;
  /** Usar datos mock en lugar de la API real */
  readonly VITE_USE_MOCKS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}