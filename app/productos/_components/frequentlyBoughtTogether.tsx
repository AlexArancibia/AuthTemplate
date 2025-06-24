"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { FrequentlyBoughtTogether } from "@/types/fbt"
import type { Product } from "@/types/product"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { useCartStore } from "@/stores/cartStore"
import { useMainStore } from "@/stores/mainStore"

interface FrequentlyBoughtTogetherProps {
  product: Product
}

// Función para formatear moneda
const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function FrequentlyBoughtTogetherComponent({ product }: FrequentlyBoughtTogetherProps) {
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<FrequentlyBoughtTogether | null>(null)
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({})
  const [selectedVariantIds, setSelectedVariantIds] = useState<Record<string, string>>({})

  const { fetchFrequentlyBoughtTogether, frequentlyBoughtTogether, products } = useMainStore()
  const { addItem } = useCartStore()

  // Estado para almacenar los productos completos obtenidos
  const [fbtProducts, setFbtProducts] = useState<Product[]>([])

  // Buscar grupos FBT relevantes y obtener productos completos
  useEffect(() => {
    const loadFBTData = async () => {
      setLoading(true)

      try {
        // Asegurarse de que tenemos los datos de FBT
        if (frequentlyBoughtTogether.length === 0) {
          await fetchFrequentlyBoughtTogether()
        }

        // Obtener IDs de variantes del producto actual
        const productVariantIds = product.variants?.map((v) => v.id) || []

        // Buscar grupos FBT que contengan alguna variante del producto actual
        const relevantGroups = frequentlyBoughtTogether.filter((group) => {
          return group.variants?.some((variant) => productVariantIds.includes(variant.id)) || false
        })

        if (relevantGroups.length > 0) {
          const selectedFBTGroup = relevantGroups[0]
          setSelectedGroup(selectedFBTGroup)

          // Obtener IDs únicos de variantes del grupo FBT
          const variantIds = selectedFBTGroup.variants?.map((v) => v.id) || []

          // Encontrar productos que contienen estas variantes usando la variable products del store
          const relatedProducts = products.filter((prod) =>
            prod.variants?.some((variant) => variantIds.includes(variant.id)),
          )

          setFbtProducts(relatedProducts)

          // Inicializar selecciones basadas en los productos obtenidos
          const initialSelected: Record<string, boolean> = {}
          const initialVariantIds: Record<string, string> = {}

          // Para cada producto, encontrar la variante correspondiente del grupo FBT
          relatedProducts.forEach((prod) => {
            initialSelected[prod.id] = true

            // Encontrar la variante de este producto que está en el grupo FBT
            const fbtVariant = selectedFBTGroup.variants?.find((v) => prod.variants?.some((pv) => pv.id === v.id))

            if (fbtVariant) {
              initialVariantIds[prod.id] = fbtVariant.id
            } else if (prod.variants && prod.variants.length > 0) {
              // Fallback a la primera variante si no se encuentra
              initialVariantIds[prod.id] = prod.variants[0].id
            }
          })

          setSelectedProducts(initialSelected)
          setSelectedVariantIds(initialVariantIds)
        }
      } catch (error) {
        console.error("Error loading FBT data:", error)
      }

      setLoading(false)
    }

    if (product && products.length > 0) {
      loadFBTData()
    }
  }, [product, fetchFrequentlyBoughtTogether, frequentlyBoughtTogether, products])

  // Actualizar la función calculateTotalPrice para usar fbtProducts
  const calculateTotalPrice = () => {
    if (!selectedGroup || fbtProducts.length === 0) return 0

    let totalPrice = 0

    fbtProducts.forEach((prod) => {
      if (selectedProducts[prod.id]) {
        const selectedVariantId = selectedVariantIds[prod.id]
        const variant = prod.variants?.find((v) => v.id === selectedVariantId)

        if (variant && variant.prices && variant.prices.length > 0) {
          totalPrice += Number(variant.prices[0]?.price || 0)
        }
      }
    })

    return totalPrice
  }

  const totalPrice = calculateTotalPrice()
  const currency = selectedGroup?.variants?.[0]?.prices?.[0]?.currency?.code || "PEN"

  // Actualizar la función getProductInfo para usar fbtProducts
  const getProductInfo = (productId: string) => {
    const product = fbtProducts.find((p) => p.id === productId)
    if (!product) return null

    const selectedVariantId = selectedVariantIds[productId]
    const currentVariant = product.variants?.find((v) => v.id === selectedVariantId) || product.variants?.[0]

    if (!currentVariant) return null

    const price =
      currentVariant.prices && currentVariant.prices.length > 0 ? Number(currentVariant.prices[0]?.price || 0) : 0

    let variantDescription = ""
    if (currentVariant.title && currentVariant.title !== product.title) {
      variantDescription = currentVariant.title
    } else if (currentVariant.attributes && Object.keys(currentVariant.attributes).length > 0) {
      variantDescription = Object.entries(currentVariant.attributes)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ")
    }

    const imageUrl =
      (currentVariant.imageUrls && currentVariant.imageUrls.length > 0 ? currentVariant.imageUrls[0] : null) ||
      product.imageUrls?.[0] ||
      "/placeholder.svg"

    return {
      product,
      variant: currentVariant,
      price,
      variantDescription,
      imageUrl,
      hasMultipleVariants: (product.variants?.length || 0) > 1,
    }
  }

  // Actualizar handleAddAllToCart para usar fbtProducts
  const handleAddAllToCart = () => {
    if (!selectedGroup || fbtProducts.length === 0) return

    let addedCount = 0

    fbtProducts.forEach((prod) => {
      if (selectedProducts[prod.id]) {
        const selectedVariantId = selectedVariantIds[prod.id]
        const variantToAdd = prod.variants?.find((v) => v.id === selectedVariantId) || prod.variants?.[0]

        if (variantToAdd) {
          addItem(prod, variantToAdd, 1)
          addedCount++
        }
      }
    })

    toast.success("Combo añadido al carrito", {
      description: `Se agregaron ${addedCount} productos al carrito`,
    })
  }

  // Actualizar la lista de productos para usar fbtProducts
  const productList = fbtProducts.map((p) => p.id)

  const handleProductSelection = (productId: string) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariantIds((prev) => ({
      ...prev,
      [productId]: variantId,
    }))
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-pulse text-muted-foreground">Cargando productos recomendados...</div>
      </div>
    )
  }

  if (!selectedGroup) {
    return null // No hay grupos FBT para este producto
  }

  return (
    <div className="w-full py-4 md:py-8 bg-muted/30 rounded-lg px-3 md:px-6">
      {/* Título */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-base md:text-lg font-semibold text-foreground mb-1">¡Haz tu compra aún mejor!</h2>
        <p className="text-xs md:text-sm text-muted-foreground">Nuestros clientes vieron también estos productos</p>
      </div>

      {/* Layout responsivo */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 mb-4 md:mb-6">
        {/* Productos - Scroll horizontal en móvil, flex normal en desktop */}
        <div className="flex-1 min-w-0">
          <div className="overflow-x-auto pb-2 lg:overflow-x-visible lg:pb-0">
            <div className="flex items-center gap-2 md:gap-4 min-w-max lg:min-w-0 lg:justify-start">
              {productList.map((productId, index) => {
                const productInfo = getProductInfo(productId)
                if (!productInfo) return null

                return (
                  <div key={productId} className="flex items-center flex-shrink-0">
                    {index > 0 && (
                      <div className="mx-1 md:mx-2 text-muted-foreground">
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                    )}

                    <div className="flex flex-col items-center relative">
                      <div
                        className={`w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 border-2 rounded-lg p-1 md:p-2 bg-background flex items-center justify-center cursor-pointer transition-all duration-200 shadow-sm ${
                          selectedProducts[productId]
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/50 opacity-50"
                        }`}
                        onClick={() => handleProductSelection(productId)}
                      >
                        <Image
                          src={productInfo.imageUrl || "/placeholder.svg"}
                          alt={productInfo.product.title}
                          width={80}
                          height={80}
                          className="object-contain w-full h-full"
                        />

                        {/* Indicador de selección */}
                        {selectedProducts[productId] && (
                          <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-primary text-primary-foreground rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center text-xs font-bold shadow-md">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Resumen de precio */}
        <div className="flex-shrink-0 text-center lg:text-right">
          <div className="mb-3">
            <p className="text-xs md:text-sm text-muted-foreground">Total:</p>
            <p className="text-lg md:text-2xl font-bold text-primary">{formatCurrency(totalPrice, currency)}</p>
          </div>
          <Button
            onClick={handleAddAllToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 md:px-6 py-2 rounded-md font-medium shadow-md w-full lg:w-auto"
          >
            Añadir combo
          </Button>
        </div>
      </div>

      {/* Lista de productos con checkboxes */}
      <div className="space-y-2 md:space-y-3">
        {productList.map((productId) => {
          const productInfo = getProductInfo(productId)
          if (!productInfo) return null

          return (
            <div key={`list-${productId}`} className="flex items-start gap-2 md:gap-3">
              <div className="flex items-center justify-center pt-1">
                <Checkbox
                  checked={selectedProducts[productId] || false}
                  onCheckedChange={() => handleProductSelection(productId)}
                  className="w-4 h-4 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-primary/60"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs md:text-sm text-foreground">
                    <span className="font-medium">({formatCurrency(productInfo.price, currency)})</span>{" "}
                    <span className="break-words">{productInfo.product.title}</span>
                    {productInfo.variantDescription && productInfo.variantDescription !== "type: simple" && (
                      <span className="text-muted-foreground block sm:inline">
                        <span className="hidden sm:inline">, </span>
                        {productInfo.variantDescription}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {productInfo.hasMultipleVariants && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-6 md:h-7">
                            Cambiar
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3" align="end">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm text-foreground">Reemplazar variante</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {productInfo.product.variants?.map((v) => {
                                let variantDisplay = v.title || ""
                                if (!variantDisplay && v.attributes ) {
                                  variantDisplay = Object.values(v.attributes).filter(Boolean).join(", ")
                                }
                                if (!variantDisplay) {
                                  variantDisplay = `Variante ${v.id.substring(0, 4)}`
                                }

                                const isCurrentlySelected =
                                  selectedVariantIds[productId] === v.id ||
                                  (!selectedVariantIds[productId] && v.id === productInfo.variant.id)

                                return (
                                  <div
                                    key={v.id}
                                    onClick={() => handleVariantChange(productId, v.id)}
                                    className={`p-2 border rounded-lg cursor-pointer transition-all hover:bg-muted ${
                                      isCurrentlySelected ? "border-primary bg-primary/10" : "border-border"
                                    }`}
                                  >
                                    <div className="relative h-12 mb-1">
                                      <Image
                                        src={
                                          (v.imageUrls && v.imageUrls.length > 0 ? v.imageUrls[0] : null) ||
                                          productInfo.product.imageUrls?.[0] ||
                                          "/placeholder.svg"
                                        }
                                        alt={variantDisplay}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                    <p className="text-xs text-center truncate text-foreground">{variantDisplay}</p>
                                    <p className="text-xs font-medium text-center text-primary mt-0.5">
                                      {formatCurrency(Number(v.prices?.[0]?.price || 0), currency)}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                    <a target="_blank"
                      href={`/productos/${productInfo.product.slug || ""}`}
                      className="text-primary hover:text-primary/80 text-xs md:text-sm font-medium underline whitespace-nowrap"
                    >
                      Ver
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
