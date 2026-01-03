import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto CLEFAST | Atención a lavanderías industriales y comerciales",
  description: "Contáctanos para recibir asesoría en soluciones de lavado profesional. Atención personalizada para lavanderías. Teléfono, correo y formulario CLEFAST.",
}

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
