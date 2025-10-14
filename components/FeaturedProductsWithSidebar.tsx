"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductCard } from "./ProductCard"
import { useMainStore } from "@/stores/mainStore"
import type { CurrencyOption } from "@/stores/currency"
import type { Product } from "@/types/product"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface FeaturedProductsWithSidebarProps {
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
}

// Sidebar component con categorías desde la BD
function CategorySidebar() {
  const { categories, fetchCategories, loading } = useMainStore()

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories({ limit: 100 })
    }
  }, [categories.length, fetchCategories])

  return (
    <div className="w-full">
      <h2 className="bg-pink-500 text-white rounded-t-md py-3 px-4 text-center font-medium">
        Categorías
      </h2>
      <nav className="border rounded-b-lg">
        <ul className="py-1 max-h-[400px] overflow-y-auto scrollbar-elegant">
          {loading && categories.length === 0 ? (
            <li className="px-4 py-2.5 text-sm text-gray-500 text-center">
              Cargando categorías...
            </li>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/productos?category=${category.slug}`}
                  className="block w-full text-left px-4 py-2.5 hover:bg-accent text-sm font-light transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-2.5 text-sm text-gray-500 text-center">
              No hay categorías disponibles
            </li>
          )}
        </ul>
        
        <div className="px-4 pb-3 pt-2 border-t">
          <Link
            href="/productos"
            className="block bg-gradient-to-br from-white to-gray-200 shadow-md shadow-slate-100 border border-gray-200 hover:bg-gray-300 text-center text-sm py-2 rounded-md transition-colors"
          >
            Explorar Tienda
          </Link>
        </div>
      </nav>
    </div>
  )
}

// Mini carrusel component
function ProductsCarousel({
  products,
  selectedCurrencyId,
  acceptedCurrencies,
  loading,
}: {
  products: Product[]
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
  loading: boolean
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on("select", () => {
        setCanScrollPrev(emblaApi.canScrollPrev())
        setCanScrollNext(emblaApi.canScrollNext())
      })
      setCanScrollPrev(emblaApi.canScrollPrev())
      setCanScrollNext(emblaApi.canScrollNext())
    }
  }, [emblaApi])

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Cargando productos...
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay productos disponibles
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {canScrollPrev && (
        <button
          onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md border border-input flex items-center justify-center"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5 text-gray-800" />
        </button>
      )}

      <div className="overflow-hidden touch-pan-x" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 px-2"
              style={{ width: "33.3333%" }}
            >
              <ProductCard
                product={product}
                selectedCurrencyId={selectedCurrencyId}
                acceptedCurrencies={acceptedCurrencies}
              />
            </div>
          ))}
        </div>
      </div>

      {canScrollNext && (
        <button
          onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md border border-input flex items-center justify-center"
          aria-label="Siguiente"
        >
          <ChevronRight className="h-5 w-5 text-gray-800" />
        </button>
      )}
    </div>
  )
}

// Componente principal
export function FeaturedProductsWithSidebar({
  selectedCurrencyId,
  acceptedCurrencies,
}: FeaturedProductsWithSidebarProps) {
  const { fetchProducts } = useMainStore()
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch de los 10 productos más recientes
  useEffect(() => {
    const loadRecentProducts = async () => {
      setLoading(true)
      try {
        const response = await fetchProducts({
          page: 1,
          limit: 10,
          sortBy: 'createdAt' as const,
          sortOrder: 'desc' as const,
          status: ['ACTIVE'],
        })
        setRecentProducts(response.data)
      } catch (error) {
        console.error('Error loading recent products:', error)
        setRecentProducts([])
      } finally {
        setLoading(false)
      }
    }

    loadRecentProducts()
  }, [fetchProducts])

  return (
    <div className="container-section py-8 md:pt-16">
      <div className="content-section flex flex-wrap justify-between mb-8 gap-6 md:gap-0">
        {/* Sidebar - 25% */}
        <div className="w-full md:w-[25%]">
          <CategorySidebar />
        </div>

        {/* Carrusel - 75% */}
        <div className="w-full md:w-[72%]">
          <ProductsCarousel
            products={recentProducts}
            selectedCurrencyId={selectedCurrencyId}
            acceptedCurrencies={acceptedCurrencies}
            loading={loading}
          />
        </div>
      </div>
    </div>
  )
}

