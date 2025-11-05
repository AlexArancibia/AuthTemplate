"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
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
import { getDeportistasFilenames, getDeportistaName } from "@/lib/deportistas-config"

const deportistasImages = getDeportistasFilenames()

const BREAKPOINTS = { mobile: 768, desktop: 1024 } as const
const ROTATION_SPEEDS = { normal: 360 / 20000, hover: 360 / 12000 } as const
const CAROUSEL_BUTTON_CLASSES = "z-50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-white hover:text-white bg-transparent backdrop-blur-md border-2 border-white/10 hover:bg-white/10 hover:border-white/50 transition-all"
const CIRCLE_PATH = "M 80, 80 m -45, 0 a 45,45 0 1,1 90,0 a 45,45 0 1,1 -90,0"

interface DeportistasCarouselProps {
  className?: string
  title?: string
  circularText?: string
}

const calculateScale = (normalized: number, isDesktop: boolean): number => {
  if (isDesktop) return normalized < 0.4 ? 1.0 : normalized < 1.2 ? 0.75 : 0.6
  return normalized < 0.5 ? 1.0 : 0.7
}

const getInitialIndex = (width: number, totalItems: number): number => {
  if (width >= BREAKPOINTS.desktop) return Math.max(0, totalItems - 2)
  if (width >= BREAKPOINTS.mobile) return Math.max(0, totalItems - 1)
  return 0
}

interface AthleteCardInCarouselProps {
  image: string
  index: number
  athleteName: string
  isPriority: boolean
  scale: number
  imageRef: (el: HTMLDivElement | null) => void
}

const TOUCH_DELAY = 300

function AthleteCardInCarousel({ 
  image, 
  index, 
  athleteName, 
  isPriority, 
  scale,
  imageRef 
}: AthleteCardInCarouselProps) {
  const [isActive, setIsActive] = useState(false)

  const handleInactive = () => {
    setTimeout(() => setIsActive(false), TOUCH_DELAY)
  }

  const isVisible = isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
  const translateY = isActive ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'

  return (
    <div className="w-full flex items-center justify-center max-h-[350px] sm:max-h-none" style={{ aspectRatio: '3/5' }}>
      <div 
        ref={imageRef}
        className="group relative w-full h-full overflow-hidden rounded-lg bg-muted shadow-sm hover:shadow-md transition-all duration-500 ease-out cursor-pointer"
        style={{ height: `${scale * 100}%`, aspectRatio: '3/5' }}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onTouchStart={() => setIsActive(true)}
        onTouchEnd={handleInactive}
      >
        <Image
          src={`/deportistas/${image}`}
          alt={athleteName}
          fill
          quality={100}
          priority={isPriority}
          loading={isPriority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-300"
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent transition-opacity duration-300 ${isVisible}`} />
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 ${translateY}`}>
          <h3 className="text-white text-lg font-bold line-clamp-2 break-words">{athleteName}</h3>
        </div>
      </div>
    </div>
  )
}

