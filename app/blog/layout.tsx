import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog CLEFAST | Guías y noticias para lavanderías industriales",
  description: "Guías técnicas, consejos y procesos de lavado industrial para lavanderías profesionales. Aprende qué productos usar y cómo optimizar resultados con CLEFAST.",
}

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
