"use client"

import Image from "next/image"
import Link from "next/link"
import { Truck, CreditCard, Package, Phone, Loader2 } from "lucide-react"
import type { Product } from "@/types/product"
import { useMainStore } from "@/stores/mainStore"
import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DeliveryButton } from "./DeliveryButton"
import type { CurrencyOption } from "@/stores/currency"

interface ProductSidebarProps {
  product: Product
  selectedCurrencyId: String
  acceptedCurrencies: CurrencyOption[];
}

export function ProductSidebar({ product, selectedCurrencyId, acceptedCurrencies }: ProductSidebarProps) {
  const { shippingMethods, paymentProviders, shopSettings, fetchProducts } = useMainStore()
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [loadingLatest, setLoadingLatest] = useState(true)

  const currencyOption = useMemo(() => {
    const defaultCurrency = shopSettings[0]?.defaultCurrency
    return acceptedCurrencies.find((c) => c.id === selectedCurrencyId) || defaultCurrency
  }, [acceptedCurrencies, selectedCurrencyId, shopSettings])

  useEffect(() => {
    const loadLatestProducts = async () => {
      try {
        setLoadingLatest(true)
        const response = await fetchProducts({
          limit: 4,
          status: ['ACTIVE'],
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })

        setLatestProducts(
          response.data.filter((p) => p.id !== product.id).slice(0, 3)
        )
      } catch {
        setLatestProducts([])
      } finally {
        setLoadingLatest(false)
      }
    }

    loadLatestProducts()
  }, [product.id, fetchProducts])

  const handleWhatsAppClick = () => {
    const phoneNumber = shopSettings[0].phone?.replace(/\D/g, "")
    const message = encodeURIComponent(`Hola, me gustaría obtener más información sobre el producto: ${product.title}`)
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Destacados */}
      <div className="space-y-3">
        <DeliveryButton />
      </div>

      {/* Métodos de envío - Solo mostrar si hay métodos disponibles */}
      {shippingMethods.length > 0 && (
        <div className="border rounded-lg p-4 shadow-md bg-gray-50/90 shadow-slate-200/30">
          <h3 className="font-normal text-base mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Métodos de envío
          </h3>
          <ul className="space-y-2">
            {shippingMethods.map((method) => {
              const matchingPrice = method.prices.find(
                (price) => price.currencyId === currencyOption?.id
              )

              if (!matchingPrice) return null

              return (
                <li key={method.id} className="flex justify-between text-sm text-gray-600">
                  <span>{method.name}</span>
                  <span className="font-medium">
                    {matchingPrice.price === 0
                      ? "Gratis"
                      : `${currencyOption?.symbol}${Number(matchingPrice.price).toFixed(2)}`}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Métodos de pago */}
      <div className="border rounded-lg p-4 shadow-md bg-gray-50/90 shadow-slate-200/30">
          <h3 className="font-light text-base mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de pago
          </h3>
          <div className="flex flex-wrap gap-3">
            {paymentProviders.map((provider) => (
              <div 
                key={provider.id} 
                className="rounded-lg text-sm flex items-center gap-2"
              >
                {provider.imgUrl ? (
                  <div className="w-6 h-6 flex-shrink-0 overflow-hidden rounded">
                    <img
                      src={provider.imgUrl || "/placeholder.svg"}
                      alt={provider.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                    <CreditCard className="w-3 h-3 text-blue-600" />
                  </div>
                )}
                <span className="text-gray-700 font-normal">{provider.name}</span>
              </div>
            ))}
          </div>
        </div>

      {/* Últimos productos */}
      <div className="border rounded-lg p-4 shadow-md bg-gray-50/90 shadow-slate-200/30">
        <h3 className="font-normal text-base mb-3 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Últimos productos
        </h3>
        <div className="space-y-4">
          {loadingLatest ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : latestProducts.length > 0 ? (
            latestProducts.map((latestProduct) => {
              const matchingPrice = latestProduct.variants?.[0]?.prices?.find(
                (p) => p.currencyId === currencyOption?.id
              )
              const finalPrice = matchingPrice ? Number(matchingPrice.price) : 0

              return (
                <Link
                  key={latestProduct.id}
                  href={`/productos/${latestProduct.slug}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={
                        latestProduct.imageUrls?.[0] ||
                        "/placeholder.png"
                      }
                      alt={latestProduct.title}
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {latestProduct.title}
                    </p>
                    <p className="text-sm text-primary font-medium">
                      {currencyOption?.symbol}
                      {finalPrice.toFixed(2)}
                    </p>
                  </div>
                </Link>
              )
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No hay productos disponibles</p>
          )}
        </div>
      </div>

      <Button
        onClick={handleWhatsAppClick}
        className="w-full bg-blue-50 font-normal shadow-none border border-blue-100 text-secondary hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
      >
        <Phone className="w-5 h-5" />
        Preguntar por este producto
      </Button>
    </div>
  )
}
