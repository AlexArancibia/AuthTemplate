"use client"

import Image from "next/image"
import Link from "next/link"
import { Truck, CreditCard, Package, Phone } from "lucide-react"
import type { Product } from "@/types/product"
import { useMainStore } from "@/stores/mainStore"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { WashingTestButton } from "./WashingTestButton"
import { DeliveryButton } from "./DeliveryButton"
import apiClient from "@/lib/axiosConfig"

interface ProductSidebarProps {
  product: Product
}

export function ProductSidebar({ product }: ProductSidebarProps) {
  const { shippingMethods, paymentProviders, shopSettings } = useMainStore()
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [loadingLatest, setLoadingLatest] = useState(true)

  // Cargar últimos productos directamente desde la API
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLoadingLatest(true)
        const storeId = process.env.NEXT_PUBLIC_STORE_ID
        
        if (!storeId) {
          console.error("No store ID found")
          return
        }

        // Petición para obtener los últimos 3 productos activos, ordenados por fecha de creación
        const response = await apiClient.get(`/products/${storeId}`, {
          params: {
            page: 1,
            limit: 4, // Traer 4 para tener margen por si uno es el producto actual
            sortBy: 'createdAt',
            sortOrder: 'desc',
            'status[]': 'ACTIVE'
          }
        })

        const products = response.data.data || response.data || []
        
        // Filtrar el producto actual y tomar solo 3
        const filtered = products
          .filter((p: Product) => p.id !== product.id)
          .slice(0, 3)
        
        setLatestProducts(filtered)
      } catch (error) {
        console.error("Error fetching latest products:", error)
        setLatestProducts([])
      } finally {
        setLoadingLatest(false)
      }
    }

    fetchLatestProducts()
  }, [product.id])

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
      {/* <div className="border rounded-lg p-4 shadow-md bg-gray-50/90 shadow-slate-200/30">
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
      </div> */}

      {/* Métodos de pago */}
      <div className="border rounded-lg p-4 shadow-md bg-gray-50/90 shadow-slate-200/30">
          <h3 className="font-normal text-base mb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Métodos de pago
          </h3>
          <div className="flex flex-wrap gap-3">
            {paymentProviders.map((provider) => (
              <div 
                key={provider.id} 
                className="  rounded-lg text-sm flex items-center gap-2  "
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
            // Estado de carga
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestProducts.length > 0 ? (
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
