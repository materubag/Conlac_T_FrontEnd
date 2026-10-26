import { getDb, ahora, nuevoId } from "./sqlite";
import type {
  Contenido,
  ContenidoInput,
  Seccion,
  SeccionConContenidos,
  SeccionInput,
} from "@/types/contenido";

// SQLite guarda los booleanos como 0/1; estas funciones traducen las filas
// crudas a los tipos del dominio para que el resto de la app no lo note.

type FilaSeccion = Omit<Seccion, "publicado"> & { publicado: number };
type FilaContenido = Omit<Contenido, "publicado"> & { publicado: number };

function aSeccion(fila: FilaSeccion): Seccion {
  return { ...fila, publicado: fila.publicado === 1 };
}

function aContenido(fila: FilaContenido): Contenido {
  return { ...fila, publicado: fila.publicado === 1 };
}

function siguienteOrden(tabla: "secciones" | "contenidos", seccionId?: string): number {
  const db = getDb();
  const fila = seccionId
    ? (db
        .prepare(`SELECT COALESCE(MAX(orden), -1) AS max FROM ${tabla} WHERE seccion_id = ?`)
        .get(seccionId) as { max: number } | undefined)
    : (db.prepare(`SELECT COALESCE(MAX(orden), -1) AS max FROM ${tabla}`).get() as
        | { max: number }
        | undefined);
  return (fila?.max ?? -1) + 1;
}

// ----------------------------------------------------------------------------
// Secciones
// ----------------------------------------------------------------------------

export function listarSecciones(soloPublicadas = false): SeccionConContenidos[] {
  const db = getDb();

  const secciones = db
    .prepare(
      `SELECT * FROM secciones ${soloPublicadas ? "WHERE publicado = 1" : ""} ORDER BY orden ASC, creado_en ASC`
    )
    .all() as FilaSeccion[];

  const contenidos = db
    .prepare(
      `SELECT * FROM contenidos ${soloPublicadas ? "WHERE publicado = 1" : ""} ORDER BY orden ASC, creado_en ASC`
    )
    .all() as FilaContenido[];

  return secciones.map((fila) => ({
    ...aSeccion(fila),
    contenidos: contenidos.filter((c) => c.seccion_id === fila.id).map(aContenido),
  }));
}

export function obtenerSeccion(id: string): Seccion | null {
  const fila = getDb().prepare("SELECT * FROM secciones WHERE id = ?").get(id) as
    | FilaSeccion
    | undefined;
  return fila ? aSeccion(fila) : null;
}

