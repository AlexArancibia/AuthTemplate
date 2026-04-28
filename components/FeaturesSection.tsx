"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Loader2 } from "lucide-react"
import type { CardSection, Card, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"
import { useIsMobile } from "@/hooks/useIsMobile"

interface FeaturesSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

// Simple component to display card as feature card
function FeatureCard({
  card,
  index,
  shouldAnimateIn,
}: {
  card: Card
  index: number
  shouldAnimateIn: boolean
}) {
  if (!card.isActive) return null
  
  const visibleAnim = { opacity: 1, y: 0 }
  const hiddenAnim = { opacity: 0, y: 20 }

  return (
    <motion.div
      initial={hiddenAnim}
      animate={shouldAnimateIn ? visibleAnim : hiddenAnim}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="bg-white rounded-lg overflow-hidden cursor-pointer"
      onClick={() => {
        if (card.linkUrl) {
          window.open(card.linkUrl, '_blank');
        }
      }}
    >
      {/* Imagen cuadrada */}
      <div className="w-full aspect-square overflow-hidden transition-transform duration-300 active:scale-95 md:hover:scale-95">
        <img
          src={card.imageUrl || ""}
          alt={card.title || ""}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Título */}
      <div className="p-4 text-center">
        <p className="text-lg font-semibold text-gray-900">
          {card.title}
        </p>

        {/* Secciones reservadas para futuro uso */}
        {card.description && (
          <div
            className="hidden text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: card.description }}
          />
        )}
        {card.subtitle && (
          <div className="hidden text-xs text-muted-foreground">
            {card.subtitle}
          </div>
        )}
        {card.linkText && (
          <div className="hidden mt-2 text-xs underline text-primary">
            {card.linkText}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Section renderer with features styling
function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  const ref = useRef(null)
  const isMobile = useIsMobile()
  const isInView = useInView(ref, { once: true, amount: isMobile ? 0.12 : 0.3 })
  const shouldAnimateIn = isMobile || isInView
  const visibleAnim = { opacity: 1, y: 0 }
  const hiddenAnim = { opacity: 0, y: 20 }

  if (!cardSection.isActive) return null

  const activeCards = (cardSection.cards || []).filter((card) => card.isActive).sort((a, b) => a.position - b.position)

  if (activeCards.length === 0) return null

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-white bg-cover bg-center" />

      <div className="container-section relative py-16 lg:py-24">
        <div className="content-section">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <motion.h2
              initial={hiddenAnim}
              animate={shouldAnimateIn ? visibleAnim : hiddenAnim}
              transition={{ duration: 0.5 }}
              className="font-druk text-secondary tracking-tight font-bold  uppercase"
            >
              {cardSection.title}
            </motion.h2>
            {cardSection.subtitle && (
              <motion.p
                initial={hiddenAnim}
                animate={shouldAnimateIn ? visibleAnim : hiddenAnim}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto"
              >
                {cardSection.subtitle}
              </motion.p>
            )}
            {cardSection.description && (
              <motion.div
                initial={hiddenAnim}
                animate={shouldAnimateIn ? visibleAnim : hiddenAnim}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: cardSection.description }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {activeCards.map((card, index) => (
              <FeatureCard key={card.id} card={card} index={index} shouldAnimateIn={shouldAnimateIn} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Metadata matching function
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

export default function FeaturesSection({ id, metadata }: FeaturesSectionProps = {}) {
  const { cardSections, loading, error } = useMainStore()

  // Filter sections
  const getFilteredSections = (): CardSection[] => {
    if (!id && !metadata) {
      return []
    }

    let filteredSections: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      if (sectionById && sectionById.isActive) {
        filteredSections = [sectionById]
      }
    } else if (metadata) {
      filteredSections = cardSections.filter(
        (section) => section.isActive && matchesMetadata(section.metadata, metadata),
      )
    }

    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()

  if (!id && !metadata) {
    return null
  }

  if (loading) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 " />
        <div className="container-section relative py-16 lg:py-24 flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 " />
        <div className="container-section relative py-16 lg:py-24 flex justify-center items-center min-h-[400px]">
          <div className="text-red-500"></div>
        </div>
      </div>
    )
  }

  if (activeSections.length === 0) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 " />
        <div className="container-section relative py-16 lg:py-24 flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      {activeSections.map((cardSection) => (
        <CardSectionRenderer key={cardSection.id} cardSection={cardSection} />
      ))}
    </>
  )
}
