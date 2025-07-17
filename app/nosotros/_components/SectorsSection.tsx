"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { CardSection, Card, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface SectorsSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

// Componente para cada sector
function SectorCard({ card, index }: { card: Card; index: number }) {
  if (!card.isActive) return null

  console.log(`[SectorCard ${index}] Card data:`, {
    id: card.id,
    title: card.title,
    description: card.description?.substring(0, 100) + "...",
    imageUrl: card.imageUrl,
    isActive: card.isActive,
  })

  return (
    <div className="relative flex-1 transition-all duration-500 ease-in-out hover:flex-[3] group overflow-hidden rounded-xl">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={card.imageUrl || "/placeholder.svg"}
          alt={card.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      </div>

      <div className="relative h-full w-full flex flex-col justify-end p-6 z-10">
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-3xl transition-all duration-300">
          {card.title}
        </h3>
        <p className="text-white/0 group-hover:text-white/90 transition-all duration-500 overflow-hidden max-h-0 group-hover:max-h-[200px]">
          {card.description}
        </p>
      </div>
    </div>
  )
}

// Renderizador de la sección
function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  if (!cardSection.isActive) return null

  console.log("[SectorsSection] CardSection data:", {
    id: cardSection.id,
    title: cardSection.title,
    subtitle: cardSection.subtitle,
    description: cardSection.description,
    isActive: cardSection.isActive,
    cardsCount: cardSection.cards?.length || 0,
  })

  const activeCards = (cardSection.cards || []).filter((card) => card.isActive).sort((a, b) => a.position - b.position)

  console.log("[SectorsSection] Active cards:", activeCards.length)

  if (activeCards.length === 0) {
    console.log("[SectorsSection] No active cards found")
    return null
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-bold mb-2">{cardSection.title || "Sectores a los que servimos"}</h2>
          {(cardSection.subtitle || cardSection.description) && (
            <p className="text-base text-gray-600">{cardSection.subtitle || cardSection.description}</p>
          )}
        </motion.div>

        <div className="flex flex-col md:flex-row h-[500px] gap-2 overflow-hidden">
          {activeCards.map((card, index) => (
            <SectorCard key={card.id} card={card} index={index} />
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

export default function SectorsSection({ id = "cs_b6e904f5-519f", metadata }: SectorsSectionProps = {}) {
  const { cardSections, loading, error } = useMainStore()

  console.log("[SectorsSection] Store state:", {
    cardSectionsCount: cardSections?.length || 0,
    loading,
    error,
    targetId: id,
  })

  console.log(
    "[SectorsSection] All cardSections:",
    cardSections?.map((section) => ({
      id: section.id,
      title: section.title,
      isActive: section.isActive,
    })),
  )

  // Filtrar secciones
  const getFilteredSections = (): CardSection[] => {
    if (!id && !metadata) {
      console.log("[SectorsSection] No id or metadata provided")
      return []
    }

    let filteredSections: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      console.log("[SectorsSection] Looking for section with id:", id)
      console.log(
        "[SectorsSection] Found section:",
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

    console.log("[SectorsSection] Filtered sections:", filteredSections.length)
    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()

  // Retornar null si no hay datos
  if (!id && !metadata) {
    console.log("[SectorsSection] Returning null - no id or metadata")
    return null
  }

  if (loading) {
    console.log("[SectorsSection] Returning null - loading")
    return null
  }

  if (error) {
    console.log("[SectorsSection] Returning null - error:", error)
    return null
  }

  if (activeSections.length === 0) {
    console.log("[SectorsSection] Returning null - no active sections")
    return null
  }

  console.log("[SectorsSection] Rendering sections:", activeSections.length)

  return (
    <>
      {activeSections.map((cardSection) => (
        <CardSectionRenderer key={cardSection.id} cardSection={cardSection} />
      ))}
    </>
  )
}
