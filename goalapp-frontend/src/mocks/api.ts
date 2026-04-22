/**
 * Servicio Mock de API para GoalApp
 * Simula las respuestas del backend con datos estáticos y delays realistas.
 * Se activa cuando VITE_USE_MOCKS=true en el archivo .env
 */

import type {
  MockUsuario,
  MockLiga,
  MockEquipo,
  MockJugador,
  MockPartido,
  MockEventoPartido,
  MockFormacion,
  MockNotificacion,
  MockLoginResponse,
  MockLigaConRol,
  MockLigaSeguida,
  MockCreateLeagueResult,
  MockSeguimientoResponse,
  MockDejarSeguirResponse,
} from './types';

// Importar datos mock desde JSON
import usuariosData from './data/usuarios.json';
import ligasData from './data/ligas.json';
import equiposData from './data/equipos.json';
import jugadoresData from './data/jugadores.json';
import partidosData from './data/partidos.json';
import eventosData from './data/eventos_partido.json';
import formacionesData from './data/formaciones.json';
import notificacionesData from './data/notificaciones.json';

// ============================================
// CONFIGURACION
// ============================================

/** Delay base en milisegundos para simular latencia de red */
const MOCK_DELAY_MS = 400;

/** Delay para operaciones de escritura (mayor para simular procesamiento) */
const MOCK_WRITE_DELAY_MS = 800;

/** Variacion aleatoria en el delay (+/- porcentaje) */
const DELAY_JITTER = 0.3;

/**
 * Simula un delay de red con variacion aleatoria
 * @param baseDelay - Delay base en ms
 * @returns Promesa que se resuelve despues del delay
 */
function simulateDelay(baseDelay: number = MOCK_DELAY_MS): Promise<void> {
  const jitter = 1 + (Math.random() * 2 - 1) * DELAY_JITTER;
  const delay = Math.max(100, Math.round(baseDelay * jitter));
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Genera un ID incremental simple para nuevas entidades
 */
let idCounter = 100;
function generateId(): number {
  return ++idCounter;
}

// ============================================
// DATOS EN MEMORIA (mutables para operaciones CRUD)
// ============================================

const usuarios: MockUsuario[] = [...usuariosData] as MockUsuario[];
const ligas: MockLiga[] = [...ligasData] as MockLiga[];
const equipos: MockEquipo[] = [...equiposData] as MockEquipo[];
const jugadores: MockJugador[] = [...jugadoresData] as MockJugador[];
const partidos: MockPartido[] = [...partidosData] as MockPartido[];
const eventos: MockEventoPartido[] = [...eventosData] as MockEventoPartido[];
const formaciones: MockFormacion[] = [...formacionesData] as MockFormacion[];
const notificaciones: MockNotificacion[] = [...notificacionesData] as MockNotificacion[];

// Ligas seguidas por el usuario mock (ids)
let ligasSeguidasIds: number[] = [1, 4];

// ============================================
// AUTH - Autenticacion
// ============================================

/**
 * Login mock - simula autenticacion exitosa
 * Acepta cualquier combinacion de email/password y devuelve un token mock
 */
export async function mockLogin(email: string, _password: string): Promise<MockLoginResponse> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  // Buscar un usuario que coincida o usar el admin por defecto
  const usuario = usuarios.find((u) => u.email === email) || usuarios[0];

  // Generar un token mock con informacion del usuario codificada
  const payload = {
    sub: usuario.id_usuario,
    email: usuario.email,
    rol: usuario.rol_principal,
    exp: Math.floor(Date.now() / 1000) + 3600, // Expira en 1 hora
    iat: Math.floor(Date.now() / 1000),
  };

  // Simular formato JWT (header.payload.signature)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature');

  const access_token = `${header}.${payloadB64}.${signature}`;

  return {
    access_token,
    token_type: 'bearer',
    refresh_token: `refresh_${access_token}`,
    expires_in: 3600,
  };
}

/**
 * Obtener el usuario autenticado actual
 */
export async function mockGetCurrentUser(): Promise<MockUsuario> {
  await simulateDelay();
  // Devolver el primer usuario (admin) como usuario actual
  return usuarios[0];
}

/**
 * Logout mock - no necesita llamar al backend
 */
export async function mockLogout(): Promise<void> {
  await simulateDelay(200);
  // No hay operacion real que hacer
}

/**
 * Solicitar recuperacion de contrasena
 */
export async function mockForgotPassword(_email: string): Promise<{ mensaje: string; success: boolean }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);
  return {
    mensaje: 'Si el email existe, se ha enviado un enlace de recuperacion.',
    success: true,
  };
}

/**
 * Restablecer contrasena
 */
