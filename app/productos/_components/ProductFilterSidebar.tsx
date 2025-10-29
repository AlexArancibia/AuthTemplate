"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useMainStore } from "@/stores/mainStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const previousCurrencyId = useRef(selectedCurrencyId)
  
  // Refs para prevenir loops entre URL y estado
  const isUpdatingFromInputRef = useRef(false)
  const isPriceInputFocusedRef = useRef(false)
  const isSliderDraggingRef = useRef(false)
  
  // Get currency symbol
  const defaultCurrency = shopSettings?.[0]?.defaultCurrency
  const currencyOption = acceptedCurrencies.find((c) => c.id === selectedCurrencyId) || defaultCurrency
  const currencySymbol = currencyOption?.symbol || "$"

  // Función optimizada para obtener valores por defecto según la moneda
  const getDefaultPriceRange = useCallback((currencyId: string) => {
    const currency = acceptedCurrencies.find(c => c.id === currencyId) || 
                   shopSettings?.[0]?.defaultCurrency
    
    switch (currency?.code) {
      case 'USD': return { min: 0, max: 500 }
      case 'PEN': return { min: 0, max: 2000 }
      default: return { min: 0, max: 1000 }
    }
  }, [shopSettings, acceptedCurrencies])

  // Helper para validar y corregir rango de precios
  const validatePriceRange = useCallback((
    tempRange: [number | null, number | null],
    defaultRange: { min: number; max: number }
  ): [number, number] => {
    let validated: [number, number] = [
      tempRange[0] === null ? defaultRange.min : tempRange[0],
      tempRange[1] === null ? defaultRange.max : tempRange[1]
    ]
    
    // Corregir si min > max
    if (validated[0] > validated[1]) {
      validated = [validated[0], validated[0]]
    }
    
    // Asegurar límites válidos
    validated[0] = Math.max(0, Math.min(validated[0], defaultRange.max))
    validated[1] = Math.max(validated[0], Math.min(validated[1], defaultRange.max))
    
    return validated
  }, [])

  // Initialize state from URL
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = searchParams.get("category")
    if (!categoryParam) return []
    
    const categoryValues = categoryParam.split(",")
    const hasOldIds = categoryValues.some(val => val.startsWith("cat_"))
    if (hasOldIds) {
      console.warn("⚠️ Old category IDs detected in URL. Clearing filters to use slugs.")
      return []
    }
    return categoryValues
  })
  
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const defaultRange = getDefaultPriceRange(selectedCurrencyId)
    return [defaultRange.min, defaultRange.max]
  })
  
  const [tempPriceRange, setTempPriceRange] = useState<[number | null, number | null] | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get("search") || "")
  const [showCategories, setShowCategories] = useState(false)
  const [showPriceFilter, setShowPriceFilter] = useState(false)

  // Update URL whenever filters change
  const updateURL = useCallback((
    categories: string[],
    price: [number, number],
    search: string
  ) => {
    const params = new URLSearchParams()
    const defaultRange = getDefaultPriceRange(selectedCurrencyId)

    if (categories.length > 0) {
      params.set("category", categories.join(","))
    }

    if (price[0] > defaultRange.min) {
      params.set("minPrice", price[0].toString())
    }
    if (price[1] < defaultRange.max) {
      params.set("maxPrice", price[1].toString())
    }
    
    if ((price[0] > defaultRange.min || price[1] < defaultRange.max) && selectedCurrencyId) {
      params.set("currencyId", selectedCurrencyId)
    }

    if (search) params.set("search", search)
    params.set("page", "1")

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [pathname, router, getDefaultPriceRange, selectedCurrencyId])

  // Sync price range from URL
  const urlMinPrice = searchParams.get("minPrice")
  const urlMaxPrice = searchParams.get("maxPrice")
  
  useEffect(() => {
    if (isUpdatingFromInputRef.current) {
      isUpdatingFromInputRef.current = false
      return
    }

    if (urlMinPrice || urlMaxPrice) {
      const defaultRange = getDefaultPriceRange(selectedCurrencyId)
      const newMin = urlMinPrice ? Number(urlMinPrice) : defaultRange.min
      const newMax = urlMaxPrice ? Number(urlMaxPrice) : defaultRange.max
      
      if (priceRange[0] !== newMin || priceRange[1] !== newMax) {
        setPriceRange([newMin, newMax])
        setTempPriceRange(null)
      }
    }
  }, [urlMinPrice, urlMaxPrice, selectedCurrencyId, getDefaultPriceRange, priceRange])

  // Reset price filter when currency changes
  useEffect(() => {
    if (previousCurrencyId.current !== selectedCurrencyId && previousCurrencyId.current !== undefined) {
      const defaultRange = getDefaultPriceRange(selectedCurrencyId)
      setPriceRange([defaultRange.min, defaultRange.max])
      setTempPriceRange(null)
      updateURL(selectedCategories, [defaultRange.min, defaultRange.max], searchTerm)
    }
    previousCurrencyId.current = selectedCurrencyId
  }, [selectedCurrencyId, getDefaultPriceRange, selectedCategories, searchTerm, updateURL])

  // Clean URL if it has old category IDs (once on mount)
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      const categoryValues = categoryParam.split(",")
      if (categoryValues.some(val => val.startsWith("cat_"))) {
        const params = new URLSearchParams(window.location.search)
        params.delete("category")
        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
        router.replace(newUrl, { scroll: false })
      }
    }
  }, [pathname, router])

  // Immediate update for categories only (faster UX)
  useEffect(() => {
    if (isInitialMount.current) return
    updateURL(selectedCategories, priceRange, searchTerm)
  }, [selectedCategories, updateURL])

  // Debounced update for search term and price range
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    // Skip if user is actively interacting with price inputs/slider
    if (isPriceInputFocusedRef.current || isSliderDraggingRef.current) {
      return
    }

    const timer = setTimeout(() => {
      const defaultRange = getDefaultPriceRange(selectedCurrencyId)
      const hasCustomPrice = priceRange[0] > defaultRange.min || priceRange[1] < defaultRange.max
      
      // Update URL if there's a custom price filter or search term
      if (hasCustomPrice || urlMinPrice || urlMaxPrice || searchTerm) {
        isUpdatingFromInputRef.current = true
        updateURL(selectedCategories, priceRange, searchTerm)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm, priceRange, selectedCategories, selectedCurrencyId, getDefaultPriceRange, urlMinPrice, urlMaxPrice, updateURL])


  // Load categories on mount
  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories({ limit: 100 })
    }
  }, [categories.length, fetchCategories])

  // Handlers
  const clearFilters = () => {
    const defaultRange = getDefaultPriceRange(selectedCurrencyId)
    setSelectedCategories([])
    setPriceRange([defaultRange.min, defaultRange.max])
    setTempPriceRange(null)
    setSearchTerm("")
    router.push(pathname, { scroll: false })
  }

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategories(prev => 
      prev.includes(categorySlug) 
        ? prev.filter(slug => slug !== categorySlug)
        : [...prev, categorySlug]
    )
  }

  const handlePriceChange = (value: number[]) => {
    const newPriceRange = value as [number, number]
    isSliderDraggingRef.current = false
    setPriceRange(newPriceRange)
    setTempPriceRange(null)
    isUpdatingFromInputRef.current = true
    updateURL(selectedCategories, newPriceRange, searchTerm)
  }

  const handleMinPriceInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const defaultRange = getDefaultPriceRange(selectedCurrencyId)
    
    if (inputValue === '') {
      setTempPriceRange([null, priceRange[1]])
      return
    }
    
    const numValue = Number(inputValue)
    setTempPriceRange([
      Math.max(0, Math.min(numValue, defaultRange.max)), 
      priceRange[1]
    ])
    setPriceRange([Math.max(0, Math.min(numValue, defaultRange.max)), priceRange[1]])
  }, [priceRange, selectedCurrencyId, getDefaultPriceRange])

  const handleMaxPriceInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const defaultRange = getDefaultPriceRange(selectedCurrencyId)
    
    if (inputValue === '') {
      setTempPriceRange([priceRange[0], null])
      return
    }
    
    const numValue = Number(inputValue)
    setTempPriceRange([
      priceRange[0], 
      Math.min(numValue, defaultRange.max)
    ])
    setPriceRange([priceRange[0], Math.min(numValue, defaultRange.max)])
  }, [priceRange, selectedCurrencyId, getDefaultPriceRange])

  const handlePriceInputFocus = useCallback(() => {
    isPriceInputFocusedRef.current = true
    setTempPriceRange([...priceRange])
  }, [priceRange])

  const handlePriceInputBlur = useCallback(() => {
    isPriceInputFocusedRef.current = false
    const defaultRange = getDefaultPriceRange(selectedCurrencyId)
    const validatedRange = tempPriceRange 
      ? validatePriceRange(tempPriceRange, defaultRange)
      : validatePriceRange([priceRange[0], priceRange[1]], defaultRange)
    
    if (validatedRange[0] !== priceRange[0] || validatedRange[1] !== priceRange[1]) {
      setPriceRange(validatedRange)
    }
    
    setTempPriceRange(null)
    isUpdatingFromInputRef.current = true
    updateURL(selectedCategories, validatedRange, searchTerm)
  }, [tempPriceRange, priceRange, selectedCategories, searchTerm, selectedCurrencyId, getDefaultPriceRange, validatePriceRange, updateURL])

  const handlePriceInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }, [])

  // Helper para obtener valor del input
  const getInputValue = (index: 0 | 1): string | number => {
    if (tempPriceRange && tempPriceRange[index] === null) return ''
    return tempPriceRange ? (tempPriceRange[index] ?? priceRange[index]) : priceRange[index]
  }

  // Helper para obtener min/max del input
  const getInputMinMax = (isMax: boolean) => {
    if (isMax) {
      return {
        min: tempPriceRange && tempPriceRange[0] !== null ? tempPriceRange[0]! : priceRange[0],
        max: getDefaultPriceRange(selectedCurrencyId).max
      }
    }
    return {
      min: 0,
      max: tempPriceRange && tempPriceRange[1] !== null ? tempPriceRange[1]! : priceRange[1]
    }
  }

  const hasActiveFilters = useMemo(() => {
    const defaultRange = getDefaultPriceRange(selectedCurrencyId)
    return selectedCategories.length > 0 ||
           priceRange[0] > defaultRange.min ||
           priceRange[1] < defaultRange.max ||
           searchTerm !== ""
  }, [selectedCategories.length, priceRange, searchTerm, selectedCurrencyId, getDefaultPriceRange])

  const defaultRange = useMemo(() => getDefaultPriceRange(selectedCurrencyId), [getDefaultPriceRange, selectedCurrencyId])
  const sliderValue = useMemo(() => 
    tempPriceRange 
      ? [tempPriceRange[0] ?? priceRange[0], tempPriceRange[1] ?? priceRange[1]]
      : priceRange
  , [tempPriceRange, priceRange])

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
          {showCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {showCategories && (
          <div className="max-h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 transition-colors">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`category-${category.slug}`}
                    checked={selectedCategories.includes(category.slug)}
                    onChange={() => handleCategoryChange(category.slug)}
                    className="w-4 h-4 text-pink-600 cursor-pointer rounded border-gray-300 focus:ring-pink-500"
                  />
                  <label
                    htmlFor={`category-${category.slug}`}
                    className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 flex-1"
                  >
                    {category.name}
                  </label>
                </div>
              ))
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
          {showPriceFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showPriceFilter && (
          <div className="space-y-4 pt-2">
            {/* Inputs */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="minPrice" className="text-xs text-gray-500 mb-1 block">
                  Precio mínimo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                    {currencySymbol}
                  </span>
                  <Input
                    id="minPrice"
                    type="number"
                    value={getInputValue(0)}
                    onChange={handleMinPriceInputChange}
                    onFocus={handlePriceInputFocus}
                    onBlur={handlePriceInputBlur}
                    onKeyDown={handlePriceInputKeyDown}
                    className="text-sm pl-8"
                    min={getInputMinMax(false).min}
                    max={getInputMinMax(false).max}
                    step="1"
                  />
                </div>
              </div>
              
              <span className="text-gray-400 mb-2 px-1">-</span>
              
              <div className="flex-1">
                <Label htmlFor="maxPrice" className="text-xs text-gray-500 mb-1 block">
                  Precio máximo
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm pointer-events-none">
                    {currencySymbol}
                  </span>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={getInputValue(1)}
                    onChange={handleMaxPriceInputChange}
                    onFocus={handlePriceInputFocus}
                    onBlur={handlePriceInputBlur}
                    onKeyDown={handlePriceInputKeyDown}
                    className="text-sm pl-8"
                    min={getInputMinMax(true).min}
                    max={getInputMinMax(true).max}
                    step="1"
                  />
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="relative py-2">
              <Slider
                min={defaultRange.min}
                max={defaultRange.max}
                step={1}
                value={sliderValue}
                onValueChange={(value) => {
                  isSliderDraggingRef.current = true
                  const newRange: [number | null, number | null] = [value[0], value[1]]
                  setTempPriceRange(newRange)
                  setPriceRange(value as [number, number])
                }}
                onValueCommit={handlePriceChange}
                className="w-full"
              />
            </div>
            
            {/* Display values */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Rango: {currencySymbol}{priceRange[0]}</span>
              <span>-</span>
              <span>{currencySymbol}{priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
