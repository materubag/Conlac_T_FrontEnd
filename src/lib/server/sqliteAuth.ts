import { createHash, randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { DatabaseSync } from "node:sqlite";
import { getDb } from "@/lib/db/sqlite";
import { fieldError } from "@/lib/adminValidation";
import { newPasswordError } from "@/lib/passwordPolicy";
import type { AccountSession } from "@/types/auth";
import type { UserRole } from "@/types";

const scrypt = promisify(scryptCallback);
export const RESET_CODE_TTL = 10 * 60 * 1000;
export const RESET_GRANT_TTL = 5 * 60 * 1000;
export const RESEND_DELAY = 60 * 1000;
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const token = () => randomBytes(32).toString("base64url");

export class AuthError extends Error {
  constructor(message: string, public status = 400, public retryAfter?: number) { super(message); }
}

interface AuthUser { id: string; email: string; full_name: string; role: UserRole; password_hash: string; created_at: string; is_active: number }
interface ResetRow { id: string; user_id: string | null; code_hash: string; expires_at: number; attempts: number; verified_at: number | null; consumed_at: number | null; token_expires_at: number | null }
interface EmailChangeRow { id: string; user_id: string; previous_email: string; new_email: string; code_hash: string }
export type ResetMailer = (email: string, code: string) => Promise<void>;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(hash)) return false;
  const [, salt, expected] = hash.split("$");
  const actual = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(expected, "hex"));
}

