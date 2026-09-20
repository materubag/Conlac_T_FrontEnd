import { siteConfig } from "./config";

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

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function buildWhatsAppUrl(options?: {
  phone?: string;
  message?: string;
  productId?: string;
  productName?: string;
  associationName?: string;
}): string {
  const phone = options?.phone || siteConfig.contact.whatsappNumber;
  let text = options?.message || siteConfig.contact.defaultWhatsAppMessage;

  if (options?.productName) {
    text = `Hola CONLAC-T, estoy interesado/a en adquirir el producto: ${options.productName}. ¿Tienen disponibilidad actual?`;
  } else if (options?.associationName) {
    text = `Hola CONLAC-T, me gustaría conocer más sobre los productos y la historia de ${options.associationName}.`;
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(text);

  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function getVideoEmbedUrl(url?: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.slice(1);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtube-nocookie.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/shorts/")[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
      }
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsed.hostname.includes("player.vimeo.com")) {
      return url;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const videoId = parsed.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  } catch {
    return null;
  }
}
