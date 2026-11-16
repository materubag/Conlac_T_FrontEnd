"use client";

import { useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { UsersIcon, UserIcon } from "@/components/ui/Icons";
import { PasswordField } from "@/components/account/PasswordField";
import { newPasswordError } from "@/lib/passwordPolicy";
import type { StaffRole, StaffUser } from "@/types/users";

const input = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/40 disabled:opacity-60";
const roleLabel = (role: StaffRole) => role === "admin" ? "Admin" : "Editor";
type ModalState = { kind: "create" } | { kind: "edit" | "delete"; user: StaffUser } | null;
async function fetchUsers(signal?: AbortSignal): Promise<StaffUser[]> {
  const response = await fetch("/api/admin/usuarios", { cache: "no-store", signal });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || "No se pudo cargar la lista.");
  return result.users;
}

function UserDialog({ title, busy, onClose, children }: { title: string; busy: boolean; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => { if (dialog?.open) dialog.close(); }; }, []);
  return <dialog ref={ref} aria-labelledby="user-dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-border bg-surface p-6 text-primary shadow-2xl backdrop:bg-primary/40 backdrop:backdrop-blur-sm sm:p-8">
    <div className="mb-6 flex items-center justify-between gap-3"><h2 id="user-dialog-title" className="font-headline text-2xl font-bold">{title}</h2><button type="button" disabled={busy} onClick={onClose} aria-label="Cerrar ventana de usuario" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-2xl hover:bg-background focus-visible:ring-2 focus-visible:ring-tertiary">×</button></div>{children}
  </dialog>;
}

