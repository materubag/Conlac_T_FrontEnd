import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, UsersIcon, ChefHatIcon, MapPinIcon } from "@/components/ui/Icons";
import { HomeField, HomeSectionHeading, useHomeEditing } from "./HomeEditing";
import type { HomeAccessCard } from "@/types/home";

const categoryIcons = { asociaciones: UsersIcon, recetas: ChefHatIcon, turismo: MapPinIcon };
const countLabels = { asociaciones: ["asociación", "asociaciones"], recetas: ["receta", "recetas"], turismo: ["ruta", "rutas"] };

/**
 * ============================================================
 * TARJETAS DE ACCESO RÁPIDO (ASOCIACIONES, RECETAS, TURISMO)
 * ============================================================
 * 
 * Enlaces visuales modulares hacia las secciones transversales
 * del proyecto de vinculación CONLAC-T.
 */
export function CategoryAccessCards({ cards }: { cards: HomeAccessCard[] }) {
  const { config, isEditing } = useHomeEditing();
  return (
    <section
      aria-labelledby="category-access-heading"
      className="py-16 sm:py-24 bg-surface/80 border-b border-border/60"
    >
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <HomeSectionHeading section="access" id="category-access-heading" centered />
        </div>

        {isEditing && <div className="mb-5 space-y-3 text-xs text-neutral-muted">
          <p>Las tarjetas usan los títulos, las imágenes y las cantidades de cada sección. Abre la sección para editar su contenido.</p>
          <HomeField path="contenido.access.link_label" rule="short" label="Texto del enlace de las tarjetas" className="max-w-xs text-primary font-semibold" />
        </div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((cat) => {
            const IconComponent = categoryIcons[cat.key];
            return (
              <Link
                key={cat.key}
                href={cat.href}
                className="group flex flex-col overflow-hidden rounded-2xl bg-background border border-border transition-all duration-300 hover:shadow-artisan-hover hover:border-tertiary/70 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none"
              >
                {/* Imagen / Ilustración superior */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-light/50">
                  {cat.image ? <Image
                    src={cat.image}
                    alt={`Ilustración de ${cat.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    unoptimized={cat.image.startsWith("data:")}
                  /> : <div className="absolute inset-0 flex items-center justify-center text-primary/40"><IconComponent className="h-16 w-16" /></div>}
                  <div className="absolute top-3 left-3 rounded-full bg-surface/90 backdrop-blur-xs px-3 py-1 text-[11px] font-label font-semibold text-primary shadow-sm">
                    {cat.count} {countLabels[cat.key][cat.count === 1 ? 0 : 1]}
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-tertiary">
                      <IconComponent className="h-5 w-5" />
                      <span className="text-xs font-label uppercase tracking-wider font-semibold">
                        {cat.eyebrow}
                      </span>
                    </div>

                    <h3 className="font-headline text-xl font-bold text-primary group-hover:text-tertiary transition-colors">
                      {cat.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between text-sm font-label font-semibold text-primary group-hover:text-tertiary transition-colors">
                    <span>{config.contenido.access.link_label}</span>
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
