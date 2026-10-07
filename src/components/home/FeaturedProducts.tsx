import React from "react";
import { getFeaturedProducts } from "@/lib/data";
import { siteConfig } from "@/lib/config";
import { Container } from "@/components/ui/Container";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { EditorialTag, Producto } from "@/types";

// Etiquetas editoriales visuales del Frontend (desacopladas del contrato Producto)
const editorialTagsMap: Record<string, EditorialTag> = {
  "prod-queso-fresco": { text: "Bestseller", variant: "primary" },
  "b0000000-0000-0000-0000-000000000001": { text: "Bestseller", variant: "primary" },
  "queso-fresco-artesanal-el-lindero": { text: "Bestseller", variant: "primary" },
  "prod-queso-amasado": { text: "Tradicional", variant: "tertiary" },
  "b0000000-0000-0000-0000-000000000002": { text: "Tradicional", variant: "tertiary" },
  "queso-de-hoja-tradicional-mulanleo": { text: "Tradicional", variant: "tertiary" },
  "prod-quesillo": { text: "Tierno", variant: "highlight" },
  "prod-queso-maduro-andino": { text: "Edición Limitada", variant: "outline" },
  "b0000000-0000-0000-0000-000000000003": { text: "Edición Especial", variant: "outline" },
  "queso-andino-con-oregano-silvestre": { text: "Edición Especial", variant: "outline" },
};

async function fetchHomeFeaturedProducts(): Promise<Producto[]> {
  try {
    const res = await fetch(`${siteConfig.backendUrl}/products?destacado=true`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data: Producto[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.slice(0, 4).map((item) => ({
          ...item,
          fotos: Array.isArray(item.fotos) && item.fotos.length > 0
            ? item.fotos
            : ["/placeholders/product-queso-fresco.svg"],
        }));
      }
    }
  } catch {
    // Si el backend no responde, recurrimos a los datos mock locales como fallback
  }

  return getFeaturedProducts();
}

export const FeaturedProducts: React.FC = async () => {
  const products = await fetchHomeFeaturedProducts();

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="py-16 sm:py-24 bg-background border-b border-border/60"
    >
      <Container>
        {/* Encabezado de la sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-xl">
            <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
              Nuestra Selección Artesanal
            </span>
            <h2
              id="featured-products-heading"
              className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-headline font-bold text-primary"
            >
              Quesos Destacados de Tungurahua
            </h2>
            <p className="mt-3 text-sm sm:text-base text-neutral-muted">
              Variedades elaboradas diariamente en las plantas de nuestras asociaciones
              aliadas bajo estándares de pureza y calidad.
            </p>
          </div>

          <div className="hidden sm:block flex-shrink-0">
            <Button
              href="/tienda"
              variant="outlined"
              size="md"
            >
              <span>Ver catálogo completo</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Grilla responsive de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              editorialTag={editorialTagsMap[product.id]}
              priorityImage={idx < 2}
            />
          ))}
        </div>

        {/* Botón ver catálogo en vista móvil */}
        <div className="mt-8 text-center sm:hidden">
          <Button
            href="/tienda"
            variant="outlined"
            size="md"
            fullWidth
          >
            <span>Ver catálogo completo</span>
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </Container>
    </section>
  );
};
