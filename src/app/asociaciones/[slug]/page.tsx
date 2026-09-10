import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssociationById, getAssociations } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MapPinIcon } from "@/components/ui/Icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const assoc = await getAssociationById(slug);
  if (!assoc) return { title: "Asociación no encontrada" };

  return {
    title: `${assoc.nombre} - Asociación CONLAC-T`,
    description: assoc.historia || `Perfil de ${assoc.nombre} en Pilahuín, Tungurahua.`,
  };
}

export async function generateStaticParams() {
  const assocs = await getAssociations();
  return assocs.map((a) => ({ slug: a.id }));
}

export default async function AssociationDetailPage({ params }: Props) {
  const { slug } = await params;
  const assoc = await getAssociationById(slug);

  if (!assoc) {
    notFound();
  }

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8 text-xs font-label text-neutral-muted">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
            <li>/</li>
            <li><Link href="/asociaciones" className="hover:text-primary">Asociaciones</Link></li>
            <li>/</li>
            <li className="font-semibold text-primary">{assoc.nombre}</li>
          </ol>
        </nav>

        <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-border space-y-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
            <Image
              src={assoc.fotos[0] || "/placeholders/association-placeholder.svg"}
              alt={`Fotografía de ${assoc.nombre}`}
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              {assoc.sello_sanitario && (
                <Badge variant="primary">{assoc.sello_sanitario}</Badge>
              )}
              <Badge variant="tertiary">Comunidad Productora</Badge>
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
              {assoc.nombre}
            </h1>

            {assoc.historia && (
              <p className="text-base sm:text-lg text-neutral-muted leading-relaxed">
                {assoc.historia}
              </p>
            )}

            <div className="pt-4 flex items-center gap-2 text-sm text-neutral-muted">
              <MapPinIcon className="w-4 h-4 text-tertiary" />
              <span>Parroquia Pilahuín, Cantón Ambato, Provincia de Tungurahua</span>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center gap-4">
            <Button href="/tienda" variant="primary">
              Ver quesos de esta asociación
            </Button>
            <Button href="/asociaciones" variant="outlined">
              Volver a asociaciones
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
