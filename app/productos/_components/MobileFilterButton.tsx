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
          className="lg:hidden w-full mb-4 flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtrar productos
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-96 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de productos
          </SheetTitle>
        </SheetHeader>
        <ProductFilterSidebar isMobile />
      </SheetContent>
    </Sheet>
  )
}

