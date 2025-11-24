"use client"

import { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { getDeportistasFilenames, getDeportistaName } from "@/lib/deportistas-config"
import { useOrientation } from "@/hooks/useOrientation"
import { cn } from "@/lib/utils"

const encodePath = (path: string) => 
  path.split('/').map(p => p ? encodeURIComponent(p) : '').join('/')

const deportistasImages = getDeportistasFilenames()

interface DeportistasCarouselMobileProps {
  className?: string
  title?: string
}

function AthleteCardMobile({ 
  image, 
  athleteName, 
  isPriority 
}: { 
  image: string
  athleteName: string
  isPriority: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="w-full">
      <Link href="/nuestros-deportistas" className="block w-full">
        <div 
          className="group relative w-full overflow-hidden rounded-lg bg-muted shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
          style={{ aspectRatio: '3/5', minHeight: '200px' }}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setTimeout(() => setIsHovered(false), 300)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={encodePath(`/deportistas/${image}`)}
            alt={athleteName}
            fill
            quality={85}
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
            <h3 className="text-white text-sm font-bold line-clamp-2 break-words">{athleteName}</h3>
          </div>
        </div>
      </Link>
    </div>
  )
}

export function DeportistasCarouselMobile({ 
  className,
  title = "DEPORTISTAS"
}: DeportistasCarouselMobileProps) {
  // Usar hook personalizado para detectar orientación
  const isLandscape = useOrientation()

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    skipSnaps: false,
    dragFree: true,
    containScroll: "trimSnaps",
    slidesToScroll: 1
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  // Memoizar callbacks para evitar re-renders innecesarios
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi])

  // Re-inicializar cuando cambia la orientación
  useEffect(() => {
    if (!emblaApi) return
    
    // Delay para asegurar que el layout se haya actualizado después del cambio de orientación
    const timeoutId = setTimeout(() => {
      emblaApi.reInit()
    }, 200)
    
    return () => clearTimeout(timeoutId)
  }, [emblaApi, isLandscape])

  return (
    <section className={cn("pt-6 pb-6 container-section bg-black text-white relative", className)}>
      {title && (
        <div className="content-section mb-6">
          <h2 className="text-xl font-bold text-center text-white pb-0">
            {title}
          </h2>
        </div>
      )}
      
      <div className="content-section mx-auto px-4 relative">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 disabled:opacity-30 transition-opacity z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="overflow-hidden w-full" ref={emblaRef}>
          <div className="flex">
            {deportistasImages.map((image, index) => {
              const athleteName = getDeportistaName(image)
              // Calcular prioridad: primeras 3 en landscape, primera en portrait
              const isPriority = index < (isLandscape ? 3 : 1)
              
              return (
                <div
                  key={image}
                  className={cn(
                    "flex-none mr-3",
                    isLandscape 
                      ? "basis-[calc(33.333%-0.75rem)] max-w-[calc(33.333%-0.75rem)]"
                      : "basis-full max-w-full"
                  )}
                >
                  <AthleteCardMobile
                    image={image}
                    athleteName={athleteName}
                    isPriority={isPriority}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 disabled:opacity-30 transition-opacity z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>
      
      <div className="content-section mt-6 flex items-center justify-center gap-3">
        <span className="text-white text-sm font-semibold tracking-wide uppercase">
          powered by:
        </span>
        <Image
          src="/xiom.png"
          alt="XIOM"
          width={130}
          height={52}
          className="h-auto w-20 object-contain"
        />
      </div>
    </section>
  )
}

