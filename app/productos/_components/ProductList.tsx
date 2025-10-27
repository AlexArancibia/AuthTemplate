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

const PRODUCTS_PER_PAGE = 9

interface ProductListProps {
  initialSearchTerm?: string
  initialCategories?: string[]
  initialPage?: number
  initialSortBy?: string
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

const sortOptions = {
  featured: { sortBy: 'viewCount', sortOrder: 'desc' },
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  name: { sortBy: 'title', sortOrder: 'asc' },
}

export default function ProductList({
  initialSearchTerm = "",
  initialCategories = [],
  initialPage = 1,
  initialSortBy = "featured",
  initialMinPrice,
  initialMaxPrice,
  initialVariantFilters = {},
}: ProductListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const products = useMainStore(state => state.products)
  const categories = useMainStore(state => state.categories)
  const productsPagination = useMainStore(state => state.paginationMeta.products)
  const fetchProducts = useMainStore(state => state.fetchProducts)

  const [sortBy, setSortBy] = useState(initialSortBy)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    searchTerm: initialSearchTerm,
    categories: initialCategories,
    variants: initialVariantFilters,
    priceRange: [initialMinPrice || 0, initialMaxPrice || 10000],
  })

  // Convertir IDs de categorías a slugs (memoized)
  const categorySlugMap = useMemo(() => {
    return new Map(categories.map(cat => [cat.id, cat.slug]))
  }, [categories])

  // Ref para almacenar los valores previos y evitar refetch innecesario
  const prevParamsRef = useRef<string>('')

  // Sincronizar filtros cuando cambian las props iniciales
  useEffect(() => {
    setSortBy(initialSortBy)
    setCurrentPage(initialPage)
    setFilters({
      searchTerm: initialSearchTerm,
      categories: initialCategories,
      variants: initialVariantFilters,
      priceRange: [initialMinPrice || 0, initialMaxPrice || 10000],
    })
  }, [initialSortBy, initialPage, initialSearchTerm, initialCategories, initialVariantFilters, initialMinPrice, initialMaxPrice])

  // Fetch productos
  useEffect(() => {
    if (categories.length === 0) return
    
    const sortConfig = sortOptions[sortBy as keyof typeof sortOptions]
    const attributeFilters = Object.keys(filters.variants).length > 0 ? filters.variants : undefined
    
    // Convertir category IDs a slugs
    const categorySlugs = filters.categories.length > 0
      ? filters.categories
          .map(catId => categorySlugMap.get(catId))
          .filter((slug): slug is string => slug !== undefined)
      : undefined
    
    // Crear una clave única para comparar
    const paramsKey = JSON.stringify({
      page: currentPage,
      sortBy,
      searchTerm: filters.searchTerm,
      categoryIds: filters.categories,
      variants: filters.variants,
    })
    
    // Solo hacer fetch si los parámetros cambiaron
    if (paramsKey === prevParamsRef.current) return
    prevParamsRef.current = paramsKey
    
    const searchParams = {
      page: currentPage,
      limit: PRODUCTS_PER_PAGE,
      query: filters.searchTerm || undefined,
      sortBy: sortConfig.sortBy as any,
      sortOrder: sortConfig.sortOrder as any,
      categorySlugs,
      status: ['ACTIVE', 'ARCHIVED'] as any,
      attributeFilters,
    }
    
    setHasLoaded(false)
    fetchProducts(searchParams).then(() => setHasLoaded(true))
  }, [currentPage, sortBy, filters.searchTerm, filters.categories, filters.variants, categories.length, categorySlugMap, fetchProducts])

  // Actualizar URL cuando cambian los filtros
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.searchTerm) params.set("search", filters.searchTerm)
    if (filters.categories.length > 0) {
      filters.categories.forEach(catId => {
        const slug = categorySlugMap.get(catId)
        if (slug) params.append("category", slug)
      })
    }
    if (Object.keys(filters.variants).length > 0) {
      params.set("attributeFilters", JSON.stringify(filters.variants))
    }
    if (currentPage > 1) params.set("page", currentPage.toString())
    if (sortBy !== "featured") params.set("sort", sortBy)

    const newUrl = `${pathname}?${params.toString()}`
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.replace(newUrl)
    }
  }, [filters, currentPage, sortBy, pathname, router, searchParams, categorySlugMap])

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setHasLoaded(false)
  }, [])

  const handleSortChange = useCallback((value: string) => {
    setSortBy(value)
    setCurrentPage(1)
    setHasLoaded(false)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    setHasLoaded(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <div className="hidden lg:block">
        <ProductFilters
          initialFilters={filters}
          onFilterChange={handleFilterChange}
          minPrice={0}
          maxPrice={10000}
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
            maxPrice={10000}
          />
          <p className="text-sm text-muted-foreground hidden sm:block">
            Mostrando {products.length} de {productsPagination?.total || 0} productos
          </p>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="newest">Más recientes</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
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

