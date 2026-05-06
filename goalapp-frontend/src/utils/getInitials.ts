/**
 * Genera las iniciales de un nombre para usar como logo automático
 *
 * @param nombre - El nombre completo del equipo o persona
 * @param maxLetters - Número máximo de letras a devolver (por defecto 2)
 * @returns Las iniciales en mayúsculas
 *
 * @example
 * getInitials('Real Madrid') // 'RM'
 * getInitials('Atletico de Madrid') // 'AM'
 * getInitials('Barcelona') // 'BA'
 * getInitials('Team A') // 'TA'
 */
export function getInitials(nombre: string, maxLetters: number = 2): string {
  if (!nombre || nombre.trim() === '') {
    return 'E'; // Default para equipos
  }

  const trimmed = nombre.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length >= 2) {
    // Tomar primera letra de la primera palabra y primera letra de la última palabra
    const initials = `${parts[0][0]}${parts[parts.length - 1][0]}`;
    return initials.toUpperCase().substring(0, maxLetters);
  }

  // Si es una sola palabra, tomar las primeras maxLetters
  return trimmed.substring(0, maxLetters).toUpperCase();
}

/**
 * Genera las iniciales de una persona (nombre + apellido)
 *
 * @param nombreCompleto - Nombre completo de la persona
 * @returns Las iniciales en mayúsculas (primera letra del nombre y apellido)
 *
 * @example
 * getInitialsPerson('Juan Perez') // 'JP'
 * getInitialsPerson('Maria Garcia Lopez') // 'ML'
 */
export function getInitialsPerson(nombreCompleto: string): string {
  if (!nombreCompleto || nombreCompleto.trim() === '') {
    return 'U'; // Default para usuario
  }

  const parts = nombreCompleto.trim().split(/\s+/);

  if (parts.length >= 2) {
    // Primera letra del nombre y primera letra del último apellido
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }

  return nombreCompleto.substring(0, 2).toUpperCase();
}
