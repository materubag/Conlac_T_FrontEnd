import { getDb } from "./sqlite";
import { guardarPaginaConfig, leerPaginaConfig, type PaginaEditableConfig } from "./paginasRepo";
import { nosotrosDefaults } from "@/lib/nosotrosDefaults";
import type { NosotrosContenido } from "@/components/paginas/NosotrosManager";
import type { HomeContent, HomeTestimonial } from "@/types/home";

export function guardarInicio(datos: Pick<PaginaEditableConfig<HomeContent>, "eyebrow" | "titulo" | "subtitulo" | "contenido">, testimonios?: HomeTestimonial[]) {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const guardada = guardarPaginaConfig("home", datos);
    if (testimonios !== undefined) {
      const nosotros = leerPaginaConfig<NosotrosContenido>("nosotros") ?? nosotrosDefaults;
      guardarPaginaConfig("nosotros", {
        eyebrow: nosotros.eyebrow, titulo: nosotros.titulo, subtitulo: nosotros.subtitulo,
        contenido: { ...nosotros.contenido, testimonials: testimonios.map((item) => ({
          id: item.id, quote: item.quote, name: item.name, role: item.role,
          ...(item.rating !== undefined ? { calificacion: item.rating } : {}),
        })) },
      });
    }
    db.exec("COMMIT");
    return guardada;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
