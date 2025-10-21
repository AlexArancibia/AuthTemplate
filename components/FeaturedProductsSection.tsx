"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingCart } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"
import type { Category } from "@/types/category"
import type { Product } from "@/types/product"
import type { CurrencyOption } from "@/stores/currency"

interface FeaturedProductsSectionProps {
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
  title?: string
  description?: string
  productsPerCategory?: number
  maxCategories?: number
  // Nueva prop: IDs específicos de categorías (opcional)
  specificCategoryIds?: string[]
  className?: string
}


export function FeaturedProductsSection({
  selectedCurrencyId,
  acceptedCurrencies,
  title = "Productos Destacados",
  description = "Descubre nuestra selección de productos de tenis de mesa, cuidadosamente elegidos para satisfacer tus necesidades.",
  productsPerCategory = 6,
  maxCategories = 10,
  specificCategoryIds, // Nueva prop
  className = ""
}: FeaturedProductsSectionProps) {
  const { categories, fetchCategories, fetchProducts, shopSettings } = useMainStore()
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0)
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({})
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({})
  const [isAnimating, setIsAnimating] = useState(false)

  // Obtener la moneda activa
  const activeCurrency = useMemo(() => {
    if (selectedCurrencyId) {
      return acceptedCurrencies.find((currency) => currency.id === selectedCurrencyId) || null
    }
    return shopSettings && shopSettings.length > 0 ? shopSettings[0]?.defaultCurrency : null
  }, [selectedCurrencyId, acceptedCurrencies, shopSettings])


  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        if (specificCategoryIds && specificCategoryIds.length > 0) {
          // Si se especifican IDs, cargar solo esas categorías
          // Por ahora, cargamos todas y filtramos
          const response = await fetchCategories({ limit: maxCategories })
          // El filtrado se hace en displayCategories
        } else {
          await fetchCategories({ 
            limit: maxCategories, 
            sortBy: 'priority', 
            sortOrder: 'desc' 
          })
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [fetchCategories, maxCategories, specificCategoryIds])

  // Función para cargar productos de una categoría específica
  const loadProductsForCategory = async (categoryId: string) => {
    // Verificar si ya está cargando
    if (loadingProducts[categoryId]) return
    
    // Encontrar la categoría correcta por su ID
    const category = displayCategories.find(cat => cat.id === categoryId)
    if (!category) {
      console.error(`❌ [FeaturedProductsSection] Category not found: ${categoryId}`)
      return
    }

    // Marcar como cargando
    setLoadingProducts(prev => ({ ...prev, [categoryId]: true }))

    try {
      console.log(`🔍 [FeaturedProductsSection] Fetching products for category: ${category.name} (${category.slug})`)
      console.log(`🔍 [FeaturedProductsSection] Params:`, {
        categorySlugs: [category.slug],
        status: ['ACTIVE'],
        limit: productsPerCategory,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      const response = await fetchProducts({
        categorySlugs: [category.slug],
        status: ['ACTIVE'],
        limit: productsPerCategory,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      console.log(`✅ [FeaturedProductsSection] Successfully fetched ${response.data.length} products for category ${category.name}`)
      console.log(`✅ [FeaturedProductsSection] Response:`, response)

      // Guardar en estado local (el mainStore ya maneja su propio cache)
      setProductsByCategory(prev => ({
        ...prev,
        [categoryId]: response.data
      }))
      
    } catch (error) {
      console.error(`❌ [FeaturedProductsSection] Error loading products for category ${categoryId}:`, error)
      setProductsByCategory(prev => ({
        ...prev,
        [categoryId]: []
      }))
    } finally {
      setLoadingProducts(prev => ({ ...prev, [categoryId]: false }))
    }
  }

  // Filtrar categorías si se especificaron IDs
  const displayCategories = useMemo(() => {
    if (specificCategoryIds && specificCategoryIds.length > 0) {
      return categories.filter(cat => specificCategoryIds.includes(cat.id))
    }
    return categories
  }, [categories, specificCategoryIds])

  const selectedCategory = displayCategories[selectedCategoryIndex]
  const currentProducts = selectedCategory ? productsByCategory[selectedCategory.id] || [] : []
  const isCurrentCategoryLoading = selectedCategory ? loadingProducts[selectedCategory.id] : false

  // Cargar productos de la primera categoría automáticamente
  useEffect(() => {
    if (displayCategories.length > 0 && selectedCategoryIndex === 0) {
      const firstCategory = displayCategories[0]
      loadProductsForCategory(firstCategory.id)
    }
  }, [displayCategories, selectedCategoryIndex])

  // Función para cambiar categoría
  const selectCategory = (index: number) => {
    if (isAnimating) return // Prevenir clicks durante animación
    
    setIsAnimating(true)
    setSelectedCategoryIndex(index)
    
    const category = displayCategories[index]
    if (category) {
      // Verificar si ya tenemos los productos cargados para esta categoría
      if (!productsByCategory[category.id] || productsByCategory[category.id].length === 0) {
        console.log(`🔄 [FeaturedProductsSection] Loading products for category: ${category.name} (not cached)`)
        loadProductsForCategory(category.id)
      } else {
        console.log(`✅ [FeaturedProductsSection] Using cached products for category: ${category.name}`)
      }
    }
    
    // Resetear animación después de un breve delay
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  // Función para obtener el precio formateado
  const getFormattedPrice = (product: Product): string | null => {
    if (!activeCurrency) return null

    const prices = (product.variants || [])
      .flatMap((variant) => {
        if (!variant.prices || !Array.isArray(variant.prices)) {
          return null
        }
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

  // Función para obtener el stock total
  const getStockCount = (product: Product): number => {
    const totalStock = (product.variants || [])
      .reduce((total, variant) => {
        return total + (variant.inventoryQuantity || 0)
      }, 0)
    
    return totalStock
  }

  const nextCategory = () => {
    const nextIndex = (selectedCategoryIndex + 1) % displayCategories.length
    selectCategory(nextIndex)
  }

  const prevCategory = () => {
    const prevIndex = (selectedCategoryIndex - 1 + displayCategories.length) % displayCategories.length
    selectCategory(prevIndex)
  }

  if (loadingCategories || displayCategories.length === 0) {
    return (
      <div className={`container-section py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`container-section ${className}`} style={{ opacity: 1, transform: 'none' }}>
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50 animate-in fade-in duration-700">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[50%] bg-gradient-to-br from-pink-50 to-gray-100 rounded-full blur-xl"></div>
          <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[40%] bg-gradient-to-tr from-pink-50 to-gray-100 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-14 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100" style={{ opacity: 1, transform: 'none' }}>
            <div className="mb-6 md:mb-0 max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                {title.split(' ')[0]} <span className="text-pink-600">{title.split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-gray-600">{description}</p>
            </div>
            <a className="group inline-flex items-center text-pink-600 font-medium hover:text-pink-700 transition-colors" href="/catalogo">
              Ver todo el catálogo
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Category Navigation */}
          <div dir="ltr" data-orientation="horizontal" className="w-full">
            <div className="mb-8 md:mb-10 relative animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200" style={{ opacity: 1, transform: 'none' }}>
              {/* Navigation arrows */}
              <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 z-20">
                <button 
                  onClick={prevCategory}
                  className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm text-gray-600 hover:text-pink-600 hover:bg-white transition-all"
                  tabIndex={0}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-20">
                <button 
                  onClick={nextCategory}
                  className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-sm text-gray-600 hover:text-pink-600 hover:bg-white transition-all"
                  tabIndex={0}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Gradient overlays */}
              <div className="hidden md:block absolute left-8 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              <div className="hidden md:block absolute right-8 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

              <div className="md:mx-10 relative">
                <div className="overflow-x-auto scrollbar-elegant max-w-full mx-auto py-2">
                  <div role="tablist" aria-orientation="horizontal" className="h-9 items-center p-1 text-muted-foreground inline-flex w-full justify-start md:justify-center whitespace-nowrap px-2 py-1 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-full shadow-sm" tabIndex={0} data-orientation="horizontal" style={{ outline: 'none' }}>
                    {displayCategories.map((category, index) => (
                      <button
                        key={category.id}
                        type="button"
                        role="tab"
                        aria-selected={index === selectedCategoryIndex}
                        onClick={() => selectCategory(index)}
                        className={`inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-[120px] px-4 py-2 mx-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          index === selectedCategoryIndex
                            ? 'bg-pink-600 text-white shadow-sm scale-105'
                            : 'bg-transparent text-gray-700 hover:bg-gray-50'
                        }`}
                        tabIndex={index === selectedCategoryIndex ? 0 : -1}
                        data-orientation="horizontal"
                        data-radix-collection-item=""
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pagination dots */}
                <div className="flex justify-center mt-3 gap-1">
                  {displayCategories.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 rounded-full ${
                        index === selectedCategoryIndex
                          ? 'bg-pink-600 w-4'
                          : 'bg-gray-200 w-1'
                      }`}
                      style={{
                        width: index === selectedCategoryIndex ? '16px' : '4px',
                        backgroundColor: index === selectedCategoryIndex ? 'rgb(219, 39, 119)' : 'rgb(229, 231, 235)'
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full transition-all duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
              {isCurrentCategoryLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.from({ length: productsPerCategory }).map((_, index) => (
                    <div key={index} className="h-full">
                      <div className="rounded-xl bg-card text-card-foreground group overflow-hidden border border-gray-100 bg-gradient-to-b from-white to-gray-50 shadow-sm transition-all hover:shadow-md h-full flex flex-col animate-pulse">
                        <div className="relative w-full aspect-square bg-gray-200"></div>
                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div className="p-0 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="flex items-center p-0 pt-4">
                            <div className="h-8 bg-gray-200 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {currentProducts.map((product, index) => {
                    const formattedPrice = getFormattedPrice(product)
                    const stockCount = getStockCount(product)
                    
                    return (
                      <div 
                        key={product.id} 
                        className="h-full animate-in slide-in-from-bottom-4 fade-in duration-500" 
                        style={{ 
                          opacity: 1, 
                          transform: 'none',
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <div className="rounded-xl bg-card text-card-foreground group overflow-hidden border border-gray-100 bg-gradient-to-b from-white to-gray-50 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                          <a className="relative w-full aspect-square bg-white" href={`/productos/${product.slug}`}>
                            {product.imageUrls && product.imageUrls[0] ? (
                              <img
                                alt={product.title}
                                loading="lazy"
                                decoding="async"
                                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                                src={product.imageUrls[0]}
                                style={{ position: 'absolute', height: '100%', width: '100%', inset: '0px', color: 'transparent' }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                                  <p className="text-sm">Sin imagen</p>
                                </div>
                              </div>
                            )}
                          </a>
                          <div className="flex flex-1 flex-col justify-between p-4">
                            <div className="p-0 space-y-2">
                              <a className="no-underline" href={`/productos/${product.slug}`}>
                                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 transition-colors hover:text-pink-600">
                                  {product.title}
                                </h3>
                              </a>
                              <div className="flex items-baseline">
                                <span className="text-lg font-bold text-pink-600">
                                  {formattedPrice || 'Consultar precio'}
                                </span>
                              </div>
                              {stockCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                  {stockCount} en stock
                                </span>
                              )}
                            </div>
                            <div className="flex items-center p-0 pt-4">
                              <button 
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background shadow-sm h-8 rounded-md px-3 text-xs w-full border-gray-200 text-gray-700 hover:border-pink-600 hover:bg-pink-50 hover:text-pink-600 transition-all duration-200"
                                disabled={stockCount === 0}
                              >
                                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                                {stockCount > 0 ? 'Agregar' : 'Sin stock'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">No hay productos disponibles</p>
                    <p className="text-sm">Esta categoría no tiene productos en este momento.</p>
                  </div>
                </div>
              )}

              {/* View Category Button */}
              {currentProducts.length > 0 && (
                <div className="flex justify-center mt-10 animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300" style={{ opacity: 1, transform: 'none' }}>
                  <a href={`/catalogo?category=${selectedCategory?.slug}`}>
                    <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border bg-background h-9 rounded-full px-6 py-2 border-gray-200 text-gray-700 hover:border-pink-600 hover:bg-pink-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-lg group">
                      Ver {selectedCategory?.name}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
