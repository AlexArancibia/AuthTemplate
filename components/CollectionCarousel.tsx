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
    align: "center",
    loop: false,
    skipSnaps: false,
    dragFree: true,
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 3, align: "start" }, // lg: 3 productos, alineación izquierda
      '(min-width: 768px)': { slidesToScroll: 2, align: "start" },  // md: 2 productos, alineación izquierda
      '(max-width: 767px)': { slidesToScroll: 1, align: "center" }   // sm y menor: 1 producto, centrado
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
        // Filtrar solo productos activos o archivados, ordenados por fecha de creación
        const filteredProducts = (collection.products ?? [])
          .filter((product) => product.status === 'ACTIVE' || product.status === 'ARCHIVED')
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
          className="w-full flex items-center gap-1 sm:gap-2 px-2 sm:px-0"
        >
          {/* Botón izquierda */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="p-1 sm:p-2 disabled:opacity-30 hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Anterior"
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-700" />
          </button>

          <div className="overflow-hidden flex-1" ref={emblaRef}>
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
                    className="flex-none w-full sm:w-1/2 lg:w-1/3 px-2 sm:px-0"
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

          {/* Botón derecha */}
          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="p-1 sm:p-2 disabled:opacity-30 hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Siguiente"
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-700" />
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

