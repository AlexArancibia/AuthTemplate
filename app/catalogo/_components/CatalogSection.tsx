"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"
import type { CardSection, CardSectionMetadata } from "@/types/card"

interface CatalogSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
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

export default function CatalogSection({ id = "cs_9235fb0d-a4d0", metadata }: CatalogSectionProps = {}) {
  const { cardSections, loading, error } = useMainStore()

  console.log("[CatalogSection] Store state:", {
    cardSectionsCount: cardSections?.length || 0,
    loading,
    error,
    targetId: id,
  })

  console.log(
    "[CatalogSection] All cardSections:",
    cardSections?.map((section) => ({
      id: section.id,
      title: section.title,
      isActive: section.isActive,
    })),
  )

  // Filtrar secciones
  const getFilteredSections = (): CardSection[] => {
    if (!id && !metadata) {
      console.log("[CatalogSection] No id or metadata provided")
      return []
    }

    let filteredSections: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      console.log("[CatalogSection] Looking for section with id:", id)
      console.log(
        "[CatalogSection] Found section:",
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

    console.log("[CatalogSection] Filtered sections:", filteredSections.length)
    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()
  const catalogSection = activeSections[0]

  // Retornar null si no hay datos
  if (!id && !metadata) {
    console.log("[CatalogSection] Returning null - no id or metadata")
    return null
  }

  if (loading) {
    console.log("[CatalogSection] Returning loading state")
    return (
      <div>
        {/* Sección del título con fondo */}
        <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
          <motion.div className="relative text-center" {...fadeIn}>
            <h2 className="text-2xl md:text-4xl font-semibold text-white">Nuestro Catálogo</h2>
          </motion.div>
        </div>

        {/* Sección de contenido */}
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-lg font-medium text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    console.log("[CatalogSection] Returning error state")
    return (
      <div>
        {/* Sección del título con fondo */}
        <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
          <motion.div className="relative text-center" {...fadeIn}>
            <h2 className="text-2xl md:text-4xl font-semibold text-white">Nuestro Catálogo</h2>
          </motion.div>
        </div>

        {/* Sección de contenido */}
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-lg font-medium text-red-600">Error al cargar el catálogo</p>
        </div>
      </div>
    )
  }

  if (!catalogSection) {
    console.log("[CatalogSection] Returning null - no catalog section found")
    return (
      <div>
        {/* Sección del título con fondo */}
        <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
          <motion.div className="relative text-center" {...fadeIn}>
            <h2 className="text-2xl md:text-4xl font-semibold text-white">Nuestro Catálogo</h2>
          </motion.div>
        </div>

        {/* Sección de contenido */}
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-lg font-medium text-gray-600">No se encontraron catálogos disponibles</p>
        </div>
      </div>
    )
  }

  const activeCards = (catalogSection.cards || [])
    .filter((card) => card.isActive)
    .sort((a, b) => a.position - b.position)

  console.log("[CatalogSection] Active cards:", activeCards.length)

  return (
    <div>
      {/* Sección del título con fondo */}
      <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
        <motion.div className="relative text-center" {...fadeIn}>
          <h2 className="text-2xl md:text-4xl font-semibold text-white">
            {catalogSection.title || "Nuestro Catálogo"}
          </h2>
        </motion.div>
      </div>

      {/* Sección de contenido */}
      <div className="container mx-auto px-4 py-16">
        {activeCards.length === 0 ? (
          <p className="text-center text-lg font-medium text-gray-600">No hay catálogos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {activeCards.map((card) => (
              <motion.div
                key={card.id}
                className="group relative rounded-xl overflow-hidden shadow-lg bg-white"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Imagen con overlay */}
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={card.imageUrl || "/placeholder.svg"}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Efecto de oscurecimiento al pasar el cursor */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Contenido emergente */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <h3 className="text-white font-semibold text-xl mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {card.title}
                  </h3>
                  {card.linkUrl && (
                    <Button asChild className="bg-white text-black hover:bg-gray-200 transition">
                      <a href={card.linkUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Ver Catálogo
                      </a>
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
