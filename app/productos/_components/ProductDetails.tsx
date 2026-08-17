"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ChevronRight as ChevronRightIcon,
  ShieldCheck,
  Truck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMainStore } from "@/stores/mainStore"
import { useCartStore } from "@/stores/cartStore"
import type { Product } from "@/types/product"
import type { ProductVariant } from "@/types/productVariant"
import { motion, useReducedMotion } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import { useCurrencyStore, CurrencyOption } from "@/stores/currency"
import { ProductCard } from "@/components/ProductCard"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import type { SearchProductParams } from "@/types/pagination"
import ProductGallery from "./ProductGallery"
import OlfactoryPyramid from "@/components/OlfactoryPyramid"
import { parseOlfactoryNotes } from "@/lib/olfactory"

const EASE = [0.22, 1, 0.36, 1] as const
const FREE_SHIPPING_THRESHOLD = 199

interface ProductDetailsProps {
  slug?: string
  id?: string
}

/* ----------------------------- helpers ----------------------------- */

const filterAndSortVariants = (variants?: ProductVariant[]) => {
  if (!variants) return []
  return variants
    .filter((v) => v.isActive)
    .sort((a, b) => {
      const pa = typeof a.position === "number" ? a.position : Number.MAX_SAFE_INTEGER
      const pb = typeof b.position === "number" ? b.position : Number.MAX_SAFE_INTEGER
      return pa - pb
    })
}

const findDefaultVariant = (variants: ProductVariant[], allowBackorder?: boolean) =>
  variants.find((v) => v.inventoryQuantity > 0 || Boolean(allowBackorder)) ?? variants[0] ?? null

const sizeLabel = (variant: ProductVariant) =>
  (variant.attributes?.Size as string | undefined)?.trim() || variant.title || "Único"

const getPrice = (
  variant: ProductVariant,
  currencyId: string,
  accepted: CurrencyOption[],
): { price: number; originalPrice: number | null; symbol: string } => {
  if (!variant.prices || variant.prices.length === 0)
    return { price: 0, originalPrice: null, symbol: "S/" }
  const obj = variant.prices.find((p) => p.currencyId === currencyId) ?? variant.prices[0]
  const price = obj?.price != null ? Number(obj.price) : 0
  const originalPrice = obj?.originalPrice != null ? Number(obj.originalPrice) : null
  const currency =
    accepted.find((c) => c.id === obj?.currencyId) ||
    accepted.find((c) => c.id === currencyId) ||
    accepted[0]
  return { price, originalPrice, symbol: currency?.symbol || "S/" }
}

