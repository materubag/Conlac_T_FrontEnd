import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/config";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloatingButton } from "@/components/layout/WhatsAppFloatingButton";

// Configuración tipográfica con next/font/google
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
  weight: ["600", "700", "800"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "CONLAC-T | Productos lácteos de Tungurahua",
    template: "%s | CONLAC-T",
  },
  description:
    "Tienda web del Consorcio de Lácteos de Tungurahua para conocer y adquirir productos lácteos elaborados por asociaciones locales.",
  keywords: [
    "queso artesanal",
    "Pilahuín",
    "Tungurahua",
    "CONLAC-T",
    "queso fresco",
    "queso amasado",
    "quesillo",
    "queso maduro andino",
    "Ambato lácteos",
  ],
  authors: [{ name: "Consorcio de Lácteos de Tungurahua" }],
  icons: {
    icon: "/logo/logo-conlac-t.png",
    apple: "/logo/logo-conlac-t.png",
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: siteConfig.url,
    title: "CONLAC-T | Productos lácteos de Tungurahua",
    description:
      "Tienda web del Consorcio de Lácteos de Tungurahua para conocer y adquirir productos lácteos elaborados por asociaciones locales.",
    siteName: siteConfig.name,
    images: [
      {
        url: "/logo/logo-conlac-t.png",
        width: 600,
        height: 600,
        alt: "Logo oficial CONLAC-T",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#184332",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-background text-neutral antialiased selection:bg-tertiary selection:text-neutral">
        
        {/* Enlace accesible de salto al contenido principal (WCAG 2.2) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-inverted focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-tertiary"
        >
          Saltar al contenido principal
        </a>

        {/* Barra de Navegación con 7 pestañas oficiales */}
        <Navbar />

        {/* Contenido Dinámico de la Página */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Botón flotante persistente de WhatsApp */}
        <WhatsAppFloatingButton />

        {/* Pie de Página Institucional */}
        <Footer />
      </body>
    </html>
  );
}
