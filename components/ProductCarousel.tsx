"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

import { ProductCard } from "./ProductCard"
import { useMainStore } from "@/stores/mainStore"
import { ProductStatus } from "@/types/common"

interface ProductCarouselProps {
  collectionName?: string
}

export function ProductCarousel({ collectionName }: ProductCarouselProps) {
  const { products } = useMainStore()

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

  // Filtrar productos que no estén en estado DRAFT
  let filteredProducts = products.filter((product) => product.status !== ProductStatus.DRAFT)

  // Si existe collectionName, filtrar por colección específica
  if (collectionName) {
    filteredProducts = filteredProducts.filter((product) =>
      product.collections?.some((c) => c.title === collectionName),
    )
  }

  // Determinar título y enlace basado en si hay colección específica
  const title =  "NUESTROS PRODUCTOS"
  const linkText = "Explora nuestra tienda"
  const linkHref = "/productos"

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
                {filteredProducts.slice(0, 10).map((product) => (
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
