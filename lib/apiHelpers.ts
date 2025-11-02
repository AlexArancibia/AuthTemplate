import type { AxiosResponse } from 'axios'
import type { PaginationMeta } from '@/types/pagination'

// Función helper para extraer datos de respuestas paginadas
export function extractPaginatedData<T>(response: AxiosResponse): { data: T; pagination: PaginationMeta } {
  // Si la respuesta viene envuelta con success, statusCode, etc.
  if (response.data && 'success' in response.data && 'data' in response.data) {
    const wrappedData = response.data.data
    
    // Caso 1: Si dentro del data envuelto hay data y pagination (formato paginado anidado)
    // { success: true, data: { data: [...], pagination: {...} } }
    if (wrappedData && typeof wrappedData === 'object' && !Array.isArray(wrappedData) && 'data' in wrappedData && 'pagination' in wrappedData) {
      return {
        data: wrappedData.data as T,
        pagination: wrappedData.pagination,
      }
    }
    
    // Caso 2: Si el data envuelto es un array y hay pagination en el nivel superior
    // { success: true, data: [...], pagination: {...} }
    if (Array.isArray(wrappedData) && response.data.pagination && typeof response.data.pagination === 'object') {
      return {
        data: wrappedData as T,
        pagination: response.data.pagination,
      }
    }
    
    // Caso 3: Si el data envuelto es un array sin pagination explícita
    if (Array.isArray(wrappedData)) {
      return {
        data: wrappedData as T,
        pagination: {
          page: 1,
          limit: wrappedData.length,
          total: wrappedData.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }
    }
  }
  
  // Si la respuesta ya tiene el formato correcto (data y pagination directamente)
  // { data: [...], pagination: {...} }
  if (response.data && 'data' in response.data && 'pagination' in response.data) {
    return {
      data: response.data.data as T,
      pagination: response.data.pagination,
    }
  }
  
  // Si es un formato legacy sin paginación, adaptarlo
  const dataArray = response.data && 'success' in response.data && 'data' in response.data 
    ? response.data.data 
    : response.data
    
  return {
    data: (Array.isArray(dataArray) ? dataArray : []) as T,
    pagination: {
      page: 1,
      limit: 100,
      total: Array.isArray(dataArray) ? dataArray.length : 0,
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

