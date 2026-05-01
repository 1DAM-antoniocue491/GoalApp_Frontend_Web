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
  MockNotificacion,
  MockLoginResponse,
  MockLigaConRol,
  MockLigaSeguida,
  MockCreateLeagueResult,
  MockSeguimientoResponse,
  MockDejarSeguirResponse,
  MockTopScorer,
  MockMatchdayMVP,
  MockTeamGoals,
  MockPlayerStats,
  MockRol,
  MockUserWithRole,
  MockInviteUserPayload,
  MockTeamResponse,
  MockMiembroEquipo,
  MockDelegado,
  MockMiembroEstado,
  MockConvocatoria,
  MockJugadorConvocatoria,
} from './types';

// Importar datos mock desde JSON
import usuariosData from './data/usuarios.json';
import ligasData from './data/ligas.json';
import equiposData from './data/equipos.json';
import jugadoresData from './data/jugadores.json';
import partidosData from './data/partidos.json';
import eventosData from './data/eventos_partido.json';
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

  // El usuario mock esta en las primeras 4 ligas con distintos roles
  // Se incluye rol 'observador' para probar el caso sin badge
  const roles: Record<number, string> = {
    1: 'admin',
    2: 'entrenador',
    3: 'delegado',
    4: 'observador', // Cambiado a observador para probar el caso sin badge
  };

  // Contar equipos por liga
  const equiposPorLiga = new Map<number, number>();
  equipos.forEach((eq) => {
    equiposPorLiga.set(eq.id_liga, (equiposPorLiga.get(eq.id_liga) || 0) + 1);
  });

  return ligas
    .filter((liga) => liga.id_liga <= 4)
    .map((liga) => ({
      id_liga: liga.id_liga,
      nombre: liga.nombre,
      temporada: liga.temporada,
      activa: liga.activa,
      rol: roles[liga.id_liga] || 'jugador',
      equipos_total: equiposPorLiga.get(liga.id_liga) || 0,
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
 * Obtener equipos de una liga (devuelve MockEquipo[])
 */
export async function mockFetchTeamsByLeague(ligaId: number): Promise<MockEquipo[]> {
  await simulateDelay();
  return equipos.filter((e) => e.id_liga === ligaId).map((e) => ({ ...e }));
}

/**
 * Obtener equipos de una liga (devuelve MockTeamResponse[])
 * Función específica para usersApi que necesita formato diferente
 */
export async function mockFetchTeamsByLeagueForUsers(ligaId: number): Promise<MockTeamResponse[]> {
  await simulateDelay();
  return equipos.filter((e) => e.id_liga === ligaId).map((e) => ({
    id_equipo: e.id_equipo,
    nombre: e.nombre,
    escudo: e.escudo ?? null,
    colores: null,
    id_liga: e.id_liga,
    id_entrenador: 1,
    id_delegado: 1,
    created_at: e.created_at,
    updated_at: e.updated_at,
  }));
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
 * Actualizar un equipo existente
 */
export async function mockUpdateTeam(
  id: number,
  data: { nombre?: string; ciudad?: string; estadio?: string; escudo?: string; colores?: string }
): Promise<MockEquipo> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const index = equipos.findIndex((e) => e.id_equipo === id);
  if (index === -1) {
    throw new Error(`Equipo con id ${id} no encontrado`);
  }

  equipos[index] = {
    ...equipos[index],
    ...(data.nombre !== undefined && { nombre: data.nombre }),
    ...(data.ciudad !== undefined && { ciudad: data.ciudad }),
    ...(data.estadio !== undefined && { estadio: data.estadio }),
    ...(data.escudo !== undefined && { escudo: data.escudo }),
    ...(data.colores !== undefined && { colores: data.colores }),
    updated_at: new Date().toISOString(),
  };

  return { ...equipos[index] };
}

/**
 * Eliminar un equipo
 */
export async function mockDeleteTeam(id: number): Promise<void> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const index = equipos.findIndex((e) => e.id_equipo === id);
  if (index === -1) {
    throw new Error(`Equipo con id ${id} no encontrado`);
  }

  equipos.splice(index, 1);
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
    // Usar nombre directo si existe, sino buscar en equipos
    nombre_equipo_local: p.nombre_equipo_local || (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown'),
    nombre_equipo_visitante: p.nombre_equipo_visitante || (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown'),
    escudo_equipo_local: p.escudo_equipo_local ?? (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null),
    escudo_equipo_visitante: p.escudo_equipo_visitante ?? (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null),
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
    .filter((p) => p.estado.toLowerCase() === 'programado')
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, limit || 10);

  return matches.map((p) => ({
    ...p,
    nombre_equipo_local: p.nombre_equipo_local || (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown'),
    nombre_equipo_visitante: p.nombre_equipo_visitante || (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown'),
    escudo_equipo_local: p.escudo_equipo_local ?? (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null),
    escudo_equipo_visitante: p.escudo_equipo_visitante ?? (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null),
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
  const matches = partidos.filter((p) => p.estado.toLowerCase() === 'en juego');

  return matches.map((p) => ({
    ...p,
    nombre_equipo_local: p.nombre_equipo_local || (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown'),
    nombre_equipo_visitante: p.nombre_equipo_visitante || (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown'),
    escudo_equipo_local: p.escudo_equipo_local ?? (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null),
    escudo_equipo_visitante: p.escudo_equipo_visitante ?? (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null),
  }));
}

/**
 * Obtener resultados recientes (partidos finalizados)
 */
export async function mockFetchRecentMatches(limit?: number): Promise<{
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
    .filter((p) => p.estado.toLowerCase() === 'finalizado')
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, limit || 5);

  return matches.map((p) => ({
    ...p,
    nombre_equipo_local: p.nombre_equipo_local || (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.nombre ?? 'Unknown'),
    nombre_equipo_visitante: p.nombre_equipo_visitante || (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.nombre ?? 'Unknown'),
    escudo_equipo_local: p.escudo_equipo_local ?? (equipos.find((e) => e.id_equipo === p.id_equipo_local)?.escudo ?? null),
    escudo_equipo_visitante: p.escudo_equipo_visitante ?? (equipos.find((e) => e.id_equipo === p.id_equipo_visitante)?.escudo ?? null),
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
 * Iniciar un partido (cambiar estado a 'En Juego')
 */
export async function mockStartMatch(id: number): Promise<MockPartido> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const index = partidos.findIndex((p) => p.id_partido === id);
  if (index === -1) {
    throw new Error(`Partido con id ${id} no encontrado`);
  }

  partidos[index] = {
    ...partidos[index],
    estado: 'En Juego',
    updated_at: new Date().toISOString(),
  };

  return { ...partidos[index] };
}

/**
 * Finalizar un partido registrando resultado y MVP
 */
export async function mockFinishMatch(
  id: number,
  data: {
    goles_local: number;
    goles_visitante: number;
    id_mvp: number;
    puntuacion_mvp: number;
    incidencias?: string;
  }
): Promise<MockPartido> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  const index = partidos.findIndex((p) => p.id_partido === id);
  if (index === -1) {
    throw new Error(`Partido con id ${id} no encontrado`);
  }

  partidos[index] = {
    ...partidos[index],
    goles_local: data.goles_local,
    goles_visitante: data.goles_visitante,
    estado: 'Finalizado',
    updated_at: new Date().toISOString(),
  };

  // Registrar evento MVP en la tabla de eventos
  const mvpEvento = {
    id_evento: generateId(),
    id_partido: id,
    id_jugador: data.id_mvp,
    tipo_evento: 'mvp' as const,
    minuto: 90,
    puntuacion_mvp: data.puntuacion_mvp,
    incidencias: data.incidencias || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  eventos.push(mvpEvento);

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

/**
 * Obtener configuración del calendario automático
 */
export async function mockFetchCalendarConfig(
  ligaId: number
): Promise<{ tipo: string; fecha_inicio: string; dias_partido: number[]; hora: string }> {
  await simulateDelay();

  // Simular configuración guardada
  return {
    tipo: 'ida_vuelta',
    fecha_inicio: '2026-05-01',
    dias_partido: [1, 3, 5],
    hora: '16:00',
  };
}

/**
 * Eliminar calendario automático completo
 */
export async function mockDeleteCalendar(ligaId: number): Promise<{
  mensaje: string;
  partidos_eliminados: number;
  jornadas_eliminadas: number;
}> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  // Simular eliminación
  const partidosLiga = partidos.filter((p) => p.id_liga === ligaId);

  return {
    mensaje: 'Calendario eliminado correctamente',
    partidos_eliminados: partidosLiga.length,
    jornadas_eliminadas: Math.ceil(partidosLiga.length / 4),
  };
}

/**
 * Actualizar calendario automático (regenerar)
 */
export async function mockUpdateCalendar(
  ligaId: number,
  config: { tipo: string; fecha_inicio: string; dias_partido: number[]; hora: string }
): Promise<{ mensaje: string; partidos_creados: number; partidos_eliminados: number }> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  // Simular actualización
  const equiposLiga = equipos.filter((e) => e.id_liga === ligaId);
  const numEquipos = equiposLiga.length;
  const partidosLiga = partidos.filter((p) => p.id_liga === ligaId);

  // Calcular número de partidos
  let totalPartidos = numEquipos * (numEquipos - 1);
  if (config.tipo === 'ida') {
    totalPartidos = totalPartidos / 2;
  }

  return {
    mensaje: 'Calendario actualizado correctamente',
    partidos_creados: totalPartidos,
    partidos_eliminados: partidosLiga.length,
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

/**
 * Crear un nuevo evento en un partido
 */
export async function mockCreateMatchEvent(
  partidoId: number,
  event: {
    id_jugador: number;
    tipo_evento: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio';
    minuto: number;
    id_jugador_sale?: number;
    incidencias?: string;
  }
): Promise<MockEventoPartido> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);

  // Buscar el jugador para obtener su nombre y equipo
  const jugador = jugadores.find((j) => j.id_jugador === event.id_jugador);
  if (!jugador) {
    throw new Error(`Jugador con id ${event.id_jugador} no encontrado`);
  }

  const equipo = equipos.find((e) => e.id_equipo === jugador.id_equipo);
  if (!equipo) {
    throw new Error(`Equipo con id ${jugador.id_equipo} no encontrado`);
  }

  const nuevoEvento: MockEventoPartido = {
    id_evento: generateId(),
    id_partido: partidoId,
    tipo: event.tipo_evento,
    minuto: event.minuto,
    id_jugador: event.id_jugador,
    nombre_jugador: jugador.nombre,
    id_equipo: jugador.id_equipo,
    nombre_equipo: equipo.nombre,
    detalle: event.incidencias || '',
  };

  eventos.push(nuevoEvento);
  return { ...nuevoEvento };
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

// ============================================
// ESTADÍSTICAS
// ============================================

/**
 * Obtener estadísticas generales de la temporada
 */
export async function mockFetchSeasonStats(ligaId: number): Promise<{
  total_partidos: number;
  total_goles: number;
  promedio_goles_por_partido: number;
  total_amarillas: number;
  total_rojas: number;
  total_asistencias: number;
  equipos_participantes: number;
  jugadores_registrados: number;
}> {
  await simulateDelay();

  const partidosLiga = partidos.filter((p) => p.id_liga === ligaId);
  const eventosGol = eventos.filter((e) => e.tipo_evento === 'gol');
  const eventosAmarilla = eventos.filter((e) => e.tipo_evento === 'tarjeta_amarilla');
  const eventosRojas = eventos.filter((e) => e.tipo_evento === 'tarjeta_roja');
  const eventosAsistencia = eventos.filter((e) => e.tipo_evento === 'asistencia');
  const equiposLiga = equipos.filter((e) => e.id_liga === ligaId);
  const jugadoresLiga = jugadores.filter((j) => equipos.find((eq) => eq.id_equipo === j.id_equipo)?.id_liga === ligaId);

  let totalGoles = 0;
  eventosGol.forEach((e) => {
    if (e.id_partido !== null) {
      const partido = partidos.find((p) => p.id_partido === e.id_partido);
      if (partido && partido.id_liga === ligaId) {
        totalGoles++;
      }
    }
  });

  return {
    total_partidos: partidosLiga.length,
    total_goles: totalGoles,
    promedio_goles_por_partido: partidosLiga.length > 0 ? (totalGoles / partidosLiga.length).toFixed(1) : 0,
    total_amarillas: eventosAmarilla.length,
    total_rojas: eventosRojas.length,
    total_asistencias: eventosAsistencia.length,
    equipos_participantes: equiposLiga.length,
    jugadores_registrados: jugadoresLiga.length,
  };
}

/**
 * Obtener top goleadores de la liga
 */
export async function mockFetchTopScorers(
  ligaId: number,
  limit: number = 5
): Promise<MockTopScorer[]> {
  await simulateDelay();

  const eventosGol = eventos.filter((e) => e.tipo_evento === 'gol');
  const golesPorJugador = new Map<number, number>();

  eventosGol.forEach((e) => {
    if (e.id_jugador !== null) {
      const existencia = golesPorJugador.get(e.id_jugador);
      golesPorJugador.set(e.id_jugador, existencia ? existencia + 1 : 1);
    }
  });

  const jugadoresLiga = jugadores.filter((j) =>
    equipos.find((eq) => eq.id_equipo === j.id_equipo)?.id_liga === ligaId
  );

  return jugadoresLiga
    .map((j) => ({
      id_jugador: j.id_jugador,
      id_usuario: j.id_usuario,
      id_equipo: j.id_equipo,
      nombre: usuarios.find((u) => u.id_usuario === j.id_usuario)?.nombre ?? `Jugador ${j.id_jugador}`,
      nombre_equipo: equipos.find((e) => e.id_equipo === j.id_equipo)?.nombre ?? 'Unknown',
      escudo_equipo: equipos.find((e) => e.id_equipo === j.id_equipo)?.escudo ?? null,
      goles: golesPorJugador.get(j.id_jugador) || 0,
      partidos_jugados: Math.floor(Math.random() * 10) + 1,
      promedio_goles: (golesPorJugador.get(j.id_jugador) || 0) > 0 ? (golesPorJugador.get(j.id_jugador)! / (Math.floor(Math.random() * 10) + 1)).toFixed(2) : '0.00',
    }))
    .sort((a, b) => b.goles - a.goles)
    .slice(0, limit);
}

/**
 * Obtener MVP de la jornada
 */
export async function mockFetchMatchdayMVP(ligaId: number): Promise<MockMatchdayMVP | null> {
  await simulateDelay();

  const eventosMVP = eventos.filter((e) => e.tipo_evento === 'mvp');
  const mvpEvento = eventosMVP.find((e) => {
    const partido = partidos.find((p) => p.id_partido === e.id_partido);
    return partido?.id_liga === ligaId;
  });

  if (!mvpEvento || mvpEvento.id_jugador === null) {
    return null;
  }

  const jugador = jugadores.find((j) => j.id_jugador === mvpEvento.id_jugador);
  if (!jugador) return null;

  const equipo = equipos.find((e) => e.id_equipo === jugador.id_equipo);
  if (!equipo) return null;

  return {
    id_jugador: mvpEvento.id_jugador,
    id_usuario: jugador.id_usuario,
    nombre: usuarios.find((u) => u.id_usuario === jugador.id_usuario)?.nombre ?? `Jugador ${jugador.id_jugador}`,
    nombre_equipo: equipo.nombre,
    escudo_equipo: equipo.escudo ?? null,
    rating: mvpEvento.puntuacion_mvp ?? 8.5,
    goles: 0,
    asistencias: 0,
    jornada: 1,
  };
}

/**
 * Obtener estadísticas de goles por equipo
 */
export async function mockFetchTeamGoalsStats(ligaId: number): Promise<MockTeamGoals[]> {
  await simulateDelay();

  const equiposLiga = equipos.filter((e) => e.id_liga === ligaId);
  const partidosLiga = partidos.filter((p) => p.id_liga === ligaId);

  const resultados = equiposLiga.map((equipo) => {
    let golesFavor = 0, golesContra = 0, partidosJugados = 0;

    partidosLiga.forEach((p) => {
      if (p.id_equipo_local === equipo.id_equipo || p.id_equipo_visitante === equipo.id_equipo) {
        partidosJugados++;
        if (p.id_equipo_local === equipo.id_equipo && p.goles_local !== null) {
          golesFavor += p.goles_local;
        } else if (p.id_equipo_visitante === equipo.id_equipo && p.goles_visitante !== null) {
          golesFavor += p.goles_visitante;
        }

        if (p.id_equipo_local === equipo.id_equipo && p.goles_visitante !== null) {
          golesContra += p.goles_visitante;
        } else if (p.id_equipo_visitante === equipo.id_equipo && p.goles_local !== null) {
          golesContra += p.goles_local;
        }
      }
    });

    return {
      id_equipo: equipo.id_equipo,
      nombre: equipo.nombre,
      escudo: equipo.escudo ?? null,
      goles_favor: golesFavor,
      goles_contra: golesContra,
      diferencia_goles: golesFavor - golesContra,
      promedio_goles_favor: partidosJugados > 0 ? (golesFavor / partidosJugados).toFixed(2) : '0.00',
      partidos_jugados: partidosJugados,
    };
  });

  return resultados.sort((a, b) => b.diferencia_goles - a.diferencia_goles);
}

/**
 * Obtener estadísticas personales de un jugador
 */
export async function mockFetchPlayerPersonalStats(
  ligaId: number,
  usuarioId: number
): Promise<MockPlayerStats | null> {
  await simulateDelay();

  const jugador = jugadores.find((j) => j.id_usuario === usuarioId);
  if (!jugador) return null;

  const equipo = equipos.find((e) => e.id_equipo === jugador.id_equipo);
  if (!equipo || equipo.id_liga !== ligaId) return null;

  const eventosGol = eventos.filter((e) => e.tipo_evento === 'gol' && e.id_jugador === jugador.id_jugador);
  const eventosAmarilla = eventos.filter((e) => e.tipo_evento === 'tarjeta_amarilla' && e.id_jugador === jugador.id_jugador);
  const eventosRojas = eventos.filter((e) => e.tipo_evento === 'tarjeta_roja' && e.id_jugador === jugador.id_jugador);

  return {
    id_jugador: jugador.id_jugador,
    id_usuario: usuarioId,
    nombre: usuarios.find((u) => u.id_usuario === usuarioId)?.nombre ?? `Usuario ${usuarioId}`,
    nombre_equipo: equipo.nombre,
    escudo_equipo: equipo.escudo ?? null,
    goles: eventosGol.length,
    asistencias: 0,
    tarjetas_amarillas: eventosAmarilla.length,
    tarjetas_rojas: eventosRojas.length,
    partidos_jugados: Math.floor(Math.random() * 10) + 1,
    veces_mvp: eventos.filter((e) => e.tipo_evento === 'mvp' && e.id_jugador === jugador.id_jugador).length,
  };
}

// ============================================
// USUARIOS
// ============================================

/**
 * Obtener todos los roles disponibles
 */
export async function mockFetchRoles(): Promise<MockRol[]> {
  await simulateDelay();
  return [
    { id_rol: 1, nombre: 'admin', descripcion: 'Administrador del sistema' },
    { id_rol: 2, nombre: 'entrenador', descripcion: 'Entrenador de equipo' },
    { id_rol: 3, nombre: 'delegado', descripcion: 'Delegado de partido' },
    { id_rol: 4, nombre: 'jugador', descripcion: 'Jugador de equipo' },
    { id_rol: 5, nombre: 'observador', descripcion: 'Observador' },
  ];
}

/**
 * Obtener equipos de una liga (devuelve MockTeamResponse[])
 * Función específica para usersApi que necesita formato diferente
 * Ya definida en la línea 549, solo necesitamos exportarla aquí
 */

/**
 * Obtener usuarios con rol en una liga
 */
export async function mockFetchUsersByLeague(ligaId: number): Promise<MockUserWithRole[]> {
  await simulateDelay();

  const usuariosLiga = usuarios.filter(() => true);
  const roles: Record<number, string> = {
    1: 'admin',
    2: 'entrenador',
    3: 'delegado',
    4: 'jugador',
    5: 'observador',
  };

  return usuariosLiga
    .filter((u) => u.activo)
    .map((u) => ({
      id_usuario: u.id_usuario,
      nombre: u.nombre,
      email: u.email,
      id_rol: u.roles[0]?.id_rol || 5,
      rol: roles[u.roles[0]?.id_rol || 5] as UserRole,
      activo: u.activo,
      created_at: u.created_at || new Date().toISOString(),
    }))
    .slice(0, 10);
}

/**
 * Invitar usuario a una liga (mock vacío - no modifica datos)
 */
export async function mockInviteUser(_payload: { email: string; liga_id: number; id_rol: number; nombre?: string; id_equipo?: number; dorsal?: number; posicion?: string; tipo_jugador?: string }): Promise<void> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);
}

// ============================================
// MIEMBROS DE LIGA
// ============================================

/**
 * Obtener todos los usuarios de una liga (memberApi)
 */
export async function mockFetchUsuariosLiga(ligaId: number): Promise<MockUsuarioLiga[]> {
  await simulateDelay();

  const usuariosLiga = usuarios.filter(() => true);
  const roles: Record<number, string> = {
    1: 'admin',
    2: 'entrenador',
    3: 'delegado',
    4: 'jugador',
    5: 'observador',
  };

  return usuariosLiga
    .slice(0, 10)
    .map((u) => ({
      id_usuario_rol: u.id_usuario,
      id_usuario: u.id_usuario,
      nombre_usuario: u.nombre,
      email: u.email,
      id_rol: u.roles[0]?.id_rol || 5,
      nombre_rol: roles[u.roles[0]?.id_rol || 5],
      activo: u.activo,
    }));
}

/**
 * Actualizar el rol de un usuario en una liga
 */
export async function mockUpdateUsuarioRol(
  _ligaId: number,
  _usuarioId: number,
  _payload: { id_rol: number }
): Promise<MockUsuarioLiga> {
  await simulateDelay();
  return {
    id_usuario_rol: 1,
    id_usuario: 1,
    nombre_usuario: 'Usuario Mock',
    email: 'mock@email.com',
    id_rol: 1,
    nombre_rol: 'admin',
    activo: true,
  };
}

/**
 * Actualizar el estado (activo/pendiente) de un usuario
 */
export async function mockUpdateUsuarioEstado(
  _ligaId: number,
  _usuarioId: number,
  _payload: { activo: boolean }
): Promise<MockUsuarioLiga> {
  await simulateDelay();
  return {
    id_usuario_rol: 1,
    id_usuario: 1,
    nombre_usuario: 'Usuario Mock',
    email: 'mock@email.com',
    id_rol: 1,
    nombre_rol: 'admin',
    activo: true,
  };
}

/**
 * Eliminar un usuario de una liga
 */
export async function mockDeleteUsuarioLiga(
  _ligaId: number,
  _usuarioId: number
): Promise<{ mensaje: string }> {
  await simulateDelay();
  return { mensaje: 'Usuario eliminado correctamente' };
}

// ============================================
// MIEMBROS DE EQUIPO
// ============================================

/**
 * Obtener todos los miembros del equipo
 */
export async function mockFetchMiembrosEquipo(equipoId: number): Promise<MockMiembroEquipo[]> {
  await simulateDelay();

  const equipo = equipos.find((e) => e.id_equipo === equipoId);
  if (!equipo) {
    throw new Error(`Equipo con id ${equipoId} no encontrado`);
  }

  const jugadoresEquipo = jugadores.filter((j) => j.id_equipo === equipoId);
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  return jugadoresEquipo.map((j) => ({
    id_miembro: j.id_jugador,
    id_usuario: j.id_usuario,
    tipo: j.posicion ? 'jugador' : 'delegado',
    nombre: usuariosMap.get(j.id_usuario)?.nombre ?? `Jugador ${j.id_jugador}`,
    email: usuariosMap.get(j.id_usuario)?.email ?? `jugador${j.id_jugador}@email.com`,
    activo: j.activo,
    posicion: j.posicion ?? undefined,
    dorsal: j.dorsal ?? undefined,
  }));
}

/**
 * Asignar delegado al equipo
 */
export async function mockAsignarDelegado(
  _equipoId: number,
  _idUsuario: number
): Promise<MockDelegado> {
  await simulateDelay();
  return {
    id_usuario: 1,
    nombre: 'Carlos García',
    email: 'carlos.garcia@email.com',
  };
}

/**
 * Actualizar estado de un miembro (activo/inactivo)
 */
export async function mockUpdateMiembroEstado(
  _equipoId: number,
  _usuarioId: number,
  _activo: boolean
): Promise<MockMiembroEstado> {
  await simulateDelay();
  return {
    id_usuario: 1,
    nombre: 'Carlos García',
    activo: true,
  };
}

/**
 * Eliminar un miembro del equipo
 */
export async function mockDeleteMiembroEquipo(
  _equipoId: number,
  _usuarioId: number
): Promise<{ mensaje: string }> {
  await simulateDelay();
  return { mensaje: 'Miembro eliminado correctamente' };
}

// ============================================
// CONVOCATORIA
// ============================================

/**
 * Obtiene la convocatoria de un equipo para un partido específico
 */
export async function mockFetchConvocatoria(
  partidoId: number,
  equipoId: number
): Promise<MockConvocatoria> {
  await simulateDelay();

  const partidosConvocatoria = partidos.filter(
    (p) => p.id_partido === partidoId && (p.id_equipo_local === equipoId || p.id_equipo_visitante === equipoId)
  );

  if (partidosConvocatoria.length === 0) {
    throw new Error(`Partido con id ${partidoId} o equipo con id ${equipoId} no encontrado`);
  }

  const jugadoresEquipo = jugadores.filter((j) => j.id_equipo === equipoId);
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  const convocatoria: MockConvocatoria = {
    id_convocatoria: generateId(),
    id_partido: partidoId,
    id_equipo: equipoId,
    fecha_convocatoria: new Date().toISOString(),
    estado: 'cerrada',
    jugadores: jugadoresEquipo
      .filter((j) => j.activo)
      .slice(0, 18)
      .map((j): MockJugadorConvocatoria => ({
        id_jugador: j.id_jugador,
        id_usuario: j.id_usuario,
        id_equipo: j.id_equipo,
        nombre: usuariosMap.get(j.id_usuario)?.nombre ?? `Jugador ${j.id_jugador}`,
        posicion: j.posicion || 'default',
        dorsal: j.dorsal || 0,
        estado: 'convocado',
        email: usuariosMap.get(j.id_usuario)?.email ?? '',
      })),
  };

  return convocatoria;
}

/**
 * Obtiene todos los jugadores de un equipo
 */
export async function mockFetchJugadoresPorEquipo(equipoId: number): Promise<MockJugadorConvocatoria[]> {
  await simulateDelay();

  const jugadoresEquipo = jugadores.filter((j) => j.id_equipo === equipoId);
  const usuariosMap = new Map(usuarios.map((u) => [u.id_usuario, u]));

  return jugadoresEquipo.map((j) => ({
    id_jugador: j.id_jugador,
    id_usuario: j.id_usuario,
    id_equipo: j.id_equipo,
    nombre: usuariosMap.get(j.id_usuario)?.nombre ?? `Jugador ${j.id_jugador}`,
    posicion: j.posicion || 'default',
    dorsal: j.dorsal || 0,
    estado: j.activo ? 'convocado' : 'baja',
    email: usuariosMap.get(j.id_usuario)?.email ?? '',
  }));
}

/**
 * Crea o actualiza una convocatoria
 */
export async function mockCreateConvocatoria(_payload: {
  id_partido: number;
  id_equipo: number;
  jugadores: { id_jugador: number; estado: string }[];
}): Promise<void> {
  await simulateDelay(MOCK_WRITE_DELAY_MS);
}

/**
 * Elimina la convocatoria de un partido
 */
export async function mockDeleteConvocatoria(_partidoId: number): Promise<void> {
  await simulateDelay();
}