export async function mockResetPassword(_token: string, _newPassword: string): Promise<{ message: string }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);
  return { message: 'Contrasena actualizada correctamente.' };
}

/**
 * Refrescar token mock
 */
export async function mockRefreshToken(): Promise<MockLoginResponse> {
  await simulateDelay(200);
  return mockLogin('carlos.garcia@email.com', 'mock');
}

/**
 * Registrar un nuevo usuario mock
 */
export async function mockRegister(
  nombre: string,
  email: string,
  _password: string,
): Promise<{ success: boolean; message: string; user?: MockUsuario }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  // Verificar si el email ya existe
  const emailExiste = usuarios.find((u) => u.email === email);
  if (emailExiste) {
    return {
      success: false,
      message: 'Ya existe una cuenta con este email.',
    };
  }

  // Crear nuevo usuario
  const nuevoUsuario: MockUsuario = {
    id_usuario: generateId(),
    nombre,
    email,
    telefono: null,
    fecha_nacimiento: null,
    rol_principal: 'jugador',
    imagen_url: null,
    activo: true,
    roles: [{ id_rol: 5, nombre: 'jugador', descripcion: 'Jugador' }],
  };

  usuarios.push(nuevoUsuario);

  return {
    success: true,
    message: 'Registro exitoso.',
    user: nuevoUsuario,
  };
}

// ============================================
// LIGAS
// ============================================

/**
 * Obtener todas las ligas
 */
export async function mockFetchAllLeagues(): Promise<MockLiga[]> {
  await simulateDelay();
  return [...ligas];
}

/**
 * Obtener una liga por ID
 */
export async function mockFetchLeagueById(id: number): Promise<MockLiga> {
  await simulateDelay();
  const liga = ligas.find((l) => l.id_liga === id);
  if (!liga) {
    throw new Error(`Liga con id ${id} no encontrada`);
  }
  return { ...liga };
}

/**
 * Crear una nueva liga
 */
export async function mockCreateLeague(data: {
  nombre: string;
  temporada: string;
  activa?: boolean;
  categoria?: string;
  cantidad_partidos?: number;
  duracion_partido?: number;
  logo_url?: string;
}): Promise<MockCreateLeagueResult> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const nuevaLiga: MockLiga = {
    id_liga: generateId(),
    nombre: data.nombre,
    temporada: data.temporada,
    activa: data.activa ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  ligas.push(nuevaLiga);

  return {
    success: true,
    data: nuevaLiga,
  };
}

/**
 * Actualizar una liga existente
 */
export async function mockUpdateLeague(
  id: number,
  data: { nombre?: string; temporada?: string; activa?: boolean }
): Promise<{ success: boolean; data?: MockLiga; error?: string }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const index = ligas.findIndex((l) => l.id_liga === id);
  if (index === -1) {
    return { success: false, error: `Liga con id ${id} no encontrada` };
  }

  ligas[index] = {
    ...ligas[index],
    ...(data.nombre !== undefined && { nombre: data.nombre }),
    ...(data.temporada !== undefined && { temporada: data.temporada }),
    ...(data.activa !== undefined && { activa: data.activa }),
    updated_at: new Date().toISOString(),
  };

  return { success: true, data: { ...ligas[index] } };
}

// ============================================
// CONFIGURACIÓN DE LIGA
// ============================================

const leagueConfigs: Record<number, {
  id_configuracion: number;
  id_liga: number;
  hora_partidos: string;
  min_equipos: number;
  max_equipos: number;
  min_convocados: number;
  max_convocados: number;
  min_plantilla: number;
  max_plantilla: number;
  min_jugadores_equipo: number;
  min_partidos_entre_equipos: number;
  minutos_partido: number;
  max_partidos: number;
  created_at: string;
  updated_at: string;
}> = {
  1: {
    id_configuracion: 1, id_liga: 1, hora_partidos: '17:00:00',
    min_equipos: 6, max_equipos: 30, min_convocados: 18, max_convocados: 28,
    min_plantilla: 18, max_plantilla: 28, min_jugadores_equipo: 7,
    min_partidos_entre_equipos: 2, minutos_partido: 90, max_partidos: 45,
    created_at: '2025-09-01T10:00:00Z', updated_at: '2025-09-01T10:00:00Z',
  },
  2: {
    id_configuracion: 2, id_liga: 2, hora_partidos: '18:00:00',
    min_equipos: 4, max_equipos: 16, min_convocados: 14, max_convocados: 22,
    min_plantilla: 14, max_plantilla: 22, min_jugadores_equipo: 7,
    min_partidos_entre_equipos: 2, minutos_partido: 80, max_partidos: 30,
    created_at: '2025-09-15T14:30:00Z', updated_at: '2025-09-15T14:30:00Z',
  },
  3: {
    id_configuracion: 3, id_liga: 3, hora_partidos: '19:00:00',
    min_equipos: 4, max_equipos: 42, min_convocados: 18, max_convocados: 28,
    min_plantilla: 18, max_plantilla: 28, min_jugadores_equipo: 7,
    min_partidos_entre_equipos: 2, minutos_partido: 90, max_partidos: 45,
    created_at: '2024-08-20T09:00:00Z', updated_at: '2025-06-30T18:00:00Z',
  },
};

