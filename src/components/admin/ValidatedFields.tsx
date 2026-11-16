"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { fieldError, getAdminRule, type AdminFieldRule } from "@/lib/adminValidation";

type Common = { rule: AdminFieldRule; optional?: boolean };

function useValidation(value: unknown, rule: AdminFieldRule, optional: boolean, required = false) {
  const external = String(value ?? "");
  const [state, setState] = useState({ external, draft: external });
  if (state.external !== external) setState({ external, draft: external });
  const [touched, setTouched] = useState(false);
  const draft = state.external === external ? state.draft : external;
  const error = required && !draft.trim() ? "Este campo es obligatorio." : fieldError(draft, rule, optional);
  const id = useId();
  return { draft, error, id, touched, setTouched, update: (text: string) => {
    setState({ external, draft: text }); setTouched(true);
  } };
}

function FieldFeedback({ id, error, length, maxLength, touched }: {
  id: string; error: string | null; length: number; maxLength: number; touched: boolean;
}) {
  return <>
    <span className="pointer-events-none absolute bottom-0 right-1 translate-y-full text-[10px] text-neutral-muted opacity-0 group-focus-within/field:opacity-100">{length}/{maxLength}</span>
    {error && touched && <span id={id} role="alert" className="mt-1 block rounded bg-red-50 px-2 py-1 text-[11px] text-red-800">{error}</span>}
  </>;
}

export function ValidatedInput({ rule, optional = false, onChange, onBlur, value, ...props }:
  React.InputHTMLAttributes<HTMLInputElement> & Common) {
  const ref = useRef<HTMLInputElement>(null);
  const v = useValidation(value, rule, optional, props.required);
  const limits = getAdminRule(rule);
  useEffect(() => { ref.current?.setCustomValidity(v.error ?? ""); }, [v.error]);
  return <div className="group/field relative min-w-0">
    <input {...props} ref={ref} data-admin-field={rule} value={v.draft}
      type={limits.min !== undefined ? "text" : props.type ?? "text"}
      inputMode={limits.min !== undefined ? limits.decimals === 0 ? "numeric" : "decimal" : props.inputMode}
      maxLength={limits.maxLength} required={(limits.required && !optional) || props.required}
      aria-invalid={Boolean(v.error)} aria-describedby={v.error && v.touched ? v.id : props["aria-describedby"]}
      onBlur={(event) => { v.setTouched(true); onBlur?.(event); }}
      onChange={(event) => {
        v.update(event.target.value);
        // Los borradores numéricos inválidos nunca se convierten a 0 ni se truncan.
        if (limits.min === undefined || !fieldError(event.target.value, rule, optional)) onChange?.(event);
      }} />
    <FieldFeedback id={v.id} error={v.error} touched={v.touched} length={v.draft.length} maxLength={limits.maxLength} />
  </div>;
}

export function ValidatedTextarea({ rule, optional = false, autoResize = false, onChange, onBlur, value, ...props }:
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & Common & { autoResize?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const v = useValidation(value, rule, optional, props.required);
  const limits = getAdminRule(rule);
  useEffect(() => { ref.current?.setCustomValidity(v.error ?? ""); }, [v.error]);
  useEffect(() => {
    if (autoResize && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.max(ref.current.scrollHeight, 28)}px`;
    }
  }, [autoResize, v.draft]);
  return <div className="group/field relative min-w-0">
    <textarea {...props} ref={ref} data-admin-field={rule} value={v.draft}
      maxLength={limits.maxLength} required={(limits.required && !optional) || props.required}
      aria-invalid={Boolean(v.error)} aria-describedby={v.error && v.touched ? v.id : props["aria-describedby"]}
      onBlur={(event) => { v.setTouched(true); onBlur?.(event); }}
      onChange={(event) => { v.update(event.target.value); onChange?.(event); }} />
    <FieldFeedback id={v.id} error={v.error} touched={v.touched} length={v.draft.length} maxLength={limits.maxLength} />
  </div>;
}
