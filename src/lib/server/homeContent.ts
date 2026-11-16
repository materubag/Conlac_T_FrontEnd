import { siteConfig } from "@/lib/config";
import { leerPaginaConfig } from "@/lib/db/paginasRepo";
import { listarRecetasExistentes } from "@/lib/db/recetasRepo";
import type { HomeAccessCard, HomeTestimonial } from "@/types/home";

interface AssociationPreview { nombre?: string; name?: string; foto_url?: string | null; fotos?: string[]; is_published?: boolean }
interface RecipePreview { imagen_url?: string | null; is_published?: boolean; publicado?: boolean }
interface TourismPreview { foto_url?: string | null; is_published?: boolean }
interface TestimonialPreview { id?: string; quote?: string; frase?: string; name?: string; autor_nombre?: string; role?: string; autor_tipo?: string; calificacion?: number; is_published?: boolean }

async function fetchList<T>(endpoint: string): Promise<T[]> {
  try {
    const response = await fetch(`${siteConfig.backendUrl}/${endpoint}`, {
      cache: "no-store", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

export async function getHomeAccessCards(): Promise<HomeAccessCard[]> {
  const associationsPage = leerPaginaConfig<{ asociaciones?: AssociationPreview[] }>("asociaciones");
  const recipesPage = leerPaginaConfig("recetas");
  const tourismPage = leerPaginaConfig<{ atractivos?: TourismPreview[] }>("turismo");
  const existingRecipes = listarRecetasExistentes(true);
  const [associations, recipes, attractions] = await Promise.all([
    Array.isArray(associationsPage?.contenido?.asociaciones) ? Promise.resolve(associationsPage.contenido.asociaciones) : fetchList<AssociationPreview>("asociaciones"),
    recipesPage || existingRecipes.length ? Promise.resolve(existingRecipes) : fetchList<RecipePreview>("recetas"),
    Array.isArray(tourismPage?.contenido?.atractivos) ? Promise.resolve(tourismPage.contenido.atractivos) : fetchList<TourismPreview>("turismo"),
  ]);
  const publicAssociations = associations.filter((item) => item.is_published !== false);
  const publicRecipes = recipes.filter((item) => !("is_published" in item && item.is_published === false) && !("publicado" in item && item.publicado === false));
  const publicAttractions = attractions.filter((item) => item.is_published !== false);
  return [
    { key: "asociaciones", href: "/asociaciones", title: associationsPage?.titulo || "Asociaciones Productoras", eyebrow: associationsPage?.eyebrow || "Nuestra gente", description: associationsPage?.subtitulo || "", image: publicAssociations.map((item) => item.foto_url || item.fotos?.[0]).find(Boolean) || null, count: publicAssociations.length },
    { key: "recetas", href: "/recetas", title: recipesPage?.titulo || "Recetas Tradicionales", eyebrow: recipesPage?.eyebrow || "Gastronomía andina", description: recipesPage?.subtitulo || "", image: publicRecipes.map((item) => item.imagen_url).find(Boolean) || null, count: publicRecipes.length },
    { key: "turismo", href: "/turismo", title: tourismPage?.titulo || "Turismo Comunitario", eyebrow: tourismPage?.eyebrow || "Nuestro territorio", description: tourismPage?.subtitulo || "", image: publicAttractions.map((item) => item.foto_url).find(Boolean) || null, count: publicAttractions.length },
  ];
}

export async function getHomeTestimonials(): Promise<HomeTestimonial[]> {
  const page = leerPaginaConfig<{ testimonials?: TestimonialPreview[] }>("nosotros");
  const source = Array.isArray(page?.contenido?.testimonials) ? page.contenido.testimonials : await fetchList<TestimonialPreview>("testimonios");
  return source.filter((item) => item.is_published !== false && (item.quote || item.frase)?.trim())
    .map((item, index) => ({ id: item.id || `testimonio-${index}`, quote: item.quote || item.frase || "", name: item.name || item.autor_nombre || "", role: item.role || item.autor_tipo || "", rating: item.calificacion }));
}
