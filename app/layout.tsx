import type React from "react"
import type { Metadata } from "next"
import { DM_Sans } from 'next/font/google'
import "./globals.css"
import { Toaster } from "sonner"
import Navbar from "@/components/navbar"
import { auth } from "@/auth"

const dmSans = DM_Sans({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mi Aplicación",
  description: "Una aplicación con autenticación de usuarios",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="es">
      <body className={dmSans.className}>
        <Toaster position="top-center" richColors />
        <Navbar user={session?.user} />
        <main className="min-h-screen ">{children}</main>
      </body>
    </html>
  )
}