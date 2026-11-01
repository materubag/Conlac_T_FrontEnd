"use client";

import React from "react";

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
      className="sticky top-0 z-40 bg-[#111c17] text-white border-b border-[#243d30] px-4 sm:px-8 py-2.5 shadow-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Indicador de estado */}
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <span className="text-neutral-200">
            {isDirty ? "Cambios sin guardar" : `Panel de administración · ${pageName}`}
          </span>
        </div>

        {/* Controles de administración */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {extraControls}

          {/* Toggle Modo Edición / Vista Previa */}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
              isEditing
                ? "bg-white text-[#111c17] border-white shadow-xs"
                : "bg-transparent text-white border-white/30 hover:bg-white/10"
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
            onClick={onGuardar}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#d4a373] text-[#2b1a0d] hover:bg-[#c99563] active:scale-95 transition disabled:opacity-50 shadow-xs"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{isSaving ? "Guardando..." : "Guardar cambios"}</span>
          </button>
        </div>
      </div>
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

