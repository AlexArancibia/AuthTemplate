"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
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
  initialVendors?: string[] // Add vendors support
  initialCollectionIds?: string[] // Add collection IDs support
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
  initialVendors = [], // Add vendors support
  initialCollectionIds = [], // Add collection IDs support
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
  
  // Track previous filter values to detect actual changes
  const prevFiltersRef = useRef({
    searchTerm: initialSearchTerm,
    categories: initialCategories,
    vendors: initialVendors, // Add vendors tracking
    collectionIds: initialCollectionIds, // Add collection IDs tracking
    sortBy: initialSortBy,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice
  })

  // Sync currentPage with initialPage when it changes (e.g., from URL)
  useEffect(() => {
    setCurrentPage(initialPage)
  }, [initialPage])

  // Helper to compare arrays efficiently
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false
    return a.every((val, idx) => val === b[idx])
  }

  // Reset to page 1 ONLY when filters actually change (not just when page changes)
  useEffect(() => {
    const filtersChanged = 
      prevFiltersRef.current.searchTerm !== initialSearchTerm ||
      !arraysEqual(prevFiltersRef.current.categories, initialCategories) ||
      !arraysEqual(prevFiltersRef.current.vendors, initialVendors) ||
      !arraysEqual(prevFiltersRef.current.collectionIds, initialCollectionIds) ||
      prevFiltersRef.current.sortBy !== initialSortBy ||
      prevFiltersRef.current.minPrice !== initialMinPrice ||
      prevFiltersRef.current.maxPrice !== initialMaxPrice
    
    if (!filtersChanged) return

    // Update the ref with new values
    prevFiltersRef.current = {
      searchTerm: initialSearchTerm,
      categories: initialCategories,
      vendors: initialVendors,
      collectionIds: initialCollectionIds,
      sortBy: initialSortBy,
      minPrice: initialMinPrice,
      maxPrice: initialMaxPrice
    }
    
    // Reset to page 1 and scroll to products
    if (currentPage !== 1) {
      setCurrentPage(1)
      const searchParams = new URLSearchParams(window.location.search)
      searchParams.set("page", "1")
      router.push(`${pathname}?${searchParams.toString()}`, { scroll: false })
    }
    
    // Scroll to the top of the product list, accounting for sticky header
    if (productListRef.current) {
      const headerHeight = 90
      const elementPosition = productListRef.current.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }, [initialSearchTerm, initialCategories, initialVendors, initialCollectionIds, initialSortBy, initialMinPrice, initialMaxPrice, currentPage, pathname, router])

  // Fetch products when parameters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Map UI sort values to backend sortBy + sortOrder.
        // "price_asc" / "price_desc" => sortBy: price; otherwise sortBy is the raw value.
        let validSortBy: ProductSortBy
        let sortOrder: 'asc' | 'desc' | undefined
        if (initialSortBy === 'price_asc') {
          validSortBy = 'price'
          sortOrder = 'asc'
        } else if (initialSortBy === 'price_desc') {
          validSortBy = 'price'
          sortOrder = 'desc'
        } else if (initialSortBy === 'title') {
          validSortBy = 'title'
          sortOrder = 'asc'
        } else {
          validSortBy = (initialSortBy && initialSortBy !== 'featured' ? initialSortBy : 'createdAt') as ProductSortBy
        }

        const hasVariantFilters = initialVariantFilters && Object.keys(initialVariantFilters).length > 0

        const params: SearchProductParams = {
          page: currentPage,
          limit: 9,
          query: initialSearchTerm || undefined,
          minPrice: initialMinPrice ?? 1,
          maxPrice: initialMaxPrice,
          currencyId: selectedCurrencyId,
          sortBy: validSortBy,
          ...(sortOrder && { sortOrder }),
          status: ['ACTIVE'],
          ...(initialCategories.length > 0 && { categorySlugs: initialCategories }),
          ...(initialVendors.length > 0 && { vendor: initialVendors }),
          ...(initialCollectionIds.length > 0 && { collectionIds: initialCollectionIds }),
          ...(hasVariantFilters && { attributeFilters: initialVariantFilters }),
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
    initialVendors,
    initialCollectionIds,
    initialSortBy,
    initialMinPrice,
    initialMaxPrice,
    selectedCurrencyId,
    fetchProducts,
  ])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)

    // Update URL with new page number
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("page", newPage.toString())
    router.push(`${pathname}?${searchParams.toString()}`, { scroll: false })

    // Scroll to the top of the product list container, accounting for sticky header
    if (productListRef.current) {
      const headerHeight = 90 // h-18 from navbar (4.5rem = 72px) + extra spacing
      const elementPosition = productListRef.current.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  // Loading state
  if (loading && products.length === 0) {
    return <ProductListSkeleton />
  }

  // No products found
  if (!loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-border bg-secondary/40 px-6 py-24 text-center">
        <p className="eyebrow text-brand">Sin resultados</p>
        <h3 className="mt-3">No encontramos fragancias</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Prueba a ajustar tus filtros o a limpiar la búsqueda para descubrir más de nuestra colección.
        </p>
      </div>
    )
  }

  const meta = paginationMeta.products

  return (
    <div ref={productListRef} data-product-list className="space-y-8">
      {/* Product Header with count and sort */}
      {meta && (
        <ProductHeader
          currentItems={products.length}
          totalItems={meta.total}
          currentPage={meta.page}
          itemsPerPage={meta.limit}
        />
      )}

      {/* Products Grid — 2 cols mobile, 3 tablet, 4 desktop (max) */}
      {loading && products.length > 0 ? (
        // Skeleton loading state for pagination
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="animate-pulse space-y-3.5">
              <div className="aspect-[3/4] w-full bg-secondary" />
              <div className="h-2.5 w-1/3 bg-secondary" />
              <div className="h-3.5 w-3/4 bg-secondary" />
              <div className="h-3.5 w-1/4 bg-secondary" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (i % 4) * 0.05 }}
            >
              <ProductCard
                product={product}
                selectedCurrencyId={selectedCurrencyId}
                acceptedCurrencies={acceptedCurrencies}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-12 flex justify-center border-t border-border pt-8">
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

