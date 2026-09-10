import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, getProducts } from "@/lib/data";
import { formatPrice, buildWhatsAppUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { WhatsAppIcon, ShieldCheckIcon } from "@/components/ui/Icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductById(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: `${product.nombre} - ${product.asociacion || "CONLAC-T"}`,
    description: `Detalles del ${product.nombre}, queso artesanal elaborado por ${product.asociacion || "CONLAC-T"} en Pilahuín.`,
  };
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.id }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductById(slug);

  if (!product) {
    notFound();
  }

  const imageSrc = product.fotos[0] || "/placeholders/product-queso-fresco.svg";
  const whatsappUrl = buildWhatsAppUrl({
    productName: `${product.nombre} (${product.asociacion || "CONLAC-T"})`,
  });

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        {/* Migas de pan / Navegación */}
        <nav aria-label="Breadcrumb" className="mb-8 text-xs font-label text-neutral-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary">Inicio</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/tienda" className="hover:text-primary">Tienda</Link>
            </li>
            <li>/</li>
            <li className="font-semibold text-primary">{product.nombre}</li>
          </ol>
        </nav>

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
                <Badge variant={product.disponible ? "highlight" : "secondary"}>
                  {product.disponible ? "Disponible" : "Agotado"}
                </Badge>
              </div>

              <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
                {product.nombre}
              </h1>

              {product.tipo_queso && (
                <p className="text-base text-neutral-muted">
                  {product.tipo_queso}
                </p>
              )}

              <div className="pt-2">
                <span className="text-xs uppercase font-label tracking-wider text-neutral-muted">Precio unitario</span>
                <p className="font-headline text-3xl font-bold text-primary">
                  {formatPrice(product.precio)}
                </p>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-xs text-neutral-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-tertiary" />
                  <span>Elaborado con leche de pastoreo de altura en Pilahuín</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Stock disponible para entrega inmediata: {product.stock} unidades</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-3">
              <Button
                href={whatsappUrl}
                variant="primary"
                size="lg"
                isExternal
                fullWidth
              >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Pedir por WhatsApp</span>
              </Button>

              <Button
                href="/tienda"
                variant="outlined"
                size="lg"
              >
                <span>Volver a la tienda</span>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
