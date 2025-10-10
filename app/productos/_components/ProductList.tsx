"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "./Pagination"
import ProductListSkeleton from "./ProductListSkeleton"
import type { CurrencyOption } from "@/stores/currency"
import type { SearchProductParams, ProductSortBy } from "@/types/pagination"

interface ProductListProps {
  initialSearchTerm?: string
  initialCategories?: string[]
  initialPage?: number
  initialSortBy?: ProductSortBy | string // Allow string for backward compatibility
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
  const { products, paginationMeta, fetchProducts, loading } = useMainStore()
  const productListRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Fetch products when parameters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        const validSortBy: ProductSortBy = (initialSortBy && initialSortBy !== 'featured' ? initialSortBy : 'createdAt') as ProductSortBy
        
        const params: SearchProductParams = {
          page: currentPage,
          limit: 9,
          query: initialSearchTerm || undefined,
          minPrice: initialMinPrice,
          maxPrice: initialMaxPrice,
          sortBy: validSortBy,
        }

        if (initialCategories && initialCategories.length > 0) {
          params.categoryIds = initialCategories
        }

        await fetchProducts(params)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    fetchData()
  }, [
    currentPage,
    initialSearchTerm,
    initialCategories,
    initialSortBy,
    initialMinPrice,
    initialMaxPrice,
    fetchProducts,
  ])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)

    // Update URL with new page number
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", newPage.toString())
    router.push(`${pathname}?${searchParams.toString()}`, { scroll: false })

    // Scroll to the top of the product list container
    if (productListRef.current) {
      productListRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  // Loading state
  if (loading && products.length === 0) {
    return <ProductListSkeleton />
  }

  // No products found
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
        <p className="text-gray-500">Intenta ajustar tus filtros de búsqueda</p>
      </div>
    )
  }

  const meta = paginationMeta.products

  return (
    <div ref={productListRef} data-product-list className="space-y-8">
      {/* Products Grid - 3 columns on desktop, 1 column on mobile */}
      {loading && products.length > 0 ? (
        // Skeleton loading state for pagination
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="space-y-4 animate-pulse">
              <div className="bg-gray-200 h-[300px] w-full rounded-lg" />
              <div className="bg-gray-200 h-4 w-2/3 rounded" />
              <div className="bg-gray-200 h-4 w-1/2 rounded" />
              <div className="bg-gray-200 h-8 w-full rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedCurrencyId={selectedCurrencyId}
              acceptedCurrencies={acceptedCurrencies}
            />
          ))}
        </div>
      )}

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

