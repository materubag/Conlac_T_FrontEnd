import React from "react";
import { siteConfig } from "@/lib/config";
import { Container } from "@/components/ui/Container";
import { ChefHatIcon } from "@/components/ui/Icons";
import type { Testimonial } from "@/types";

async function fetchTestimonials(): Promise<{
  testimonials: Testimonial[];
  error: string | null;
}> {
  try {
    const res = await fetch(`${siteConfig.backendUrl}/testimonials`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        testimonials: [],
        error: `HTTP ${res.status}`,
      };
    }

    const data: Testimonial[] = await res.json();
    return {
      testimonials: Array.isArray(data) ? data : [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de conexión";
    return {
      testimonials: [],
      error: message,
    };
  }
}

export const TestimonialsSection: React.FC = async () => {
  const { testimonials, error } = await fetchTestimonials();

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="py-16 sm:py-20 bg-background border-b border-border/60"
    >
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div>
            <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
              Voces de Nuestra Comunidad
            </span>
            <h2
              id="testimonials-heading"
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary"
            >
              Testimonios y Experiencias
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-muted max-w-2xl">
              Lo que opinan familias consumidoras y aliados comerciales que confían
              en los lácteos de nuestras asociaciones de Tungurahua.
            </p>
          </div>
          <ChefHatIcon className="hidden sm:block h-10 w-10 text-tertiary/70 flex-shrink-0" />
        </div>

        {error ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <p className="text-sm text-neutral-muted">
              Los testimonios de la comunidad no se encuentran disponibles en este momento.
            </p>
            <p className="mt-1 text-xs text-neutral-muted/70">
              (Servicio en mantenimiento temporal)
            </p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center">
            <p className="text-sm text-neutral-muted">
              Próximamente publicaremos nuevas valoraciones de nuestra comunidad.
            </p>
          </div>
        ) : (
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
                <div>
                  {item.calificacion && item.calificacion > 0 && (
                    <div className="flex items-center gap-1 mb-3 text-tertiary" aria-label={`Calificación: ${item.calificacion} de 5`}>
                      {Array.from({ length: Math.min(5, item.calificacion) }).map((_, i) => (
                        <span key={i} className="text-sm">★</span>
                      ))}
                    </div>
                  )}
                  <blockquote className="text-sm sm:text-base leading-relaxed text-neutral-muted italic font-serif">
                    “{item.frase}”
                  </blockquote>
                </div>

                <figcaption className="mt-6 border-t border-border/70 pt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm font-headline flex-shrink-0">
                    {item.autor_nombre ? item.autor_nombre.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div>
                    <p className="font-label text-sm font-bold text-primary">
                      {item.autor_nombre}
                    </p>
                    {item.autor_tipo && (
                      <p className="text-xs text-neutral-muted">
                        {item.autor_tipo}
                      </p>
                    )}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
};
