"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
 
import type { CardSection, Card, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface CardComponentProps {
  card: Card
  index: number
}

interface CardSectionRendererProps {
  cardSection: CardSection
}

interface CardSectionsContainerProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

// Componente individual para renderizar una tarjeta
function CardComponent({ card, index }: CardComponentProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100)
    return () => clearTimeout(timer)
  }, [index])

  if (!card.isActive) return null

  // Verificar visibilidad por dispositivo
  const isVisibleOnDevice = () => {
    if (!card.metadata?.visibility) return true

    // En el cliente, podemos usar window.innerWidth para determinar el dispositivo
    if (typeof window !== "undefined") {
      const width = window.innerWidth
      if (width < 768 && !card.metadata.visibility.mobile) return false
      if (width >= 768 && width < 1024 && !card.metadata.visibility.tablet) return false
      if (width >= 1024 && !card.metadata.visibility.desktop) return false
    }

    return true
  }

  if (!isVisibleOnDevice()) return null

  const cardStyles = {
    backgroundColor: card.backgroundColor || "transparent",
    color: card.textColor || "inherit",
    border: card.styles?.border || "none",
    boxShadow: card.styles?.shadow || "none",
    borderRadius: card.styles?.borderRadius || "0.5rem",
    padding: card.styles?.padding || "1.5rem",
    margin: card.styles?.margin || "0",
    textAlign: card.styles?.textAlign || ("left" as const),
  }

  const hoverEffect = card.styles?.hoverEffect || "none"

  const getHoverClasses = () => {
    switch (hoverEffect) {
      case "scale":
        return "hover:scale-105 transition-transform duration-300"
      case "shadow":
        return "hover:shadow-lg transition-shadow duration-300"
      case "fade":
        return "hover:opacity-80 transition-opacity duration-300"
      default:
        return ""
    }
  }

  const CardContent = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`h-full ${getHoverClasses()}`}
      style={cardStyles}
    >
      {card.imageUrl && (
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
          <Image src={card.imageUrl || "/placeholder.svg"} alt={card.title} fill className="object-cover" />
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xl font-semibold">{card.title}</h3>

        {card.subtitle && <p className="text-lg text-muted-foreground">{card.subtitle}</p>}

        {card.description && (
          <div
            className="text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: card.description }}
          />
        )}

        {card.linkUrl && card.linkText && (
          <div className="pt-4">
            <Button variant="outline" asChild>
              <span>{card.linkText}</span>
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )

  // Si hay un link, envolver en Link, sino solo mostrar el contenido
  if (card.linkUrl) {
    return (
      <Link href={card.linkUrl} className="block h-full">
        <CardContent />
      </Link>
    )
  }

  return <CardContent />
}

// Componente para renderizar una sección individual de tarjetas
function CardSectionRenderer({ cardSection }: CardSectionRendererProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: cardSection.styles?.carouselOptions?.loop ?? true,
    align: "start",
  })

  // Autoplay manual
  useEffect(() => {
    if (!emblaApi || !cardSection.styles?.carouselOptions?.autoplay) return

    const autoplay = setInterval(() => {
      emblaApi.scrollNext()
    }, 3000) // 3 segundos

    return () => clearInterval(autoplay)
  }, [emblaApi, cardSection.styles?.carouselOptions?.autoplay])

  if (!cardSection.isActive) return null

  // Filtrar y ordenar las tarjetas activas
  const activeCards = (cardSection.cards || [])
    .filter((card) => card.isActive)
    .sort((a, b) => a.position - b.position)
    .slice(0, cardSection.maxCards || undefined)

  if (activeCards.length === 0) return null

  const sectionStyles = {
    backgroundColor: cardSection.backgroundColor || "transparent",
    color: cardSection.textColor || "inherit",
    padding: cardSection.styles?.padding || "4rem 0",
    margin: cardSection.styles?.margin || "0",
  }

  const layout = cardSection.styles?.layout || cardSection.layout || "grid"
  const gap = cardSection.styles?.gap || "1.5rem"

  // Función para obtener las clases de grid responsivo
  const getGridClasses = () => {
    const columns = cardSection.styles?.gridColumns || { mobile: 1, tablet: 2, desktop: 3 }
    return `grid grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop}`
  }

  // Función para obtener las clases de layout
  const getLayoutClasses = () => {
    switch (layout) {
      case "grid":
        return getGridClasses()
      case "flex":
        return "flex flex-wrap"
      case "masonry":
        return "columns-1 md:columns-2 lg:columns-3 gap-6"
      case "carousel":
        return "overflow-hidden"
      default:
        return getGridClasses()
    }
  }

  const renderCards = () => {
    if (layout === "carousel") {
      return (
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {activeCards.map((card, index) => (
                <div key={card.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] px-3">
                  <CardComponent card={card} index={index} />
                </div>
              ))}
            </div>
          </div>

          {cardSection.styles?.carouselOptions?.arrows !== false && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }

    if (layout === "masonry") {
      return (
        <div className={getLayoutClasses()}>
          {activeCards.map((card, index) => (
            <div key={card.id} className="break-inside-avoid mb-6">
              <CardComponent card={card} index={index} />
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className={getLayoutClasses()} style={{ gap }}>
        {activeCards.map((card, index) => (
          <div key={card.id}>
            <CardComponent card={card} index={index} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <section style={sectionStyles} className="w-full">
      <div className="container mx-auto px-4">
        {/* Header de la sección */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{cardSection.title}</h2>

          {cardSection.subtitle && <p className="text-xl text-muted-foreground mb-4">{cardSection.subtitle}</p>}

          {cardSection.description && (
            <div
              className="text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: cardSection.description }}
            />
          )}
        </motion.div>

        {/* Contenido de las tarjetas */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {renderCards()}
        </motion.div>
      </div>
    </section>
  )
}

// Función para verificar si los metadatos coinciden
function matchesMetadata(
  sectionMetadata: CardSectionMetadata | null | undefined,
  searchMetadata: Partial<CardSectionMetadata>,
): boolean {
  if (!sectionMetadata || !searchMetadata) return false

  // Verificar tags si se proporcionan
  if (searchMetadata.tags && searchMetadata.tags.length > 0) {
    if (!sectionMetadata.tags || sectionMetadata.tags.length === 0) return false

    // Verificar si al menos uno de los tags coincide
    const hasMatchingTag = searchMetadata.tags.some((tag) => sectionMetadata.tags?.includes(tag))
    if (!hasMatchingTag) return false
  }

  // Verificar seoTitle si se proporciona
  if (searchMetadata.seoTitle) {
    if (!sectionMetadata.seoTitle || sectionMetadata.seoTitle !== searchMetadata.seoTitle) return false
  }

  // Verificar seoDescription si se proporciona
  if (searchMetadata.seoDescription) {
    if (!sectionMetadata.seoDescription || sectionMetadata.seoDescription !== searchMetadata.seoDescription)
      return false
  }

  return true
}

// Componente principal que contiene las secciones de tarjetas con filtros opcionales
export default function CardSectionsContainer({ id, metadata }: CardSectionsContainerProps = {}) {
  const { cardSections, loading, error } = useMainStore()

  // Función para filtrar las secciones según los parámetros
  const getFilteredSections = (): CardSection[] => {
    // Si no hay parámetros, devolver null (no mostrar nada)
    if (!id && !metadata) {
      return []
    }

    let filteredSections: CardSection[] = []

    // Filtrar por ID si se proporciona
    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      if (sectionById && sectionById.isActive) {
        filteredSections = [sectionById]
      }
    }
    // Si no hay ID, filtrar por metadata
    else if (metadata) {
      filteredSections = cardSections.filter(
        (section) => section.isActive && matchesMetadata(section.metadata, metadata),
      )
    }

    // Ordenar por posición
    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()

  // Si no hay parámetros, devolver null
  if (!id && !metadata) {
    return null
  }

  if (loading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-4"></div>
                <div className="bg-muted h-4 rounded mb-2"></div>
                <div className="bg-muted h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Error al cargar las secciones de tarjetas: {error}</p>
        </div>
      </div>
    )
  }

  if (activeSections.length === 0) {
    return null
  }

  return (
    <>
      {activeSections.map((cardSection) => (
        <CardSectionRenderer key={cardSection.id} cardSection={cardSection} />
      ))}
    </>
  )
}
