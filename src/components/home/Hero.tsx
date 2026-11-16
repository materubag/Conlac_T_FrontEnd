import React from "react";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { buildWhatsAppUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon, WhatsAppIcon, SparklesIcon } from "@/components/ui/Icons";
import { HomeAction, HomeField, useHomeEditing } from "./HomeEditing";

/**
 * ============================================================
 * HERO PRINCIPAL - CONLAC-T
 * ============================================================
 * 
 * Portada inspirada en el mockup oficial.
 * Transmite la identidad andina, pureza y maestría quesera de Pilahuín.
 */
export const Hero: React.FC = () => {
  const { config, isEditing } = useHomeEditing();
  const whatsappUrl = buildWhatsAppUrl({
    message: config.contenido.hero_whatsapp_message,
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
            <HomeField path="eyebrow" rule="short" label="Ubicación de la portada" className="text-xs font-label font-semibold tracking-wider text-primary uppercase" />
          </div>

          {/* Titular Principal en Playfair Display */}
          {isEditing ? <div className="space-y-2">
            <HomeField path="titulo" rule="title" label="Título de Inicio" className="font-headline text-3xl sm:text-5xl font-bold text-primary" />
            <HomeField path="contenido.hero_accent" rule="title" label="Frase destacada del título" className="font-headline text-3xl sm:text-5xl font-bold text-tertiary" />
          </div> : <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.15]">
            {config.titulo}{" "}
            <span className="text-tertiary relative inline-block">
              {config.contenido.hero_accent}
            </span>
          </h1>}

          {/* Subtítulo descriptivo */}
          <HomeField path="subtitulo" rule="subtitle" label="Descripción de la portada" as="p" className="font-body text-base sm:text-lg lg:text-xl text-neutral/85 leading-relaxed max-w-2xl mx-auto" />

          {/* Acciones principales (CTAs) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <HomeAction path="contenido.hero_primary_label" href="/tienda" primary icon={<ArrowRightIcon className="w-4 h-4 shrink-0" />} />
            <HomeAction path="contenido.hero_whatsapp_label" href={whatsappUrl} external icon={<WhatsAppIcon className="w-5 h-5 shrink-0" />} />
          </div>

          {isEditing && <div className="rounded-xl border border-border bg-surface/80 p-3 text-left">
            <p className="mb-1 text-xs font-semibold text-primary">Mensaje para pedidos por WhatsApp</p>
            <HomeField path="contenido.hero_whatsapp_message" rule="description" label="Mensaje de WhatsApp" className="text-sm text-neutral" />
          </div>}

          {/* Micro-metadata de confianza */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-label text-neutral-muted">
            {config.contenido.hero_claims.map((_, index) => <div key={index} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`w-2 h-2 shrink-0 rounded-full ${index === 1 ? "bg-tertiary" : "bg-primary"}`} />
              <HomeField path={`contenido.hero_claims.${index}`} rule="short" label="Sello de confianza" />
            </div>)}
          </div>
        </div>
      </Container>
    </section>
  );
};
