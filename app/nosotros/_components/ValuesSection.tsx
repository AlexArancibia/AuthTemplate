"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import type { CardSection, Card, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface ValuesSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

// Colores de gradiente para las cards
const gradientColors = ["from-sky-950", "from-zinc-900", "from-red-900/50", "from-blue-950"]

// Componente para cada card de valor
function ValueCard({ card, index }: { card: Card; index: number }) {
  if (!card.isActive) return null

  console.log(`[ValueCard ${index}] Card data:`, {
    id: card.id,
    title: card.title,
    description: card.description?.substring(0, 100) + "...",
    imageUrl: card.imageUrl,
    isActive: card.isActive,
  })

  // Usar imagen de la card
  const cardImage = card.imageUrl
  const gradientColor = gradientColors[index % gradientColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative h-[450px] rounded-xl overflow-hidden group shadow-md"
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={cardImage || "/placeholder.svg"}
          alt={card.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${gradientColor} to-transparent opacity-60`}></div>
      </div>

      {/* Título visible inicialmente */}
      <div className="absolute inset-0 flex items-center p-12 justify-center z-10 transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="text-2xl md:text-4xl font-bold text-white text-center px-6 drop-shadow-md">{card.title}</h3>
      </div>

      {/* Contenido detallado en hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[65%] w-full rounded-t-2xl bg-white flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 transform translate-y-full group-hover:translate-y-0">
        <h3 className="text-2xl font-bold mb-3 text-center text-primary">{card.title}</h3>
        {card.description && (
          <p className="text-gray-700 text-center overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {card.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// Renderizador de la sección
function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  if (!cardSection.isActive) return null

  console.log("[CardSectionRenderer] CardSection data:", {
    id: cardSection.id,
    title: cardSection.title,
    description: cardSection.description,
    isActive: cardSection.isActive,
    cardsCount: cardSection.cards?.length || 0,
  })

  const activeCards = (cardSection.cards || []).filter((card) => card.isActive).sort((a, b) => a.position - b.position)

  console.log("[CardSectionRenderer] Active cards:", activeCards.length)

  if (activeCards.length === 0) {
    console.log("[CardSectionRenderer] No active cards found")
    return null
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{cardSection.title || "Descubra más sobre nosotros"}</h2>
          {(cardSection.subtitle || cardSection.description) && (
            <div className="text-xl text-gray-600">
              {cardSection.subtitle && <p>{cardSection.subtitle}</p>}
              {cardSection.description && <p>{cardSection.description}</p>}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {activeCards.map((card, index) => (
            <ValueCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Función para verificar coincidencia de metadata
function matchesMetadata(
  sectionMetadata: CardSectionMetadata | null | undefined,
  searchMetadata: Partial<CardSectionMetadata>,
): boolean {
  if (!sectionMetadata || !searchMetadata) return false

  if (searchMetadata.tags && searchMetadata.tags.length > 0) {
    if (!sectionMetadata.tags || sectionMetadata.tags.length === 0) return false
    const hasMatchingTag = searchMetadata.tags.some((tag) => sectionMetadata.tags?.includes(tag))
    if (!hasMatchingTag) return false
  }

  if (searchMetadata.seoTitle) {
    if (!sectionMetadata.seoTitle || sectionMetadata.seoTitle !== searchMetadata.seoTitle) return false
  }

  if (searchMetadata.seoDescription) {
    if (!sectionMetadata.seoDescription || sectionMetadata.seoDescription !== searchMetadata.seoDescription)
      return false
  }

  return true
}

export default function ValuesSection({ id = "cs_4ce0ea48-52d5", metadata }: ValuesSectionProps = {}) {
  const { cardSections, loading, error } = useMainStore()

  console.log("[ValuesSection] Store state:", {
    cardSectionsCount: cardSections?.length || 0,
    loading,
    error,
    targetId: id,
  })

  console.log(
    "[ValuesSection] All cardSections:",
    cardSections?.map((section) => ({
      id: section.id,
      title: section.title,
      isActive: section.isActive,
    })),
  )

  // Filtrar secciones
  const getFilteredSections = (): CardSection[] => {
    if (!id && !metadata) {
      console.log("[ValuesSection] No id or metadata provided")
      return []
    }

    let filteredSections: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      console.log("[ValuesSection] Looking for section with id:", id)
      console.log(
        "[ValuesSection] Found section:",
        sectionById
          ? {
              id: sectionById.id,
              title: sectionById.title,
              isActive: sectionById.isActive,
            }
          : "NOT FOUND",
      )

      if (sectionById && sectionById.isActive) {
        filteredSections = [sectionById]
      }
    } else if (metadata) {
      filteredSections = cardSections.filter(
        (section) => section.isActive && matchesMetadata(section.metadata, metadata),
      )
    }

    console.log("[ValuesSection] Filtered sections:", filteredSections.length)
    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()

  if (!id && !metadata) {
    console.log("[ValuesSection] Returning null - no id or metadata")
    return null
  }

  if (loading) {
    console.log("[ValuesSection] Showing loading state")
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  if (error) {
    console.log("[ValuesSection] Showing error state:", error)
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <div className="text-red-500">{error}</div>
        </div>
      </section>
    )
  }

  if (activeSections.length === 0) {
    console.log("[ValuesSection] No active sections found")
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">No se encontraron secciones de tarjetas con ID: {id}</div>
        </div>
      </section>
    )
  }

  console.log("[ValuesSection] Rendering sections:", activeSections.length)

  return (
    <>
      {activeSections.map((cardSection) => (
        <CardSectionRenderer key={cardSection.id} cardSection={cardSection} />
      ))}
    </>
  )
}
