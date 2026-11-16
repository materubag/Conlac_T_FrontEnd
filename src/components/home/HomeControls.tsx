"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { useHomeEditing } from "./HomeEditing";
import type { HomeSectionKey } from "@/types/home";

export function HomeSection({ section, title, children }: {
  section: HomeSectionKey; title: string; children: React.ReactNode;
}) {
  const { config, isEditing, setSectionHidden } = useHomeEditing();
  const hidden = config.contenido.hidden_sections?.[section] === true;
  if (hidden && !isEditing) return null;
  return <div className={isEditing && hidden ? "outline-1 -outline-offset-1 outline-dashed outline-tertiary/60" : ""}>
    {isEditing && <div className="border-b border-border bg-background py-3">
      <Container className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-primary">{title}</span>
        <button type="button" role="switch" aria-checked={!hidden} aria-label={`Mostrar sección: ${title}`}
          onClick={() => setSectionHidden(section, !hidden)}
          className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary">
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
            {hidden && <path d="m3 3 18 18" />}
          </svg>
          {hidden ? "Oculta al público" : "Sección visible"}
          <span aria-hidden="true" className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors ${hidden ? "border-tertiary bg-tertiary/30" : "border-primary bg-primary"}`}>
            <span className={`h-4 w-4 rounded-full bg-surface shadow-sm transition-transform ${hidden ? "translate-x-0" : "translate-x-5"}`} />
          </span>
        </button>
      </Container>
    </div>}
    {children}
  </div>;
}

export function AddHomeCard({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-tertiary/70 bg-background/50 p-6 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary">
    <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-tertiary/20 text-2xl text-primary">+</span>
    {label}
  </button>;
}

export function DeleteHomeCard({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M9 6V4h6v2M5 6l1 15h12l1-15M10 10v7M14 10v7" /></svg>
    Borrar
  </button>;
}
