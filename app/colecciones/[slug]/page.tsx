"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useMainStore } from "@/stores/mainStore"
import { useCurrencyStore } from "@/stores/currency"
import ProductList from "@/app/productos/_components/ProductList"
import type { Collection } from "@/types/collection"

export default function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { collections, fetchCollections } = useMainStore()
  const { selectedCurrencyId, acceptedCurrencies } = useCurrencyStore()
  const [resolved, setResolved] = useState<Collection | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    const run = async () => {
      let list = collections
      if (!list || list.length === 0) {
        try {
          const res = await fetchCollections({ limit: 100 })
          list = (res?.data as Collection[]) || []
        } catch {
          list = []
        }
      }
      const found = list.find((c) => c.slug === slug) || null
      if (active) setResolved(found)
    }
    run()
    return () => {
      active = false
    }
  }, [slug, collections, fetchCollections])

  if (resolved === undefined) {
    return (
      <div className="container-section py-24">
        <div className="content-section">
          <div className="h-8 w-64 animate-pulse bg-secondary" />
        </div>
      </div>
    )
  }

  if (resolved === null) {
    return (
      <div className="container-section py-24 text-center">
        <div className="content-section">
          <span className="eyebrow text-brand">Colección no encontrada</span>
          <h1 className="mt-4">Esta colección no existe</h1>
          <Link
            href="/productos"
            className="mt-8 inline-flex bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90"
          >
            Ver todas las fragancias
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Collection header */}
      <section className="relative overflow-hidden bg-foreground">
        {resolved.imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolved.imageUrl}
              alt={resolved.title}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
          </>
        )}
        <div className="container-section relative">
          <div className="content-section py-20 sm:py-28 text-center">
            <span className="eyebrow text-white/70">Colección</span>
            <h1 className="mt-3 text-white">{resolved.title}</h1>
            {resolved.description && (
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                {resolved.description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products */}
      <div className="container-section py-12 sm:py-16">
        <div className="content-section">
          <ProductList
            initialCollectionIds={[resolved.id]}
            collectionName={resolved.title}
            selectedCurrencyId={selectedCurrencyId}
            acceptedCurrencies={acceptedCurrencies}
          />
        </div>
      </div>
    </div>
  )
}
