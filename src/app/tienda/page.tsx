import React from "react";
import type { Metadata } from "next";
import {
  getAssociationById,
  normalizeBackendProduct,
  productosMock,
  resolveProductPhotos,
} from "@/lib/data";
import { siteConfig } from "@/lib/config";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import { TiendaManager, type TiendaContenido } from "@/components/paginas/TiendaManager";
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
          fotos:
            normalized.fotos.length > 0
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

  const defaultProducts =
    backendProducts.length > 0
      ? backendProducts
      : productosMock.map((item) => ({ ...item, fotos: resolveProductPhotos(item) }));
  const error = defaultProducts.length > 0 ? null : backendError;

  const initialConfig = obtenerPaginaConfig<TiendaContenido>("tienda", {
    eyebrow: "Catálogo Oficial",
    titulo: "Tienda de Quesos Artesanales",
    subtitulo:
      "Explora la variedad de quesos elaborados con leche fresca de páramo por las comunidades de CONLAC-T.",
    contenido: {
      productos: defaultProducts,
    },
  });

  return (
    <TiendaManager
      initialConfig={initialConfig}
      products={initialConfig.contenido?.productos || defaultProducts}
      asociacion={asociacion}
      error={error}
    />
  );
}
