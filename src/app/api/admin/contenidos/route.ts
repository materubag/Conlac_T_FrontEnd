import { NextResponse } from "next/server";
import { crearContenido } from "@/lib/db/contenidoRepo";
import { TIPOS_CONTENIDO, type TipoContenido } from "@/types/contenido";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let cuerpo: Record<string, unknown>;

  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  const seccionId = typeof cuerpo.seccion_id === "string" ? cuerpo.seccion_id : "";
  if (!seccionId) {
    return NextResponse.json({ error: "Falta la sección a la que pertenece." }, { status: 400 });
  }

  const titulo = typeof cuerpo.titulo === "string" ? cuerpo.titulo.trim() : "";
  if (titulo.length < 3) {
    return NextResponse.json(
      { error: "El título debe tener al menos 3 caracteres." },
      { status: 400 }
    );
  }

  const tipo = cuerpo.tipo as TipoContenido;
  if (!TIPOS_CONTENIDO.includes(tipo)) {
    return NextResponse.json(
      { error: `Tipo inválido. Valores permitidos: ${TIPOS_CONTENIDO.join(", ")}.` },
      { status: 400 }
    );
  }

  const url = typeof cuerpo.url === "string" ? cuerpo.url.trim() : "";
  const cuerpoTexto = typeof cuerpo.cuerpo === "string" ? cuerpo.cuerpo.trim() : "";

  // Video, enlace y documento necesitan una URL; el texto necesita cuerpo.
  if (tipo === "texto") {
    if (!cuerpoTexto) {
      return NextResponse.json(
        { error: "El contenido de tipo texto necesita un cuerpo." },
        { status: 400 }
      );
    }
  } else if (!url) {
    return NextResponse.json({ error: "Este tipo de contenido necesita una URL." }, { status: 400 });
  }

  const contenido = crearContenido({
    seccion_id: seccionId,
    titulo,
    descripcion: typeof cuerpo.descripcion === "string" ? cuerpo.descripcion.trim() || null : null,
    tipo,
    url: url || null,
    cuerpo: cuerpoTexto || null,
    publicado: cuerpo.publicado === true,
  });

  if (!contenido) {
    return NextResponse.json({ error: "La sección indicada no existe." }, { status: 404 });
  }

  return NextResponse.json(contenido, { status: 201 });
}
