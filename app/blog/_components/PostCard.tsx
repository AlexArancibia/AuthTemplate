"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Content } from "@/types/content"

interface PostCardProps {
  content: Content
  index: number
}

function getExcerpt(body: string | null | undefined, maxLength = 130) {
  if (!body) return ""
  const text = body.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim()
  return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + "…" : text
}

function readingTime(body?: string | null) {
  const words = (body || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.round(words / 200))
}

export function PostCard({ content, index }: PostCardProps) {
  const reduce = useReducedMotion()
  const formatDate = (date: Date | null | undefined) =>
    !date ? "" : new Date(date).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.06 }}
      className="group flex flex-col"
    >
      <Link href={`/blog/${content.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
          <Image
            src={content.featuredImage || "/placeholders/hero.svg"}
            alt={content.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        </div>
        <div className="flex flex-grow flex-col pt-4">
          <div className="mb-2 flex items-center gap-3">
            {content.metadata?.category && (
              <span className="eyebrow text-brand">{content.metadata.category as string}</span>
            )}
            <span className="text-[11px] text-muted-foreground">{readingTime(content.body)} min de lectura</span>
          </div>
          <h3 className="line-clamp-2 font-display text-xl leading-snug text-foreground transition-colors group-hover:text-brand">
            {content.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-grow text-sm leading-relaxed text-muted-foreground">
            {(content.metadata?.excerpt as string) || getExcerpt(content.body)}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">{formatDate(content.publishedAt)}</span>
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors group-hover:text-brand">
              Leer →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
