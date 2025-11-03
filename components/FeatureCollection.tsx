"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import type { CurrencyOption } from "@/stores/currency"
import type { Product } from "@/types/product"
import type { Collection } from "@/types/collection"
import { useMainStore } from "@/stores/mainStore"

interface FeatureCollectionProps {
  collectionId: string
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
}

export function FeatureCollection({ 
  collectionId,
  selectedCurrencyId, 
  acceptedCurrencies
}: FeatureCollectionProps) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const { shopSettings } = useMainStore()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  // Force animation after data loads
  useEffect(() => {
    if (!loading && collection && products.length > 0) {
      setTimeout(() => setShouldAnimate(true), 100)
    }
  }, [loading, collection, products])

  // Use shouldAnimate OR isInView for animations
  const animate = shouldAnimate || isInView

  // Get active currency
  const activeCurrency = selectedCurrencyId
    ? acceptedCurrencies.find((currency) => currency.id === selectedCurrencyId) || null
    : shopSettings && shopSettings.length > 0 ? shopSettings[0]?.defaultCurrency : null

  // Fetch collection data
  useEffect(() => {
    const fetchData = async () => {
      if (!shopSettings?.length) return

      try {
        setLoading(true)
        
        const { getCollectionById } = useMainStore.getState()
        const collectionData = await getCollectionById(collectionId)
        
        setCollection(collectionData)
        
        // Filter and limit products to 6 for the grid (same logic as CollectionCarousel)
        const filteredProducts = (collectionData.products ?? [])
          .filter((product) => product.status === 'ACTIVE' || product.status === 'ARCHIVED')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6)
        
        setProducts(filteredProducts)
      } catch (error) {
        setCollection(null)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionId, shopSettings])

  return (
    <section ref={ref} className="container-section bg-gray-50 w-full py-20">
      <div className="content-section">
        {loading ? (
          <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
        ) : !collection || products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No hay productos disponibles</p>
          </div>
        ) : (
          <>
            {/* Collection Title */}
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={animate ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="font-druk   text-gray-900 mb-16"
              >
                {collection.title.toUpperCase()}
              </motion.h2>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Featured Collection - Left Side (40%) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={animate ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg overflow-hidden h-[800px] lg:h-full group relative">
              {/* Collection Image */}
              {collection.imageUrl && (
                <div className="relative w-full h-full bg-gray-50 overflow-hidden">
                  <Image
                    src={collection.imageUrl}
                    alt={collection.title}
                    width={400}
                    height={0}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                  />
                  
                  {/* Overlay degradado */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Botón Explorar Colección - Desktop (hover only) */}
                  <div className="hidden lg:block absolute bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <Link 
                      href={`/productos?collections=${collectionId}`}
                      className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                    >
                      Explorar Colección
                    </Link>
                  </div>
                  
                  {/* Botón Explorar Colección - Mobile (always visible) */}
                  <div className="lg:hidden absolute bottom-12 left-1/2 transform -translate-x-1/2">
                    <Link 
                      href={`/productos?collections=${collectionId}`}
                      className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors duration-200 shadow-lg"
                    >
                      Explorar Colección
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Products Grid - Right Side (60%) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={animate ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-3"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {products.map((product, index) => {
                const productImage = product.imageUrls?.[0] || "/placeholder.png"
                const secondaryImage = product.imageUrls?.[1] || null

                return (
                  <motion.div 
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={animate ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                    className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                  >
                    <Link href={`/productos/${product.slug}`} className="flex flex-col h-full">
                      {/* Product Image */}
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        {/* Primary Image */}
                        <Image
                          src={productImage}
                          alt={product.title}
                          fill
                          className="object-contain p-1 sm:p-2"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                        />
                        
                        {/* Secondary Image (if available) */}
                        {secondaryImage && (
                          <Image
                            src={secondaryImage}
                            alt={product.title}
                            fill
                            className="object-contain p-1 sm:p-2 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 absolute top-0 left-0"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
                          />
                        )}
                        
                      </div>

                      {/* Product Info */}
                      <div className="p-2 sm:p-3 flex-shrink-0">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 mb-1 block line-clamp-1">
                          {product.title}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
          </>
        )}
      </div>
    </section>
  )
}
