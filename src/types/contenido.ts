export type TipoContenido = "video" | "texto" | "enlace" | "documento";

export interface Contenido {
  id: string;
  seccion_id: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoContenido;
  /** URL del video, enlace o documento. Vacío para contenido de tipo texto. */
  url: string | null;
  /** Cuerpo del contenido cuando el tipo es "texto". */
  cuerpo: string | null;
  orden: number;
  publicado: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Seccion {
  id: string;
  titulo: string;
  descripcion: string | null;
  orden: number;
  publicado: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface SeccionConContenidos extends Seccion {
  contenidos: Contenido[];
}

export interface SeccionInput {
  titulo: string;
  descripcion?: string | null;
  publicado?: boolean;
}

export interface ContenidoInput {
  seccion_id: string;
  titulo: string;
  descripcion?: string | null;
  tipo: TipoContenido;
  url?: string | null;
  cuerpo?: string | null;
  publicado?: boolean;
}

export const TIPOS_CONTENIDO: readonly TipoContenido[] = [
  "video",
  "texto",
  "enlace",
  "documento",
] as const;

export const ETIQUETA_TIPO: Record<TipoContenido, string> = {
  video: "Video",
  texto: "Texto",
  enlace: "Enlace",
  documento: "Documento",
};
