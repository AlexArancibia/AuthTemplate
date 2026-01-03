import { useEffect, useRef } from "react"
import { useMainStore } from "@/stores/mainStore"

/**
 * Hook personalizado para cargar automáticamente las cardSections si no están disponibles
 * Evita múltiples llamadas y optimiza el rendimiento
 */
export function useCardSections() {
  const { cardSections, fetchCardSections, loading, error } = useMainStore()
  const fetchAttempted = useRef(false)

  useEffect(() => {
    // Si ya hay cardSections cargados, no hacer fetch
    if (Array.isArray(cardSections) && cardSections.length > 0) {
      return
    }

    // Evitar múltiples intentos de fetch
    if (fetchAttempted.current) return

    const loadCardSections = async () => {
      try {
        fetchAttempted.current = true
        await fetchCardSections()
      } catch (err) {
        // Error silencioso, ya que el estado de loading del store manejará el error
      }
    }

    loadCardSections()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardSections])

  return { cardSections, loading, error }
}

