import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, UsersIcon, ChefHatIcon, MapPinIcon } from "@/components/ui/Icons";

const accessCategories = [
  {
    title: "Asociaciones Productoras",
    subtitle: "Comunidades y Familias",
    description: "Conoce a los socios y socias de Pilahuín, Chibuleo, San Pedro y Nueva Vida que lideran la producción láctea local.",
    href: "/asociaciones",
    icon: UsersIcon,
    image: "/placeholders/association-placeholder.svg",
    badge: "4 Asociaciones",
  },
  {
    title: "Recetas con Queso",
    subtitle: "Gastronomía Andina",
    description: "Descubre platos típicos, locro de papa, empanadas y sugerencias de maridaje con nuestros quesos artesanales.",
    href: "/recetas",
    icon: ChefHatIcon,
    image: "/placeholders/recipe-placeholder.svg",
    badge: "Tradición Culinaria",
  },
  {
    title: "Turismo Comunitario",
    subtitle: "Rutas y Parajes",
    description: "Visita nuestras queserías en el páramo andino y disfruta de senderos agroecológicos en las faldas de los volcanes.",
    href: "/turismo",
    icon: MapPinIcon,
    image: "/placeholders/tourism-placeholder.svg",
    badge: "Visitas Guiadas",
  },
];

/**
 * ============================================================
 * TARJETAS DE ACCESO RÁPIDO (ASOCIACIONES, RECETAS, TURISMO)
 * ============================================================
 * 
 * Enlaces visuales modulares hacia las secciones transversales
 * del proyecto de vinculación CONLAC-T.
 */
export const CategoryAccessCards: React.FC = () => {
  return (
    <section
      aria-labelledby="category-access-heading"
      className="py-16 sm:py-24 bg-surface/80 border-b border-border/60"
    >
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Descubre más de CONLAC-T
          </span>
          <h2
            id="category-access-heading"
            className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary"
          >
            Nuestra Gente, Sabores y Territorio
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-muted">
            Más que una tienda, somos un consorcio comunitario que promueve
            el patrimonio cultural y agropecuario de Tungurahua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {accessCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group flex flex-col overflow-hidden rounded-2xl bg-background border border-border transition-all duration-300 hover:shadow-artisan-hover hover:border-tertiary/70 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none"
              >
                {/* Imagen / Ilustración superior */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-light/50">
                  <Image
                    src={cat.image}
                    alt={`Ilustración de ${cat.title}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-surface/90 backdrop-blur-xs px-3 py-1 text-[11px] font-label font-semibold text-primary shadow-sm">
                    {cat.badge}
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-tertiary">
                      <IconComponent className="h-5 w-5" />
                      <span className="text-xs font-label uppercase tracking-wider font-semibold">
                        {cat.subtitle}
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
                    <span>Explorar sección</span>
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
};
