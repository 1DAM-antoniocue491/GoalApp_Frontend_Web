/**
 * Tipos para el sistema de mocks de GoalApp
 * Define las interfaces para los datos mock y las respuestas de la API
 */

// ============================================
// TIPOS DE DATOS MOCK
// ============================================

export interface MockUsuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  rol_principal: string;
  imagen_url: string | null;
  activo: boolean;
  roles: MockRol[];
}

export interface MockRol {
  id_rol: number;
  nombre: string;
  descripcion: string;
}

export interface MockLiga {
  id_liga: number;
  nombre: string;
  temporada: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockEquipo {
  id_equipo: number;
  nombre: string;
  ciudad?: string;
  estadio?: string;
  escudo?: string | null;
  colores?: string;
  id_liga: number;
  id_entrenador?: number;
  id_delegado?: number;
  created_at: string;
  updated_at: string;
}

export interface MockJugador {
  id_jugador: number;
  nombre: string;
  id_equipo: number;
  posicion: string;
  dorsal: number;
  fecha_nacimiento: string;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
  activo: boolean;
}

export interface MockPartido {
  id_partido: number;
  id_liga: number;
  id_jornada: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  nombre_equipo_local?: string;
  nombre_equipo_visitante?: string;
  escudo_equipo_local?: string | null;
  escudo_equipo_visitante?: string | null;
  equipo_local?: string;
  equipo_visitante?: string;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha: string;
  estado: 'programado' | 'en_vivo' | 'finalizado' | 'suspendido' | 'Programado' | 'En Juego' | 'Finalizado' | 'Suspendido';
  created_at: string;
  updated_at: string;
  ubicacion?: string;
}

export interface MockEventoPartido {
  id_evento: number;
  id_partido: number;
  tipo: string;
  minuto: number;
  id_jugador: number;
  nombre_jugador: string;
  id_equipo: number;
  nombre_equipo: string;
  detalle: string;
  puntuacion_mvp?: number;
  incidencias?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MockNotificacion {
  id_notificacion: number;
  id_usuario: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  created_at: string;
}

// ============================================
// TIPOS DE RESPUESTA DE API (coinciden con authApi.ts)
// ============================================

export interface MockLoginResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
}

export interface MockLigaConRol {
  id_liga: number;
  nombre: string;
  temporada: string;
  activa: boolean;
  rol: string;
  equipos_total: number;
}

export interface MockLigaSeguida {
  id_liga: number;
  nombre: string;
  temporada: string;
  activa: boolean;
}

export interface MockCreateLeagueRequest {
  nombre: string;
  temporada: string;
  activa?: boolean;
}

export interface MockCreateLeagueResult {
  success: boolean;
  data?: MockLiga;
  error?: string;
}

export interface MockSeguimientoResponse {
  id_seguimiento: number;
  id_usuario: number;
  id_liga: number;
  created_at: string;
}

export interface MockDejarSeguirResponse {
  mensaje: string;
}

// ============================================
// TIPOS DE RESPUESTA DE API (estadísticas)
// ============================================

export interface MockTopScorer {
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  nombre: string;
  nombre_equipo: string;
  escudo_equipo: string | null;
  goles: number;
  partidos_jugados: number;
  promedio_goles: string;
}

export interface MockMatchdayMVP {
  id_jugador: number;
  id_usuario: number;
  nombre: string;
  nombre_equipo: string;
  escudo_equipo: string | null;
  rating: number;
  goles: number;
  asistencias: number;
  jornada: number;
}

export interface MockTeamGoals {
  id_equipo: number;
  nombre: string;
  escudo: string | null;
  goles_favor: number;
  goles_contra: number;
  diferencia_goles: number;
  promedio_goles_favor: string;
  partidos_jugados: number;
}

export interface MockPlayerStats {
  id_jugador: number;
  id_usuario: number;
  nombre: string;
  nombre_equipo: string;
  escudo_equipo: string | null;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
  veces_mvp: number;
}

// ============================================
// TIPOS DE RESPUESTA DE API (usuarios)
// ============================================

export interface MockTeamResponse {
  id_equipo: number;
  nombre: string;
  escudo: string | null;
  colores: string | null;
  id_liga: number;
  id_entrenador: number;
  id_delegado: number;
  created_at: string;
  updated_at: string;
}

export interface MockUserWithRole {
  id_usuario: number;
  nombre: string;
  email: string;
  id_rol: number;
  rol: UserRole;
  activo: boolean;
  created_at: string;
}

export type UserRole = 'admin' | 'entrenador' | 'delegado' | 'jugador' | 'observador';

export interface MockInviteUserPayload {
  email: string;
  liga_id: number;
  id_rol: number;
  nombre?: string;
  id_equipo?: number;
  dorsal?: number;
  posicion?: string;
  tipo_jugador?: string;
}

// ============================================
// TIPOS DE RESPUESTA DE API (miembros liga)
// ============================================

export interface MockUsuarioLiga {
  id_usuario_rol: number;
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_rol: number;
  nombre_rol: string;
  activo: boolean;
}

export interface MockMiembroEquipo {
  id_miembro: number;
  id_usuario: number;
  tipo: 'jugador' | 'delegado';
  nombre: string;
  email: string;
  activo: boolean;
  posicion?: string;
  dorsal?: number;
}

export interface MockDelegado {
  id_usuario: number;
  nombre: string;
  email: string;
}

export interface MockMiembroEstado {
  id_usuario: number;
  nombre: string;
  activo: boolean;
}

// ============================================
// TIPOS DE RESPUESTA DE API (convocatoria)
// ============================================

export interface MockConvocatoria {
  id_convocatoria: number;
  id_partido: number;
  id_equipo: number;
  fecha_convocatoria: string;
  estado: string;
  jugadores: MockJugadorConvocatoria[];
}

export interface MockJugadorConvocatoria {
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  nombre: string;
  posicion: string;
  dorsal: number;
  estado: string;
  email: string;
}