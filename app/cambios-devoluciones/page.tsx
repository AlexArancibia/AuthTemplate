"use client"

import { motion } from "framer-motion"
import type { CardSection, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface ReturnsExchangesSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

function matchesMetadata(
  sectionMetadata: CardSectionMetadata | null | undefined,
  searchMetadata: Partial<CardSectionMetadata> | undefined,
): boolean {
  if (!sectionMetadata || !searchMetadata) return false

  if (searchMetadata.tags?.length) {
    if (!sectionMetadata.tags?.length) return false
    const hasMatchingTag = searchMetadata.tags.some((tag) => sectionMetadata.tags!.includes(tag))
    if (!hasMatchingTag) return false
  }

  if (searchMetadata.seoTitle && sectionMetadata.seoTitle !== searchMetadata.seoTitle) return false
  if (searchMetadata.seoDescription && sectionMetadata.seoDescription !== searchMetadata.seoDescription) return false

  return true
}

function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  if (!cardSection.isActive) return null

  const activeCards = (cardSection.cards || [])
    .filter((card) => card.isActive)
    .sort((a, b) => a.position - b.position)

  if (activeCards.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        {cardSection.title && (
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
                {cardSection.title.trim()}
            </h2>
        )}

        <div className="space-y-8">
          {activeCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              {card.description && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {card.description.trim()}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {cardSection.description && (
          <p className="mt-10 text-center text-gray-600 max-w-2xl mx-auto">
            {cardSection.description}
          </p>
        )}
      </div>
    </section>
  )
}

export default function ReturnsExchangesSection() {
  const { cardSections, loading, error } = useMainStore()
  
  // Default values for the page
  const id = "cs_a01a8ea0-877c"
  const metadata: Partial<CardSectionMetadata> | undefined = undefined

  const activeSections = (() => {
    if (!cardSections?.length) return []
    let filtered: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((s) => s.id === id)
      if (sectionById?.isActive) filtered = [sectionById]
    } else if (metadata) {
      filtered = cardSections.filter((s) => s.isActive && matchesMetadata(s.metadata, metadata))
    }

    return filtered.sort((a, b) => a.position - b.position)
  })()

  if (!id && !metadata) return null
  if (loading || error) return null
  if (activeSections.length === 0) return null

  return (
    <>
      {activeSections.map((section) => (
        <CardSectionRenderer key={section.id} cardSection={section} />
      ))}
    </>
  )
}
