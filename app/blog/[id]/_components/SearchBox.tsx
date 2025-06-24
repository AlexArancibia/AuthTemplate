"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchBox() {
  return (
    <div className="relative">
      <Input type="search" placeholder="Buscar artículos..." className="pl-10" />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    </div>
  )
}

