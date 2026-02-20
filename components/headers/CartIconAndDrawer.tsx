"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { formatCurrency } from "@/lib/utils"
import { ShoppingCart, X } from "lucide-react"
import { useCartStore } from "@/stores/cartStore"
import { useCurrencyStore } from "@/stores/currency"

export function CartIconAndDrawer() {
  const [mounted, setMounted] = useState(false)
  const { items, removeItem, updateQuantity, getTotal, getItemsCount } = useCartStore()
  const { acceptedCurrencies, selectedCurrencyId } = useCurrencyStore()
  const activeCurrency = acceptedCurrencies.find((c) => c.id === selectedCurrencyId)
  const totalItems = getItemsCount()
  const totalPrice = getTotal(selectedCurrencyId)

  useEffect(() => setMounted(true), [])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative text-secondary hover:text-primary hover:bg-secondary/10"
          aria-label="Carrito de compras"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {mounted && totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[380px] bg-background p-4">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-lg">Tu Carrito</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-[calc(100%-3rem)]">
          <div className="flex-grow overflow-y-auto py-2">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 mt-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-center text-muted-foreground text-sm">Tu carrito está vacío</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variant.id} className="flex items-center gap-3 py-3 border-b">
                  <div className="relative h-14 w-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.variant.imageUrls && item.variant.imageUrls.length > 0 ? (
                      <img
                        src={item.variant.imageUrls[0] || "/placeholder.svg"}
                        alt={item.product.title}
                        className="object-cover h-full w-full"
                      />
                    ) : item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                      <img
                        src={item.product.imageUrls[0] || "/placeholder.svg"}
                        alt={item.product.title}
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-200">
                        <ShoppingCart className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm truncate">{item.product.title}</h4>
                    <p className="text-xs text-muted-foreground truncate mb-1">{item.variant.title}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.variant.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <span className="text-xs">-</span>
                      </Button>
                      <span className="text-xs min-w-[20px] text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                      >
                        <span className="text-xs">+</span>
                      </Button>
                    </div>
                    <p className="text-xs">
                      {(() => {
                        const prices = item.variant.prices
                        if (!prices?.length) return "N/A"
                        const priceForCurrency = prices.find((p) => p.currency?.id === activeCurrency?.id)
                        const price = priceForCurrency || prices[0]
                        return price ? formatCurrency(price.price * item.quantity, activeCurrency) : "N/A"
                      })()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeItem(item.variant.id)}
                    aria-label="Eliminar producto"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
          {items.length > 0 && (
            <div className="mt-auto pt-3 border-t">
              <p className="text-base mb-3 flex justify-between">
                <span>Total:</span>
                <span>{formatCurrency(totalPrice, activeCurrency)}</span>
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/cart">Ver Carrito</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href="/checkout">Proceder a Pagar</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
