import { siteConfig } from "@/lib/config";
import { obtenerPaginaConfig } from "./paginasRepo";
export interface RecetaEditable {
  id: string;
  slug?: string;
  titulo: string;
  descripcion_corta?: string | null;
  tipo_queso?: string | null;
  tiempo_prep?: number | null;
  porciones?: number | null;
  imagen_url?: string | null;
  gradient?: string | null;
  video_url?: string | null;
  ingredientes?: Record<string, unknown>[];
  pasos: string[];
  orden: number;
  publicado: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface PaginaRecetasConfig {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
}

export interface PaginaRecetasData {
  config: PaginaRecetasConfig;
  recetas: RecetaEditable[];
}

export function normalizeRecipe(r: RecetaEditable & { tiempo_preparacion_minutos?: number; is_published?: boolean; pasos: unknown[] }): RecetaEditable {
  return { ...r, tiempo_prep: r.tiempo_preparacion_minutos ?? r.tiempo_prep,
    publicado: r.is_published ?? r.publicado,
    pasos: (r.pasos || []).map(p => typeof p === "string" ? p : String((p as { instruction?: string }).instruction || "")) };
}
export async function obtenerPaginaRecetas(): Promise<PaginaRecetasData> {
  const config = await obtenerPaginaConfig("recetas", { eyebrow: "Gastronomía Andina", titulo: "Recetas Tradicionales", subtitulo: "Preparaciones tradicionales con quesos de Pilahuín.", contenido: {} });
  const response = await fetch(`${siteConfig.backendUrl}/recetas`, { cache: "no-store" });
  if (!response.ok) throw new Error("No se pudieron cargar las recetas");
  const recetas = (await response.json()).map(normalizeRecipe).sort((a: RecetaEditable,b: RecetaEditable) => (a.orden || 0)-(b.orden || 0));
  return { config, recetas };
}
