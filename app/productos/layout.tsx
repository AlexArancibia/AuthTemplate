import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Productos para Lavanderías Industriales | CLEFAST",
  description: "Compra online productos CLEFAST para lavanderías industriales y comerciales. Detergentes, suavizantes, blanqueador y otros complementos de lavado con asesoría técnica especializada.",
}

export default function ProductsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
