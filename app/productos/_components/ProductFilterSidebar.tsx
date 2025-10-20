"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { useCurrencyStore } from "@/stores/currency"

interface ProductFilterSidebarProps {
  isMobile?: boolean
}

export default function ProductFilterSidebar({ isMobile = false }: ProductFilterSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { categories, collections, fetchCategories, fetchCollections, shopSettings } = useMainStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const isInitialMount = useRef(true)
  const previousCurrencyId = useRef(selectedCurrencyId)
  
  // Get currency symbol
  const defaultCurrency = shopSettings?.[0]?.defaultCurrency
  const currencyOption = acceptedCurrencies.find((c) => c.id === selectedCurrencyId) || defaultCurrency
  const currencySymbol = currencyOption?.symbol || "$"

  // Fixed price range (simple solution until backend provides min/max endpoint)
  const productPriceRange = { min: 0, max: 1000 }

  // Load categories and collections on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories({ limit: 100 })
    }
    if (collections.length === 0) {
      fetchCollections({ limit: 100 })
    }
  }, [categories.length, collections.length, fetchCategories, fetchCollections])

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
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const minFromUrl = searchParams.get("minPrice")
    const maxFromUrl = searchParams.get("maxPrice")
    const min = minFromUrl && !isNaN(Number(minFromUrl)) ? Number(minFromUrl) : 0
    const max = maxFromUrl && !isNaN(Number(maxFromUrl)) ? Number(maxFromUrl) : 1000
    return [min, max]
  })
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get("search") || "")
  const [selectedCollections, setSelectedCollections] = useState<string[]>(() => {
    const collectionParam = searchParams.get("collections")
    return collectionParam ? collectionParam.split(",") : []
  })
  const [showCategories, setShowCategories] = useState(true)
  const [showCollections, setShowCollections] = useState(true)
  const [showPriceFilter, setShowPriceFilter] = useState(true)

  // Update URL whenever filters change
  const updateURL = useCallback((
    categories: string[],
    collections: string[],
    price: [number, number],
    search: string
  ) => {
    const params = new URLSearchParams()

    // Add selected categories (comma-separated format)
    if (categories.length > 0) {
      params.set("category", categories.join(","))
    }

    // Add selected collections (comma-separated format)
    if (collections.length > 0) {
      params.set("collections", collections.join(","))
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
  // Not when productPriceRange or priceRange changes (that would reset while dragging)
  const urlMinPrice = searchParams.get("minPrice")
  const urlMaxPrice = searchParams.get("maxPrice")
  
  useEffect(() => {
    const newMin = urlMinPrice ? Number(urlMinPrice) : 0
    const newMax = urlMaxPrice ? Number(urlMaxPrice) : 1000
    
    // Only update if the URL values are different from current state
    if (priceRange[0] !== newMin || priceRange[1] !== newMax) {
      setPriceRange([newMin, newMax])
    }
  }, [urlMinPrice, urlMaxPrice])

  // Reset price filter when currency changes
  useEffect(() => {
    if (previousCurrencyId.current !== selectedCurrencyId && previousCurrencyId.current !== undefined) {
      setPriceRange([productPriceRange.min, productPriceRange.max])
      updateURL(selectedCategories, selectedCollections, [productPriceRange.min, productPriceRange.max], searchTerm)
    }
    previousCurrencyId.current = selectedCurrencyId
  }, [selectedCurrencyId, productPriceRange])

  // Clean URL if it has old category IDs
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      const categoryValues = categoryParam.split(",")
      const hasOldIds = categoryValues.some(val => val.startsWith("cat_"))
      
      if (hasOldIds) {
        // Remove old IDs from URL
        const params = new URLSearchParams(window.location.search)
        params.delete("category")
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.replace(newUrl, { scroll: false })
      }
    }
  }, []) // Run only once on mount

  // Debounced search
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      updateURL(selectedCategories, selectedCollections, priceRange, searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Immediate update for categories
  useEffect(() => {
    if (isInitialMount.current) {
      return
    }
    updateURL(selectedCategories, selectedCollections, priceRange, searchTerm)
  }, [selectedCategories])

  // Immediate update for collections
  useEffect(() => {
    if (isInitialMount.current) {
      return
    }
    updateURL(selectedCategories, selectedCollections, priceRange, searchTerm)
  }, [selectedCollections])

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedCollections([])
    setPriceRange([productPriceRange.min, productPriceRange.max])
    setSearchTerm("")
    router.push(pathname, { scroll: false })
  }

  // Handle category selection (toggle multiple categories by slug)
  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug) 
        ? prev.filter(slug => slug !== categorySlug)
        : [...prev, categorySlug]
    )
  }

  // Handle collection selection (toggle multiple collections by ID)
  const handleCollectionChange = (collectionId: string) => {
    setSelectedCollections(prev => 
      prev.includes(collectionId) 
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    )
  }

  // Handle price change on slider release
  const handlePriceChange = (value: number[]) => {
    const newPriceRange = value as [number, number]
    // Note: setPriceRange is already called by onValueChange, no need to call it again
    updateURL(selectedCategories, selectedCollections, newPriceRange, searchTerm)
  }

  // Check if any filter is active
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedCollections.length > 0 ||
    priceRange[0] > productPriceRange.min ||
    priceRange[1] < productPriceRange.max ||
    searchTerm !== ""

  const containerClasses = isMobile
    ? "bg-gray-50 p-6 space-y-6 h-full"
    : "bg-gray-50 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 p-6 space-y-6 sticky top-24"

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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

      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium text-gray-700">
          Buscar productos
        </Label>
        <Input
          id="search"
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white"
        />
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Categorías</span>
          {showCategories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {showCategories && (
          <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
            {categories.length > 0 ? (
              <>
                {/* Category options con checkboxes para selección múltiple - usando slugs */}
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.slug}`}
                      checked={selectedCategories.includes(category.slug)}
                      onChange={() => handleCategoryChange(category.slug)}
                      className="w-4 h-4 text-blue-600 cursor-pointer rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`category-${category.slug}`}
                      className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 flex-1"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-sm text-gray-500">Cargando categorías...</p>
            )}
          </div>
        )}
      </div>

      {/* Collections */}
      {collections.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowCollections(!showCollections)}
            className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>Colecciones</span>
            {showCollections ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          
          {showCollections && (
            <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
              {collections.length > 0 ? (
                <>
                  {/* Collection options con checkboxes para selección múltiple - usando IDs */}
                  {collections.map((collection) => (
                    <div key={collection.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`collection-${collection.id}`}
                        checked={selectedCollections.includes(collection.id)}
                        onChange={() => handleCollectionChange(collection.id)}
                        className="w-4 h-4 text-blue-600 cursor-pointer rounded border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor={`collection-${collection.id}`}
                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 flex-1"
                      >
                        {collection.title}
                      </label>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-gray-500">Cargando colecciones...</p>
              )}
            </div>
          )}
        </div>
      )}

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
                max={1000}
                step={1}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                onValueCommit={handlePriceChange}
                className="w-full"
              />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {currencySymbol}{priceRange[0]}
              </span>
              <span className="text-xs text-gray-500">-</span>
              <span className="text-gray-600">
                {currencySymbol}{priceRange[1]}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

