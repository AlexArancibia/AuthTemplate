"use client"

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import type { Category } from "@/types/category"
import { useMainStore } from "@/stores/mainStore"

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

const GROUPED_PRESENTATIONS: Array<{ unit: string; values: string[] }> = [
  {
    unit: "ML/LT",
    values: ["100 ml", "250 ml", "500 ml", "1 Lt"]
  },
  {
    unit: "KG",
    values: ["1 KG", "4 KG", "10 KG", "20 KG", "30 KG", "200 KG"]
  }
]

// Helper para formatear precios
const formatPrice = (price: number): string => 
  `S/. ${price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

function ProductFiltersContent({ onFilterChange, initialFilters, minPrice, maxPrice }: ProductFiltersProps) {
  const { categories } = useMainStore()

  const lastFiltersRef = useRef<string>("")
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastInitialCategoriesRef = useRef<string[]>(initialFilters.categories)
  const lastInitialVariantsRef = useRef<Record<string, string[]>>(initialFilters.variants)
  const lastSyncedCategoryRef = useRef<string>(initialFilters.categories.length > 0 ? initialFilters.categories[0] : "")

  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.categories.length > 0 ? initialFilters.categories[0] : "")
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>(initialFilters.variants)
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  useEffect(() => {
    const variantsString = JSON.stringify(initialFilters.variants)
    const lastString = JSON.stringify(lastInitialVariantsRef.current)
    
    if (variantsString !== lastString) {
      lastInitialVariantsRef.current = initialFilters.variants
      setSelectedVariants(initialFilters.variants)
    }
  }, [initialFilters.variants])

  useEffect(() => {
    const categoriesString = JSON.stringify(initialFilters.categories)
    const lastString = JSON.stringify(lastInitialCategoriesRef.current)
    
    if (categoriesString !== lastString) {
      const newCategoryId = initialFilters.categories.length > 0 ? initialFilters.categories[0] : ""
      
      if (newCategoryId !== lastSyncedCategoryRef.current) {
        lastSyncedCategoryRef.current = newCategoryId
        lastInitialCategoriesRef.current = initialFilters.categories
        setSelectedCategory(newCategoryId)
      } else {
        lastInitialCategoriesRef.current = initialFilters.categories
      }
    }
  }, [initialFilters.categories])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Sincronizar priceRange cuando cambian las props iniciales
  useEffect(() => {
    setPriceRange(initialFilters.priceRange)
  }, [initialFilters.priceRange])



  const updateFilters = useCallback(() => {
    const currentFilters = {
      searchTerm: debouncedSearchTerm,
      categories: selectedCategory ? [selectedCategory] : [],
      variants: selectedVariants,
      priceRange,
    }

    const filtersKey = JSON.stringify({
      searchTerm: currentFilters.searchTerm,
      categories: currentFilters.categories,
      variants: Object.fromEntries(
        Object.entries(currentFilters.variants).map(([key, values]) => [key, [...values].sort()]),
      ),
      priceRange: currentFilters.priceRange,
    })

    if (filtersKey !== lastFiltersRef.current) {
      lastFiltersRef.current = filtersKey

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }

      updateTimeoutRef.current = setTimeout(() => {
        onFilterChange(currentFilters)
        
        // La actualización de URL se maneja en ProductList.tsx
        
        updateTimeoutRef.current = null
      }, 100)
    }
  }, [debouncedSearchTerm, selectedCategory, selectedVariants, priceRange, onFilterChange])

  useEffect(() => {
    updateFilters()

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
    }
  }, [updateFilters])

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER
      const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER
      return priorityA - priorityB
    })
  }, [categories])

  const handleCategoryChange = useCallback((categoryId: string) => {
    const newCategory = categoryId === selectedCategory ? "" : categoryId
    lastSyncedCategoryRef.current = newCategory
    setSelectedCategory(newCategory)
  }, [selectedCategory])

  const handleVariantChange = useCallback((attribute: string, value: string) => {
    setSelectedVariants((prev) => {
      const currentValues = prev[attribute] || []
      return {
        ...prev,
        [attribute]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const handlePriceRangeChange = useCallback((newRange: number[]) => {
    setPriceRange([newRange[0], newRange[1]])
  }, [])

  const handleMinPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(minPrice, Math.min(maxPrice, Number(e.target.value)))
    setPriceRange([value, priceRange[1]])
  }, [minPrice, maxPrice, priceRange[1]])

  const handleMaxPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(minPrice, Math.min(maxPrice, Number(e.target.value)))
    setPriceRange([priceRange[0], value])
  }, [minPrice, maxPrice, priceRange[0]])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategory("")
    setSelectedVariants({})
    setPriceRange([minPrice, maxPrice])

    // Limpiar la referencia
    lastFiltersRef.current = ""

    // La actualización de URL se maneja en ProductList.tsx
  }, [minPrice, maxPrice])

  return (
    <div className="w-72 bg-white space-y-6">
      <Input
        type="text"
        placeholder="Buscar productos"
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full text-sm mt-1"
      />

      <div>
        <h3 className="text-lg font-medium mb-4">Categorías</h3>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all-categories" />
              <label htmlFor="all-categories" className="text-sm text-gray-700 cursor-pointer font-medium">
                Todas las categorías
              </label>
            </div>
            
            <div className="border-t border-gray-200 my-2"></div>
            
            {sortedCategories.map((category: Category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={category.id} />
                <label htmlFor={category.id} className="text-sm text-gray-700 cursor-pointer">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Rango de Precios</h3>
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              min={minPrice}
              max={maxPrice}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Mín"
              value={priceRange[0]}
              onChange={handleMinPriceChange}
              className="w-20 h-8 text-sm"
              min={minPrice}
              max={maxPrice}
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Máx"
              value={priceRange[1]}
              onChange={handleMaxPriceChange}
              className="w-20 h-8 text-sm"
              min={minPrice}
              max={maxPrice}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Presentaciones</h3>
        <div className="space-y-4">
          {GROUPED_PRESENTATIONS.map((group, groupIndex) => (
            <div key={group.unit}>
              <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{group.unit}</div>

              <div className="space-y-2 mb-3">
                {group.values.map((value) => (
                  <div key={`Presentaciones-${value}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`Presentaciones-${value}`}
                      checked={(selectedVariants["Presentaciones"] || []).includes(value)}
                      onCheckedChange={() => handleVariantChange("Presentaciones", value)}
                    />
                    <label htmlFor={`Presentaciones-${value}`} className="text-sm text-gray-700 cursor-pointer">
                      {value}
                    </label>
                  </div>
                ))}
              </div>

              {groupIndex < GROUPED_PRESENTATIONS.length - 1 && <Separator className="my-3 bg-gray-200" />}
            </div>
          ))}
        </div>
      </div>

      <Button onClick={resetFilters} className="w-full bg-secondary text-white hover:bg-blue-700 transition">
        Resetear Filtros
      </Button>
    </div>
  )
}

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <Suspense
      fallback={
        <div className="w-72 bg-white space-y-6 animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
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
          <div>
            <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      }
    >
      <ProductFiltersContent {...props} />
    </Suspense>
  )
}