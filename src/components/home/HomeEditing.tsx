"use client";

import React, { createContext, useContext } from "react";
import { EditableField } from "@/components/admin/EditableField";
import { Button } from "@/components/ui/Button";
import type { AdminFieldRule } from "@/lib/adminValidation";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";
import type { HomeContent, HomeSectionKey, HomeTestimonial } from "@/types/home";

export interface HomeEditingState {
  config: PaginaEditableConfig<HomeContent>;
  isEditing: boolean;
  update: (path: string, value: string) => void;
  setSectionHidden: (section: HomeSectionKey, hidden: boolean) => void;
  setPillars: (pillars: HomeContent["trust"]["pillars"]) => void;
  testimonials: HomeTestimonial[];
  setTestimonials: (testimonials: HomeTestimonial[]) => void;
}
export const HomeEditingContext = createContext<HomeEditingState | null>(null);
export function useHomeEditing() {
  const context = useContext(HomeEditingContext);
  if (!context) throw new Error("El contenido de Home necesita su proveedor de edición.");
  return context;
}

export function HomeField({ path, rule, label, as: Tag = "span", className = "", id }: {
  path: string; rule: AdminFieldRule; label: string;
  as?: "span" | "p" | "h1" | "h2" | "h3"; className?: string; id?: string;
}) {
  const { config, isEditing, update } = useHomeEditing();
  const value = path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : "", config);
  return <EditableField rule={rule} isEditing={isEditing} value={String(value ?? "")} label={label}
    onChange={(text) => update(path, text)} className={className}
    renderStatic={() => <Tag id={id} className={className}>{String(value ?? "")}</Tag>} />;
}

export function HomeSectionHeading({ section, id, centered = false }: {
  section: "products" | "trust" | "access" | "testimonials"; id: string; centered?: boolean;
}) {
  return <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
    <HomeField path={`contenido.${section}.eyebrow`} rule="short" label="Categoría de la sección" className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold" />
    <div className="mt-2"><HomeField path={`contenido.${section}.title`} rule="title" label="Título de la sección" as="h2" id={id} className="text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary" /></div>
    <div className="mt-3"><HomeField path={`contenido.${section}.description`} rule="subtitle" label="Descripción de la sección" as="p" className="text-sm sm:text-base text-neutral-muted" /></div>
  </div>;
}

export function HomeAction({ path, href, external = false, primary = false, icon }: {
  path: string; href: string; external?: boolean; primary?: boolean; icon?: React.ReactNode;
}) {
  const { config, isEditing } = useHomeEditing();
  const label = path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" ? (current as Record<string, unknown>)[key] : "", config);
  if (isEditing) return <div className={`flex min-w-40 items-center gap-2 rounded-xl border-2 px-3 py-2 ${primary ? "border-primary bg-primary text-inverted" : "border-primary text-primary"}`}>
    {icon}<HomeField path={path} rule="short" label="Texto del botón" className={primary ? "text-inverted text-sm font-semibold" : "text-primary text-sm font-semibold"} />
  </div>;
  return <Button href={href} isExternal={external} variant={primary ? "primary" : "outlined"} size="lg" className="w-full sm:w-auto">
    {icon}<span>{String(label ?? "")}</span>
  </Button>;
}
