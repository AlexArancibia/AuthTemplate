import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { auth } from "@/auth";
import { Footer } from "@/components/footer";
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="es" className="light">
      <head>
        {/* Fuentes personalizadas - Druk Wide Bold y AdihausDIN */}
        <link href="https://fonts.cdnfonts.com/css/druk-wide-bold" rel="stylesheet"/>
        <link href="https://db.onlinewebfonts.com/c/c2001d0359daadcd014fba0e808555d0?family=AdihausDIN+Bold" rel="stylesheet"/>
        <script src="https://c.webfontfree.com/c.js?f=AdihausDIN-Regular" type="text/javascript"></script>
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
        <Navbar />
        <main className=" ">{children}</main>
        <PreFooterContact />
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}