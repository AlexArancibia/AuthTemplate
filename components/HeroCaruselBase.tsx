"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { HeroSection as HeroSectionType } from "@/types/heroSection"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import { HeroSlide } from "./HeroSlide"

interface HeroCarouselBaseProps {
  heroSections: HeroSectionType[]
  autoplayInterval?: number
  transitionDuration?: number
  showControls?: boolean
  showIndicators?: boolean
  showPauseButton?: boolean
  containerHeight?: string
}

export function HeroCarouselBase({
  heroSections,
  autoplayInterval = 8000,
  transitionDuration = 700,
  showControls = true,
  showIndicators = true,
  showPauseButton = true,
  containerHeight = "calc(100vh)",
}: HeroCarouselBaseProps) {
  // Ordenar heroSections por prioridad (0 es más importante)
  const sortedHeroSections = useMemo(() => {
    return [...heroSections].sort((a, b) => {
      const priorityA = a.metadata?.priority ?? Number.MAX_SAFE_INTEGER
      const priorityB = b.metadata?.priority ?? Number.MAX_SAFE_INTEGER
      return priorityA - priorityB
    })
  }, [heroSections])

  // Estados para el carrusel
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Referencias para los timers
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Constantes
  const PROGRESS_UPDATE_INTERVAL = 30 // 30ms para actualización más suave

  // Variantes para las animaciones de slide (fade effect)
  const slideVariants = {
    enter: {
      opacity: 0,
      scale: 1,
      zIndex: 2,
    },
    center: {
      opacity: 1,
      scale: 1,
      zIndex: 2,
    },
    exit: {
      opacity: 0,
      scale: 1,
      zIndex: 1,
    },
  }

  // Función para avanzar al siguiente slide
  const nextSlide = () => {
    if (isTransitioning || sortedHeroSections.length <= 1) return
    setIsTransitioning(true)
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex === sortedHeroSections.length - 1 ? 0 : prevIndex + 1))
    resetProgress()

    // Desactivar el estado de transición después de que termine
    setTimeout(() => {
      setIsTransitioning(false)
    }, transitionDuration)
  }

  // Función para retroceder al slide anterior
  const prevSlide = () => {
    if (isTransitioning || sortedHeroSections.length <= 1) return
    setIsTransitioning(true)
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? sortedHeroSections.length - 1 : prevIndex - 1))
    resetProgress()

    // Desactivar el estado de transición después de que termine
    setTimeout(() => {
      setIsTransitioning(false)
    }, transitionDuration)
  }

  // Función para ir a un slide específico
  const goToSlide = (index: number) => {
    if (index === currentIndex || isTransitioning || sortedHeroSections.length <= 1) return

    setIsTransitioning(true)
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
    resetProgress()

    // Desactivar el estado de transición después de que termine
    setTimeout(() => {
      setIsTransitioning(false)
    }, transitionDuration)
  }

  // Función para alternar pausa/reproducción
  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  // Función para reiniciar el progreso
  const resetProgress = () => {
    setProgress(0)

    // Limpiar el timer de progreso existente
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }


  // Función para iniciar el autoplay
  const startAutoplay = () => {
    // Limpiar el timer existente
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Configurar un nuevo timer
    timerRef.current = setInterval(() => {
      if (!isPaused && !isTransitioning) {
        nextSlide()
      }
    }, autoplayInterval)
  }

  // Función para iniciar el timer de progreso
  const startProgressTimer = () => {
    // Limpiar el timer existente
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
    }

    // Reiniciar el progreso
    setProgress(0)

    // Configurar un nuevo timer para actualizar el progreso
    progressTimerRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          const newProgress = prev + (PROGRESS_UPDATE_INTERVAL / autoplayInterval) * 100
          return newProgress > 100 ? 100 : newProgress
        })
      }
    }, PROGRESS_UPDATE_INTERVAL)
  }

  // Efecto para el autoplay y progreso
  useEffect(() => {
    if (sortedHeroSections.length <= 1) return

    if (!isPaused && !isTransitioning) {
      startAutoplay()
      startProgressTimer()
    } else {
      // Limpiar timers si está pausado o en transición
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (progressTimerRef.current && isPaused) {
        clearInterval(progressTimerRef.current)
        progressTimerRef.current = null
      }
    }

    // Limpiar al desmontar
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current)
      }
    }
  }, [isPaused, isTransitioning, currentIndex, sortedHeroSections.length, autoplayInterval])

  // Manejar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (sortedHeroSections.length <= 1) return

      if (e.key === "ArrowLeft") {
        prevSlide()
      } else if (e.key === "ArrowRight") {
        nextSlide()
      } else if (e.key === " ") {
        togglePause()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isTransitioning, sortedHeroSections.length])

  // Si no hay secciones, no mostrar nada
  if (sortedHeroSections.length === 0) {
    return null
  }

  // Si solo hay una sección, mostrarla sin controles
  if (sortedHeroSections.length === 1) {
    return (
      <div className="w-full overflow-hidden">
        <HeroSlide heroSection={sortedHeroSections[0]} />
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden relative" ref={carouselRef}>
      {/* Carrusel principal */}
      <div
        className="relative w-full"
        style={{
          height: containerHeight,
          willChange: "transform", // Optimización de rendimiento
        }}
      >
        {/* Modo "sync" para evitar flash blanco entre transiciones */}
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              opacity: {
                duration: (transitionDuration / 1000) * 0.8,
                ease: "easeInOut",
              },
              scale: {
                duration: (transitionDuration / 1000) * 0.8,
                ease: "easeInOut",
              },
            }}
            className="w-full absolute inset-0"
            style={{
              willChange: "opacity, transform", // Optimización de rendimiento
            }}
          >
            <HeroSlide heroSection={sortedHeroSections[currentIndex]} slideIndex={currentIndex} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Botones de navegación */}
      {showControls && (
        <div className="absolute inset-0 px-4 md:px-2 flex items-center justify-between pointer-events-none mt-90 lg:mt-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 text-secondary shadow-md pointer-events-auto hover:bg-white/30 transition-all duration-200 z-20 hover:scale-110 backdrop-blur-sm"
            onClick={prevSlide}
            aria-label="Slide anterior"
            disabled={isTransitioning}
          >
            <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/20 text-secondary shadow-md pointer-events-auto hover:bg-white/30 transition-all duration-200 z-20 hover:scale-110 backdrop-blur-sm"
            onClick={nextSlide}
            aria-label="Siguiente slide"
            disabled={isTransitioning}
          >
            <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
          </Button>
        </div>
      )}

      {/* Indicadores de avance y botón de pausa */}
      {(showIndicators || showPauseButton) && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-20">
          {/* Barras de progreso */}
          {showIndicators && (
            <div className="flex gap-2 items-center">
              {sortedHeroSections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`group relative h-2 rounded-full overflow-hidden transition-all duration-300 backdrop-blur-sm shadow-lg ${
                    index === currentIndex
                      ? "bg-white/80 scale-[1.05] w-[50px] md:w-[80px] shadow-white/50"
                      : "bg-white/40 w-[30px] md:w-[50px] hover:bg-white/60 shadow-white/30"
                  }`}
                  aria-label={`Ir a la diapositiva ${index + 1}`}
                  disabled={isTransitioning}
                >
                  {index === currentIndex && (
                    <motion.div
                      className="absolute inset-0 bg-white shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: "linear" }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Botón de pausa/reproducción */}
          {showPauseButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-white/20 text-primary shadow-md hover:bg-white/30 transition-all duration-200 hover:scale-110 backdrop-blur-sm"
              onClick={togglePause}
              aria-label={isPaused ? "Reproducir" : "Pausar"}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
