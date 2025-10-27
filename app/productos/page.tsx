"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
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

  // Crear mapa de categorías para búsqueda rápida (slug -> id)
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach(cat => map.set(cat.slug, cat.id))
    return map
  }, [categories])

  // Crear mapa slug -> category para búsqueda rápida
  const categorySlugMap = useMemo(() => {
    const map = new Map<string, typeof categories[0]>()
    categories.forEach(cat => map.set(cat.slug, cat))
    return map
  }, [categories])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Extraer parámetros de filtros desde la URL
  const searchTerm = searchParams.get("search") || ""
  const categoriesParamFromURL = searchParams.getAll("category")
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const sortBy = searchParams.get("sort") || "featured"

  // Extraer rango de precios
  const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")!) : undefined
  const maxPrice = searchParams.get("maxPrice") ? Number.parseFloat(searchParams.get("maxPrice")!) : undefined

  // ✅ ACTUALIZADO: Extraer filtros de variantes (formato: attributeFilters={"Presentaciones":["1 Lt","500 mLt"]})
  let variantFilters: Record<string, string[]> = {}

  // Buscar el parámetro attributeFilters en la URL
  const attributeFiltersParam = searchParams.get("attributeFilters")
  if (attributeFiltersParam) {
    try {
      // Parsear el JSON del parámetro
      variantFilters = JSON.parse(attributeFiltersParam)
    } catch (error) {
      console.error('Error parsing attributeFilters:', error)
    }
  }

  // Convertir slugs de categorías a IDs para el filtrado interno usando el mapa
  const categoriesParam = categoriesParamFromURL
    .map(slug => categoryMap.get(slug))
    .filter((id): id is string => id !== undefined)

  // Obtener el nombre de la categoría seleccionada para el título
  const selectedCategory = categoriesParamFromURL.length > 0 
    ? categorySlugMap.get(categoriesParamFromURL[0]) || null
    : null

  const pageTitle = selectedCategory ? selectedCategory.name : "Nuestros Productos"

  // Obtener colección desde query params - SOLO si está en la URL
  const collectionParam = searchParams.get("collection")
  const selectedCollection = collectionParam 
    ? collections.find(col => col.id === collectionParam || col.title === collectionParam)
    : null  // ✅ No filtrar por colección por defecto

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