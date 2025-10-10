"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

import { ProductCard } from "./ProductCard"
import type { CurrencyOption } from "@/stores/currency"
import type { Product } from "@/types/product"
import type { Collection } from "@/types/collection"
import apiClient from "@/lib/axiosConfig"
import type { PaginatedResponse } from "@/types/pagination"

interface CollectionCarouselProps {
  collectionId: string
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
  showExploreButton?: boolean
  fallbackTitle?: string
  emptyMessage?: string
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID

export function CollectionCarousel({ 
  collectionId,
  selectedCurrencyId, 
  acceptedCurrencies,
  showExploreButton = false,
  fallbackTitle = "PRODUCTOS",
  emptyMessage = "No hay productos para mostrar."
}: CollectionCarouselProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [collectionTitle, setCollectionTitle] = useState<string>(fallbackTitle)
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
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

  // Fetch de la colección y productos en paralelo
  useEffect(() => {
    const fetchData = async () => {
      if (!STORE_ID) {
        console.error("No store ID provided in environment variables")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Ejecutar ambos requests en paralelo para mejor performance
        const [collectionResponse, productsResponse] = await Promise.all([
          apiClient.get<Collection>(`/collections/${STORE_ID}/${collectionId}`),
          apiClient.get<PaginatedResponse<Product>>(
            `/products/store/${STORE_ID}?collectionIds=${collectionId}&limit=10&sortBy=createdAt&sortOrder=desc&status=ACTIVE,ARCHIVED`
          )
        ])
        
        setCollectionTitle(collectionResponse.data.title.toUpperCase())
        setProducts(productsResponse.data.data ?? [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionId])

  const handleExploreStore = () => {
    window.open("https://anjsports.com/tienda/", "_blank")
  }

  return (
    <section className="py-12 lg:py-16 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Título principal centrado */}
        <div className="text-center mb-8">
          <h2 className="font-druk text-4xl lg:text-2xl font-archivo-black text-gray-900 mb-4">
            {collectionTitle}
          </h2>
        </div>

        {/* Carrusel de productos con navegación */}
        <div className="w-full flex items-center gap-2">
          {/* Botón izquierda */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="p-2 disabled:opacity-30"
            aria-label="Anterior"
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
          >
            <ChevronLeft className="w-10 h-10 text-gray-700" />
          </button>

          <div className="overflow-hidden flex-1" ref={emblaRef}>
            <div className="flex gap-6">
              {loading ? (
                <div className="py-10 w-full text-center">
                  <p className="font-lato-thin text-sm text-gray-500">
                    Cargando productos...
                  </p>
                </div>
              ) : products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex-none w-[446px] sm:w-[498px] lg:w-[446px]"
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
                  <p className="font-lato-thin text-sm text-gray-500">
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
            className="p-2 disabled:opacity-30"
            aria-label="Siguiente"
            style={{ background: "none", border: "none", outline: "none", boxShadow: "none" }}
          >
            <ChevronRight className="w-10 h-10 text-gray-700" />
          </button>
        </div>

        {/* CTA explorar tienda (condicional) */}
        {showExploreButton && (
          <div className="text-center mt-8">
            <button
              onClick={handleExploreStore}
              className="border border-black bg-white text-black hover:bg-gray-100 px-6 py-2 text-sm font-light uppercase tracking-widest rounded-none font-['Roboto_Condensed']"
              aria-label="Explorar tienda"
            >
              EXPLORAR TIENDA
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

