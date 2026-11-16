import { NextRequest, NextResponse } from "next/server";
import { AuthError, SESSION_TTL_SECONDS } from "./sqliteAuth";

export const SESSION_COOKIE = "conlact_session";
export const RESET_COOKIE = "conlact_password_reset";
export const noStore = { "Cache-Control": "no-store" };

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  // A reverse proxy can give Next an internal URL. Trust the configured public
  // origin, never a caller-supplied Host or X-Forwarded-Host header.
  const expectedOrigin = new URL(process.env.APP_ORIGIN || request.url).origin;
  if (origin && origin !== expectedOrigin) throw new AuthError("Solicitud no permitida.", 403);
  if (request.headers.get("sec-fetch-site") === "cross-site") throw new AuthError("Solicitud no permitida.", 403);
}
export async function authBody(request: Request): Promise<Record<string, unknown>> {
  assertSameOrigin(request);
  const text = await request.text();
  if (text.length > 4096) throw new AuthError("Solicitud demasiado grande.", 413);
  let body;
  try { body = JSON.parse(text); } catch { throw new AuthError("El cuerpo debe ser JSON válido."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AuthError("Formato inválido.");
  return body;
}
export function stringField(body: Record<string, unknown>, field: string): string {
  if (typeof body[field] !== "string") throw new AuthError(`El campo ${field} no es válido.`);
  return body[field];
}
export function clientKey(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"; }
export function sessionCookie(response: NextResponse, token: string, maxAge = SESSION_TTL_SECONDS) {
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge });
}
export function resetCookie(response: NextResponse, token: string, maxAge = 300) {
  response.cookies.set(RESET_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/api/auth/recuperar-password", maxAge });
}
export function authError(error: unknown) {
  const known = error instanceof AuthError;
  return NextResponse.json({ success: false, error: known ? error.message : "No se pudo completar la operación. Inténtalo de nuevo." }, {
    status: known ? error.status : 500, headers: { ...noStore, ...(known && error.retryAfter ? { "Retry-After": String(error.retryAfter) } : {}) },
  });
}
export const sessionToken = (request: NextRequest) => request.cookies.get(SESSION_COOKIE)?.value;
