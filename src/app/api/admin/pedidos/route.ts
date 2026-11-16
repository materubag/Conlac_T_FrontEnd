import { after, NextRequest, NextResponse } from "next/server";
import { orderAdmin } from "@/lib/server/orderHttp";
import { getOrderStore } from "@/lib/server/sqliteOrders";
import { authError, noStore } from "@/lib/server/authHttp";
import { deliverOrderMail } from "@/lib/server/orderMail";
export const runtime = "nodejs";
export function GET(request: NextRequest) {
  try {
    orderAdmin(request);
    const query = request.nextUrl.searchParams;
    const page = Math.max(1, Math.min(100000, Number(query.get("page")) || 1));
    const result = getOrderStore().list(query.get("estado") || "", query.get("q") || "", Math.floor(page));
    after(deliverOrderMail);
    return NextResponse.json(result, { headers: noStore });
  } catch (error) { return authError(error); }
}
