"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

import type { CardSection, CardSectionMetadata } from "@/types/card"
import { useMainStore } from "@/stores/mainStore"

interface OurTeamProps {
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

/* --------- API styles → Tailwind (para desktop/tablet) --------- */
function getSectionClasses(styles?: any) {
  let classes = "grid "
  const mobileCols = styles?.gridColumns?.mobile || 1
  const tabletCols = styles?.gridColumns?.tablet || mobileCols
  const desktopCols = styles?.gridColumns?.desktop || tabletCols
  classes += `grid-cols-${mobileCols} sm:grid-cols-${tabletCols} lg:grid-cols-${desktopCols} `

  const gap = styles?.gap
  if (gap === "2rem") classes += "gap-8 "
  else if (gap === "1rem") classes += "gap-4 "
  else classes += "gap-6 "
  return classes
}

function bgClass(color?: string) { return color || "bg-white" }
function textClass(color?: string) { return color || "text-gray-800" }

/* --------- Slide / Card --------- */
function TeamCard({ title, description, imageUrl }: { title: string; description: string; imageUrl: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="flex flex-col"
    >
      {/* Wrapper con tamaño uniforme: 4:3 y altura razonable */}
      <div className="relative w-full aspect-[3/4] rounded-lg shadow-md overflow-hidden mb-3">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 33vw"
            className="object-cover"
          />
        )}
      </div>

      <h3 className="text-lg font-semibold text-center mb-1">{title}</h3>

      <p className="text-xs text-gray-500 text-center italic mb-2">POWERED by XIOM</p>

      {description && (
        <p className="text-sm text-gray-600 text-center">{description}</p>
      )}
    </motion.div>
  )
}

/* --------- Renderizador --------- */
function CardSectionRenderer({ cardSection }: { cardSection: CardSection }) {
  if (!cardSection.isActive) return null

  const items = (cardSection.cards || [])
    .filter((c) => c.isActive)
    .sort((a, b) => a.position - b.position)
    .map((c) => ({
      id: c.id,
      title: c.title?.trim() ?? "",
      description: c.description?.trim() ?? "",
      imageUrl: c.imageUrl || "",
    }))
    .filter((i) => i.title.length > 0)

  if (items.length === 0) return null

  const sectionBg = bgClass(cardSection.backgroundColor || undefined)
  const sectionText = textClass(cardSection.textColor || undefined)
  const gridClasses = getSectionClasses(cardSection.styles || undefined)

  /* ----- Embla (solo mobile) ----- */
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: true })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    emblaApi.on("select", onSelect)
    onSelect()
  }, [emblaApi])

  return (
    <section className={`py-12 md:py-16 ${sectionBg} ${sectionText}`}>
      <div className="container mx-auto px-4">
        {cardSection.title && (
          <h2 className="text-3xl font-bold mb-8 text-center">
            {cardSection.title.trim()}
          </h2>
        )}

        {/* MOBILE: carrusel infinito */}
        <div className="sm:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              className="p-2 disabled:opacity-30"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-7 h-7 text-gray-600" />
            </button>

            <div className="overflow-hidden flex-1" ref={emblaRef}>
              <div className="flex gap-5 px-1">
                {items.map((item) => (
                  <div key={item.id} className="shrink-0 w-full">
                    <TeamCard {...item} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              className="p-2 disabled:opacity-30"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-7 h-7 text-gray-600" />
            </button>
          </div>
        </div>

        {/* TABLET/DESKTOP: grid desde estilos del CMS */}
        <div className={`hidden sm:grid ${gridClasses}`}>
          {items.map((item) => (
            <div key={item.id}>
              <TeamCard {...item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* --------- Componente principal --------- */
export function OurTeam({ id = "cs_ee893475-4e4e", metadata }: OurTeamProps = {}) {
  const { cardSections, loading, error } = useMainStore()

  const activeSections = useMemo(() => {
    if (!cardSections?.length) return []
    let filtered: CardSection[] = []
    if (id) {
      const sectionById = cardSections.find((s) => s.id === id)
      if (sectionById?.isActive) filtered = [sectionById]
    } else if (metadata) {
      filtered = cardSections.filter((s) => s.isActive && matchesMetadata(s.metadata, metadata))
    }
    return filtered.sort((a, b) => a.position - b.position)
  }, [cardSections, id, metadata])

  if (!id && !metadata) return null
  if (loading || error) return null
  if (!activeSections.length) return null

  return (
    <>
      {activeSections.map((section) => (
        <CardSectionRenderer key={section.id} cardSection={section} />
      ))}
    </>
  )
}
