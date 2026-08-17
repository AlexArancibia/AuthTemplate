import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getContentBySlugSEO, plainExcerpt } from "@/lib/seoFetch"

const BASE = "https://scentra.pe"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const post = await getContentBySlugSEO(id)
  if (!post) {
    return { title: "Diario", description: "El arte de la fragancia — Diario Scentra." }
  }
  const description = plainExcerpt(post.body) || "Diario Scentra — guías y notas olfativas."
  const url = `${BASE}/blog/${post.slug}`
  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      images: post.featuredImage ? [{ url: post.featuredImage, alt: post.title }] : undefined,
      publishedTime: post.publishedAt || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

export default function BlogPostLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
