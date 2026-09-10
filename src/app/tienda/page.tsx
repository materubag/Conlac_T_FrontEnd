import React from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";

export const metadata: Metadata = {
  title: "Tienda de Quesos Artesanales",
  description: "Catálogo completo de quesos frescos, amasados y madurados elaborados por asociaciones de Pilahuín.",
};

export default async function TiendaPage() {
  const products = await getProducts();

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        {/* Cabecera de la sección */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Catálogo Oficial
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Tienda de Quesos Artesanales
          </h1>
          <p className="mt-3 text-base text-neutral-muted">
            Explora la variedad de quesos elaborados con leche fresca de páramo por las
            comunidades de CONLAC-T.
          </p>
        </div>

        {/* Grilla de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </div>
  );
}
