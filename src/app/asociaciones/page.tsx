import React from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AssociationCard } from "@/components/associations/AssociationCard";
import type { Asociacion } from "@/types";

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
          {associations.map((assoc, index) => (
            <AssociationCard
              key={assoc.id}
              association={assoc}
              priorityImage={index < 2}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
