"use client"

import { useCartStore } from "@/stores/cartStore"
import { useMainStore } from "@/stores/mainStore"
import { useCurrencyStore } from "@/stores/currency"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react"
import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

const FREE_SHIPPING_THRESHOLD = 199

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()
  const { shopSettings } = useMainStore()
  const [isLoading, setIsLoading] = useState(true)

  const currency = shopSettings[0]?.defaultCurrency
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const activeCurrency = acceptedCurrencies.find((c) => c.id === selectedCurrencyId)

  // Simulate loading state for data fetching
  useEffect(() => {
    const checkDataLoaded = () => {
      if (shopSettings && shopSettings.length > 0 && currency) {
        setIsLoading(false)
      }
    }

    checkDataLoaded()

    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timeout)
  }, [shopSettings, currency, items])

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="container-section py-12 md:py-32">
        <div className="content-section">
          <Skeleton className="h-10 w-40 mb-8 rounded-none" />
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="lg:w-2/3 space-y-0">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center gap-4 py-6 border-b border-border">
                  <Skeleton className="w-24 h-24 rounded-none" />
                  <div className="flex-1">
                    <Skeleton className="h-3 w-20 mb-3 rounded-none" />
                    <Skeleton className="h-5 w-3/4 mb-2 rounded-none" />
                    <Skeleton className="h-4 w-1/2 rounded-none" />
                  </div>
                  <Skeleton className="h-9 w-28 rounded-none" />
                  <Skeleton className="h-5 w-16 rounded-none" />
                </div>
              ))}
            </div>
            <div className="lg:w-1/3 bg-secondary p-6">
              <Skeleton className="h-6 w-48 mb-6 rounded-none" />
              <div className="space-y-4 mb-6">
                <Skeleton className="h-5 w-full rounded-none" />
                <Skeleton className="h-5 w-full rounded-none" />
              </div>
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="container-section py-16 md:py-32">
        <div className="content-section">
          <p className="eyebrow text-muted-foreground mb-3">Carrito</p>
          <h1 className="font-display text-3xl md:text-4xl mb-12">Tu carrito</h1>
          <div className="flex flex-col items-center justify-center py-16 text-center border border-border">
            <div className="flex h-16 w-16 items-center justify-center bg-secondary mb-6">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-muted-foreground mb-8 max-w-md">
              Tu carrito está vacío. Descubre nuestra colección de fragancias para comenzar.
            </p>
            <Button asChild className="rounded-none">
              <Link href="/productos">Explorar perfumes</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = getTotal(selectedCurrencyId)
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  const qualifiesFreeShipping = remainingForFreeShipping <= 0

  return (
    <div className="container-section py-12 md:py-32">
      <div className="content-section">
        <p className="eyebrow text-muted-foreground mb-3">Carrito</p>
        <h1 className="font-display text-3xl md:text-4xl mb-12">Tu carrito</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Line items */}
          <div className="lg:w-2/3">
            {items.map((item) => {
              const priceObj = item.variant.prices.find((p) => p.currencyId === selectedCurrencyId)
              const price = priceObj?.price ?? 0
              const finalPrice = price * item.quantity
              const attributes = item.variant.attributes
                ? Object.entries(item.variant.attributes)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" · ")
                : ""

              return (
                <div
                  key={item.variant.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-6 border-b border-border"
                >
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="relative h-24 w-24 shrink-0 bg-secondary overflow-hidden">
                      <Image
                        src={item.product.imageUrls[0] || "/placeholder.svg"}
                        alt={item.product.title}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      {item.product.vendor && (
                        <p className="eyebrow text-muted-foreground mb-1">{item.product.vendor}</p>
                      )}
                      <h3 className="font-display text-lg leading-tight text-foreground">
                        {item.product.title}
                      </h3>
                      {attributes && (
                        <p className="text-sm text-muted-foreground mt-1">{attributes}</p>
                      )}
                      <button
                        type="button"
                        onClick={() => removeItem(item.variant.id)}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors sm:hidden"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {/* Quantity stepper */}
                  <div className="flex items-center justify-between sm:justify-start gap-6">
                    <div className="flex items-center border border-border">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-none"
                        onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-10 text-center text-sm tabular-nums">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 rounded-none"
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-medium tabular-nums text-foreground min-w-[5rem] text-right">
                        {formatCurrency(finalPrice, activeCurrency)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variant.id)}
                        className="hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" className="rounded-none px-0 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={clearCart}>
                Vaciar carrito
              </Button>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 text-sm text-foreground hover:text-brand transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Continuar comprando
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-1/3">
            <div className="bg-secondary p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl mb-6">Resumen del pedido</h2>

              {/* Free shipping progress */}
              <div className="mb-6">
                {qualifiesFreeShipping ? (
                  <p className="text-sm text-foreground mb-3">
                    <span className="text-brand font-medium">✓</span> ¡Calificas para envío gratis!
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mb-3">
                    Te faltan{" "}
                    <span className="text-foreground font-medium">
                      {formatCurrency(remainingForFreeShipping, activeCurrency)}
                    </span>{" "}
                    para envío gratis
                  </p>
                )}
                <div className="h-1 w-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-brand transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums text-foreground">
                    {formatCurrency(subtotal, activeCurrency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="text-muted-foreground">Calculado en el checkout</span>
                </div>
              </div>

              <div className="border-t border-border pt-5 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-medium text-lg tabular-nums text-foreground">
                    {formatCurrency(subtotal, activeCurrency)}
                  </span>
                </div>
              </div>

              <Button asChild className="w-full rounded-none h-12">
                <Link href="/checkout">Proceder al pago</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
