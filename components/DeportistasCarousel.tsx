"use client"

import * as React from "react"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { motion, useMotionValue } from "framer-motion"
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
  "123qwe123.png",
  "7L4A1296.JPG",
  "7L4A1410.JPG",
  "7L4A1416.JPG",
  "7L4A8794.JPG",
  "7L4A8888.JPG",
  "ASD123.png",
  "DSC_0036.JPG",
  "DSC_7959.JPG",
  "image.png",
  "ITP_3821.JPG",
  "Rodrigo Hidalgo.JPG",
  "WhatsApp Image 2025-10-14 at 13.53.55.jpeg",
  "Yenobi Tafur.JPG",
]

interface DeportistasCarouselProps {
  className?: string
  title?: string
  circularText?: string
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
  title = "DEPORTISTAS",
  circularText = "VER DEPORTISTAS"
}: DeportistasCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const imageRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [scales, setScales] = React.useState<number[]>(() => 
    deportistasImages.map(() => 1)
  )
  const [isHovered, setIsHovered] = React.useState(false)
  
  // Motion values para rotación continua
  const rotationText = useMotionValue(0)
  const animationRef = React.useRef<number | undefined>(undefined)
  const lastTimeRef = React.useRef<number>(0)
  const accumulatedRotationRef = React.useRef<number>(0)
  const speedRef = React.useRef<number>(360 / 20000) // velocidad inicial (20s por rotación)

  // Actualizar velocidad cuando cambia el hover (sin reiniciar animación)
  React.useEffect(() => {
    speedRef.current = isHovered ? 360 / 12000 : 360 / 20000 // 12s o 20s por rotación
  }, [isHovered])

  // Controlar animación de rotación continua (solo se monta una vez)
  React.useEffect(() => {
    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime
      }
      
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      
      // Incrementar rotación basado en velocidad y tiempo transcurrido
      accumulatedRotationRef.current += speedRef.current * deltaTime
      
      // Mantener rotación dentro de 0-360 para evitar números muy grandes
      const currentRotation = accumulatedRotationRef.current % 360
      
      rotationText.set(currentRotation)
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [rotationText])

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
    <section className={cn("pt-8 pb-4 sm:pt-12 sm:pb-6 lg:pt-24 lg:pb-12 container-section bg-black text-white relative", className)}>
      {/* Texto circular en la esquina superior derecha */}
      {circularText && (
        <motion.div 
          className="hidden md:block absolute top-4 right-4 sm:top-8 sm:right-8 lg:top-12 lg:right-12 z-20 cursor-pointer"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <style>
            {`
              @keyframes glowPulse {
                0%, 100% {
                  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.5));
                }
                50% {
                  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
                }
              }
            `}
          </style>
          <div 
            className="relative w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] lg:w-[192px] lg:h-[192px]"
            style={{
              animation: isHovered ? "glowPulse 3s ease-in-out infinite" : "none",
            }}
          >
            {/* SVG con texto que gira */}
            <motion.svg
              width="160"
              height="160"
              viewBox="0 0 160 160"
              className="absolute inset-0 w-full h-full"
              style={{ 
                overflow: "visible",
                rotate: rotationText,
              }}
            >
              <defs>
                <path
                  id="circlePath"
                  d="M 80, 80 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"
                />
              </defs>
              <text
                fill="white"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="1.5"
              >
                <textPath
                  href="#circlePath"
                  startOffset="0"
                >
                  {circularText} • {circularText}  • 
                </textPath>
              </text>
            </motion.svg>
            {/* Ícono de flecha diagonal en el centro sin rotación */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowUpRight 
                  className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white transition-colors duration-300 ${isHovered ? 'text-yellow-400' : ''}`}
                  strokeWidth={2.5}
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
      {title && (
        <div className="content-section mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white pb-[15px]">
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
      
      {/* Powered by section */}
      <div className="content-section mt-[68px] flex items-center justify-center gap-3 sm:gap-4">
        <span className="text-white text-sm sm:text-lg md:text-xl font-semibold tracking-wide uppercase">
          powered by:
        </span>
        <Image
          src="/xiom.png"
          alt="XIOM"
          width={130}
          height={52}
          className="h-auto w-20 sm:w-28 md:w-32 object-contain"
        />
      </div>
    </section>
  )
}
