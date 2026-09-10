import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductCardProps } from "@/types";
import { formatPrice, cn, buildWhatsAppUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

/**
 * ============================================================
 * PRODUCT CARD - CONLAC-T
 * ============================================================
 * 
 * Tarjeta de producto desacoplada de llamadas a API directas.
 * Recibe el modelo de datos `Producto` y etiquetas editoriales de UI opcionales.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  editorialTag,
  priorityImage = false,
  className,
}) => {
  const imageSrc = product.fotos[0] || "/placeholders/product-queso-fresco.svg";
  const whatsappInquiryUrl = buildWhatsAppUrl({
    productName: `${product.nombre} (${product.asociacion || "CONLAC-T"})`,
  });

  return (
    <article
      className={cn(
        "group flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border transition-all duration-300",
        "hover:shadow-artisan-hover hover:border-tertiary/60 hover:-translate-y-1",
        className
      )}
      aria-labelledby={`product-title-${product.id}`}
    >
      {/* ============================================================
          1. CONTENEDOR DE IMAGEN Y BADGES
          ============================================================ */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-light/40">
        <Image
          src={imageSrc}
          alt={`Fotografía artesanal de ${product.nombre} elaborado por ${product.asociacion || "CONLAC-T"}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          priority={priorityImage}
        />

        {/* Badge editorial o de disponibilidad */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {editorialTag && (
            <Badge variant={editorialTag.variant || "tertiary"}>
              {editorialTag.text}
            </Badge>
          )}
          {product.stock <= 10 && product.stock > 0 && (
            <Badge variant="highlight">
              Stock limitado
            </Badge>
          )}
        </div>

        {/* Peso del producto */}
        {product.peso && (
          <span className="absolute bottom-3 right-3 rounded-lg bg-neutral/80 backdrop-blur-xs px-2.5 py-1 text-xs font-label font-medium text-inverted">
            {product.peso}
          </span>
        )}
      </div>

      {/* ============================================================
          2. INFORMACIÓN DEL PRODUCTO
          ============================================================ */}
      <div className="flex flex-1 flex-col p-5 sm:p-6 justify-between">
        <div className="space-y-2">
          
          {/* Asociación productora */}
          {product.asociacion && (
            <p className="text-xs font-label uppercase tracking-wider text-neutral-muted font-semibold">
              {product.asociacion}
            </p>
          )}

          {/* Título de producto */}
          <h3
            id={`product-title-${product.id}`}
            className="font-headline text-lg sm:text-xl font-bold text-primary group-hover:text-tertiary transition-colors line-clamp-1"
          >
            <Link
              href={`/tienda/${product.id}`}
              className="focus-visible:outline-none focus-visible:underline"
            >
              {product.nombre}
            </Link>
          </h3>

          {/* Tipo de queso / Descripción breve */}
          {product.tipo_queso && (
            <p className="text-xs sm:text-sm text-neutral-muted line-clamp-2">
              {product.tipo_queso}
            </p>
          )}
        </div>

        {/* ============================================================
            3. PRECIO Y ACCIÓN VISUAL
            ============================================================ */}
        <div className="mt-6 pt-4 border-t border-border/70 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-label tracking-widest text-neutral-muted">
              Precio
            </span>
            <span className="font-headline text-xl sm:text-2xl font-bold text-primary">
              {formatPrice(product.precio)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              href={whatsappInquiryUrl}
              variant="outlined"
              size="sm"
              isExternal
              aria-label={`Consultar disponibilidad de ${product.nombre} por WhatsApp`}
            >
              Consultar
            </Button>

            <Button
              href={`/tienda/${product.id}`}
              variant="primary"
              size="sm"
              aria-label={`Ver detalles de ${product.nombre}`}
            >
              Ver detalle
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
