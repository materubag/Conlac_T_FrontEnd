import type { NextRequest } from "next/server";
import { sessionToken } from "./authHttp";
import { AuthError, getAuthStore } from "./sqliteAuth";

export function orderAdmin(request: NextRequest) {
  const session = getAuthStore().session(sessionToken(request));
  if (!session) throw new AuthError("Inicia sesión para gestionar pedidos.", 401);
  if (session.profile.role !== "admin") throw new AuthError("Solo administradores pueden gestionar pedidos.", 403);
  return session.profile.id;
}
