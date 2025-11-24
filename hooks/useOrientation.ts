"use client"

import { useState, useEffect } from "react"

/**
 * Hook personalizado para detectar la orientación del dispositivo
 * Usa matchMedia para una detección más confiable y eficiente
 */
export function useOrientation(): boolean {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const mediaQuery = window.matchMedia("(orientation: landscape)")
    
    const updateOrientation = () => {
      setIsLandscape(mediaQuery.matches)
    }

    // Verificar orientación inicial
    updateOrientation()

    // Escuchar cambios de orientación
    const handleChange = () => {
      // Pequeño delay para asegurar que el layout se haya actualizado
      setTimeout(updateOrientation, 100)
    }

    // Usar addEventListener si está disponible (navegadores modernos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleChange)
    }

    // También escuchar resize y orientationchange como respaldo
    window.addEventListener("resize", handleChange)
    window.addEventListener("orientationchange", handleChange)

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
      window.removeEventListener("resize", handleChange)
      window.removeEventListener("orientationchange", handleChange)
    }
  }, [])

  return isLandscape
}

