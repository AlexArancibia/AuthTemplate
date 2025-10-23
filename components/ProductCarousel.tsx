"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

import { ProductCard } from "./ProductCard"
import { useMainStore } from "@/stores/mainStore"
import { ProductStatus } from "@/types/common"
import type { Product } from "@/types/product"
import apiClient from "@/lib/axiosConfig"

interface ProductCarouselProps {
  collectionName?: string
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID

export function ProductCarousel({ collectionName }: ProductCarouselProps) {
  // Estado local para los productos del carrusel
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const collections = useMainStore(state => state.collections)
  const fetchCollections = useMainStore(state => state.fetchCollections)

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

  // Cargar colecciones si no están disponibles
  useEffect(() => {
    if (collections.length === 0) {
      fetchCollections()
    }
  }, [collections, fetchCollections])

  // Cargar productos específicos para el carrusel
  useEffect(() => {
    const fetchCarouselProducts = async () => {
      if (!STORE_ID) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()
        queryParams.append('page', '1')
        queryParams.append('limit', '10')
        queryParams.append('sortBy', 'viewCount')
        queryParams.append('sortOrder', 'desc')
        queryParams.append('status[]', 'ACTIVE')
        queryParams.append('status[]', 'ARCHIVED')
        
        // Si se proporciona un nombre de colección, buscar su ID
        if (collectionName && collections.length > 0) {
          const collection = collections.find(col => 
            col.title === collectionName || col.slug === collectionName
          )
          
          if (collection) {
            queryParams.append('collectionIds[]', collection.id)
          }
        }

        const url = `/products/${STORE_ID}?${queryParams.toString()}`
        const response = await apiClient.get(url)
        
        const products = response.data.data || response.data || []
        setCarouselProducts(products)
      } catch (error) {
        console.error('Error fetching carousel products:', error)
        setCarouselProducts([])
      } finally {
        setLoading(false)
      }
    }

    // Solo cargar productos si tenemos colecciones disponibles (o si no se requiere filtro)
    if (!collectionName || collections.length > 0) {
      fetchCarouselProducts()
    }
  }, [collectionName, collections])

  // Filtrar productos que no estén en estado DRAFT
  const filteredProducts = carouselProducts.filter((product) => product.status !== ProductStatus.DRAFT)

  // Determinar título y enlace basado en si hay colección específica
  const title = "NUESTROS PRODUCTOS"
  const linkText = "Explora nuestra tienda"
  const linkHref = "/productos"

  if (loading) {
    return (
      <section className="py-16 lg:py-24 pb-8 lg:pb-24">
        <div className="container-section">
          <div className="content-section">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 md:mb-8">
              <h2 className=" ">{title}</h2>
              <a href={linkHref} className="text-primary hover:text-primary/90 transition-colors flex items-center gap-2">
                {linkText}
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Si no hay productos después de cargar, no mostrar la sección
  if (filteredProducts.length === 0) {
    return (
      <section className="py-16 lg:py-24 pb-8 lg:pb-24">
        <div className="container-section">
          <div className="content-section">
            <div className="text-center">
              <p className="text-gray-500">No hay productos disponibles en este momento.</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 pb-8 lg:pb-24">
      <div className="container-section">
        <div className="content-section">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 md:mb-8">
            <h2 className=" ">{title}</h2>
            <a href={linkHref} className="text-primary hover:text-primary/90 transition-colors flex items-center gap-2">
              {linkText}
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="relative">
            {/* Carousel */}
            <div className="overflow-hidden pt-4" ref={emblaRef}>
              <div className="flex">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] px-3">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className=" ">
              <Button
                variant="secondary"
                size="icon"
                className="absolute -left-4 top-1/2 -translate-y-1/2 bg-primary text-accent shadow-lg hover:bg-secondary disabled:opacity-50"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute -right-4 top-1/2 -translate-y-1/2 bg-primary text-accent shadow-lg hover:bg-secondary disabled:opacity-50"
                onClick={scrollNext}
                disabled={!canScrollNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
