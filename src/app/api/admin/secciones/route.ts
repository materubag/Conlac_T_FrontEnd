import { NextResponse } from "next/server";
import { crearSeccion, listarSecciones } from "@/lib/db/contenidoRepo";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(listarSecciones());
}

export async function POST(request: Request) {
  let cuerpo: { titulo?: unknown; descripcion?: unknown; publicado?: unknown };

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  const titulo = typeof cuerpo.titulo === "string" ? cuerpo.titulo.trim() : "";
  if (titulo.length < 3) {
    return NextResponse.json(
      { error: "El título de la sección debe tener al menos 3 caracteres." },
      { status: 400 }
    );
  }

  const seccion = crearSeccion({
    titulo,
    descripcion: typeof cuerpo.descripcion === "string" ? cuerpo.descripcion.trim() || null : null,
    publicado: cuerpo.publicado === true,
  });

  return NextResponse.json(seccion, { status: 201 });
}
