"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

import { ProductCard } from "./ProductCard"
import type { CurrencyOption } from "@/stores/currency"
import type { Product } from "@/types/product"
import { useMainStore } from "@/stores/mainStore"

interface CollectionCarouselProps {
  collectionId: string
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
  showExploreButton?: boolean
  fallbackTitle?: string
  emptyMessage?: string
  className?: string
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID

export function CollectionCarousel({ 
  collectionId,
  selectedCurrencyId, 
  acceptedCurrencies,
  showExploreButton = false,
  fallbackTitle = "PRODUCTOS",
  emptyMessage = "No hay productos para mostrar.",
  className = "bg-white"
}: CollectionCarouselProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [collectionTitle, setCollectionTitle] = useState<string>(fallbackTitle)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    breakpoints: {
      "(min-width: 1024px)": { slidesToScroll: 3 },
      "(min-width: 768px)": { slidesToScroll: 2 }
    }
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = () => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi])

  // Fetch de la colección con sus productos
  useEffect(() => {
    const fetchData = async () => {
      if (!STORE_ID) {
        console.error("No store ID provided in environment variables")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Obtener el método getCollectionById del store
        const { getCollectionById } = useMainStore.getState()
        
        // La colección ya incluye los productos en su respuesta
        const collection = await getCollectionById(collectionId)
        
        setCollectionTitle(collection.title.toUpperCase())
        // Filtrar únicamente productos activos y ordenarlos por fecha de creación
        const filteredProducts = (collection.products ?? [])
          .filter((product) => product.status === 'ACTIVE')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
        
        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error fetching collection data:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionId])

  const handleExploreStore = () => {
    window.open("/productos", "_self")
  }

  return (
    <section ref={ref} className={`container-section  w-full py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="content-section">
        {/* Título principal centrado */}
        <div className="text-center mb-6 sm:mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="font-druk text-gray-900 mb-16"
          >
            {collectionTitle}
          </motion.h2>
        </div>

        {/* Carrusel de productos con navegación */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full relative"
        >
          {/* Botón izquierda (posición absoluta) */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 disabled:opacity-30 transition-opacity z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/15 cursor-pointer"
            aria-label="Anterior"
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-700" />
          </button>

          <div className="overflow-hidden w-full" ref={emblaRef}>
            <div className="flex gap-2 sm:gap-4 lg:gap-6">
              {loading ? (
                <div className="py-10 w-full text-center">
                  <p className="font-adi-regular text-sm text-gray-500">
                    Cargando productos...
                  </p>
                </div>
              ) : products.length > 0 ? (
                products.map((product) => (
                <div
                    key={product.id}
                    className="flex-none basis-[calc(50%-0.5rem)] max-w-[calc(50%-0.5rem)] sm:basis-[42%] sm:max-w-[42%] lg:basis-[32%] lg:max-w-[32%]"
                  >
                    <ProductCard
                      product={product}
                      selectedCurrencyId={selectedCurrencyId}
                      acceptedCurrencies={acceptedCurrencies}
                    />
                  </div>
                ))
              ) : (
                <div className="py-10 w-full text-center">
                  <p className="font-adi-regular text-sm text-gray-500">
                    {emptyMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botón derecha (posición absoluta) */}
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 disabled:opacity-30 transition-opacity z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/15 cursor-pointer"
            aria-label="Siguiente"
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-700" />
          </button>
        </motion.div>

        {/* CTA explorar tienda (condicional) */}
        {showExploreButton && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-6 sm:mt-8"
          >
            <button
              onClick={handleExploreStore}
              className="border border-black bg-white text-black hover:bg-gray-100 px-4 sm:px-6 py-2 text-xs sm:text-sm font-light uppercase tracking-widest rounded-none font-['Roboto_Condensed'] transition-colors"
              aria-label="Explorar tienda"
            >
              EXPLORAR TIENDA
            </button>
          </motion.div>
        )}
      </div>
    </section>
  )
}

