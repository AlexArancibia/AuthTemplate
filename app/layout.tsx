import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { auth } from "@/auth";
import { Footer } from "@/components/footer";
import { AuthSuccessToast } from "@/components/auth-success-toast";
import { PreFooterContact } from "@/components/PreFooter";
import { WhatsAppButton } from "@/components/WhatsappButton";

// Configuración de Viewport (Nuevo en Next.js 14)
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
    default: "ANJ SPORTs - Tienda de Tenis de Mesa | Raquetas, Gomas y Accesorios | Perú",
    template: "%s | ANJ SPORTs - Tienda de Tenis de Mesa",
  },
  description:
    "ANJ SPORTs es tu tienda especializada en tenis de mesa en Perú. Ofrecemos raquetas, gomas, mesas, robots, accesorios, ropa y equipamiento profesional de las mejores marcas como Butterfly, Xiom, Victas, Sanwei y más.",
  keywords: [
    "tenis de mesa",
    "raquetas de tenis de mesa",
    "gomas para tenis de mesa",
    "mesas de ping pong",
    "accesorios de tenis de mesa",
    "ropa deportiva",
    "robots de tenis de mesa",
    "ping pong",
    "table tennis",
    "butterfly",
    "xiom",
    "victas",
    "sanwei",
    "equipamiento deportivo",
    "ANJ SPORTs",
    "ANJ",
  ],
  metadataBase: new URL("https://anjsports.com"),
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://anjsports.com/",
    title: "ANJ SPORTs",
    description:
      "Tienda especializada en tenis de mesa. Raquetas, gomas, mesas, robots y accesorios de las mejores marcas.",
    siteName: "ANJ SPORTs",
    images: [
      {
        url: "/fotoportada.jpg", // Imagen principal para compartir
        width: 1200,
        height: 630,
        alt: "ANJ SPORTs - Tienda de Tenis de Mesa y Accesorios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ANJ SPORTs - Tienda de Tenis de Mesa | Perú",
    description: "Tienda especializada en tenis de mesa. Raquetas, gomas, mesas, robots y accesorios de las mejores marcas.",
    images: ["/fotoportada.jpg"], // Misma imagen para Twitter
  },
  manifest: "/favicons/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/favicons/apple-touch-icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/favicons/apple-touch-icon-120x120.png", sizes: "120x120", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const preloadedFonts = [
    { href: "/fonts/DrukWideBold.woff", type: "font/woff" },
    { href: "/fonts/AdihausDIN-Bold.woff2", type: "font/woff2" },
    { href: "/fonts/AdihausDIN-Regular.woff2", type: "font/woff2" },
  ];

  return (
    <html lang="es" className="light">
      <head>
        {/* Fuentes personalizadas - Auto-hospedadas para evitar CORS */}
        {preloadedFonts.map((font) => (
          <link
            key={font.href}
            rel="preload"
            href={font.href}
            as="font"
            type={font.type}
            crossOrigin="anonymous"
          />
        ))}
        {/* Force Light Theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Force light theme and prevent dark mode
              document.documentElement.classList.add('light');
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
              
              // Override system preference
              const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              mediaQuery.addEventListener('change', () => {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
              });
            `,
          }}
        />
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ANJ",
              url: "https://anjsports.com/",
              logo: "",
              sameAs: [
                "https://www.facebook.com/TenisdeMesaAnjSports",
                "https://www.instagram.com/anj.sports",
              ],
            }),
          }}
        />
      </head>
      <body className="font-adi-regular overflow-x-hidden">
        <Toaster position="top-center" richColors />
        <Suspense fallback={null}>
          <AuthSuccessToast />
        </Suspense>
        <Navbar />
        <main className=" ">{children}</main>
        <PreFooterContact />
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}