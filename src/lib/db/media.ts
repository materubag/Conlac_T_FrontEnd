import { createHash } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { imageValueError } from "@/lib/adminValidation";

export function mediaSchema(db: DatabaseSync) {
  db.exec(`CREATE TABLE IF NOT EXISTS content_images (
    id TEXT PRIMARY KEY, mime TEXT NOT NULL, bytes BLOB NOT NULL
  ); CREATE TABLE IF NOT EXISTS content_migrations (id TEXT PRIMARY KEY);`);
}

// Content-addressed images share one binary record, even when reused by cards.
// Recursion also handles association, footer and home images stored in page JSON.
export function separateImages<T>(db: DatabaseSync, value: T): T {
  if (typeof value === "string" && value.startsWith("data:image/")) {
    if (imageValueError(value)) throw new Error("Imagen incrustada inválida o mayor de 5 MB.");
    const comma = value.indexOf(",");
    const mime = value.slice(5, value.indexOf(";"));
    const bytes = Buffer.from(value.slice(comma + 1), "base64");
    const id = createHash("sha256").update(mime).update(bytes).digest("hex");
    db.prepare("INSERT OR IGNORE INTO content_images (id,mime,bytes) VALUES (?,?,?)").run(id, mime, bytes);
    return `/api/media/${id}` as T;
  }
  if (Array.isArray(value)) return value.map(item => separateImages(db, item)) as T;
  if (value && typeof value === "object") return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, separateImages(db, item)]),
  ) as T;
  return value;
}

export function migrateInlineImages(db: DatabaseSync) {
  mediaSchema(db);
  if (db.prepare("SELECT id FROM content_migrations WHERE id='binary-images-v1'").get()) return;
  db.exec("BEGIN IMMEDIATE");
  try {
    const pages = db.prepare("SELECT slug,contenido_json FROM paginas_editables WHERE contenido_json LIKE '%data:image/%'").all() as { slug: string; contenido_json: string }[];
    for (const page of pages) {
      const content = separateImages(db, JSON.parse(page.contenido_json));
      db.prepare("UPDATE paginas_editables SET contenido_json=? WHERE slug=?").run(JSON.stringify(content), page.slug);
    }
    const recipes = db.prepare("SELECT id,imagen_url FROM recetas_editables WHERE imagen_url LIKE 'data:image/%'").all() as { id: string; imagen_url: string }[];
    for (const recipe of recipes) db.prepare("UPDATE recetas_editables SET imagen_url=? WHERE id=?").run(separateImages(db, recipe.imagen_url), recipe.id);
    db.prepare("INSERT OR IGNORE INTO content_migrations(id) VALUES ('binary-images-v1')").run();
    db.exec("COMMIT");
  } catch (error) { db.exec("ROLLBACK"); throw error; }
}
