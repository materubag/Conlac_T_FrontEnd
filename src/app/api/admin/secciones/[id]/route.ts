import { NextResponse } from "next/server";
import { actualizarSeccion, eliminarSeccion, moverSeccion } from "@/lib/db/contenidoRepo";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let cuerpo: {
    titulo?: unknown;
    descripcion?: unknown;
    publicado?: unknown;
    mover?: unknown;
  };

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  // Reordenamiento: se maneja aquí para no multiplicar rutas.
  if (cuerpo.mover === "arriba" || cuerpo.mover === "abajo") {
    if (!moverSeccion(id, cuerpo.mover)) {
      return NextResponse.json(
        { error: "No se pudo mover la sección (no existe o ya está en el extremo)." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (cuerpo.titulo !== undefined) {
    const titulo = typeof cuerpo.titulo === "string" ? cuerpo.titulo.trim() : "";
    if (titulo.length < 3) {
      return NextResponse.json(
        { error: "El título de la sección debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }
  }

  const seccion = actualizarSeccion(id, {
    titulo: typeof cuerpo.titulo === "string" ? cuerpo.titulo.trim() : undefined,
    descripcion:
      cuerpo.descripcion === undefined
        ? undefined
        : typeof cuerpo.descripcion === "string"
          ? cuerpo.descripcion.trim() || null
          : null,
    publicado: typeof cuerpo.publicado === "boolean" ? cuerpo.publicado : undefined,
  });

  if (!seccion) {
    return NextResponse.json({ error: "Sección no encontrada." }, { status: 404 });
  }

  return NextResponse.json(seccion);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!eliminarSeccion(id)) {
    return NextResponse.json({ error: "Sección no encontrada." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
