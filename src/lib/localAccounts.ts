import type { User } from "@supabase/supabase-js";
import type { UserProfile, UserRole } from "@/types";

export const LOCAL_STORAGE_SESSION_KEY = "conlact_auth_session";
export const LOCAL_STORAGE_ACCOUNTS_KEY = "conlact_registered_accounts";
export type AccountStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export interface StoredAccount {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  authProvider?: "local" | "supabase";
}

const SYSTEM_ACCOUNTS: StoredAccount[] = [
  { id: "d1000000-0000-0000-0000-000000000001", fullName: "Administrador CONLAC-T", email: "admin@conlact.org", passwordHash: "AdminConlact2026*", role: "admin", createdAt: "2026-01-01T00:00:00.000Z", authProvider: "local" },
  { id: "c2000000-0000-0000-0000-000000000002", fullName: "Cliente Frecuente Pilahuín", email: "cliente@conlact.org", passwordHash: "ClienteConlact2026*", role: "customer", createdAt: "2026-01-01T00:00:00.000Z", authProvider: "local" },
];

export function getStoredAccounts(storage: AccountStorage = localStorage): StoredAccount[] {
  try {
    const parsed = JSON.parse(storage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((account) => account && typeof account.id === "string" && typeof account.email === "string" && typeof account.passwordHash === "string") : [];
  } catch { return []; }
}

export function saveStoredAccount(account: StoredAccount, storage: AccountStorage = localStorage): void {
  const accounts = getStoredAccounts(storage).filter((item) => item.id !== account.id && item.email.toLowerCase() !== account.email.toLowerCase());
  storage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
}

const hex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
const unhex = (value: string) => Uint8Array.from(value.match(/.{2}/g) ?? [], (byte) => parseInt(byte, 16));

export async function hashLocalPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const digest = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 310000 }, key, 256);
  return `pbkdf2-sha256$310000$${hex(salt)}$${hex(new Uint8Array(digest))}`;
}

export async function verifyLocalPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("pbkdf2-sha256$")) return password === stored; // Migración de cuentas locales anteriores.
  if (!/^pbkdf2-sha256\$310000\$[a-f0-9]{32}\$[a-f0-9]{64}$/.test(stored)) return false;
  const candidate = await hashLocalPassword(password, unhex(stored.split("$")[2]));
  let difference = candidate.length ^ stored.length;
  for (let index = 0; index < stored.length; index++) difference |= candidate.charCodeAt(index) ^ stored.charCodeAt(index);
  return difference === 0;
}

export function getLocalAccountById(id: string, storage: AccountStorage = localStorage): StoredAccount | undefined {
  return getStoredAccounts(storage).find((account) => account.id === id) ?? SYSTEM_ACCOUNTS.find((account) => account.id === id);
}

export function isRemoteAccount(account: StoredAccount): boolean {
  return account.authProvider === "supabase" || (!account.authProvider && /^[a-f0-9-]{36}$/i.test(account.id) && !SYSTEM_ACCOUNTS.some((system) => system.id === account.id));
}

export function isLocalEmailTaken(email: string, id: string, storage: AccountStorage = localStorage): boolean {
  const normalized = email.toLowerCase();
  return [...getStoredAccounts(storage), ...SYSTEM_ACCOUNTS].some((account) => account.id !== id && account.email.toLowerCase() === normalized);
}

export async function authenticateLocalAccount(email: string, password: string, storage: AccountStorage = localStorage): Promise<
  { status: "found"; account: StoredAccount } | { status: "invalid"; error: string } | { status: "none" }
> {
  const accounts = getStoredAccounts(storage);
  const normalized = email.trim().toLowerCase();
  const saved = accounts.find((account) => account.email.toLowerCase() === normalized);
  const system = SYSTEM_ACCOUNTS.find((account) => account.email === normalized);
  if (!saved && system && accounts.some((account) => account.id === system.id)) return { status: "invalid", error: "Correo electrónico o contraseña incorrectos." };
  const account = saved ?? system;
  if (!account || isRemoteAccount(account)) return { status: "none" };
  if (!await verifyLocalPassword(password, account.passwordHash)) return { status: "invalid", error: "Correo electrónico o contraseña incorrectos." };
  if (saved && !saved.passwordHash.startsWith("pbkdf2-sha256$")) {
    const upgraded = { ...saved, passwordHash: await hashLocalPassword(password), authProvider: "local" as const };
    saveStoredAccount(upgraded, storage);
    return { status: "found", account: upgraded };
  }
  return { status: "found", account };
}

export function localAccountSession(account: StoredAccount): { user: User; profile: UserProfile } {
  return {
    user: { id: account.id, email: account.email, app_metadata: { provider: "email", role: account.role },
      user_metadata: { full_name: account.fullName }, aud: "authenticated", role: "authenticated",
      created_at: account.createdAt, confirmed_at: account.createdAt, updated_at: new Date().toISOString() },
    profile: { id: account.id, full_name: account.fullName, email: account.email, role: account.role, is_active: true, created_at: account.createdAt },
  };
}

export function commitLocalCredentials(account: StoredAccount, storage: AccountStorage): ReturnType<typeof localAccountSession> {
  const oldAccounts = storage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
  const oldSession = storage.getItem(LOCAL_STORAGE_SESSION_KEY);
  const session = localAccountSession(account);
  try {
    saveStoredAccount(account, storage);
    storage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    if (oldAccounts === null) storage.removeItem(LOCAL_STORAGE_ACCOUNTS_KEY); else storage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, oldAccounts);
    if (oldSession === null) storage.removeItem(LOCAL_STORAGE_SESSION_KEY); else storage.setItem(LOCAL_STORAGE_SESSION_KEY, oldSession);
    throw error;
  }
}
