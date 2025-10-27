"use client"

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { Category } from "@/types/category"
import { useMainStore } from "@/stores/mainStore"
import { useRouter, usePathname } from "next/navigation"

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

// ✅ Atributos hardcodeados (constant fuera del componente para mejor rendimiento)
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

function ProductFiltersContent({ onFilterChange, initialFilters, minPrice, maxPrice }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { categories } = useMainStore()

  // Usar refs para evitar comparaciones innecesarias - con valores iniciales correctos
  const lastFiltersRef = useRef<string>("")
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [searchTerm, setSearchTerm] = useState(initialFilters.searchTerm)
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string[]>>(initialFilters.variants)
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm)

  // Sincronizar categoría seleccionada con los parámetros iniciales de URL
  useEffect(() => {
    if (initialFilters.categories.length > 0) {
      setSelectedCategory(initialFilters.categories[0])
    }
  }, [initialFilters.categories])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Crear lookup map para convertir IDs a slugs (memoizado)
  const categorySlugMap = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach(cat => map.set(cat.id, cat.slug))
    return map
  }, [categories])

  // Función separada para actualizar URL (definir antes de updateFilters)
  const updateURL = useCallback(
    (filters: Filters) => {
      const params = new URLSearchParams()

      // ✅ ACTUALIZADO: Enviar attributeFilters como JSON (formato del backend)
      if (filters.variants && Object.keys(filters.variants).length > 0) {
        // Convertir el objeto de filtros a JSON string
        const jsonString = JSON.stringify(filters.variants)
        params.set("attributeFilters", jsonString)
      }

      // Handle other filters
      if (filters.searchTerm) {
        params.set("search", filters.searchTerm)
      }

      // Convertir category ID a slug para la URL usando el mapa
      if (filters.categories.length > 0) {
        const slug = categorySlugMap.get(filters.categories[0])
        if (slug) {
          params.set("category", slug)
        }
      }

      if (filters.priceRange[0] !== minPrice || filters.priceRange[1] !== maxPrice) {
        params.set("minPrice", filters.priceRange[0].toString())
        params.set("maxPrice", filters.priceRange[1].toString())
      }

      const newUrl = `${pathname}?${params.toString()}`
      router.replace(newUrl, { scroll: false })
    },
    [pathname, router, minPrice, maxPrice, categorySlugMap],
  )

  // Función estable para actualizar filtros
  const updateFilters = useCallback(() => {
    const currentFilters = {
      searchTerm: debouncedSearchTerm,
      categories: selectedCategory ? [selectedCategory] : [],
      variants: selectedVariants,
      priceRange,
    }

    // Crear una clave única para comparar filtros
    const filtersKey = JSON.stringify({
      searchTerm: currentFilters.searchTerm,
      categories: currentFilters.categories,
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
          
          // Actualizar URL solo en desktop
          const isMobile = window.innerWidth < 1024
          if (!isMobile) {
            updateURL(currentFilters)
          }
          
          updateTimeoutRef.current = null
        }, 100)
    }
  }, [debouncedSearchTerm, selectedCategory, selectedVariants, priceRange, onFilterChange, updateURL])

  // Efecto principal para actualizar filtros
  useEffect(() => {
    updateFilters()

    // Cleanup function - limpiar timeouts pendientes
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
        updateTimeoutRef.current = null
      }
    }
  }, [updateFilters])

  // Sort categories by priority (0 = highest priority)
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER
      const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER
      return priorityA - priorityB
    })
  }, [categories])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? "" : categoryId)
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

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategory("")
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
        className="w-full text-sm mt-1"
      />

      {/* Categories */}
      <div>
        <h3 className="text-lg font-medium mb-4">Categorías</h3>
        <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
          <div className="space-y-2">
            {/* Opción para mostrar todas las categorías */}
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all-categories" />
              <label htmlFor="all-categories" className="text-sm text-gray-700 cursor-pointer font-medium">
                Todas las categorías
              </label>
            </div>
            
            {/* Separador visual */}
            <div className="border-t border-gray-200 my-2"></div>
            
            {/* Categorías individuales */}
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

      {/* DESHABILITADO: Filtro por rango de precio
          Motivo: El backend no soporta parámetros minPrice/maxPrice en SearchProductDto.
          El precio está almacenado en ProductVariant -> VariantPrice, no en Product.
          Se requiere:
          1. Agregar minPrice/maxPrice al DTO del backend
          2. Implementar lógica de filtrado por precio de variantes en el servicio
          3. Conectar el filtro del frontend con los nuevos parámetros del backend
          Fecha: Octubre 2025
          Estado: Pendiente de implementación en backend
      */}
      {/* <div>
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
      </div> */}

      {/* ✅ Presentaciones agrupadas */}
      <div>
        <h3 className="text-lg font-medium mb-4">Presentaciones</h3>
        <div className="space-y-4">
          {GROUPED_PRESENTATIONS.map((group, groupIndex) => (
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