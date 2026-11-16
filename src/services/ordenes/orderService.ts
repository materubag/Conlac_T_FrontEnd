import type { OrderCreateResponse } from "@/types";
import { ORDER_ID } from "@/lib/orders";
export async function getOrderById(id: string): Promise<OrderCreateResponse> {
  if (!ORDER_ID.test(id)) throw new Error("Ingresa el identificador completo del pedido, no el numero corto.");
  const response = await fetch('/api/pedidos/' + encodeURIComponent(id), { cache: 'no-store' });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'No pudimos consultar el pedido.');
  return body;
}
// Compatibility for callers: sequential order numbers are no longer accepted.
export const getOrderByTrackingNumber = getOrderById;
