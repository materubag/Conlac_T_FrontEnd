import { fieldError, imageValueError, getAdminRule, type AdminFieldRule } from "./adminValidation";

type Schema = AdminFieldRule | { rule: AdminFieldRule; optional: true } | { image: true } |
  { array: Schema } | { fields: Record<string, Schema> } | { boolean: true };
const object = (fields: Record<string, Schema>): Schema => ({ fields });
const array = (schema: Schema): Schema => ({ array: schema });
const optional = (rule: AdminFieldRule): Schema => ({ rule, optional: true });
const image: Schema = { image: true };
const header = { eyebrow: "short", titulo: "title", subtitulo: "subtitle" } satisfies Record<string, Schema>;
const videos = array(object({ titulo: "title", descripcion: "description", url: "youtube" }));

function validate(value: unknown, schema: Schema, path = "Datos"): string | null {
  if (typeof schema !== "string" && "boolean" in schema) return value === undefined || typeof value === "boolean" ? null : `${path}: debe ser verdadero o falso.`;
  if (typeof schema === "string" || "rule" in schema) {
    const rule = typeof schema === "string" ? schema : schema.rule;
    const isOptional = typeof schema !== "string" && schema.optional;
    const limits = getAdminRule(rule);
    if (value !== undefined && value !== null && limits.min === undefined && typeof value !== "string") return `${path}: debe ser texto.`;
    if (value !== undefined && value !== null && limits.min !== undefined &&
      rule !== "stepNumber" && typeof value !== "number") return `${path}: debe ser un número.`;
    const error = fieldError(value, rule, isOptional);
    return error ? `${path}: ${error}` : null;
  }
  if ("image" in schema) {
    const error = imageValueError(value);
    return error ? `${path}: ${error}` : null;
  }
  if (value === undefined || value === null) return null;
  if ("array" in schema) {
    if (!Array.isArray(value)) return `${path}: se esperaba una lista.`;
    for (let index = 0; index < value.length; index++) {
      if (value[index] === null || value[index] === undefined) return `${path}[${index + 1}]: no puede ser nulo.`;
      const error = validate(value[index], schema.array, `${path}[${index + 1}]`);
      if (error) return error;
    }
  } else {
    if (typeof value !== "object" || Array.isArray(value)) return `${path}: formato inválido.`;
    const record = value as Record<string, unknown>;
    for (const [key, child] of Object.entries(schema.fields)) {
      const error = validate(record[key], child, `${path}.${key}`);
      if (error) return error;
    }
  }
  return null;
}

const pageSchemas: Record<string, Schema> = {
  home: object({
    hidden_sections: object({ hero: { boolean: true }, products: { boolean: true }, trust: { boolean: true }, access: { boolean: true }, testimonials: { boolean: true } }),
    hero_accent: "title", hero_primary_label: "short", hero_whatsapp_label: "short", hero_whatsapp_message: "description", hero_claims: array("short"),
    products: object({ eyebrow: "short", title: "title", description: "subtitle", link_label: "short", empty: "subtitle" }),
    trust: object({ eyebrow: "short", title: "title", description: "subtitle", pillars: array(object({ title: "title", description: "description" })) }),
    access: object({ eyebrow: "short", title: "title", description: "subtitle", link_label: "short" }),
    testimonials: object({ eyebrow: "short", title: "title", description: "subtitle", empty: "subtitle" }),
  }),
  tienda: object({ productos: array(object({
    nombre: "title", tipo_queso: "short", peso: "short", asociacion: optional("title"),
    precio: "price", stock: "stock", fotos: array(image),
  })) }),
  asociaciones: object({ asociaciones: array(object({
    nombre: "title", descripcion: "description", parroquia: "short", miembros: "members", foto_url: image,
  })) }),
  turismo: object({ atractivos: array(object({
    nombre: "title", descripcion: "description", duracion: "short", dificultad: "short", video_url: "youtube", foto_url: image,
  })) }),
  nosotros: object({
    historia_titulo: "title", historia_p1: "longText", historia_p2: "longText",
    leche_altura_titulo: "short", leche_altura_subtitulo: "subtitle", testimonios_eyebrow: "short", testimonios_titulo: optional("title"),
    stats: array(object({ value: "statistic", label: "short", sublabel: "detail" })),
    testimonials: array(object({ quote: "description", name: "title", role: "detail" })),
  }),
  "como-comprar": object({
    steps: array(object({ number: "stepNumber", title: "title", description: "description" })),
    cta_titulo: "title", cta_subtitulo: "subtitle",
  }),
  contacto: object({
    whatsapp_titulo: "title", whatsapp_descripcion: "description", whatsapp_mensaje: "description",
    ubicacion_titulo: "title", ubicacion_direccion: "address", ubicacion_horario: "schedule",
    email_titulo: "title", email_descripcion: "description", email_direccion: "email",
  }),
  footer: object({
    subtitulo: "title", descripcion: "description", direccion: "address", metodos_titulo: "title",
    metodo1: "detail", metodo2: "detail", metodo3: "detail", garantia: "detail", copyright: "detail",
  }),
};
const association = object({
  nombre: "title", historia: "longText", ubicacion_referencia: "address", video_url: "youtube",
  lat: optional("latitude"), lng: optional("longitude"), fotos: array(image),
  campos_ficha: array(object({ label: "short", value: "detail" })),
});

export function validatePagePayload(slug: string, value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Formato de página inválido.";
  const content = slug.startsWith("asoc-") ? association : pageSchemas[slug];
  const error = validate(value, object({ ...header, contenido: content ?? object({ videos }) }));
  if (error) return error;
  if (slug === "home" && "testimonios" in value) {
    const items = (value as { testimonios?: unknown }).testimonios;
    const testimonialError = validate(items, array(object({ quote: "description", name: "title", role: "detail" })), "Testimonios");
    if (testimonialError) return testimonialError;
    if (!Array.isArray(items)) return "Los testimonios deben ser una lista.";
    for (let index = 0; index < items.length; index++) {
      if (typeof items[index].quote !== "string" || !items[index].quote.trim()) return `Testimonio ${index + 1}: el texto es obligatorio.`;
      if (items[index].rating !== undefined && (!Number.isInteger(items[index].rating) || items[index].rating < 1 || items[index].rating > 5)) return `Testimonio ${index + 1}: la calificación debe estar entre 1 y 5.`;
    }
  }
  // Secciones multimedia opcionales compartidas por los gestores.
  return validate((value as { contenido?: { videos?: unknown } }).contenido?.videos, videos, "Videos");
}

export function validateRecipesPayload(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Formato de recetas inválido.";
  return validate(value, object({
    config: object(header),
    recetas: array(object({
      titulo: "title", descripcion_corta: "subtitle", tipo_queso: "short", tiempo_prep: optional("minutes"),
      porciones: optional("servings"), imagen_url: image, video_url: "youtube", pasos: array("step"),
    })),
  }));
}

export function validateContentPayload(value: unknown, section = false): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "Formato de contenido inválido.";
  const error = validate(value, object({ titulo: "title", descripcion: "detail", cuerpo: "longText" }));
  if (error || section || !value || typeof value !== "object") return error;
  const record = value as Record<string, unknown>;
  if (record.tipo === "texto") return typeof record.cuerpo === "string" && record.cuerpo.trim()
    ? null : "El contenido de texto necesita un cuerpo.";
  if (typeof record.url !== "string" || !record.url.trim()) return "Este contenido necesita una URL.";
  return validate(record.url, record.tipo === "video" ? "youtube" : "url", "URL");
}
