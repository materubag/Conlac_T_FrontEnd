import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "./ProductCard";
import { HomeAction, HomeField, HomeSectionHeading, useHomeEditing } from "./HomeEditing";
import type { Producto } from "@/types";

export function FeaturedProducts({ products }: { products: Producto[] }) {
  const { isEditing } = useHomeEditing();

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="py-16 sm:py-24 bg-background border-b border-border/60"
    >
      <Container>
        {/* Encabezado de la sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-xl">
            <HomeSectionHeading section="products" id="featured-products-heading" />
          </div>

          <div className="flex-shrink-0">
            <HomeAction path="contenido.products.link_label" href="/tienda" />
          </div>
        </div>

        {isEditing && <p className="mb-5 text-xs text-neutral-muted">Productos e imágenes de la tienda. <Link href="/tienda" className="font-semibold text-primary underline">Editar catálogo</Link></p>}
        {(!products.length || isEditing) && <div className="mb-6"><HomeField path="contenido.products.empty" rule="subtitle" label="Mensaje cuando no hay productos disponibles" as="p" className="text-sm text-neutral-muted" /></div>}

        {/* Grilla responsive de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priorityImage={idx < 2}
            />
          ))}
        </div>

      </Container>
    </section>
  );
}
