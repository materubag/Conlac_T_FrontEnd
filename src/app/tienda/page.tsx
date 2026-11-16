import React from "react";
import type { Metadata } from "next";
import { getAssociationById } from "@/lib/data";
import { getStorePageData } from "@/lib/server/storeCatalog";
import { TiendaManager } from "@/components/paginas/TiendaManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda de Quesos Artesanales",
  description: "Catálogo completo de quesos frescos, amasados y madurados elaborados por asociaciones de Pilahuín.",
};

interface Props {
  searchParams: Promise<{ asociacion?: string }>;
}

export default async function TiendaPage({ searchParams }: Props) {
  const { asociacion: asociacionId } = await searchParams;
  const asociacion = asociacionId ? await getAssociationById(asociacionId) : null;
  const { config: initialConfig, products, error } = await getStorePageData();

  return (
    <TiendaManager
      initialConfig={initialConfig}
      products={products}
      asociacion={asociacion}
      error={error}
    />
  );
}
