import type { Metadata } from "next"
import type { ReactNode } from "react"

const BASE = "https://scentra.pe"

export const metadata: Metadata = {
  title: "Tienda — Todas las fragancias",
  description:
    "Explora perfumes árabes, de diseñador y de nicho, 100% originales. Filtra por marca, familia olfativa y precio. Envío gratis desde S/199 a todo el Perú.",
  alternates: { canonical: `${BASE}/productos` },
  openGraph: {
    type: "website",
    url: `${BASE}/productos`,
    title: "Tienda Scentra — Todas las fragancias",
    description:
      "Perfumes árabes, de diseñador y de nicho, 100% originales. Envío a todo el Perú.",
  },
}

export default function ProductosLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
