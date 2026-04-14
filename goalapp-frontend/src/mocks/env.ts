/**
 * Configuracion del toggle entre API real y datos mock
 * Permite cambiar entre backend real y datos estaticos
 * mediante la variable de entorno VITE_USE_MOCKS
 */

/**
 * Verifica si los mocks estan habilitados
 * Se basa en la variable de entorno VITE_USE_MOCKS
 *
 * Uso:
 *   VITE_USE_MOCKS=true  -> Usa datos mock
 *   VITE_USE_MOCKS=false o no definida -> Usa API real
 *
 * Para cambiar, modificar el archivo .env y reiniciar el servidor de desarrollo
 */
export const isMockEnabled = (): boolean => {
  return import.meta.env.VITE_USE_MOCKS === 'true';
};

/**
 * Log informativo sobre el modo de API activo
 * Solo se ejecuta en desarrollo
 */
export const logApiMode = (): void => {
  if (import.meta.env.DEV) {
    const mode = isMockEnabled() ? 'MOCK' : 'REAL API';
    console.log(
      `%c[GoalApp] Modo de API: ${mode}`,
      isMockEnabled()
        ? 'color: #f59e0b; font-weight: bold;'
        : 'color: #10b981; font-weight: bold;'
    );
  }
};

// Ejecutar log al cargar
logApiMode();