import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/navbar";
import { auth } from "@/auth";
import { Footer } from "@/components/footer";
import { WhatsAppButton } from "@/components/WhatsappButton";

const inter = Inter({
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
		default: "SPORTT PERU - Tienda de Ping Pong y Tenis de Mesa | Perú",
		template: "%s | SPORTT PERU - Ping Pong y Tenis de Mesa",
	},
	description:
		"SPORTT PERU es la tienda líder en tenis de mesa en Perú. Venta de mesas, raquetas, pelotas, redes y accesorios profesionales para jugadores y clubes de ping pong.",
	keywords: [
		"ping pong",
		"tenis de mesa",
		"raquetas de ping pong",
		"mesas de tenis de mesa",
		"accesorios de ping pong",
		"pelotas de ping pong",
		"redes de ping pong",
		"tienda de tenis de mesa",
		"equipos deportivos",
		"ping pong profesional",
		"clubes de tenis de mesa",
		"deporte de mesa",
		"mesas deportivas",
		"paletas de ping pong",
		"SPORTT PERU",
	],
	metadataBase: new URL("https://sporttperu.com"),
	openGraph: {
		type: "website",
		locale: "es_PE",
		url: "https://sporttperu.com",
		title: "SPORTT PERU - Tienda de Ping Pong y Tenis de Mesa",
		description:
			"Compra online mesas, raquetas y accesorios de tenis de mesa en SPORTT PERU. Productos de calidad para jugadores, clubes y colegios.",
		siteName: "SPORTT PERU",
		images: [
			{
				url: "/fotoportada.jpg",
				width: 1200,
				height: 630,
				alt: "SPORTT PERU - Tienda de Ping Pong y Tenis de Mesa",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "SPORTT PERU - Ping Pong y Tenis de Mesa en Perú",
		description:
			"Encuentra todo para el tenis de mesa: mesas, paletas, pelotas y accesorios en SPORTT PERU.",
		images: ["/fotoportada.jpg"],
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
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
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap"
					rel="stylesheet"
				/>
				<link
					href="https://fonts.cdnfonts.com/css/druk-wide-bold"
					rel="stylesheet"
				/>
				<link
					href="https://db.onlinewebfonts.com/c/c2001d0359daadcd014fba0e808555d0?family=AdihausDIN+Bold"
					rel="stylesheet"
				/>
				<script
					src="https://c.webfontfree.com/c.js?f=AdihausDIN-Regular"
					type="text/javascript"
				></script>
				<link
					href="https://fonts.cdnfonts.com/css/futura-std"
					rel="stylesheet"
				/>
				{/* Structured Data */}
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Organization",
							name: "Sportt Peru",
							url: "https://sporttperu.com//",
							logo: "",
							sameAs: [
								"",
								"",
							],
						}),
					}}
				/>
			</head>
			<body className={inter.className + " overflow-x-hidden"}>
				<Toaster position="top-center" richColors />
				<Navbar />
				<main className="">{children}</main>
				<Footer />
				<WhatsAppButton />
			</body>
		</html>
	);
}
