"use client"

import { useEffect, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
import ProductList from "./_components/ProductList"
import ProductListSkeleton from "./_components/ProductListSkeleton"

function ProductsContent() {
  const searchParams = useSearchParams()
  const categories = useMainStore(state => state.categories)
  const fetchCategories = useMainStore(state => state.fetchCategories)

  // Cargar categorías si no existen
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories()
    }
  }, [categories.length, fetchCategories])

  // Extraer parámetros de la URL
  const searchTerm = searchParams.get("search") || ""
  const categoriesParamFromURL = searchParams.getAll("category")
  const page = Number(searchParams.get("page") || "1")
  const sortBy = searchParams.get("sort") || "featured"
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined

  // Parsear filtros de variantes
  let variantFilters: Record<string, string[]> = {}
  const attributeFiltersParam = searchParams.get("attributeFilters")
  if (attributeFiltersParam) {
    try {
      variantFilters = JSON.parse(attributeFiltersParam)
    } catch (error) {
      console.error('Error parsing attributeFilters:', error)
    }
  }

  // Convertir slugs de categorías a IDs
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach(cat => map.set(cat.slug, cat.id))
    return map
  }, [categories])

  const categoriesParam = useMemo(() => {
    if (categoriesParamFromURL.length === 0 || categories.length === 0) return []
    return categoriesParamFromURL
      .map(slug => categoryMap.get(slug))
      .filter((id): id is string => id !== undefined)
  }, [categoriesParamFromURL, categoryMap, categories.length])

  // Título de la página
  const categorySlugMap = useMemo(() => {
    const map = new Map<string, typeof categories[0]>()
    categories.forEach(cat => map.set(cat.slug, cat))
    return map
  }, [categories])

  const selectedCategory = categoriesParamFromURL[0] ? categorySlugMap.get(categoriesParamFromURL[0]) || null : null
  const pageTitle = selectedCategory ? selectedCategory.name : "Nuestros Productos"
  const subtitle = selectedCategory 
    ? `Productos de la categoría ${selectedCategory.name.toLowerCase()}`
    : "Descubre nuestra línea completa de productos de limpieza industrial"

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="container-section py-16 bg-[url('/fondoproduct.jpg')] bg-cover">
        <div className="content-section text-center">
          <h1 className="text-white mb-2">{pageTitle}</h1>
          <p className="text-white/90 text-lg">{subtitle}</p>
        </div>
      </div>

      {/* Products Section */}
      <div className="container-section py-8 md:py-16">
        <div className="content-section">
          <ProductList
            initialSearchTerm={searchTerm}
            initialCategories={categoriesParam}
            initialPage={page}
            initialSortBy={sortBy}
            initialMinPrice={minPrice}
            initialMaxPrice={maxPrice}
            initialVariantFilters={variantFilters}
          />
        </div>
      </div>
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductListSkeleton />}>
      <ProductsContent />
    </Suspense>
  )
}