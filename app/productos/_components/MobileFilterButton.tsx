"use client"

import { SlidersHorizontal } from "lucide-react"
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
        <button
          type="button"
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-none border border-foreground bg-background px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-foreground hover:text-background lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtrar y ordenar
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-full max-w-sm overflow-y-auto rounded-none border-border bg-background p-0"
      >
        <SheetHeader className="border-b border-border px-6 pb-4 pt-6">
          <SheetTitle className="text-left font-display text-2xl font-medium tracking-tight">
            Filtros
          </SheetTitle>
        </SheetHeader>
        <div className="px-6 py-6">
          <ProductFilterSidebar isMobile />
        </div>
      </SheetContent>
    </Sheet>
  )
}
