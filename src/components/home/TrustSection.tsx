import React from "react";
import { Container } from "@/components/ui/Container";
import { MountainIcon, UsersIcon, ShieldCheckIcon, SparklesIcon } from "@/components/ui/Icons";
import { HomeField, HomeSectionHeading, useHomeEditing } from "./HomeEditing";
import { AddHomeCard, DeleteHomeCard } from "./HomeControls";

const pillarIcons = [MountainIcon, UsersIcon, ShieldCheckIcon, SparklesIcon];

/**
 * ============================================================
 * SECCIÓN DE CONFIANZA Y ORIGEN - CONLAC-T
 * ============================================================
 * 
 * "Trust from the Origin" según el diseño del mockup.
 * Explica los pilares de pureza, origen y compromiso comunitario.
 */
export const TrustSection: React.FC = () => {
  const { config, isEditing, setPillars } = useHomeEditing();
  return (
    <section
      aria-labelledby="trust-section-title"
      className="py-16 sm:py-20 bg-surface/70 border-b border-border/60"
    >
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <HomeSectionHeading section="trust" id="trust-section-title" centered />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {config.contenido.trust.pillars.map((pillar, index) => {
            const IconComponent = pillarIcons[index % pillarIcons.length];
            return (
              <div
                key={pillar.id ?? index}
                className="flex flex-col items-center sm:items-start text-center sm:text-left p-6 rounded-2xl bg-[#F8F4E9]/60 border border-border/70 hover:border-tertiary/70 transition-all duration-200 group"
              >
                <div className="mb-4 flex w-full items-start justify-between gap-2">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-inverted shadow-sm group-hover:bg-tertiary group-hover:text-neutral transition-colors">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  {isEditing && <DeleteHomeCard label={`Borrar tarjeta: ${pillar.title || "sin título"}`} onClick={() => setPillars(config.contenido.trust.pillars.filter((_, i) => i !== index))} />}
                </div>
                <HomeField path={`contenido.trust.pillars.${index}.title`} rule="title" label="Título del pilar" as="h3" className="font-headline text-lg font-bold text-primary mb-2" />
                <HomeField path={`contenido.trust.pillars.${index}.description`} rule="description" label="Descripción del pilar" as="p" className="text-xs sm:text-sm text-neutral-muted leading-relaxed" />
              </div>
            );
          })}
          {isEditing && <AddHomeCard label="Añadir tarjeta" onClick={() => setPillars([...config.contenido.trust.pillars, { id: crypto.randomUUID(), title: "", description: "" }])} />}
        </div>
      </Container>
    </section>
  );
};
