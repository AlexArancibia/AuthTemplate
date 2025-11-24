"use client"

import { useState, useEffect } from 'react'
import { isMobile, isTablet } from 'react-device-detect'

/**
 * Detecta si el dispositivo es un celular (no tablet ni desktop)
 * Usa react-device-detect para mayor precisión y mantenibilidad
 * Usa useState/useEffect para evitar problemas de hidratación en Next.js
 */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    // Solo ejecutar en el cliente después del montaje
    setMobile(isMobile && !isTablet)
  }, [])

  return mobile
}

