"use client";

import React, { useState } from "react";

export function PasswordField({ id, label, value, onChange, disabled, autoComplete, minLength }: {
  id: string; label: string; value: string; onChange: (value: string) => void; disabled?: boolean;
  autoComplete: "current-password" | "new-password"; minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-semibold text-primary">{label}</label>
    <div className="relative">
      <input id={id} name={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete} required minLength={minLength} maxLength={128} disabled={disabled}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 pr-12 text-sm text-primary focus:border-tertiary focus:outline-none focus:ring-2 focus:ring-tertiary/40 disabled:opacity-60" />
      <button type="button" onClick={() => setVisible(!visible)} disabled={disabled} aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`} aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-primary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary">
        <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}
        </svg>
      </button>
    </div>
  </div>;
}
