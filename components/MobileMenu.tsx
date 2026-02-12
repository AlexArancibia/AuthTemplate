"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Grid3X3,
  Menu
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCategoriesTree } from "@/lib/categoryUtils"
import type { Category } from "@/types/category"
import type { Collection } from "@/types/collection"

interface MobileMenuProps {
  categories: Category[]
  collections: Collection[]
  currentUser: any
  pathname: string
  onSignOut: () => void
  shopLogo?: string | null
  shopName?: string
}

export default function MobileMenu({ 
  categories, 
  collections, 
  currentUser, 
  pathname, 
  onSignOut,
  shopLogo,
  shopName = "Tienda"
}: MobileMenuProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['categories']))

  const organizedCategories = getCategoriesTree(categories)

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 lg:hidden text-secondary hover:text-primary hover:bg-secondary/10"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] bg-gray-50 text-gray-900 p-0 flex flex-col">
        <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-start justify-start">
            {shopLogo ? (
              <img 
                src={shopLogo} 
                alt={shopName} 
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Grid3X3 className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="h-3 w-3 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">CATEGORÍAS</h2>
            </div>
            
            <div className="space-y-1">
              {organizedCategories.map((category) => (
                <CategoryMobileItem 
                  key={category.id} 
                  category={category} 
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Main Navigation */}
          <div className="space-y-1">
            <SheetClose asChild>
              <Link
                href="/productos"
                className={cn(
                  "block px-2 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors",
                  pathname.startsWith("/productos") && "bg-primary/10 text-primary"
                )}
              >
                Todos los Productos
              </Link>
            </SheetClose>
            <SheetClose asChild>
              <Link
                href="/contactenos"
                className={cn(
                  "block px-2 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors",
                  pathname === "/contactenos" && "bg-primary/10 text-primary"
                )}
              >
                Contacto
              </Link>
            </SheetClose>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-200 pt-3">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-medium">{currentUser.name}</p>
                    <p className="text-gray-500 text-xs">{currentUser.email}</p>
                  </div>
                </div>
                <SheetClose asChild>
                  <Link
                    href="/dashboard"
                    className="block px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Mi Cuenta
                  </Link>
                </SheetClose>
                <button
                  onClick={onSignOut}
                  className="block w-full text-left px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  Iniciar Sesión
                </Link>
              </SheetClose>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Componente para categorías con subcategorías
function CategoryMobileItem({ 
  category, 
  expandedSections, 
  toggleSection 
}: { 
  category: Category & { children: Category[] }
  expandedSections: Set<string>
  toggleSection: (id: string) => void
}) {
  const hasChildren = category.children.length > 0
  const isExpanded = expandedSections.has(category.id)

  return (
    <div>
      <div className="flex items-center justify-between">
        <SheetClose asChild>
          <Link
            href={`/productos?category=${category.slug}`}
            className="flex-1 px-2 py-1.5 text-gray-900 hover:bg-gray-100 rounded-md transition-colors text-sm"
          >
            {category.name}
          </Link>
        </SheetClose>
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSection(category.id)}
            className="text-gray-500 hover:text-gray-700 p-1 h-6 w-6"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      
      {hasChildren && isExpanded && (
        <div className="ml-3 mt-1 space-y-1">
          {category.children.map((child) => (
            <SheetClose asChild key={child.id}>
              <Link
                href={`/productos?category=${child.slug}`}
                className="block px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                {child.name}
              </Link>
            </SheetClose>
          ))}
        </div>
      )}
    </div>
  )
}
