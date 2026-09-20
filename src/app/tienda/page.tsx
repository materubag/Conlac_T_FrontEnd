import React from "react";
import type { Metadata } from "next";
import { getProducts, getAssociationById, getProductsByAssociationId } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";

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
  const products = asociacion
    ? getProductsByAssociationId(asociacion.id)
    : await getProducts();

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: "Tienda" },
        ]} />
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Catálogo Oficial
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            {asociacion ? `Quesos de ${asociacion.nombre}` : "Tienda de Quesos Artesanales"}
          </h1>
          <p className="mt-3 text-base text-neutral-muted">
            {asociacion
              ? `Explora los productos elaborados por ${asociacion.nombre}.`
              : "Explora la variedad de quesos elaborados con leche fresca de páramo por las comunidades de CONLAC-T."}
          </p>
          {asociacion && (
            <Button href="/tienda" variant="ghost" size="sm" className="mt-3">
              Ver catálogo completo
            </Button>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-muted">
            No hay productos disponibles para esta selección todavía.
          </p>
        )}
      </Container>
    </div>
  );
}
