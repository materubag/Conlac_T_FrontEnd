import { getDb, ahora, nuevoId } from "./sqlite";

export interface RecetaEditable {
  id: string;
  slug?: string;
  titulo: string;
  descripcion_corta?: string | null;
  tipo_queso?: string | null;
  tiempo_prep?: number | null;
  porciones?: number | null;
  imagen_url?: string | null;
  gradient?: string | null;
  video_url?: string | null;
  pasos: string[];
  orden: number;
  publicado: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

export interface PaginaRecetasConfig {
  eyebrow: string;
  titulo: string;
  subtitulo: string;
}

export interface PaginaRecetasData {
  config: PaginaRecetasConfig;
  recetas: RecetaEditable[];
}

interface FilaPagina {
  slug: string;
  eyebrow: string | null;
  titulo: string;
  subtitulo: string | null;
  contenido_json?: string | null;
  actualizado_en: string;
}

interface FilaReceta {
  id: string;
  slug: string | null;
  titulo: string;
  descripcion_corta: string | null;
  tipo_queso: string | null;
  tiempo_prep: number | null;
  porciones: number | null;
  imagen_url: string | null;
  gradient: string | null;
  video_url?: string | null;
  pasos_json: string;
  orden: number;
  publicado: number;
  creado_en: string;
  actualizado_en: string;
}

function inicializarSemillas(): void {
  const db = getDb();

  // 1. Configuración de la página
  const pagina = db.prepare("SELECT * FROM paginas_editables WHERE slug = 'recetas'").get() as unknown as
    | FilaPagina
    | undefined;

  if (!pagina) {
    db.prepare(`
      INSERT INTO paginas_editables (slug, eyebrow, titulo, subtitulo, actualizado_en)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      "recetas",
      "Gastronomía Andina",
      "Recetas Tradicionales",
      "Preparaciones típicas de nuestra serranía que destacan el sabor y textura de los quesos frescos, quesillos y madurados de Pilahuín.",
      ahora()
    );
  }

  // 2. Recetas iniciales
  const totalRecetas = (db.prepare("SELECT COUNT(*) as count FROM recetas_editables").get() as { count: number }).count;

  if (totalRecetas === 0) {
    const fecha = ahora();
    const insert = db.prepare(`
      INSERT INTO recetas_editables (
        id, slug, titulo, descripcion_corta, tipo_queso, tiempo_prep, porciones,
        imagen_url, gradient, pasos_json, orden, publicado, creado_en, actualizado_en
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      "receta-locro-papa-queso",
      "locro-de-papa-andino-con-queso-fresco",
      "Locro de Papa Andino con Queso Fresco",
      "Sopa tradicional serrana espesa, servida con abundante queso fresco y aguacate.",
      "Queso Fresco El Lindero",
      45,
      4,
      "/demo/REC-locro.jpg",
      "linear-gradient(135deg,#e8c14a,#6a9a3c)",
      JSON.stringify([
        "Cocinar las papas peladas en agua con sal.",
        "Preparar el refrito con cebolla blanca picada, ajo y achiote.",
        "Triturar parte de las papas para espesar el caldo de manera natural.",
        "Añadir leche entera fresca y hervir a fuego lento.",
        "Servir humeante coronando con abundante queso fresco en cubos y aguacate.",
      ]),
      0,
      1,
      fecha,
      fecha
    );

    insert.run(
      "receta-empanadas-viento-quesillo",
      "empanadas-de-viento-con-quesillo-de-mulanleo",
      "Empanadas de Viento con Quesillo de Mulanleo",
      "Empanadas crujientes y esponjosas rellenas con queso de páramo tierno derretido.",
      "Quesillo Mulanleo",
      30,
      6,
      "/demo/REC-empanadas.jpg",
      "linear-gradient(135deg,#d9a85b,#8a6a3a)",
      JSON.stringify([
        "Amasar harina de trigo, manteca tibia y agua con sal hasta obtener una masa suave.",
        "Extender discos delgados y rellenar con rodajas generosas de quesillo fresco.",
        "Repulgar los bordes firmemente y freír en abundante aceite bien caliente.",
        "Escurrir, espolvorear azúcar granulada al gusto y servir inmediatamente.",
      ]),
      1,
      1,
      fecha,
      fecha
    );

    insert.run(
      "receta-fondue-maduro-andino",
      "tabla-fondue-rustico-de-maduro-andino",
      "Tabla & Fondue Rústico de Maduro Andino",
      "Queso madurado en cava fundido suavemente, ideal para compartir en días fríos.",
      "Queso Maduro Andino Apukanlla",
      20,
      4,
      "/demo/REC-tabla.jpg",
      "linear-gradient(135deg,#5a7a4a,#2f4a3a)",
      JSON.stringify([
        "Rallar o trocear el queso maduro andino a temperatura ambiente.",
        "Fundir suavemente en cazuela de barro con un toque de vino blanco o manzana andina.",
        "Acompañar con pan campesino de masa madre, uvas y frutos secos de la región.",
      ]),
      2,
      1,
      fecha,
      fecha
    );
  }
}

function filaAReceta(fila: FilaReceta): RecetaEditable {
  let pasos: string[] = [];
  try {
    const parsed = JSON.parse(fila.pasos_json);
    if (Array.isArray(parsed)) {
      pasos = parsed.map((p) => (typeof p === "object" && p !== null && "instruction" in p ? p.instruction : String(p)));
    }
  } catch {
    pasos = [];
  }

  return {
    id: fila.id,
    slug: fila.slug || undefined,
    titulo: fila.titulo,
    descripcion_corta: fila.descripcion_corta,
    tipo_queso: fila.tipo_queso,
    tiempo_prep: fila.tiempo_prep,
    porciones: fila.porciones,
    imagen_url: fila.imagen_url,
    gradient: fila.gradient,
    video_url: fila.video_url || null,
    pasos,
    orden: fila.orden,
    publicado: fila.publicado === 1,
    creado_en: fila.creado_en,
    actualizado_en: fila.actualizado_en,
  };
}

export function obtenerPaginaRecetas(soloPublicadas = false): PaginaRecetasData {
  const db = getDb();
  inicializarSemillas();

  const filaPagina = db.prepare("SELECT * FROM paginas_editables WHERE slug = 'recetas'").get() as unknown as
    | FilaPagina
    | undefined;

  const config: PaginaRecetasConfig = {
    eyebrow: filaPagina?.eyebrow || "Gastronomía Andina",
    titulo: filaPagina?.titulo || "Recetas Tradicionales",
    subtitulo:
      filaPagina?.subtitulo ||
      "Preparaciones típicas de nuestra serranía que destacan el sabor y textura de los quesos frescos, quesillos y madurados de Pilahuín.",
  };

  const query = `
    SELECT * FROM recetas_editables
    ${soloPublicadas ? "WHERE publicado = 1" : ""}
    ORDER BY orden ASC, creado_en ASC
  `;

  const filas = db.prepare(query).all() as unknown as FilaReceta[];
  const recetas = filas.map(filaAReceta);

  return { config, recetas };
}

export function obtenerRecetaPorIdOSlug(idOSlug: string): RecetaEditable | null {
  const db = getDb();
  inicializarSemillas();

  const fila = db
    .prepare("SELECT * FROM recetas_editables WHERE id = ? OR slug = ? LIMIT 1")
    .get(idOSlug, idOSlug) as unknown as FilaReceta | undefined;

  return fila ? filaAReceta(fila) : null;
}

export function guardarPaginaRecetas(datos: {
  config: PaginaRecetasConfig;
  recetas: RecetaEditable[];
  publicar?: boolean;
}): PaginaRecetasData {
  const db = getDb();
  inicializarSemillas();
  const fecha = ahora();

  // 1. Guardar o actualizar configuración del encabezado
  db.prepare(`
    INSERT INTO paginas_editables (slug, eyebrow, titulo, subtitulo, actualizado_en)
    VALUES ('recetas', ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      eyebrow = excluded.eyebrow,
      titulo = excluded.titulo,
      subtitulo = excluded.subtitulo,
      actualizado_en = excluded.actualizado_en
  `).run(datos.config.eyebrow, datos.config.titulo, datos.config.subtitulo, fecha);

  // 2. Sincronizar lista completa de recetas (transaccional)
  const idsRecibidos: string[] = [];

  const upsert = db.prepare(`
    INSERT INTO recetas_editables (
      id, slug, titulo, descripcion_corta, tipo_queso, tiempo_prep, porciones,
      imagen_url, gradient, video_url, pasos_json, orden, publicado, creado_en, actualizado_en
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      titulo = excluded.titulo,
      descripcion_corta = excluded.descripcion_corta,
      tipo_queso = excluded.tipo_queso,
      tiempo_prep = excluded.tiempo_prep,
      porciones = excluded.porciones,
      imagen_url = excluded.imagen_url,
      gradient = excluded.gradient,
      video_url = excluded.video_url,
      pasos_json = excluded.pasos_json,
      orden = excluded.orden,
      publicado = excluded.publicado,
      actualizado_en = excluded.actualizado_en
  `);

  datos.recetas.forEach((receta, index) => {
    const id = receta.id || nuevoId();
    idsRecibidos.push(id);

    const slug =
      receta.slug ||
      receta.titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const publicado = datos.publicar !== undefined ? (datos.publicar ? 1 : 0) : receta.publicado ? 1 : 0;

    upsert.run(
      id,
      slug,
      receta.titulo.trim() || "Nueva receta",
      receta.descripcion_corta ?? null,
      receta.tipo_queso ?? null,
      receta.tiempo_prep ?? 30,
      receta.porciones ?? 4,
      receta.imagen_url ?? null,
      receta.gradient ?? "linear-gradient(135deg,#d4a373,#8a5a3a)",
      receta.video_url ?? null,
      JSON.stringify(receta.pasos || []),
      index,
      publicado,
      receta.creado_en || fecha,
      fecha
    );
  });

  // Eliminar recetas que hayan sido retiradas
  if (idsRecibidos.length > 0) {
    const placeholders = idsRecibidos.map(() => "?").join(",");
    db.prepare(`DELETE FROM recetas_editables WHERE id NOT IN (${placeholders})`).run(...idsRecibidos);
  } else {
    db.prepare("DELETE FROM recetas_editables").run();
  }

  return obtenerPaginaRecetas(false);
}
