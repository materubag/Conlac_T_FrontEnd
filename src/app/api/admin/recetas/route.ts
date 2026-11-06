import { backendProxy } from "@/lib/backendProxy";
import { normalizeRecipe } from "@/lib/db/recetasRepo";
export async function GET(request: Request) { return backendProxy(request, "/admin/recetas"); }
export async function POST(request: Request) {
  const { config, recetas, publicar, eliminadas } = await request.json();
  if (!Array.isArray(recetas)) return Response.json({ error: "Lista de recetas obligatoria" }, { status: 400 });
  const response = await backendProxy(request, "/admin/recetas/sync", "POST", {
    recetas: recetas.map((r, i) => ({ ...r, orden: i, publicado: publicar ?? r.publicado,
      slug: r.slug || r.titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") })), eliminadas,
  });
  if (!response.ok) return response;
  const saved = (await response.json()).map(normalizeRecipe);
  const page = await backendProxy(request, "/admin/paginas/recetas", "POST", { ...config, contenido: {} });
  if (!page.ok) return page;
  return Response.json({ success: true, data: { config, recetas: saved } });
}
