import { NextRequest, NextResponse } from "next/server";
import { guardarPaginaConfig, obtenerPaginaConfig } from "@/lib/db/paginasRepo";

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
  try {
    const { slug } = await params;
    const body = await request.json();

    if (!body || typeof body.titulo !== "string") {
      return NextResponse.json(
        { error: "El título de la página es obligatorio" },
        { status: 400 }
      );
    }

    const guardada = guardarPaginaConfig(slug, {
      eyebrow: body.eyebrow || "",
      titulo: body.titulo,
      subtitulo: body.subtitulo || "",
      contenido: body.contenido || {},
    });

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

