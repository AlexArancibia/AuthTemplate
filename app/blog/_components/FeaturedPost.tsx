"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Content } from "@/types/content";

interface FeaturedContentProps {
  content: Content;
}

export function FeaturedContent({ content }: FeaturedContentProps) {
  const reduce = useReducedMotion();
  const formatDate = (date?: Date) =>
    date ? new Date(date).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" }) : "";

  const getExcerpt = (body?: string, maxLength = 220) => {
    if (!body) return "";
    const text = body.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim();
    return text.length > maxLength ? text.slice(0, maxLength).trimEnd() + "…" : text;
  };

  const readingTime = () => {
    const words = (content.body || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(2, Math.round(words / 200));
  };

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 overflow-hidden border border-border lg:grid-cols-2"
    >
      <Link href={`/blog/${content.slug}`} className="group relative block h-[280px] overflow-hidden bg-secondary lg:h-auto lg:min-h-[420px]">
        <Image
          src={content.featuredImage || "/placeholders/hero.svg"}
          alt={content.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          priority
        />
      </Link>

      <div className="flex flex-col justify-center p-8 lg:p-14">
        <div className="mb-3 flex items-center gap-3">
          <span className="eyebrow text-brand">{(content.metadata?.category as string) || "Destacado"}</span>
          <span className="text-xs text-muted-foreground">{readingTime()} min de lectura</span>
        </div>
        <h2 className="font-display text-3xl leading-tight text-foreground md:text-4xl">{content.title}</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          {(content.metadata?.excerpt as string) || getExcerpt(content.body || undefined)}
        </p>
        <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
          {content.publishedAt && <span>{formatDate(content.publishedAt)}</span>}
        </div>
        <Link
          href={`/blog/${content.slug}`}
          className="mt-7 inline-flex w-fit items-center gap-2 bg-foreground px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-background transition-colors hover:bg-brand hover:text-brand-foreground"
        >
          Leer artículo →
        </Link>
      </div>
    </motion.div>
  );
}
