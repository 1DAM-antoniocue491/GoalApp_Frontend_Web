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
// PARTIDOS
// ============================================

/**
 * Obtener partidos de una liga
 */
export async function mockFetchMatchesByLeague(ligaId: number): Promise<MockPartido[]> {
  await simulateDelay();
  return partidos.filter((p) => p.id_liga === ligaId).map((p) => ({ ...p }));
}

/**
 * Obtener un partido por ID
 */
export async function mockFetchMatchById(id: number): Promise<MockPartido> {
  await simulateDelay();
  const partido = partidos.find((p) => p.id_partido === id);
  if (!partido) {
    throw new Error(`Partido con id ${id} no encontrado`);
  }
  return { ...partido };
}

/**
 * Obtener partidos en vivo
 */
export async function mockFetchLiveMatches(): Promise<MockPartido[]> {
  await simulateDelay();
  return partidos.filter((p) => p.estado === 'en_vivo').map((p) => ({ ...p }));
}

/**
 * Obtener partidos recientes (finalizados)
 */
export async function mockFetchRecentMatches(limit: number = 5): Promise<MockPartido[]> {
  await simulateDelay();
  return partidos
    .filter((p) => p.estado === 'finalizado')
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit)
    .map((p) => ({ ...p }));
}

/**
 * Obtener proximos partidos
 */
export async function mockFetchUpcomingMatches(limit: number = 5): Promise<MockPartido[]> {
  await simulateDelay();
  return partidos
    .filter((p) => p.estado === 'programado')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, limit)
    .map((p) => ({ ...p }));
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