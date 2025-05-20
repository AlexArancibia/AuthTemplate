"use client"

import { useState } from "react"
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
  const [open, setOpen] = useState(false)

  const handleFilterChange = (filters: Filters) => {
    onFilterChange(filters)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="lg:hidden">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[350px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-4 overflow-y-auto h-[calc(100vh-5rem)]">
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

