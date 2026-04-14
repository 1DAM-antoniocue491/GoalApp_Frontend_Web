/**
 * Tipos comunes y utilitarios para GoalApp
 * Proporciona wrappers genéricos para respuestas API y paginación
 */

/**
 * Respuesta estándar de la API
 * @template T - Tipo de datos contenidos en la respuesta
 */
export interface ApiResponse<T> {
  /** Indica si la petición fue exitosa */
  success: boolean
  /** Datos de la respuesta */
  data: T
  /** Mensaje descriptivo de la operación */
  message?: string
  /** Timestamp de la respuesta */
  timestamp?: string
}

/**
 * Respuesta paginada para listas extensas
 * @template T - Tipo de elementos en la página
 */
export interface PaginatedResponse<T> {
  /** Lista de elementos de la página actual */
  data: T[]
  /** Número de página actual (base 1) */
  page: number
  /** Cantidad de elementos por página */
  limit: number
  /** Total de elementos disponibles */
  total: number
  /** Total de páginas disponibles */
  totalPages: number
  /** Indica si hay página siguiente */
  hasNext: boolean
  /** Indica si hay página anterior */
  hasPrev: boolean
}

/**
 * Parámetros de paginación para peticiones
 */
export interface PaginationParams {
  /** Número de página (base 1) */
  page?: number
  /** Elementos por página */
  limit?: number
  /** Campo por el que ordenar */
  sortBy?: string
  /** Dirección de ordenamiento: asc o desc */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Parámetros de filtrado base
 */
export interface BaseFilterParams extends PaginationParams {
  /** Filtrar por estado activo/inactivo */
  activo?: boolean
  /** Búsqueda por texto */
  search?: string
}

/**
 * Resultado de operación de eliminación
 */
export interface DeleteResult {
  /** ID del elemento eliminado */
  id: number | string
  /** Indica si la eliminación fue exitosa */
  deleted: boolean
  /** Mensaje descriptivo */
  message?: string
}

/**
 * Metadata de respuesta
 */
export interface ResponseMeta {
  /** Tiempo de procesamiento en ms */
  processingTime?: number
  /** Versión de la API */
  apiVersion?: string
  /** ID de request para trazabilidad */
  requestId?: string
}

/**
 * Respuesta API con metadata
 * @template T - Tipo de datos
 */
export interface ApiResponseWithMeta<T> extends ApiResponse<T> {
  meta?: ResponseMeta
}

/**
 * Tipo para IDs que pueden ser number o string
 */
export type EntityId = number | string

/**
 * Interfaz base para entidades con ID
 */
export interface BaseEntity {
  id: EntityId
}

/**
 * Interfaz para entidades con timestamps
 */
export interface TimestampedEntity extends BaseEntity {
  created_at: string
  updated_at?: string
}

/**
 * Interfaz para entidades con estado activo
 */
export interface ActivableEntity extends BaseEntity {
  activo: boolean
}