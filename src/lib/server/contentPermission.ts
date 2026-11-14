import { NextRequest } from "next/server";
import { AuthError, getAuthStore } from "./sqliteAuth";
import { assertSameOrigin, authError, sessionToken } from "./authHttp";

export function contentPermission(request: Request) {
  try {
    assertSameOrigin(request);
    const session = getAuthStore().session(sessionToken(request instanceof NextRequest ? request : new NextRequest(request.url, { headers: request.headers })));
    if (!session) throw new AuthError("Inicia sesión para editar contenido.", 401);
    if (session.profile.role !== "admin" && session.profile.role !== "editor") throw new AuthError("No tienes permisos para editar contenido.", 403);
    return null;
  } catch (error) { return authError(error); }
}
