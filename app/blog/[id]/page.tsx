"use client"

import { use, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { useMainStore } from "@/stores/mainStore"
import type { Content } from "@/types/content"
import { BlogContent } from "../_components/BlogContent"
import { PostCard } from "../_components/PostCard"
import { Skeleton } from "@/components/ui/skeleton"

export default function BlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { contents, fetchContents, loading } = useMainStore()
  const [current, setCurrent] = useState<Content | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    const run = async () => {
      let list = contents
      if (!list || list.length === 0) {
        try {
          const res = await fetchContents({ limit: 100, sortBy: "createdAt", sortOrder: "desc" })
          list = (res?.data as Content[]) || []
        } catch {
          list = []
        }
      }
      const found = list.find((c) => c.slug === id) || null
      if (active) setCurrent(found)
    }
    run()
    return () => {
      active = false
    }
  }, [contents, id, fetchContents])

  if (current === undefined || (loading && !current)) return <BlogPostSkeleton />

  if (current === null) {
    return (
      <main className="container-section py-24 text-center">
        <div className="content-section">
          <span className="eyebrow text-brand">Diario</span>
          <h1 className="mt-4">Artículo no encontrado</h1>
          <Link href="/blog" className="mt-8 inline-flex bg-foreground px-8 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-background hover:bg-foreground/90">
            Volver al diario
          </Link>
        </div>
      </main>
    )
  }

  const date = current.publishedAt
    ? new Date(current.publishedAt).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })
    : ""
  const words = (current.body || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length
  const readTime = Math.max(2, Math.round(words / 200))
  const related = (contents || []).filter((c) => c.type !== "PAGE" && c.slug !== current.slug).slice(0, 3)

  return (
    <main className="bg-background pb-20">
      {/* Hero */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container-section pt-10 sm:pt-14"
      >
        <div className="content-section mx-auto max-w-3xl text-center">
          <Link href="/blog" className="mb-6 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-brand">
            <ArrowLeft className="h-3.5 w-3.5" /> Diario
          </Link>
          <div className="flex items-center justify-center gap-3">
            {current.metadata?.category && <span className="eyebrow text-brand">{current.metadata.category as string}</span>}
            <span className="text-xs text-muted-foreground">{readTime} min de lectura</span>
          </div>
          <h1 className="mt-3">{current.title}</h1>
          {date && <p className="mt-4 text-sm text-muted-foreground">{date}</p>}
        </div>
      </motion.header>

      {/* Featured image */}
      <div className="container-section mt-10">
        <div className="content-section mx-auto max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
            <Image
              src={current.featuredImage || "/placeholders/hero.svg"}
              alt={current.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <article className="container-section mt-12">
        <div className="content-section mx-auto max-w-2xl">
          <div className="blog-prose text-[15px] leading-relaxed text-foreground [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-xl [&_li]:mb-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_strong]:text-foreground [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5">
            <BlogContent content={current.body || ""} />
          </div>

          {/* CTA */}
          <div className="mt-12 border-y border-border bg-muted/40 p-8 text-center">
            <h3 className="font-display text-2xl">Encuentra tu próxima fragancia</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Explora nuestra selección de perfumes árabes, de diseñador y de nicho, 100% originales.
            </p>
            <Link href="/productos" className="mt-5 inline-flex bg-foreground px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-background transition-colors hover:bg-brand hover:text-brand-foreground">
              Ir a la tienda
            </Link>
          </div>
        </div>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-section mt-20">
          <div className="content-section">
            <h2 className="mb-8 text-center font-display text-3xl">Sigue leyendo</h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3">
              {related.map((c, i) => (
                <PostCard key={c.id} content={c} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function BlogPostSkeleton() {
  return (
    <div className="container-section py-16">
      <div className="content-section mx-auto max-w-3xl space-y-4 text-center">
        <Skeleton className="mx-auto h-4 w-24" />
        <Skeleton className="mx-auto h-10 w-3/4" />
        <Skeleton className="mx-auto h-4 w-40" />
      </div>
      <div className="content-section mx-auto mt-10 max-w-4xl">
        <Skeleton className="aspect-[16/9] w-full" />
      </div>
      <div className="content-section mx-auto mt-12 max-w-2xl space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}
