"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Loader2, Users2, ShoppingBag, Shield, Truck } from "lucide-react"
import type { CardSection, Card, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface FeaturesSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

// Default icons and colors in the order shown in the image
const defaultFeatures = [
  {
    icon: Users2,
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
  },
  {
    icon: ShoppingBag,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
  },
  {
    icon: Shield,
    iconColor: "text-rose-500",
    iconBg: "bg-rose-50",
  },
  {
    icon: Truck,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
  },
]

// Simple component to display card as feature card
function FeatureCard({ card, index, isInView }: { card: Card; index: number; isInView: boolean }) {
  if (!card.isActive) return null

  // Use default icons in order, cycling if there are more than 4 cards
  const featureStyle = defaultFeatures[index % defaultFeatures.length]
  const IconComponent = featureStyle.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="bg-white/50 hover:bg-white/80 rounded-2xl p-6 shadow-lg shadow-secondary/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="space-y-4">
        <div className={`w-16 h-16 rounded-2xl ${featureStyle.iconBg} flex items-center justify-center`}>
          <IconComponent className={`w-8 h-8 ${featureStyle.iconColor}`} />
        </div>
        <h3 className="text-secondary font-semibold">{card.title}</h3>
        {card.description && (
          <div className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: card.description }} />
        )}
      </div>
    </motion.div>
  )
}

// Section renderer with features styling
function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  if (!cardSection.isActive) return null

  const activeCards = (cardSection.cards || []).filter((card) => card.isActive).sort((a, b) => a.position - b.position)

  if (activeCards.length === 0) return null

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-[url('/gradient1.png')] bg-cover bg-center" />

      <div className="container-section relative py-16 lg:py-24">
        <div className="content-section">
          <div className="text-center space-y-4 mb-12 lg:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="text-secondary tracking-tight font-bold text-2xl md:text-4xl"
            >
              {cardSection.title}
            </motion.h2>
            {cardSection.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto"
              >
                {cardSection.subtitle}
              </motion.p>
            )}
            {cardSection.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto"
                dangerouslySetInnerHTML={{ __html: cardSection.description }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {activeCards.map((card, index) => (
              <FeatureCard key={card.id} card={card} index={index} isInView={isInView} />
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
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  if (activeSections.length === 0) {
    return (
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 " />
        <div className="container-section relative py-16 lg:py-24 flex justify-center items-center min-h-[400px]">
          <div className="text-gray-500">No se encontraron secciones de tarjetas.</div>
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
