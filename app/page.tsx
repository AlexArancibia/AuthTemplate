"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getPublishedPage } from "@/lib/pageBuilderV2"
import { PageRenderer } from "@/components/page-builder/PageRenderer"
import { ProductRail } from "@/components/page-builder/sections/ProductRail"
import type { PageBuilderV2Page } from "@/types/pageBuilderV2"

export default function HomePage() {
  const [page, setPage] = useState<PageBuilderV2Page | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading")

  useEffect(() => {
    let active = true
    getPublishedPage("inicio").then((p) => {
      if (!active) return
      if (p) {
        setPage(p)
        setStatus("ready")
      } else {
        setStatus("empty")
      }
    })
    return () => {
      active = false
    }
  }, [])

  if (status === "loading") {
    return (
      <div>
        <div className="h-[82vh] min-h-[520px] w-full animate-pulse bg-secondary" />
        <div className="container-section py-16">
          <div className="content-section grid grid-cols-2 gap-5 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse bg-secondary" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (status === "empty" || !page) {
    // Graceful fallback if the CMS page is unavailable
    return (
      <div>
        <section className="relative flex h-[70vh] min-h-[460px] items-center justify-center bg-foreground text-center">
          <div className="container-section">
            <span className="eyebrow text-white/70">Perfumería de autor en el Perú</span>
            <h1 className="mt-4 text-white">Tu firma olfativa</h1>
            <p className="mx-auto mt-5 max-w-xl text-white/70">
              Árabes, diseñador y nicho — 100% originales.
            </p>
            <Link
              href="/productos"
              className="mt-8 inline-flex bg-brand px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-foreground hover:bg-brand-dark"
            >
              Explorar perfumes
            </Link>
          </div>
        </section>
        <ProductRail
          title="Los más pedidos en Perú"
          eyebrow="Bestsellers"
          source={{ type: "collection", collectionId: "col_09ded608-0ab9", limit: 8 }}
        />
      </div>
    )
  }

  return <PageRenderer page={page} />
}
