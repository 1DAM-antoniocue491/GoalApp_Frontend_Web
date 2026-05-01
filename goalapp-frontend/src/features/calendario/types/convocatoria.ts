/**
 * Tipos TypeScript para la gestión de convocatorias de partidos
 */

export interface Jugador {
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  posicion: string;
  dorsal: number;
  activo: boolean;
  usuario: {
    id_usuario: number;
    nombre: string;
    email: string;
  };
}

export interface JugadorConvocado {
  id_jugador: number;
  nombre: string;
  dorsal: number;
  posicion: string;
  es_titular: boolean;
}

export interface ConvocatoriaResponse {
  id_partido: number;
  id_equipo: number;
  nombre_equipo: string;
  titulares: JugadorConvocado[];
  suplentes: JugadorConvocado[];
}

export interface ConvocatoriaItem {
  id_jugador: number;
  es_titular: boolean;
}

export interface ConvocatoriaCreatePayload {
  id_partido: number;
  jugadores: ConvocatoriaItem[];
}

/**
 * Estado de un jugador en la UI de convocatoria
 */
export type EstadoConvocatoria = 'titular' | 'suplente' | 'no_convocado';

/**
 * Jugador con estado de convocatoria para la UI
 */
export interface JugadorConvocadoUI extends Jugador {
  estado: EstadoConvocatoria;
}

/**
 * Estadísticas de resumen de la convocatoria
 */
export interface ConvocatoriaResumen {
  totalConvocados: number;
  totalTitulares: number;
  totalSuplentes: number;
  maxConvocados: number;
  maxTitulares: number;
}