export async function mockFetchLeagueConfig(id: number) {
  await simulateDelay();
  const config = leagueConfigs[id];
  if (!config) {
    // Devolver configuración por defecto si no existe
    return {
      id_configuracion: id * 100, id_liga: id, hora_partidos: '17:00:00',
      min_equipos: 2, max_equipos: 20, min_convocados: 14, max_convocados: 22,
      min_plantilla: 11, max_plantilla: 25, min_jugadores_equipo: 7,
      min_partidos_entre_equipos: 2, minutos_partido: 90, max_partidos: 30,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
  }
  return { ...config };
}

export async function mockUpdateLeagueConfig(
  id: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; data?: typeof leagueConfigs[number]; error?: string }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  if (!leagueConfigs[id]) {
    return { success: false, error: `Configuración de liga ${id} no encontrada` };
  }

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key in leagueConfigs[id]) {
      (leagueConfigs[id] as Record<string, unknown>)[key] = value;
    }
  });
  leagueConfigs[id].updated_at = new Date().toISOString();

  return { success: true, data: { ...leagueConfigs[id] } };
}

export async function mockDeleteLeague(id: number): Promise<{ success: boolean; error?: string }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const index = ligas.findIndex((l) => l.id_liga === id);
  if (index === -1) {
    return { success: false, error: `Liga con id ${id} no encontrada` };
  }

  ligas.splice(index, 1);
  delete leagueConfigs[id];

  return { success: true };
}

// ============================================
// ONBOARDING - Ligas del usuario
// ============================================

/**
 * Obtener las ligas donde el usuario tiene un rol
 */
export async function mockFetchUserLeaguesWithRole(): Promise<MockLigaConRol[]> {
  await simulateDelay();

  // El usuario mock es admin y esta en las primeras 4 ligas con distintos roles
  const roles: Record<number, string> = {
    1: 'admin',
    2: 'entrenador',
    3: 'delegado',
    4: 'jugador',
  };

  return ligas
    .filter((liga) => liga.id_liga <= 4)
    .map((liga) => ({
      id_liga: liga.id_liga,
      nombre: liga.nombre,
      temporada: liga.temporada,
      activa: liga.activa,
      rol: roles[liga.id_liga] || 'jugador',
    }));
}

/**
 * Obtener las ligas que el usuario esta siguiendo
 */
export async function mockFetchLigasSeguidas(): Promise<MockLigaSeguida[]> {
  await simulateDelay();

  return ligas
    .filter((liga) => ligasSeguidasIds.includes(liga.id_liga))
    .map((liga) => ({
      id_liga: liga.id_liga,
      nombre: liga.nombre,
      temporada: liga.temporada,
      activa: liga.activa,
    }));
}

/**
 * Obtener IDs de ligas seguidas
 */
export async function mockFetchLigasSeguidasIds(): Promise<number[]> {
  await simulateDelay();
  return [...ligasSeguidasIds];
}

/**
 * Seguir una liga
 */
export async function mockSeguirLiga(ligaId: number): Promise<MockSeguimientoResponse> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  if (!ligasSeguidasIds.includes(ligaId)) {
    ligasSeguidasIds.push(ligaId);
  }

  return {
    id_seguimiento: generateId(),
    id_usuario: 1,
    id_liga: ligaId,
    created_at: new Date().toISOString(),
  };
}

/**
 * Dejar de seguir una liga
 */
export async function mockDejarDeSeguirLiga(ligaId: number): Promise<MockDejarSeguirResponse> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  ligasSeguidasIds = ligasSeguidasIds.filter((id) => id !== ligaId);

  return {
    mensaje: 'Has dejado de seguir la liga correctamente.',
  };
}

/**
 * Alternar estado de favorito de una liga
 */
export async function mockToggleLigaFavorita(ligaId: number, esFavorita: boolean): Promise<void> {
  if (esFavorita) {
    await mockDejarDeSeguirLiga(ligaId);
  } else {
    await mockSeguirLiga(ligaId);
  }
}

