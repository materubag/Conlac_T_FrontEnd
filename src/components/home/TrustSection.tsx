import React from "react";
import { Container } from "@/components/ui/Container";
import { MountainIcon, UsersIcon, ShieldCheckIcon, SparklesIcon } from "@/components/ui/Icons";

const trustPillars = [
  {
    icon: MountainIcon,
    title: "Origen en el Páramo",
    description: "Leche fresca obtenida a más de 3.300 msnm con pastoreo natural libre de químicos.",
  },
  {
    icon: UsersIcon,
    title: "Comunidades Unidas",
    description: "Asociaciones familiares de Pilahuín y Chibuleo impulsando la economía solidaria.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Buenas Prácticas (BPM)",
    description: "Procesamiento con estrictas normas sanitarias y trazabilidad desde el ordeño.",
  },
  {
    icon: SparklesIcon,
    title: "Sabor Auténtico",
    description: "Recetas ancestrales de amasado y maduración que conservan la textura única de Tungurahua.",
  },
];

/**
 * ============================================================
 * SECCIÓN DE CONFIANZA Y ORIGEN - CONLAC-T
 * ============================================================
 * 
 * "Trust from the Origin" según el diseño del mockup.
 * Explica los pilares de pureza, origen y compromiso comunitario.
 */
export const TrustSection: React.FC = () => {
  return (
    <section
      aria-labelledby="trust-section-title"
      className="py-16 sm:py-20 bg-surface/70 border-b border-border/60"
    >
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Garantía y Procedencia
          </span>
          <h2
            id="trust-section-title"
            className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary"
          >
            Confianza desde el Origen
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-muted">
            Cada queso de CONLAC-T representa la dedicación de nuestras familias
            y la riqueza natural del páramo andino de Tungurahua.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {trustPillars.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="flex flex-col items-center sm:items-start text-center sm:text-left p-6 rounded-2xl bg-[#F8F4E9]/60 border border-border/70 hover:border-tertiary/70 transition-all duration-200 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-inverted mb-4 shadow-sm group-hover:bg-tertiary group-hover:text-neutral transition-colors">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="font-headline text-lg font-bold text-primary mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};
