"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import ProductFilterSidebar from "./ProductFilterSidebar"

export default function MobileFilterButton() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="lg:hidden w-full mb-4 flex items-center justify-center gap-2 text-sm px-4 py-2.5"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden xs:inline">Filtrar productos</span>
          <span className="xs:hidden">Filtros</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-full xs:w-80 sm:w-96 p-0 bg-white"
      >
        <SheetHeader className="px-4 xs:px-6 pt-4 xs:pt-6 pb-3 xs:pb-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-base xs:text-lg">
            <Filter className="w-4 h-4 xs:w-5 xs:h-5" />
            <span className="hidden xs:inline">Filtros de productos</span>
            <span className="xs:hidden">Filtros</span>
          </SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto h-full">
          <ProductFilterSidebar isMobile />
        </div>
      </SheetContent>
    </Sheet>
  )
}