/**
 * Reactivar una liga finalizada
 */
export async function mockReactivarLiga(ligaId: number): Promise<void> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const liga = ligas.find((l) => l.id_liga === ligaId);
  if (!liga) {
    throw new Error(`Liga con id ${ligaId} no encontrada`);
  }
  liga.activa = true;
}

/**
 * Unirse a una liga mediante código de invitación
 * Simula la validación del código y el seguimiento de la liga
 */
export async function mockJoinLeagueByCode(codigo: string): Promise<MockSeguimientoResponse> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  // Buscar liga por código (simulado: el código es el ID de la liga)
  const ligaId = parseInt(codigo, 10);
  const liga = ligas.find((l) => l.id_liga === ligaId);

  if (!liga) {
    throw new Error('Código de invitación inválido o expirado');
  }

  // Seguir la liga
  if (!ligasSeguidasIds.includes(ligaId)) {
    ligasSeguidasIds.push(ligaId);
  }

  return {
    id_seguimiento: generateId(),
    id_usuario: 1,
    id_liga: ligaId,
    created_at: new Date().toISOString(),
  };
}

// ============================================
// EQUIPOS
// ============================================

/**
 * Obtener equipos de una liga
 */
export async function mockFetchTeamsByLeague(ligaId: number): Promise<MockEquipo[]> {
  await simulateDelay();
  return equipos.filter((e) => e.id_liga === ligaId).map((e) => ({ ...e }));
}

/**
 * Obtener un equipo por ID
 */
export async function mockFetchTeamById(id: number): Promise<MockEquipo> {
  await simulateDelay();
  const equipo = equipos.find((e) => e.id_equipo === id);
  if (!equipo) {
    throw new Error(`Equipo con id ${id} no encontrado`);
  }
  return { ...equipo };
}

/**
 * Crear un nuevo equipo
 */
export async function mockCreateTeam(data: {
  nombre: string;
  escudo?: string;
  colores?: string;
  id_liga: number;
  id_entrenador?: number;
  id_delegado?: number;
}): Promise<MockEquipo> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const nuevoEquipo: MockEquipo = {
    id_equipo: generateId(),
    nombre: data.nombre,
    escudo: data.escudo ?? null,
    colores: data.colores ?? '#D4FF59',
    id_liga: data.id_liga,
    id_entrenador: data.id_entrenador ?? 1,
    id_delegado: data.id_delegado ?? 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  equipos.push(nuevoEquipo);

  return { ...nuevoEquipo };
}

/**
 * Obtener detalle completo de un equipo
 */
export async function mockFetchTeamDetail(id: number): Promise<{
  id_equipo: number;
  nombre: string;
  escudo: string | null;
  colores: string | null;
  id_liga: number;
  id_entrenador: number;
  id_delegado: number;
  ciudad: string | null;
  estadio: string | null;
  created_at: string;
  updated_at: string;
  posicion_liga: number;
  puntos: number;
  tasa_victoria: number;
  goles_favor: number;
  goles_contra: number;
}> {
  await simulateDelay();
  const equipo = equipos.find((e) => e.id_equipo === id);
  if (!equipo) {
    throw new Error(`Equipo con id ${id} no encontrado`);
  }

  // Calcular estadísticas mock
  const partidosEquipo = partidos.filter(
    (p) => p.id_equipo_local === id || p.id_equipo_visitante === id
  );
  let victorias = 0, empates = 0, derrotas = 0, goles_favor = 0, goles_contra = 0, puntos = 0;

  partidosEquipo.forEach((p) => {
    if (p.estado === 'finalizado' && p.goles_local !== null && p.goles_visitante !== null) {
      const esLocal = p.id_equipo_local === id;
      const golesEquipo = esLocal ? p.goles_local : p.goles_visitante;
      const golesRival = esLocal ? p.goles_visitante : p.goles_local;
      goles_favor += golesEquipo;
      goles_contra += golesRival;
      if (golesEquipo > golesRival) {
        victorias++;
        puntos += 3;
      } else if (golesEquipo === golesRival) {
        empates++;
        puntos += 1;
      } else {
        derrotas++;
      }
    }
  });

  const partidos_jugados = victorias + empates + derrotas;
  const tasa_victoria = partidos_jugados > 0 ? Math.round((victorias / partidos_jugados) * 100 * 10) / 10 : 0;

  return {
    ...equipo,
    ciudad: equipo.ciudad ?? 'Madrid',
    estadio: equipo.estadio ?? 'Estadio Municipal',
    posicion_liga: 2,
    puntos,
    tasa_victoria,
    goles_favor,
    goles_contra,
  };
}

/**
 * Obtener próximos partidos de un equipo
 */
