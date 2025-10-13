import type { AxiosResponse } from 'axios'
import type { PaginationMeta } from '@/types/pagination'

// Función helper para extraer datos de respuestas paginadas
export function extractPaginatedData<T>(response: AxiosResponse): { data: T; pagination: PaginationMeta } {
  // Si la respuesta ya tiene el formato correcto, devolverla directamente
  if (response.data && 'data' in response.data && 'pagination' in response.data) {
    return {
      data: response.data.data as T,
      pagination: response.data.pagination,
    }
  }
  
  // Si es un formato legacy sin paginación, adaptarlo
  return {
    data: (Array.isArray(response.data) ? response.data : []) as T,
    pagination: {
      page: 1,
      limit: 100,
      total: Array.isArray(response.data) ? response.data.length : 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  }
}

// Función helper para extraer datos simples de respuestas envueltas
export function extractApiData<T>(response: AxiosResponse): T {
  // Si la respuesta tiene el formato envuelto estándar
  if (response.data && 'data' in response.data && 'success' in response.data) {
    return response.data.data
  }
  
  // Si es un formato legacy, devolver directamente
  return response.data
}

// Función helper para manejar errores de API
export function handleApiError(error: any): never {
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message)
  }
  
  if (error.message) {
    throw new Error(error.message)
  }
  
  throw new Error('An unexpected error occurred')
}

