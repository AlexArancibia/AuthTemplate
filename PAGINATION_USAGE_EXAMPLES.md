pn# Ejemplos de Uso de Paginación en Componentes

Este documento proporciona ejemplos prácticos de cómo usar el sistema de paginación actualizado en componentes React.

## Tabla de Contenidos
1. [Uso Básico](#uso-básico)
2. [Uso con Búsqueda](#uso-con-búsqueda)
3. [Uso con Filtros](#uso-con-filtros)
4. [Componente de Paginación Completo](#componente-de-paginación-completo)
5. [Hook Personalizado para Paginación](#hook-personalizado-para-paginación)

---

## Uso Básico

### Ejemplo Simple - Lista de Productos

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useMainStore } from '@/stores/mainStore'

export default function ProductList() {
  const { products, paginationMeta, fetchProducts, loading } = useMainStore()
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts({ page: currentPage, limit: 20 })
  }, [currentPage])

  const handleNextPage = () => {
    if (paginationMeta.products?.hasNext) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (paginationMeta.products?.hasPrev) {
      setCurrentPage(prev => prev - 1)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Products</h1>
      
      {/* Lista de productos */}
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="border p-4">
            <h3>{product.title}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={handlePrevPage}
          disabled={!paginationMeta.products?.hasPrev}
          className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
        >
          Previous
        </button>
        
        <span>
          Page {paginationMeta.products?.page} of {paginationMeta.products?.totalPages}
          ({paginationMeta.products?.total} total)
        </span>
        
        <button 
          onClick={handleNextPage}
          disabled={!paginationMeta.products?.hasNext}
          className="px-4 py-2 bg-blue-500 text-white disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  )
}
```

---

## Uso con Búsqueda

### Ejemplo con Búsqueda y Debounce

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useMainStore } from '@/stores/mainStore'
import { useDebounce } from '@/hooks/useDebounce'

export default function ProductSearch() {
  const { products, paginationMeta, fetchProducts, loading } = useMainStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearch = useDebounce(searchQuery, 500)

  useEffect(() => {
    // Resetear a página 1 cuando cambia la búsqueda
    setCurrentPage(1)
  }, [debouncedSearch])

  useEffect(() => {
    fetchProducts({
      query: debouncedSearch,
      page: currentPage,
      limit: 20,
      sortBy: 'title',
      sortOrder: 'asc'
    })
  }, [debouncedSearch, currentPage])

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded mb-4"
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border p-4">
                <h3>{product.title}</h3>
                <p>${product.price}</p>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <p className="text-center text-gray-500">No products found</p>
          )}

          {/* Paginación */}
          {paginationMeta.products && paginationMeta.products.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: paginationMeta.products.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
```

---

## Uso con Filtros

### Ejemplo con Múltiples Filtros

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useMainStore } from '@/stores/mainStore'

export default function OrdersWithFilters() {
  const { orders, paginationMeta, fetchOrders, loading } = useMainStore()
  const [filters, setFilters] = useState({
    status: '',
    customerEmail: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  useEffect(() => {
    fetchOrders(filters)
  }, [filters])

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to page 1 when filters change
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  return (
    <div>
      <h1>Orders</h1>

      {/* Filtros */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input
          type="email"
          placeholder="Customer email..."
          value={filters.customerEmail}
          onChange={(e) => handleFilterChange('customerEmail', e.target.value)}
          className="px-3 py-2 border rounded"
        />

        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => handleFilterChange('startDate', e.target.value)}
          className="px-3 py-2 border rounded"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => handleFilterChange('endDate', e.target.value)}
          className="px-3 py-2 border rounded"
        />
      </div>

      {/* Ordenamiento */}
      <div className="flex gap-4 mb-4">
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="createdAt">Created Date</option>
          <option value="orderNumber">Order Number</option>
          <option value="totalAmount">Total Amount</option>
        </select>

        <button
          onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          {filters.sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      {/* Lista de órdenes */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Order #</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="border p-2">{order.orderNumber}</td>
                  <td className="border p-2">{order.customerInfo?.email}</td>
                  <td className="border p-2">{order.status}</td>
                  <td className="border p-2">${order.totalAmount}</td>
                  <td className="border p-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Info y paginación */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {orders.length} of {paginationMeta.orders?.total} orders
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={!paginationMeta.orders?.hasPrev}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>
              
              <span className="px-3 py-1">
                Page {paginationMeta.orders?.page} of {paginationMeta.orders?.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={!paginationMeta.orders?.hasNext}
                className="px-3 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

---

## Componente de Paginación Completo

### Componente Reutilizable

```tsx
// components/Pagination.tsx

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNext: boolean
  hasPrev: boolean
  total?: number
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext,
  hasPrev,
  total,
  className = ''
}: PaginationProps) {
  // Calcular qué páginas mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5 // Número de páginas a mostrar
    
    if (totalPages <= showPages) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Mostrar páginas con ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push('...')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Info */}
      {total !== undefined && (
        <div className="text-sm text-gray-600">
          Total: {total} items
        </div>
      )}

      {/* Botones de paginación */}
      <div className="flex items-center gap-2">
        {/* Botón Primera Página */}
        <button
          onClick={() => onPageChange(1)}
          disabled={!hasPrev}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          title="First page"
        >
          {'<<'}
        </button>

        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          {'<'}
        </button>

        {/* Números de página */}
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="px-2">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1 border rounded ${
                currentPage === page
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          )
        ))}

        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          {'>'}
        </button>

        {/* Botón Última Página */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          title="Last page"
        >
          {'>>'}
        </button>
      </div>

      {/* Selector de tamaño de página (opcional) */}
      <div className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}
```

### Uso del Componente

```tsx
import Pagination from '@/components/Pagination'
import { useMainStore } from '@/stores/mainStore'

export default function ProductListWithPagination() {
  const { products, paginationMeta, fetchProducts } = useMainStore()
  const [currentPage, setCurrentPage] = useState(1)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchProducts({ page, limit: 20 })
  }

  return (
    <div>
      {/* Tu contenido aquí */}
      <div className="grid grid-cols-3 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Componente de paginación */}
      {paginationMeta.products && (
        <Pagination
          currentPage={paginationMeta.products.page}
          totalPages={paginationMeta.products.totalPages}
          hasNext={paginationMeta.products.hasNext}
          hasPrev={paginationMeta.products.hasPrev}
          total={paginationMeta.products.total}
          onPageChange={handlePageChange}
          className="mt-6"
        />
      )}
    </div>
  )
}
```

---

## Hook Personalizado para Paginación

### Hook Reutilizable

```tsx
// hooks/usePaginatedResource.ts

import { useEffect, useState } from 'react'
import { useMainStore } from '@/stores/mainStore'
import type { PaginationMeta } from '@/types/pagination'

interface UsePaginatedResourceOptions<T, P> {
  resourceName: keyof ReturnType<typeof useMainStore>
  fetchMethod: (params: P, forceRefresh?: boolean) => Promise<any>
  initialParams?: Partial<P>
  autoFetch?: boolean
}

export function usePaginatedResource<T, P extends { page?: number; limit?: number }>({
  resourceName,
  fetchMethod,
  initialParams = {},
  autoFetch = true
}: UsePaginatedResourceOptions<T, P>) {
  const store = useMainStore()
  const [params, setParams] = useState<P>({
    page: 1,
    limit: 20,
    ...initialParams
  } as P)
  const [isLoading, setIsLoading] = useState(false)

  const data = store[resourceName] as T[]
  const meta = store.paginationMeta[resourceName as keyof typeof store.paginationMeta] as PaginationMeta | null

  const fetch = async (newParams?: Partial<P>, forceRefresh = false) => {
    setIsLoading(true)
    try {
      const mergedParams = { ...params, ...newParams } as P
      await fetchMethod(mergedParams, forceRefresh)
      if (newParams) {
        setParams(mergedParams)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const goToPage = (page: number) => {
    fetch({ page } as Partial<P>)
  }

  const nextPage = () => {
    if (meta?.hasNext) {
      goToPage((meta.page || 1) + 1)
    }
  }

  const prevPage = () => {
    if (meta?.hasPrev) {
      goToPage((meta.page || 1) - 1)
    }
  }

  const updateParams = (newParams: Partial<P>) => {
    fetch({ ...newParams, page: 1 } as Partial<P>)
  }

  const refresh = () => {
    fetch(undefined, true)
  }

  useEffect(() => {
    if (autoFetch) {
      fetch()
    }
  }, [])

  return {
    data,
    meta,
    params,
    isLoading: isLoading || store.loading,
    fetch,
    goToPage,
    nextPage,
    prevPage,
    updateParams,
    refresh
  }
}
```

### Uso del Hook

```tsx
'use client'

import { usePaginatedResource } from '@/hooks/usePaginatedResource'
import { useMainStore } from '@/stores/mainStore'
import type { Product } from '@/types/product'
import type { SearchProductParams } from '@/types/pagination'

export default function ProductListWithHook() {
  const { fetchProducts } = useMainStore()
  
  const {
    data: products,
    meta,
    isLoading,
    goToPage,
    nextPage,
    prevPage,
    updateParams,
    refresh
  } = usePaginatedResource<Product, SearchProductParams>({
    resourceName: 'products',
    fetchMethod: fetchProducts,
    initialParams: {
      limit: 20,
      sortBy: 'title',
      sortOrder: 'asc'
    }
  })

  const handleSearch = (query: string) => {
    updateParams({ query })
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value)}
        className="mb-4 px-4 py-2 border rounded w-full"
      />

      <button onClick={refresh} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
        Refresh
      </button>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border p-4">
                <h3>{product.title}</h3>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <button onClick={prevPage} disabled={!meta?.hasPrev}>
              Previous
            </button>
            <span>Page {meta?.page} of {meta?.totalPages}</span>
            <button onClick={nextPage} disabled={!meta?.hasNext}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

---

## Mejores Prácticas

1. **Siempre resetear a página 1** cuando cambien filtros o búsqueda
2. **Usar debounce** para búsquedas en tiempo real
3. **Mostrar indicadores de carga** durante las peticiones
4. **Manejar estados vacíos** ("No results found")
5. **Deshabilitar controles** cuando no sea posible navegar
6. **Mostrar información útil** (total items, página actual, etc.)
7. **Considerar URLs** para permitir compartir páginas específicas
8. **Implementar scroll to top** al cambiar de página

## Recursos Adicionales

- Ver `types/pagination.ts` para todos los tipos disponibles
- Ver `STORE_PAGINATION_UPDATE.md` para detalles de implementación
- Todos los endpoints soportan los mismos parámetros base: `page`, `limit`, `sortBy`, `sortOrder`

