"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { UserIcon } from "@/components/ui/Icons";

interface AdminAccountMenuProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const entries = [
  { href: "/mi-cuenta", label: "Mi perfil y datos", icon: "profile" },
  { href: "/seguimiento", label: "Buscar pedidos", icon: "search" },
  { href: "/administracion", label: "Panel de administración", icon: "panel" },
  { href: "/tienda", label: "Gestión de tienda", icon: "store" },
  { href: "/administracion/usuarios", label: "Gestión de usuarios", icon: "profile" },
] as const;

function AccountIcon({ name }: { name: typeof entries[number]["icon"] | "logout" }) {
  if (name === "profile") return <UserIcon />;
  return <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {name === "search" && <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>}
    {name === "panel" && <><rect x="3" y="12" width="4" height="9" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="17" y="3" width="4" height="18" rx="1" /></>}
    {name === "store" && <><path d="m3 9 2-6h14l2 6M4 9v12h16V9M9 21v-7h6v7" /><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>}
    {name === "logout" && <><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M8 12h13" /></>}
  </svg>;
}

export function AdminAccountMenu({ isOpen, onOpenChange }: AdminAccountMenuProps) {
  const { user, profile, logout, isAdmin } = useAuth();
  const roleLabel = isAdmin ? "Admin" : "Editor";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const displayName = profile?.full_name || user?.user_metadata?.full_name || "Administrador CONLAC‑T";
  const initials = String(displayName).trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "AC";

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) onOpenChange(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onOpenChange]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onOpenChange(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div ref={rootRef} className="relative shrink-0" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) onOpenChange(false);
    }}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Cuenta ${roleLabel}: ${displayName}`}
        onClick={() => onOpenChange(!isOpen)}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border p-1.5 text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 sm:gap-3 sm:pr-4 ${isOpen ? "border-tertiary/60 bg-neutral-light/80" : "border-border/60 bg-neutral-light/50 hover:border-tertiary/60 hover:bg-neutral-light"}`}
      >
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-tertiary">{initials}</span>
        <span className="hidden flex-col items-start text-left leading-tight sm:flex">
          <span className="text-[11px] font-medium text-neutral-muted">{roleLabel}</span>
          <span className="text-xs font-semibold whitespace-nowrap">CONLAC‑T</span>
        </span>
        <svg aria-hidden="true" className={`hidden h-4 w-4 text-primary/70 transition-transform sm:block ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m6 9 6 6 6-6" /></svg>
      </button>

      {isOpen && (
        <div id={panelId} className="fixed inset-x-4 top-[5.5rem] z-50 max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-2xl border border-border/70 bg-surface p-2 shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-88">
          <div className="mb-2 rounded-xl border border-border/40 bg-background/70 px-4 py-3">
            <p className="break-words text-sm font-semibold text-primary">{displayName}</p>
            {user?.email && <p className="mt-1 break-all text-xs text-neutral-muted">{user.email}</p>}
          </div>
          <nav aria-label={`Opciones de la cuenta ${roleLabel}`} className="space-y-1">
            {entries.filter(entry => entry.href !== "/administracion/usuarios" || isAdmin).map((entry) => (
              <Link key={entry.href} href={entry.href} onClick={() => onOpenChange(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-tertiary">
                <span className="text-primary/60"><AccountIcon name={entry.icon} /></span>
                {entry.label}
              </Link>
            ))}
          </nav>
          <div className="mt-2 border-t border-border pt-2">
            <button type="button" disabled={isLoggingOut} onClick={handleLogout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400 disabled:opacity-50">
              <AccountIcon name="logout" />
              {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
