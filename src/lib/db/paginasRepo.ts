import { getDb, ahora } from "./sqlite";

export interface PaginaEditableConfig<T = Record<string, unknown>> {
  slug: string;
  eyebrow: string;
  titulo: string;
  subtitulo: string;
  contenido: T;
  actualizado_en?: string;
}

interface FilaPagina {
  slug: string;
  eyebrow: string | null;
  titulo: string;
  subtitulo: string | null;
  contenido_json: string | null;
  actualizado_en: string;
}

export function obtenerPaginaConfig<T = Record<string, unknown>>(
  slug: string,
  defaults: { eyebrow: string; titulo: string; subtitulo: string; contenido: T }
): PaginaEditableConfig<T> {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM paginas_editables WHERE slug = ?");
  const fila = stmt.get(slug) as unknown as FilaPagina | undefined;

  if (!fila) {
    const insert = db.prepare(`
      INSERT INTO paginas_editables (slug, eyebrow, titulo, subtitulo, contenido_json, actualizado_en)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const ahoraIso = ahora();
    insert.run(
      slug,
      defaults.eyebrow,
      defaults.titulo,
      defaults.subtitulo,
      JSON.stringify(defaults.contenido),
      ahoraIso
    );
    return {
      slug,
      eyebrow: defaults.eyebrow,
      titulo: defaults.titulo,
      subtitulo: defaults.subtitulo,
      contenido: defaults.contenido,
      actualizado_en: ahoraIso,
    };
  }

  let parsedContenido = defaults.contenido;
  if (fila.contenido_json) {
    try {
      parsedContenido = JSON.parse(fila.contenido_json);
    } catch {
      parsedContenido = defaults.contenido;
    }
  }

  return {
    slug: fila.slug,
    eyebrow: fila.eyebrow ?? defaults.eyebrow,
    titulo: fila.titulo ?? defaults.titulo,
    subtitulo: fila.subtitulo ?? defaults.subtitulo,
    contenido: parsedContenido,
    actualizado_en: fila.actualizado_en,
  };
}

export function guardarPaginaConfig<T = Record<string, unknown>>(
  slug: string,
  data: { eyebrow: string; titulo: string; subtitulo: string; contenido: T }
): PaginaEditableConfig<T> {
  const db = getDb();
  const ahoraIso = ahora();

  const stmt = db.prepare(`
    INSERT INTO paginas_editables (slug, eyebrow, titulo, subtitulo, contenido_json, actualizado_en)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      eyebrow = excluded.eyebrow,
      titulo = excluded.titulo,
      subtitulo = excluded.subtitulo,
      contenido_json = excluded.contenido_json,
      actualizado_en = excluded.actualizado_en
  `);

  stmt.run(
    slug,
    data.eyebrow,
    data.titulo,
    data.subtitulo,
    JSON.stringify(data.contenido),
    ahoraIso
  );

  return {
    slug,
    eyebrow: data.eyebrow,
    titulo: data.titulo,
    subtitulo: data.subtitulo,
    contenido: data.contenido,
    actualizado_en: ahoraIso,
  };
}

