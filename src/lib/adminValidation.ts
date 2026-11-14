export const MAX_IMAGE_MB = 5;
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface FieldRule {
  maxLength: number;
  required?: boolean;
  min?: number;
  max?: number;
  decimals?: number;
  format?: "youtube" | "email" | "url" | "phone" | "slug" | "stat";
}

export const ADMIN_RULES = {
  title: { maxLength: 150, required: true },
  subtitle: { maxLength: 300 },
  short: { maxLength: 60 },
  description: { maxLength: 600 },
  longText: { maxLength: 5000 },
  step: { maxLength: 1000, required: true },
  detail: { maxLength: 300 },
  address: { maxLength: 300 },
  schedule: { maxLength: 120 },
  registration: { maxLength: 80 },
  email: { maxLength: 254, format: "email" },
  phone: { maxLength: 16, format: "phone" },
  url: { maxLength: 2048, format: "url" },
  youtube: { maxLength: 2048, format: "youtube" },
  slug: { maxLength: 150, required: true, format: "slug" },
  price: { maxLength: 8, min: 0, max: 10000, decimals: 2, required: true },
  stock: { maxLength: 6, min: 0, max: 100000, decimals: 0, required: true },
  members: { maxLength: 5, min: 0, max: 10000, decimals: 0, required: true },
  minutes: { maxLength: 4, min: 1, max: 1440, decimals: 0, required: true },
  servings: { maxLength: 3, min: 1, max: 100, decimals: 0, required: true },
  latitude: { maxLength: 10, min: -90, max: 90, decimals: 6, required: true },
  longitude: { maxLength: 11, min: -180, max: 180, decimals: 6, required: true },
  stepNumber: { maxLength: 2, min: 1, max: 99, decimals: 0, required: true },
  statistic: { maxLength: 20, format: "stat", required: true },
} satisfies Record<string, FieldRule>;

export type AdminFieldRule = keyof typeof ADMIN_RULES;
export function getAdminRule(rule: AdminFieldRule): FieldRule { return ADMIN_RULES[rule]; }

export function youtubeVideoId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "www.youtube.com" ||
      url.username || url.password || url.port) return null;
    const id = url.pathname === "/watch" ? url.searchParams.get("v") :
      /^\/(?:embed|shorts|live)\/([\w-]{11})\/?$/.exec(url.pathname)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}

export function fieldError(value: unknown, ruleName: AdminFieldRule, optional = false): string | null {
  const rule = getAdminRule(ruleName);
  if (value === undefined || value === null || value === "") {
    return rule.required && !optional ? "Este campo es obligatorio." : null;
  }
  if (typeof value !== "string" && typeof value !== "number") return "Tipo de dato inválido.";
  const text = String(value);
  if (text.length > rule.maxLength) return `Máximo ${rule.maxLength} caracteres.`;
  if (!text.trim()) return rule.required && !optional ? "Este campo es obligatorio." : null;
  if (rule.min !== undefined) {
    if (!/^-?\d+(?:\.\d+)?$/.test(text) || !Number.isFinite(Number(text))) return "Ingresa un número válido, sin letras ni notación científica.";
    const number = Number(text);
    if (number < rule.min || number > rule.max!) return `Debe estar entre ${rule.min} y ${rule.max}.`;
    const decimals = text.split(".")[1]?.length ?? 0;
    if (decimals > rule.decimals!) return rule.decimals === 0 ? "Solo se permiten números enteros." : `Máximo ${rule.decimals} decimales.`;
  }
  switch (rule.format) {
    case "youtube":
      if (text !== text.trim() || !youtubeVideoId(text)) return "Usa https://www.youtube.com/watch?v=… (también embed, shorts o live), con un ID de video válido.";
      break;
    case "email": if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return "Ingresa un correo electrónico válido."; break;
    case "phone": if (!/^\+?\d{10,15}$/.test(text)) return "Usa de 10 a 15 dígitos y, opcionalmente, + al inicio."; break;
    case "slug": if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text)) return "Usa minúsculas, números y guiones, sin espacios."; break;
    case "stat": if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d{1,2})?)(?:\+|%|\s(?:m|msnm|familias|años))?$/.test(text)) return "Ingresa una cifra; puede incluir +, %, m, msnm, familias o años."; break;
    case "url":
      try { const url = new URL(text); if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error(); }
      catch { return "Ingresa una URL http:// o https:// válida."; }
  }
  return null;
}

export function imageValueError(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return "La imagen debe ser una URL o un archivo válido.";
  if (!value.startsWith("data:")) return value.startsWith("/") ?
    (value.length <= 2048 ? null : "La ruta de imagen excede 2048 caracteres.") : fieldError(value, "url");
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) return "Solo se permiten imágenes JPEG, PNG, WebP o GIF válidas.";
  const bytes = match[2].length * 3 / 4 - (match[2].endsWith("==") ? 2 : match[2].endsWith("=") ? 1 : 0);
  if (bytes > MAX_IMAGE_BYTES) return `La imagen supera ${MAX_IMAGE_MB} MB.`;
  const header = atob(match[2].slice(0, 32));
  const valid = match[1] === "image/jpeg" ? header.startsWith("\xff\xd8\xff") :
    match[1] === "image/png" ? header.startsWith("\x89PNG\r\n\x1a\n") :
    match[1] === "image/gif" ? /^GIF8[79]a/.test(header) :
    header.startsWith("RIFF") && header.slice(8, 12) === "WEBP";
  return valid ? null : "El contenido del archivo no coincide con su formato de imagen.";
}

export function imageFileError(file: Pick<File, "size" | "type">): string | null {
  if (!IMAGE_ACCEPT.split(",").includes(file.type)) return "Selecciona una imagen JPEG, PNG, WebP o GIF.";
  if (file.size === 0) return "La imagen está vacía.";
  return file.size > MAX_IMAGE_BYTES ? `La imagen debe pesar como máximo ${MAX_IMAGE_MB} MB.` : null;
}

export function validateAdminFields(root: ParentNode): boolean {
  const invalid = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-admin-field]"))
    .find((element) => !element.disabled && !element.checkValidity());
  if (!invalid) return true;
  invalid.focus();
  invalid.reportValidity();
  return false;
}

export async function adminResponseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body.error || body.message || `No se pudo guardar (HTTP ${response.status}).`;
  } catch { return `No se pudo guardar (HTTP ${response.status}).`; }
}
