"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"
import type { CardSection, CardSectionMetadata } from "@/types/card"
import { useState, useEffect } from "react"

interface CatalogSectionProps {
  id?: string
  metadata?: Partial<CardSectionMetadata>
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

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
  const [activeCards, setActiveCards] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Verificar al montar el componente
    checkIfMobile()
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', checkIfMobile)
    
    // Limpiar el event listener al desmontar
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  const toggleCard = (cardId: string) => {
    if (!isMobile) return // No hacer nada en desktop
    
    setActiveCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }))
  }

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
  const catalogSection = activeSections[0]

  if (!id && !metadata) {
    return null
  }

  if (loading) {
    return (
      <div>
        <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
          <motion.div className="relative text-center" {...fadeIn}>
            <h2 className="text-2xl md:text-4xl font-semibold text-white">Nuestro Catálogo</h2>
          </motion.div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-lg font-medium text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
          <motion.div className="relative text-center" {...fadeIn}>
            <h2 className="text-2xl md:text-4xl font-semibold text-white">Nuestro Catálogo</h2>
          </motion.div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-lg font-medium text-red-600">Error al cargar el catálogo</p>
        </div>
      </div>
    )
  }

  if (!catalogSection) {
    return (
      <div>
        <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
          <motion.div className="relative text-center" {...fadeIn}>
            <h2 className="text-2xl md:text-4xl font-semibold text-white">Nuestro Catálogo</h2>
          </motion.div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <p className="text-center text-lg font-medium text-gray-600">No se encontraron catálogos disponibles</p>
        </div>
      </div>
    )
  }

  const cards = (catalogSection.cards || [])
    .filter((card) => card.isActive)
    .sort((a, b) => a.position - b.position)

  return (
    <div>
      <div className="py-20 bg-[url('/fondoproduct.jpg')] bg-cover bg-center">
        <motion.div className="relative text-center" {...fadeIn}>
          <h2 className="text-2xl md:text-4xl font-semibold text-white">
            {catalogSection.title || "Nuestro Catálogo"}
          </h2>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {cards.length === 0 ? (
          <p className="text-center text-lg font-medium text-gray-600">No hay catálogos disponibles</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {cards.map((card) => (
              <motion.div
                key={card.id}
                className={`group relative rounded-xl overflow-hidden shadow-lg bg-white ${
                  isMobile ? 'cursor-pointer' : ''
                }`}
                whileHover={!isMobile ? { scale: 1.02 } : undefined}
                transition={{ duration: 0.3 }}
                onClick={() => toggleCard(card.id)}
              >
                <div className="relative w-full aspect-[4/5]">
                  <Image
                    src={card.imageUrl || "/placeholder.svg"}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className={`absolute inset-0 bg-black/50 transition-opacity duration-500 ${
                    activeCards[card.id] ? 'opacity-100' : (!isMobile ? 'group-hover:opacity-100 opacity-0' : 'opacity-0')
                  }`}></div>
                </div>

                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
                  activeCards[card.id] ? 'opacity-100' : (!isMobile ? 'group-hover:opacity-100 opacity-0' : 'opacity-0')
                }`}>
                  <h3 className={`text-white font-semibold text-xl mb-4 transition-transform duration-500 ${
                    activeCards[card.id] ? 'translate-y-0' : (!isMobile ? 'group-hover:translate-y-0 translate-y-4' : 'translate-y-4')
                  }`}>
                    {card.title}
                  </h3>
                  {card.linkUrl && (
                    <Button 
                      asChild 
                      className="bg-white text-black hover:bg-gray-200 transition"
                      onClick={(e) => isMobile && e.stopPropagation()}
                    >
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