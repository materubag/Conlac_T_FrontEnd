import { NextResponse } from "next/server";
import { obtenerPaginaRecetas, guardarPaginaRecetas, RecetaEditable } from "@/lib/db/recetasRepo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const soloPublicadas = searchParams.get("publico") === "true";
    const data = obtenerPaginaRecetas(soloPublicadas);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al obtener las recetas";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Formato de datos no válido." }, { status: 400 });
    }

    const { config, recetas, publicar } = body;

    const safeConfig = {
      eyebrow: typeof config?.eyebrow === "string" ? config.eyebrow.trim() : "Gastronomía Andina",
      titulo: typeof config?.titulo === "string" && config.titulo.trim() ? config.titulo.trim() : "Recetas Tradicionales",
      subtitulo: typeof config?.subtitulo === "string" ? config.subtitulo.trim() : "",
    };

    const safeRecetas: RecetaEditable[] = Array.isArray(recetas)
      ? recetas.map((r, i) => ({
          id: typeof r.id === "string" && r.id ? r.id : `receta-${Date.now()}-${i}`,
          slug: typeof r.slug === "string" ? r.slug : undefined,
          titulo: typeof r.titulo === "string" && r.titulo.trim() ? r.titulo.trim() : "Nueva receta",
          descripcion_corta: typeof r.descripcion_corta === "string" ? r.descripcion_corta : null,
          tipo_queso: typeof r.tipo_queso === "string" ? r.tipo_queso : null,
          tiempo_prep: typeof r.tiempo_prep === "number" ? r.tiempo_prep : 30,
          porciones: typeof r.porciones === "number" ? r.porciones : 4,
          imagen_url: typeof r.imagen_url === "string" ? r.imagen_url : null,
          gradient: typeof r.gradient === "string" ? r.gradient : "linear-gradient(135deg,#d4a373,#8a5a3a)",
          video_url: typeof r.video_url === "string" ? r.video_url : null,
          pasos: Array.isArray(r.pasos) ? r.pasos.map((p: unknown) => String(p)).filter(Boolean) : [],
          orden: typeof r.orden === "number" ? r.orden : i,
          publicado: r.publicado !== false,
          creado_en: r.creado_en,
          actualizado_en: r.actualizado_en,
        }))
      : [];

    const resultado = guardarPaginaRecetas({
      config: safeConfig,
      recetas: safeRecetas,
      publicar: Boolean(publicar),
    });

    return NextResponse.json({ success: true, data: resultado });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error al guardar los cambios en recetas";
    console.error("[api/admin/recetas] Error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

