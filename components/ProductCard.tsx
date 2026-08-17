"use client"
import { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import type { CurrencyOption } from "@/stores/currency"
import { useMainStore } from "@/stores/mainStore"

interface ProductCardProps {
  product: Product
  selectedCurrencyId: string | String
  acceptedCurrencies: CurrencyOption[]
  /** kept for backwards-compat with existing callers; no longer used visually */
  showSaleBadge?: boolean
  salePercentage?: number
}

export function ProductCard({
  product,
  selectedCurrencyId,
  acceptedCurrencies,
}: ProductCardProps) {
  const { shopSettings } = useMainStore()

  const activeCurrency = useMemo(() => {
    if (selectedCurrencyId) {
      return (
        acceptedCurrencies.find((c) => c.id === selectedCurrencyId) || null
      )
    }
    return shopSettings && shopSettings.length > 0
      ? shopSettings[0]?.defaultCurrency
      : null
  }, [selectedCurrencyId, acceptedCurrencies, shopSettings])

  const formatPrice = (price: number) =>
    `${activeCurrency?.symbol || "S/"} ${Number(price).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  // Collapse variants to currency-matched price points
  const variantPrices = useMemo(() => {
    return (product.variants || [])
      .map((variant) => {
        if (!variant.prices || !Array.isArray(variant.prices)) return null
        const match = variant.prices.find(
          (p) => p.currencyId === activeCurrency?.id,
        )
        if (!match || match.price == null) return null
        const price = Number(match.price)
        const originalPrice =
          match.originalPrice != null ? Number(match.originalPrice) : null
        const hasDiscount =
          originalPrice != null && originalPrice > price && price > 0
        return { price, originalPrice, hasDiscount }
      })
      .filter((v): v is NonNullable<typeof v> => v !== null)
  }, [product.variants, activeCurrency?.id])

  const prices = variantPrices.map((v) => v.price)
  const lowestPrice = prices.length ? Math.min(...prices) : 0
  const isRange = prices.length > 1 && Math.min(...prices) !== Math.max(...prices)
  const lowest = variantPrices.find((v) => v.price === lowestPrice)
  const maxDiscount = variantPrices.reduce((max, v) => {
    if (v.hasDiscount && v.originalPrice) {
      return Math.max(
        max,
        Math.round(((v.originalPrice - v.price) / v.originalPrice) * 100),
      )
    }
    return max
  }, 0)

  const image = product.imageUrls?.[0] || "/placeholders/product.svg"
  const secondaryImage = product.imageUrls?.[1] || null

  // "New" if created within 7 days
  const createdMs = product.createdAt
    ? new Date(product.createdAt).getTime()
    : 0
  const isNew = createdMs > 0 && Date.now() - createdMs < 7 * 864e5

  return (
    <div className="group relative flex h-full flex-col">
      <Link href={`/productos/${product.slug}`} className="flex h-full flex-col">
        {/* Image */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-contain p-5 transition-opacity duration-500 ease-out group-hover:opacity-0"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
          />
          {secondaryImage ? (
            <Image
              src={secondaryImage}
              alt={`${product.title} — vista alterna`}
              fill
              className="object-contain p-5 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            />
          ) : (
            <Image
              src={image}
              alt=""
              aria-hidden
              fill
              className="scale-105 object-contain p-5 opacity-0 transition-all duration-500 ease-out group-hover:opacity-100"
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            />
          )}

          {/* Top-left tags */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {isNew && (
              <span className="bg-foreground px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-background">
                Nuevo
              </span>
            )}
          </div>

          {/* Discount badge */}
          {maxDiscount > 0 && (
            <div className="absolute right-3 top-3">
              <span className="bg-brand px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-brand-foreground">
                −{maxDiscount}%
              </span>
            </div>
          )}

          {/* Quick CTA — desktop hover, always visible feel on mobile via opacity */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="block w-full bg-foreground py-2.5 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-background">
              Ver fragancia
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-grow flex-col pt-3.5">
          {product.vendor && (
            <span className="eyebrow mb-1">{product.vendor}</span>
          )}
          <h3 className="line-clamp-2 font-sans text-sm font-medium leading-snug text-foreground">
            {product.title}
          </h3>

          {prices.length > 0 && (
            <div className="mt-2 flex items-baseline gap-2">
              {isRange && (
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Desde
                </span>
              )}
              <span className="text-sm font-semibold text-foreground">
                {formatPrice(lowestPrice)}
              </span>
              {lowest?.hasDiscount && lowest.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(lowest.originalPrice)}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
