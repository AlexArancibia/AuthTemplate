"use client"

import { useState, useEffect, useCallback } from "react"
import apiClient from "@/lib/axiosConfig"

export interface PuckComponentData {
  type: string
  props: Record<string, unknown>
}

export interface PuckData {
  root: { props?: Record<string, unknown> }
  content: PuckComponentData[]
  zones?: Record<string, PuckComponentData[]>
}

/** Backend devuelve { data: { data: <puck> } }; extrae el payload. */
function getPageBuilderPayload<T>(raw: unknown): T | null {
  const d = raw as { data?: { data?: T | null } } | undefined
  return d?.data?.data ?? null
}

export function usePageBuilderSection(componentKey: string) {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  const [data, setData] = useState<PuckData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSection = useCallback(async () => {
    if (!storeId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(
        `/page-builder/${storeId}/${componentKey}`,
      )
      setData(getPageBuilderPayload<PuckData>(res.data))
    } catch (err) {
      console.error("[usePageBuilderSection] Error:", err)
      setError(err instanceof Error ? err.message : "Error al cargar")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [storeId, componentKey])

  useEffect(() => {
    fetchSection()
  }, [fetchSection])

  return { data, loading, error, refetch: fetchSection }
}
