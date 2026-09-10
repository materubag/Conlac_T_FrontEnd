import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Contacto | CONLAC-T",
  description: "Contáctanos para pedidos por mayor, visitas a plantas queseras y atención personalizada.",
};

export default function ContactoPage() {
  const whatsappUrl = buildWhatsAppUrl({
    message: "Hola CONLAC-T, deseo comunicarme con un asesor de ventas o coordinación.",
  });

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container className="space-y-12">
        <div className="max-w-2xl">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Canales de Atención
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Contáctanos
          </h1>
          <p className="mt-3 text-base text-neutral-muted">
            Estamos a tu disposición para atender pedidos individuales, institucionales,
            visitas técnicas y consultas sobre la red de asociaciones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Tarjeta WhatsApp */}
          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <h2 className="font-headline text-xl font-bold text-primary">Atención por WhatsApp</h2>
              <p className="text-sm text-neutral-muted">
                Respuestas rápidas para pedidos, catálogo del día y confirmación de transferencias.
              </p>
            </div>
            <Button href={whatsappUrl} variant="primary" isExternal fullWidth>
              <WhatsAppIcon className="w-4 h-4" />
              <span>Enviar mensaje directo</span>
            </Button>
          </div>

          {/* Tarjeta Ubicación */}
          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-inverted">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <h2 className="font-headline text-xl font-bold text-primary">Ubicación y Plantas</h2>
              <p className="text-sm text-neutral-muted">
                {siteConfig.location.address}
              </p>
              <p className="text-xs text-neutral-muted">
                Horario de atención: {siteConfig.contact.schedule}
              </p>
            </div>
            <div className="pt-2">
              <span className="text-xs font-label font-semibold text-primary">
                Tungurahua · Ecuador
              </span>
            </div>
          </div>

          {/* Tarjeta Correo */}
          <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary text-neutral">
                <span className="font-bold text-lg">@</span>
              </div>
              <h2 className="font-headline text-xl font-bold text-primary">Correo Institucional</h2>
              <p className="text-sm text-neutral-muted">
                Para alianzas institucionales, convenios comunitarios y proyectos de vinculación universitaria.
              </p>
              <p className="text-sm font-semibold text-primary break-all">
                {siteConfig.contact.email}
              </p>
            </div>
            <Button href={`mailto:${siteConfig.contact.email}`} variant="outlined" fullWidth>
              <span>Escribir por correo</span>
            </Button>
          </div>

        </div>
      </Container>
    </div>
  );
}
