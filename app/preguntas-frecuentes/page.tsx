"use client"

import { useId, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import type { CardSection, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface FAQSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
  /** Si true, permite múltiples abiertos a la vez. Por defecto false (acordeón). */
  allowMultiple?: boolean
}

/* --------- helpers --------- */
function matchesMetadata(
  sectionMetadata: CardSectionMetadata | null | undefined,
  searchMetadata: Partial<CardSectionMetadata> | undefined,
): boolean {
  if (!sectionMetadata || !searchMetadata) return false

  if (searchMetadata.tags && searchMetadata.tags.length > 0) {
    if (!sectionMetadata.tags || sectionMetadata.tags.length === 0) return false
    const hasMatchingTag = searchMetadata.tags.some((tag) => sectionMetadata.tags!.includes(tag))
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

/* --------- Item de FAQ --------- */
function FAQItem({
  q,
  a,
  isOpen,
  onToggle,
  index,
  groupId,
}: {
  q: string
  a: string
  isOpen: boolean
  onToggle: () => void
  index: number
  groupId: string
}) {
  const buttonId = `${groupId}-faq-btn-${index}`
  const panelId = `${groupId}-faq-panel-${index}`

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        id={buttonId}
        aria-controls={panelId}
        aria-expanded={isOpen}
        onClick={onToggle}
        className="w-full flex items-center gap-4 text-left p-4 sm:p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="flex-1 text-base sm:text-lg font-medium text-gray-900">{q}</span>
        <motion.span
          initial={false}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
          aria-hidden="true"
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { height: "auto", opacity: 1 },
              collapsed: { height: 0, opacity: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="px-4 sm:px-5"
          >
            <div className="pb-5 text-gray-600 text-sm sm:text-base leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* --------- Renderizador por sección --------- */
function CardSectionRenderer({ cardSection, allowMultiple = false }: { cardSection: CardSection; allowMultiple?: boolean }) {
  if (!cardSection.isActive) return null

  const groupId = useId()

  // Solo tomamos cards activas, ordenadas por position
  const items = useMemo(
    () =>
      (cardSection.cards || [])
        .filter((c) => c.isActive)
        .sort((a, b) => a.position - b.position)
        .map((c) => ({
          q: c.title?.trim() ?? "",
          a: c.description?.trim() ?? "",
          id: c.id,
        }))
        // Filtramos las que realmente tengan pregunta/respuesta
        .filter((i) => i.q.length > 0 && i.a.length > 0),
    [cardSection.cards],
  )

  // Estado de apertura: acordeón único o múltiples
  const [openSet, setOpenSet] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev)
      const isOpen = next.has(id)
      if (allowMultiple) {
        if (isOpen) next.delete(id)
        else next.add(id)
        return next
      } else {
        // acordeón: o lo cierras, o dejas solo este abierto
        if (isOpen) {
          next.clear()
          return next
        } else {
          return new Set([id])
        }
      }
    })
  }

  if (items.length === 0) return null

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Título / subtítulo de la sección si vienen del CMS */}
        {(cardSection.title || cardSection.subtitle) && (
          <div className="mb-6 md:mb-8">
            {cardSection.title && <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{cardSection.title}</h2>}
            {cardSection.subtitle && <p className="mt-2 text-gray-600">{cardSection.subtitle}</p>}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, idx) => (
            <FAQItem
              key={item.id}
              index={idx}
              groupId={groupId}
              q={item.q}
              a={item.a}
              isOpen={openSet.has(item.id)}
              onToggle={() => toggle(item.id)}
            />
          ))}
        </div>

        {/* Descripción de la sección al pie (opcional) */}
        {cardSection.description && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            <p className="text-gray-700">{cardSection.description}</p>
          </div>
        )}
      </div>
    </section>
  )
}

/* --------- Componente principal --------- */
export default function FAQSection() {
  const { cardSections, loading, error } = useMainStore()
  
  // Default values for the page
  const id = "cs_e3c1826c-3489"
  const metadata: Partial<CardSectionMetadata> | undefined = undefined
  const allowMultiple = false

  // Filtrar secciones por id o metadata (igual que tu referencia)
  const activeSections: CardSection[] = useMemo(() => {
    if (!cardSections || cardSections.length === 0) return []
    let filtered: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((s) => s.id === id)
      if (sectionById && sectionById.isActive) filtered = [sectionById]
    } else if (metadata) {
      filtered = cardSections.filter((s) => s.isActive && matchesMetadata(s.metadata, metadata))
    }

    return filtered.sort((a, b) => a.position - b.position)
  }, [cardSections, id, metadata])

  if (!id && !metadata) return null
  if (loading || error) return null
  if (activeSections.length === 0) return null

  return (
    <>
      {activeSections.map((section) => (
        <CardSectionRenderer key={section.id} cardSection={section} allowMultiple={allowMultiple} />
      ))}
    </>
  )
}
