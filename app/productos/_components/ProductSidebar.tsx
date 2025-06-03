"use client"

import Image from "next/image"
import Link from "next/link"
import { Truck, CreditCard, Package, Phone } from "lucide-react"
import type { Product } from "@/types/product"
import { useMainStore } from "@/stores/mainStore"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { WashingTestButton } from "./WashingTestButton"
import { DeliveryButton } from "./DeliveryButton"

interface ProductSidebarProps {
  product: Product
}

export function ProductSidebar({ product }: ProductSidebarProps) {
  const { products, shippingMethods, paymentProviders, shopSettings } = useMainStore()

  const latestProducts = useMemo(() => {
    return products
      .filter(
        (p) => p.id !== product.id && p.status === "ACTIVE", // Solo productos activos
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
  }, [products, product])

  const defaultCurrency = shopSettings[0]?.defaultCurrency

  const handleWhatsAppClick = () => {
    const phoneNumber = shopSettings[0].phone?.replace(/\D/g, "") // Remove non-digit characters
    const message = encodeURIComponent(`Hola, me gustaría obtener más información sobre el producto: ${product.title}`)
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Destacados */}
      <div className="space-y-3">
        <WashingTestButton />
        <DeliveryButton />
      </div>

      {/* Métodos de envío */}
      <div className="border rounded-lg p-4 shadow-md bg-gray-50/90 shadow-slate-200/30">
        <h3 className="font-normal text-base mb-3 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Métodos de envío
        </h3>
        <ul className="space-y-2">
          {shippingMethods.map((method) => (
            <li key={method.id} className="flex justify-between text-sm text-gray-600">
              <span>{method.name}</span>
              <span className="font-medium">
                {method.prices[0].price === 0
                  ? "Gratis"
                  : `${defaultCurrency?.symbol}${Number(method.prices[0].price).toFixed(2)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Métodos de pago */}
      <div className="border rounded-lg p-4 shadow-md bg-gray-50/90 shadow-slate-200/30">
        <h3 className="font-normal text-base mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Métodos de pago
        </h3>
        <div className="flex flex-wrap gap-2">
          {paymentProviders.map((provider) => (
            <div key={provider.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              {provider.name}
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
          {latestProducts.length > 0 ? (
            latestProducts.map((latestProduct) => (
              <Link
                key={latestProduct.id}
                href={`/productos/${latestProduct.slug}`}
                className="flex items-center gap-3 group"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={latestProduct.imageUrls?.[0] || "/placeholder.svg?height=64&width=64&query=product"}
                    alt={latestProduct.title}
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                    {latestProduct.title}
                  </p>
                  {latestProduct.variants?.[0]?.prices?.[0] && (
                    <p className="text-sm text-primary font-medium">
                      {defaultCurrency?.symbol}
                      {Number(latestProduct.variants[0].prices[0].price).toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))
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
