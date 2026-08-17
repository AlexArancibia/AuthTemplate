import type { Metadata } from "next"
import type { ReactNode } from "react"
import { getProductBySlugSEO, plainExcerpt } from "@/lib/seoFetch"

const BASE = "https://scentra.pe"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductBySlugSEO(id)
  if (!product) {
    return { title: "Producto", description: "Fragancia en Scentra." }
  }
  const name = [product.vendor, product.title].filter(Boolean).join(" ")
  const description =
    plainExcerpt(product.description) ||
    `${name} — fragancia original disponible en Scentra. Envío a todo el Perú.`
  const image = product.imageUrls?.[0]
  const url = `${BASE}/productos/${product.slug}`
  return {
    title: name,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: name,
      description,
      images: image ? [{ url: image, width: 1200, height: 1200, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: image ? [image] : undefined,
    },
  }
}

function priceInfo(product: Awaited<ReturnType<typeof getProductBySlugSEO>>) {
  if (!product) return null
  const prices: number[] = []
  let currency = "PEN"
  for (const v of product.variants || []) {
    for (const p of v.prices || []) {
      const n = Number(p.price)
      if (!isNaN(n) && n > 0) {
        prices.push(n)
        if (p.currency?.code) currency = p.currency.code
      }
    }
  }
  if (!prices.length) return null
  return { low: Math.min(...prices), currency }
}

export default async function ProductLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductBySlugSEO(id)
  const info = priceInfo(product)

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: [product.vendor, product.title].filter(Boolean).join(" "),
        description: plainExcerpt(product.description, 300),
        image: product.imageUrls || [],
        brand: product.vendor
          ? { "@type": "Brand", name: product.vendor }
          : undefined,
        category: product.categories?.[0]?.name,
        offers: info
          ? {
              "@type": "Offer",
              price: info.low,
              priceCurrency: info.currency,
              availability: "https://schema.org/InStock",
              url: `${BASE}/productos/${product.slug}`,
            }
          : undefined,
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
