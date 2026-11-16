import { contentPermission } from "@/lib/server/contentPermission";
import { NextRequest, NextResponse } from "next/server";
import { guardarPaginaConfig, obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import { validatePagePayload } from "@/lib/adminPayloadValidation";
import { guardarInicio } from "@/lib/db/homeRepo";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = await params;
    const data = obtenerPaginaConfig(slug, {
      eyebrow: "",
      titulo: "",
      subtitulo: "",
      contenido: {},
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/paginas] Error al obtener página:", error);
    return NextResponse.json(
      { error: "Error interno al leer la configuración de la página" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  const denied = contentPermission(request);
  if (denied) return denied;

  try {
    const { slug } = await params;
    const body = await request.json();
    const validationError = validatePagePayload(slug, body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    if (!body || typeof body.titulo !== "string") {
      return NextResponse.json(
        { error: "El título de la página es obligatorio" },
        { status: 400 }
      );
    }

    const datos = {
      eyebrow: body.eyebrow || "",
      titulo: body.titulo,
      subtitulo: body.subtitulo || "",
      contenido: body.contenido || {},
    };
    const guardada = slug === "home" ? guardarInicio(datos, body.testimonios) : guardarPaginaConfig(slug, datos);

    return NextResponse.json({
      ok: true,
      data: guardada,
      mensaje: "Página guardada exitosamente en SQLite",
    });
  } catch (error) {
    console.error("[api/admin/paginas] Error al guardar página:", error);
    return NextResponse.json(
      { error: "Error interno al guardar la página" },
      { status: 500 }
    );
  }
}
