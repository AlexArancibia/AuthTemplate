import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Navbar from "@/components/navbar"
import { auth } from "@/auth"
import { Footer } from "@/components/footer"
import { PreFooterContact } from "@/components/PreFooter"
import { WhatsAppButton } from "@/components/WhatsappButton"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: {
    default: "Clefast - Detergentes Ecológicos Industriales | Perú",
    template: "%s | Clefast - Detergentes Ecológicos",
  },
  description:
    "Clefast es líder en detergentes ecológicos industriales en Perú. Ofrecemos soluciones de limpieza profesional eco-amigables y biodegradables para empresas, hoteles, restaurantes y centros de salud.",
  keywords: [
    "detergentes ecológicos",
    "detergentes industriales",
    "limpieza ecológica",
    "productos biodegradables",
    "detergentes eco-amigables",
    "limpieza profesional",
    "productos de limpieza",
    "detergentes comerciales",
    "limpieza industrial",
    "desinfectantes ecológicos",
    "productos químicos verdes",
    "limpieza hospitalaria",
    "limpieza hotelera",
    "detergentes biodegradables",
    "Clefast Perú",
  ],
  authors: [
    {
      name: "Clefast",
      url: "https://clefast.com.pe",
    },
  ],
  creator: "Clefast",
  publisher: "Clefast",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://clefast.com.pe"),
  alternates: {
    canonical: "/",
    languages: {
      "es-PE": "/",
      es: "/es",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://clefast.com.pe",
    title: "Clefast - Detergentes Ecológicos Industriales",
    description:
      "Líder en detergentes ecológicos industriales en Perú. Soluciones de limpieza profesional eco-amigables para empresas, hoteles, restaurantes y centros de salud.",
    siteName: "Clefast",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Clefast - Detergentes Industriales",
        type: "image/jpeg",
      },
      {
        url: "/og-image-square.jpg",
        width: 1200,
        height: 1200,
        alt: "Clefast - Detergentes Industriales",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clefast - Detergentes Industriales de Alta Calidad",
    description: "Líder en detergentes industriales. Soluciones de limpieza profesional certificadas y eco-amigables.",
    images: ["/twitter-image.jpg"],
    creator: "@clefast",
    site: "@clefast",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#0066cc",
      },
    ],
  },
  manifest: "/site.webmanifest",
  category: "business",
  classification: "Detergentes Industriales y Productos de Limpieza",
  referrer: "origin-when-cross-origin",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
    other: {
      "msvalidate.01": "your-bing-verification-code",
    },
  },
  appleWebApp: {
    capable: true,
    title: "Clefast",
    statusBarStyle: "default",
  },
  applicationName: "Clefast",
  appLinks: {
    web: {
      url: "https://clefast.com.pe",
      should_fallback: true,
    },
  },
  bookmarks: ["https://clefast.com.pe"],
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#0066cc",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#ffffff",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html lang="es">
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Clefast",
              description: "Empresa líder en detergentes ecológicos industriales en Perú",
              url: "https://clefast.com.pe",
              logo: "https://clefast.com.pe/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+51-XXX-XXX-XXX",
                contactType: "customer service",
                availableLanguage: ["Spanish", "English"],
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "PE",
                addressLocality: "Lima",
              },
              sameAs: [
                "https://www.facebook.com/clefast",
                "https://www.instagram.com/clefast",
                "https://www.linkedin.com/company/clefast",
              ],
              foundingDate: "2020",
              industry: "Detergentes Industriales",
              numberOfEmployees: "50-100",
              areaServed: {
                "@type": "Country",
                name: "Peru",
              },
            }),
          }}
        />

        {/* Additional Meta Tags */}
        <meta name="application-name" content="Clefast" />
        <meta name="apple-mobile-web-app-title" content="Clefast" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#0066cc" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={poppins.className}>
        <Toaster position="top-center" richColors />
        <Navbar user={session?.user} />
        <main className="min-h-screen">{children}</main>
        <PreFooterContact />
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  )
}
