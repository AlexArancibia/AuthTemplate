"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/stores/cartStore"
import { useMainStore } from "@/stores/mainStore"
import { Plus } from "lucide-react"
import type { Product } from "@/types/product"
import { toast } from "sonner"
import type { ProductVariant } from "@/types/productVariant"

interface FrequentlyBoughtTogetherProps {
  mainProduct: Product
  mainVariant: ProductVariant
  fbt: Record<string, string[]>
}

export function FrequentlyBoughtTogether({ mainProduct, mainVariant, fbt }: FrequentlyBoughtTogetherProps) {
  const { products, shopSettings } = useMainStore()
  const { addItem } = useCartStore()
  const [fbtProducts, setFbtProducts] = useState<{ product: Product; variant: ProductVariant; selected: boolean }[]>([])

  const defaultCurrency = shopSettings[0]?.defaultCurrency

  useEffect(() => {
    const fbtItems = Object.entries(fbt)
      .map(([productId, variantIds]) => {
        const product = products.find((p) => p.id === productId)
        if (!product) return null

        const variant = product.variants.find((v) => variantIds.includes(v.id))
        if (!variant) return null

        return { product, variant, selected: true }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    setFbtProducts(fbtItems)
  }, [fbt, products])

  const handleCheckboxChange = (index: number) => {
    setFbtProducts((prev) => prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item)))
  }

  const handleAddToCart = () => {
    addItem(mainProduct, mainVariant, 1)
    fbtProducts.forEach((item) => {
      if (item.selected) {
        addItem(item.product, item.variant, 1)
      }
    })
    toast.success("Combo añadido al carrito", {
      description: "Los productos seleccionados han sido añadidos a tu carrito.",
    })
  }

  const getPrice = (variant: ProductVariant): number => {
    const price = variant.prices.find((p) => p.currencyId === defaultCurrency?.id)?.price
    return Number(price || 0)
  }

  const mainProductPrice = getPrice(mainVariant)

  const selectedTotal = fbtProducts.reduce((sum, item) => {
    if (!item.selected) return sum
    const itemPrice = getPrice(item.variant)
    return sum + itemPrice
  }, mainProductPrice)

  if (fbtProducts.length === 0) return null

  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-4 sm:p-6 bg-background">
      <div className="mb-1">
        <h2 className="text-xl font-semibold text-foreground">¡Haz tu compra aún mejor!</h2>
        <p className="text-sm text-muted-foreground">Nuestros clientes vieron también estos productos</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 my-6">
        <div className="relative w-24 h-24 border border-border rounded-md overflow-hidden p-2 flex items-center justify-center">
          <Image
            src={mainProduct.imageUrls[0] || "/placeholder.svg"}
            alt={mainProduct.title}
            width={80}
            height={80}
            className="object-contain"
          />
        </div>

        {fbtProducts.map((item, index) => (
          <div key={`product-${item.product.id}`} className="flex items-center">
            <Plus className="mx-2 text-muted-foreground" />
            <div
              className={`relative w-24 h-24 border rounded-md overflow-hidden p-2 flex items-center justify-center cursor-pointer
                ${item.selected ? "border-2 border-primary" : "border border-border"}`}
              onClick={() => handleCheckboxChange(index)}
            >
              <Image
                src={item.product.imageUrls[0] || "/placeholder.svg"}
                alt={item.product.title}
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        ))}

        <div className="flex-1 min-w-[200px] flex flex-col items-end justify-center ml-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total:</div>
            <div className="text-xl font-bold text-foreground">
              {defaultCurrency?.symbol}
              {selectedTotal.toFixed(2)}
            </div>
          </div>

          <Button onClick={handleAddToCart} className="mt-2">
            Añadir combo
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm">
          <div className="w-5 h-5 bg-primary/20 rounded-full mr-2 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          </div>
          <span className="font-medium">Este producto: </span>
          <span className="ml-1">{mainProduct.title}</span>
        </div>

        {fbtProducts.map((item, index) => (
          <div key={`checkbox-${item.product.id}`} className="flex items-center text-sm">
            <Checkbox
              checked={item.selected}
              onCheckedChange={() => handleCheckboxChange(index)}
              id={`fbt-${item.product.id}`}
              className="mr-2"
            />
            <div className="flex flex-wrap items-center">
              <span className="font-medium text-muted-foreground mr-1">
                ({defaultCurrency?.symbol}
                {getPrice(item.variant).toFixed(2)})
              </span>
              <span>
                {item.product.title} - {item.variant.title}
              </span>
              <Link href={`/productos/${item.product.slug}`} className="ml-1 text-primary hover:underline">
                Ver
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