function UserForm({ target, self, busy, error, onSave, onClose }: { target?: StaffUser; self: boolean; busy: boolean; error: string; onSave: (body: Record<string, unknown>) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState(target?.full_name || "");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>(target?.role || "editor");
  const [active, setActive] = useState(target?.is_active ?? true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [validation, setValidation] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setValidation("");
    if (!target) {
      const invalid = newPasswordError(password);
      if (invalid) { setValidation(invalid); return; }
      if (password !== confirmation) { setValidation("Las contraseñas no coinciden."); return; }
    }
    await onSave(target ? { full_name: name.trim(), role, is_active: active } : { full_name: name.trim(), email: email.trim(), role, password, confirmation });
  }
  return <form onSubmit={submit} className="space-y-5">
    <div className="space-y-1.5"><label htmlFor="staff-name" className="block text-xs font-semibold">Nombre completo</label><input autoFocus id="staff-name" autoComplete="name" required minLength={2} maxLength={150} value={name} onChange={event => setName(event.target.value)} disabled={busy} className={input} /></div>
    {target ? <div className="space-y-1.5"><p className="text-xs font-semibold">Correo electrónico</p><p className="break-all text-sm text-neutral-muted">{target.email}</p><p className="text-xs leading-relaxed text-neutral-muted">Cada usuario verifica su nuevo correo desde Mi cuenta.</p></div> : <div className="space-y-1.5"><label htmlFor="staff-email" className="block text-xs font-semibold">Correo electrónico</label><input id="staff-email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={busy} className={input} /></div>}
    <div className="space-y-1.5"><label htmlFor="staff-role" className="block text-xs font-semibold">Rol</label><select id="staff-role" value={role} disabled={busy || self} onChange={event => setRole(event.target.value as StaffRole)} className={input}><option value="editor">Editor</option><option value="admin">Admin</option></select><p className="text-xs leading-relaxed text-neutral-muted">{role === "admin" ? "Edita el portal y administra los usuarios del equipo." : "Edita páginas, productos, asociaciones y contenidos. La gestión de usuarios queda reservada al admin."}</p></div>
    {!target && <><PasswordField id="staff-password" label="Contraseña inicial" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} disabled={busy} /><PasswordField id="staff-confirmation" label="Confirmar contraseña inicial" value={confirmation} onChange={setConfirmation} autoComplete="new-password" minLength={8} disabled={busy} /><p className="text-xs leading-relaxed text-neutral-muted">De 8 a 128 caracteres, con al menos una letra y un número. El usuario podrá cambiarla con un código enviado a su correo.</p></>}
    {target && <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={active} disabled={busy || self} onChange={event => setActive(event.target.checked)} className="h-4 w-4 accent-primary" />Cuenta activa</label>}
    {self && <p className="text-xs text-neutral-muted">Puedes actualizar tu nombre. Tu propia cuenta debe mantener el rol admin y permanecer activa.</p>}
    {(error || validation) && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{validation || error}</p>}
    <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-5"><Button variant="outlined" type="button" onClick={onClose} disabled={busy}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? "Guardando…" : target ? "Guardar cambios" : "Crear usuario"}</Button></div>
  </form>;
}

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  async function refresh() {
    setLoading(true); setError("");
    try { setUsers(await fetchUsers()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo conectar."); }
    finally { setLoading(false); }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal)
      .then(data => { if (!controller.signal.aborted) setUsers(data); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudo conectar."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  const open = (value: ModalState) => { setModalError(""); setNotice(""); setModal(value); };
  async function save(body: Record<string, unknown> = {}) {
    if (!modal || busy) return;
    setBusy(true); setModalError("");
    try {
      const endpoint = modal.kind === "create" ? "/api/admin/usuarios" : `/api/admin/usuarios/${encodeURIComponent(modal.user.id)}`;
      const response = await fetch(endpoint, { method: modal.kind === "create" ? "POST" : modal.kind === "delete" ? "DELETE" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok || !result.success) throw Error(result.error || "No se pudo guardar la operación.");
      if (modal.kind === "delete") setUsers(previous => previous.filter(user => user.id !== modal.user.id));
      else setUsers(previous => modal.kind === "create" ? [result.user, ...previous] : previous.map(user => user.id === result.user.id ? result.user : user));
      setNotice(modal.kind === "create" ? "Usuario creado correctamente." : modal.kind === "delete" ? "Usuario eliminado." : "Cambios guardados. Si cambió el rol o el estado, el usuario deberá iniciar sesión de nuevo.");
      if (modal.kind === "edit" && modal.user.id === currentUserId) window.dispatchEvent(new Event("conlact:auth-updated"));
      setModal(null);
    } catch (cause) { setModalError(cause instanceof Error ? cause.message : "No se pudo conectar."); }
    finally { setBusy(false); }
  }
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filtered = users.filter(user => normalize(`${user.full_name} ${user.email}`).includes(normalize(query.trim())) && (role === "all" || user.role === role) && (status === "all" || user.is_active === (status === "active")));
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 12, currentPage * 12);
  return <div className="bg-background py-8 sm:py-10"><Container>
    <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Administración", href: "/administracion" }, { label: "Usuarios" }]} />
    <div className="space-y-7">
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#95612e]">Equipo CONLAC‑T</p><h1 className="mt-2 font-headline text-3xl font-bold text-primary sm:text-4xl">Gestión de usuarios</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-muted">Administra las cuentas y los permisos de quienes mantienen el portal.</p></div><Button type="button" onClick={() => open({ kind: "create" })} disabled={loading || busy}><span aria-hidden="true" className="text-xl leading-none">+</span>Nuevo usuario</Button></header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[{ title: "Usuarios del equipo", value: users.length },{ title: "Administradores", value: users.filter(user => user.role === "admin").length },{ title: "Editores", value: users.filter(user => user.role === "editor").length }].map(item => <div key={item.title} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5"><span className="text-sm text-neutral-muted">{item.title}</span><span className="font-headline text-2xl font-bold text-primary">{loading ? "—" : item.value}</span></div>)}</div>
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-[#efece3] p-4 lg:flex-row lg:items-end">
        <div className="flex-1 space-y-1.5"><label htmlFor="users-search" className="block text-xs font-semibold text-primary">Buscar usuario</label><input id="users-search" type="search" maxLength={254} placeholder="Nombre o correo electrónico" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} className={input} /></div>
        <div className="flex flex-wrap items-end gap-3"><div className="min-w-32 flex-1 space-y-1.5"><label htmlFor="users-role" className="block text-xs font-semibold text-primary">Rol</label><select id="users-role" value={role} onChange={event => { setRole(event.target.value); setPage(1); }} className={input}><option value="all">Todos</option><option value="admin">Admin</option><option value="editor">Editor</option></select></div><div className="min-w-32 flex-1 space-y-1.5"><label htmlFor="users-status" className="block text-xs font-semibold text-primary">Estado</label><select id="users-status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className={input}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></div><Button variant="outlined" size="sm" disabled={loading || busy} onClick={() => void refresh()}>Actualizar</Button></div>
      </div>
      {notice && <p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary">{notice}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <section aria-label="Lista de usuarios del equipo" className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-xs text-neutral-muted"><p role="status">{loading ? "Cargando usuarios…" : `${filtered.length} ${filtered.length === 1 ? "usuario" : "usuarios"}`}</p><span>Admin y editor</span></div>
        {!loading && !error && visible.length === 0 && <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center"><UsersIcon className="mx-auto mb-3 h-8 w-8 text-primary/60" /><h2 className="font-headline text-xl text-primary">No hay usuarios que coincidan</h2><p className="mt-2 text-sm text-neutral-muted">Revisa la búsqueda y los filtros, o crea un nuevo usuario.</p></div>}
        {!loading && visible.map(user => <article key={user.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary"><UserIcon /></span><div className="min-w-0"><h2 className="break-words text-sm font-semibold text-primary">{user.full_name}{user.id === currentUserId && <span className="ml-2 text-xs font-normal text-neutral-muted">(Tú)</span>}</h2><p className="mt-1 break-all text-xs text-neutral-muted">{user.email}</p><p className="mt-1 text-[11px] text-neutral-muted">Creado el {new Intl.DateTimeFormat("es-EC", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(user.created_at))}</p></div></div>
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-full border border-tertiary/30 bg-tertiary/10 px-3 py-1 text-xs font-semibold text-[#805128]">{roleLabel(user.role)}</span><span className={`rounded-full border px-3 py-1 text-xs ${user.is_active ? "border-primary/15 bg-primary/5 text-primary" : "border-border bg-background text-neutral-muted"}`}>{user.is_active ? "Activo" : "Inactivo"}</span></div>
          <div className="flex shrink-0 flex-wrap gap-2"><Button type="button" variant="outlined" size="sm" onClick={() => open({ kind: "edit", user })}>Editar<span className="sr-only"> a {user.full_name}</span></Button><button type="button" disabled={user.id === currentUserId} onClick={() => open({ kind: "delete", user })} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-40">Eliminar<span className="sr-only"> a {user.full_name}</span></button></div>
        </article>)}
      </section>
      {pages > 1 && <nav aria-label="Paginación de usuarios" className="flex flex-wrap items-center justify-between gap-3"><Button size="sm" variant="outlined" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</Button><p className="text-xs text-neutral-muted">Página {currentPage} de {pages}</p><Button size="sm" variant="outlined" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Siguiente</Button></nav>}
    </div>
    {modal && <UserDialog title={modal.kind === "create" ? "Nuevo usuario" : modal.kind === "edit" ? "Editar usuario" : "Eliminar usuario"} busy={busy} onClose={() => setModal(null)}>
      {modal.kind === "delete" ? <div className="space-y-5"><p className="break-words text-sm text-neutral-muted">¿Eliminar la cuenta de <strong className="text-primary">{modal.user.full_name}</strong> ({modal.user.email})? Perderá el acceso al portal. Esta acción no se puede deshacer.</p>{modalError && <p role="alert" className="text-sm text-red-700">{modalError}</p>}<div className="flex flex-wrap justify-end gap-3"><Button type="button" variant="outlined" disabled={busy} onClick={() => setModal(null)}>Cancelar</Button><button type="button" disabled={busy} onClick={() => void save()} className="rounded-xl bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">{busy ? "Eliminando…" : "Eliminar usuario"}</button></div></div> : <UserForm target={modal.kind === "edit" ? modal.user : undefined} self={modal.kind === "edit" && modal.user.id === currentUserId} busy={busy} error={modalError} onSave={save} onClose={() => setModal(null)} />}
    </UserDialog>}
  </Container></div>;
}
