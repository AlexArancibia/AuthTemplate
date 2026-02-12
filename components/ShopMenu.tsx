"use client"

import React, { useState } from "react"
import Link from "next/link"
import { ChevronRight, Package, Grid3X3, Star, Zap } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { getCategoriesTree } from "@/lib/categoryUtils"
import type { Category } from "@/types/category"
import type { Collection } from "@/types/collection"

interface ShopMenuProps {
  categories: Category[]
  collections: Collection[]
  isActive: boolean
}

export default function ShopMenu({ categories, collections, isActive }: ShopMenuProps) {
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'category' | 'collection'
    item: Category | Collection
  } | null>(null)
  
  const [lastSelectedItem, setLastSelectedItem] = useState<{
    type: 'category' | 'collection'
    item: Category | Collection
  } | null>(null)

  const organizedCategories = getCategoriesTree(categories)
  
  // Dividir categorías en columnas si son muchas
  const categoriesPerColumn = Math.ceil(organizedCategories.length / 2)
  const leftColumnCategories = organizedCategories.slice(0, categoriesPerColumn)
  const rightColumnCategories = organizedCategories.slice(categoriesPerColumn)

  // Filtrar colecciones destacadas
  const featuredCollections = collections.filter(collection => collection.isFeatured)
  
  // Dividir colecciones destacadas en columnas si son muchas
  const featuredPerColumn = Math.ceil(featuredCollections.length / 2)
  const leftColumnFeatured = featuredCollections.slice(0, featuredPerColumn)
  const rightColumnFeatured = featuredCollections.slice(featuredPerColumn)

  // Obtener imagen para mostrar
  const getDisplayImage = () => {
    const currentItem = hoveredItem || lastSelectedItem
    if (currentItem) {
      return currentItem.item.imageUrl || "/fallback.png"
    }
    return "/fallback.png"
  }

  // Obtener título y descripción para mostrar
  const getDisplayContent = () => {
    const currentItem = hoveredItem || lastSelectedItem
    if (currentItem) {
      const title = 'name' in currentItem.item ? currentItem.item.name : currentItem.item.title
      return {
        title: title,
        description: currentItem.item.description || "Explora nuestra selección"
      }
    }
    return {
      title: "Descubre Nuestros Productos",
      description: "Encuentra lo que buscas en nuestra amplia selección"
    }
  }

  return (
    <HoverCard openDelay={100} closeDelay={300}>
      <HoverCardTrigger asChild>
        <Link
          href="/productos"
          className={cn(
            "flex items-center gap-1 transition-all duration-200 hover:text-primary group relative",
            isActive ? "text-primary" : "text-secondary"
          )}
        >
          Tienda
          <ChevronRight className="h-4 w-4 transition-all duration-200 group-hover:rotate-90 group-hover:translate-x-0.5" />
        </Link>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-[900px] p-0 bg-background/98 backdrop-blur-xl border shadow-2xl rounded-lg overflow-hidden"
        side="bottom"
        align="center"
        sideOffset={8}
      >
        <div className="flex min-h-[400px]">
          {/* Sección izquierda - Categorías y Colecciones */}
          <div className="flex-1 p-6">
            {/* Colecciones destacadas */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">DESTACADOS</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {/* Columna izquierda */}
                <div className="space-y-1">
                  {leftColumnFeatured.map((collection) => (
                    <CollectionItem 
                      key={collection.id} 
                      collection={collection}
                      onHover={() => {
                        setHoveredItem({ type: 'collection', item: collection })
                        setLastSelectedItem({ type: 'collection', item: collection })
                      }}
                      onLeave={() => setHoveredItem(null)}
                    />
                  ))}
                </div>
                {/* Columna derecha */}
                <div className="space-y-1">
                  {rightColumnFeatured.map((collection) => (
                    <CollectionItem 
                      key={collection.id} 
                      collection={collection}
                      onHover={() => {
                        setHoveredItem({ type: 'collection', item: collection })
                        setLastSelectedItem({ type: 'collection', item: collection })
                      }}
                      onLeave={() => setHoveredItem(null)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Grid3X3 className="h-4 w-4 text-primary" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">CATEGORÍAS</h3>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {/* Columna izquierda */}
                <div className="space-y-1">
                  {leftColumnCategories.map((category) => (
                    <CategoryItem 
                      key={category.id} 
                      category={category}
                      onHover={() => {
                        setHoveredItem({ type: 'category', item: category })
                        setLastSelectedItem({ type: 'category', item: category })
                      }}
                      onLeave={() => setHoveredItem(null)}
                    />
                  ))}
                </div>
                {/* Columna derecha */}
                <div className="space-y-1">
                  {rightColumnCategories.map((category) => (
                    <CategoryItem 
                      key={category.id} 
                      category={category}
                      onHover={() => {
                        setHoveredItem({ type: 'category', item: category })
                        setLastSelectedItem({ type: 'category', item: category })
                      }}
                      onLeave={() => setHoveredItem(null)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sección derecha - Imagen dinámica */}
          <div className="w-80 bg-background border-l border-border/50">
            <div className="h-full flex flex-col">
              <div className="flex-1 relative overflow-hidden">
                <div className="aspect-square w-full">
                  <img
                    src={getDisplayImage()}
                    alt={getDisplayContent().title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>
              </div>
              <div className="p-6 bg-background/95 backdrop-blur-sm">
                <h4 className="font-bold text-lg mb-2 text-foreground">
                  {getDisplayContent().title}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {getDisplayContent().description}
                </p>
                <Link
                  href={(hoveredItem || lastSelectedItem)?.type === 'category' 
                    ? `/productos?category=${((hoveredItem || lastSelectedItem)!.item as Category).slug}`
                    : (hoveredItem || lastSelectedItem)?.type === 'collection'
                    ? `/productos?collections=${((hoveredItem || lastSelectedItem)!.item as Collection).id}`
                    : "/productos"
                  }
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Explorar
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

// Componente para mostrar una categoría
function CategoryItem({ 
  category, 
  onHover, 
  onLeave 
}: { 
  category: Category & { children: Category[] }
  onHover: () => void
  onLeave: () => void
}) {
  const [showSubcategories, setShowSubcategories] = React.useState(false)

  const handleArrowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowSubcategories(!showSubcategories)
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group">
        <Link
          href={`/productos?category=${category.slug}`}
          className="flex-1 truncate font-medium text-foreground group-hover:text-primary transition-colors"
          onMouseEnter={onHover}
          onMouseLeave={onLeave}
        >
          {category.name}
        </Link>
        {category.children.length > 0 && (
          <button
            onClick={handleArrowClick}
            className="ml-2 p-1 rounded-sm hover:bg-accent/50 transition-colors"
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
          >
            <ChevronRight 
              className={cn(
                "h-3 w-3 opacity-60 group-hover:opacity-100 transition-all duration-200",
                showSubcategories && "rotate-90"
              )} 
            />
          </button>
        )}
      </div>

      {/* Subcategorías */}
      {category.children.length > 0 && showSubcategories && (
        <div className="ml-4 mt-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={`/productos?category=${child.slug}`}
              className="block px-2 py-1 text-sm rounded-md hover:bg-accent transition-all duration-200 font-medium text-muted-foreground hover:text-foreground"
              onMouseEnter={() => onHover()}
              onMouseLeave={() => onLeave()}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente para mostrar una colección
function CollectionItem({ 
  collection, 
  onHover, 
  onLeave 
}: { 
  collection: Collection
  onHover: () => void
  onLeave: () => void
}) {
  return (
    <Link
      href={`/productos?collections=${collection.id}`}
      className="flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <div className="w-6 h-6 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-border/30 group-hover:ring-primary/50 transition-all duration-200">
        {collection.imageUrl ? (
          <img
            src={collection.imageUrl}
            alt={collection.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
            <Package className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-foreground group-hover:text-primary transition-colors duration-200">
          {collection.title}
        </div>
      </div>
    </Link>
  )
}
