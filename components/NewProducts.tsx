"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"

import { ProductCard } from "./ProductCard"
import { useMainStore } from "@/stores/mainStore"
import { ProductStatus } from "@/types/common"
import type { CurrencyOption } from "@/stores/currency"

interface NewProductsProps {
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
}

export function NewProducts({ selectedCurrencyId, acceptedCurrencies }: NewProductsProps) {
  const { products } = useMainStore()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true, // igual que en CategorySection
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

  // Filtrar no DRAFT y ordenar por fecha (más recientes primero)
  const filteredProducts = (products ?? [])
    .filter((p) => p?.status !== ProductStatus.DRAFT)
    .sort((a, b) => {
      const dateA = new Date(a?.createdAt ?? 0).getTime()
      const dateB = new Date(b?.createdAt ?? 0).getTime()
      return dateB - dateA
    })
    .slice(0, 10)

  const handleExploreStore = () => {
    window.open("https://anjsports.com/tienda/", "_blank")
  }

  return (
    <section className="py-12 lg:py-16 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Título principal centrado (mismas fuentes) */}
        <div className="text-center mb-8">
          <h2 className="font-druk text-4xl lg:text-2xl font-archivo-black text-gray-900 mb-4">
            ÚLTIMOS PRODUCTOS
          </h2>
        </div>

        {/* Carrusel de productos con navegación (idéntico a ProductCarousel) */}
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
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
                    Aún no hay productos recientes para mostrar.
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

        {/* CTA explorar tienda (misma estética, tipografía indicada) */}
        <div className="text-center mt-8">
          <button
            onClick={handleExploreStore}
            className="border border-black bg-white text-black hover:bg-gray-100 px-6 py-2 text-sm font-light uppercase tracking-widest rounded-none font-['Roboto_Condensed']"
            aria-label="Explorar tienda"
          >
            EXPLORAR TIENDA
          </button>
        </div>
      </div>
    </section>
  )
}
