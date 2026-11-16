"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { fieldError } from "@/lib/adminValidation";
import { newPasswordError, type AccountUpdateResult } from "@/lib/accountSecurity";

const inputClass = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/40 disabled:opacity-60";

function PasswordField({ id, label, value, onChange, disabled, autoComplete, minLength }: {
  id: string; label: string; value: string; onChange: (value: string) => void; disabled: boolean;
  autoComplete: "current-password" | "new-password"; minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-primary">{label}</label>
    <div className="relative">
      <input id={id} name={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete} required minLength={minLength} maxLength={128} disabled={disabled} className={`${inputClass} pr-12`} />
      <button type="button" onClick={() => setVisible(!visible)} disabled={disabled} aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`} aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-primary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary">
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}
        </svg>
      </button>
    </div>
  </div>;
}

function Feedback({ feedback }: { feedback: { success: boolean; text: string } | null }) {
  if (!feedback) return null;
  return <p role={feedback.success ? "status" : "alert"} className={`rounded-xl border p-3 text-xs leading-relaxed ${feedback.success ? "border-primary/20 bg-primary/5 text-primary" : "border-red-200 bg-red-50 text-red-800"}`}>{feedback.text}</p>;
}

export function AccountSecurityForms({ email, changeEmail, changePassword }: {
  email: string;
  changeEmail: (email: string, currentPassword: string) => Promise<AccountUpdateResult>;
  changePassword: (currentPassword: string, password: string) => Promise<AccountUpdateResult>;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState<"email" | "password" | null>(null);
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; text: string } | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{ success: boolean; text: string } | null>(null);

  const submitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setEmailFeedback(null);
    const normalized = newEmail.trim().toLowerCase();
    const error = !normalized ? "Ingresa el nuevo correo." : fieldError(normalized, "email");
    if (error) { setEmailFeedback({ success: false, text: error }); return; }
    setBusy("email");
    try {
      const result = await changeEmail(normalized, emailPassword);
      setEmailFeedback({ success: result.success, text: result.success ? result.message || "Correo actualizado." : result.error || "No se pudo actualizar el correo." });
      if (result.success) { setEmailPassword(""); setNewEmail(""); }
    } catch { setEmailFeedback({ success: false, text: "No se pudo completar el cambio de correo." }); }
    finally { setBusy(null); }
  };
  const submitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setPasswordFeedback(null);
    const error = newPasswordError(newPassword) || (newPassword !== confirmPassword ? "Las contraseñas nuevas no coinciden." : null);
    if (error) { setPasswordFeedback({ success: false, text: error }); return; }
    setBusy("password");
    try {
      const result = await changePassword(currentPassword, newPassword);
      setPasswordFeedback({ success: result.success, text: result.success ? result.message || "Contraseña actualizada." : result.error || "No se pudo actualizar la contraseña." });
      if (result.success) { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    } catch { setPasswordFeedback({ success: false, text: "No se pudo completar el cambio de contraseña." }); }
    finally { setBusy(null); }
  };

  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
    <form onSubmit={submitEmail} aria-labelledby="change-email-heading" className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
        </span>
        <div><h2 id="change-email-heading" className="font-headline text-lg font-bold text-primary">Cambiar correo</h2><p className="mt-1 text-xs leading-relaxed text-neutral-muted">Actualiza el correo que usas para ingresar.</p></div>
      </div>
      <div className="flex-1 space-y-4">
        <p className="break-all text-xs text-neutral-muted">Correo actual: <span className="font-medium text-primary">{email}</span></p>
        <div className="space-y-1.5"><label htmlFor="account-new-email" className="block text-xs font-semibold text-primary">Nuevo correo electrónico</label>
          <input id="account-new-email" name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} value={newEmail} onChange={(event) => setNewEmail(event.target.value)} disabled={Boolean(busy)} className={inputClass} placeholder="nombre@correo.com" />
        </div>
        <PasswordField id="email-current-password" label="Contraseña actual" value={emailPassword} onChange={setEmailPassword} autoComplete="current-password" disabled={Boolean(busy)} />
        <Feedback feedback={emailFeedback} />
      </div>
      <Button type="submit" variant="primary" size="md" fullWidth disabled={Boolean(busy)} className="mt-6">{busy === "email" ? "Actualizando…" : "Actualizar correo"}</Button>
    </form>

    <form onSubmit={submitPassword} aria-labelledby="change-password-heading" className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" /></svg>
        </span>
        <div><h2 id="change-password-heading" className="font-headline text-lg font-bold text-primary">Cambiar contraseña</h2><p className="mt-1 text-xs leading-relaxed text-neutral-muted">Elige una contraseña nueva para tu cuenta.</p></div>
      </div>
      <div className="flex-1 space-y-4">
        <PasswordField id="password-current" label="Contraseña actual" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" disabled={Boolean(busy)} />
        <PasswordField id="password-new" label="Nueva contraseña" value={newPassword} onChange={setNewPassword} autoComplete="new-password" minLength={8} disabled={Boolean(busy)} />
        <p className="text-xs leading-relaxed text-neutral-muted">De 8 a 128 caracteres, con al menos una letra y un número.</p>
        <PasswordField id="password-confirm" label="Confirmar nueva contraseña" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" minLength={8} disabled={Boolean(busy)} />
        <Feedback feedback={passwordFeedback} />
      </div>
      <Button type="submit" variant="primary" size="md" fullWidth disabled={Boolean(busy)} className="mt-6">{busy === "password" ? "Actualizando…" : "Actualizar contraseña"}</Button>
    </form>
  </div>;
}
