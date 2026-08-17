"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"
import { useCurrencyStore } from "@/stores/currency"
import { ProductCard } from "@/components/ProductCard"
import { Reveal } from "../Reveal"
import { SectionHeader } from "../SectionHeader"
import type { Product } from "@/types/product"

interface CatalogSource {
  type?: "collection" | "category" | "products" | "all"
  collectionId?: string
  categorySlug?: string
  limit?: number | null
}

export function ProductRail({
  title,
  subtitle,
  eyebrow,
  source,
  muted = false,
}: {
  title?: string
  subtitle?: string
  eyebrow?: string
  source: CatalogSource
  muted?: boolean
}) {
  const { getCollectionById, fetchProducts } = useMainStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const limit = source.limit ?? 10

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        let list: Product[] = []
        if (source.type === "collection" && source.collectionId) {
          const col = await getCollectionById(source.collectionId)
          list = (col?.products || []).filter((p) => p.status === "ACTIVE")
        } else {
          const res = await fetchProducts({
            limit,
            status: ["ACTIVE"],
            categorySlugs: source.categorySlug ? [source.categorySlug] : undefined,
            currencyId: selectedCurrencyId || undefined,
          })
          list = (res?.data as Product[]) || []
        }
        if (active) setProducts(list.slice(0, limit))
      } catch {
        if (active) setProducts([])
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source.type, source.collectionId, source.categorySlug, limit, selectedCurrencyId])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
  }, [emblaApi, onSelect, products])

  const viewAllHref = source.collectionId
    ? `/productos?collections=${source.collectionId}`
    : source.categorySlug
    ? `/productos?category=${source.categorySlug}`
    : "/productos"

  if (!loading && products.length === 0) return null

  return (
    <section className={muted ? "border-y border-border bg-muted/40 py-16 sm:py-20" : "py-16 sm:py-20"}>
      <div className="container-section">
        <div className="content-section">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />
            <div className="hidden flex-shrink-0 items-center gap-2 sm:flex">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canPrev}
                aria-label="Anterior"
                className="flex h-10 w-10 items-center justify-center border border-border text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canNext}
                aria-label="Siguiente"
                className="flex h-10 w-10 items-center justify-center border border-border text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse bg-secondary" />
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-5">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="min-w-0 flex-[0_0_70%] sm:flex-[0_0_40%] lg:flex-[0_0_25%] xl:flex-[0_0_22%]"
                    >
                      <ProductCard
                        product={product}
                        selectedCurrencyId={selectedCurrencyId}
                        acceptedCurrencies={acceptedCurrencies}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          <div className="mt-8 flex justify-center sm:justify-start">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 border-b border-foreground pb-1 text-xs font-medium uppercase tracking-[0.16em] text-foreground transition-colors hover:border-brand hover:text-brand"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductRail
