/**
 * ============================================================
 * CONFIGURACIÓN CENTRALIZADA DE LA APLICACIÓN - CONLAC-T
 * ============================================================
 * 
 * Evita acceder a process.env directamente desde componentes individuales.
 * Proporciona valores seguros por defecto para desarrollo y producción.
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || "CONLAC-T",
  shortName: "CONLAC-T",
  fullName: "Consorcio de Lácteos de Tungurahua",
  tagline: "Quesos artesanales de Pilahuín elaborados por asociaciones locales",
  description:
    "Tienda web del Consorcio de Lácteos de Tungurahua para conocer y adquirir productos lácteos elaborados por asociaciones locales.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  
  // Ubicación territorial
  location: {
    parish: "Pilahuín",
    canton: "Ambato",
    province: "Tungurahua",
    country: "Ecuador",
    region: "Sierra Central Andina",
    address: "Vía Ambato - Guaranda Km 18, Parroquia Pilahuín, Tungurahua, Ecuador",
  },

  // Canales de contacto
  contact: {
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593999999999",
    defaultWhatsAppMessage:
      process.env.NEXT_PUBLIC_WHATSAPP_DEFAULT_MESSAGE ||
      "Hola CONLAC-T, deseo información sobre los quesos artesanales de Pilahuín.",
    email: "info@conlact-tungurahua.ec",
    phone: "+593 99 999 9999",
    schedule: "Lunes a Domingo: 08h00 - 17h00",
  },

  // Rutas de assets
  assets: {
    logo: "/logo/logo-conlac-t.png",
    heroImage: "/images/hero-andes.svg",
    productPlaceholder: "/placeholders/product-queso-fresco.svg",
  },

  // Redes sociales institucionales (Placeholders para vinculación futura)
  socialLinks: {
    facebook: "https://facebook.com/conlac.tungurahua",
    instagram: "https://instagram.com/conlac.tungurahua",
    whatsapp: `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "593999999999"}`,
  },

  // URLs de servicios (Semana 7+)
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api",
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
} as const;
