"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

import { ProductCard } from "./ProductCard"
import { useMainStore } from "@/stores/mainStore"
import { ProductStatus } from "@/types/common"
import type { CurrencyOption } from "@/stores/currency";

interface ProductCarouselProps {
  collectionName?: string
  selectedCurrencyId: String
  acceptedCurrencies: CurrencyOption[];
}

// Componente para una sección de categorías con carrusel
function CategorySection({ 
  title, 
  categories, 
  products, 
  selectedCurrencyId, 
  acceptedCurrencies 
}: {
  title: string
  categories: string[]
  products: any[]
  selectedCurrencyId: String
  acceptedCurrencies: CurrencyOption[]
}) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "")
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
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
    }
  }, [emblaApi])

  // Filtrar productos por categoría seleccionada
  const filteredProducts = products.filter((product) =>
    product.collections?.some((c: any) => c.title === selectedCategory)
  )

  const orderedCategoriesMap: Record<string, string[]> = {
    XIOM: ["Jekyll & Hyde", "Omega VII", "Vega", "FT Igre"],
    BUTTERFLY: ["Jebes", "Maderas", "Zapatillas"],
  }

  const currentBrand = categories[0]?.split(" ")[0].toUpperCase()
  
  const orderedCategories = (orderedCategoriesMap[currentBrand] || []).map((name) =>
    categories.find((cat) => cat.toLowerCase().includes(name.toLowerCase()))
  ).filter((cat): cat is string => Boolean(cat))

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título principal centrado */}
        <div className="text-center mb-8">
          <h2 className="font-druk text-xl sm:text-2xl md:text-3xl lg:text-4xl font-archivo-black text-gray-900 mb-4">
            {title}
          </h2>
        </div>

        {/* Navegación de categorías centrada - Solo texto */}
        <div className="flex flex-wrap justify-center gap-x-8 sm:gap-x-16 lg:gap-x-24 gap-y-4 sm:gap-y-6 mb-8 sm:mb-12">
          {orderedCategories.map((category) => {
            const words = category.split(" ")
            const cleanCategory = words.slice(1).join(" ")

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? "text-black"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cleanCategory.toUpperCase()}
              </button>
            )
          })}
        </div>


        {/* Carrusel de productos con navegación */}
        <div className="w-full flex items-center gap-2">
          {/* Botón izquierda */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="p-2 disabled:opacity-30"
            aria-label="Anterior"
            style={{ background: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
          >
            <ChevronLeft className="w-10 h-10 text-gray-700" />
          </button>
          <div className="overflow-hidden flex-1 touch-pan-y" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6">
              {filteredProducts.slice(0, 10).map((product) => (
                <div key={product.id} className="flex-none w-[280px] sm:w-[320px] md:w-[380px] lg:w-[446px]">
                  <ProductCard
                    product={product}
                    selectedCurrencyId={selectedCurrencyId}
                    acceptedCurrencies={acceptedCurrencies}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Botón derecha */}
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="p-2 disabled:opacity-30"
            aria-label="Siguiente"
            style={{ background: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
          >
            <ChevronRight className="w-10 h-10 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  )
}

export function ProductCarousel({ collectionName, selectedCurrencyId, acceptedCurrencies }: ProductCarouselProps) {
  const { products } = useMainStore()

  // Filtrar productos que no estén en estado DRAFT
  const filteredProducts = products.filter((product) => product.status !== ProductStatus.DRAFT)

  // Agrupar productos por colección
  const collectionsMap: Record<string, any[]> = {}

  filteredProducts.forEach((product) => {
    product.collections?.forEach((collection) => {
      const title = collection.title
      if (!collectionsMap[title]) {
        collectionsMap[title] = []
      }
      collectionsMap[title].push(product)
    })
  })

  // Separar colecciones por marca (XIOM y BUTTERFLY)
  const xiomCollections = Object.keys(collectionsMap).filter(title => 
    title.toLowerCase().includes('xiom')
  )
  const butterflyCollections = Object.keys(collectionsMap).filter(title => 
    title.toLowerCase().includes('butterfly')
  )

  // Si existe collectionName específico, mostrar solo esa colección
  if (collectionName) {
    const specificProducts = filteredProducts.filter((product) =>
      product.collections?.some((c) => c.title === collectionName),
    )

    return (
      <section className="py-16 lg:py-24 pb-8 lg:pb-24 bg-white">
        <div className="container-section">
          <div className="content-section">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">NUESTROS PRODUCTOS</h2>
              <a href="/productos" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2 font-medium">
                Explora nuestra tienda
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="w-full flex items-center gap-2">
              {/* Botón izquierda */}
              <button
                onClick={() => {}}
                disabled={false}
                className="p-2 disabled:opacity-30"
                aria-label="Anterior"
                style={{ background: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
              >
                <ChevronLeft className="w-10 h-10 text-gray-700" />
              </button>
              <div className="overflow-hidden flex-1">
                <div className="flex gap-4 sm:gap-6">
                  {specificProducts.slice(0, 10).map((product) => (
                    <div key={product.id} className="flex-[0_0_280px] min-w-0 sm:flex-[0_0_320px] md:flex-[0_0_380px] lg:flex-[0_0_446px]">
                      <ProductCard
                        product={product}
                        selectedCurrencyId={selectedCurrencyId}
                        acceptedCurrencies={acceptedCurrencies}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {/* Botón derecha */}
              <button
                onClick={() => {}}
                disabled={false}
                className="p-2 disabled:opacity-30"
                aria-label="Siguiente"
                style={{ background: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
              >
                <ChevronRight className="w-10 h-10 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Mostrar secciones separadas para XIOM y BUTTERFLY
  return (
    <>
      {xiomCollections.length > 0 && (
        <CategorySection
          title="POPULAR EN XIOM"
          categories={xiomCollections}
          products={filteredProducts}
          selectedCurrencyId={selectedCurrencyId}
          acceptedCurrencies={acceptedCurrencies}
        />
      )}
      
      {butterflyCollections.length > 0 && (
        <CategorySection
          title="POPULAR EN BUTTERFLY"
          categories={butterflyCollections}
          products={filteredProducts}
          selectedCurrencyId={selectedCurrencyId}
          acceptedCurrencies={acceptedCurrencies}
        />
      )}
    </>
  )
}
