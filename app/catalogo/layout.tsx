import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Catálogo CLEFAST | Línea Clásica, Especializada y Premium",
  description: "Catálogos descargables CLEFAST. Conoce nuestras soluciones de lavado para lavanderías industriales y comerciales, organizadas por línea Clásica, Especializada y Premium",
}

export default function CatalogLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
