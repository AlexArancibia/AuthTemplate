import type { MetadataRoute } from "next"
import apiClient from "@/lib/axiosConfig"

const BASE = "https://scentra.pe"
const STORE_ID = process.env.NEXT_PUBLIC_STORE_ID as string

const staticPaths = [
  "",
  "/productos",
  "/nosotros",
  "/contactenos",
  "/blog",
  "/preguntas-frecuentes",
  "/formas-pago",
  "/cambios-devoluciones",
  "/politica-de-envios",
  "/politica-de-privacidad",
  "/politica-de-cookies",
  "/terminos-y-condiciones",
  "/libro-de-reclamaciones",
]

async function fetchList(path: string): Promise<any[]> {
  try {
    const res = await apiClient.get(path)
    const data = res.data?.data ?? res.data
    return Array.isArray(data) ? data : data?.data || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Products: API caps limit at 100 — paginate up to 6 pages (600 products)
  const productPages = await Promise.all(
    [1, 2, 3, 4, 5, 6].map((page) =>
      fetchList(`/products/${STORE_ID}?limit=100&page=${page}&status=ACTIVE`),
    ),
  )
  const products = productPages.flat()

  const [collections, contents] = await Promise.all([
    fetchList(`/collections/${STORE_ID}?limit=100`),
    fetchList(`/contents/${STORE_ID}?limit=100`),
  ])

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: now,
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }))

  for (const c of collections) {
    if (c?.slug) entries.push({ url: `${BASE}/colecciones/${c.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 })
  }
  const seen = new Set<string>()
  for (const p of products) {
    if (p?.slug && !seen.has(p.slug)) {
      seen.add(p.slug)
      entries.push({ url: `${BASE}/productos/${p.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 })
    }
  }
  for (const c of contents) {
    if (c?.slug && c?.type !== "PAGE") entries.push({ url: `${BASE}/blog/${c.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.5 })
  }

  return entries
}
