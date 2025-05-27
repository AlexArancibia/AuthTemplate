"use client"

import { motion } from "framer-motion"
import { Goal, Eye } from "lucide-react"
import type { CardSection, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface MissionVisionSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
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

// Renderizador de la sección
function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  if (!cardSection.isActive) return null

  console.log("[MissionVisionSection] CardSection data:", {
    id: cardSection.id,
    title: cardSection.title,
    description: cardSection.description,
    isActive: cardSection.isActive,
    cardsCount: cardSection.cards?.length || 0,
  })

  const activeCards = (cardSection.cards || []).filter((card) => card.isActive).sort((a, b) => a.position - b.position)

  console.log("[MissionVisionSection] Active cards:", activeCards.length)

  if (activeCards.length === 0) {
    console.log("[MissionVisionSection] No active cards found")
    return null
  }

  // Buscar las cards de misión y visión
  const missionCard = activeCards.find((card) => card.title.toLowerCase().includes("misión"))
  const visionCard = activeCards.find((card) => card.title.toLowerCase().includes("visión"))

  console.log("[MissionVisionSection] Mission card:", missionCard?.title)
  console.log("[MissionVisionSection] Vision card:", visionCard?.title)

  return (
    <section className="py-16 bg-white pb-0 md:pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Misión */}
          {missionCard && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-blue-50 rounded-2xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Goal className="w-10 h-10 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{missionCard.title}</h3>
              <p className="text-gray-600 mb-6">{missionCard.description}</p>
            </motion.div>
          )}

          {/* Visión */}
          {visionCard && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-green-50 rounded-2xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Eye className="w-10 h-10 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{visionCard.title}</h3>
              <p className="text-gray-600 mb-6">{visionCard.description}</p>
            </motion.div>
          )}
        </div>

        {/* Cita/Descripción de la sección */}
        {cardSection.description && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-8 text-center"
          >
            <div className="pt-16 border-gray-200">
              <p className="text-xl font-semibold text-blue-700 italic">{cardSection.description}</p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default function MissionVisionSection({ id = "cs_30a28f27-58ee", metadata }: MissionVisionSectionProps = {}) {
  const { cardSections, loading, error } = useMainStore()

  console.log("[MissionVisionSection] Store state:", {
    cardSectionsCount: cardSections?.length || 0,
    loading,
    error,
    targetId: id,
  })

  console.log(
    "[MissionVisionSection] All cardSections:",
    cardSections?.map((section) => ({
      id: section.id,
      title: section.title,
      isActive: section.isActive,
    })),
  )

  // Filtrar secciones
  const getFilteredSections = (): CardSection[] => {
    if (!id && !metadata) {
      console.log("[MissionVisionSection] No id or metadata provided")
      return []
    }

    let filteredSections: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      console.log("[MissionVisionSection] Looking for section with id:", id)
      console.log(
        "[MissionVisionSection] Found section:",
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

    console.log("[MissionVisionSection] Filtered sections:", filteredSections.length)
    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()

  // Retornar null si no hay datos
  if (!id && !metadata) {
    console.log("[MissionVisionSection] Returning null - no id or metadata")
    return null
  }

  if (loading) {
    console.log("[MissionVisionSection] Returning null - loading")
    return null
  }

  if (error) {
    console.log("[MissionVisionSection] Returning null - error:", error)
    return null
  }

  if (activeSections.length === 0) {
    console.log("[MissionVisionSection] Returning null - no active sections")
    return null
  }

  console.log("[MissionVisionSection] Rendering sections:", activeSections.length)

  return (
    <>
      {activeSections.map((cardSection) => (
        <CardSectionRenderer key={cardSection.id} cardSection={cardSection} />
      ))}
    </>
  )
}
