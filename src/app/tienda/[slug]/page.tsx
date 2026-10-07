import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { normalizeBackendProduct } from "@/lib/data";
import { buildWhatsAppUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppIcon, ShieldCheckIcon } from "@/components/ui/Icons";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductPurchaseOptions } from "@/components/cart/ProductPurchaseOptions";
import type { Producto, Asociacion } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchProductFromBackend(slugOrId: string): Promise<{
  product: Producto | null;
  error: string | null;
  isNotFound: boolean;
}> {
  const apiUrl = `${siteConfig.backendUrl}/products/${encodeURIComponent(slugOrId)}`;

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.status === 404) {
      return { product: null, error: null, isNotFound: true };
    }

    if (!res.ok) {
      return {
        product: null,
        error: `El servidor backend respondió con código HTTP ${res.status} (${res.statusText})`,
        isNotFound: false,
      };
    }

    const data: Producto = await res.json();
    return {
      product: {
        ...normalizeBackendProduct(data),
        fotos: Array.isArray(data.fotos) && data.fotos.length > 0
          ? data.fotos
          : ["/placeholders/product-queso-fresco.svg"],
      },
      error: null,
      isNotFound: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de conexión";
    return {
      product: null,
      error: `No se pudo conectar con el backend (${message}).`,
      isNotFound: false,
    };
  }
}

async function fetchAssociationFromBackend(associationIdOrSlug: string): Promise<Asociacion | null> {
  const apiUrl = `${siteConfig.backendUrl}/associations/${encodeURIComponent(associationIdOrSlug)}`;

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await fetchProductFromBackend(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: `${product.nombre} - ${product.asociacion || "CONLAC-T"}`,
    description: `Detalles del ${product.nombre}, queso artesanal elaborado por ${product.asociacion || "CONLAC-T"} en Pilahuín.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const { product, error, isNotFound } = await fetchProductFromBackend(slug);

  if (isNotFound) {
    notFound();
  }

  if (error || !product) {
    return (
      <div className="py-12 sm:py-16 bg-background">
        <Container>
          <Breadcrumbs items={[
            { label: "Inicio", href: "/" },
            { label: "Tienda", href: "/tienda" },
            { label: "Error de producto" },
          ]} />
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 max-w-2xl mx-auto my-8">
            <h2 className="font-semibold text-base mb-2">Error al cargar el producto</h2>
            <p className="text-sm text-red-700">{error || "No se pudo obtener la información del producto."}</p>
            <Button href="/tienda" variant="outlined" size="sm" className="mt-4">
              Volver a la tienda
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const association = product.asociacion_id
    ? await fetchAssociationFromBackend(product.asociacion_id)
    : null;

  const imageSrc = product.fotos[0] || "/placeholders/product-queso-fresco.svg";
  const isAvailable = product.disponible && product.stock > 0;
  const whatsappUrl = buildWhatsAppUrl({
    productName: `${product.nombre} (${product.asociacion || "CONLAC-T"})`,
  });

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        {/* Migas de pan / Navegación */}
        <Breadcrumbs items={[
          { label: "Inicio", href: "/" },
          { label: "Tienda", href: "/tienda" },
          { label: product.nombre },
        ]} />

        {/* Indicador de conexión en vivo */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Producto en Vivo desde Backend API
          </span>
          <span className="text-xs text-neutral-muted font-mono hidden sm:inline">
            GET {siteConfig.backendUrl}/products/{slug}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 bg-surface rounded-2xl p-6 sm:p-10 border border-border">
          {/* Imagen del producto */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-light/50">
            <Image
              src={imageSrc}
              alt={`Fotografía de ${product.nombre}`}
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Información */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {product.asociacion && (
                  <Badge variant="primary">{product.asociacion}</Badge>
                )}
                {product.peso && (
                  <Badge variant="outline">{product.peso}</Badge>
                )}
                <Badge variant={isAvailable ? "highlight" : "secondary"}>
                  {isAvailable ? "Disponible" : "Agotado"}
                </Badge>
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
                {product.nombre}
              </h1>

              {product.asociacion && (
                <p className="text-sm text-primary">
                  <Link
                    href={`/asociaciones/${encodeURIComponent(association?.slug || association?.id || product.asociacion_id || "")}`}
                    className="rounded hover:underline focus-visible:ring-2 focus-visible:ring-tertiary"
                  >
                    Conoce a {product.asociacion}
                  </Link>
                </p>
              )}

              {product.tipo_queso && (
                <p className="text-base text-neutral-muted">
                  {product.tipo_queso}
                </p>
              )}

              <div className="pt-4 border-t border-border space-y-2 text-xs text-neutral-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-tertiary" />
                  <span>Elaborado con leche de pastoreo de altura en Pilahuín</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Presentaciones y existencias disponibles para entrega</span>
                </div>
              </div>
            </div>

            {/* Acciones y Carrito */}
            <div className="pt-6 border-t border-border space-y-4">
              <ProductPurchaseOptions product={product} />

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  href={whatsappUrl}
                  variant="outlined"
                  size="md"
                  isExternal
                  fullWidth
                >
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                  <span>Consultar por WhatsApp</span>
                </Button>

                <Button
                  href="/tienda"
                  variant="ghost"
                  size="md"
                  className="group"
                >
                  <span>← Volver al catálogo</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
