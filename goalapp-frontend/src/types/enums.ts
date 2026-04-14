/**
 * Enums del sistema GoalApp
 * Define los estados, tipos y categorías utilizados en toda la aplicación
 */

/**
 * Estado posible de un partido
 */
export const EstadoPartido = {
  PROGRAMADO: 'programado',
  EN_JUEGO: 'en_juego',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
} as const;

export type EstadoPartido = (typeof EstadoPartido)[keyof typeof EstadoPartido];

/**
 * Tipos de eventos que pueden ocurrir durante un partido
 */
export const TipoEvento = {
  GOL: 'gol',
  TARJETA_AMARILLA: 'tarjeta_amarilla',
  TARJETA_ROJA: 'tarjeta_roja',
  CAMBIO: 'cambio',
  MVP: 'mvp',
} as const;

export type TipoEvento = (typeof TipoEvento)[keyof typeof TipoEvento];

/**
 * Género del usuario/jugador
 */
export const GeneroEnum = {
  MASCULINO: 'masculino',
  FEMENINO: 'femenino',
  OTRO: 'otro',
} as const;

export type GeneroEnum = (typeof GeneroEnum)[keyof typeof GeneroEnum];

/**
 * Posiciones de jugador en el campo
 */
export const PosicionJugador = {
  PORTERO: 'portero',
  DEFENSA: 'defensa',
  MEDIOCENTRO: 'mediocentro',
  CENTROCAMPISTA: 'centrocampista',
  DELANTERO: 'delantero',
} as const;

export type PosicionJugador = (typeof PosicionJugador)[keyof typeof PosicionJugador];

/**
 * Roles de usuario en el sistema
 */
export const RolNombre = {
  ADMIN: 'admin',
  ENTRENADOR: 'entrenador',
  DELEGADO: 'delegado',
  JUGADOR: 'jugador',
  USUARIO: 'usuario',
} as const;

export type RolNombre = (typeof RolNombre)[keyof typeof RolNombre];

/**
 * Estado de notificación
 */
export const EstadoNotificacion = {
  LEIDA: 'leida',
  NO_LEIDA: 'no_leida',
} as const;

export type EstadoNotificacion = (typeof EstadoNotificacion)[keyof typeof EstadoNotificacion];

/**
 * Tipo de liga
 */
export const TipoLiga = {
  TEMPORADA: 'temporada',
  TORNEO: 'torneo',
  COPA: 'copa',
} as const;

export type TipoLiga = (typeof TipoLiga)[keyof typeof TipoLiga];