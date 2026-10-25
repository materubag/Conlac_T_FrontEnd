import React from "react";
import type { Metadata } from "next";
import {
  getAssociationById,
  normalizeBackendProduct,
  productosMock,
  resolveProductPhotos,
} from "@/lib/data";
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

const CATALOG_ERROR_MESSAGE =
  "El catálogo no está disponible en este momento. Vuelve a intentarlo en unos minutos o escríbenos por WhatsApp para coordinar tu pedido.";

async function fetchProductsFromBackend(associationFilter?: string): Promise<{
  products: Producto[];
  error: string | null;
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
      console.error(`[tienda] ${apiUrl} respondió HTTP ${res.status} (${res.statusText})`);
      return { products: [], error: CATALOG_ERROR_MESSAGE };
    }

    const data: Producto[] = await res.json();
    return {
      products: data.map((item) => {
        const normalized = normalizeBackendProduct(item);
        return {
          ...normalized,
          fotos: normalized.fotos.length > 0
            ? normalized.fotos
            : ["/placeholders/product-queso-fresco.svg"],
        };
      }),
      error: null,
    };
  } catch (err: unknown) {
    console.error(`[tienda] No se pudo conectar con ${apiUrl}:`, err);
    return { products: [], error: CATALOG_ERROR_MESSAGE };
  }
}

export default async function TiendaPage({ searchParams }: Props) {
  const { asociacion: asociacionId } = await searchParams;
  const asociacion = asociacionId ? await getAssociationById(asociacionId) : null;
  const filterKey = asociacion?.slug || asociacion?.id || asociacionId;

  const { products: backendProducts, error: backendError } =
    await fetchProductsFromBackend(filterKey);

  // Sin backend disponible mostramos el catálogo local para que la tienda siga
  // siendo navegable al desplegarse solo el frontend.
  const products =
    backendProducts.length > 0
      ? backendProducts
      : productosMock.map((item) => ({ ...item, fotos: resolveProductPhotos(item) }));
  const error = products.length > 0 ? null : backendError;

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

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-3">
              <span className="text-xl" aria-hidden="true">⚠️</span>
              <div>
                <h3 className="font-semibold text-sm">No pudimos cargar el catálogo</h3>
                <p className="text-xs mt-1 text-red-700">{error}</p>
              </div>
            </div>
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
