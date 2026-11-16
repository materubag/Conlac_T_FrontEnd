import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { getDb } from "@/lib/db/sqlite";
import { newPasswordError } from "@/lib/passwordPolicy";
import { fieldError } from "@/lib/adminValidation";
import { AuthError, getAuthStore, hashPassword, type SqliteAuthStore } from "./sqliteAuth";
import type { StaffRole, StaffUser } from "@/types/users";

interface UserRow { id: string; full_name: string; email: string; role: StaffRole; is_active: number; created_at: string }
const publicUser = (row: UserRow): StaffUser => ({ id: row.id, full_name: row.full_name, email: row.email, role: row.role, is_active: Boolean(row.is_active), created_at: row.created_at });
const fields = "id,full_name,email,role,is_active,created_at";
function nameValue(value: unknown) {
  if (typeof value !== "string" || value.trim().length < 2 || value.trim().length > 150) throw new AuthError("El nombre debe tener entre 2 y 150 caracteres.");
  return value.trim();
}
function roleValue(value: unknown): StaffRole {
  if (value !== "admin" && value !== "editor") throw new AuthError("El rol debe ser admin o editor.");
  return value;
}

export class SqliteUserManager {
  constructor(private db: DatabaseSync, private auth: SqliteAuthStore) {}
  private admin(token?: string) {
    const session = this.auth.session(token);
    if (!session) throw new AuthError("Inicia sesión para gestionar usuarios.", 401);
    if (session.profile.role !== "admin") throw new AuthError("Solo un administrador puede gestionar usuarios.", 403);
    return session;
  }
  private target(id: string): UserRow {
    const user = this.db.prepare(`SELECT ${fields} FROM auth_users WHERE id = ? AND role IN ('admin','editor')`).get(id) as unknown as UserRow | undefined;
    if (!user) throw new AuthError("El usuario del equipo no existe.", 404);
    return user;
  }
  list(token?: string): StaffUser[] {
    this.admin(token);
    return (this.db.prepare(`SELECT ${fields} FROM auth_users WHERE role IN ('admin','editor') ORDER BY created_at DESC,id`).all() as unknown as UserRow[]).map(publicUser);
  }
  async create(token: string | undefined, body: Record<string, unknown>): Promise<StaffUser> {
    this.admin(token);
    const name = nameValue(body.full_name), role = roleValue(body.role);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || fieldError(email, "email")) throw new AuthError("Ingresa un correo electrónico válido de hasta 254 caracteres.");
    const password = typeof body.password === "string" ? body.password : "";
    const invalid = newPasswordError(password);
    if (invalid) throw new AuthError(invalid);
    if (password !== body.confirmation) throw new AuthError("Las contraseñas no coinciden.");
    if (Object.keys(body).some(key => !["full_name","email","role","password","confirmation"].includes(key))) throw new AuthError("Campos de usuario no permitidos.");
    const hash = await hashPassword(password);
    // Revalidar el permiso después de derivar el hash.
    this.admin(token);
    if (this.db.prepare("SELECT id FROM auth_users WHERE email = ?").get(email)) throw new AuthError("Ese correo ya está asociado a otra cuenta.", 409);
    const id = randomUUID();
    this.db.prepare("INSERT INTO auth_users (id,email,full_name,role,password_hash,created_at,is_active) VALUES (?,?,?,?,?,?,1)")
      .run(id, email, name, role, hash, new Date().toISOString());
    return publicUser(this.target(id));
  }
  private protect(actor: string, user: UserRow, role: StaffRole, active: boolean, deleting = false) {
    if (actor === user.id && (deleting || !active || role !== "admin")) throw new AuthError("No puedes eliminar, desactivar o quitar el rol admin de tu propia cuenta.");
    if (user.role === "admin" && user.is_active && (deleting || !active || role !== "admin")) {
      const count = this.db.prepare("SELECT count(*) AS count FROM auth_users WHERE role = 'admin' AND is_active = 1").get() as { count: number };
      if (count.count <= 1) throw new AuthError("Debe permanecer al menos un administrador activo.");
    }
  }
  private revoke(id: string) {
    this.db.prepare("DELETE FROM auth_sessions WHERE user_id = ?").run(id);
    this.db.prepare("DELETE FROM password_reset_challenges WHERE user_id = ?").run(id);
    this.db.prepare("DELETE FROM email_change_challenges WHERE user_id = ?").run(id);
  }
  update(token: string | undefined, id: string, body: Record<string, unknown>): StaffUser {
    const actor = this.admin(token);
    if (!Object.keys(body).length || Object.keys(body).some(key => !["full_name","role","is_active"].includes(key))) throw new AuthError("Solo puedes actualizar nombre, rol y estado. El correo se verifica desde Mi cuenta.");
    if (body.is_active !== undefined && typeof body.is_active !== "boolean") throw new AuthError("El estado debe ser activo o inactivo.");
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const user = this.target(id);
      const name = body.full_name === undefined ? user.full_name : nameValue(body.full_name);
      const role = body.role === undefined ? user.role : roleValue(body.role);
      const active = body.is_active === undefined ? Boolean(user.is_active) : body.is_active as boolean;
      this.protect(actor.user.id, user, role, active);
      this.db.prepare("UPDATE auth_users SET full_name = ?, role = ?, is_active = ? WHERE id = ?").run(name, role, Number(active), id);
      if (role !== user.role || active !== Boolean(user.is_active)) this.revoke(id);
      const result = publicUser(this.target(id));
      this.db.exec("COMMIT"); return result;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  delete(token: string | undefined, id: string) {
    const actor = this.admin(token);
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const user = this.target(id);
      this.protect(actor.user.id, user, user.role, Boolean(user.is_active), true);
      this.revoke(id);
      this.db.prepare("DELETE FROM auth_users WHERE id = ?").run(id);
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
}
export const getUserManager = () => new SqliteUserManager(getDb(), getAuthStore());
