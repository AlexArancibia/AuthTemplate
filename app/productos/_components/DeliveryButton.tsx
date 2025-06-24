"use client"

import { Package } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useMainStore } from "@/stores/mainStore"
import type { CardSection, CardSectionMetadata } from "@/types/card"

interface DeliveryButtonProps {
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

export function DeliveryButton({ id = "cs_89a37ac3-d83c", metadata }: DeliveryButtonProps = {}) {
  const { cardSections, loading, error } = useMainStore()
  const [open, setOpen] = useState(false)

  console.log("[DeliveryButton] Store state:", {
    cardSectionsCount: cardSections?.length || 0,
    loading,
    error,
    targetId: id,
  })

  // Filtrar secciones
  const getFilteredSections = (): CardSection[] => {
    if (!id && !metadata) {
      console.log("[DeliveryButton] No id or metadata provided")
      return []
    }

    let filteredSections: CardSection[] = []

    if (id) {
      const sectionById = cardSections.find((section) => section.id === id)
      console.log("[DeliveryButton] Looking for section with id:", id)
      console.log(
        "[DeliveryButton] Found section:",
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

    console.log("[DeliveryButton] Filtered sections:", filteredSections.length)
    return filteredSections.sort((a, b) => a.position - b.position)
  }

  const activeSections = getFilteredSections()
  const deliverySection = activeSections[0]

  // Retornar null si no hay datos
  if (!id && !metadata) {
    console.log("[DeliveryButton] Returning null - no id or metadata")
    return null
  }

  if (loading) {
    console.log("[DeliveryButton] Returning loading state")
    return (
      <motion.div
        className="relative w-full rounded-2xl p-[2px] overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="ghost"
          disabled
          className="relative flex justify-start items-start border border-gray-200 rounded-2xl p-4 bg-gray-50 w-full h-auto"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Package className="w-6 h-6 text-gray-400 animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-gray-400 text-left">Cargando...</p>
              <p className="text-gray-400 font-medium text-left">...</p>
            </div>
          </div>
        </Button>
      </motion.div>
    )
  }

  if (error) {
    console.log("[DeliveryButton] Returning error state")
    return (
      <motion.div
        className="relative w-full rounded-2xl p-[2px] overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          variant="ghost"
          disabled
          className="relative flex justify-start items-start border border-red-200 rounded-2xl p-4 bg-red-50 w-full h-auto"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Package className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-red-600 text-left">Error</p>
              <p className="text-red-600 font-medium text-left">No se pudo cargar</p>
            </div>
          </div>
        </Button>
      </motion.div>
    )
  }

  if (!deliverySection) {
    console.log("[DeliveryButton] Returning null - no delivery section found")
    return null
  }

  const activeCards = (deliverySection.cards || [])
    .filter((card) => card.isActive)
    .sort((a, b) => a.position - b.position)

  const firstCard = activeCards[0]

  if (!firstCard) {
    console.log("[DeliveryButton] No active cards found")
    return null
  }

  console.log("[DeliveryButton] Active card:", {
    id: firstCard.id,
    title: firstCard.title,
    imageUrl: firstCard.imageUrl,
  })

  return (
    <>
      <motion.div
        className="relative w-full rounded-2xl p-[2px] overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="absolute inset-0 rounded-2xl bg-blue-400 opacity-10"
          animate={{ scale: [1, 1.15, 1], opacity: [0, 0.4, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
        />

        <Button
          variant="ghost"
          onClick={() => setOpen(true)}
          className="relative cursor-pointer flex justify-start items-start border border-blue-200 rounded-2xl p-4 bg-blue-50 hover:bg-blue-100 w-full h-auto transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-left">{deliverySection.title}</p>
              <p className="text-blue-600 font-medium text-left">{deliverySection.subtitle}</p>
            </div>
          </div>
        </Button>
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent className="max-w-[90%] sm:max-w-[800px] z-[456] rounded-xl p-6 overflow-hidden">
          <Image
            src={firstCard.imageUrl || "/placeholder.svg"}
            alt={`${deliverySection.title} - ${deliverySection.subtitle}`}
            width={800}
            height={600}
            className="rounded-lg shadow-lg"
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
