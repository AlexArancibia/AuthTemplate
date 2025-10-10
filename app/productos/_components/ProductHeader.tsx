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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      {/* Product count */}
      <div className="text-sm text-gray-600">
        Mostrando {startItem}-{endItem} de {totalItems} productos
      </div>
      
      {/* Sort selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 whitespace-nowrap">
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
    </div>
  )
}
