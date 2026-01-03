import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nosotros | CLEFAST, soluciones para lavanderías industriales",
  description: "Somos CLEFAST, empresa especializada en soluciones de lavado para lavanderías industriales y comerciales. Experiencia, asesoría técnica y compromiso con cada cliente.",
}

export default function NosotrosLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
