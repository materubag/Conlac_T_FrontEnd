"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { PasswordField } from "./PasswordField";
import { newPasswordError } from "@/lib/passwordPolicy";

export function PasswordRecoveryFlow({ initialEmail = "", onPasswordChanged }: { initialEmail?: string; onPasswordChanged: () => Promise<void> }) {
  const [step, setStep] = useState<"email" | "code" | "password" | "done">("email");
  const [email, setEmail] = useState(initialEmail);
  const [requestId, setRequestId] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick(); const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [resendAt]);
  async function action(payload: Record<string, string>) {
    const response = await fetch("/api/auth/recuperar-password", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok || !result.success) {
      const retry = Number(response.headers.get("Retry-After"));
      if (retry > 0) setResendAt(Date.now() + retry * 1000);
      throw new Error(result.error || "No se pudo completar la operación.");
    }
    return result;
  }
  async function requestCode() {
    const result = await action({ action: "request", email: email.trim() });
    setRequestId(result.requestId); setCode(""); setResendAt(Date.now() + result.resendAfter * 1000); setStep("code");
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (step === "email") await requestCode();
      else if (step === "code") {
        await action({ action: "verify", requestId, code }); setCode(""); setStep("password");
      } else if (step === "password") {
        const invalid = newPasswordError(password);
        if (invalid) throw new Error(invalid);
        if (password !== confirmation) throw new Error("Las contraseñas no coinciden.");
        await action({ action: "reset", password, confirmation });
        setPassword(""); setConfirmation(""); setStep("done");
        // El servidor ya revocó las sesiones; un fallo de red al salir no revierte el cambio.
        try { await onPasswordChanged(); } catch { /* Mantener la confirmación del cambio completado. */ }
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo conectar. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }
  async function restart() {
    setBusy(true); setError("");
    try { await action({ action: "cancel" }); setStep("email"); setCode(""); setPassword(""); setConfirmation(""); }
    catch { setError("No se pudo reiniciar. Inténtalo de nuevo."); }
    finally { setBusy(false); }
  }
  const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-tertiary/50";
  return <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-10">
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-tertiary">Seguridad de la cuenta</p>
      <h1 className="font-headline text-3xl font-bold text-primary">Cambiar contraseña</h1>
      {step !== "done" && <ol aria-label="Pasos de recuperación" className="flex gap-3 text-xs text-neutral-muted"><li aria-current={step === "email" ? "step" : undefined}>1. Correo</li><li aria-current={step === "code" ? "step" : undefined}>2. Código</li><li aria-current={step === "password" ? "step" : undefined}>3. Contraseña</li></ol>}
    </div>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {step === "done" ? <div role="status" className="space-y-4"><p className="text-sm text-primary">Tu contraseña se actualizó. Inicia sesión con la nueva contraseña.</p><Link href="/login" className="block rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white">Iniciar sesión</Link></div> : <form onSubmit={submit} className="space-y-5">
      {step === "email" && <div className="space-y-3"><p className="text-sm text-neutral-muted">Te enviaremos un código de seis dígitos al correo de tu cuenta.</p><label htmlFor="recovery-email" className="block text-sm font-semibold text-primary">Correo electrónico</label><input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} disabled={busy} onChange={e => setEmail(e.target.value)} className={inputClass} /></div>}
      {step === "code" && <div className="space-y-3"><p className="text-sm text-neutral-muted">Si existe una cuenta con {email}, recibirás un código. Revisa también spam. Vence en 10 minutos y permite hasta 5 intentos.</p><label htmlFor="recovery-code" className="block text-sm font-semibold text-primary">Código de seis dígitos</label><input id="recovery-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} disabled={busy} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className={`${inputClass} text-center text-2xl tracking-[0.4em]`} /></div>}
      {step === "password" && <><p className="text-sm text-neutral-muted">Usa entre 8 y 128 caracteres, con al menos una letra y un número. Completa este paso en 5 minutos.</p><PasswordField id="recovery-password" label="Nueva contraseña" autoComplete="new-password" minLength={8} value={password} onChange={setPassword} disabled={busy} /><PasswordField id="recovery-confirmation" label="Confirmar nueva contraseña" autoComplete="new-password" minLength={8} value={confirmation} onChange={setConfirmation} disabled={busy} /></>}
      <button type="submit" disabled={busy} className="w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-hover disabled:opacity-60">{busy ? "Procesando…" : step === "email" ? "Enviar código" : step === "code" ? "Verificar código" : "Guardar nueva contraseña"}</button>
      {step === "code" && <button type="button" disabled={busy || remaining > 0} className="w-full text-sm font-semibold text-primary underline disabled:opacity-50" onClick={async () => { setBusy(true); setError(""); try { await requestCode(); } catch (cause) { setError(cause instanceof Error ? cause.message : "No se pudo reenviar."); } finally { setBusy(false); } }}>{remaining > 0 ? `Reenviar en ${remaining} s` : "Reenviar código"}</button>}
      {step !== "email" && <button type="button" disabled={busy} onClick={restart} className="w-full text-sm text-primary underline">Empezar de nuevo</button>}
    </form>}
    {step !== "done" && <Link href="/login" className="block text-center text-sm text-primary underline">Volver al inicio de sesión</Link>}
  </div>;
}
