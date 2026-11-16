import { after, NextRequest, NextResponse } from "next/server";
import { assertSameOrigin, authError, noStore } from "@/lib/server/authHttp";
import { getOrderStore } from "@/lib/server/sqliteOrders";
import { AuthError } from "@/lib/server/sqliteAuth";
import { getStorePageData } from "@/lib/server/storeCatalog";
import { deliverOrderMail } from "@/lib/server/orderMail";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const raw = await request.text();
    if (raw.length > 24000) throw new AuthError("Pedido demasiado grande.", 413);
    let body;
    try { body = JSON.parse(raw); } catch { throw new AuthError("El pedido debe ser JSON válido."); }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new AuthError("Pedido inválido.");
    // Persist the real catalog once if this installation has not saved it yet.
    await getStorePageData();
    const order = getOrderStore().create(body, request.headers.get("idempotency-key") || "");
    after(deliverOrderMail);
    return NextResponse.json(order, { status: 201, headers: noStore });
  } catch (error) { return authError(error); }
}
