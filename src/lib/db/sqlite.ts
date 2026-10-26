import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

// Almacén local de contenidos (secciones y materiales tipo Moodle).
// Es provisional: el backend todavía no expone estas entidades, así que el
// panel administra el contenido aquí hasta que el equipo de backend lo migre.
// Toda la estructura (tablas, campos, tipos) está pensada para trasladarse
// directamente a PostgreSQL/Supabase sin cambiar la interfaz del panel.

const DB_DIR = process.env.CONTENT_DB_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "contenidos.db");

let instancia: DatabaseSync | null = null;

function crearEsquema(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS secciones (
      id             TEXT PRIMARY KEY,
      titulo         TEXT    NOT NULL,
      descripcion    TEXT,
      orden          INTEGER NOT NULL DEFAULT 0,
      publicado      INTEGER NOT NULL DEFAULT 0,
      creado_en      TEXT    NOT NULL,
      actualizado_en TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contenidos (
      id             TEXT PRIMARY KEY,
      seccion_id     TEXT    NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
      titulo         TEXT    NOT NULL,
      descripcion    TEXT,
      tipo           TEXT    NOT NULL CHECK (tipo IN ('video','texto','enlace','documento')),
      url            TEXT,
      cuerpo         TEXT,
      orden          INTEGER NOT NULL DEFAULT 0,
      publicado      INTEGER NOT NULL DEFAULT 0,
      creado_en      TEXT    NOT NULL,
      actualizado_en TEXT    NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contenidos_seccion ON contenidos(seccion_id, orden);
    CREATE INDEX IF NOT EXISTS idx_secciones_orden ON secciones(orden);
  `);
}

export function getDb(): DatabaseSync {
  if (!instancia) {
    mkdirSync(DB_DIR, { recursive: true });
    instancia = new DatabaseSync(DB_FILE);
    crearEsquema(instancia);
  }
  return instancia;
}

export function ahora(): string {
  return new Date().toISOString();
}

export function nuevoId(): string {
  return globalThis.crypto.randomUUID();
}
