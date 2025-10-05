import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { auth } from "@/auth";
import { Footer } from "@/components/footer";
import { PreFooterContact } from "@/components/PreFooter";
import { WhatsAppButton } from "@/components/WhatsappButton";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Configuración de Viewport (Nuevo en Next.js 14)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "ANJ SPORTs - Detergentes Ecológicos Industriales | Perú",
    template: "%s | ANJ SPORTs - Detergentes Ecológicos",
  },
  description:
    "ANJ SPORTs es líder en detergentes ecológicos industriales en Perú. Ofrecemos soluciones de limpieza profesional eco-amigables y biodegradables para empresas, hoteles, restaurantes y centros de salud.",
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
    "ANJ",
  ],
  metadataBase: new URL("https://anjsports.com"),
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://anjsports.com/",
    title: "ANJ SPORTs",
    description:
      "",
    siteName: "ANJ SPORTs",
    images: [
      {
        url: "/fotoportada.jpg", // Imagen principal para compartir
        width: 1200,
        height: 630,
        alt: "ANJ SPORTs - Detergentes Industriales Ecológicos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ANJ SPORTs - Detergentes Industriales Ecológicos",
    description: "Líder en detergentes industriales. Soluciones de limpieza profesional certificadas y eco-amigables.",
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
    <html lang="es">
      <head>
        {/* Google Fonts - Lato */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
          rel="stylesheet"
        />
        <link href="https://fonts.cdnfonts.com/css/druk-wide-bold" rel="stylesheet"/>
        <link href="https://db.onlinewebfonts.com/c/c2001d0359daadcd014fba0e808555d0?family=AdihausDIN+Bold" rel="stylesheet"/>
        <script src="https://c.webfontfree.com/c.js?f=AdihausDIN-Regular" type="text/javascript"></script>
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
      <body className={poppins.className}>
        <Toaster position="top-center" richColors />
        <Navbar />
        <main className="min-h-[70vh] sm:min-h-[80vh]">{children}</main>
        <PreFooterContact />
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}