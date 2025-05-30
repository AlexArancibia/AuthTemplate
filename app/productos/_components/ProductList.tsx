"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import type { Product } from "@/types/product"
import type { Category } from "@/types/category"
import { useMainStore } from "@/stores/mainStore"
import { ProductFilters } from "./ProductsFilter"
import { FilterDrawer } from "./FilterDrawer"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "./Pagination"

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

function ProductListContent({
  initialSearchTerm = "",
  initialCategories = [],
  initialPage = 1,
  initialSortBy = "featured",
  initialMinPrice,
  initialMaxPrice,
  initialVariantFilters = {},
}: ProductListProps) {
  const { products, shopSettings } = useMainStore()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const defaultCurrency = shopSettings[0]?.defaultCurrency

  // Calculate min and max prices from products
  const { minPrice: calculatedMinPrice, maxPrice: calculatedMaxPrice } = useMemo(() => {
    if (!products || products.length === 0) {
      return { minPrice: 0, maxPrice: 1000 } // Valores predeterminados seguros
    }

    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    products.forEach((product: Product) => {
      product.variants.forEach((variant) => {
        const price = variant.prices.find((p) => p.currencyId === defaultCurrency?.id)?.price || 0
        if (price > 0) {
          // Solo considerar precios válidos mayores que cero
          min = Math.min(min, price)
          max = Math.max(max, price)
        }
      })
    })

    // Si después de procesar todos los productos, aún tenemos valores infinitos, usar valores predeterminados
    if (!isFinite(min) || !isFinite(max) || min > max) {
      return { minPrice: 0, maxPrice: 1000 }
    }

    return { minPrice: Math.floor(min), maxPrice: Math.ceil(max) }
  }, [products, defaultCurrency])

  // Use initial values or calculated values
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [filters, setFilters] = useState<Filters>({
    searchTerm: initialSearchTerm,
    categories: initialCategories,
    variants: initialVariantFilters,
    priceRange: [
      initialMinPrice !== undefined && isFinite(initialMinPrice)
        ? initialMinPrice
        : isFinite(calculatedMinPrice)
          ? calculatedMinPrice
          : 0,
      initialMaxPrice !== undefined && isFinite(initialMaxPrice)
        ? initialMaxPrice
        : isFinite(calculatedMaxPrice)
          ? calculatedMaxPrice
          : 1000,
    ],
  })

  // Update URL when filters change
  useEffect(() => {
    // Create a new URLSearchParams object
    const newParams = new URLSearchParams()

    // Update search term
    if (filters.searchTerm) {
      newParams.set("search", filters.searchTerm)
    }

    // Update categories
    filters.categories.forEach((category) => {
      newParams.append("category", category)
    })

    // Update price range
    if (filters.priceRange[0] !== calculatedMinPrice) {
      newParams.set("minPrice", filters.priceRange[0].toString())
    }

    if (filters.priceRange[1] !== calculatedMaxPrice) {
      newParams.set("maxPrice", filters.priceRange[1].toString())
    }

    // Update variant filters
    Object.entries(filters.variants).forEach(([attribute, values]) => {
      if (values.length > 0) {
        newParams.set(`variant_${attribute}`, values.join(","))
      }
    })

    // Update sort
    if (sortBy !== "featured") {
      newParams.set("sort", sortBy)
    }

    // Update page
    if (currentPage !== 1) {
      newParams.set("page", currentPage.toString())
    }

    // Compare current and new URL params to avoid unnecessary updates
    const currentParams = searchParams.toString()
    const newParamsString = newParams.toString()

    // Only update if the parameters have actually changed
    if (currentParams !== newParamsString) {
      // Update URL without refreshing the page
      router.replace(`${pathname}?${newParamsString}`, { scroll: false })
    }
  }, [filters, sortBy, currentPage, pathname, router, calculatedMinPrice, calculatedMaxPrice, searchParams])

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      // Filtrar productos en estado DRAFT
      if (product.status === "DRAFT") {
        return false
      }

      // Filtrar productos sin stock que no permiten backorder
      if (!product.allowBackorder) {
        // Verificar si alguna variante tiene stock disponible
        const hasStock = product.variants.some((variant) => variant.inventoryQuantity > 0)
        if (!hasStock) {
          return false
        }
      }

      // Filter by search term
      if (filters.searchTerm && !product.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false
      }

      // Filter by category
      if (
        filters.categories.length > 0 &&
        product.categories &&
        !product.categories.some((cat: Category) => filters.categories.includes(cat.id))
      ) {
        return false
      }

      // Filter by variants
      const variantMatches = Object.entries(filters.variants).every(([attribute, values]) => {
        return (
          values.length === 0 ||
          product.variants.some((variant) =>
            values.includes(variant.attributes![attribute as keyof typeof variant.attributes] as string),
          )
        )
      })
      if (!variantMatches) {
        return false
      }

      // Filter by price
      const productPrice = product.variants[0].prices.find((price) => price.currencyId === defaultCurrency?.id)?.price
      if (productPrice && (productPrice < filters.priceRange[0] || productPrice > filters.priceRange[1])) {
        return false
      }

      return true
    })
  }, [products, filters, defaultCurrency])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (
            (a.variants[0].prices.find((price) => price.currencyId === defaultCurrency?.id)?.price || 0) -
            (b.variants[0].prices.find((price) => price.currencyId === defaultCurrency?.id)?.price || 0)
          )
        case "price-desc":
          return (
            (b.variants[0].prices.find((price) => price.currencyId === defaultCurrency?.id)?.price || 0) -
            (a.variants[0].prices.find((price) => price.currencyId === defaultCurrency?.id)?.price || 0)
          )
        case "name":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
  }, [filteredProducts, sortBy, defaultCurrency])

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE)

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    return sortedProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  }, [sortedProducts, currentPage])

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-16">
      {/* Sidebar con filtros (visible solo en desktop) */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <ProductFilters
          onFilterChange={handleFilterChange}
          initialFilters={filters}
          minPrice={calculatedMinPrice}
          maxPrice={calculatedMaxPrice}
        />
      </aside>

      {/* Productos */}
      <div className="flex-1">
        {/* Controles superiores */}
        <div className="flex justify-between items-center mb-6">
          <FilterDrawer
            onFilterChange={handleFilterChange}
            initialFilters={filters}
            minPrice={calculatedMinPrice}
            maxPrice={calculatedMaxPrice}
          />
          <p className="text-sm text-muted-foreground hidden sm:block">
            Mostrando {paginatedProducts.length} de {sortedProducts.length} productos
          </p>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
              <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
              <SelectItem value="name">Nombre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((product) => (
            <motion.div key={product.id} layout>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Mensaje si no hay productos */}
        {paginatedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No se encontraron productos con los filtros seleccionados.</p>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
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
