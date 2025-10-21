"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProductCard } from "./ProductCard"
import type { Category } from "@/types/category"
import type { Product } from "@/types/product"
import type { CurrencyOption } from "@/stores/currency"

interface ProductCategoryCarouselProps {
  categories: Category[]
  productsByCategory: Record<string, Product[]>
  selectedCurrencyId: string
  acceptedCurrencies: CurrencyOption[]
  showSaleBadge?: boolean
  salePercentage?: number
  autoplayInterval?: number
  showControls?: boolean
  showIndicators?: boolean
}

export function ProductCategoryCarousel({
  categories,
  productsByCategory,
  selectedCurrencyId,
  acceptedCurrencies,
  showSaleBadge = false,
  salePercentage = 15,
  autoplayInterval = 5000,
  showControls = true,
  showIndicators = true,
}: ProductCategoryCarouselProps) {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0)
  const [currentProductIndex, setCurrentProductIndex] = useState(0)

  const selectedCategory = categories[selectedCategoryIndex]
  const products = productsByCategory[selectedCategory?.id] || []

  // Autoplay para cambiar productos
  useEffect(() => {
    if (autoplayInterval > 0 && products.length > 0) {
      const interval = setInterval(() => {
        setCurrentProductIndex((prev) => (prev + 1) % products.length)
      }, autoplayInterval)

      return () => clearInterval(interval)
    }
  }, [autoplayInterval, products.length])

  const nextCategory = () => {
    setSelectedCategoryIndex((prev) => (prev + 1) % categories.length)
    setCurrentProductIndex(0)
  }

  const prevCategory = () => {
    setSelectedCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length)
    setCurrentProductIndex(0)
  }

  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length)
  }

  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  const selectCategory = (index: number) => {
    setSelectedCategoryIndex(index)
    setCurrentProductIndex(0)
  }

  if (categories.length === 0) {
    return <div className="text-center py-8">No hay categorías disponibles</div>
  }

  return (
    <div className="space-y-8">
      {/* Navegación de categorías */}
      <div className="flex flex-wrap justify-center gap-4 md:">
        {categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => selectCategory(index)}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              selectedCategoryIndex === index
                ? "bg-pink-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Título de la categoría seleccionada */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {selectedCategory.name}
        </h2>
        <p className="text-gray-600">{selectedCategory.description}</p>
      </div>

      {/* Carrusel de productos */}
      {products.length > 0 ? (
        <div className="relative">
          {/* Controles de navegación */}
          {showControls && (
            <>
              <button
                onClick={prevProduct}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Producto anterior"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={nextProduct}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
                aria-label="Producto siguiente"
              >
                <ChevronRight className="w-6 h-6 text-gray-700" />
              </button>
            </>
          )}

          {/* Producto actual */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <ProductCard
                product={products[currentProductIndex]}
                selectedCurrencyId={selectedCurrencyId}
                acceptedCurrencies={acceptedCurrencies}
              />
            </div>
          </div>

          {/* Indicadores de productos */}
          {showIndicators && products.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentProductIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentProductIndex
                      ? "bg-pink-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Ir al producto ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No hay productos disponibles en esta categoría
        </div>
      )}

      {/* Controles de categorías */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={prevCategory}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Categoría anterior
        </button>
        <button
          onClick={nextCategory}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Siguiente categoría
        </button>
      </div>
    </div>
  )
}
