"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { Product } from "@/types/product"
import type { ProductVariant } from "@/types/productVariant"

type CartItem = {
  product: Product
  variant: ProductVariant
  quantity: number
}

interface CartReviewStepProps {
  items: CartItem[]
  currency: string
  nextStep: () => void
}

export function CartReviewStep({ items, currency, nextStep }: CartReviewStepProps) {
  const { updateQuantity, removeItem } = useCartStore()

  // Función helper para obtener el precio de manera segura
  const getItemPrice = (variant: ProductVariant): number => {
    if (!variant.prices || !Array.isArray(variant.prices) || variant.prices.length === 0) {
      return 0
    }
    const price = variant.prices[0]?.price
    // Asegurar que el precio sea un número válido
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return isNaN(numericPrice) || numericPrice == null ? 0 : Number(numericPrice)
  }

  // Función helper para calcular el total del item
  const getItemTotal = (variant: ProductVariant, quantity: number): number => {
    const price = getItemPrice(variant)
    return price * quantity
  }

  // Calcular el total del carrito
  const cartTotal = items.reduce((total, item) => {
    return total + getItemTotal(item.variant, item.quantity)
  }, 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Revisa tu carrito</h2>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
          <Button asChild>
            <Link href="/products">Continuar comprando</Link>
          </Button>
        </div>
      ) : (
        <>
          {items.map((item) => {
            const itemPrice = getItemPrice(item.variant)
            const itemTotal = getItemTotal(item.variant, item.quantity)

            return (
              <motion.div
                key={item.variant.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-5 py-5 border-b last:border-b-0 group"
              >
                <div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
                  <Image
                    src={item.product.imageUrls?.[0] || "/placeholder.svg?height=96&width=96&query=product"}
                    alt={item.product.title || "Producto"}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                    {item.product.title || "Producto sin título"}
                  </h3>
                  {/* <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">Variante:</span> {item.variant.title || "Sin especificar"}
                  </p> */}
                  {item.variant.attributes && Object.entries(item.variant.attributes).length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {Object.entries(item.variant.attributes || {})
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ")}
                    </p>
                  )}

                  {itemPrice === 0 && <p className="text-sm text-red-500 mt-1">Precio no disponible</p>}

                  <div className="flex items-center mt-3 space-x-4">
                    <div className="flex items-center border rounded-md">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-none"
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                      onClick={() => removeItem(item.variant.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">
                    {currency}
                    {Number(itemTotal).toFixed(2)}
                  </p>
                  {itemPrice > 0 && (
                    <p className="text-sm text-gray-500">
                      {currency}
                      {Number(itemPrice).toFixed(2)} c/u
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}

          {/* Resumen del total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">
                {currency}
                {Number(cartTotal).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-between pt-6 gap-3">
            <Button variant="outline" asChild className="px-6 gap-2 border-gray-300 hover:bg-gray-50 transition-colors">
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al carrito</span>
              </Link>
            </Button>
            <Button
              onClick={nextStep}
              disabled={cartTotal === 0}
              className="px-6 gap-2 bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/10 hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continuar</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}
