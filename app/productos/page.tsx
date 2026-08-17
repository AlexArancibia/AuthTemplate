"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useCurrencyStore } from "@/stores/currency"
import ProductListSkeleton from "./_components/ProductListSkeleton"
import ProductList from "./_components/ProductList"
import ProductFilterSidebar from "./_components/ProductFilterSidebar"
import MobileFilterButton from "./_components/MobileFilterButton"
import Link from "next/link"

function CatalogHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container-section pt-16 pb-10 md:pt-24 md:pb-14">
        <div className="content-section">
          <nav aria-label="Migas" className="eyebrow mb-5 flex items-center gap-2 text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Inicio
            </Link>
            <span aria-hidden className="text-border">/</span>
            <span className="text-foreground">Catálogo</span>
          </nav>
          <p className="eyebrow text-brand">La colección Scentra</p>
          <h1 className="mt-3 max-w-3xl">Todas las fragancias</h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Perfumes de nicho, de diseñador y árabes, 100% originales. Filtra por marca,
            familia olfativa o precio para encontrar tu próxima firma.
          </p>
        </div>
      </div>
    </header>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <main className="min-h-screen bg-background">
        <CatalogHeader />
        <div className="container-section py-10 md:py-16">
          <div className="content-section">
            <ProductListSkeleton />
          </div>
        </div>
      </main>
    )
  }

  // Extract filter parameters from URL
  const searchTerm = searchParams.get("search") || ""
  const categoryParam = searchParams.get("category")
  const categories = categoryParam ? categoryParam.split(",") : []
  const vendorParam = searchParams.get("vendor")
  const vendors = vendorParam ? vendorParam.split(",") : []
  const collectionParam = searchParams.get("collections")
  const collectionIds = collectionParam ? collectionParam.split(",") : []
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  // Valid sortBy values: createdAt, updatedAt, title, price, viewCount
  const sortBy = searchParams.get("sort") || "createdAt"

  // Extract price range
  const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined
  const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined

  // Extract variant filters (format: variant_attribute=value1,value2)
  const variantFilters: Record<string, string[]> = {}

  // Process all search params to find variant filters
  searchParams.forEach((value, key) => {
    if (key.startsWith("variant_")) {
      const attributeName = key.replace("variant_", "")
      variantFilters[attributeName] = value.split(",")
    }
  })

  return (
    <main className="bg-background">
      {/* Cabecera editorial del catálogo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <CatalogHeader />
      </motion.div>

      {/* Sección de productos con efecto de fade-in */}
      <motion.div
        className="container-section py-10 md:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        <div className="content-section">
          {/* Botón de filtros para móviles */}
          <MobileFilterButton />

          {/* Layout de dos columnas: Sidebar + Productos */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:gap-10 xl:gap-12">
            {/* Sidebar de Filtros - Oculto en móviles */}
            <motion.aside
              className="hidden lg:block"
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ProductFilterSidebar />
            </motion.aside>

            {/* Lista de Productos */}
            <motion.div
              className="min-w-0"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProductList
                initialSearchTerm={searchTerm}
                initialCategories={categories}
                initialVendors={vendors}
                initialCollectionIds={collectionIds}
                initialPage={page}
                initialSortBy={sortBy}
                initialMinPrice={minPrice}
                initialMaxPrice={maxPrice}
                initialVariantFilters={variantFilters}
                collectionName="Destacados"
                selectedCurrencyId={selectedCurrencyId}
                acceptedCurrencies={acceptedCurrencies}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background">
        <CatalogHeader />
        <div className="container-section py-10 md:py-16">
          <div className="content-section">
            <ProductListSkeleton />
          </div>
        </div>
      </main>
    }>
      <ProductsContent />
    </Suspense>
  )
}