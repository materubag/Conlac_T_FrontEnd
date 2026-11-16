import { getDb } from "@/lib/db/sqlite";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{64}$/.test(id)) return new Response(null, { status: 404 });
  const row = getDb().prepare("SELECT mime,bytes FROM content_images WHERE id=?").get(id) as { mime: string; bytes: Uint8Array } | undefined;
  if (!row) return new Response(null, { status: 404 });
  const headers = { "Content-Type": row.mime, "Cache-Control": "public, max-age=31536000, immutable",
    "ETag": `"${id}"`, "X-Content-Type-Options": "nosniff" };
  if (request.headers.get("if-none-match") === headers.ETag) return new Response(null, { status: 304, headers });
  return new Response(new Uint8Array(row.bytes), { headers });
}
