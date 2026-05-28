import axios, { type AxiosResponse } from "axios"
import apiClient from "@/lib/axiosConfig"
import { extractApiData } from "@/lib/apiHelpers"
import type { CartItem } from "@/stores/cartStore"
import type { ProductVariant } from "@/types/productVariant"

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID

export type CartValidationResult = {
  validItems: CartItem[]
  removedTitles: string[]
}

export function cartNeedsRefresh(before: CartItem[], after: CartItem[]): boolean {
  if (before.length !== after.length) return true
  return after.some((item) => {
    const prev = before.find((b) => b.variant.id === item.variant.id)
    if (!prev) return true
    return JSON.stringify(item.variant.prices) !== JSON.stringify(prev.variant.prices)
  })
}

export async function validateCartItems(items: CartItem[]): Promise<CartValidationResult> {
  if (!STORE_ID || items.length === 0) {
    return { validItems: items, removedTitles: [] }
  }

  const validItems: CartItem[] = []
  const removedTitles: string[] = []

  for (const item of items) {
    const label = `${item.product.title} - ${item.variant.title}`
    try {
      const response: AxiosResponse = await apiClient.get(
        `/products/${STORE_ID}/variants/${item.variant.id}`,
      )
      const variant: ProductVariant = extractApiData<ProductVariant>(response)

      if (
        !variant?.id ||
        (variant.product?.storeId && variant.product.storeId !== STORE_ID)
      ) {
        removedTitles.push(label)
        continue
      }

      validItems.push({
        ...item,
        variant: {
          ...item.variant,
          ...variant,
          prices: variant.prices?.length ? variant.prices : item.variant.prices,
        },
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        removedTitles.push(label)
      } else {
        validItems.push(item)
      }
    }
  }

  return { validItems, removedTitles }
}
