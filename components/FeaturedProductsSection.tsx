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
  specificCategoryIds,
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
          const response = await fetchCategories({ limit: maxCategories })
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

  // Filtrar categorías si se especificaron IDs
  const displayCategories = useMemo(() => {
    if (specificCategoryIds && specificCategoryIds.length > 0) {
      return categories.filter(cat => specificCategoryIds.includes(cat.id))
    }
    return categories
  }, [categories, specificCategoryIds])

  // Función para cargar productos de una categoría específica
  const loadProductsForCategory = async (categoryId: string) => {
    if (loadingProducts[categoryId]) return
    
    const category = displayCategories.find(cat => cat.id === categoryId)
    if (!category) {
      console.error(`❌ [FeaturedProductsSection] Category not found: ${categoryId}`)
      return
    }

    setLoadingProducts(prev => ({ ...prev, [categoryId]: true }))

    try {
      const response = await fetchProducts({
        categorySlugs: [category.slug],
        status: ['ACTIVE'],
        limit: productsPerCategory,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

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
    if (isAnimating) return
    
    setIsAnimating(true)
    setSelectedCategoryIndex(index)
    
    const category = displayCategories[index]
    if (category) {
      if (!productsByCategory[category.id] || productsByCategory[category.id].length === 0) {
        loadProductsForCategory(category.id)
      }
    }
    
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

  // Loading state
  if (loadingCategories || displayCategories.length === 0) {
    return (
      <section className={`py-8 sm:py-10 md:py-12 lg:py-14 bg-white ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded mt-8"></div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
      <section className={`py-8 sm:py-10 md:py-12 lg:py-14 bg-gradient-to-b from-white to-gray-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section - Centered */}
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              {title.split(' ')[0]}{' '}
              <span className="text-pink-600">{title.split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              {description}
            </p>
            <a 
              href="/catalogo" 
              className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:text-pink-700 transition-colors group"
            >
              Ver todo el catálogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Category Navigation - Centered */}
          <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="relative max-w-7xl mx-auto">
              {/* Desktop Navigation Arrows */}
              {displayCategories.length > 1 && (
                <>
                  <button
                    onClick={prevCategory}
                    className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 z-10 items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-200 transition-all"
                    aria-label="Categoría anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextCategory}
                    className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 z-10 items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-200 transition-all"
                    aria-label="Siguiente categoría"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Category Tabs Container */}
              <div className="w-full flex justify-center">
                <div className="relative w-full max-w-6xl">
                  {/* Scrollable Container */}
                  <div className="overflow-x-auto scrollbar-hide py-3 scroll-smooth px-4 lg:px-12">
                    <div className="inline-flex items-center justify-center gap-2 lg:gap-3">
                      {displayCategories.map((category, index) => (
                        <button
                          key={category.id}
                          onClick={() => selectCategory(index)}
                          className={`
                            flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm sm:text-base
                            transition-all duration-200 whitespace-nowrap
                            ${index === selectedCategoryIndex
                              ? 'bg-pink-600 text-white shadow-lg scale-105'
                              : 'bg-white text-gray-700 border border-gray-200 hover:border-pink-200 hover:text-pink-600 hover:bg-pink-50'
                            }
                          `}
                          aria-selected={index === selectedCategoryIndex}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pagination Dots - Centered */}
                  <div className="flex justify-center items-center gap-1.5 mt-3">
                  {displayCategories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => selectCategory(index)}
                      className={`
                        h-1.5 rounded-full transition-all duration-200
                        ${index === selectedCategoryIndex
                          ? 'bg-pink-600 w-8'
                          : 'bg-gray-300 w-1.5 hover:bg-gray-400'
                        }
                      `}
                      aria-label={`Ir a categoría ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid - Centered */}
        <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
          {isCurrentCategoryLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: productsPerCategory }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-6 bg-gray-200 rounded w-1/2" />
                      <div className="h-9 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {currentProducts.map((product, index) => {
                  const formattedPrice = getFormattedPrice(product)
                  const stockCount = getStockCount(product)
                  
                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
                    >
                      {/* Product Image */}
                      <a href={`/productos/${product.slug}`} className="relative aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                        {product.imageUrls && product.imageUrls[0] ? (
                          <img
                            alt={product.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            src={product.imageUrls[0]}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <div className="w-16 h-16 bg-gray-200 rounded-full mb-2" />
                            <p className="text-sm">Sin imagen</p>
                          </div>
                        )}
                      </a>

                      {/* Product Info */}
                      <div className="flex flex-col flex-1 p-4 space-y-3">
                        <div className="flex-1 space-y-2">
                          <a href={`/productos/${product.slug}`}>
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-pink-600 transition-colors">
                              {product.title}
                            </h3>
                          </a>
                          <div className="flex items-baseline">
                            <span className="text-lg font-bold text-pink-600">
                              {formattedPrice || 'Consultar precio'}
                            </span>
                          </div>
                          {stockCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 w-fit">
                              {stockCount} en stock
                            </span>
                          )}
                        </div>

                        {/* Add to Cart Button */}
                        <button 
                          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium text-sm hover:border-pink-600 hover:bg-pink-50 hover:text-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={stockCount === 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {stockCount > 0 ? 'Agregar' : 'Sin stock'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* View Category Button - Centered */}
              <div className="flex justify-center mt-8 sm:mt-10">
                <a href={`/catalogo?category=${selectedCategory?.slug}`}>
                  <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-200 bg-white text-gray-700 font-medium hover:border-pink-600 hover:bg-pink-600 hover:text-white transition-all duration-200 shadow-sm hover:shadow-md group">
                    Ver {selectedCategory?.name}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </a>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">No hay productos disponibles</p>
                <p className="text-sm text-gray-600">Esta categoría no tiene productos en este momento.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
