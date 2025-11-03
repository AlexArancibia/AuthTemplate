"use client"
import { useState, useMemo, useEffect } from "react"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import type { Product } from "@/types/product"
import type { CurrencyOption } from "@/stores/currency";
import { useMainStore } from "@/stores/mainStore"

interface ProductCardProps {
  product: Product
  selectedCurrencyId: String
  acceptedCurrencies: CurrencyOption[];
  showSaleBadge?: boolean
  salePercentage?: number
}

// Hook personalizado para el contador de lanzamiento
function useReleaseCountdown(releaseDate: Date | string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

  useEffect(() => {
    if (!releaseDate) {
      setTimeLeft(null)
      return
    }

    const targetDate = releaseDate instanceof Date ? releaseDate : new Date(releaseDate)

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - Date.now()

      if (difference <= 0) {
        setTimeLeft(null)
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [releaseDate])

  return { timeLeft, isReleased: timeLeft === null }
}

export function ProductCard({ 
  product, 
  selectedCurrencyId, 
  acceptedCurrencies, 
  showSaleBadge = false,
  salePercentage = 10 
}: ProductCardProps) {
  const { shopSettings } = useMainStore()
  const [isPulsing, setIsPulsing] = useState(false)

  // Efecto para la animación de pulso
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true)
      setTimeout(() => setIsPulsing(false), 1000)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Verificar que shopSettings existe y tiene elementos
  const activeCurrency = useMemo(() => {
    if (selectedCurrencyId) {
      return acceptedCurrencies.find((currency) => currency.id === selectedCurrencyId) || null
    }
    return shopSettings && shopSettings.length > 0 ? shopSettings[0]?.defaultCurrency : null
  }, [selectedCurrencyId, acceptedCurrencies, shopSettings])

  // Función helper para formatear precio
  const formatPrice = (price: number) => `${activeCurrency?.symbol || "$"} ${Number(price).toFixed(2)}`

  // Función helper para calcular porcentaje de descuento
  const calculateDiscountPercentage = (original: number, price: number): number => {
    return Math.round(((original - price) / original) * 100)
  }

  // Obtener todas las variantes con sus datos de precio
  const allVariants = (product.variants || [])
    .map((variant) => {
      if (!variant.prices || !Array.isArray(variant.prices)) return null
      
      const matchingPrice = variant.prices.find((p) => p.currencyId === activeCurrency?.id)
      if (!matchingPrice || !matchingPrice.price) return null

      const price = Number(matchingPrice.price)
      const originalPrice =
        matchingPrice.originalPrice != null
          ? typeof matchingPrice.originalPrice === "number"
            ? matchingPrice.originalPrice
            : Number(matchingPrice.originalPrice)
          : null

      // Determinar si tiene descuento (original > price y ambos válidos)
      const hasDiscount = originalPrice !== null && originalPrice > price && price > 0

      return {
        title: variant.title,
        price,
        originalPrice,
        hasDiscount,
        discountPercent: hasDiscount ? calculateDiscountPercentage(originalPrice, price) : null,
      }
    })
    .filter((v): v is NonNullable<typeof v> => v !== null)

  // Detectar si al menos una variante tiene descuento
  const hasAnyDiscount = allVariants.some((v) => v.hasDiscount)

  // Detectar si todas las variantes tienen el mismo precio y mismo originalPrice
  const allVariantsSamePrice = allVariants.length > 0 && 
    allVariants.every((v) => v.price === allVariants[0].price && 
                             v.originalPrice === allVariants[0].originalPrice)

  // Calcular precio mínimo para display
  const prices = allVariants.map((v) => v.price)
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0

  // Encontrar la variante con el precio mínimo
  const lowestPriceVariant = allVariants.find((v) => v.price === lowestPrice)
  
  // Calcular el porcentaje de descuento más alto de todas las variantes
  const maxDiscountPercent = allVariants
    .filter((v) => v.discountPercent !== null)
    .reduce((max, v) => Math.max(max, v.discountPercent!), 0)

  const priceDisplay =
    prices.length > 0
      ? prices.length === 1 || Math.min(...prices) === Math.max(...prices)
        ? formatPrice(prices[0])
        : `Desde ${formatPrice(Math.min(...prices))}`
      : null

  // Verificar si el producto es nuevo (menos de 7 días)
  const isNew =
    product.createdAt instanceof Date
      ? new Date().getTime() - product.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
      : new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000

  // Usar el hook para el contador de lanzamiento
  const { timeLeft, isReleased } = useReleaseCountdown(product.releaseDate)
  const hasUpcomingRelease = timeLeft !== null

  const image = product.imageUrls?.[0] || "/placeholder.png"
  const secondaryImage = product.imageUrls?.[1] || null

  return (
    <div className="group relative bg-white rounded-none p-0 flex flex-col h-full">
      <Link href={`/productos/${product.slug}`} className="flex flex-col h-full">
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {isNew && (
            <Badge variant="secondary" className="bg-white hover:bg-accent text-secondary text-xs">
              Nuevo
            </Badge>
          )}
          {product.status === "DRAFT" && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
              Borrador
            </Badge>
          )}
        </div>

        {/* Sale Badge */}
        {showSaleBadge && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="font-adi-regular bg-red-500 text-white text-xs px-2 py-1">
              SALE
            </Badge>
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
          {/* Primary Image */}
          <Image
            src={image || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Secondary Image (if available) */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={product.title}
              fill
              className="object-contain p-2 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 absolute top-0 left-0"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
          
          {/* Contador de lanzamiento */}
          {hasUpcomingRelease && (
            <motion.div
              className="absolute top-3 right-3 bg-blue-950 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/20"
              animate={{
                boxShadow: isPulsing ? "0 0 0 0 rgba(255, 255, 255, 0.7)" : "0 0 0 10px rgba(255, 255, 255, 0)",
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-blue-200" />
                <span className="text-xs font-medium tracking-tight">
                  {timeLeft?.days}d {timeLeft?.hours}h {timeLeft?.minutes}m {timeLeft?.seconds}s
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-grow flex flex-col">
          <div className="mb-1">
            <span className="font-bold text-sm text-gray-900 line-clamp-2 uppercase tracking-wide">{product.title}</span>
          </div>

          {/* Etiqueta de prelanzamiento */}
          {hasUpcomingRelease && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 mb-1 w-fit">
              Prelanzamiento
            </Badge>
          )}

          {/* Precio pegado al título */}
          {priceDisplay && (
            <div className="mt-1 space-y-1">
              {/* Lógica principal: Si al menos una variante tiene descuento */}
              {hasAnyDiscount ? (
                // EXCEPCIÓN: Si todas las variantes tienen el mismo precio con descuento O solo hay una variante con descuento
                (allVariantsSamePrice && allVariants[0].hasDiscount) || 
                (allVariants.length === 1 && allVariants[0].hasDiscount) ? (
                  <div className="inline-flex items-baseline">
                    <span className="text-sm font-bold text-red-600">{formatPrice(allVariants[0].price)}</span>
                    <sup className="text-xs text-gray-900 line-through whitespace-nowrap ml-1">
                      {formatPrice(allVariants[0].originalPrice!)}
                    </sup>
                  </div>
                ) : (
                  // Mostrar solo el precio mínimo con su descuento si lo tiene
                  <div className="space-y-0.5">
                    <div className="inline-flex items-baseline flex-wrap gap-1">
                      {priceDisplay?.startsWith("Desde") ? (
                        <>
                          <span className="text-sm font-bold text-gray-900">Desde</span>
                          {lowestPriceVariant?.hasDiscount && lowestPriceVariant.originalPrice ? (
                            <>
                              <span className="text-sm font-bold text-red-600">{formatPrice(lowestPrice)}</span>
                              <sup className="text-xs text-gray-900 line-through whitespace-nowrap ml-1">
                                {formatPrice(lowestPriceVariant.originalPrice)}
                              </sup>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-gray-900">{formatPrice(lowestPrice)}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-bold text-red-600">{priceDisplay}</span>
                          {lowestPriceVariant?.hasDiscount && lowestPriceVariant.originalPrice && (
                            <sup className="text-xs text-gray-900 line-through whitespace-nowrap ml-1">
                              {formatPrice(lowestPriceVariant.originalPrice)}
                            </sup>
                          )}
                        </>
                      )}
                    </div>
                    {maxDiscountPercent > 0 && (
                      <div className="text-xs text-green-600 font-medium">
                        Descuentos hasta -{maxDiscountPercent}%
                      </div>
                    )}
                  </div>
                )
              ) : (
                // No hay descuentos: display simple con fallback a showSaleBadge si aplica
                <div className="font-adi-regular flex items-center gap-2 flex-wrap">
                  {showSaleBadge ? (
                    <>
                      <span className="text-base font-bold text-black">{priceDisplay}</span>
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(lowestPrice * (1 + salePercentage / 100))}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-black">{priceDisplay}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