export async function mockFetchTeamNextMatches(id: number): Promise<{
  id_partido: number;
  fecha: string;
  estado: string;
  id_equipo_local: number;
  id_equipo_visitante: number;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
  goles_local: number | null;
  goles_visitante: number | null;
}[]> {
  await simulateDelay();

  const proximos = partidos
    .filter((p) =>
      (p.id_equipo_local === id || p.id_equipo_visitante === id) &&
      (p.estado === 'programado' || p.estado === 'En Juego')
    )
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  return proximos.map((p) => ({
    id_partido: p.id_partido,
    fecha: p.fecha,
    estado: p.estado,
    id_equipo_local: p.id_equipo_local,
    id_equipo_visitante: p.id_equipo_visitante,
    nombre_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown',
    nombre_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown',
    escudo_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null,
    escudo_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null,
    goles_local: p.goles_local,
    goles_visitante: p.goles_visitante,
  }));
}

/**
 * Obtener últimos partidos de un equipo
 */
export async function mockFetchTeamLastMatches(id: number): Promise<{
  id_partido: number;
  fecha: string;
  estado: string;
  id_equipo_local: number;
  id_equipo_visitante: number;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
  goles_local: number | null;
  goles_visitante: number | null;
  resultado?: 'W' | 'D' | 'L';
}[]> {
  await simulateDelay();

  const ultimos = partidos
    .filter(
      (p) =>
        (p.id_equipo_local === id || p.id_equipo_visitante === id) &&
        p.estado === 'finalizado'
    )
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);

  return ultimos.reverse().map((p) => {
    const esLocal = p.id_equipo_local === id;
    const golesEquipo = esLocal ? (p.goles_local ?? 0) : (p.goles_visitante ?? 0);
    const golesRival = esLocal ? (p.goles_visitante ?? 0) : (p.goles_local ?? 0);
    let resultado: 'W' | 'D' | 'L' | undefined = undefined;
    if (golesEquipo > golesRival) resultado = 'W';
    else if (golesEquipo === golesRival) resultado = 'D';
    else resultado = 'L';

    return {
      id_partido: p.id_partido,
      fecha: p.fecha,
      estado: p.estado,
      id_equipo_local: p.id_equipo_local,
      id_equipo_visitante: p.id_equipo_visitante,
      nombre_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown',
      nombre_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown',
      escudo_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null,
      escudo_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null,
      goles_local: p.goles_local,
      goles_visitante: p.goles_visitante,
      resultado,
    };
  });
}

/**
 * Obtener máximos goleadores de un equipo
 */
export async function mockFetchTeamTopScorers(id: number): Promise<{
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  posicion: string;
  dorsal: number;
  activo: boolean;
  nombre: string;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
}[]> {
  await simulateDelay();

  const jugadoresEquipo = jugadores.filter((j) => j.id_equipo === id && j.activo);
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  // Calcular goles por jugador desde eventos
  const golesPorJugador = new Map<number, number>();
  eventos
    .filter((e) => e.tipo_evento === 'gol' && e.id_jugador !== null)
    .forEach((e) => {
      const jid = e.id_jugador!;
      golesPorJugador.set(jid, (golesPorJugador.get(jid) || 0) + 1);
    });

  return jugadoresEquipo
    .map((j) => ({
      id_jugador: j.id_jugador,
      id_usuario: j.id_usuario,
      id_equipo: j.id_equipo,
      posicion: j.posicion,
      dorsal: j.dorsal,
      activo: j.activo,
      nombre: usuariosMap.get(j.id_usuario)?.nombre ?? `Jugador ${j.id_jugador}`,
      goles: golesPorJugador.get(j.id_jugador) || 0,
      asistencias: 0,
      tarjetas_amarillas: 0,
      tarjetas_rojas: 0,
      partidos_jugados: 0,
    }))
    .sort((a, b) => b.goles - a.goles)
    .slice(0, 3);
}

/**
 * Obtener plantilla completa de un equipo
 */
export async function mockFetchTeamSquad(id: number): Promise<{
  id_jugador: number;
  id_usuario: number;
  id_equipo: number;
  posicion: string;
  dorsal: number;
  activo: boolean;
  nombre: string;
  goles: number;
  asistencias: number;
  tarjetas_amarillas: number;
  tarjetas_rojas: number;
  partidos_jugados: number;
  rating?: number;
}[]> {
  await simulateDelay();

  const jugadoresEquipo = jugadores.filter((j) => j.id_equipo === id && j.activo);
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  return jugadoresEquipo.map((j) => ({
    id_jugador: j.id_jugador,
    id_usuario: j.id_usuario,
    id_equipo: j.id_equipo,
    posicion: j.posicion,
    dorsal: j.dorsal,
    activo: j.activo,
    nombre: usuariosMap.get(j.id_usuario)?.nombre ?? `Jugador ${j.id_jugador}`,
    goles: 0,
    asistencias: 0,
    tarjetas_amarillas: 0,
    tarjetas_rojas: 0,
    partidos_jugados: 0,
    rating: 7.5 + Math.random() * 2, // Rating mock entre 7.5 y 9.5
  }));
}

