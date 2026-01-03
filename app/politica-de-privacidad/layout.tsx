import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de privacidad | CLEFAST",
  description: "Consulta la política de privacidad de CLEFAST y conoce cómo protegemos y gestionamos tus datos personales conforme a la normativa vigente.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function PoliticaPrivacidadLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
