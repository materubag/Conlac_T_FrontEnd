"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { fieldError } from "@/lib/adminValidation";
import { PasswordField } from "./PasswordField";
import type { AccountActionResult } from "@/types/auth";

export function ChangeEmailModal({ email, changeEmail, verifyEmailChange, onClose }: {
  email: string; changeEmail: (email: string, password: string) => Promise<AccountActionResult>; onClose: () => void;
  verifyEmailChange: (requestId: string, code: string) => Promise<AccountActionResult>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [requestId, setRequestId] = useState("");
  const [code, setCode] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [resendAt]);
  useEffect(() => { if (requestId) codeRef.current?.focus(); }, [requestId]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);
  const sendCode = async () => {
    if (busy) return;
    setError(null);
    const normalized = newEmail.trim().toLowerCase();
    const invalid = normalized ? fieldError(normalized, "email") : "Ingresa el nuevo correo.";
    if (invalid) { setError(invalid); return; }
    setBusy(true);
    try {
      const result = await changeEmail(normalized, password);
      if (result.retryAfter) setResendAt(Date.now() + result.retryAfter * 1000);
      if (!result.success) setError(result.error || "No se pudo actualizar el correo.");
      else if (result.requestId) {
        setNewEmail(normalized); setRequestId(result.requestId); setCode("");
        setResendAt(Date.now() + (result.resendAfter || 60) * 1000);
      } else setError("No se pudo iniciar la verificación del correo.");
    } catch { setError("No se pudo conectar con el servidor."); }
    finally { setBusy(false); }
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (!requestId) { await sendCode(); return; }
    if (!/^\d{6}$/.test(code)) { setError("Ingresa el código de seis dígitos."); return; }
    setBusy(true); setError(null);
    try {
      const result = await verifyEmailChange(requestId, code);
      if (!result.success) setError(result.error || "No se pudo verificar el correo.");
      else { setSuccess(result.message || "Correo verificado y actualizado correctamente."); setPassword(""); setCode(""); }
    } catch { setError("No se pudo conectar con el servidor."); }
    finally { setBusy(false); }
  };
  return <dialog ref={dialogRef} aria-labelledby="change-email-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}
    className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-border bg-surface p-0 text-primary shadow-2xl backdrop:bg-primary/40 backdrop:backdrop-blur-sm">
    <div className="p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-3"><h2 id="change-email-title" className="font-headline text-2xl font-bold">Cambiar correo</h2>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar cambio de correo" className="flex h-10 w-10 items-center justify-center rounded-xl text-xl hover:bg-neutral-light focus-visible:ring-2 focus-visible:ring-tertiary">×</button>
      </div>
      {success ? <div className="space-y-5"><p role="status" className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm">{success}</p><Button onClick={onClose} fullWidth>Listo</Button></div> : <form onSubmit={submit} className="space-y-5">
        <p className="break-all text-sm text-neutral-muted">Correo actual: <span className="font-semibold text-primary">{email}</span></p>
        {requestId ? <div className="space-y-4">
          <p role="status" className="break-words text-sm leading-relaxed text-neutral-muted">Enviamos un código a <strong className="text-primary">{newEmail}</strong>. Ingresa los seis dígitos para confirmar el cambio. Vence en 10 minutos y permite hasta 5 intentos.</p>
          <div className="space-y-1.5"><label htmlFor="modal-email-code" className="block text-xs font-semibold">Código de verificación</label>
            <input ref={codeRef} id="modal-email-code" type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" minLength={6} maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} disabled={busy}
              className="w-full rounded-xl border border-border bg-background px-3 py-3 text-center text-2xl tracking-[0.4em] text-primary focus:outline-none focus:ring-2 focus:ring-tertiary/40" />
          </div>
          <button type="button" onClick={sendCode} disabled={busy || remaining > 0} className="block w-full text-sm font-semibold text-primary underline disabled:opacity-50">{remaining > 0 ? `Reenviar en ${remaining} s` : "Reenviar código"}</button>
          <button type="button" onClick={() => { setRequestId(""); setCode(""); setError(null); }} disabled={busy} className="block w-full text-sm text-primary underline">Cambiar dirección de correo</button>
        </div> : <>
        <div className="space-y-1.5"><label htmlFor="modal-new-email" className="block text-xs font-semibold">Nuevo correo electrónico</label>
          <input autoFocus id="modal-new-email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} value={newEmail} onChange={(event) => setNewEmail(event.target.value)} disabled={busy}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/40" />
        </div>
        <PasswordField id="modal-email-password" label="Contraseña actual" value={password} onChange={setPassword} autoComplete="current-password" disabled={busy} />
        <p className="text-xs leading-relaxed text-neutral-muted">Enviaremos un código al nuevo correo. Tu dirección actual se mantiene hasta verificarlo.</p>
        </>}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}</p>}
        <div className="flex gap-3"><Button type="button" onClick={onClose} disabled={busy} variant="outlined" fullWidth>Cancelar</Button><Button type="submit" disabled={busy} fullWidth>{busy ? "Procesando…" : requestId ? "Verificar y cambiar" : "Enviar código"}</Button></div>
      </form>}
    </div>
  </dialog>;
}
