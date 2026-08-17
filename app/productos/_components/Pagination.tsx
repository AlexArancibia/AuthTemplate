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
    <nav className="flex items-center gap-1.5" aria-label="Paginación">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10 rounded-none p-0 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
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
              className="flex h-10 w-10 items-center justify-center text-sm text-muted-foreground"
            >
              ···
            </span>
          )
        }

        // Page number button
        const isActive = currentPage === page
        return (
          <Button
            key={page}
            variant="ghost"
            size="sm"
            onClick={() => onPageChange(page)}
            className={`h-10 w-10 rounded-none p-0 text-sm font-medium transition-colors ${
              isActive
                ? "bg-foreground text-background hover:bg-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            aria-label={`Página ${page}`}
            aria-current={isActive ? "page" : undefined}
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
        className="h-10 w-10 rounded-none p-0 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

