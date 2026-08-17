import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthSuccessToast } from "@/components/auth-success-toast";
import { WhatsAppButton } from "@/components/WhatsappButton";
import { BackToTop } from "@/components/BackToTop";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: {
    default: "Scentra — Perfumería de Autor en el Perú | Fragancias Originales",
    template: "%s | Scentra",
  },
  description:
    "Scentra es perfumería de autor en el Perú: fragancias árabes, de diseñador y de nicho, 100% originales. Encuentra tu firma olfativa. Envío gratis desde S/199.",
  keywords: [
    "perfumes",
    "perfumería",
    "fragancias",
    "perfumes árabes",
    "perfumes de nicho",
    "perfumes de diseñador",
    "perfumes originales Perú",
    "Scentra",
    "Lima",
    "eau de parfum",
  ],
  metadataBase: new URL("https://scentra.pe"),
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://scentra.pe/",
    title: "Scentra — Perfumería de Autor en el Perú",
    description:
      "Fragancias árabes, de diseñador y de nicho, 100% originales. Tu firma olfativa.",
    siteName: "Scentra",
    images: [
      {
        url: "https://pub-a15fad1bb05e4ecbb92c9d83b643a721.r2.dev/shop_a6d7c5ab-b60f/pages/hero-home-desktop.webp",
        width: 1200,
        height: 630,
        alt: "Scentra — Perfumería de Autor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scentra — Perfumería de Autor en el Perú",
    description:
      "Fragancias árabes, de diseñador y de nicho, 100% originales. Tu firma olfativa.",
    images: ["https://pub-a15fad1bb05e4ecbb92c9d83b643a721.r2.dev/shop_a6d7c5ab-b60f/pages/hero-home-desktop.webp"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${cormorant.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: "Scentra",
              url: "https://scentra.pe/",
              description:
                "Perfumería de autor en el Perú. Fragancias árabes, de diseñador y de nicho, 100% originales.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Av. José Larco 345, Of. 502",
                addressLocality: "Miraflores, Lima",
                addressCountry: "PE",
              },
              sameAs: [
                "https://facebook.com/scentraperu",
                "https://instagram.com/scentra.pe",
                "https://tiktok.com/@scentra.pe",
              ],
            }),
          }}
        />
      </head>
      <body className="overflow-x-hidden">
        <Toaster position="top-center" richColors />
        <Suspense fallback={null}>
          <AuthSuccessToast />
        </Suspense>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <BackToTop />
      </body>
    </html>
  );
}
