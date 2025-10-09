"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { useSearchParams } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
import ProductList from "./_components/ProductList"
import ProductListSkeleton from "./_components/ProductListSkeleton"

function ProductsContent() {
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  
  // Optimización: Usar selectores específicos para evitar re-renders innecesarios
  const categories = useMainStore(state => state.categories)
  const collections = useMainStore(state => state.collections)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container-section py-16 md:py-16 bg-[url('/fondoproduct.jpg')] bg-cover">
          <div className="content-section text-center">
            <h2 className="text-white mb-2">Nuestros Productos</h2>
            <p className="text-white/90 text-lg">Descubre nuestra línea completa de productos de limpieza industrial</p>
          </div>
        </div>
        <div className="container-section py-8 md:py-16">
          <div className="content-section">
            <ProductListSkeleton />
          </div>
        </div>
      </main>
    )
  }

  // Extract filter parameters from URL
  const searchTerm = searchParams.get("search") || ""
  const categoriesParam = searchParams.getAll("category")
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const sortBy = searchParams.get("sort") || "featured"

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

  // Get the selected category name for the title
  const selectedCategory = categoriesParam.length > 0 
    ? categories.find(cat => cat.id === categoriesParam[0])
    : null

  const pageTitle = selectedCategory ? selectedCategory.name : "Nuestros Productos"

  // Obtener colección desde query params o usar "Destacados" por defecto
  const collectionParam = searchParams.get("collection")
  const selectedCollection = collectionParam 
    ? collections.find(col => col.id === collectionParam || col.title === collectionParam)
    : collections.find(col => col.title === "Destacados")

  return (
    <main className="min-h-screen bg-white">
      {/* Sección de encabezado con efecto de fade-in */}
      <motion.div
        className="container-section py-16 md:py-16 bg-[url('/fondoproduct.jpg')] bg-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="content-section text-center">
          <motion.h1
            className="text-white mb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            {pageTitle}
          </motion.h1>
          <motion.p
            className="text-white/90 text-lg"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {selectedCategory 
              ? `Productos de la categoría ${selectedCategory.name.toLowerCase()}`
              : "Descubre nuestra línea completa de productos de limpieza industrial"
            }
          </motion.p>
        </div>
      </motion.div>

      {/* Sección de productos con efecto de fade-in */}
      <motion.div
        className="container-section py-8 md:py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="content-section">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProductList
              initialSearchTerm={searchTerm}
              initialCategories={categoriesParam}
              initialPage={page}
              initialSortBy={sortBy}
              initialMinPrice={minPrice}
              initialMaxPrice={maxPrice}
              initialVariantFilters={variantFilters}
              collectionName={selectedCollection?.id}
            />
          </motion.div>
        </div>
      </motion.div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white">
        <div className="container-section py-16 md:py-16 bg-[url('/fondoproduct.jpg')] bg-cover">
          <div className="content-section text-center">
            <h1 className="text-white mb-2">Nuestros Productos</h1>
            <p className="text-white/90 text-lg">Descubre nuestra línea completa de productos de limpieza industrial</p>
          </div>
        </div>
        <div className="container-section py-8 md:py-16">
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