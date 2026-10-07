import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTouristAttractions } from "@/lib/data";
import { siteConfig } from "@/lib/config";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/utils";
import type { AtractivoTuristico } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Turismo Comunitario y Rutas | CONLAC-T",
  description: "Rutas agroecológicas y parajes andinos en Pilahuín, faldas del Chimborazo y Carihuairazo.",
};

async function fetchTouristAttractionsFromBackend(): Promise<{
  attractions: AtractivoTuristico[];
  error: string | null;
}> {
  try {
    const res = await fetch(`${siteConfig.backendUrl}/turismo`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        attractions: await getTouristAttractions(),
        error: `HTTP ${res.status}`,
      };
    }

    const data: AtractivoTuristico[] = await res.json();
    return {
      attractions: Array.isArray(data) ? data : [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de conexión";
    const fallback = await getTouristAttractions();
    return {
      attractions: fallback,
      error: `No se pudo conectar con el backend (${message}). Mostrando datos locales de respaldo.`,
    };
  }
}

export default async function TurismoPage() {
  const { attractions, error } = await fetchTouristAttractionsFromBackend();

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

        {error && (
          <div className="mb-8 rounded-xl border border-border/80 bg-surface/80 p-4 text-xs text-neutral-muted">
            {error}
          </div>
        )}

        {attractions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-xl mx-auto">
            <MapPinIcon className="mx-auto h-12 w-12 text-neutral-muted/50 mb-3" />
            <h2 className="font-headline text-lg font-bold text-primary">No hay atractivos registrados</h2>
            <p className="mt-2 text-sm text-neutral-muted">
              Pronto publicaremos nuevas rutas agroecológicas y comunitarias en los páramos de Tungurahua.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {attractions.map((attraction) => {
              const imageSrc = attraction.foto_url || "/placeholders/tourism-placeholder.svg";
              const whatsappUrl = buildWhatsAppUrl({
                message: `Hola CONLAC-T, deseo información sobre la ruta "${attraction.nombre}".`,
              });

              return (
                <article
                  key={attraction.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-sm hover:border-tertiary/70 transition-all"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-light/50">
                      <Image
                        src={imageSrc}
                        alt={`Fotografía de ${attraction.nombre}`}
                        fill
                        className="object-cover object-center"
                      />
                      <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                        {attraction.tipo && (
                          <Badge variant="primary">{attraction.tipo}</Badge>
                        )}
                        {attraction.requiere_confirmacion && (
                          <Badge variant="tertiary">Previa reserva</Badge>
                        )}
                      </div>
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
                        <MapPinIcon className="w-4 h-4 text-tertiary flex-shrink-0" />
                        <span>Cerca de: {attraction.asociacion_cercana}</span>
                      </div>
                    )}

                    {attraction.condiciones_acceso && (
                      <div className="rounded-lg bg-background p-3 text-xs text-neutral-muted border border-border/60">
                        <span className="font-semibold text-primary block mb-0.5">Acceso:</span>
                        <span>{attraction.condiciones_acceso}</span>
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
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
