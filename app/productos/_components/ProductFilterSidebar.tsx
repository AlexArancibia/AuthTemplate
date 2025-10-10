"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
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
  const { categories, fetchCategories, shopSettings } = useMainStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const isInitialMount = useRef(true)
  
  // Get currency symbol
  const defaultCurrency = shopSettings?.[0]?.defaultCurrency
  const currencyOption = acceptedCurrencies.find((c) => c.id === selectedCurrencyId) || defaultCurrency
  const currencySymbol = currencyOption?.symbol || "$"

  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories({ limit: 100 })
    }
  }, [categories.length, fetchCategories])

  // State for filters - initialized directly from URL
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => searchParams.getAll("category"))
  const [priceRange, setPriceRange] = useState<[number, number]>(() => [
    searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0,
    searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 1000
  ])
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort") || "createdAt")
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get("search") || "")
  const [showCategories, setShowCategories] = useState(true)
  const [showPriceFilter, setShowPriceFilter] = useState(true)

  // Update URL whenever filters change
  const updateURL = useCallback((
    categories: string[],
    price: [number, number],
    sort: string,
    search: string
  ) => {
    const params = new URLSearchParams()

    // Add selected categories
    categories.forEach(categoryId => params.append("category", categoryId))

    // Add price range
    if (price[0] > 0) params.set("minPrice", price[0].toString())
    if (price[1] < 1000) params.set("maxPrice", price[1].toString())

    // Add sort
    if (sort !== "createdAt") params.set("sort", sort)

    // Add search term
    if (search) params.set("search", search)

    // Reset to page 1 when applying filters
    params.set("page", "1")

    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router])

  // Debounced search
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    const timer = setTimeout(() => {
      updateURL(selectedCategories, priceRange, sortBy, searchTerm)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Immediate update for categories and sort
  useEffect(() => {
    if (isInitialMount.current) {
      return
    }
    updateURL(selectedCategories, priceRange, sortBy, searchTerm)
  }, [selectedCategories, sortBy])

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 1000])
    setSortBy("createdAt")
    setSearchTerm("")
    router.push(pathname, { scroll: false })
  }

  // Handle category selection (toggle multiple categories)
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Handle price change on slider release
  const handlePriceChange = (value: number[]) => {
    const newPriceRange = value as [number, number]
    setPriceRange(newPriceRange)
    updateURL(selectedCategories, newPriceRange, sortBy, searchTerm)
  }

  // Check if any filter is active
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000 ||
    sortBy !== "createdAt" ||
    searchTerm !== ""

  const containerClasses = isMobile
    ? "bg-gray-50 p-6 space-y-6 h-full overflow-y-auto"
    : "bg-gray-50 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-200 p-6 space-y-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto"

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
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {categories.length > 0 ? (
              <>
                {/* Category options con checkboxes para selección múltiple */}
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="w-4 h-4 text-blue-600 cursor-pointer rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`category-${category.id}`}
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
            <Slider
              min={0}
              max={1000}
              step={10}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              onValueCommit={handlePriceChange}
              className="w-full"
            />
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

      {/* Sort By */}
      <div className="space-y-2">
        <Label htmlFor="sortBy" className="text-sm font-medium text-gray-700">
          Ordenar por
        </Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger id="sortBy" className="w-full bg-white">
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Más recientes</SelectItem>
            <SelectItem value="updatedAt">Actualizados recientemente</SelectItem>
            <SelectItem value="title">Nombre (A-Z)</SelectItem>
            <SelectItem value="price">Precio (Menor a Mayor)</SelectItem>
            <SelectItem value="viewCount">Más vistos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {/* Mostrar todas las categorías seleccionadas */}
            {selectedCategories.map(categoryId => {
              const category = categories.find((c) => c.id === categoryId)
              return category ? (
                <span
                  key={categoryId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {category.name}
                  <button
                    onClick={() => handleCategoryChange(categoryId)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ) : null
            })}
            {(priceRange[0] > 0 || priceRange[1] < 1000) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Precio: {currencySymbol}{priceRange[0]} - {currencySymbol}{priceRange[1]}
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                &quot;{searchTerm}&quot;
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

