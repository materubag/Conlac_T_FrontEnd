"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { validateAdminFields } from "@/lib/adminValidation";

interface AdminPageBarProps {
  pageName: string;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  isDirty: boolean;
  isSaving: boolean;
  onGuardar: () => void;
  extraControls?: React.ReactNode;
}

export function AdminPageBar({
  pageName,
  isEditing,
  setIsEditing,
  isDirty,
  isSaving,
  onGuardar,
  extraControls,
}: AdminPageBarProps) {
  return (
    <aside
      aria-label={`Barra de administración en vivo · ${pageName}`}
      // El navbar mide h-20: la barra de edición permanece debajo de él.
      className="sticky top-20 z-30 border-b border-tertiary/40 bg-background text-primary shadow-sm"
    >
      <Container className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        {/* Indicador de estado */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 shrink-0 rounded-full transition-colors ${
              isDirty ? "bg-amber-600" : "bg-primary"
            }`}
          />
          <div className="min-w-0">
            <p className="text-xs font-label font-semibold uppercase tracking-wider text-neutral-muted">
              Administración · {pageName}
            </p>
            <p role="status" className="mt-0.5 text-xs text-neutral-muted">
              {isSaving ? "Guardando cambios…" : isDirty ? "Tienes cambios sin guardar" : "Sin cambios pendientes"}
            </p>
          </div>
        </div>

        {/* Controles de administración */}
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:gap-3">
          {extraControls}

          {/* Toggle Modo Edición / Vista Previa */}
          <button
            type="button"
            aria-pressed={isEditing}
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 sm:flex-none ${
              isEditing
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                : "border-border bg-surface text-neutral hover:border-primary/40 hover:bg-neutral-light/50"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isEditing ? (
                <>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
            <span>{isEditing ? "Modo edición activo" : "Vista previa"}</span>
          </button>

          {/* Botón único Guardar Cambios */}
          <button
            type="button"
            disabled={isSaving}
            onClick={(event) => {
              const root = event.currentTarget.closest("aside")?.parentElement;
              if (root && validateAdminFields(root)) onGuardar();
            }}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-tertiary bg-tertiary px-4 py-2 text-xs font-bold text-neutral hover:bg-tertiary-hover transition-colors disabled:cursor-wait disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:flex-none"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{isSaving ? "Guardando..." : "Guardar cambios"}</span>
          </button>
        </div>
      </Container>
    </aside>
  );
}

export function AdminBadgeHelp({
  message = "Todos los recuadros con borde azul punteado son editables directamente.",
}: {
  message?: string;
}) {
  return (
    <div className="relative inline-flex items-center mt-3 group">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold cursor-help shadow-2xs hover:bg-blue-100 transition">
        <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
          !
        </span>
        <span>Modo edición activo</span>
      </div>
      {/* Popover / Tooltip informativo en hover */}
      <div className="pointer-events-none absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 w-72 p-3 bg-neutral-900 text-white text-xs rounded-xl shadow-xl leading-relaxed">
        {message}
        <div className="absolute top-full left-5 -mt-1 border-4 border-transparent border-t-neutral-900" />
      </div>
    </div>
  );
}

