import { contentPermission } from "@/lib/server/contentPermission";
import { NextRequest, NextResponse } from "next/server";
import { guardarPaginaConfig, obtenerPaginaConfig, leerPaginaConfig } from "@/lib/db/paginasRepo";
import { getDb } from "@/lib/db/sqlite";
import { AuthError } from "@/lib/server/sqliteAuth";
import { authError } from "@/lib/server/authHttp";
import { validatePagePayload } from "@/lib/adminPayloadValidation";
import { guardarInicio } from "@/lib/db/homeRepo";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

function guardarCatalogo(datos: Parameters<typeof guardarPaginaConfig>[1], revision: unknown) {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const current = leerPaginaConfig("tienda");
    if ((current && revision !== current.actualizado_en) || (!current && revision)) {
      throw new AuthError("El catálogo cambió por una compra u otra edición. Recarga la tienda antes de guardar para conservar el stock actual.", 409);
    }
    const saved = guardarPaginaConfig("tienda", datos);
    db.exec("COMMIT");
    return saved;
  } catch (error) { db.exec("ROLLBACK"); throw error; }
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
    if (slug === "tienda") {
      const products = body.contenido?.productos;
      if (!Array.isArray(products) || products.some(product => !product || typeof product.id !== "string" || !product.id.trim() || product.id.length > 150) ||
        new Set(products.map(product => product.id)).size !== products.length) {
        return NextResponse.json({ error: "El catálogo debe tener una lista de productos con identificadores únicos y válidos." }, { status: 400 });
      }
    }

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
    const guardada = slug === "home" ? guardarInicio(datos, body.testimonios) :
      slug === "tienda" ? guardarCatalogo(datos, body.actualizado_en) : guardarPaginaConfig(slug, datos);

    return NextResponse.json({
      ok: true,
      data: guardada,
      mensaje: "Página guardada exitosamente en SQLite",
    });
  } catch (error) {
    if (error instanceof AuthError) return authError(error);
    console.error("[api/admin/paginas] Error al guardar página:", error);
    return NextResponse.json(
      { error: "Error interno al guardar la página" },
      { status: 500 }
    );
  }
}
