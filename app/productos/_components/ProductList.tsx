"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "./Pagination"
import ProductListSkeleton from "./ProductListSkeleton"
import ProductHeader from "./ProductHeader"
import type { CurrencyOption } from "@/stores/currency"
import type { SearchProductParams, ProductSortBy } from "@/types/pagination"

interface ProductListProps {
  initialSearchTerm?: string
  initialCategories?: string[]
  initialPage?: number
  initialSortBy?: ProductSortBy | string
  initialMinPrice?: number
  initialMaxPrice?: number
  initialVariantFilters?: Record<string, string[]>
  collectionName?: string
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
}

export default function ProductList({
  initialSearchTerm = "",
  initialCategories = [],
  initialPage = 1,
  initialSortBy = "createdAt",
  initialMinPrice,
  initialMaxPrice,
  initialVariantFilters = {},
  collectionName,
  selectedCurrencyId,
  acceptedCurrencies,
}: ProductListProps) {
  
  const router = useRouter()
  const pathname = usePathname()
  const { products, paginationMeta, fetchProducts } = useMainStore()
  const [isLoading, setIsLoading] = useState(true)

  // Memoize search parameters
  const searchParams = useMemo((): SearchProductParams => {
    const params: SearchProductParams = {
      page: initialPage,
      limit: 9,
      status: ['ACTIVE'],
      sortBy: (initialSortBy !== 'featured' ? initialSortBy : 'createdAt') as ProductSortBy,
    }
    
    if (initialSearchTerm) params.query = initialSearchTerm
    if (initialCategories.length > 0) params.categorySlugs = initialCategories
    if (initialMinPrice !== undefined && initialMinPrice > 0) params.minPrice = initialMinPrice
    if (initialMaxPrice !== undefined) params.maxPrice = initialMaxPrice
    if ((initialMinPrice !== undefined && initialMinPrice > 0) || initialMaxPrice !== undefined) {
      params.currencyId = selectedCurrencyId
    }
    
    return params
  }, [initialPage, initialSearchTerm, initialCategories, initialSortBy, initialMinPrice, initialMaxPrice, selectedCurrencyId])

  // Page change handler
  const handlePageChange = (newPage: number) => {
    const urlParams = new URLSearchParams(window.location.search)
    urlParams.set("page", newPage.toString())
    router.push(`${pathname}?${urlParams.toString()}`, { scroll: false })
  }

  // Reset to page 1 when filters change (excluding page)
  const prevFiltersRef = useRef<string>("")
  
  useEffect(() => {
    const filtersKey = `${initialSearchTerm}-${initialCategories.join(",")}-${initialSortBy}-${initialMinPrice}-${initialMaxPrice}`
    
    if (prevFiltersRef.current && prevFiltersRef.current !== filtersKey && initialPage !== 1) {
      const urlParams = new URLSearchParams(window.location.search)
      urlParams.set("page", "1")
      router.push(`${pathname}?${urlParams.toString()}`, { scroll: false })
    }
    
    prevFiltersRef.current = filtersKey
  }, [initialSearchTerm, initialCategories, initialSortBy, initialMinPrice, initialMaxPrice, initialPage, pathname, router])

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await fetchProducts(searchParams)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams, fetchProducts])

  // Memoize pagination metadata
  const meta = paginationMeta.products

  // Memoize loading skeleton
  const loadingSkeleton = useMemo(() => 
    Array.from({ length: 9 }, (_, i) => (
      <div key={i} className="space-y-4 animate-pulse">
        <div className="bg-gray-200 h-[300px] w-full rounded-lg" />
        <div className="bg-gray-200 h-4 w-2/3 rounded" />
        <div className="bg-gray-200 h-4 w-1/2 rounded" />
        <div className="bg-gray-200 h-8 w-full rounded" />
      </div>
    ))
  , [])

  // Memoize empty state
  const emptyState = useMemo(() => (
    <div className="text-center py-16">
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
      <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
    </div>
  ), [])

  // Early returns for loading and empty states
  if (isLoading && products.length === 0) {
    return <ProductListSkeleton />
  }

  if (!isLoading && products.length === 0) {
    return emptyState
  }

  return (
    <div data-product-list className="space-y-8">
      {/* Header */}
      {meta && (
        <ProductHeader
          currentItems={products.length}
          totalItems={meta.total}
          currentPage={meta.page}
          itemsPerPage={meta.limit}
        />
      )}
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading && products.length > 0 ? loadingSkeleton : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedCurrencyId={selectedCurrencyId}
              acceptedCurrencies={acceptedCurrencies}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-10 pt-8 border-t border-gray-200 flex justify-center">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

