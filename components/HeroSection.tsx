"use client"

import { useState, useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useMainStore } from "@/stores/mainStore"
import { HeroCarouselBase } from "./HeroCaruselBase"

export function HeroSection() {
  const { heroSections, fetchHeroSections, loading, error: storeError } = useMainStore()
  const [error, setError] = useState<string | null>(null)
  const fetchAttempted = useRef(false)

  // Fetch de las secciones de héroe
  useEffect(() => {
    // Evitar múltiples intentos de fetch
    if (fetchAttempted.current) return

    const loadHeroSections = async () => {
      try {
        console.log("[HeroSection] Cargando hero sections...")
        fetchAttempted.current = true
        await fetchHeroSections()
        console.log("[HeroSection] Hero sections cargadas correctamente:", heroSections?.length || 0)
        setError(null)
      } catch (err) {
        console.error("[HeroSection] Error al cargar las secciones de héroe:", err)
        setError("No se pudieron cargar las secciones de héroe. Por favor, intenta de nuevo más tarde.")
      }
    }

    loadHeroSections()
  }, [fetchHeroSections])

  // Filtrar solo las secciones con metadata.section igual a "inicio"
  const filteredSections = Array.isArray(heroSections)
    ? heroSections.filter((section) => {
        return (
          section.metadata &&
          typeof section.metadata === "object" &&
          "section" in section.metadata &&
          (section.metadata.section?.toLowerCase() === "inicio" ||
            section.metadata.section?.toLowerCase() === "home") &&
          section.isActive
        )
      })
    : []

  console.log("[HeroSection] Secciones filtradas:", filteredSections.length)

  // Si está cargando, mostrar un skeleton
  if (loading) {
    return (
      <div className="w-full h-[92vh] bg-gray-100/30">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  // Si hay un error, mostrar un mensaje
  if (error || storeError) {
    console.error("[HeroSection] Error:", error || storeError)
    return (
      <div className="w-full h-[50vh] flex items-center justify-center">
        <div className="text-red-500 max-w-md text-center p-4 bg-red-50 rounded-lg">
          {error || storeError || "Error al cargar las secciones de héroe"}
        </div>
      </div>
    )
  }

  // Si no hay secciones filtradas, no mostrar nada
  if (filteredSections.length === 0) {
    console.log("[HeroSection] No hay secciones de héroe para mostrar")
    return null
  }

  return (
    <div className="w-full overflow-hidden">
      <HeroCarouselBase heroSections={filteredSections} autoplayInterval={10000} containerHeight="calc(100vh - 6vh)" />
    </div>
  )
}
