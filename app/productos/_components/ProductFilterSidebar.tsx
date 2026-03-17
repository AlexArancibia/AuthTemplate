"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
import type { Collection } from "@/types/collection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { X, Filter, ChevronDown, ChevronUp, ChevronRight } from "lucide-react"
import { useCurrencyStore } from "@/stores/currency"
import { getCategoriesTree } from "@/lib/categoryUtils"

interface ProductFilterSidebarProps {
  isMobile?: boolean
}

const SIZE_OPTIONS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"]

// Helper: Máximo por defecto según código de moneda
const getDefaultMaxPrice = (code: string): number => {
  const maxByCurrency: Record<string, number> = { USD: 500, PEN: 2000 }
  return maxByCurrency[code] ?? 1000
}

// Helper: Parsear número de URL con valor por defecto
const parsePriceFromUrl = (urlValue: string | null, defaultValue: number): number => {
  return urlValue && !isNaN(Number(urlValue)) ? Number(urlValue) : defaultValue
}

export default function ProductFilterSidebar({ isMobile = false }: ProductFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories, collections, vendors, fetchCategories, fetchCollections, fetchVendors, shopSettings } = useMainStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const isInitialMount = useRef(true)
  const previousCurrencyId = useRef(selectedCurrencyId)
  
  // Obtener información de moneda (memoizado)
  const currencyOption = useMemo(() => {
    const defaultCurrency = shopSettings?.[0]?.defaultCurrency
    return acceptedCurrencies.find((c) => c.id === selectedCurrencyId) || defaultCurrency
  }, [selectedCurrencyId, acceptedCurrencies, shopSettings])

  const currencySymbol = currencyOption?.symbol || "$"
  const currencyCode = currencyOption?.code || "USD"

  // Rango de precios dinámico según moneda (memoizado)
  const productPriceRange = useMemo(() => ({
    min: 0,
    max: getDefaultMaxPrice(currencyCode)
  }), [currencyCode])

  // Load categories (tree, ordered by priority), collections and vendors on mount
  useEffect(() => {
    if (categories.length === 0) fetchCategories({ mode: "tree", sortBy: "priority", sortOrder: "desc", limit: 100 })
    if (collections.length === 0) fetchCollections({ limit: 100 })
    if (vendors.length === 0) fetchVendors()
  }, [categories.length, collections.length, vendors.length, fetchCategories, fetchCollections, fetchVendors])

  // State for filters - initialized directly from URL
  // Convert old category IDs to slugs if needed
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = searchParams.get("category")
    if (!categoryParam) return []
    
    const categoryValues = categoryParam.split(",")
    
    // If values look like IDs (start with "cat_"), ignore them and start fresh
    // This handles migration from old ID-based URLs to new slug-based URLs
    const hasOldIds = categoryValues.some(val => val.startsWith("cat_"))
    if (hasOldIds) {
      console.warn("⚠️ Old category IDs detected in URL. Clearing filters to use slugs.")
      return []
    }
    
    return categoryValues
  })
  // Inicializar rango de precios desde URL
  const initialPriceRange = useMemo(() => {
    const defaultMax = getDefaultMaxPrice(currencyCode)
    const min = parsePriceFromUrl(searchParams.get("minPrice"), 0)
    const max = parsePriceFromUrl(searchParams.get("maxPrice"), defaultMax)
    return [min, max] as [number, number]
  }, [searchParams, currencyCode])

  const [priceRange, setPriceRange] = useState<[number, number]>(initialPriceRange)
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get("search") || "")
  const [selectedVendors, setSelectedVendors] = useState<string[]>(() => {
    const vendorParam = searchParams.get("vendor")
    return vendorParam ? vendorParam.split(",") : []
  })
  const [selectedCollections, setSelectedCollections] = useState<string[]>(() => {
    const collectionParam = searchParams.get("collections")
    return collectionParam ? collectionParam.split(",") : []
  })
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    const sizeParam = searchParams.get("variant_Talla")
    return sizeParam ? sizeParam.split(",") : []
  })
  const [showCategories, setShowCategories] = useState(true)
  const [showVendors, setShowVendors] = useState(true)
  const [showCollections, setShowCollections] = useState(true)
  const [showPriceFilter, setShowPriceFilter] = useState(true)
  const [showSizes, setShowSizes] = useState(true)

  // Estados locales para los inputs (para permitir escritura libre sin actualizar URL)
  const [minPriceInput, setMinPriceInput] = useState<string>(initialPriceRange[0].toString())
  const [maxPriceInput, setMaxPriceInput] = useState<string>(initialPriceRange[1].toString())

  // Sincronizar los inputs cuando cambia priceRange (desde slider o URL)
  useEffect(() => {
    setMinPriceInput(priceRange[0].toString())
    setMaxPriceInput(priceRange[1].toString())
  }, [priceRange])

  // Update URL whenever filters change
  const updateURL = useCallback((
    categories: string[],
    vendors: string[],
    collections: string[],
    sizes: string[],
    price: [number, number],
    search: string
  ) => {
    const params = new URLSearchParams()

    // Add selected categories (comma-separated format)
    if (categories.length > 0) {
      params.set("category", categories.join(","))
    }

    // Add selected vendors (comma-separated format)
    if (vendors.length > 0) {
      params.set("vendor", vendors.join(","))
    }

    // Add selected collections (comma-separated format)
    if (collections.length > 0) {
      params.set("collections", collections.join(","))
    }

    // Add selected sizes as variant filter (Talla)
    if (sizes.length > 0) {
      params.set("variant_Talla", sizes.join(","))
    }

    // Add price range (only if different from default range)
    if (price[0] > productPriceRange.min) params.set("minPrice", price[0].toString())
    if (price[1] < productPriceRange.max) params.set("maxPrice", price[1].toString())

    // Add search term
    if (search) params.set("search", search)

    // Reset to page 1 when applying filters
    params.set("page", "1")

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, productPriceRange])

  // Sync price range ONLY when URL params actually change
  const urlMinPrice = searchParams.get("minPrice")
  const urlMaxPrice = searchParams.get("maxPrice")
  
  useEffect(() => {
    const newMin = parsePriceFromUrl(urlMinPrice, 0)
    const newMax = parsePriceFromUrl(urlMaxPrice, productPriceRange.max)
    
    setPriceRange(prev => {
      if (prev[0] !== newMin || prev[1] !== newMax) {
        return [newMin, newMax]
      }
      return prev
    })
  }, [urlMinPrice, urlMaxPrice, productPriceRange.max])

  // Reset price filter when currency changes
  useEffect(() => {
    if (previousCurrencyId.current !== selectedCurrencyId && previousCurrencyId.current !== undefined) {
      setPriceRange([productPriceRange.min, productPriceRange.max])
    }
    previousCurrencyId.current = selectedCurrencyId
  }, [selectedCurrencyId, productPriceRange.min, productPriceRange.max])

  // Clean URL if it has old category IDs (run only once on mount)
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam?.split(",").some(val => val.startsWith("cat_"))) {
      const params = new URLSearchParams(window.location.search)
      params.delete("category")
      router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname, { scroll: false })
    }
  }, [pathname, router, searchParams])

  // Consolidated effect to update URL when filters change (with debounce for search)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timeoutId = setTimeout(() => {
      updateURL(
        selectedCategories,
        selectedVendors,
        selectedCollections,
        selectedSizes,
        priceRange,
        searchTerm,
      )
    }, searchTerm ? 500 : 0) // Debounce only for search term

    return () => clearTimeout(timeoutId)
  }, [selectedCategories, selectedVendors, selectedCollections, selectedSizes, priceRange, searchTerm, updateURL])

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedVendors([])
    setSelectedCollections([])
    setSelectedSizes([])
    setPriceRange([productPriceRange.min, productPriceRange.max])
    setSearchTerm("")
    router.push(pathname, { scroll: false })
  }

  // Generic toggle handler for filters
  const createToggleHandler = useCallback(<T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    value: T
  ) => {
    setter(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    )
  }, [])

  const handleCategoryChange = useCallback(
    (categorySlug: string) => createToggleHandler(setSelectedCategories, categorySlug),
    [createToggleHandler]
  )

  const handleVendorChange = useCallback(
    (vendorName: string) => createToggleHandler(setSelectedVendors, vendorName),
    [createToggleHandler]
  )

  const handleCollectionChange = useCallback(
    (collectionId: string) => createToggleHandler(setSelectedCollections, collectionId),
    [createToggleHandler]
  )

  const handleSizeChange = useCallback(
    (size: string) => createToggleHandler(setSelectedSizes, size),
    [createToggleHandler]
  )

  // Helper: Validar y ajustar valor de precio
  const validateAndClampPrice = useCallback((value: number, min: number, max: number, compareValue?: number): number => {
    if (isNaN(value) || value < min) return min
    if (value > max) return max
    if (compareValue !== undefined && compareValue < value) return compareValue
    return value
  }, [])

  // Handle price change on slider release
  const handlePriceChange = useCallback((value: number[]) => {
    setPriceRange(value as [number, number])
  }, [])

  // Handle manual input change (solo números)
  const sanitizeNumericInput = (value: string) => value.replace(/[^0-9]/g, "")
  
  const handleMinPriceInputChange = useCallback((value: string) => {
    setMinPriceInput(sanitizeNumericInput(value))
  }, [])
  
  const handleMaxPriceInputChange = useCallback((value: string) => {
    setMaxPriceInput(sanitizeNumericInput(value))
  }, [])

  // Handle manual input blur (min price)
  const handleMinPriceBlur = useCallback(() => {
    const numValue = Number.parseInt(minPriceInput, 10)
    const validatedValue = validateAndClampPrice(numValue, productPriceRange.min, productPriceRange.max, priceRange[1])
    const newPriceRange: [number, number] = [validatedValue, priceRange[1]]
    setPriceRange(newPriceRange)
    setMinPriceInput(validatedValue.toString())
  }, [minPriceInput, productPriceRange, priceRange, validateAndClampPrice])

  // Handle manual input blur (max price)
  const handleMaxPriceBlur = useCallback(() => {
    const numValue = Number.parseInt(maxPriceInput, 10)
    const validatedValue = validateAndClampPrice(numValue, productPriceRange.min, productPriceRange.max)
    const finalValue = Math.max(validatedValue, priceRange[0])
    const newPriceRange: [number, number] = [priceRange[0], finalValue]
    setPriceRange(newPriceRange)
    setMaxPriceInput(finalValue.toString())
  }, [maxPriceInput, productPriceRange, priceRange, validateAndClampPrice])

  // Check if any filter is active (memoized)
  const hasActiveFilters = useMemo(() => 
    selectedCategories.length > 0 ||
    selectedVendors.length > 0 ||
    selectedCollections.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange[0] > productPriceRange.min ||
    priceRange[1] < productPriceRange.max ||
    searchTerm !== "",
    [selectedCategories.length, selectedVendors.length, selectedCollections.length, selectedSizes.length, priceRange, productPriceRange.min, productPriceRange.max, searchTerm]
  )

  const containerClasses = isMobile
    ? "bg-white p-6 space-y-6 h-full"
    : "bg-gray-50 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 p-6 space-y-6 sticky top-24"

  return (
    <div className={containerClasses}>
      {/* Header - Solo mostrar en desktop */}
      {!isMobile && (
        <div className="flex items-center justify-between pb-2.5 mb-4.5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 py-1.5">
          <Filter className="w-5 h-5" />
            Filtros
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      )}
      
      {/* Botón de limpiar para móvil - Solo mostrar si hay filtros activos */}
      {isMobile && hasActiveFilters && (
        <div className="flex justify-end pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="space-y-2">
        <Input
          id="search"
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Categories */}
      <FilterSection
        title="Categorías"
        isOpen={showCategories}
        onToggle={() => setShowCategories(!showCategories)}
      >
        {categories.length > 0 ? (
          getCategoriesTree(categories).map((category) => (
            <CategoryFilterItem 
              key={category.id} 
              category={category}
              selectedCategories={selectedCategories}
              onCategoryChange={handleCategoryChange}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">Cargando categorías...</p>
        )}
      </FilterSection>

      {/* Vendors (Marcas) */}
      {vendors.length > 0 && (
        <FilterSection
          title="Marcas"
          isOpen={showVendors}
          onToggle={() => setShowVendors(!showVendors)}
        >
          {vendors.map((vendor) => (
            <CheckboxFilter
              key={vendor}
              id={`vendor-${vendor}`}
              label={vendor}
              checked={selectedVendors.includes(vendor)}
              onChange={() => handleVendorChange(vendor)}
            />
          ))}
        </FilterSection>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <FilterSection
          title="Colecciones"
          isOpen={showCollections}
          onToggle={() => setShowCollections(!showCollections)}
        >
          {collections.map((collection) => (
            <CheckboxFilter
              key={collection.id}
              id={`collection-${collection.id}`}
              label={collection.title}
              checked={selectedCollections.includes(collection.id)}
              onChange={() => handleCollectionChange(collection.id)}
            />
          ))}
        </FilterSection>
      )}

      {/* Sizes (Tallas) */}
      <FilterSection
        title="Tallas"
        isOpen={showSizes}
        onToggle={() => setShowSizes(!showSizes)}
      >
        {SIZE_OPTIONS.map((size) => (
          <CheckboxFilter
            key={size}
            id={`size-${size}`}
            label={size}
            checked={selectedSizes.includes(size)}
            onChange={() => handleSizeChange(size)}
          />
        ))}
      </FilterSection>

      {/* Price Range */}
      <div className="space-y-3">
        <button
          onClick={() => setShowPriceFilter(!showPriceFilter)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Rango de precio</span>
          {showPriceFilter ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showPriceFilter && (
          <div className="space-y-4 pt-2">
            <div className="relative py-2">
              <Slider
                min={0}
                max={productPriceRange.max}
                step={1}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                onValueCommit={handlePriceChange}
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center gap-2">
              {/* Input para precio mínimo */}
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs text-gray-500">{currencySymbol}</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={minPriceInput}
                  onChange={(e) => handleMinPriceInputChange(e.target.value)}
                  onBlur={handleMinPriceBlur}
                  className="w-full h-8 text-sm text-center px-2"
                />
              </div>
              <span className="text-xs text-gray-500 px-1">-</span>
              {/* Input para precio máximo */}
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs text-gray-500">{currencySymbol}</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={maxPriceInput}
                  onChange={(e) => handleMaxPriceInputChange(e.target.value)}
                  onBlur={handleMaxPriceBlur}
                  className="w-full h-8 text-sm text-center px-2"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Componente para mostrar una categoría con sus subcategorías
function CategoryFilterItem({ 
  category, 
  selectedCategories,
  onCategoryChange
}: { 
  category: any & { children: any[] }
  selectedCategories: string[]
  onCategoryChange: (slug: string) => void
}) {
  const [showSubcategories, setShowSubcategories] = useState(false)

  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSubcategories(!showSubcategories)
  }

  return (
    <div className="space-y-1">
      {/* Categoría padre */}
      <div className="flex items-center space-x-2">
        <CheckboxFilter
          id={`category-${category.slug}`}
          label={category.name}
          checked={selectedCategories.includes(category.slug)}
          onChange={() => onCategoryChange(category.slug)}
        />
        {category.children.length > 0 && (
          <button
            onClick={handleArrowClick}
            className="p-1 rounded-sm hover:bg-gray-100 transition-colors"
          >
            <ChevronRight 
              className={`h-3 w-3 opacity-60 hover:opacity-100 transition-all duration-200 ${
                showSubcategories ? "rotate-90" : ""
              }`} 
            />
          </button>
        )}
      </div>

      {/* Subcategorías */}
      {category.children.length > 0 && showSubcategories && (
        <div className="ml-6 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {category.children.map((child: any) => (
            <CheckboxFilter
              key={child.id}
              id={`category-${child.slug}`}
              label={child.name}
              checked={selectedCategories.includes(child.slug)}
              onChange={() => onCategoryChange(child.slug)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Componente reutilizable para secciones de filtro colapsables
function FilterSection({ 
  title, 
  isOpen, 
  onToggle, 
  children 
}: { 
  title: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {isOpen && (
        <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
          {children}
        </div>
      )}
    </div>
  )
}

// Componente reutilizable para checkboxes de filtro
function CheckboxFilter({
  id,
  label,
  checked,
  onChange
}: {
  id: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center space-x-2 flex-1">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 cursor-pointer rounded border-gray-300 focus:ring-blue-500"
      />
      <label
        htmlFor={id}
        className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 flex-1"
      >
        {label}
      </label>
    </div>
  )
}