/**
 * Obtener staff de un equipo
 */
export async function mockFetchTeamStaff(id: number): Promise<{
  entrenador: { id_usuario: number; nombre: string } | null;
  capitan: { id_jugador: number; nombre: string; dorsal: number } | null;
}> {
  await simulateDelay();

  const equipo = equipos.find((e) => e.id_equipo === id);
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  let entrenador = null;
  if (equipo?.id_entrenador) {
    const usuarioEntrenador = usuariosMap.get(equipo.id_entrenador);
    if (usuarioEntrenador) {
      entrenador = {
        id_usuario: usuarioEntrenador.id_usuario,
        nombre: usuarioEntrenador.nombre,
      };
    }
  }

  let capitan = null;
  const primerJugador = jugadores.find((j) => j.id_equipo === id && j.activo);
  if (primerJugador) {
    const usuarioCapitan = usuariosMap.get(primerJugador.id_usuario);
    if (usuarioCapitan) {
      capitan = {
        id_jugador: primerJugador.id_jugador,
        nombre: usuarioCapitan.nombre,
        dorsal: primerJugador.dorsal,
      };
    }
  }

  return { entrenador, capitan };
}

// ============================================
// PARTIDOS / CALENDARIO
// ============================================

/**
 * Obtener partidos de una liga
 */
export async function mockFetchMatchesByLeague(ligaId: number): Promise<MockPartido[]> {
  await simulateDelay();
  return partidos.filter((p) => p.id_liga === ligaId).map((p) => ({ ...p }));
}

/**
 * Obtener partidos de una liga con información de equipos
 */
export async function mockFetchMatchesWithTeams(ligaId: number): Promise<{
  id_partido: number;
  id_liga: number;
  id_jornada: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha: string;
  estado: string;
  created_at: string;
  updated_at: string;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
}[]> {
  await simulateDelay();
  const matches = partidos.filter((p) => p.id_liga === ligaId);

  return matches.map((p) => ({
    ...p,
    nombre_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown',
    nombre_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown',
    escudo_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null,
    escudo_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null,
  }));
}

/**
 * Obtener próximos partidos
 */
export async function mockFetchUpcomingMatches(limit?: number): Promise<{
  id_partido: number;
  id_liga: number;
  id_jornada: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha: string;
  estado: string;
  created_at: string;
  updated_at: string;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
}[]> {
  await simulateDelay();
  const matches = partidos
    .filter((p) => p.estado === 'programado')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, limit || 10);

  return matches.map((p) => ({
    ...p,
    nombre_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown',
    nombre_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown',
    escudo_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null,
    escudo_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null,
  }));
}

/**
 * Obtener partidos en vivo
 */
export async function mockFetchLiveMatches(): Promise<{
  id_partido: number;
  id_liga: number;
  id_jornada: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha: string;
  estado: string;
  created_at: string;
  updated_at: string;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
}[]> {
  await simulateDelay();
  const matches = partidos.filter((p) => p.estado === 'en_vivo');

  return matches.map((p) => ({
    ...p,
    nombre_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown',
    nombre_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown',
    escudo_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null,
    escudo_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null,
  }));
}

/**
 * Obtener un partido por ID
 */
export async function mockFetchMatchById(id: number): Promise<{
  id_partido: number;
  id_liga: number;
  id_jornada: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  goles_local: number | null;
  goles_visitante: number | null;
  fecha: string;
  estado: string;
  created_at: string;
  updated_at: string;
  nombre_equipo_local: string;
  nombre_equipo_visitante: string;
  escudo_equipo_local: string | null;
  escudo_equipo_visitante: string | null;
}> {
  await simulateDelay();
  const partido = partidos.find((p) => p.id_partido === id);
  if (!partido) {
    throw new Error(`Partido con id ${id} no encontrado`);
  }

  return {
    ...partido,
    nombre_equipo_local: equipos.find((e) => e.id_equipo === partido.id_equipo_local)?.nombre ?? 'Unknown',
    nombre_equipo_visitante: equipos.find((e) => e.id_equipo === partido.id_equipo_visitante)?.nombre ?? 'Unknown',
    escudo_equipo_local: equipos.find((e) => e.id_equipo === partido.id_equipo_local)?.escudo ?? null,
    escudo_equipo_visitante: equipos.find((e) => e.id_equipo === partido.id_equipo_visitante)?.escudo ?? null,
  };
}

