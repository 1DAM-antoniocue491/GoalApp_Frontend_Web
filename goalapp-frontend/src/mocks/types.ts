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
  id_liga: number;
  entrenador: string;
  escudo_url: string | null;
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