const formatMoney = (value: number, symbol: string) =>
  `${symbol} ${Number(value).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

/** Infer fragrance concentration from title/variant text. */
const inferConcentration = (product: Product): string | null => {
  const hay = `${product.title} ${product.variants?.map((v) => v.title).join(" ") ?? ""}`.toLowerCase()
  if (/extrait\s+de\s+parfum|extrait/.test(hay)) return "Extrait de Parfum"
  if (/eau\s+de\s+parfum|\bedp\b/.test(hay)) return "Eau de Parfum"
  if (/eau\s+de\s+toilette|\bedt\b/.test(hay)) return "Eau de Toilette"
  if (/eau\s+de\s+cologne|cologne\s+forte|\bcologne\b/.test(hay)) return "Eau de Cologne"
  if (/\bparfum\b/.test(hay)) return "Parfum"
  return null
}

/* --------------------------- component ----------------------------- */

export default function ProductDetails({ slug, id }: ProductDetailsProps) {
  const { shopSettings, getProductBySlug, getProductById, fetchProducts } = useMainStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const { addItem } = useCartStore()
  const reduce = useReducedMotion()

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  const activeVariants = useMemo(() => filterAndSortVariants(product?.variants), [product?.variants])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
    slidesToScroll: 1,
  })

  /* --- fetch product --- */
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        let fetched: Product
        if (id) fetched = await getProductById(id)
        else if (slug) fetched = await getProductBySlug(slug)
        else throw new Error("Either slug or id must be provided")
        if (cancelled) return
        setProduct(fetched)
        const available = filterAndSortVariants(fetched.variants)
        setSelectedVariant(findDefaultVariant(available, fetched.allowBackorder))
        setQuantity(1)
      } catch (e) {
        if (cancelled) return
        console.error("[ProductDetails] Error fetching product:", e)
        setError("No se pudo cargar el producto. Por favor, intenta nuevamente.")
        setProduct(null)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, id, getProductBySlug, getProductById])

  /* --- keep selected variant valid --- */
  useEffect(() => {
    if (activeVariants.length === 0) {
      setSelectedVariant(null)
      return
    }
    if (!selectedVariant || !activeVariants.some((v) => v.id === selectedVariant.id)) {
      setSelectedVariant(findDefaultVariant(activeVariants, product?.allowBackorder))
    }
  }, [activeVariants, selectedVariant, product?.allowBackorder])

  /* --- related products --- */
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      if (!product) {
        setRelatedProducts([])
        return
      }
      try {
        const base: SearchProductParams = {
          status: ["ACTIVE"],
          limit: 12,
          sortBy: "viewCount",
          sortOrder: "desc",
        }
        const criteria: SearchProductParams[] = []
        if (product.collections?.length)
          criteria.push({ ...base, collectionIds: product.collections.map((c) => c.id) })
        if (product.categories?.length)
          criteria.push({ ...base, categorySlugs: product.categories.map((c) => c.slug) })
        if (criteria.length === 0) {
          if (!cancelled) setRelatedProducts([])
          return
        }
        let final: Product[] = []
        for (const params of criteria) {
          const res = await fetchProducts(params)
          const filtered = (res.data || []).filter((p) => p.id !== product.id).slice(0, 8)
          if (filtered.length > 0) {
            final = filtered
            break
          }
        }
        if (!cancelled) setRelatedProducts(final)
      } catch (e) {
        console.error("Error loading related products:", e)
        if (!cancelled) setRelatedProducts([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [product, fetchProducts])

  const olfactory = useMemo(
    () => parseOlfactoryNotes(product?.description),
    [product?.description],
  )

  const concentration = useMemo(
    () => (product ? inferConcentration(product) : null),
    [product],
  )

  const phoneNumber = useMemo(
    () => shopSettings?.[0]?.phone?.replace(/[^0-9]/g, ""),
    [shopSettings],
  )

  const isVariantAvailable = useCallback(
    (variant: ProductVariant) => variant.inventoryQuantity > 0 || Boolean(product?.allowBackorder),
    [product?.allowBackorder],
  )

  const handleSelectVariant = useCallback(
    (variant: ProductVariant) => {
      setSelectedVariant(variant)
      setQuantity(1)
    },
    [],
  )

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant) return
    addItem(product, selectedVariant, quantity)
    toast.success("Agregado al carrito", {
      description: `${quantity} × ${product.title} · ${sizeLabel(selectedVariant)}`,
    })
  }, [product, selectedVariant, quantity, addItem])

  const handleWhatsAppConsult = useCallback(() => {
    if (!product || !selectedVariant || !phoneNumber) return
    const msg = encodeURIComponent(
      `Hola! Me interesa consultar sobre: ${product.title} (${sizeLabel(selectedVariant)}). ¿Podrían darme más información?`,
    )
    window.open(`https://wa.me/${phoneNumber}?text=${msg}`, "_blank")
  }, [product, selectedVariant, phoneNumber])

  /* ----------------------------- states ----------------------------- */

  if (isLoading) return <ProductDetailsSkeleton />

  if (error) {
    return (
      <div className="container-section">
        <div className="content-section flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <h2>Algo salió mal</h2>
          <p className="mt-4 max-w-md text-muted-foreground">{error}</p>
          <Button asChild className="mt-8">
            <Link href="/productos">Volver a la tienda</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!product || !selectedVariant) {
    return (
      <div className="container-section">
        <div className="content-section flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <span className="eyebrow">404</span>
          <h2 className="mt-3">Fragancia no encontrada</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            El producto que buscas no existe o ya no está disponible.
          </p>
          <Button asChild className="mt-8">
            <Link href="/productos">Explorar fragancias</Link>
          </Button>
        </div>
      </div>
    )
  }

  /* --- derived for render --- */
  const galleryImages =
    selectedVariant.imageUrls && selectedVariant.imageUrls.length > 0
      ? selectedVariant.imageUrls
      : product.imageUrls || []

  const { price, originalPrice, symbol } = getPrice(
    selectedVariant,
    selectedCurrencyId,
    acceptedCurrencies,
  )
  const hasValidPrice = price > 0
  const hasDiscount = originalPrice != null && originalPrice > price
  const discountPct = hasDiscount
    ? Math.round(((originalPrice! - price) / originalPrice!) * 100)
    : 0

  const stock = selectedVariant.inventoryQuantity
  const available = isVariantAvailable(selectedVariant)
  let stockState: { dot: string; label: string }
  if (stock <= 0 && product.allowBackorder)
    stockState = { dot: "bg-brand", label: "Disponible bajo pedido" }
  else if (stock <= 0) stockState = { dot: "bg-muted-foreground", label: "Agotado" }
  else if (stock <= 5) stockState = { dot: "bg-brand", label: "Últimas unidades" }
  else stockState = { dot: "bg-brand", label: "Disponible" }

  const maxQty = product.allowBackorder ? Math.max(stock, 5) : stock
  const sensoryIntro = (() => {
    const text = (product.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (!text) return ""
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    return sentences.slice(0, 2).join(" ").trim()
  })()

  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.6, ease: EASE },
      }

  /* ----------------------------- render ----------------------------- */

  return (
    <main className="bg-background pb-24 pt-28 md:pt-32">
      {/* Breadcrumb */}
      <div className="container-section">
        <nav className="content-section flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Inicio
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <Link href="/productos" className="transition-colors hover:text-foreground">
            Fragancias
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="text-foreground/80 line-clamp-1">{product.title}</span>
        </nav>
      </div>

      {/* Above the fold */}
      <section className="container-section mt-8 md:mt-12">
        <div className="content-section grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <ProductGallery
            images={galleryImages}
            alt={product.title}
            resetKey={selectedVariant.id}
          />

          {/* Buy box */}
          <div className="lg:py-4">
            {product.vendor && <span className="eyebrow">{product.vendor}</span>}
            <h1 className="mt-3 text-4xl md:text-5xl">{product.title}</h1>

            {sensoryIntro && (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
                {sensoryIntro}
              </p>
            )}

            {/* Price */}
            {hasValidPrice && (
              <div className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-3xl text-foreground md:text-4xl">
                  {formatMoney(price, symbol)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      {formatMoney(originalPrice!, symbol)}
                    </span>
                    <span className="bg-brand px-2 py-0.5 text-xs font-semibold text-brand-foreground">
                      −{discountPct}%
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Size selector */}
            {activeVariants.length > 0 && (
              <div className="mt-8">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">Tamaño</span>
                  <span className="text-xs text-muted-foreground">
                    {sizeLabel(selectedVariant)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {activeVariants.map((variant) => {
                    const isSelected = variant.id === selectedVariant.id
                    const avail = isVariantAvailable(variant)
                    const vp = getPrice(variant, selectedCurrencyId, acceptedCurrencies)
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => avail && handleSelectVariant(variant)}
                        disabled={!avail}
                        aria-pressed={isSelected}
                        className={`group flex min-w-[88px] flex-col items-start border px-4 py-2.5 text-left transition-all ${
                          isSelected
                            ? "border-brand ring-1 ring-brand"
                            : "border-border hover:border-foreground"
                        } ${!avail ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        <span className="text-sm font-medium leading-tight text-foreground">
                          {sizeLabel(variant)}
                        </span>
                        {vp.price > 0 && (
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {formatMoney(vp.price, vp.symbol)}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-stretch">
              <div className="flex items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir cantidad"
                  className="flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty || !available}
                  aria-label="Aumentar cantidad"
                  className="flex h-12 w-12 items-center justify-center text-foreground transition-colors hover:bg-secondary disabled:opacity-30"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {hasValidPrice ? (
                <Button
                  onClick={handleAddToCart}
                  disabled={!available}
                  className="h-12 flex-1 rounded-none bg-foreground text-sm font-medium uppercase tracking-[0.12em] text-background hover:bg-foreground/90"
                >
                  {available ? "Agregar al carrito" : "Agotado"}
                </Button>
              ) : (
                <Button
                  onClick={handleWhatsAppConsult}
                  disabled={!phoneNumber}
                  className="h-12 flex-1 rounded-none bg-foreground text-sm font-medium uppercase tracking-[0.12em] text-background hover:bg-foreground/90"
                >
                  Consultar por WhatsApp
                </Button>
              )}
            </div>

            {/* Stock indicator */}
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${stockState.dot}`} aria-hidden />
              <span>{stockState.label}</span>
              {stock > 0 && stock <= 5 && (
                <span className="text-xs">· quedan {stock}</span>
              )}
            </div>

            {/* Trust microcopy */}
            <div className="mt-7 space-y-3 border-t border-border pt-6">
              <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-foreground" />
                Envío gratis desde {formatMoney(FREE_SHIPPING_THRESHOLD, symbol)}
              </p>
              <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-foreground" />
                Compra 100% segura · fragancias originales garantizadas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Olfactory pyramid */}
      <section className="container-section mt-24 md:mt-32">
        <div className="content-section">
          <OlfactoryPyramid notes={olfactory} fallbackText={sensoryIntro} />
        </div>
      </section>

      {/* Full description */}
      {product.description && product.description.trim() && (
        <motion.section {...reveal} className="container-section mt-24 md:mt-32">
          <div className="content-section max-w-3xl">
            <span className="eyebrow">La fragancia</span>
            <h2 className="mt-3">Sobre {product.title}</h2>
            <ProductRichDescription description={product.description} />
          </div>
        </motion.section>
      )}

      {/* Specs */}
      <motion.section {...reveal} className="container-section mt-20 md:mt-28" id="detalles">
        <div className="content-section max-w-3xl">
          <span className="eyebrow">Detalles</span>
          <h2 className="mt-3">Ficha técnica</h2>
          <dl className="mt-8 divide-y divide-border border-t border-border">
            {product.vendor && <SpecRow label="Marca" value={product.vendor} />}
            {concentration && <SpecRow label="Concentración" value={concentration} />}
            {activeVariants.length > 0 && (
              <SpecRow
                label="Tamaños disponibles"
                value={activeVariants.map(sizeLabel).join(" · ")}
              />
            )}
            {product.categories && product.categories.length > 0 && (
              <SpecRow
                label="Categorías"
                value={product.categories.map((c) => c.name).join(", ")}
              />
            )}
            {product.collections && product.collections.length > 0 && (
              <SpecRow
                label="Colecciones"
                value={product.collections.map((c) => c.title).join(", ")}
              />
            )}
          </dl>
        </div>
      </motion.section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <motion.section {...reveal} className="container-section mt-24 md:mt-32">
          <div className="content-section">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Para ti</span>
                <h2 className="mt-3">Quizás te guste</h2>
              </div>
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  aria-label="Anterior"
                  className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:border-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  aria-label="Siguiente"
                  className="flex h-10 w-10 items-center justify-center border border-border transition-colors hover:border-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {relatedProducts.map((rp) => (
                  <div
                    key={rp.id}
                    className="min-w-0 flex-[0_0_75%] sm:flex-[0_0_42%] md:flex-[0_0_30%] lg:flex-[0_0_23%]"
                  >
                    <ProductCard
                      product={rp}
                      selectedCurrencyId={selectedCurrencyId}
                      acceptedCurrencies={acceptedCurrencies}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </main>
  )
}

/* --------------------------- sub-pieces ---------------------------- */

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  )
}

function ProductRichDescription({ description }: { description: string }) {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(description)

  if (!isHtml) {
    return (
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
        {description
          .split(/\n{2,}|\r\n{2,}/)
          .map((p) => p.trim())
          .filter(Boolean)
          .map((p, i) => (
            <p key={i}>{p}</p>
          ))}
      </div>
    )
  }

  return (
    <div
      className="mt-6 max-w-full overflow-x-auto text-base leading-relaxed text-muted-foreground
        [&_a]:text-brand-dark [&_a]:underline
        [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-4 [&_blockquote]:italic
        [&_h1]:mb-3 [&_h1]:mt-8 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:text-foreground
        [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-foreground
        [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-medium [&_h3]:text-foreground
        [&_img]:h-auto [&_img]:max-w-full
        [&_li]:mb-1.5
        [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5
        [&_p]:mb-4
        [&_strong]:text-foreground
        [&_table]:mb-4 [&_table]:w-full [&_table]:border [&_table]:border-border
        [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2.5
        [&_th]:border [&_th]:border-border [&_th]:bg-secondary [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-medium [&_th]:text-foreground
        [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  )
}

function ProductDetailsSkeleton() {
  return (
    <main className="bg-background pb-24 pt-28 md:pt-32">
      <div className="container-section">
        <div className="content-section">
          <Skeleton className="h-4 w-64" />
          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="space-y-6 lg:py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-40" />
              <div className="flex gap-2.5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-24" />
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
