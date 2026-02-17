"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/axiosConfig"
import type { HeroSection } from "@/types/heroSection"

function getHeroSlidesPayload(raw: unknown): HeroSection[] {
  const d = raw as { data?: { data?: HeroSection[] } } | undefined
  const payload = d?.data?.data ?? d?.data
  return Array.isArray(payload) ? payload : []
}

export function usePageBuilderHeroSlides() {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  const [data, setData] = useState<HeroSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSlides = useCallback(async () => {
    if (!storeId) {
      setLoading(false)
      setData([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`/page-builder/${storeId}/hero-section/slides`)
      setData(getHeroSlidesPayload(res.data))
    } catch (err) {
      console.error("[usePageBuilderHeroSlides] Error:", err)
      setError(err instanceof Error ? err.message : "Error al cargar")
      setData([])
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  return { data, loading, error, refetch: fetchSlides }
}