export function createAuthSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','editor','customer')), password_hash TEXT NOT NULL, created_at TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1))
    );
    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS password_reset_challenges (
      id TEXT PRIMARY KEY, user_id TEXT REFERENCES auth_users(id) ON DELETE CASCADE, email_hash TEXT NOT NULL,
      code_hash TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, verified_at INTEGER, consumed_at INTEGER,
      token_hash TEXT UNIQUE, token_expires_at INTEGER, delivery TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE INDEX IF NOT EXISTS idx_reset_email ON password_reset_challenges(email_hash, created_at);
    CREATE TABLE IF NOT EXISTS email_change_challenges (
      id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
      session_hash TEXT NOT NULL, previous_email TEXT NOT NULL, new_email TEXT NOT NULL,
      code_hash TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0, consumed_at INTEGER, delivery TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE INDEX IF NOT EXISTS idx_email_change_user ON email_change_challenges(user_id, created_at);
    CREATE TABLE IF NOT EXISTS auth_rate_limits (scope TEXT NOT NULL, key_hash TEXT NOT NULL,
      started_at INTEGER NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(scope,key_hash));
  `);
  // Reconstruir solo el esquema antiguo: conservar cuentas, hashes, sesiones y códigos.
  const columns = db.prepare("PRAGMA table_info(auth_users)").all() as { name: string }[];
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'auth_users'").get() as { sql: string };
  if (!columns.some(column => column.name === "is_active") || !schema.sql.includes("'editor'")) {
    const foreignKeys = (db.prepare("PRAGMA foreign_keys").get() as { foreign_keys: number }).foreign_keys;
    db.exec("PRAGMA foreign_keys = OFF");
    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(`CREATE TABLE auth_users_upgrade (
        id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, full_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin','editor','customer')), password_hash TEXT NOT NULL, created_at TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0,1))
      )`);
      const activeColumn = columns.some(column => column.name === "is_active") ? "is_active" : "1";
      db.exec(`INSERT INTO auth_users_upgrade SELECT id,email,full_name,role,password_hash,created_at,${activeColumn} FROM auth_users`);
      db.exec("DROP TABLE auth_users; ALTER TABLE auth_users_upgrade RENAME TO auth_users");
      if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("No se pudo conservar la integridad de las cuentas.");
      db.exec("COMMIT");
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    finally { db.exec(`PRAGMA foreign_keys = ${foreignKeys ? "ON" : "OFF"}`); }
  }
}

export class SqliteAuthStore {
  private initialization: Promise<void> | undefined;
  constructor(private db: DatabaseSync, private now = () => Date.now()) { createAuthSchema(db); }

  initialize(): Promise<void> {
    return this.initialization ??= (async () => {
      if (this.db.prepare("SELECT id FROM auth_users LIMIT 1").get()) return;
      const initial = [
        { id: "d1000000-0000-0000-0000-000000000001", email: process.env.INITIAL_ADMIN_EMAIL || "admin@conlact.org", fullName: "Administrador CONLAC-T", role: "admin", password: process.env.INITIAL_ADMIN_PASSWORD || "AdminConlact2026*" },
        { id: "c2000000-0000-0000-0000-000000000002", email: "cliente@conlact.org", fullName: "Cliente Frecuente Pilahuín", role: "customer", password: "ClienteConlact2026*" },
      ];
      for (const item of initial) {
        if (this.db.prepare("SELECT id FROM auth_users WHERE id = ?").get(item.id)) continue;
        const passwordHash = await hashPassword(item.password);
        this.db.prepare("INSERT OR IGNORE INTO auth_users (id,email,full_name,role,password_hash,created_at) VALUES (?, ?, ?, ?, ?, ?)")
          .run(item.id, item.email.toLowerCase(), item.fullName, item.role, passwordHash, new Date(this.now()).toISOString());
      }
    })();
  }

  private rate(scope: string, key: string, maximum: number, windowMs: number) {
    const now = this.now();
    const keyHash = digest(key);
    this.db.prepare(`INSERT INTO auth_rate_limits VALUES (?, ?, ?, 1) ON CONFLICT(scope,key_hash) DO UPDATE SET
      count = CASE WHEN ? - started_at >= ? THEN 1 ELSE count + 1 END,
      started_at = CASE WHEN ? - started_at >= ? THEN ? ELSE started_at END`)
      .run(scope, keyHash, now, now, windowMs, now, windowMs, now);
    const row = this.db.prepare("SELECT count, started_at FROM auth_rate_limits WHERE scope = ? AND key_hash = ?").get(scope, keyHash) as { count: number; started_at: number };
    if (row.count > maximum) throw new AuthError("Demasiados intentos. Espera antes de volver a intentarlo.", 429, Math.max(1, Math.ceil((row.started_at + windowMs - now) / 1000)));
  }

  private userByEmail(email: string): AuthUser | undefined {
    return this.db.prepare("SELECT * FROM auth_users WHERE email = ?").get(email) as unknown as AuthUser | undefined;
  }
  private publicSession(user: AuthUser): AccountSession {
    return {
      user: { id: user.id, email: user.email, aud: "authenticated", role: "authenticated", created_at: user.created_at,
        app_metadata: { provider: "sqlite", role: user.role }, user_metadata: { full_name: user.full_name } },
      profile: { id: user.id, email: user.email, full_name: user.full_name, role: user.role, is_active: Boolean(user.is_active), created_at: user.created_at },
    };
  }
  private createSession(user: AuthUser) {
    const sessionToken = token();
    this.db.prepare("INSERT INTO auth_sessions VALUES (?, ?, ?)").run(digest(sessionToken), user.id, this.now() + SESSION_TTL_SECONDS * 1000);
    return { session: this.publicSession(user), sessionToken };
  }

  async signIn(email: string, password: string, client = "local") {
    await this.initialize();
    email = email.trim().toLowerCase();
    if (!email || fieldError(email, "email") || !password || password.length > 128) throw new AuthError("Correo electrónico o contraseña incorrectos.", 401);
    this.rate("login-ip", client, 30, 15 * 60 * 1000);
    this.rate("login-email", email, 10, 15 * 60 * 1000);
    const user = this.userByEmail(email);
    // Mantener el coste de verificación también para direcciones desconocidas.
    const hash = user?.password_hash ?? (this.db.prepare("SELECT password_hash FROM auth_users LIMIT 1").get() as { password_hash: string }).password_hash;
    const valid = await verifyPassword(password, hash);
    if (!user || !user.is_active || !valid) throw new AuthError("Correo electrónico o contraseña incorrectos.", 401);
    this.db.prepare("DELETE FROM auth_rate_limits WHERE scope = 'login-email' AND key_hash = ?").run(digest(email));
    this.db.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?").run(this.now());
    return this.createSession(user);
  }

  session(sessionToken?: string): AccountSession | null {
    if (!sessionToken) return null;
    const user = this.db.prepare(`SELECT u.* FROM auth_sessions s JOIN auth_users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ? AND u.is_active = 1`)
      .get(digest(sessionToken), this.now()) as unknown as AuthUser | undefined;
    return user ? this.publicSession(user) : null;
  }
  signOut(sessionToken?: string) { if (sessionToken) this.db.prepare("DELETE FROM auth_sessions WHERE token_hash = ?").run(digest(sessionToken)); }

  async requestEmailChange(sessionToken: string | undefined, email: string, password: string, send: ResetMailer) {
    const active = this.session(sessionToken);
    if (!active) throw new AuthError("Inicia sesión para cambiar tu correo.", 401);
    email = email.trim().toLowerCase();
    if (!email || fieldError(email, "email")) throw new AuthError("Ingresa un correo electrónico válido.");
    if (email === active.user.email) throw new AuthError("El nuevo correo debe ser diferente del actual.");
    this.rate("email-password", active.user.id, 5, 15 * 60 * 1000);
    const user = this.userByEmail(active.user.email!)!;
    if (!password || password.length > 128 || !await verifyPassword(password, user.password_hash)) throw new AuthError("La contraseña actual es incorrecta.", 401);
    if (this.userByEmail(email)) throw new AuthError("Ese correo ya está asociado a otra cuenta.");
    this.rate("email-change-send", user.id, 1, RESEND_DELAY);
    this.rate("email-change-target", email, 5, 60 * 60 * 1000);
    const id = randomBytes(16).toString("hex");
    const code = randomInt(0, 1000000).toString().padStart(6, "0");
    const codeHash = await hashPassword(code);
    this.db.prepare(`INSERT INTO email_change_challenges (id,user_id,session_hash,previous_email,new_email,code_hash,created_at,expires_at)
      VALUES (?,?,?,?,?,?,?,?)`).run(id, user.id, digest(sessionToken!), user.email, email, codeHash, this.now(), this.now() + RESET_CODE_TTL);
    try { await send(email, code); }
    catch {
      this.db.prepare("UPDATE email_change_challenges SET consumed_at = ?, delivery = 'failed' WHERE id = ?").run(this.now(), id);
      throw new AuthError("No se pudo enviar el correo. Inténtalo de nuevo más tarde.", 503);
    }
    // La sesión puede haber sido revocada mientras SMTP respondía.
    if (!this.session(sessionToken)) {
      this.db.prepare("UPDATE email_change_challenges SET consumed_at = ? WHERE id = ?").run(this.now(), id);
      throw new AuthError("La sesión venció. Inicia sesión de nuevo.", 401);
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("UPDATE email_change_challenges SET consumed_at = ? WHERE user_id = ? AND id <> ? AND consumed_at IS NULL").run(this.now(), user.id, id);
      this.db.prepare("UPDATE email_change_challenges SET delivery = 'sent' WHERE id = ?").run(id);
      this.db.prepare("DELETE FROM email_change_challenges WHERE expires_at < ?").run(this.now() - 24 * 60 * 60 * 1000);
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
    return { requestId: id, expiresIn: RESET_CODE_TTL / 1000, resendAfter: RESEND_DELAY / 1000 };
  }

  async verifyEmailChange(sessionToken: string | undefined, requestId: string, code: string) {
    const active = this.session(sessionToken);
    if (!active) throw new AuthError("Inicia sesión para verificar tu nuevo correo.", 401);
    const invalid = () => new AuthError("Código inválido o vencido. Solicita uno nuevo.");
    if (!/^[a-f0-9]{32}$/.test(requestId) || !/^\d{6}$/.test(code)) throw invalid();
    const updated = this.db.prepare(`UPDATE email_change_challenges SET attempts = attempts + 1
      WHERE id = ? AND user_id = ? AND session_hash = ? AND consumed_at IS NULL AND delivery = 'sent' AND attempts < 5 AND expires_at > ?`)
      .run(requestId, active.user.id, digest(sessionToken!), this.now()).changes;
    if (!updated) throw invalid();
    const row = this.db.prepare("SELECT * FROM email_change_challenges WHERE id = ?").get(requestId) as unknown as EmailChangeRow;
    if (!await verifyPassword(code, row.code_hash)) throw invalid();
    this.db.exec("BEGIN IMMEDIATE");
    try {
      if (!this.session(sessionToken)) throw new AuthError("La sesión venció. Inicia sesión de nuevo.", 401);
      const user = this.userByEmail(row.previous_email);
      if (!user || user.id !== active.user.id) throw invalid();
      if (this.userByEmail(row.new_email)) throw new AuthError("Ese correo ya está asociado a otra cuenta.");
      const consumed = this.db.prepare("UPDATE email_change_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND expires_at > ?")
        .run(this.now(), row.id, this.now()).changes;
      if (!consumed) throw invalid();
      this.db.prepare("UPDATE auth_users SET email = ? WHERE id = ?").run(row.new_email, user.id);
      this.db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").run(user.id);
      this.db.prepare("UPDATE password_reset_challenges SET consumed_at = ? WHERE user_id = ?").run(this.now(), user.id);
      this.db.prepare("UPDATE email_change_challenges SET consumed_at = ? WHERE user_id = ? AND consumed_at IS NULL").run(this.now(), user.id);
      const result = this.createSession({ ...user, email: row.new_email });
      this.db.exec("COMMIT"); return result;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  async requestReset(email: string, client: string, send: ResetMailer) {
    await this.initialize();
    email = email.trim().toLowerCase();
    if (!email || fieldError(email, "email")) throw new AuthError("Ingresa un correo electrónico válido.");
    this.rate("recovery-ip", client, 10, 15 * 60 * 1000);
    this.rate("recovery-email", email, 1, RESEND_DELAY);
    const found = this.userByEmail(email);
    const user = found?.is_active ? found : undefined;
    const code = randomInt(0, 1000000).toString().padStart(6, "0");
    const id = randomBytes(16).toString("hex");
    const codeHash = await hashPassword(code);
    const now = this.now();
    this.db.prepare(`INSERT INTO password_reset_challenges (id,user_id,email_hash,code_hash,created_at,expires_at) VALUES (?,?,?,?,?,?)`)
      .run(id, user?.id ?? null, digest(email), codeHash, now, now + RESET_CODE_TTL);
    try { if (user) await send(email, code); }
    catch {
      this.db.prepare("UPDATE password_reset_challenges SET delivery = 'failed', consumed_at = ? WHERE id = ?").run(this.now(), id);
      throw new AuthError("No se pudo enviar el correo. Inténtalo de nuevo más tarde.", 503);
    }
    this.db.exec("BEGIN IMMEDIATE");
    try {
      this.db.prepare("UPDATE password_reset_challenges SET consumed_at = ? WHERE email_hash = ? AND id <> ? AND consumed_at IS NULL").run(this.now(), digest(email), id);
      this.db.prepare("UPDATE password_reset_challenges SET delivery = 'sent' WHERE id = ?").run(id);
      this.db.prepare("DELETE FROM password_reset_challenges WHERE expires_at < ?").run(this.now() - 24 * 60 * 60 * 1000);
      this.db.prepare("DELETE FROM auth_rate_limits WHERE started_at < ?").run(this.now() - 24 * 60 * 60 * 1000);
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
    return { requestId: id, expiresIn: RESET_CODE_TTL / 1000, resendAfter: RESEND_DELAY / 1000 };
  }

  async verifyResetCode(requestId: string, code: string) {
    const invalid = () => new AuthError("Código inválido o vencido. Solicita uno nuevo.");
    if (!/^[a-f0-9]{32}$/.test(requestId) || !/^\d{6}$/.test(code)) throw invalid();
    const changed = this.db.prepare(`UPDATE password_reset_challenges SET attempts = attempts + 1
      WHERE id = ? AND attempts < 5 AND expires_at > ? AND consumed_at IS NULL AND verified_at IS NULL AND delivery = 'sent'`)
      .run(requestId, this.now()).changes;
    if (!changed) throw invalid();
    const row = this.db.prepare("SELECT * FROM password_reset_challenges WHERE id = ?").get(requestId) as unknown as ResetRow;
    const valid = await verifyPassword(code, row.code_hash);
    if (!valid || !row.user_id) throw invalid();
    const resetToken = token();
    const claimed = this.db.prepare(`UPDATE password_reset_challenges SET verified_at = ?, token_hash = ?, token_expires_at = ?
      WHERE id = ? AND verified_at IS NULL AND consumed_at IS NULL AND expires_at > ?`)
      .run(this.now(), digest(resetToken), this.now() + RESET_GRANT_TTL, requestId, this.now()).changes;
    if (!claimed) throw invalid();
    return resetToken;
  }

  async finishReset(resetToken: string | undefined, password: string, confirmation: string) {
    const error = newPasswordError(password);
    if (error) throw new AuthError(error);
    if (password !== confirmation) throw new AuthError("Las contraseñas no coinciden.");
    if (!resetToken) throw new AuthError("Verifica primero el código de recuperación.", 401);
    const row = this.db.prepare(`SELECT * FROM password_reset_challenges WHERE token_hash = ? AND verified_at IS NOT NULL AND consumed_at IS NULL AND token_expires_at > ?`)
      .get(digest(resetToken), this.now()) as unknown as ResetRow | undefined;
    if (!row?.user_id) throw new AuthError("La autorización venció. Solicita un nuevo código.", 401);
    const user = this.db.prepare("SELECT * FROM auth_users WHERE id = ?").get(row.user_id) as unknown as AuthUser;
    if (!user?.is_active) throw new AuthError("La autorización ya no es válida.", 401);
    if (await verifyPassword(password, user.password_hash)) throw new AuthError("La nueva contraseña debe ser diferente de la actual.");
    const passwordHash = await hashPassword(password);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const consumed = this.db.prepare("UPDATE password_reset_challenges SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL AND token_expires_at > ?")
        .run(this.now(), row.id, this.now()).changes;
      if (!consumed) throw new AuthError("La autorización ya fue utilizada o venció.", 401);
      this.db.prepare("UPDATE auth_users SET password_hash = ? WHERE id = ?").run(passwordHash, row.user_id);
      this.db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").run(row.user_id);
      this.db.prepare("UPDATE password_reset_challenges SET consumed_at = ? WHERE user_id = ? AND consumed_at IS NULL").run(this.now(), row.user_id);
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  cancelReset(resetToken?: string) {
    if (resetToken) this.db.prepare("UPDATE password_reset_challenges SET consumed_at = ? WHERE token_hash = ?").run(this.now(), digest(resetToken));
  }
}

let instance: SqliteAuthStore | undefined;
export const getAuthStore = () => instance ??= new SqliteAuthStore(getDb());