export function DeportistasCarousel({ 
  className,
  title = "DEPORTISTAS",
  circularText = "VER DEPORTISTAS"
}: DeportistasCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [scales, setScales] = useState<number[]>(() => Array(deportistasImages.length).fill(1))
  const [isHovered, setIsHovered] = useState(false)
  
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])
  const rotationText = useMotionValue(0)
  const animationRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef(0)
  const accumulatedRotationRef = useRef(0)
  const speedRef = useRef(ROTATION_SPEEDS.normal)

  // Animación de rotación continua
  useEffect(() => {
    speedRef.current = isHovered ? ROTATION_SPEEDS.hover : ROTATION_SPEEDS.normal

    const animate = (currentTime: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = currentTime
      
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      accumulatedRotationRef.current += speedRef.current * deltaTime
      rotationText.set(accumulatedRotationRef.current % 360)
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isHovered, rotationText])

  const handleInteraction = useCallback((hovered: boolean) => () => setIsHovered(hovered), [])

  const updateScales = useCallback(() => {
    requestAnimationFrame(() => {
      const width = window.innerWidth
      
      if (width < BREAKPOINTS.mobile) {
        setScales(prev => prev.every(s => s === 1) ? prev : Array(deportistasImages.length).fill(1))
        return
      }

      const viewportCenter = width / 2
      const isDesktop = width >= BREAKPOINTS.desktop
      
      setScales(imageRefs.current.map((ref) => {
        if (!ref) return 1
        const rect = ref.getBoundingClientRect()
        const normalized = Math.abs(rect.left + rect.width / 2 - viewportCenter) / rect.width
        return calculateScale(normalized, isDesktop)
      }))
    })
  }, [])

  useEffect(() => {
    if (!api) return

    const timeoutId = setTimeout(() => {
      api.scrollTo(getInitialIndex(window.innerWidth, deportistasImages.length), false)
    }, 50)

    requestAnimationFrame(() => requestAnimationFrame(updateScales))
    api.on('select', updateScales)
    api.on('scroll', updateScales)
    window.addEventListener('resize', updateScales)

    return () => {
      clearTimeout(timeoutId)
      api.off('select', updateScales)
      api.off('scroll', updateScales)
      window.removeEventListener('resize', updateScales)
    }
  }, [api, updateScales])

  return (
    <section className={cn("pt-6 pb-6 sm:pt-8 sm:pb-4 lg:pt-24 lg:pb-12 container-section bg-black text-white relative", className)}>
      {circularText && (
        <Link href="/nuestros-deportistas">
          <motion.div 
            className="hidden md:block absolute top-4 right-4 sm:top-8 sm:right-8 lg:top-12 lg:right-12 z-20 cursor-pointer"
            onHoverStart={handleInteraction(true)}
            onHoverEnd={handleInteraction(false)}
            onTouchStart={handleInteraction(true)}
            onTouchEnd={handleInteraction(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] lg:w-[192px] lg:h-[192px]">
              <motion.svg
                width="160"
                height="160"
                viewBox="0 0 160 160"
                className="absolute inset-0 w-full h-full overflow-visible"
                style={{ rotate: rotationText }}
              >
                <defs>
                  <path id="circlePath" d={CIRCLE_PATH} />
                </defs>
                <text fill="white" fontSize="11" fontWeight="bold" letterSpacing="1.5">
                  <textPath href="#circlePath" startOffset="0">
                    {circularText} • {circularText}  • 
                  </textPath>
                </text>
              </motion.svg>
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowUpRight 
                  className={cn(
                    "w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white transition-colors duration-300",
                    isHovered && "text-yellow-400"
                  )}
                  strokeWidth={2.5}
                />
              </motion.div>
            </div>
          </motion.div>
        </Link>
      )}
      {title && (
        <div className="content-section mb-6 sm:mb-12 lg:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center text-white pb-0 sm:pb-[15px]">
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
            {deportistasImages.map((image, index) => {
              const isPriority = index < 5
              const athleteName = getDeportistaName(image)
              return (
                <CarouselItem
                  key={image}
                  className="pl-4 md:pl-6 md:basis-1/3 lg:basis-1/5"
                >
                  <AthleteCardInCarousel
                    image={image}
                    index={index}
                    athleteName={athleteName}
                    isPriority={isPriority}
                    scale={scales[index]}
                    imageRef={(el) => { imageRefs.current[index] = el }}
                  />
                </CarouselItem>
              )
            })}
          </CarouselContent>
          <CarouselPrevious className={cn(CAROUSEL_BUTTON_CLASSES, "!left-2 md:!left-4 !top-1/2 -translate-y-1/2")} />
          <CarouselNext className={cn(CAROUSEL_BUTTON_CLASSES, "!right-2 md:!right-4 !top-1/2 -translate-y-1/2")} />
        </Carousel>
        
        {/* Gradientes de overlay */}
        <div className="hidden md:block absolute left-0 top-0 bottom-0 md:w-64 lg:w-80 xl:w-96 bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
        <div className="hidden md:block absolute right-0 top-0 bottom-0 md:w-64 lg:w-80 xl:w-96 bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
      </div>
      
      {/* Powered by section */}
      <div className="content-section mt-6 sm:mt-10 md:mt-12 lg:mt-[68px] flex items-center justify-center gap-3 sm:gap-4">
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

