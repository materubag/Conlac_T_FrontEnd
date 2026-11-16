import type { Producto } from "../../types";
import { getDb } from "./sqlite";

// Consulta la configuración existente sin crear ni sobrescribir el catálogo.
export function obtenerProductosOcultos(): Set<string> {
  const fila = getDb().prepare(
    "SELECT contenido_json FROM paginas_editables WHERE slug = ?"
  ).get("tienda") as { contenido_json: string | null } | undefined;

  if (!fila?.contenido_json) return new Set();

  const contenido = JSON.parse(fila.contenido_json) as { productos?: Producto[] };
  const identificadores = (contenido.productos ?? [])
    .filter((producto) => producto.oculto === true || producto.stock <= 0)
    .flatMap((producto) => producto.slug ? [producto.id, producto.slug] : [producto.id]);
  return new Set(identificadores);
}

export function esProductoVisible(producto: Producto, ocultos: Set<string>): boolean {
  return producto.stock > 0 && !producto.oculto && !ocultos.has(producto.id) &&
    !(producto.slug && ocultos.has(producto.slug));
}

export function filtrarProductosVisibles(productos: Producto[]): Producto[] {
  const ocultos = obtenerProductosOcultos();
  return productos.filter((producto) => esProductoVisible(producto, ocultos));
}
