import React from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { buildWhatsAppUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, WhatsAppIcon, SparklesIcon } from "@/components/ui/Icons";

/**
 * ============================================================
 * HERO PRINCIPAL - CONLAC-T
 * ============================================================
 * 
 * Portada inspirada en el mockup oficial.
 * Transmite la identidad andina, pureza y maestría quesera de Pilahuín.
 */
export const Hero: React.FC = () => {
  const whatsappUrl = buildWhatsAppUrl({
    message: "Hola CONLAC-T, vi su página web y deseo consultar sobre los quesos artesanales disponibles.",
  });

  return (
    <section
      aria-label="Presentación principal de CONLAC-T"
      className="relative min-h-[580px] lg:min-h-[660px] flex items-center justify-center overflow-hidden border-b border-border/60"
    >
      {/* Fondo visual: Paisaje Andino Vectorial con degradado atmosférico */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={siteConfig.assets.heroImage}
          alt="Paisaje andino de Pilahuín con los volcanes de Tungurahua de fondo"
          fill
          className="object-cover object-center opacity-90"
          priority
        />
        {/* Capa de degradado sutil para asegurar contraste de texto */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F4E9]/30 via-[#F8F4E9]/75 to-[#F8F4E9]" />
      </div>

      <Container className="relative z-10 py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          
          {/* Badge de identidad territorial */}
          <div className="inline-flex items-center gap-2 rounded-full border border-tertiary/60 bg-surface/80 backdrop-blur-sm px-4 py-1.5 shadow-sm">
            <SparklesIcon className="w-4 h-4 text-tertiary" />
            <span className="text-xs font-label font-semibold tracking-wider text-primary uppercase">
              Pilahuín · Ambato · Tungurahua
            </span>
          </div>

          {/* Titular Principal en Playfair Display */}
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.15]">
            Tradición, Oficio y el{" "}
            <span className="text-tertiary relative inline-block">
              Corazón de los Andes
            </span>
          </h1>

          {/* Subtítulo descriptivo */}
          <p className="font-body text-base sm:text-lg lg:text-xl text-neutral/85 leading-relaxed max-w-2xl mx-auto">
            Quesos artesanales de Pilahuín elaborados con leche fresca de páramo
            por asociaciones y familias productoras locales.
          </p>

          {/* Acciones principales (CTAs) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button
              href="/tienda"
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md"
            >
              <span className="text-white">Ver productos</span>
              <ArrowRightIcon className="w-4 h-4 text-white" />
            </Button>

            <Button
              href={whatsappUrl}
              variant="outlined"
              size="lg"
              isExternal
              className="group w-full sm:w-auto bg-surface/60 backdrop-blur-xs"
            >
              <WhatsAppIcon className="w-5 h-5 text-primary group-hover:text-white" />
              <span>Comprar por WhatsApp</span>
            </Button>
          </div>

          {/* Micro-metadata de confianza */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-label text-neutral-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              100% Leche pura de páramo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              Técnicas artesanales comunitarias
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Comercio justo directo
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
};
