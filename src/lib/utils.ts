import { siteConfig } from "./config";

/**
 * Combina clases de CSS de forma segura.
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string") {
      classes.push(input);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(" ").trim();
}

/**
 * Formatea valores numéricos a moneda oficial (USD).
 * Ejemplo: 3.25 -> "$3.25"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Construye la URL para redirección a WhatsApp con mensaje codificado.
 * Permite mensajes generales, consultas específicas de producto o número de pedido.
 */
export function buildWhatsAppUrl(options?: {
  phone?: string;
  message?: string;
  productId?: string;
  productName?: string;
}): string {
  const phone = options?.phone || siteConfig.contact.whatsappNumber;
  let text = options?.message || siteConfig.contact.defaultWhatsAppMessage;

  if (options?.productName) {
    text = `Hola CONLAC-T, estoy interesado/a en adquirir el producto: ${options.productName}. ¿Tienen disponibilidad actual?`;
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(text);

  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
