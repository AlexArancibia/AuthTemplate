import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Product } from "@/types/product"
import type { ProductVariant } from "@/types/productVariant"

export interface CartItem {
  product: Product
  variant: ProductVariant
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, variant: ProductVariant, quantity: number) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemsCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant, quantity) => {
        console.log("[CART] Adding item to cart:", product.title, variant.title, quantity)
        set((state) => {
          const existingItem = state.items.find((item) => item.variant.id === variant.id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.variant.id === variant.id ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            }
          } else {
            return { items: [...state.items, { product, variant, quantity }] }
          }
        })
      },

      removeItem: (variantId) => {
        console.log("[CART] Removing item from cart:", variantId)
        set((state) => ({
          items: state.items.filter((item) => item.variant.id !== variantId),
        }))
      },

      updateQuantity: (variantId, quantity) => {
        console.log("[CART] Updating quantity:", variantId, quantity)
        set((state) => ({
          items: state.items.map((item) => (item.variant.id === variantId ? { ...item, quantity } : item)),
        }))
      },

      clearCart: () => {
        console.log("[CART] Clearing cart")
        set({ items: [] })
      },

      getTotal: () => {
        const total = get().items.reduce((total, item) => {
          // Check if prices array exists and has items
          const price = item.variant.prices && item.variant.prices.length > 0 ? item.variant.prices[0].price : 0
          return total + price * item.quantity
        }, 0)
        console.log("[CART] Calculated total:", total)
        return total
      },

      getItemsCount: () => {
        const count = get().items.reduce((count, item) => count + item.quantity, 0)
        return count
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist the items array
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
