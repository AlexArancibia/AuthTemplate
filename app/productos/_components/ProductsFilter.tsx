"use client"

import type React from "react"
import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
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

interface GroupedPresentation {
  unit: string
  values: string[]
}

function ProductFiltersContent({ onFilterChange, initialFilters, minPrice, maxPrice }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories, products, shopSettings } = useMainStore()

  // Usar refs para evitar comparaciones innecesarias - con valores iniciales correctos
  const lastFiltersRef = useRef<string>("")
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>(initialFilters.variants)
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  const defaultCurrency = shopSettings[0]?.defaultCurrency

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Función estable para actualizar filtros
  const updateFilters = useCallback(() => {
    const currentFilters = {
      searchTerm: debouncedSearchTerm,
      categories: selectedCategories,
      variants: selectedVariants,
      priceRange,
    }

    // Crear una clave única para comparar filtros
    const filtersKey = JSON.stringify({
      searchTerm: currentFilters.searchTerm,
      categories: [...currentFilters.categories].sort(),
      variants: Object.fromEntries(
        Object.entries(currentFilters.variants).map(([key, values]) => [key, [...values].sort()]),
      ),
      priceRange: currentFilters.priceRange,
    })

    // Solo actualizar si los filtros realmente cambiaron
    if (filtersKey !== lastFiltersRef.current) {
      lastFiltersRef.current = filtersKey

      // Limpiar timeout anterior
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }

      // Debounce la actualización de filtros
      updateTimeoutRef.current = setTimeout(() => {
        onFilterChange(currentFilters)

        // Actualizar URL solo si no estamos en móvil o si el drawer está cerrado
        const isMobile = window.innerWidth < 1024
        if (!isMobile) {
          updateURL(currentFilters)
        }
        updateTimeoutRef.current = null
      }, 100)
    }
  }, [debouncedSearchTerm, selectedCategories, selectedVariants, priceRange, onFilterChange])

  // Función separada para actualizar URL
  const updateURL = useCallback(
    (filters: Filters) => {
      const params = new URLSearchParams()

      // Handle presentations with special format
      if (filters.variants.Presentaciones && filters.variants.Presentaciones.length > 0) {
        const presentationsParam = filters.variants.Presentaciones.map((value) => value.replace(/\s/g, "+")).join(",")
        params.set("variant_Presentaciones", presentationsParam)
      }

      // Handle other filters
      if (filters.searchTerm) {
        params.set("search", filters.searchTerm)
      }

      if (filters.categories.length > 0) {
        params.set("categories", filters.categories.join(","))
      }

      if (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) {
        params.set("minPrice", filters.priceRange[0].toString())
        params.set("maxPrice", filters.priceRange[1].toString())
      }

      const newUrl = `${pathname}?${params.toString()}`
      router.replace(newUrl, { scroll: false })
    },
    [pathname, router, minPrice, maxPrice],
  )

  // Efecto principal para actualizar filtros
  useEffect(() => {
    updateFilters()

    // Cleanup function
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
    }
  }, [updateFilters])

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
    }
  }, [])

  const groupedPresentations = useMemo(() => {
    const presentations = new Set<string>()

    // Recopilar todas las presentaciones
    products.forEach((product: Product) => {
      product.variants.forEach((variant) => {
        Object.entries(variant.attributes!).forEach(([key, value]) => {
          if (key === "Presentaciones" && typeof value === "string") {
            presentations.add(value)
          }
        })
      })
    })

    // Filtrar y agrupar por unidad
    const groups: Record<string, string[]> = {}
    const validPattern = /^(\d+(?:\.\d+)?)\s+(KG|L|G|ML|LB|OZ)$/i

    Array.from(presentations).forEach((presentation) => {
      const match = presentation.match(validPattern)
      if (match) {
        const [, number, unit] = match
        const normalizedUnit = unit.toUpperCase()

        if (!groups[normalizedUnit]) {
          groups[normalizedUnit] = []
        }
        groups[normalizedUnit].push(presentation)
      }
    })

    // Ordenar cada grupo numéricamente
    Object.keys(groups).forEach((unit) => {
      groups[unit].sort((a, b) => {
        const numA = Number.parseFloat(a.match(/\d+(\.\d+)?/)?.[0] || "0")
        const numB = Number.parseFloat(b.match(/\d+(\.\d+)?/)?.[0] || "0")
        return numA - numB
      })
    })

    // Convertir a array de grupos ordenados por unidad
    const sortedGroups: GroupedPresentation[] = Object.entries(groups)
      .sort(([unitA], [unitB]) => unitA.localeCompare(unitB))
      .map(([unit, values]) => ({ unit, values }))

    return sortedGroups
  }, [products])

  // Sort categories by priority (0 = highest priority)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER
      const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER
      return priorityA - priorityB
    })
  }, [categories])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }, [])

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

  const handlePriceChange = useCallback((value: number[]) => {
    setPriceRange([value[0], value[1]])
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }, [])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedVariants({})
    setPriceRange([minPrice, maxPrice])

    // Limpiar la referencia
    lastFiltersRef.current = ""

    // Actualizar URL
    router.replace(pathname, { scroll: false })
  }, [minPrice, maxPrice, pathname, router])

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
        <div className="space-y-2">
          {sortedCategories.map((category: Category) => (
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

      {/* Grouped Presentations */}
      {groupedPresentations.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Presentaciones</h3>
          <div className="space-y-4 ">
            {groupedPresentations.map((group, groupIndex) => (
              <div key={group.unit}>
                {/* Unit Label */}
                <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{group.unit}</div>

                {/* Values for this unit */}
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

                {/* Separator between groups (except for the last one) */}
                {groupIndex < groupedPresentations.length - 1 && <Separator className="my-3 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
      )}

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

          {/* Presentations Placeholder */}
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

          {/* Button Placeholder */}
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      }
    >
      <ProductFiltersContent {...props} />
    </Suspense>
  )
}
