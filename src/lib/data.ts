import { Producto, PresentacionProducto, Asociacion } from "@/types";
import { siteConfig } from "@/lib/config";

// Fotos locales por producto (demo), usadas mientras el backend no tenga imágenes
// cargadas en Supabase Storage.
// Las fotos que vengan del backend siempre tienen prioridad sobre estas.
const LOCAL_PRODUCT_PHOTOS: Record<string, string> = {
  "queso-fresco-artesanal-el-lindero": "/demo/PROD-fresco.jpg",
  "queso-de-hoja-tradicional-mulanleo": "/demo/PROD-quesillo.jpg",
  "queso-andino-oregano-apukanlla": "/demo/PROD-maduro.jpg",
};

export function resolveProductPhotos(product: Pick<Producto, "fotos" | "slug">): string[] {
  const fromBackend = Array.isArray(product.fotos) ? product.fotos.filter(Boolean) : [];
  if (fromBackend.length > 0) {
    return fromBackend;
  }

  const local = LOCAL_PRODUCT_PHOTOS[product.slug ?? ""];
  return [local ?? siteConfig.assets.productPlaceholder];
}

export function normalizeBackendProduct(product: Producto): Producto {
  const presentations: PresentacionProducto[] = Array.isArray(product.presentaciones)
    ? product.presentaciones.map((presentation) => ({
        ...presentation,
        precio: Number(presentation.precio ?? 0),
        stock: Number(presentation.stock ?? 0),
      }))
    : [];
  const primaryPresentation = presentations[0];

  return {
    ...product,
    fotos: resolveProductPhotos(product),
    precio: Number(primaryPresentation?.precio ?? product.precio ?? 0),
    stock: Number(primaryPresentation?.stock ?? product.stock ?? 0),
    peso: primaryPresentation?.nombre_presentacion ?? product.peso,
    disponible: Boolean(product.disponible),
    presentaciones: presentations,
    variante_id: primaryPresentation?.id,
  };
}

export async function getAssociations(): Promise<Asociacion[]> {
  const response=await fetch(`${siteConfig.backendUrl}/asociaciones`,{cache:"no-store"});
  if(!response.ok) throw new Error("No se pudieron cargar las asociaciones");
  return response.json();
}
export async function getAssociationById(idOrSlug:string): Promise<Asociacion|null> {
  const response=await fetch(`${siteConfig.backendUrl}/asociaciones/${encodeURIComponent(idOrSlug)}`,{cache:"no-store"});
  if(response.status===404) return null;
  if(!response.ok) throw new Error("No se pudo cargar la asociación");
  return response.json();
}
