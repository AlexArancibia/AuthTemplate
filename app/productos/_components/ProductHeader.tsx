"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Grid, List, ChevronLeft, ChevronRight, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductHeaderProps {
  currentItems: number
  totalItems: number
  currentPage: number
  itemsPerPage: number
}

export default function ProductHeader({ 
  currentItems, 
  totalItems, 
  currentPage, 
  itemsPerPage 
}: ProductHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort") || "createdAt")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  // Update URL when sort changes
  const handleSortChange = (value: string) => {
    setSortBy(value)
    const params = new URLSearchParams(searchParams)
    
    if (value !== "createdAt") {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }
    
    // Reset to page 1 when sorting changes
    params.set("page", "1")
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  // Calculate display range
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="hidden md:flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Sort selector */}
      <div className="flex items-center space-x-2 w-full md:w-auto">
        <label htmlFor="sortBy" className="text-sm text-muted-foreground whitespace-nowrap">
          Ordenar por:
        </label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger id="sortBy" className="w-48 bg-white border-gray-300">
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Más recientes</SelectItem>
            <SelectItem value="updatedAt">Actualizados recientemente</SelectItem>
            <SelectItem value="title">Nombre (A-Z)</SelectItem>
            <SelectItem value="viewCount">Más vistos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product count */}
      <div className="flex items-center justify-between w-full md:w-auto space-x-4">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Mostrando {startItem}-{endItem} de {totalItems} productos
        </span>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "text-pink-500" : ""}
          >
            <Grid className="h-4 w-4" />
          </Button>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "text-pink-500" : ""}
          >
            <List className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
    </div>
  )
}
