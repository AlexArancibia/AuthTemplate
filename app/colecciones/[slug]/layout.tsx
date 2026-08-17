import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getCollectionBySlugSEO, plainExcerpt } from "@/lib/seoFetch"

const BASE = "https://scentra.pe"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const col = await getCollectionBySlugSEO(slug)
  if (!col) {
    return { title: "Colección", description: "Fragancias en Scentra." }
  }
  const description =
    plainExcerpt(col.description) ||
    `Descubre la colección ${col.title} en Scentra. Fragancias originales con envío a todo el Perú.`
  const url = `${BASE}/colecciones/${col.slug}`
  return {
    title: `${col.title} — Colección`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${col.title} | Scentra`,
      description,
      images: col.imageUrl ? [{ url: col.imageUrl, alt: col.title }] : undefined,
    },
  }
}

export default function CollectionLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
