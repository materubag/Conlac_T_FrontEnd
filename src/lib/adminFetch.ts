import { supabase } from "@/lib/supabase";
export async function adminFetch(input: string, init: RequestInit = {}) {
  const local = JSON.parse(localStorage.getItem("conlact_auth_session") || "null");
  let token = local?.expires_at > Date.now() ? local.access_token : null;
  if (!token) token = (await supabase.auth.getSession()).data.session?.access_token;
  if (!token) throw new Error("La sesión ha caducado. Inicia sesión nuevamente.");
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
