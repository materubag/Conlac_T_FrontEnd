import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AssociationCard } from "@/components/associations/AssociationCard";
import { getAssociations } from "@/services/asociaciones/associationService";
import type { AssociationResponse } from "@/types/association";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Asociaciones Productoras",
  description:
    "Conoce las asociaciones comunitarias y familias queseras del consorcio CONLAC-T en Tungurahua.",
};

export default async function AsociacionesPage() {
  let associations: AssociationResponse[] = [];
  let error: string | null = null;

  try {
    associations = await getAssociations();

    // Agregamos imagen placeholder cuando la asociación no tiene fotos.
    associations = associations.map((association) => ({
      ...association,
      fotos:
        Array.isArray(association.fotos) && association.fotos.length > 0
          ? association.fotos
          : ["/placeholders/association-placeholder.svg"],
    }));
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error de conexión";

    error = `No se pudieron cargar las asociaciones (${message}). Verifique que el servicio backend esté en ejecución.`;
  }

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Asociaciones" },
          ]}
        />

        <div className="max-w-2xl mb-8">
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

        {/* Estado de conexión */}
        {error ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">
                ⚠️
              </span>

              <div>
                <h3 className="font-semibold text-sm">
                  Estado de conexión con el Backend
                </h3>

                <p className="text-xs mt-1 text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            
          </div>
        )}

        {associations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {associations.map((assoc, index) => (
              <AssociationCard
                key={assoc.id}
                association={assoc}
                priorityImage={index < 2}
              />
            ))}
          </div>
        ) : !error ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-neutral-muted">
              No hay asociaciones registradas o publicadas en este momento.
            </p>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
