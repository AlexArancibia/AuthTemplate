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
  itemsPerPage,
}: ProductHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [sortBy, setSortBy] = useState<string>(() => searchParams.get("sort") || "createdAt")

  // Keep local select in sync if the URL changes elsewhere
  useEffect(() => {
    setSortBy(searchParams.get("sort") || "createdAt")
  }, [searchParams])

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

  const searchTerm = searchParams.get("search") || ""

  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      {/* Result count + search reflection */}
      <div className="space-y-1.5">
        {searchTerm && (
          <p className="eyebrow text-brand">
            Resultados para <span className="text-foreground">&ldquo;{searchTerm}&rdquo;</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{totalItems}</span>{" "}
          {totalItems === 1 ? "fragancia" : "fragancias"}
          {totalItems > 0 && (
            <span className="hidden sm:inline">
              {" "}
              · mostrando {startItem}–{endItem}
            </span>
          )}
        </p>
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="sortBy"
          className="eyebrow hidden whitespace-nowrap text-muted-foreground sm:inline"
        >
          Ordenar
        </label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger
            id="sortBy"
            className="h-10 w-full min-w-[200px] rounded-none border-0 border-b border-foreground bg-transparent px-0 text-sm font-medium shadow-none focus-visible:border-brand focus-visible:ring-0 sm:w-52"
          >
            <SelectValue placeholder="Seleccionar orden" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            <SelectItem value="createdAt">Más recientes</SelectItem>
            <SelectItem value="price_asc">Precio: menor a mayor</SelectItem>
            <SelectItem value="price_desc">Precio: mayor a menor</SelectItem>
            <SelectItem value="title">Nombre A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
