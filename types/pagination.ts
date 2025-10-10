// Tipos para paginación - matching backend structure

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Valid sort options for products
export type ProductSortBy = 'createdAt' | 'updatedAt' | 'title' | 'price' | 'viewCount'

// Parámetros específicos para búsqueda de categorías
export interface SearchCategoryParams extends PaginationParams {
  query?: string
  parentId?: string | null
}

// Parámetros específicos para búsqueda de productos
export interface SearchProductParams extends Omit<PaginationParams, 'sortBy'> {
  query?: string
  categorySlugs?: string[]  // Slugs de categorías separados por comas en el backend
  collectionIds?: string[]  // IDs de colecciones separados por comas en el backend
  minPrice?: number
  maxPrice?: number
  currencyId?: string  // ID de la moneda para filtrar por precio
  inStock?: boolean
  sortBy?: ProductSortBy
}

// Parámetros específicos para búsqueda de órdenes
export interface SearchOrderParams extends PaginationParams {
  query?: string
  status?: string
  customerEmail?: string
  startDate?: string
  endDate?: string
}

// Parámetros específicos para búsqueda de cupones
export interface SearchCouponParams extends PaginationParams {
  query?: string
  type?: string
  isActive?: boolean
}

// Parámetros específicos para búsqueda de contenido
export interface SearchContentParams extends PaginationParams {
  query?: string
  type?: string
  isPublished?: boolean
}

// Parámetros específicos para búsqueda de colecciones
export interface SearchCollectionParams extends PaginationParams {
  query?: string
  includeInactive?: boolean
}

// Parámetros específicos para búsqueda de currencies
export interface SearchCurrencyParams extends PaginationParams {
  query?: string
  includeInactive?: boolean
}

// Parámetros específicos para búsqueda de exchange rates
export interface SearchExchangeRateParams extends PaginationParams {
  fromCurrencyId?: string
  toCurrencyId?: string
}

// Parámetros específicos para búsqueda de hero sections
export interface SearchHeroSectionParams extends PaginationParams {
  includeInactive?: boolean
}

// Parámetros específicos para búsqueda de FBT
export interface SearchFbtParams extends PaginationParams {
  query?: string
}

// Parámetros específicos para búsqueda de shipping methods
export interface SearchShippingMethodParams extends PaginationParams {
  query?: string
}

// Parámetros específicos para búsqueda de payment transactions
export interface SearchPaymentTransactionParams extends PaginationParams {
  status?: string
}

