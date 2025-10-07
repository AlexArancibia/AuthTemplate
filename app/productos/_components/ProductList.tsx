"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination } from "@/components/ui/pagination"

import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import { useMainStore } from "@/stores/mainStore"
import { ProductFilters } from "./ProductsFilter"
import { FilterDrawer } from "./FilterDrawer"
import { ProductCard } from "@/components/ProductCard"

const PRODUCTS_PER_PAGE = 9

interface ProductListProps {
  initialSearchTerm?: string
  initialCategories?: string[]
  initialPage?: number
  initialSortBy?: string
  initialMinPrice?: number
  initialMaxPrice?: number
  initialVariantFilters?: Record<string, string[]>
  collectionName?: string
}

interface Filters {
  searchTerm: string
  categories: string[]
  variants: Record<string, string[]>
  priceRange: [number, number]
}

function ProductListContent({
  initialSearchTerm = "",
  initialCategories = [],
  initialPage = 1,
  initialSortBy = "featured",
  initialMinPrice,
  initialMaxPrice,
  initialVariantFilters = {},
  collectionName,
}: ProductListProps) {
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Optimización: Usar selectores específicos para evitar re-renders innecesarios
  const products = useMainStore(state => state.products)
  const productsPagination = useMainStore(state => state.productsPagination)
  const fetchProducts = useMainStore(state => state.fetchProducts)
  const shopSettings = useMainStore(state => state.shopSettings)
  const categories = useMainStore(state => state.categories)

  const defaultCurrency = shopSettings[0]?.defaultCurrency

  const [sortBy, setSortBy] = useState(initialSortBy)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [filters, setFilters] = useState<Filters>({
    searchTerm: initialSearchTerm,
    categories: initialCategories,
    variants: initialVariantFilters,
    priceRange: [initialMinPrice || 0, initialMaxPrice || 10000],
  })

  // Mapeo de sortBy del frontend al backend
  const sortByMapping: Record<string, 'createdAt' | 'updatedAt' | 'title' | 'price' | 'viewCount'> = {
    'featured': 'viewCount',    // ✅ Ordena por número de vistas (productos más vistos)
    // 'price-asc': 'price',     // ❌ DESHABILITADO - Campo no existe en Product
    // 'price-desc': 'price',    // ❌ DESHABILITADO - Campo no existe en Product
    'name': 'title',             // ✅ Ordena por nombre del producto
    'newest': 'createdAt',       // ✅ Ordena por fecha de creación
  }

  const sortOrderMapping: Record<string, 'asc' | 'desc'> = {
    'featured': 'desc',          // Más vistos primero
    // 'price-asc': 'asc',       // ❌ DESHABILITADO
    // 'price-desc': 'desc',     // ❌ DESHABILITADO
    'name': 'asc',               // A-Z alfabético
    'newest': 'desc',            // Más recientes primero
  }

  // Cargar productos del servidor con filtros
  useEffect(() => {
    const loadProducts = async () => {
      console.log('🔍 ProductList - Applying filters:', {
        categories: filters.categories,
        searchTerm: filters.searchTerm,
        sortBy,
        currentPage
      })
      
      await fetchProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        query: filters.searchTerm || undefined,
        sortBy: sortByMapping[sortBy],
        sortOrder: sortOrderMapping[sortBy],
        categoryIds: filters.categories.length > 0 ? filters.categories : undefined,
        collectionIds: collectionName ? [collectionName] : undefined,
        status: ['ACTIVE', 'ARCHIVED'], // Excluir DRAFT
      })
    }

    loadProducts()
  }, [currentPage, sortBy, filters.searchTerm, filters.categories, collectionName])

  // Los productos ya vienen del servidor
  const displayProducts = products

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Sync with URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.searchTerm) params.set("search", filters.searchTerm)
    if (filters.categories.length > 0) {
      filters.categories.forEach((cat) => params.append("category", cat))
    }
    if (currentPage > 1) params.set("page", currentPage.toString())
    if (sortBy !== "featured") params.set("sort", sortBy)

    const newUrl = `${pathname}?${params.toString()}`
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.replace(newUrl)
    }
  }, [filters, sortBy, currentPage, pathname, router, searchParams])

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Filtros */}
      <div className="hidden lg:block">
        <ProductFilters
          initialFilters={filters}
          onFilterChange={handleFilterChange}
          minPrice={0}
          maxPrice={10000}
        />
      </div>

      {/* Productos */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <FilterDrawer
            initialFilters={filters}
            onFilterChange={handleFilterChange}
            minPrice={0}
            maxPrice={10000}
          />
          <p className="text-sm text-muted-foreground hidden sm:block">
            Mostrando {displayProducts.length} de {productsPagination.total} productos
          </p>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="newest">Más recientes</SelectItem>
              {/* DESHABILITADO: Ordenamiento por precio
                  Motivo: El precio no es un campo directo del Product en la BD.
                  Los precios están en ProductVariant -> VariantPrice.
                  Se requiere modificación en el backend para calcular y ordenar por precio mínimo.
                  Fecha: Octubre 2025
              */}
              {/* <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem> */}
              {/* <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem> */}
              <SelectItem value="name">Nombre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProducts.map((product) => (
            <motion.div key={product.id} layout>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Mensaje si no hay productos */}
        {displayProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No se encontraron productos.</p>
          </div>
        )}

        {/* Paginación */}
        {productsPagination.totalPages > 1 && (
          <div className="mt-8">
            <Pagination 
              currentPage={currentPage} 
              totalPages={productsPagination.totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductList(props: ProductListProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col lg:flex-row gap-16">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            {/* Placeholder para los filtros */}
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </aside>
          <div className="flex-1">
            {/* Placeholder para los productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded"></div>
                  <div className="mt-2 h-4 bg-gray-200 w-3/4   rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProductListContent {...props} />
    </Suspense>
  )
}