/**
 * Crear un nuevo partido
 */
export async function mockCreateMatch(data: {
  id_liga: number;
  id_jornada?: number;
  id_equipo_local: number;
  id_equipo_visitante: number;
  fecha: string;
}): Promise<MockPartido> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const nuevoPartido: MockPartido = {
    id_partido: generateId(),
    id_liga: data.id_liga,
    id_jornada: data.id_jornada ?? 1,
    id_equipo_local: data.id_equipo_local,
    id_equipo_visitante: data.id_equipo_visitante,
    goles_local: null,
    goles_visitante: null,
    fecha: data.fecha,
    estado: 'programado',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  partidos.push(nuevoPartido);
  return { ...nuevoPartido };
}

/**
 * Actualizar un partido
 */
export async function mockUpdateMatch(
  id: number,
  data: {
    goles_local?: number;
    goles_visitante?: number;
    estado?: string;
    fecha?: string;
  }
): Promise<MockPartido> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const index = partidos.findIndex((p) => p.id_partido === id);
  if (index === -1) {
    throw new Error(`Partido con id ${id} no encontrado`);
  }

  partidos[index] = {
    ...partidos[index],
    ...(data.goles_local !== undefined && { goles_local: data.goles_local }),
    ...(data.goles_visitante !== undefined && { goles_visitante: data.goles_visitante }),
    ...(data.estado !== undefined && { estado: data.estado }),
    ...(data.fecha !== undefined && { fecha: data.fecha }),
    updated_at: new Date().toISOString(),
  };

  return { ...partidos[index] };
}

/**
 * Obtener partidos agrupados por jornada
 */
export async function mockFetchMatchesByJornada(ligaId: number): Promise<{
  numero: number;
  nombre: string;
  partidos: {
    id_partido: number;
    id_liga: number;
    id_jornada: number;
    id_equipo_local: number;
    id_equipo_visitante: number;
    goles_local: number | null;
    goles_visitante: number | null;
    fecha: string;
    estado: string;
    created_at: string;
    updated_at: string;
    nombre_equipo_local: string;
    nombre_equipo_visitante: string;
    escudo_equipo_local: string | null;
    escudo_equipo_visitante: string | null;
  }[];
}[]> {
  await simulateDelay();

  const matches = partidos.filter((p) => p.id_liga === ligaId);
  const jornadasMap = new Map<number, typeof matches>();

  matches.forEach((p) => {
    const jornada = p.id_jornada || 1;
    if (!jornadasMap.has(jornada)) {
      jornadasMap.set(jornada, []);
    }
    jornadasMap.get(jornada)!.push(p);
  });

  const result: {
    numero: number;
    nombre: string;
    partidos: {
      id_partido: number;
      id_liga: number;
      id_jornada: number;
      id_equipo_local: number;
      id_equipo_visitante: number;
      goles_local: number | null;
      goles_visitante: number | null;
      fecha: string;
      estado: string;
      created_at: string;
      updated_at: string;
      nombre_equipo_local: string;
      nombre_equipo_visitante: string;
      escudo_equipo_local: string | null;
      escudo_equipo_visitante: string | null;
    }[];
  }[] = [];

  jornadasMap.forEach((matches, jornadaNum) => {
    result.push({
      numero: jornadaNum,
      nombre: `Jornada ${jornadaNum}`,
      partidos: matches.map((p) => ({
        ...p,
        nombre_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown',
        nombre_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown',
        escudo_equipo_local: equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null,
        escudo_equipo_visitante: equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null,
      })),
    });
  });

  return result.sort((a, b) => a.numero - b.numero);
}

/**
 * Crear calendario automático
 */
export async function mockCreateCalendar(
  ligaId: number,
  config: { tipo: string; fecha_inicio: string; dias_partido: number[]; hora: string }
): Promise<{ mensaje: string; partidos_creados: number }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  // Simular creación de partidos
  const equiposLiga = equipos.filter((e) => e.id_liga === ligaId);
  const numEquipos = equiposLiga.length;

  if (numEquipos < 2) {
    throw new Error('Se necesitan al menos 2 equipos para crear un calendario');
  }

  // Calcular número de partidos
  let totalPartidos = numEquipos * (numEquipos - 1);
  if (config.tipo === 'ida') {
    totalPartidos = totalPartidos / 2;
  }

  return {
    mensaje: `Calendario creado con ${totalPartidos} partidos`,
    partidos_creados: totalPartidos,
  };
}

