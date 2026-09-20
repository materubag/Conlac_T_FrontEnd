import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAssociationById, getAssociations, getProductsByAssociationId } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AssociationProfile } from "@/components/associations/AssociationProfile";

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

  const products = getProductsByAssociationId(assoc.id);

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: "Asociaciones", href: "/asociaciones" },
          { label: assoc.nombre },
        ]} />

        <AssociationProfile association={assoc} products={products} />
      </Container>
    </div>
  );
}
