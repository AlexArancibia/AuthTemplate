"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"
import { useMainStore } from "@/stores/mainStore"
import { ProductFilters } from "./ProductsFilter"
import { FilterDrawer } from "./FilterDrawer"
import { ProductCard } from "@/components/ProductCard"
import ProductsSkeleton from "./ProductsSkeleton"
import type { ProductSortBy } from "@/types/pagination"

const PRODUCTS_PER_PAGE = 9
const DEFAULT_MIN_PRICE = 0
const DEFAULT_MAX_PRICE = 1000
const DEFAULT_SORT = 'featured' as const

// Configuración simplificada de ordenamiento
const SORT_OPTIONS = {
  featured: { sortBy: 'viewCount' as ProductSortBy, sortOrder: 'desc' as const, label: 'Destacados' },
  newest: { sortBy: 'createdAt' as ProductSortBy, sortOrder: 'desc' as const, label: 'Más recientes' },
  name: { sortBy: 'title' as ProductSortBy, sortOrder: 'asc' as const, label: 'Nombre A-Z' },
} as const

type SortOptionKey = keyof typeof SORT_OPTIONS

interface ProductListProps {
  initialSearchTerm?: string
  initialCategories?: string[]
  initialPage?: number
  initialSortBy?: SortOptionKey
  initialMinPrice?: number
  initialMaxPrice?: number
  initialVariantFilters?: Record<string, string[]>
}

interface Filters {
  searchTerm: string
  categories: string[]
  variants: Record<string, string[]>
  priceRange: [number, number]
}

export default function ProductList({
  initialSearchTerm = "",
  initialCategories = [],
  initialPage = 1,
  initialSortBy = DEFAULT_SORT,
  initialMinPrice,
  initialMaxPrice,
  initialVariantFilters = {},
}: ProductListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Store selectors
  const products = useMainStore(state => state.products)
  const categories = useMainStore(state => state.categories)
  const productsPagination = useMainStore(state => state.paginationMeta.products)
  const fetchProducts = useMainStore(state => state.fetchProducts)

  // Estado local
  const [sortBy, setSortBy] = useState<SortOptionKey>(initialSortBy)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    searchTerm: initialSearchTerm,
    categories: initialCategories,
    variants: initialVariantFilters,
    priceRange: [initialMinPrice || DEFAULT_MIN_PRICE, initialMaxPrice || DEFAULT_MAX_PRICE],
  })

  // Refs optimizados
  const prevParamsRef = useRef<string>('')
  const isInitialMount = useRef(true)

  // Memoizaciones consolidadas
  const categorySlugMap = useMemo(() => 
    new Map(categories.map(cat => [cat.id, cat.slug])), 
    [categories]
  )

  const searchParamsMemo = useMemo(() => {
    const { sortBy: sortField, sortOrder } = SORT_OPTIONS[sortBy]
    const categorySlugs = filters.categories
      .map(catId => categorySlugMap.get(catId))
      .filter((slug): slug is string => slug !== undefined)
    
    return {
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      query: filters.searchTerm || undefined,
      sortBy: sortField,
      sortOrder,
      categorySlugs: categorySlugs.length > 0 ? categorySlugs : undefined,
      status: ['ACTIVE', 'ARCHIVED'],
      attributeFilters: Object.keys(filters.variants).length > 0 ? filters.variants : undefined,
      minPrice: filters.priceRange[0] > DEFAULT_MIN_PRICE ? filters.priceRange[0] : undefined,
      maxPrice: filters.priceRange[1] < DEFAULT_MAX_PRICE ? filters.priceRange[1] : undefined,
    }
  }, [currentPage, sortBy, filters, categorySlugMap])

  // Inicialización y fetch de productos
  useEffect(() => {
    // Inicializar estado solo en el primer mount
    if (isInitialMount.current) {
      setSortBy(initialSortBy)
      setCurrentPage(initialPage)
      setFilters({
        searchTerm: initialSearchTerm,
        categories: initialCategories,
        variants: initialVariantFilters,
        priceRange: [initialMinPrice || DEFAULT_MIN_PRICE, initialMaxPrice || DEFAULT_MAX_PRICE],
      })
      isInitialMount.current = false
    }

    // Fetch productos si hay categorías disponibles
    if (categories.length === 0) return
    
    const paramsKey = JSON.stringify(searchParamsMemo)
    if (paramsKey === prevParamsRef.current) return
    
    prevParamsRef.current = paramsKey
    setHasLoaded(false)
    
    fetchProducts(searchParamsMemo).finally(() => setHasLoaded(true))
  }, [searchParamsMemo, categories.length, fetchProducts, initialSortBy, initialPage, initialSearchTerm, initialCategories, initialVariantFilters, initialMinPrice, initialMaxPrice])

  const urlParams = useMemo(() => {
    const params = new URLSearchParams()
    
    // Solo agregar parámetros que no sean valores por defecto
    if (filters.searchTerm) params.set("search", filters.searchTerm)
    
    filters.categories.forEach(catId => {
      const slug = categorySlugMap.get(catId)
      if (slug) params.append("category", slug)
    })
    
    if (Object.keys(filters.variants).length > 0) {
      params.set("attributeFilters", JSON.stringify(filters.variants))
    }
    
    if (filters.priceRange[0] > DEFAULT_MIN_PRICE) params.set("minPrice", filters.priceRange[0].toString())
    if (filters.priceRange[1] < DEFAULT_MAX_PRICE) params.set("maxPrice", filters.priceRange[1].toString())
    if (currentPage > 1) params.set("page", currentPage.toString())
    if (sortBy !== DEFAULT_SORT) params.set("sort", sortBy)

    return params.toString()
  }, [filters, currentPage, sortBy, categorySlugMap])

  // Sincronización de URL
  useEffect(() => {
    const newUrl = `${pathname}?${urlParams}`
    const currentUrl = `${pathname}?${searchParams.toString()}`
    
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false })
    }
  }, [urlParams, pathname, router, searchParams])

  // Callbacks optimizados
  const resetToFirstPage = useCallback(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
      setHasLoaded(false)
      // Scroll manual cuando cambias de página por filtros
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
    resetToFirstPage()
  }, [resetToFirstPage])

  const handleSortChange = useCallback((value: SortOptionKey) => {
    setSortBy(value)
    resetToFirstPage()
  }, [resetToFirstPage])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    setHasLoaded(false)
    
    // Solo hacer scroll si realmente cambias de página
    if (page !== currentPage) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <div className="hidden lg:block">
        <ProductFilters
          initialFilters={filters}
          onFilterChange={handleFilterChange}
          minPrice={DEFAULT_MIN_PRICE}
          maxPrice={DEFAULT_MAX_PRICE}
        />
      </div>

      {/* Mostrar skeleton solo en el área de productos si está cargando */}
      {!hasLoaded ? (
        <ProductsSkeleton />
      ) : (
        <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <FilterDrawer
            initialFilters={filters}
            onFilterChange={handleFilterChange}
            minPrice={0}
            maxPrice={1000}
          />
          <p className="text-sm text-muted-foreground hidden sm:block">
            Mostrando {products.length} de {productsPagination?.total || 0} productos
          </p>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_OPTIONS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No se encontraron productos.</p>
          </div>
        )}

        {productsPagination && productsPagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={currentPage} 
              totalPages={productsPagination.totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
        </div>
      )}
    </div>
  )
}

