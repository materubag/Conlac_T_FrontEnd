import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ChefHatIcon } from "@/components/ui/Icons";
import { HomeField, HomeSectionHeading, useHomeEditing } from "./HomeEditing";
import { AddHomeCard, DeleteHomeCard } from "./HomeControls";
import { EditableField } from "@/components/admin/EditableField";
import type { HomeTestimonial } from "@/types/home";

export function TestimonialsSection() {
  const { isEditing, testimonials, setTestimonials } = useHomeEditing();
  const updateCard = (id: string, patch: Partial<HomeTestimonial>) => setTestimonials(testimonials.map((item) => item.id === id ? { ...item, ...patch } : item));

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-16 sm:py-20 bg-background border-b border-border/60"
    >
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <HomeSectionHeading section="testimonials" id="testimonials-heading" />
          </div>
          <ChefHatIcon className="hidden sm:block h-10 w-10 text-tertiary/70 flex-shrink-0" />
        </div>

        {isEditing && <p className="mb-5 text-xs text-neutral-muted">Los cambios en estas tarjetas también se reflejan en <Link href="/nosotros" className="font-semibold text-primary underline">Nosotros</Link>.</p>}
        {testimonials.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <HomeField path="contenido.testimonials.empty" rule="subtitle" label="Mensaje cuando no hay testimonios" as="p" className="text-sm text-neutral-muted" />
          </div>
        )}
        {(testimonials.length > 0 || isEditing) && (
          <div
            className={`grid gap-6 ${
              testimonials.length === 1
                ? "grid-cols-1 max-w-xl mx-auto"
                : testimonials.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {testimonials.map((item) => (
              <figure
                key={item.id}
                className="flex flex-col justify-between rounded-2xl bg-surface p-6 sm:p-7 border border-border/80 shadow-sm hover:border-tertiary/60 transition-all duration-200"
              >
                <div className="space-y-3">
                  {isEditing && <div className="flex justify-end"><DeleteHomeCard label={`Borrar testimonio de ${item.name || "autor sin nombre"}`} onClick={() => setTestimonials(testimonials.filter((card) => card.id !== item.id))} /></div>}
                  {item.rating !== undefined && item.rating > 0 && (
                    <div className="flex items-center gap-1 mb-3 text-tertiary" aria-label={`Calificación: ${Math.min(5, item.rating)} de 5`}>
                      {Array.from({ length: Math.min(5, item.rating) }).map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                  )}
                  <EditableField isEditing={isEditing} rule="description" required value={item.quote} label="Texto del testimonio" placeholder="Escribe el testimonio…" onChange={(value) => updateCard(item.id, { quote: value })}
                    className="text-sm sm:text-base leading-relaxed text-neutral-muted italic font-serif"
                    renderStatic={() => <blockquote className="text-sm sm:text-base leading-relaxed text-neutral-muted italic font-serif">{item.quote}</blockquote>} />
                </div>

                <figcaption className="mt-6 border-t border-border/70 pt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm font-headline flex-shrink-0">
                    {item.name ? item.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <EditableField isEditing={isEditing} rule="title" value={item.name} label="Nombre del autor" placeholder="Nombre del autor…" onChange={(value) => updateCard(item.id, { name: value })}
                      className="font-label text-sm font-bold text-primary" renderStatic={() => <p className="font-label text-sm font-bold text-primary">{item.name}</p>} />
                    {(item.role || isEditing) && <EditableField isEditing={isEditing} rule="detail" value={item.role} label="Cargo o referencia del autor" placeholder="Cargo o referencia (opcional)…" onChange={(value) => updateCard(item.id, { role: value })}
                      className="text-xs text-neutral-muted" renderStatic={() => <p className="text-xs text-neutral-muted">{item.role}</p>} />}
                  </div>
                </figcaption>
              </figure>
            ))}
            {isEditing && <AddHomeCard label="Añadir testimonio" onClick={() => setTestimonials([...testimonials, { id: crypto.randomUUID(), quote: "", name: "", role: "" }])} />}
          </div>
        )}
        {isEditing && testimonials.length > 0 && <div className="mt-6"><HomeField path="contenido.testimonials.empty" rule="subtitle" label="Mensaje cuando no hay testimonios" className="text-xs text-neutral-muted" /></div>}
      </Container>
    </section>
  );
}
