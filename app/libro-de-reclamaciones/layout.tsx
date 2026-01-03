import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Libro de reclamaciones | CLEFAST",
  description: "Accede al libro de reclamaciones de CLEFAST para registrar una queja o reclamo según la normativa vigente.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function LibroReclamacionesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
