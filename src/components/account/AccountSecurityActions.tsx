"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChangeEmailModal } from "./ChangeEmailModal";
import type { AccountActionResult } from "@/types/auth";

export function AccountSecurityActions({ email, changeEmail, verifyEmailChange }: {
  email: string; changeEmail: (email: string, password: string) => Promise<AccountActionResult>;
  verifyEmailChange: (requestId: string, code: string) => Promise<AccountActionResult>;
}) {
  const [emailModal, setEmailModal] = useState(false);
  return <>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-primary">Correo electrónico</h2><p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-muted">Actualiza la dirección que utilizas para iniciar sesión.</p>
        <Button type="button" variant="outlined" fullWidth className="mt-5" onClick={() => setEmailModal(true)}>Cambiar correo</Button>
      </div>
      <div className="flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-headline text-lg font-bold text-primary">Contraseña</h2><p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-muted">Recibe un código de seis dígitos por correo y crea tu nueva contraseña.</p>
        <Button href="/recuperar-password" variant="outlined" fullWidth className="mt-5">Cambiar contraseña</Button>
      </div>
    </div>
    {emailModal && <ChangeEmailModal email={email} changeEmail={changeEmail} verifyEmailChange={verifyEmailChange} onClose={() => setEmailModal(false)} />}
  </>;
}
