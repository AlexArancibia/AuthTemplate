"use client"

import * as React from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

const deportistasImages = [
  "7L4A1296.JPG",
  "7L4A1410.JPG",
  "7L4A1416.JPG",
  "7L4A8794.JPG",
  "7L4A8888.JPG",
  "DSC_0036.JPG",
  "DSC_0410.JPG",
  "DSC_7959.JPG",
  "ITP_3821.JPG",
  "Rodrigo Hidalgo.JPG",
  "WhatsApp Image 2025-10-14 at 13.51.18.jpeg",
  "WhatsApp Image 2025-10-14 at 13.53.55.jpeg",
  "WhatsApp Image 2025-10-14 at 13.55.11.jpeg",
  "Yenobi Tafur.JPG",
]

interface DeportistasCarouselProps {
  className?: string
  title?: string
}

const calculateScale = (normalized: number, isDesktop: boolean): number => {
  if (isDesktop) {
    // Desktop: 3 niveles de escala
    if (normalized < 0.4) return 1.0
    if (normalized < 1.2) return 0.75
    return 0.6
  }
  // Tablet: 2 niveles de escala
  return normalized < 0.5 ? 1.0 : 0.7
}

export function DeportistasCarousel({ 
  className,
  title = "DEPORTISTAS"
}: DeportistasCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const imageRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [scales, setScales] = React.useState<number[]>(() => 
    deportistasImages.map(() => 1)
  )

  const updateScales = React.useCallback(() => {
    // Usar requestAnimationFrame para asegurar que todos los cálculos y actualizaciones
    // se hagan en el mismo frame, sincronizando todas las transiciones
    requestAnimationFrame(() => {
      const width = window.innerWidth
      
      if (width < 768) {
        setScales(prev => prev.every(s => s === 1) ? prev : deportistasImages.map(() => 1))
        return
      }

      const viewportCenter = width / 2
      const isDesktop = width >= 1024
      
      // Calcular todos los valores de escala primero
      const newScales = imageRefs.current.map((ref) => {
        if (!ref) return 1

        const rect = ref.getBoundingClientRect()
        const imageCenter = rect.left + rect.width / 2
        const distance = Math.abs(imageCenter - viewportCenter)
        const normalized = distance / rect.width

        return calculateScale(normalized, isDesktop)
      })

      // Actualizar todos los valores de una vez en el mismo frame
      setScales(newScales)
    })
  }, [])

  React.useEffect(() => {
    if (!api) return

    // Initial update usando requestAnimationFrame para sincronizar con el render
    requestAnimationFrame(() => {
      requestAnimationFrame(updateScales)
    })

    // Usar 'select' en lugar de 'scroll' para una mejor sincronización con las flechas
    const handleScroll = () => {
      updateScales()
    }

    api.on('select', handleScroll)
    api.on('scroll', handleScroll)
    window.addEventListener('resize', updateScales)

    return () => {
      api.off('select', handleScroll)
      api.off('scroll', handleScroll)
      window.removeEventListener('resize', updateScales)
    }
  }, [api, updateScales])

  return (
    <section className={cn("py-8 sm:py-12 lg:py-24 container-section bg-black text-white", className)}>
      {title && (
        <div className="content-section mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white">
            {title}
          </h2>
        </div>
      )}
      <div className="content-section mx-auto px-4 relative">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full mx-auto"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {deportistasImages.map((image, index) => (
              <CarouselItem
                key={image}
                className="pl-4 md:pl-6 md:basis-1/3 lg:basis-1/5"
              >
                <div className="w-full flex items-center justify-center" style={{ aspectRatio: '3/5' }}>
                  <div 
                    ref={(el) => { imageRefs.current[index] = el }}
                    className="relative w-full overflow-hidden rounded-lg bg-muted transition-all duration-300 ease-out"
                    style={{
                      height: `${scales[index] * 100}%`,
                      aspectRatio: '3/5',
                      transition: 'height 300ms ease-out, transform 300ms ease-out',
                    }}
                  >
                    <Image
                      src={`/deportistas/${image}`}
                      alt={`Deportista ${index + 1}`}
                      fill
                      quality={100}
                      priority={index < 5}
                      loading={index < 5 ? "eager" : "lazy"}
                      className="object-cover"
                    />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:left-4 z-50 w-14 h-14 md:w-16 md:h-16 text-white hover:text-white bg-transparent backdrop-blur-md border-2 border-white/10 hover:bg-white/10 hover:border-white/50 transition-all" />
          <CarouselNext className="right-2 md:right-4 z-50 w-14 h-14 md:w-16 md:h-16 text-white hover:text-white bg-transparent backdrop-blur-md border-2 border-white/10 hover:bg-white/10 hover:border-white/50 transition-all" />
        </Carousel>
        
        {/* Gradientes de overlay */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 md:w-64 lg:w-80 xl:w-96 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
        <div className="hidden md:block absolute right-0 top-0 bottom-0 md:w-64 lg:w-80 xl:w-96 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
      </div>
    </section>
  )
}
