"use client"

import { useState, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { ProductFilters } from "./ProductsFilter"

interface FilterDrawerProps {
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

export function FilterDrawer({ onFilterChange, initialFilters, minPrice, maxPrice }: FilterDrawerProps) {
  const handleFilterChange = useCallback(
    (filters: Filters) => {
      onFilterChange(filters)
    },
    [onFilterChange],
  )

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden p-[18]">
          <Filter className="mr-2 h-4 w-4 " />
          <span className="font-normal ">Filtros</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[350px] sm:w-[400px]">
        <SheetHeader className="h-4 ">
          <SheetTitle className="text-xl">Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-4 pl-5 overflow-y-auto h-[calc(100vh-5rem)] block lg:hidden">
          <ProductFilters
            onFilterChange={handleFilterChange}
            initialFilters={initialFilters}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}