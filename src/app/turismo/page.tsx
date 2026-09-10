import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTouristAttractions } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Turismo Comunitario y Rutas",
  description: "Rutas agroecológicas y parajes andinos en Pilahuín, faldas del Chimborazo y Carihuairazo.",
};

export default async function TurismoPage() {
  const attractions = await getTouristAttractions();
  const whatsappUrl = buildWhatsAppUrl({
    message: "Hola CONLAC-T, deseo información sobre las rutas turísticas y visitas a las queserías comunitarias.",
  });

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Experiencias Andinas
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Turismo Comunitario en Pilahuín
          </h1>
          <p className="mt-3 text-base text-neutral-muted">
            Descubre los majestuosos paisajes del páramo andino de Tungurahua y vive la experiencia
            del agroturismo lechero y degustación en nuestras plantas comunitarias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {attractions.map((attraction) => (
            <article
              key={attraction.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-sm hover:border-tertiary/70 transition-all"
            >
              <div className="space-y-4">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-light/50">
                  <Image
                    src="/placeholders/tourism-placeholder.svg"
                    alt={`Fotografía de ${attraction.nombre}`}
                    fill
                    className="object-cover object-center"
                  />
                  {attraction.tipo && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="primary">{attraction.tipo}</Badge>
                    </div>
                  )}
                </div>

                <h2 className="font-headline text-xl font-bold text-primary">
                  {attraction.nombre}
                </h2>

                {attraction.descripcion && (
                  <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                    {attraction.descripcion}
                  </p>
                )}

                {attraction.asociacion_cercana && (
                  <div className="flex items-center gap-1.5 text-xs text-neutral-muted">
                    <MapPinIcon className="w-4 h-4 text-tertiary" />
                    <span>Cerca de: {attraction.asociacion_cercana}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  href={whatsappUrl}
                  variant="outlined"
                  size="sm"
                  isExternal
                  fullWidth
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>Consultar visitas guiadas</span>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
