"use client"

import { useState, useEffect, useRef } from "react"
import { useMainStore } from "@/stores/mainStore"
import { HeroCarouselBase } from "./HeroCaruselBase"
import { HERO_CONTAINER_CLASS } from "./hero-layout"

export function HeroSection() {
  const { heroSections, fetchHeroSections, error: storeError } = useMainStore()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(heroSections.length === 0)
  const fetchAttempted = useRef(false)

  // Fetch de las secciones de héroe
  useEffect(() => {
    // Evitar múltiples intentos de fetch
    if (fetchAttempted.current) return
    let isMounted = true

    const loadHeroSections = async () => {
      try {
        fetchAttempted.current = true
        setIsLoading(true)
        await fetchHeroSections({ limit: 50 })
        if (isMounted) setError(null)
      } catch (err) {
        console.error("[HeroSection] Error al cargar las secciones de héroe:", err)
        if (isMounted) {
          setError("No se pudieron cargar las secciones de héroe. Por favor, intenta de nuevo más tarde.")
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadHeroSections()

    return () => {
      isMounted = false
    }
  }, [fetchHeroSections])

  // Filtrar solo las secciones con metadata.section igual a "inicio"
  const filteredSections = Array.isArray(heroSections)
    ? heroSections.filter((section) => {
        return (
          section.metadata &&
          typeof section.metadata === "object" &&
          "section" in section.metadata &&
          (section.metadata.section?.toLowerCase() === "inicio") &&
          section.isActive
        )
      })
    : []

  // Reservar el espacio del hero durante el fetch evita saltos de layout en mobile.
  if (isLoading) {
    return (
      <div className={HERO_CONTAINER_CLASS} aria-busy="true" aria-label="Cargando contenido principal">
        <div className="sr-only">Cargando contenido principal</div>
      </div>
    )
  }

  // Si hay un error, mostrar un mensaje
  if (error || storeError) {
    console.error("[HeroSection] Error:", error || storeError)
    return (
      <div className={`${HERO_CONTAINER_CLASS} flex items-center justify-center px-6`}>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Error al cargar contenido</h2>
          <p className="text-white/70">Por favor, intenta recargar la página</p>
        </div>
      </div>
    )
  }

  // Si no hay secciones filtradas, no mostrar nada
  if (filteredSections.length === 0) {
    return null
  }

  return (
    <div className="w-full overflow-hidden bg-black">
      <HeroCarouselBase heroSections={filteredSections} autoplayInterval={10000} />
    </div>
  )
}
