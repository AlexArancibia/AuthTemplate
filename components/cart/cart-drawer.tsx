"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { useCartStore } from "@/stores/cartStore"

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, getTotal, getItemsCount } = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const itemsCount = getItemsCount()
  const total = getTotal()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Carrito</span>
          {itemsCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemsCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Tu Carrito ({itemsCount})</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Vaciar
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Tu carrito está vacío</p>
            <Button variant="outline" className="mt-4" onClick={() => setIsOpen(false)}>
              Continuar comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto py-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.variant.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-4 py-4 border-b"
                  >
                    <div className="relative h-20 w-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      {/* Use variant imageUrl if available, otherwise use first product imageUrl */}
                      {item.variant.imageUrls ? (
                        <Image
                          src={item.variant.imageUrls[0] || "/placeholder.svg"}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : item.product.imageUrls && item.product.imageUrls.length > 0 ? (
                        <Image
                          src={item.product.imageUrls[0] || "/placeholder.svg"}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-gray-200">
                          <ShoppingCart className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="font-medium">{item.product.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.variant.title}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => removeItem(item.variant.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-md">
                          <Button
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
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none"
                            onClick={() => updateQuantity(item.variant.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="font-medium">
                          {item.variant.prices &&
                            item.variant.prices.length > 0 &&
                            formatCurrency(
                              item.variant.prices[0].price * item.quantity,
                              item.variant.prices[0].currency?.code || "USD",
                            )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center font-medium">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              <Button className="w-full">Proceder al pago</Button>

              <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                Continuar comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