// ============================================
// JUGADORES
// ============================================

/**
 * Obtener jugadores de un equipo
 */
export async function mockFetchPlayersByTeam(equipoId: number): Promise<MockJugador[]> {
  await simulateDelay();
  return jugadores.filter((j) => j.id_equipo === equipoId).map((j) => ({ ...j }));
}

/**
 * Obtener un jugador por ID
 */
export async function mockFetchPlayerById(id: number): Promise<MockJugador> {
  await simulateDelay();
  const jugador = jugadores.find((j) => j.id_jugador === id);
  if (!jugador) {
    throw new Error(`Jugador con id ${id} no encontrado`);
  }
  return { ...jugador };
}

// ============================================
// EVENTOS DE PARTIDO
// ============================================

/**
 * Obtener eventos de un partido
 */
export async function mockFetchMatchEvents(partidoId: number): Promise<MockEventoPartido[]> {
  await simulateDelay();
  return eventos.filter((e) => e.id_partido === partidoId).map((e) => ({ ...e }));
}

// ============================================
// FORMACIONES
// ============================================

/**
 * Obtener todas las formaciones disponibles
 */
export async function mockFetchFormations(): Promise<MockFormacion[]> {
  await simulateDelay();
  return formaciones.map((f) => ({ ...f }));
}

/**
 * Obtener una formacion por ID
 */
export async function mockFetchFormationById(id: number): Promise<MockFormacion> {
  await simulateDelay();
  const formacion = formaciones.find((f) => f.id_formacion === id);
  if (!formacion) {
    throw new Error(`Formacion con id ${id} no encontrada`);
  }
  return { ...formacion };
}

// ============================================
// NOTIFICACIONES
// ============================================

/**
 * Obtener notificaciones del usuario actual
 */
export async function mockFetchNotifications(): Promise<MockNotificacion[]> {
  await simulateDelay();
  // Devolver notificaciones del usuario mock (id 1)
  return notificaciones
    .filter((n) => n.id_usuario === 1)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((n) => ({ ...n }));
}

/**
 * Marcar notificacion como leida
 */
export async function mockMarkNotificationAsRead(id: number): Promise<MockNotificacion> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);
  const notificacion = notificaciones.find((n) => n.id_notificacion === id);
  if (!notificacion) {
    throw new Error(`Notificacion con id ${id} no encontrada`);
  }
  notificacion.leido = true;
  return { ...notificacion };
}

/**
 * Marcar todas las notificaciones como leidas
 */
export async function mockMarkAllNotificationsAsRead(): Promise<void> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);
  notificaciones.forEach((n) => {
    n.leido = true;
  });
}

// ============================================
// PUBLIC ENDPOINTS
// ============================================

/**
 * Obtener ligas publicas (sin autenticacion)
 */
export async function mockFetchPublicLeagues(): Promise<MockLiga[]> {
  await simulateDelay();
  return ligas.filter((l) => l.activa).map((l) => ({ ...l }));
}

/**
 * Obtener equipos publicos (sin autenticacion)
 */
export async function mockFetchPublicTeams(): Promise<MockEquipo[]> {
  await simulateDelay();
  return equipos.map((e) => ({ ...e }));
}

/**
 * Obtener partidos publicos (sin autenticacion)
 */
export async function mockFetchPublicMatches(): Promise<MockPartido[]> {
  await simulateDelay();
  return partidos.map((p) => ({ ...p }));
}

// ============================================
// USUARIOS
// ============================================

/**
 * Obtener usuario por ID
 */
export async function mockFetchUserById(id: number): Promise<MockUsuario> {
  await simulateDelay();
  const usuario = usuarios.find((u) => u.id_usuario === id);
  if (!usuario) {
    throw new Error(`Usuario con id ${id} no encontrado`);
  }
  return { ...usuario };
}

/**
 * Obtener todos los usuarios (admin)
 */
export async function mockFetchAllUsers(): Promise<MockUsuario[]> {
  await simulateDelay();
  return usuarios.map((u) => ({ ...u }));
}

// ============================================
// DASHBOARD HELPERS
// ============================================

/**
 * Obtener estadisticas de dashboard para admin
 */
export function mockGetAdminDashboardStats() {
  return {
    equiposRegistrados: 8,
    usuariosTotales: 156,
    partidosProgramados: 12,
  };
}

/**
 * Obtener estadisticas de dashboard para entrenador
 */
export function mockGetCoachDashboardStats() {
  return {
    jugadores: 22,
    partidosJugados: 15,
    victorias: 10,
    goles: 28,
  };
}