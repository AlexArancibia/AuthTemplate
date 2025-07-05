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
  metadataBase: new URL("https://clefast.com.pe"),
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
        url: "/fotoportada.jpg", // Imagen principal para compartir
        width: 1200,
        height: 630,
        alt: "Clefast - Detergentes Industriales Ecológicos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clefast - Detergentes Industriales Ecológicos",
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
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Clefast",
              url: "https://clefast.com.pe",
              logo: "https://clefast.com.pe/logo.png",
              sameAs: [
                "https://www.facebook.com/clefast",
                "https://www.instagram.com/clefast",
              ],
            }),
          }}
        />
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
  );
}