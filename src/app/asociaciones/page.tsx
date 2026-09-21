import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  ShieldCheckIcon,
} from "@/components/ui/Icons";
import type { Asociacion } from "@/types";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Asociaciones Productoras",
  description:
    "Conoce las asociaciones comunitarias y familias queseras del consorcio CONLAC-T en Tungurahua.",
};

export default async function AsociacionesPage() {
  const response = await fetch(
    "http://localhost:3000/api/asociaciones",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      "No se pudieron cargar las asociaciones."
    );
  }

  const associations: Asociacion[] =
    await response.json();

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: "Asociaciones" },
        ]} />
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Nuestra Gente
          </span>

          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Asociaciones de CONLAC-T
          </h1>

          <p className="mt-3 text-base text-neutral-muted">
            Familias campesinas e indígenas organizadas para
            garantizar la calidad, comercio justo y preservación
            del patrimonio lácteo de Tungurahua.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {associations.map((assoc) => (
            <article
              key={assoc.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-sm hover:border-tertiary/70 transition-all"
            >
              <div className="space-y-4">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
                  <Image
                    src={
                      assoc.fotos[0] ||
                      "/placeholders/association-placeholder.svg"
                    }
                    alt={`Planta y comunidad de ${assoc.nombre}`}
                    fill
                    className="object-cover object-center"
                  />

                  {assoc.sello_sanitario && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="primary">
                        {assoc.sello_sanitario}
                      </Badge>
                    </div>
                  )}
                </div>

                <h2 className="font-headline text-2xl font-bold text-primary">
                  {assoc.nombre}
                </h2>

                {assoc.historia && (
                  <p className="text-sm text-neutral-muted leading-relaxed">
                    {assoc.historia}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <ShieldCheckIcon className="w-4 h-4 text-tertiary" />

                  <span>
                    Socio Fundador CONLAC-T
                  </span>
                </div>

                <Button
                  href={`/asociaciones/${assoc.id}`}
                  variant="outlined"
                  size="sm"
                  className="group/button"
                >
                  <span className="group-hover/button:text-inverted">Ver perfil</span>

                  <ArrowRightIcon className="w-3.5 h-3.5 group-hover/button:text-inverted" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
