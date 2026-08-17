import { cache } from "react"
import apiClient from "@/lib/axiosConfig"
import { extractApiData } from "@/lib/apiHelpers"
import type { Product } from "@/types/product"
import type { Collection } from "@/types/collection"
import type { ShopSettings } from "@/types/store"

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID as string

export const getProductBySlugSEO = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const res = await apiClient.get(`/products/by-slug/${STORE_ID}/${slug}`)
      return extractApiData<Product>(res) || null
    } catch {
      return null
    }
  },
)

export const getCollectionBySlugSEO = cache(
  async (slug: string): Promise<Collection | null> => {
    try {
      const res = await apiClient.get(`/collections/${STORE_ID}?limit=100`)
      const data = res.data?.data ?? res.data
      const list: Collection[] = Array.isArray(data) ? data : data?.data || []
      return list.find((c) => c.slug === slug) || null
    } catch {
      return null
    }
  },
)

export const getContentBySlugSEO = cache(async (slug: string): Promise<any | null> => {
  try {
    const res = await apiClient.get(`/contents/by-slug/${STORE_ID}/${slug}`)
    return extractApiData<any>(res) || null
  } catch {
    return null
  }
})

export const getShopSettingsSEO = cache(async (): Promise<ShopSettings | null> => {
  try {
    const res = await apiClient.get(`/shop-settings/${STORE_ID}`)
    return extractApiData<ShopSettings>(res) || null
  } catch {
    return null
  }
})

/** Strip HTML tags + collapse whitespace, truncate for meta descriptions. */
export function plainExcerpt(html: string | null | undefined, max = 155): string {
  if (!html) return ""
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= max) return text
  return text.slice(0, max - 1).trimEnd() + "…"
}
