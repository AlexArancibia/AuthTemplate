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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function ProductsContent() {
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()

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
        <div className="container-section py-4 md:py-4">
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
    <main className="container-section pt-8">
      <div className="content-section pl-6 md:pl-8 lg:pl-16 pb-2 md:pb-0">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Tienda</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-3xl font-bold text-center">Tienda</h1>
      </div>
      {/* Sección de encabezado con efecto de fade-in */}
      {/* <motion.section
        className="relative py-24 sm:py-32 px-4 text-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/productsBanner.jpg')`,
          backgroundSize: '105%',
          backgroundPosition: 'center 19%',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 z-0 bg-pink-600/20"></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/100 via-black/40 to-black/30"></div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto flex flex-col items-center gap-6">
          <h1 className="font-druk text-4xl sm:text-5xl font-bold text-white text-center mb-6">
            Descubre Nuestras
            <br className="hidden sm:inline" />
            Ofertas
          </h1>

          <Link href="/productos">
            <button className=" bg-white text-black text-sm font-medium px-6 py-3 rounded-xs cursor-pointer">
              Ver más
            </button>
          </Link>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-24 px-4">
            <img src="/xiom.png" alt="Xiom" className="h-8 w-auto" />
            <img src="/sanwei.png" alt="Sanwei" className="h-8 w-auto" />
            <img src="/butter2.png" alt="Butterfly" className="h-8 w-auto" />
            <img src="/victas_logo2.png" alt="Victas" className="h-8 w-auto" />
          </div>
        </div>
      </motion.section> */}
      {/* Sección de productos con efecto de fade-in */}
      <motion.div
        className="container-section py-2 md:py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="content-section">
          {/* Botón de filtros para móviles */}
          <MobileFilterButton />
          
          {/* Layout de dos columnas: Sidebar + Productos */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar de Filtros - Ocupa 1 columna - Oculto en móviles */}
            <motion.div
              className="hidden lg:block lg:col-span-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ProductFilterSidebar />
            </motion.div>

            {/* Lista de Productos - Ocupa 3 columnas */}
            <motion.div
              className="lg:col-span-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ProductList
                initialSearchTerm={searchTerm}
                initialCategories={categories}
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
      <main className="min-h-screen bg-white">
        <div className="container-section py-16 md:py-16 bg-[url('/fondoproduct.jpg')] bg-cover">
          <div className="content-section text-center">
            <h2 className="text-white mb-2">Nuestros Productos</h2>
            <p className="text-white/90 text-lg">Descubre nuestra línea completa de productos de limpieza industrial</p>
          </div>
        </div>
        <div className="container-section py-0 md:py-0">
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