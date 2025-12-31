"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Link from "next/link"
import Image from "next/image"

import { ProductCard } from "./ProductCard"
import type { CurrencyOption } from "@/stores/currency"
import type { Product } from "@/types/product"
import type { ProductVariant } from "@/types/productVariant"
import { useMainStore } from "@/stores/mainStore"
import { useCartStore } from "@/stores/cartStore"
import { toast } from "sonner"

interface CollectionCarouselProps {
  collectionId: string
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
  showExploreButton?: boolean
  fallbackTitle?: string
  emptyMessage?: string
}

const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID

export function CollectionCarousel({ 
  collectionId,
  selectedCurrencyId, 
  acceptedCurrencies,
  showExploreButton = false,
  fallbackTitle = "PRODUCTOS",
  emptyMessage = "No hay productos para mostrar."
}: CollectionCarouselProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [collectionTitle, setCollectionTitle] = useState<string>(fallbackTitle)
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    skipSnaps: false,
    dragFree: true,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const onSelect = () => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi])

  // Fetch de la colección con sus productos completos
  useEffect(() => {
    const fetchData = async () => {
      if (!STORE_ID) {
        console.error("No store ID provided in environment variables")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Obtener el título de la colección primero
        const { getCollectionById, fetchProducts } = useMainStore.getState()
        const collection = await getCollectionById(collectionId)
        setCollectionTitle(collection.title)
        
        // Obtener productos completos con variantes y precios usando fetchProducts
        const response = await fetchProducts({
          collectionIds: [collectionId],
          status: ['ACTIVE'],
          limit: 12,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        })
        
        setProducts(response.data)
      } catch (error) {
        console.error("Error fetching collection data:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionId])

  const handleExploreStore = () => {
    window.open("/productos", "_self")
  }

  // Función para obtener el precio formateado
  const getFormattedPrice = (product: Product) => {
    const activeCurrency = acceptedCurrencies.find((currency) => currency.id === selectedCurrencyId)
    
    if (!activeCurrency) return null

    const prices = (product.variants || [])
      .flatMap((variant) => {
        if (!variant.prices || !Array.isArray(variant.prices)) {
          return null
        }
        // Buscar precio que coincida con la moneda activa
        const matchingPrice = variant.prices.find((p) => 
          p.currency?.code === activeCurrency.code || p.currencyId === activeCurrency.id
        )
        return matchingPrice ? Number(matchingPrice.price) : null
      })
      .filter((price): price is number => price !== null && price > 0)

    if (prices.length === 0) return null

    const lowestPrice = Math.min(...prices)
    return `${activeCurrency.symbol} ${Number(lowestPrice).toFixed(2)}`
  }

  // Función para obtener el stock
  const getStockCount = (product: Product) => {
    const totalStock = (product.variants || [])
      .reduce((total, variant) => {
        return total + (variant.inventoryQuantity || 0)
      }, 0)
    
    return totalStock
  }

  // Función para formatear el título como en la imagen
  const formatTitle = (title: string) => {
    // Para "Maderas Butterfly" específicamente
    if (title.toLowerCase().includes('maderas butterfly')) {
      return 'Maderas Butterfly'
    }
    // Para otros títulos, mantener formato original
    return title
  }

  // Obtener la primera variante disponible (o la primera si no hay disponible)
  const getFirstAvailableVariant = (product: Product): ProductVariant | null => {
    if (!product.variants || product.variants.length === 0) return null
    
    // Buscar una variante con stock o que permita backorder
    const availableVariant = product.variants.find(
      (variant) => variant.inventoryQuantity > 0 || product.allowBackorder
    )
    
    // Si no hay disponible, usar la primera variante
    return availableVariant || product.variants[0]
  }

  // Manejar añadir al carrito
  const { addItem } = useCartStore()
  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    
    const variant = getFirstAvailableVariant(product)
    
    if (!variant) {
      toast.error("No hay variantes disponibles para este producto")
      return
    }

    // Verificar si la variante está disponible
    const isAvailable = variant.inventoryQuantity > 0 || product.allowBackorder
    
    if (!isAvailable) {
      toast.error("Este producto no está disponible en este momento")
      return
    }

    addItem(product, variant, 1)
    
    toast.success("Producto añadido al carrito", {
      description: `${product.title}`,
    })
  }

  return (
    <section className="container-section pb-8 md:py-8">
      <div className="content-section">
        {/* Título principal centrado */}
        <h2 className="text-3xl font-semibold text-center mb-12">
          {formatTitle(collectionTitle)}
        </h2>

        {/* Carrusel de productos */}
        <div className="relative overflow-hidden">
          {/* Botón izquierda */}
          {canScrollPrev && (
            <button
              onClick={scrollPrev}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:text-accent-foreground h-9 w-9 absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5 text-gray-800" />
            </button>
          )}

          {/* Contenido del carrusel */}
          <div className="overflow-hidden touch-pan-x" ref={emblaRef}>
            <div className="flex">
              {loading ? (
                <div className="py-10 w-full text-center">
                  <p className="text-sm text-gray-500">
                    Cargando productos...
                  </p>
                </div>
              ) : products.length > 0 ? (
                products.map((product) => {
                  const price = getFormattedPrice(product)
                  const stockCount = getStockCount(product)
                  
                  return (
                    <div
                      key={product.id}
                      className="flex-shrink-0 px-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
                    >
                      <div className="rounded-xl border bg-card text-card-foreground group relative overflow-hidden transition-all duration-300 hover:shadow-lg shadow-sm p-0">
                        <Link href={`/productos/${product.slug}`} className="block">
                          <div className="p-0">
                            {/* Imagen del producto */}
                            <div className="relative overflow-hidden w-full aspect-square p-6">
                              <Image
                                src={product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : "/placeholder.png"}
                                alt={product.title}
                                fill
                                className="object-contain p-2 shadow-md transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              
                              {/* Botón de carrito (aparece en hover) */}
                              {getFirstAvailableVariant(product) && (getFirstAvailableVariant(product)!.inventoryQuantity > 0 || product.allowBackorder) && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                                  <button 
                                    onClick={(e) => handleAddToCart(e, product)}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-secondary-foreground h-10 w-10 rounded-full bg-white shadow-md hover:bg-gray-100 opacity-0 translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:transition-all group-hover:delay-100"
                                  >
                                    <ShoppingCart className="h-4 w-4" />
                                    <span className="sr-only">Añadir al carrito</span>
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Información del producto */}
                            <div className="p-4 w-full">
                              <h5 className="text-sm truncate max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                {product.title}
                              </h5>
                              
                              {/* Precio */}
                              {price && (
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="text-lg text-pink-500">{price}</span>
                                </div>
                              )}
                              
                              {/* Stock */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                <p className="text-muted-foreground text-sm">
                                  {stockCount} en stock
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-10 w-full text-center">
                  <p className="text-sm text-gray-500">
                    {emptyMessage}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botón derecha */}
          {canScrollNext && (
            <button
              onClick={scrollNext}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input hover:text-accent-foreground h-9 w-9 absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white transition-colors shadow-md z-10"
              aria-label="Siguiente"
            >
              <ChevronRight className="h-5 w-5 text-gray-800" />
            </button>
          )}
        </div>

        {/* Botón "Explora" centrado */}
        {showExploreButton && (
          <div className="flex justify-center">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 py-2 rounded-full transition-all mt-8 md:mt-16 px-8 bg-gradient-to-tr from-white to-gray-200 shadow-md shadow-slate-100 hover:to-gray-300"
            >
              Explora
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

