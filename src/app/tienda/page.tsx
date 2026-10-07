import React from "react";
import type { Metadata } from "next";
import { getAssociationById } from "@/lib/data";
import { siteConfig } from "@/lib/config";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "@/components/home/ProductCard";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import type { Producto } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tienda de Quesos Artesanales",
  description: "Catálogo completo de quesos frescos, amasados y madurados elaborados por asociaciones de Pilahuín.",
};

interface Props {
  searchParams: Promise<{ asociacion?: string }>;
}

async function fetchProductsFromBackend(associationFilter?: string): Promise<{
  products: Producto[];
  error: string | null;
  apiUrl: string;
}> {
  const url = new URL(`${siteConfig.backendUrl}/products`);
  if (associationFilter) {
    url.searchParams.set("asociacion", associationFilter);
  }

  const apiUrl = url.toString();

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        products: [],
        error: `El servidor backend respondió con código HTTP ${res.status} (${res.statusText})`,
        apiUrl,
      };
    }

    const data: Producto[] = await res.json();
    return {
      products: data.map((item) => ({
        ...item,
        fotos: Array.isArray(item.fotos) && item.fotos.length > 0
          ? item.fotos
          : ["/placeholders/product-queso-fresco.svg"],
      })),
      error: null,
      apiUrl,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de conexión";
    return {
      products: [],
      error: `No se pudo conectar con el backend (${message}). Verifique que el contenedor Docker esté activo en el puerto 8080.`,
      apiUrl,
    };
  }
}

export default async function TiendaPage({ searchParams }: Props) {
  const { asociacion: asociacionId } = await searchParams;
  const asociacion = asociacionId ? await getAssociationById(asociacionId) : null;
  const filterKey = asociacion?.slug || asociacion?.id || asociacionId;

  const { products, error, apiUrl } = await fetchProductsFromBackend(filterKey);

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: "Tienda" },
        ]} />

        <div className="max-w-2xl mb-8">
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

        {/* Banner de estado de conexión / live API indicator */}
        {error ? (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">⚠️</span>
              <div>
                <h3 className="font-semibold text-sm">Estado de conexión con el Backend</h3>
                <p className="text-xs mt-1 text-red-700">{error}</p>
                <p className="text-[11px] mt-2 text-red-600 font-mono">
                  URL solicitada: {apiUrl}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              API Backend Conectada ({products.length} productos en vivo)
            </span>
            <span className="text-xs text-neutral-muted font-mono hidden sm:inline">
              GET {apiUrl}
            </span>
          </div>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : !error ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-neutral-muted">
              No hay productos disponibles para esta selección todavía.
            </p>
          </div>
        ) : null}
      </Container>
    </div>
  );
}
