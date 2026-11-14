import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";
import { newPasswordError } from "./passwordPolicy";
export { newPasswordError } from "./passwordPolicy";
import { fieldError } from "./adminValidation";
import { commitLocalCredentials, getLocalAccountById, getStoredAccounts, hashLocalPassword, isLocalEmailTaken,
  isRemoteAccount, LOCAL_STORAGE_ACCOUNTS_KEY, LOCAL_STORAGE_SESSION_KEY, verifyLocalPassword, type AccountStorage } from "./localAccounts";

export interface AccountUpdateResult {
  success: boolean;
  error?: string;
  message?: string;
  requiresConfirmation?: boolean;
  requestId?: string;
  expiresIn?: number;
  resendAfter?: number;
  retryAfter?: number;
  user?: User;
  profile?: UserProfile;
}
type CredentialChange = { kind: "email"; email: string; currentPassword: string } |
  { kind: "password"; password: string; currentPassword: string };
interface SecurityContext {
  user: User; profile: UserProfile | null; storage: AccountStorage; supabaseConfigured: boolean;
  auth: Pick<SupabaseClient["auth"], "getSession" | "signInWithPassword" | "updateUser">;
}

export async function updateAccountCredentials(change: CredentialChange, context: SecurityContext): Promise<AccountUpdateResult> {
  const { user, profile, storage, auth } = context;
  if (!change.currentPassword || change.currentPassword.length > 128) return { success: false, error: "Ingresa tu contraseña actual." };
  const email = change.kind === "email" ? change.email.trim().toLowerCase() : user.email;
  const validationError = change.kind === "email" ? (!email ? "Ingresa el nuevo correo." : fieldError(email, "email")) : newPasswordError(change.password);
  if (validationError) return { success: false, error: validationError };
  if (change.kind === "email" && email === user.email?.toLowerCase()) return { success: false, error: "El nuevo correo debe ser diferente del actual." };
  if (change.kind === "password" && change.password === change.currentPassword) return { success: false, error: "La nueva contraseña debe ser diferente de la actual." };
  try {
    const remote = context.supabaseConfigured ? await auth.getSession() : null;
    if (remote?.data.session?.user.id === user.id) {
      const verified = await auth.signInWithPassword({ email: user.email!, password: change.currentPassword });
      if (verified.error || verified.data.user?.id !== user.id) return { success: false, error: "La contraseña actual es incorrecta o no se pudo verificar la sesión." };
      const result = await auth.updateUser(change.kind === "email" ? { email } : { password: change.password });
      if (result.error || !result.data.user || result.data.user.id !== user.id) return { success: false, error: result.error?.message || "No se pudo actualizar la cuenta." };
      const nextUser = result.data.user;
      // Una cuenta de Supabase no debe conservar credenciales locales de respaldo.
      try {
        storage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(getStoredAccounts(storage).filter((account) => account.id !== user.id)));
        const fallback = JSON.parse(storage.getItem(LOCAL_STORAGE_SESSION_KEY) || "null");
        if (fallback?.user?.id === user.id) storage.removeItem(LOCAL_STORAGE_SESSION_KEY);
      } catch { /* El cambio remoto ya se completó; una restricción de almacenamiento no lo revierte. */ }
      const requiresConfirmation = change.kind === "email" && nextUser.email?.toLowerCase() !== email;
      return { success: true, user: nextUser, profile: profile ? { ...profile, email: nextUser.email } : undefined, requiresConfirmation,
        message: requiresConfirmation ? "Revisa tu correo para confirmar el cambio. Tu dirección actual se mantiene hasta completar la confirmación." : change.kind === "email" ? "Correo actualizado correctamente." : "Contraseña actualizada correctamente." };
    }
    const fallback = JSON.parse(storage.getItem(LOCAL_STORAGE_SESSION_KEY) || "null");
    const account = getLocalAccountById(user.id, storage);
    if (fallback?.user?.id !== user.id || !account || isRemoteAccount(account)) return { success: false, error: "Vuelve a iniciar sesión para actualizar tus credenciales." };
    if (!await verifyLocalPassword(change.currentPassword, account.passwordHash)) return { success: false, error: "La contraseña actual es incorrecta." };
    if (change.kind === "email" && isLocalEmailTaken(email!, user.id, storage)) return { success: false, error: "Ese correo ya está asociado a otra cuenta." };
    const updated = { ...account, email: email!, authProvider: "local" as const,
      passwordHash: change.kind === "password" ? await hashLocalPassword(change.password) : account.passwordHash.startsWith("pbkdf2-sha256$") ? account.passwordHash : await hashLocalPassword(change.currentPassword) };
    const session = commitLocalCredentials(updated, storage);
    return { success: true, ...session, message: change.kind === "email" ? "Correo actualizado. Úsalo en tu próximo inicio de sesión en este navegador." : "Contraseña actualizada. Úsala en tu próximo inicio de sesión en este navegador." };
  } catch {
    return { success: false, error: "No se pudo completar el cambio. Comprueba la conexión y que el navegador permita guardar la sesión." };
  }
}
