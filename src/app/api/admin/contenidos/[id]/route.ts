import { NextResponse } from "next/server";
import { actualizarContenido, eliminarContenido, moverContenido } from "@/lib/db/contenidoRepo";
import { TIPOS_CONTENIDO, type TipoContenido } from "@/types/contenido";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

  let cuerpo: Record<string, unknown>;

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  // Reordenamiento dentro de la sección.
  if (cuerpo.mover === "arriba" || cuerpo.mover === "abajo") {
    if (!moverContenido(id, cuerpo.mover)) {
      return NextResponse.json(
        { error: "No se pudo mover el contenido (no existe o ya está en el extremo)." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (cuerpo.titulo !== undefined) {
    const titulo = typeof cuerpo.titulo === "string" ? cuerpo.titulo.trim() : "";
    if (titulo.length < 3) {
      return NextResponse.json(
        { error: "El título debe tener al menos 3 caracteres." },
        { status: 400 }
      );
    }
  }

  if (cuerpo.tipo !== undefined && !TIPOS_CONTENIDO.includes(cuerpo.tipo as TipoContenido)) {
    return NextResponse.json(
      { error: `Tipo inválido. Valores permitidos: ${TIPOS_CONTENIDO.join(", ")}.` },
      { status: 400 }
    );
  }

  const contenido = actualizarContenido(id, {
    titulo: typeof cuerpo.titulo === "string" ? cuerpo.titulo.trim() : undefined,
    descripcion:
      cuerpo.descripcion === undefined
        ? undefined
        : typeof cuerpo.descripcion === "string"
          ? cuerpo.descripcion.trim() || null
          : null,
    tipo: cuerpo.tipo === undefined ? undefined : (cuerpo.tipo as TipoContenido),
    url:
      cuerpo.url === undefined
        ? undefined
        : typeof cuerpo.url === "string"
          ? cuerpo.url.trim() || null
          : null,
    cuerpo:
      cuerpo.cuerpo === undefined
        ? undefined
        : typeof cuerpo.cuerpo === "string"
          ? cuerpo.cuerpo.trim() || null
          : null,
    publicado: typeof cuerpo.publicado === "boolean" ? cuerpo.publicado : undefined,
  });

  if (!contenido) {
    return NextResponse.json({ error: "Contenido no encontrado." }, { status: 404 });
  }

  return NextResponse.json(contenido);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  if (!eliminarContenido(id)) {
    return NextResponse.json({ error: "Contenido no encontrado." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