export function crearSeccion(datos: SeccionInput): Seccion {
  const db = getDb();
  const id = nuevoId();
  const fecha = ahora();

  db.prepare(
    `INSERT INTO secciones (id, titulo, descripcion, orden, publicado, creado_en, actualizado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    datos.titulo,
    datos.descripcion ?? null,
    siguienteOrden("secciones"),
    datos.publicado ? 1 : 0,
    fecha,
    fecha
  );

  return obtenerSeccion(id)!;
}

export function actualizarSeccion(id: string, datos: Partial<SeccionInput>): Seccion | null {
  const actual = obtenerSeccion(id);
  if (!actual) return null;

  getDb()
    .prepare(
      `UPDATE secciones SET titulo = ?, descripcion = ?, publicado = ?, actualizado_en = ? WHERE id = ?`
    )
    .run(
      datos.titulo ?? actual.titulo,
      datos.descripcion !== undefined ? datos.descripcion : actual.descripcion,
      (datos.publicado !== undefined ? datos.publicado : actual.publicado) ? 1 : 0,
      ahora(),
      id
    );

  return obtenerSeccion(id);
}

export function eliminarSeccion(id: string): boolean {
  // Los contenidos caen por ON DELETE CASCADE.
  return getDb().prepare("DELETE FROM secciones WHERE id = ?").run(id).changes > 0;
}

export function moverSeccion(id: string, direccion: "arriba" | "abajo"): boolean {
  const db = getDb();
  const actual = db.prepare("SELECT id, orden FROM secciones WHERE id = ?").get(id) as
    | { id: string; orden: number }
    | undefined;
  if (!actual) return false;

  const vecina = db
    .prepare(
      direccion === "arriba"
        ? "SELECT id, orden FROM secciones WHERE orden < ? ORDER BY orden DESC LIMIT 1"
        : "SELECT id, orden FROM secciones WHERE orden > ? ORDER BY orden ASC LIMIT 1"
    )
    .get(actual.orden) as { id: string; orden: number } | undefined;
  if (!vecina) return false;

  const fecha = ahora();
  db.prepare("UPDATE secciones SET orden = ?, actualizado_en = ? WHERE id = ?").run(
    vecina.orden,
    fecha,
    actual.id
  );
  db.prepare("UPDATE secciones SET orden = ?, actualizado_en = ? WHERE id = ?").run(
    actual.orden,
    fecha,
    vecina.id
  );
  return true;
}

// ----------------------------------------------------------------------------
// Contenidos
// ----------------------------------------------------------------------------

export function obtenerContenido(id: string): Contenido | null {
  const fila = getDb().prepare("SELECT * FROM contenidos WHERE id = ?").get(id) as
    | FilaContenido
    | undefined;
  return fila ? aContenido(fila) : null;
}

export function crearContenido(datos: ContenidoInput): Contenido | null {
  if (!obtenerSeccion(datos.seccion_id)) return null;

  const id = nuevoId();
  const fecha = ahora();

  getDb()
    .prepare(
      `INSERT INTO contenidos
         (id, seccion_id, titulo, descripcion, tipo, url, cuerpo, orden, publicado, creado_en, actualizado_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      datos.seccion_id,
      datos.titulo,
      datos.descripcion ?? null,
      datos.tipo,
      datos.url ?? null,
      datos.cuerpo ?? null,
      siguienteOrden("contenidos", datos.seccion_id),
      datos.publicado ? 1 : 0,
      fecha,
      fecha
    );

  return obtenerContenido(id);
}

export function actualizarContenido(
  id: string,
  datos: Partial<Omit<ContenidoInput, "seccion_id">>
): Contenido | null {
  const actual = obtenerContenido(id);
  if (!actual) return null;

  getDb()
    .prepare(
      `UPDATE contenidos
          SET titulo = ?, descripcion = ?, tipo = ?, url = ?, cuerpo = ?, publicado = ?, actualizado_en = ?
        WHERE id = ?`
    )
    .run(
      datos.titulo ?? actual.titulo,
      datos.descripcion !== undefined ? datos.descripcion : actual.descripcion,
      datos.tipo ?? actual.tipo,
      datos.url !== undefined ? datos.url : actual.url,
      datos.cuerpo !== undefined ? datos.cuerpo : actual.cuerpo,
      (datos.publicado !== undefined ? datos.publicado : actual.publicado) ? 1 : 0,
      ahora(),
      id
    );

  return obtenerContenido(id);
}

export function eliminarContenido(id: string): boolean {
  return getDb().prepare("DELETE FROM contenidos WHERE id = ?").run(id).changes > 0;
}

export function moverContenido(id: string, direccion: "arriba" | "abajo"): boolean {
  const db = getDb();
  const actual = db
    .prepare("SELECT id, orden, seccion_id FROM contenidos WHERE id = ?")
    .get(id) as { id: string; orden: number; seccion_id: string } | undefined;
  if (!actual) return false;

  const vecino = db
    .prepare(
      direccion === "arriba"
        ? "SELECT id, orden FROM contenidos WHERE seccion_id = ? AND orden < ? ORDER BY orden DESC LIMIT 1"
        : "SELECT id, orden FROM contenidos WHERE seccion_id = ? AND orden > ? ORDER BY orden ASC LIMIT 1"
    )
    .get(actual.seccion_id, actual.orden) as { id: string; orden: number } | undefined;
  if (!vecino) return false;

  const fecha = ahora();
  db.prepare("UPDATE contenidos SET orden = ?, actualizado_en = ? WHERE id = ?").run(
    vecino.orden,
    fecha,
    actual.id
  );
  db.prepare("UPDATE contenidos SET orden = ?, actualizado_en = ? WHERE id = ?").run(
    actual.orden,
    fecha,
    vecino.id
  );
  return true;
}
