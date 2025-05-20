"use client"
import { useState, useEffect } from "react"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Eye } from "lucide-react"
import type { Product } from "@/types/product"
import { useMainStore } from "@/stores/mainStore"

interface ProductCardProps {
  product: Product
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

export function ProductCard({ product }: ProductCardProps) {
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
  const defaultCurrency = shopSettings && shopSettings.length > 0 ? shopSettings[0]?.defaultCurrency : null

  // Obtener todos los precios de las variantes que coinciden con la moneda predeterminada
  const prices = product.variants
    .flatMap((variant) => {
      // Buscar el precio que coincide con la moneda predeterminada
      const matchingPrice = variant.prices.find((p) => p.currencyId === defaultCurrency?.id)
      return matchingPrice ? matchingPrice.price : null
    })
    .filter((price): price is number => price !== null) // Filtrar valores nulos

  // Si no hay precios válidos, usar un array con 0 para evitar errores
  const validPrices = prices.length > 0 ? prices : [0]

  const lowestPrice = Math.min(...validPrices)
  const highestPrice = Math.max(...validPrices)

  const formatPrice = (price: number) => `${defaultCurrency?.symbol || "$"} ${price.toFixed(2)}`

  const priceDisplay =
    lowestPrice === highestPrice
      ? formatPrice(lowestPrice)
      : `${formatPrice(lowestPrice)} - ${formatPrice(highestPrice)}`

  // Verificar si el producto es nuevo (menos de 7 días)
  const isNew =
    product.createdAt instanceof Date
      ? new Date().getTime() - product.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
      : new Date().getTime() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000

  // Usar el hook para el contador de lanzamiento
  const { timeLeft, isReleased } = useReleaseCountdown(product.releaseDate)
  const hasUpcomingRelease = timeLeft !== null

  const image = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : "/placeholder.svg"

  return (
    <motion.div
      className="group relative bg-white rounded-2xl p-4 border hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
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

        {/* Image Container */}
        <div className="relative aspect-square mb-4 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
          <Image
            src={image || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

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
          <div className="mb-2">
            <p className="text-sm text-secondary line-clamp-2 ">{product.title}</p>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-md font-bold text-gray-700">{priceDisplay}</span>

            {/* Etiqueta de prelanzamiento */}
            {hasUpcomingRelease && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Prelanzamiento
              </Badge>
            )}
          </div>

          {/* Espacio reservado para el botón */}
          <div className="h-8 mt-auto"></div>
        </div>
      </Link>

      {/* Ver Producto Button - Ahora fuera del contenido principal */}
      <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          className="w-full gap-2 bg-white border border-gray-200 text-primary hover:bg-gray-50 h-7 text-xs"
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
  )
}
