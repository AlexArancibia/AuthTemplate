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
import { useCartStore } from "@/stores/cartStore"

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
  const { addItem } = useCartStore()
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

  // Función para manejar agregar al carrito
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Obtener la primera variación del producto
    const firstVariant = product.variants?.[0]
    if (firstVariant) {
      addItem(product, firstVariant, 1)
    }
  }

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
          
          {/* Shopping Cart Icon */}
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button 
              onClick={handleAddToCart}
              className="bg-white backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-200 cursor-pointer relative"
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-4 h-4 text-gray-700" />
              
              {/* Efecto de pulso animado similar al WhatsApp */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gray-400 opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </motion.button>
          </div>


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
                  {timeLeft?.days}d {timeLeft?.hours}h {timeLeft?.minutes}m
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
            <div className="mt-1">
              <div className="font-adi-regular flex items-center gap-2">
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
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
