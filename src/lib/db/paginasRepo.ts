import { siteConfig } from "@/lib/config";
export interface PaginaEditableConfig<T = Record<string, unknown>> {
  slug: string; eyebrow: string; titulo: string; subtitulo: string; contenido: T; actualizado_en?: string;
}
export async function obtenerPaginaConfig<T = Record<string, unknown>>(
  slug: string, defaults: Omit<PaginaEditableConfig<T>, "slug">
): Promise<PaginaEditableConfig<T>> {
  const response = await fetch(`${siteConfig.backendUrl}/paginas/${encodeURIComponent(slug)}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (response.status === 404) return { slug, ...defaults };
  if (!response.ok) throw new Error("No se pudo cargar la configuración institucional");
  const page = await response.json();
  return { ...defaults, ...page, contenido: { ...defaults.contenido, ...page.contenido } };
}
