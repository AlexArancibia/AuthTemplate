"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { X, ChevronDown, ChevronRight, Check } from "lucide-react"
import { useCurrencyStore } from "@/stores/currency"
import { getCategoriesTree } from "@/lib/categoryUtils"

interface ProductFilterSidebarProps {
  isMobile?: boolean
}

// Helper: Máximo por defecto según código de moneda
const getDefaultMaxPrice = (code: string): number => {
  const maxByCurrency: Record<string, number> = { USD: 500, PEN: 2000 }
  return maxByCurrency[code] ?? 1000
}

// Helper: Parsear número de URL con valor por defecto
const parsePriceFromUrl = (urlValue: string | null, defaultValue: number): number => {
  return urlValue && !isNaN(Number(urlValue)) ? Number(urlValue) : defaultValue
}

const DEFAULT_FILTER_SECTION_VISIBILITY = {
  showAroma: true,
  showCategories: true,
  showVendors: false,
  showPriceFilter: true,
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

  const currencySymbol = currencyOption?.symbol || "S/"
  const currencyCode = currencyOption?.code || "PEN"

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

  // Secciones desplegadas por defecto: Aroma + Categorías + Precio.
  const [showAroma, setShowAroma] = useState(DEFAULT_FILTER_SECTION_VISIBILITY.showAroma)
  const [showCategories, setShowCategories] = useState(DEFAULT_FILTER_SECTION_VISIBILITY.showCategories)
  const [showVendors, setShowVendors] = useState(DEFAULT_FILTER_SECTION_VISIBILITY.showVendors)
  const [showPriceFilter, setShowPriceFilter] = useState(DEFAULT_FILTER_SECTION_VISIBILITY.showPriceFilter)

  // Estados locales para los inputs de precio
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
    price: [number, number],
    search: string
  ) => {
    const params = new URLSearchParams()

    if (categories.length > 0) params.set("category", categories.join(","))
    if (vendors.length > 0) params.set("vendor", vendors.join(","))
    if (collections.length > 0) params.set("collections", collections.join(","))

    // Add price range (only if different from default range)
    if (price[0] > productPriceRange.min) params.set("minPrice", price[0].toString())
    if (price[1] < productPriceRange.max) params.set("maxPrice", price[1].toString())

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
        priceRange,
        searchTerm,
      )
    }, searchTerm ? 500 : 0) // Debounce only for search term

    return () => clearTimeout(timeoutId)
  }, [selectedCategories, selectedVendors, selectedCollections, priceRange, searchTerm, updateURL])

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedVendors([])
    setSelectedCollections([])
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

  const sanitizeNumericInput = (value: string) => value.replace(/[^0-9]/g, "")

  const handleMinPriceInputChange = useCallback((value: string) => {
    setMinPriceInput(sanitizeNumericInput(value))
  }, [])

  const handleMaxPriceInputChange = useCallback((value: string) => {
    setMaxPriceInput(sanitizeNumericInput(value))
  }, [])

  const handleMinPriceBlur = useCallback(() => {
    const numValue = Number.parseInt(minPriceInput, 10)
    const validatedValue = validateAndClampPrice(numValue, productPriceRange.min, productPriceRange.max, priceRange[1])
    const newPriceRange: [number, number] = [validatedValue, priceRange[1]]
    setPriceRange(newPriceRange)
    setMinPriceInput(validatedValue.toString())
  }, [minPriceInput, productPriceRange, priceRange, validateAndClampPrice])

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
    priceRange[0] > productPriceRange.min ||
    priceRange[1] < productPriceRange.max ||
    searchTerm !== "",
    [selectedCategories.length, selectedVendors.length, selectedCollections.length, priceRange, productPriceRange.min, productPriceRange.max, searchTerm]
  )

  const activeCount =
    selectedCategories.length +
    selectedVendors.length +
    selectedCollections.length +
    (priceRange[0] > productPriceRange.min || priceRange[1] < productPriceRange.max ? 1 : 0)

  const containerClasses = isMobile ? "space-y-8" : "space-y-8 lg:sticky lg:top-24"

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-end justify-between border-b border-foreground pb-3">
        <div>
          <p className="eyebrow text-brand">Refinar</p>
          <h2 className="mt-1 font-display text-2xl font-medium tracking-tight">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <Input
          id="search"
          type="text"
          placeholder="Buscar fragancia, marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-11 w-full rounded-none border-border bg-background text-sm focus-visible:border-foreground focus-visible:ring-0"
        />
      </div>

      {/* Comprar por aroma (colecciones = familias olfativas) — sección destacada */}
      {collections.length > 0 && (
        <FilterSection
          title="Comprar por aroma"
          eyebrow="Familia olfativa"
          isOpen={showAroma}
          onToggle={() => setShowAroma(!showAroma)}
          accent
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

      {/* Categories */}
      <FilterSection
        title="Categoría"
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
          <p className="text-sm text-muted-foreground">Cargando categorías…</p>
        )}
      </FilterSection>

      {/* Vendors (Marcas) */}
      {vendors.length > 0 && (
        <FilterSection
          title="Marca"
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

      {/* Price Range */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowPriceFilter(!showPriceFilter)}
          className="flex w-full items-center justify-between text-sm font-medium text-foreground"
        >
          <span className="font-display text-base tracking-tight">Precio</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${showPriceFilter ? "rotate-180" : ""}`}
          />
        </button>

        {showPriceFilter && (
          <div className="space-y-5 pt-1">
            <div className="px-1 py-2">
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
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-1.5 border border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">{currencySymbol}</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  aria-label="Precio mínimo"
                  value={minPriceInput}
                  onChange={(e) => handleMinPriceInputChange(e.target.value)}
                  onBlur={handleMinPriceBlur}
                  className="h-6 rounded-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              <span className="text-xs text-muted-foreground">—</span>
              <div className="flex flex-1 items-center gap-1.5 border border-border px-3 py-2">
                <span className="text-xs text-muted-foreground">{currencySymbol}</span>
                <Input
                  type="text"
                  inputMode="numeric"
                  aria-label="Precio máximo"
                  value={maxPriceInput}
                  onChange={(e) => handleMaxPriceInputChange(e.target.value)}
                  onBlur={handleMaxPriceBlur}
                  className="h-6 rounded-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
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
    <div className="space-y-1.5">
      {/* Categoría padre */}
      <div className="flex items-center justify-between gap-2">
        <CheckboxFilter
          id={`category-${category.slug}`}
          label={category.name}
          checked={selectedCategories.includes(category.slug)}
          onChange={() => onCategoryChange(category.slug)}
        />
        {category.children.length > 0 && (
          <button
            type="button"
            onClick={handleArrowClick}
            aria-label={`Mostrar subcategorías de ${category.name}`}
            className="p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ${showSubcategories ? "rotate-90" : ""}`}
            />
          </button>
        )}
      </div>

      {/* Subcategorías */}
      {category.children.length > 0 && showSubcategories && (
        <div className="ml-3 space-y-1.5 border-l border-border pl-3 duration-200 animate-in slide-in-from-top-1">
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
  eyebrow,
  isOpen,
  onToggle,
  accent = false,
  children
}: {
  title: string
  eyebrow?: string
  isOpen: boolean
  onToggle: () => void
  accent?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-2 text-left"
      >
        <span>
          {eyebrow && (
            <span className={`block text-[11px] font-medium uppercase tracking-[0.18em] ${accent ? "text-brand" : "text-muted-foreground"}`}>
              {eyebrow}
            </span>
          )}
          <span className="mt-0.5 block font-display text-base tracking-tight text-foreground">
            {title}
          </span>
        </span>
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="scrollbar-thin max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {children}
        </div>
      )}
    </div>
  )
}

// Checkbox de filtro con acento de marca al marcar
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
    <label
      htmlFor={id}
      className="group flex flex-1 cursor-pointer items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="flex h-[18px] w-[18px] items-center justify-center border border-border bg-background transition-colors peer-checked:border-brand peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 group-hover:border-foreground"
        >
          <Check
            className={`h-3 w-3 text-brand-foreground transition-opacity ${checked ? "opacity-100" : "opacity-0"}`}
            strokeWidth={3}
          />
        </span>
      </span>
      <span className={`flex-1 leading-snug ${checked ? "font-medium text-foreground" : ""}`}>
        {label}
      </span>
    </label>
  )
}
