"use client"

import { ProductCategoryCarousel } from "@/components/ProductCategoryCarousel"
import { useCurrencyStore, CurrencyOption } from "@/stores/currency"
import type { Category } from "@/types/category"
import type { Product } from "@/types/product"

// Datos de ejemplo para las categorías
const exampleCategories: Category[] = [
  {
    id: "1",
    storeId: "store1",
    name: "JEKYLL & HYDE",
    slug: "jekyll-hyde",
    description: "Productos de la línea Jekyll & Hyde",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    storeId: "store1",
    name: "OMEGA 7",
    slug: "omega-7",
    description: "Productos de la línea Omega 7",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    storeId: "store1",
    name: "VEGA",
    slug: "vega",
    description: "Productos de la línea Vega",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    storeId: "store1",
    name: "FT IGRE",
    slug: "ft-igre",
    description: "Productos de la línea FT Igre",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// Datos de ejemplo para los productos
const createExampleProduct = (
  id: string,
  title: string,
  categoryId: string,
  price: number,
  imageUrl: string,
  hasSale: boolean = false
): Product => ({
  id,
  storeId: "store1",
  title,
  description: `Descripción del producto ${title}`,
  slug: `product-${id}`,
  vendor: "XIOM BEYOND",
  allowBackorder: false,
  status: "ACTIVE",
  imageUrls: [imageUrl],
  variants: [
    {
      id: `variant-${id}`,
      productId: id,
      sku: `SKU-${id}`,
      title: "Default",
      attributes: null,
      isActive: true,
      imageUrls: [],
      prices: [
        {
          id: `price-${id}`,
          variantId: `variant-${id}`,
          currencyId: "USD",
          price: price,
        },
      ],
      inventoryQuantity: 10,
      weightValue: 0.5,
      position: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  categories: [exampleCategories.find(c => c.id === categoryId)!],
  createdAt: new Date(),
  updatedAt: new Date(),
})

// Productos de ejemplo por categoría
const exampleProductsByCategory: Record<string, Product[]> = {
  "1": [
    createExampleProduct("1", "JEKYLL AND HYDE X50.0", "1", 57.90, "/placeholder.svg"),
    createExampleProduct("2", "JEKYLL AND HYDE X50.0", "1", 57.90, "/placeholder.svg", true),
    createExampleProduct("3", "JEKYLL AND HYDE Z52.5", "1", 69.90, "/placeholder.svg", true),
    createExampleProduct("4", "JEKYLL AND HYDE X47.5", "1", 57.90, "/placeholder.svg", true),
  ],
  "2": [
    createExampleProduct("5", "OMEGA 7 PRO", "2", 89.90, "/placeholder.svg"),
    createExampleProduct("6", "OMEGA 7 LITE", "2", 69.90, "/placeholder.svg", true),
    createExampleProduct("7", "OMEGA 7 MAX", "2", 129.90, "/placeholder.svg"),
  ],
  "3": [
    createExampleProduct("8", "VEGA ELITE", "3", 99.90, "/placeholder.svg"),
    createExampleProduct("9", "VEGA PRO", "3", 79.90, "/placeholder.svg", true),
    createExampleProduct("10", "VEGA LITE", "3", 59.90, "/placeholder.svg"),
  ],
  "4": [
    createExampleProduct("11", "FT IGRE PREMIUM", "4", 149.90, "/placeholder.svg"),
    createExampleProduct("12", "FT IGRE STANDARD", "4", 119.90, "/placeholder.svg", true),
    createExampleProduct("13", "FT IGRE BASIC", "4", 89.90, "/placeholder.svg"),
  ],
}

export default function ProductosPopularesPage() {
  const selectedCurrencyId = useCurrencyStore((state) => state.selectedCurrencyId)
  const acceptedCurrencies = useCurrencyStore((state) => state.acceptedCurrencies)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <ProductCategoryCarousel
          categories={exampleCategories}
          productsByCategory={exampleProductsByCategory}
          selectedCurrencyId={selectedCurrencyId}
          acceptedCurrencies={acceptedCurrencies}
          showSaleBadge={true}
          salePercentage={15}
          autoplayInterval={5000}
          showControls={true}
          showIndicators={true}
        />
      </div>
    </div>
  )
} 