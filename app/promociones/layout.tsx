import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Promociones y Bonificaciones para Lavanderías | CLEFAST",
  description: "Aprovecha las promociones y bonificaciones CLEFAST en detergentes industriales y productos para lavanderías comerciales e industriales.",
}

export default function PromocionesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}

