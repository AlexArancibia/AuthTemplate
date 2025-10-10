import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display with ellipsis logic
  const getPageNumbers = () => {
    const delta = 1 // Number of pages to show on each side of current page
    const range: (number | string)[] = []
    
    // Always show first page
    range.push(1)
    
    // Calculate start and end of middle range
    const startPage = Math.max(2, currentPage - delta)
    const endPage = Math.min(totalPages - 1, currentPage + delta)
    
    // Add left ellipsis if needed
    if (startPage > 2) {
      range.push('ellipsis-left')
    }
    
    // Add middle range
    for (let i = startPage; i <= endPage; i++) {
      if (i !== 1 && i !== totalPages) {
        range.push(i)
      }
    }
    
    // Add right ellipsis if needed
    if (endPage < totalPages - 1) {
      range.push('ellipsis-right')
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      range.push(totalPages)
    }
    
    return range
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className="flex items-center gap-1" aria-label="Paginación">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-40"
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (typeof page === 'string') {
          // Ellipsis
          return (
            <span
              key={`${page}-${index}`}
              className="h-8 w-8 flex items-center justify-center text-gray-400 text-sm"
            >
              •••
            </span>
          )
        }

        // Page number button
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 p-0 text-sm font-medium transition-all ${
              currentPage === page
                ? "bg-black text-white hover:bg-gray-800 shadow-sm"
                : "hover:bg-gray-100 text-gray-700"
            }`}
            aria-label={`Página ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      })}

      {/* Next Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0 hover:bg-gray-100 disabled:opacity-40"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

