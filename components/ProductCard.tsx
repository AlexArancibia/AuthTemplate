"use client"
import { useState, useMemo, useEffect } from "react"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye, ShoppingCart } from "lucide-react"
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
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number } | null>(null)
  const [isReleased, setIsReleased] = useState(false)

  useEffect(() => {
    if (!releaseDate) {
      setTimeLeft(null)
      setIsReleased(true)
      return
    }

    const targetDate = releaseDate instanceof Date ? releaseDate : new Date(releaseDate)
    const now = new Date()

    // Si la fecha de lanzamiento ya pasó
    if (targetDate <= now) {
      setTimeLeft(null)
      setIsReleased(true)
      return
    }

    // Calcular tiempo restante inicialmente
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft(null)
        setIsReleased(true)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft({ days, hours, minutes })
      setIsReleased(false)
    }

    calculateTimeLeft()

    // Actualizar cada minuto
    const timer = setInterval(calculateTimeLeft, 60000)

    return () => clearInterval(timer)
  }, [releaseDate])

  return { timeLeft, isReleased }
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

  // Obtener todos los precios de las variantes que coinciden con la moneda predeterminada
  const prices = (product.variants || [])
    .flatMap((variant) => {
      // Validar que variant tenga prices y sea un array
      if (!variant.prices || !Array.isArray(variant.prices)) {
        return null
      }
      // Buscar el precio que coincide con la moneda activa
      const matchingPrice = variant.prices.find((p) => p.currencyId === activeCurrency?.id)
      return matchingPrice ? matchingPrice.price : null
    })
    .filter((price): price is number => price !== null && price > 0) // Filtrar valores nulos y cero

  // Si no hay precios válidos, usar un array con 0 para evitar errores
  const validPrices = prices.length > 0 ? prices : [0]

  const lowestPrice = Math.min(...validPrices)
  const highestPrice = Math.max(...validPrices)

  const formatPrice = (price: number) => `${activeCurrency?.symbol || "$"} ${Number(price).toFixed(2)}`

  const priceDisplay =
    prices.length > 0
      ? prices.length === 1 || Math.min(...prices) === Math.max(...prices)
        ? formatPrice(prices[0])
        : `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`
      : null

  // Verificar si el producto es nuevo (menos de 7 días)
  const isNew =
    product.createdAt instanceof Date
      ? new Date().getTime() - product.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
      : new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000

  // Usar el hook para el contador de lanzamiento
  const { timeLeft, isReleased } = useReleaseCountdown(product.releaseDate)
  const hasUpcomingRelease = timeLeft !== null

  const image = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : "/placeholder.png"
  
  // Get secondary image for hover effect
  const getSecondaryImage = (product: Product) => {
    return product.imageUrls && product.imageUrls.length > 1 
      ? product.imageUrls[1] 
      : null
  }
  
  const secondaryImage = getSecondaryImage(product)

  return (
    <div className="group relative bg-white rounded-none p-6 sm:p-8 flex flex-col h-full">
      <Link href={`/productos/${product.slug}`} className="flex flex-col h-full">
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
          {isNew && (
            <Badge variant="secondary" className="bg-white hover:bg-accent text-secondary">
              Nuevo
            </Badge>
          )}
          {product.status === "DRAFT" && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Borrador
            </Badge>
          )}
        </div>

        {/* Sale Badge */}
        {showSaleBadge && (
          <div className="absolute top-6 right-6 z-10">
            <Badge className="font-adi-regular bg-red-500 text-white text-xs px-2 py-1">
              SALE
            </Badge>
          </div>
        )}

        {/* Image Container - Ahora más grande */}
        <div className="relative aspect-square mb-6 sm:mb-8 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
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
          
          {/* Shopping Cart Icon */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
              <ShoppingCart className="w-4 h-4 text-gray-700" />
            </div>
          </div>

          {/* Contador de lanzamiento - Diseño refinado */}
          {hasUpcomingRelease && (
            <motion.div
              className="absolute top-3 right-3 bg-blue-950 backdrop-blur-sm text-white px-3 py-1.5 rounded-full border border-white/20 shadow-lg"
              animate={{
                boxShadow: isPulsing ? "0 0 0 0 rgba(255, 255, 255, 0.7)" : "0 0 0 10px rgba(255, 255, 255, 0)",
              }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-blue-200" />
                <span className="text-xs font-medium tracking-tight">
                  {timeLeft?.days}d {timeLeft?.hours}h {timeLeft?.minutes}m
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Product Info - Ahora con espacio fijo */}
        <div className="flex-grow flex flex-col">
          <div className="mb-3 sm:mb-4">
            <p className="font-adi-regular text-sm sm:text-base font-medium text-gray-900 line-clamp-2 uppercase tracking-wide">{product.title}</p>
          </div>

          {/* Etiqueta de prelanzamiento */}
          {hasUpcomingRelease && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 mb-2 w-fit">
              Prelanzamiento
            </Badge>
          )}
        </div>

        {/* Precio en la parte inferior */}
        {priceDisplay && (
          <div className="mt-auto pt-6 sm:pt-8">
            <div className="font-adi-regular flex items-center gap-2">
              {showSaleBadge ? (
                <>
                  <span className="text-base font-medium text-black">{priceDisplay}</span>
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(lowestPrice * (1 + salePercentage / 100))}
                  </span>
                </>
              ) : (
                <span className="text-sm sm:text-base font-medium text-black">{priceDisplay}</span>
              )}
            </div>
          </div>
        )}
      </Link>
      <motion.div>
        {/* Ver Producto Button - Ahora fuera del contenido principal */}
        <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            className="w-full gap-2 bg-white text-primary hover:bg-white h-7 text-xs shadow-none border-0"
            disabled={false}
            onClick={(e) => {
              e.stopPropagation()
              window.location.href = `/productos/${product.slug}`
            }}
          >
            <Eye className="w-4 h-4" />
            {hasUpcomingRelease ? "Ver Prelanzamiento" : "Ver Producto"}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
