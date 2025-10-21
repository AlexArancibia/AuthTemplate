"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
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
  selectedCurrencyId?: string
}

export function CartReviewStep({ items, currency, nextStep, selectedCurrencyId }: CartReviewStepProps) {
  const { updateQuantity, removeItem } = useCartStore()

  // Función helper para obtener el precio de manera segura
  const getItemPrice = (variant: ProductVariant): number => {
    if (!variant.prices || !Array.isArray(variant.prices) || variant.prices.length === 0) {
      return 0
    }
    // Si hay currencyId, buscar precio específico para esa moneda
    let price = variant.prices[0]?.price
    if (selectedCurrencyId) {
      const priceObj = variant.prices.find(p => p.currencyId === selectedCurrencyId)
      price = priceObj?.price ?? variant.prices[0]?.price
    }
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
      <div>
        <h2 className="text-xl font-semibold mb-2">Tu carrito</h2>
        <p className="text-sm text-muted-foreground">
          Revisa y edita tus productos antes de continuar
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Tu carrito está vacío</p>
          <Button asChild>
            <Link href="/products">Continuar comprando</Link>
          </Button>
        </div>
      ) : (
        <>
          <Card className="overflow-hidden rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Producto</th>
                    <th className="text-left p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                      Precio
                    </th>
                    <th className="text-center p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Cantidad</th>
                    <th className="text-right p-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">Subtotal</th>
                    <th className="w-10 p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item) => {
                    const itemPrice = getItemPrice(item.variant)
                    const itemTotal = getItemTotal(item.variant, item.quantity)
                    const isBackorder = false // Puedes agregar lógica para determinar si es a pedido

                    return (
                      <motion.tr
                        key={item.variant.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="group hover:bg-muted/10 transition-all duration-300"
                      >
                        <td className="p-4">
                          <div className="flex gap-3 items-start">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-card shadow-sm">
                              <Image
                                src={item.product.imageUrls?.[0] || "/placeholder.svg?height=64&width=64&query=product"}
                                alt={item.product.title || "Producto"}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium text-sm truncate">
                                {item.product.title || "Producto sin título"}
                              </h3>
                              {item.variant.attributes && Object.entries(item.variant.attributes).length > 0 && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {Object.entries(item.variant.attributes || {})
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(", ")}
                                </p>
                              )}
                              {isBackorder && (
                                <span className="text-xs text-warning font-medium">
                                  Producto a pedido
                                </span>
                              )}
                              <p className="md:hidden text-sm font-medium mt-2 text-foreground">
                                {currency} {itemPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="font-medium text-sm text-foreground">
                            {currency} {itemPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                              onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                              onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-semibold text-sm text-foreground">
                            {currency} {itemTotal.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
                            onClick={() => removeItem(item.variant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Resumen del total */}
          <Card className="p-4 md:p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Subtotal:</span>
              <span className="text-xl font-bold text-primary">
                {currency}
                {Number(cartTotal).toFixed(2)}
              </span>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
            <Button variant="ghost" asChild className="text-sm">
              <Link href="/productos">Seguir comprando</Link>
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
