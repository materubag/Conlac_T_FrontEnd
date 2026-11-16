import type { Producto } from "@/types";
import { siteConfig } from "@/lib/config";
import { leerPaginaConfig, type PaginaEditableConfig } from "@/lib/db/paginasRepo";

export interface StoreContent { productos?: Producto[] }

export function catalogImage(product: Producto): Producto {
  const fotos = Array.isArray(product.fotos) ? product.fotos.filter((foto) => typeof foto === "string" && foto.trim()) : [];
  return { ...product, fotos: fotos.length ? fotos : [siteConfig.assets.productPlaceholder] };
}

export function selectHomeProducts(products: Producto[], limit = 4): Producto[] {
  return products.filter((product) => !product.oculto && product.stock > 0).slice(0, limit).map(catalogImage);
}

export async function getStorePageData(): Promise<{
  config: PaginaEditableConfig<StoreContent>; products: Producto[]; error: string | null;
}> {
  const saved = leerPaginaConfig<StoreContent>("tienda");
  // Una lista vacía guardada es intencional: no se repuebla con productos ficticios.
  if (Array.isArray(saved?.contenido?.productos)) {
    const products = saved.contenido.productos.map(catalogImage);
    return { config: { ...saved, contenido: { ...saved.contenido, productos: products } }, products, error: null };
  }
  let products: Producto[] = [];
  let error: string | null = null;
  try {
    const response = await fetch(`${siteConfig.backendUrl}/products`, {
      cache: "no-store", headers: { Accept: "application/json" }, signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: Producto[] = await response.json();
    if (!Array.isArray(data)) throw new Error("Formato de catálogo inválido");
    products = data.map((product) => {
      const presentaciones = (product.presentaciones ?? []).map((item) => ({ ...item, precio: Number(item.precio), stock: Number(item.stock) }));
      const first = presentaciones[0];
      return catalogImage({ ...product, presentaciones, precio: Number(first?.precio ?? product.precio ?? 0),
        stock: Number(first?.stock ?? product.stock ?? 0), peso: first?.nombre_presentacion ?? product.peso,
        variante_id: first?.id ?? product.variante_id, disponible: Boolean(product.disponible) });
    });
  } catch {
    error = "El catálogo no está disponible en este momento. Escríbenos por WhatsApp para coordinar tu pedido.";
  }
  return {
    config: {
      slug: "tienda", eyebrow: saved?.eyebrow ?? "Catálogo Oficial", titulo: saved?.titulo ?? "Tienda de Quesos Artesanales",
      subtitulo: saved?.subtitulo ?? "Explora los quesos elaborados por las comunidades de CONLAC-T.", contenido: { productos: products },
    }, products, error,
  };
}
