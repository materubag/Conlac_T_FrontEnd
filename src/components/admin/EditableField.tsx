"use client";

import React, { useRef, useEffect } from "react";

interface EditableFieldProps {
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  renderStatic?: () => React.ReactNode;
  placeholder?: string;
  // retrocompatibilidad
  type?: "input" | "textarea";
  rows?: number;
}

export function EditableField({
  isEditing,
  value,
  onChange,
  label = "Clic para editar",
  className = "",
  renderStatic,
  placeholder = "Escribe aquí...",
}: EditableFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 28)}px`;
    }
  };

  useEffect(() => {
    if (isEditing) {
      autoResize();
    }
  }, [value, isEditing]);

  if (!isEditing) {
    if (renderStatic) return <>{renderStatic()}</>;
    return <span className={className}>{value}</span>;
  }

  return (
    <div className="relative group w-full">
      {/* Tooltip en hover / focus */}
      <div className="pointer-events-none absolute -top-7 left-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150 z-30 flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 rounded-md px-2 py-0.5 shadow-sm whitespace-nowrap">
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
        </svg>
        <span>{label}</span>
        <div className="absolute top-full left-3 -mt-0.5 border-4 border-transparent border-t-blue-600" />
      </div>

      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          autoResize();
        }}
        placeholder={placeholder}
        className={`${className} w-full overflow-hidden resize-none bg-transparent border-2 border-dashed border-blue-400 hover:border-blue-600 focus:border-blue-600 focus:bg-white focus:outline-none rounded-xl p-2 transition-colors leading-relaxed block`}
      />
    </div>
  );
}
