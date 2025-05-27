"use client"

import { useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
 
import { ProductCard } from "./ProductCard"
import { useMainStore } from "@/stores/mainStore"
import type {Product} from "@/types/product"
export function ProductCarousel() {

  const { products } = useMainStore();
const [isLoading, setIsLoading] = useState(true);
const [caruselProducts, setCaruselProducts] = useState<Product[]>([]);
const hasFetched = useRef(false);


  // Este efecto se ejecuta cuando `products` cambia
  useEffect(() => {
    if (products.length > 0) {
      setCaruselProducts(products.slice(-10)); // Obtiene los últimos 10 productos
    }
  }, [products]);


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

  return (
    <section className="py-16 lg:py-24">
      <div className="container-section">
        <div className="content-section">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4  md:mb-8">
            <h2 className=" ">NUESTROS PRODUCTOS</h2>
            <a
              href="/productos"
              className="text-primary hover:text-primary/90 transition-colors flex items-center gap-2"
            >
              Explora nuestra tienda
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="relative">
            {/* Carousel */}
            <div className="overflow-hidden pt-4" ref={emblaRef}>
              <div className="flex">
                {products.slice(0, 6).map((product) => (
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

