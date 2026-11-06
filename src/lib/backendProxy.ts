import { siteConfig } from "@/lib/config";
export async function backendProxy(request: Request, path: string, method = request.method, body?: unknown) {
  const headers = new Headers({ Accept: "application/json" });
  const token = request.headers.get("authorization");
  if (method !== "GET" && !token) return Response.json({ error: "Inicia sesión como administrador" }, { status: 401 });
  if (token) headers.set("Authorization", token);
  if (body !== undefined) headers.set("Content-Type", "application/json");
  try {
    const response = await fetch(`${siteConfig.backendUrl}${path}`, { method, headers, cache: "no-store", body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000) });
    return new Response(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" } });
  } catch { return Response.json({ error: "No se pudo conectar con el servidor" }, { status: 502 }); }
}
