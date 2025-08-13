"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import type { CardSection, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface ReturnsExchangesSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

/* --------- helpers --------- */
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

/* --------- Renderizador --------- */
function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  if (!cardSection.isActive) return null

  const items = (cardSection.cards || [])
    .filter((c) => c.isActive)
    .sort((a, b) => a.position - b.position)
    .map((c) => ({
      title: c.title?.trim() ?? "",
      description: c.description?.trim() ?? "",
      id: c.id,
    }))
    .filter((i) => i.title.length > 0 && i.description.length > 0)

  if (items.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        {(cardSection.title || cardSection.subtitle) && (
          <div className="mb-6 md:mb-8 text-center">
            {cardSection.title && (
              <h2 className="text-3xl font-bold text-gray-900">
                {cardSection.title.trim()}
              </h2>
            )}
            {cardSection.subtitle && (
              <p className="mt-2 text-gray-600">{cardSection.subtitle}</p>
            )}
          </div>
        )}

        <div className="space-y-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

        {cardSection.description && (
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-gray-700">{cardSection.description.trim()}</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* --------- Componente principal --------- */
export default function ReturnsExchangesSection() {
  const { cardSections, loading, error } = useMainStore()
  
  // Default values for the page
  const id = "cs_a01a8ea0-877c"
  const metadata: Partial<CardSectionMetadata> | undefined = undefined

  const activeSections = useMemo(() => {
    if (!cardSections || cardSections.length === 0) return []
    let filtered: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((s) => s.id === id)
      if (sectionById?.isActive) filtered = [sectionById]
    } else if (metadata) {
      filtered = cardSections.filter(
        (s) => s.isActive && matchesMetadata(s.metadata, metadata),
      )
    }

    return filtered.sort((a, b) => a.position - b.position)
  }, [cardSections, id, metadata])

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
