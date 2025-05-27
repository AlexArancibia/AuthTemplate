"use client"

import type React from "react"
import { useState, useMemo, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import type { Category } from "@/types/category"
import type { Product } from "@/types/product"
import { useMainStore } from "@/stores/mainStore"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface ProductFiltersProps {
  onFilterChange: (filters: Filters) => void
  initialFilters: Filters
  minPrice: number
  maxPrice: number
}

interface Filters {
  searchTerm: string
  categories: string[]
  variants: Record<string, string[]>
  priceRange: [number, number]
}

function ProductFiltersContent({ onFilterChange, initialFilters, minPrice, maxPrice }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories, products, shopSettings } = useMainStore()

  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>(initialFilters.variants)
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  const defaultCurrency = shopSettings[0]?.defaultCurrency

  // Debounce search term to avoid too many updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Apply filters when they change
  useEffect(() => {
    const currentFilters = {
      searchTerm: debouncedSearchTerm,
      categories: selectedCategories,
      variants: selectedVariants,
      priceRange,
    }

    const hasChanged =
      initialFilters.searchTerm !== currentFilters.searchTerm ||
      JSON.stringify(initialFilters.categories) !== JSON.stringify(currentFilters.categories) ||
      JSON.stringify(initialFilters.variants) !== JSON.stringify(currentFilters.variants) ||
      initialFilters.priceRange[0] !== currentFilters.priceRange[0] ||
      initialFilters.priceRange[1] !== currentFilters.priceRange[1]

    if (hasChanged) {
      onFilterChange(currentFilters)
    }
  }, [debouncedSearchTerm, selectedCategories, selectedVariants, priceRange, onFilterChange, initialFilters])

  const variantAttributes = useMemo(() => {
    const attributes: Record<string, Set<string>> = {}
    products.forEach((product: Product) => {
      product.variants.forEach((variant) => {
        Object.entries(variant.attributes!).forEach(([key, value]) => {
          if (key !== "type" && typeof value === "string") {
            if (!attributes[key]) {
              attributes[key] = new Set()
            }
            attributes[key].add(value)
          }
        })
      })
    })
    return Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, Array.from(value)]))
  }, [products])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleVariantChange = (attribute: string, value: string) => {
    setSelectedVariants((prev) => {
      const currentValues = prev[attribute] || []
      return {
        ...prev,
        [attribute]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]])
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedVariants({})
    setPriceRange([minPrice, maxPrice])
    router.replace(pathname)
  }

  return (
    <div className="w-72 bg-white space-y-6">
      {/* Search */}
      <Input
        type="text"
        placeholder="Buscar productos"
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full"
      />

      {/* Categories */}
      <div>
        <h3 className="text-lg font-medium mb-4">Categorías</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          {categories.map((category: Category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => handleCategoryChange(category.id)}
              />
              <label htmlFor={category.id} className="text-sm text-gray-700 cursor-pointer">
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-medium mb-4">Precio</h3>
        <div className="space-y-4">
          <Slider
            min={isFinite(minPrice) ? minPrice : 0}
            max={isFinite(maxPrice) ? maxPrice : 1000}
            step={1}
            value={[
              isFinite(priceRange[0]) ? priceRange[0] : isFinite(minPrice) ? minPrice : 0,
              isFinite(priceRange[1]) ? priceRange[1] : isFinite(maxPrice) ? maxPrice : 1000,
            ]}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>
              {defaultCurrency?.symbol}
              {isFinite(priceRange[0]) ? priceRange[0] : 0}
            </span>
            <span>
              {defaultCurrency?.symbol}
              {isFinite(priceRange[1]) ? priceRange[1] : 1000}
            </span>
          </div>
        </div>
      </div>

      {/* Variant Attributes */}
      {Object.entries(variantAttributes).map(([attribute, values]) => (
        <div key={attribute}>
          <h3 className="text-lg font-medium mb-4">{attribute}</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {values.map((value) => (
              <div key={`${attribute}-${value}`} className="flex items-center space-x-2">
                <Checkbox
                  id={`${attribute}-${value}`}
                  checked={(selectedVariants[attribute] || []).includes(value)}
                  onCheckedChange={() => handleVariantChange(attribute, value)}
                />
                <label htmlFor={`${attribute}-${value}`} className="text-sm text-gray-700 cursor-pointer">
                  {value}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={resetFilters} className="w-full bg-secondary text-white hover:bg-blue-700 transition">
        Resetear Filtros
      </Button>
    </div>
  )
}

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <Suspense fallback={
      <div className="w-72 bg-white space-y-6 animate-pulse">
        {/* Search Placeholder */}
        <div className="h-10 bg-gray-200 rounded"></div>
        
        {/* Categories Placeholder */}
        <div>
          <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Price Range Placeholder */}
        <div>
          <div className="h-6 w-16 bg-gray-200 rounded mb-4"></div>
          <div className="h-2 bg-gray-200 rounded-full"></div>
          <div className="flex justify-between mt-2">
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Variant Attributes Placeholder */}
        <div>
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Button Placeholder */}
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    }>
      <ProductFiltersContent {...props} />
    </Suspense>
  )
}