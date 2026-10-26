import React from "react";
import type { Metadata } from "next";
import { listarSecciones } from "@/lib/db/contenidoRepo";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { urlDeIncrustacion } from "@/lib/video";
import { ETIQUETA_TIPO } from "@/types/contenido";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Capacitación y Materiales",
  description:
    "Videos, guías y documentos de capacitación para las asociaciones productoras de CONLAC-T.",
};

export default async function CapacitacionPage() {
  // Solo secciones y materiales marcados como publicados.
  const secciones = listarSecciones(true).filter((s) => s.contenidos.length > 0);

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Capacitación" }]} />

        <div className="max-w-2xl mb-10">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Formación Comunitaria
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Capacitación y Materiales
          </h1>
          <p className="mt-3 text-base text-neutral-muted">
            Videos, guías e instructivos para las asociaciones productoras de Pilahuín.
          </p>
        </div>

        {secciones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center max-w-xl mx-auto">
            <h2 className="font-headline text-lg font-bold text-primary">
              Todavía no hay materiales publicados
            </h2>
            <p className="text-sm text-neutral-muted mt-2">
              Pronto publicaremos videos y guías de capacitación para las comunidades.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {secciones.map((seccion) => (
              <section key={seccion.id} className="space-y-5">
                <div className="border-b border-border pb-3">
                  <h2 className="font-headline text-2xl font-bold text-primary">
                    {seccion.titulo}
                  </h2>
                  {seccion.descripcion && (
                    <p className="text-sm text-neutral-muted mt-1">{seccion.descripcion}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {seccion.contenidos.map((contenido) => {
                    const incrustado =
                      contenido.tipo === "video" ? urlDeIncrustacion(contenido.url) : null;

                    return (
                      <article
                        key={contenido.id}
                        className="rounded-2xl bg-surface border border-border p-5 sm:p-6 space-y-3"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="highlight">{ETIQUETA_TIPO[contenido.tipo]}</Badge>
                          <h3 className="font-headline font-bold text-base text-primary">
                            {contenido.titulo}
                          </h3>
                        </div>

                        {contenido.descripcion && (
                          <p className="text-sm text-neutral-muted">{contenido.descripcion}</p>
                        )}

                        {incrustado && (
                          <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-neutral-light/40">
                            <iframe
                              src={incrustado}
                              title={contenido.titulo}
                              className="h-full w-full"
                              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {contenido.tipo === "texto" && contenido.cuerpo && (
                          <p className="text-sm text-neutral whitespace-pre-line">
                            {contenido.cuerpo}
                          </p>
                        )}

                        {contenido.url && !incrustado && (
                          <a
                            href={contenido.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-sm font-semibold text-tertiary underline break-all"
                          >
                            Abrir {ETIQUETA_TIPO[contenido.tipo].toLowerCase()} →
                          </a>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
