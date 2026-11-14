"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminPageBar } from "@/components/admin/AdminPageBar";
import { adminResponseError } from "@/lib/adminValidation";
import { HomeEditingContext } from "./HomeEditing";
import { HomeSection } from "./HomeControls";
import { Hero } from "./Hero";
import { TrustSection } from "./TrustSection";
import { FeaturedProducts } from "./FeaturedProducts";
import { CategoryAccessCards } from "./CategoryAccessCards";
import { TestimonialsSection } from "./TestimonialsSection";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";
import type { HomeContent, HomeAccessCard, HomeTestimonial, HomeSectionKey } from "@/types/home";
import type { Producto } from "@/types";

export function HomeManager({ initialConfig, products, cards, testimonials }: {
  initialConfig: PaginaEditableConfig<HomeContent>; products: Producto[]; cards: HomeAccessCard[]; testimonials: HomeTestimonial[];
}) {
  const { canEdit } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [isEditing, setIsEditing] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentTestimonials, setCurrentTestimonials] = useState(testimonials);
  const [testimonialsDirty, setTestimonialsDirty] = useState(false);
  const [sourceTestimonials, setSourceTestimonials] = useState(testimonials);
  if (sourceTestimonials !== testimonials) {
    setSourceTestimonials(testimonials);
    if (!testimonialsDirty) setCurrentTestimonials(testimonials);
  }

  const markDirty = () => { setIsDirty(true); setMessage(null); };
  const setSectionHidden = (section: HomeSectionKey, hidden: boolean) => {
    setConfig((current) => ({ ...current, contenido: { ...current.contenido,
      hidden_sections: { ...current.contenido.hidden_sections, [section]: hidden } } }));
    markDirty();
  };
  const setPillars = (pillars: HomeContent["trust"]["pillars"]) => {
    setConfig((current) => ({ ...current, contenido: { ...current.contenido, trust: { ...current.contenido.trust, pillars } } }));
    markDirty();
  };
  const setTestimonials = (items: HomeTestimonial[]) => {
    setCurrentTestimonials(items); setTestimonialsDirty(true); markDirty();
  };

  const update = (path: string, value: string) => {
    setConfig((current) => {
      const copy = structuredClone(current);
      const keys = path.split(".");
      let target = copy as unknown as Record<string, unknown>;
      for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
      target[keys[keys.length - 1]] = value;
      return copy;
    });
    setIsDirty(true); setMessage(null);
  };
  const save = async () => {
    setIsSaving(true); setMessage(null);
    try {
      const response = await fetch("/api/admin/paginas/home", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, ...(testimonialsDirty ? { testimonios: currentTestimonials } : {}) }),
      });
      if (!response.ok) throw new Error(await adminResponseError(response));
      setIsDirty(false); setTestimonialsDirty(false); setMessage("Cambios de la portada guardados."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudieron guardar los cambios."); }
    finally { setIsSaving(false); }
  };

  return <HomeEditingContext.Provider value={{ config, isEditing: canEdit && isEditing, update, setSectionHidden, setPillars, testimonials: currentTestimonials, setTestimonials }}>
    <div className="relative bg-background">
      {canEdit && <AdminPageBar pageName="Inicio" isEditing={isEditing} setIsEditing={setIsEditing} isDirty={isDirty} isSaving={isSaving} onGuardar={save} />}
      {message && <div role="status" className="mx-auto max-w-7xl px-4 py-3 text-sm text-primary">{message}</div>}
      <HomeSection section="hero" title="Presentación principal"><Hero /></HomeSection>
      <HomeSection section="products" title="Productos destacados"><FeaturedProducts products={products} /></HomeSection>
      <HomeSection section="trust" title="Garantía y Procedencia"><TrustSection /></HomeSection>
      <HomeSection section="access" title="Asociaciones, recetas y turismo"><CategoryAccessCards cards={cards} /></HomeSection>
      <HomeSection section="testimonials" title="Testimonios"><TestimonialsSection /></HomeSection>
    </div>
  </HomeEditingContext.Provider>;
}
