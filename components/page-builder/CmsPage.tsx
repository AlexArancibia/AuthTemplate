"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getPublishedPage } from "@/lib/pageBuilderV2"
import { PageRenderer } from "./PageRenderer"
import type { PageBuilderV2Page } from "@/types/pageBuilderV2"

/**
 * Renders any published Page Builder V2 page by slug.
 * Used for content pages (sobre-nosotros, contacto, legal, etc.).
 */
export function CmsPage({ slug, title }: { slug: string; title?: string }) {
  const [page, setPage] = useState<PageBuilderV2Page | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "empty">("loading")

  useEffect(() => {
    let active = true
    getPublishedPage(slug).then((p) => {
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
  }, [slug])

  if (status === "loading") {
    return (
      <div className="container-section py-24">
        <div className="content-section space-y-4">
          <div className="h-10 w-72 animate-pulse bg-secondary" />
          <div className="h-4 w-full max-w-2xl animate-pulse bg-secondary" />
          <div className="h-4 w-5/6 max-w-2xl animate-pulse bg-secondary" />
        </div>
      </div>
    )
  }

  if (status === "empty" || !page) {
    return (
      <div className="container-section py-24 text-center">
        <div className="content-section">
          <span className="eyebrow text-brand">Scentra</span>
          <h1 className="mt-4">{title || "Contenido en preparación"}</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Estamos preparando esta página. Mientras tanto, explora nuestras fragancias.
          </p>
          <Link
            href="/productos"
            className="mt-8 inline-flex bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    )
  }

  return <PageRenderer page={page} />
}

export default CmsPage
