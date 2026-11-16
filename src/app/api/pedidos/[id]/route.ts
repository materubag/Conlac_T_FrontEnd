import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";
import { ORDER_ID } from "@/lib/orders";
import { getOrderStore } from "@/lib/server/sqliteOrders";
import { authError, noStore } from "@/lib/server/authHttp";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id.toLowerCase();
    if (!ORDER_ID.test(id)) return NextResponse.json({ error: "Ingresa el identificador completo del pedido, no el número corto." }, { status: 400, headers: noStore });
    const local = getOrderStore().get(id);
    if (local) return NextResponse.json(local, { headers: noStore });
    // Existing Java orders remain readable; never proxy its sequential tracker.
    try {
      const response = await fetch(`${siteConfig.backendUrl}/orders/${encodeURIComponent(id)}`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const old = await response.json();
        return NextResponse.json({ id: old.id, numero_pedido: old.numero_pedido, subtotal: old.subtotal,
          flete: old.flete, total: old.total, estado: old.estado, metodo_pago: old.metodo_pago,
          reserva_expira_en: old.reserva_expira_en }, { headers: noStore });
      }
      if (response.status !== 404) return NextResponse.json({ error: "No pudimos consultar los pedidos anteriores. Intenta más tarde." }, { status: 503, headers: noStore });
    } catch { return NextResponse.json({ error: "El servicio de pedidos anteriores no está disponible." }, { status: 503, headers: noStore }); }
    return NextResponse.json({ error: "No se encontró el pedido." }, { status: 404, headers: noStore });
  } catch (error) { return authError(error); }
}
