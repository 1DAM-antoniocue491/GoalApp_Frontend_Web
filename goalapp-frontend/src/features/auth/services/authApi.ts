// API base URL
const API_URL = 'http://localhost:8000/api/v1';

// Tipos
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  fecha_nacimiento?: string;
  rol_principal?: string;
}

/**
 * Iniciar sesión
 * Llama al endpoint /auth/login con form-data (OAuth2PasswordRequestForm)
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Error al iniciar sesión');
  }

  return response.json();
}

/**
 * Obtener información del usuario actual
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener usuario');
  }

  return response.json();
}

/**
 * Cerrar sesión
 */
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Guardar token
 */
export function saveToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Obtener token
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Verificar si está autenticado
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}