import { after, NextRequest, NextResponse } from "next/server";
import { orderAdmin } from "@/lib/server/orderHttp";
import { getOrderStore } from "@/lib/server/sqliteOrders";
import { authBody, authError, noStore, stringField } from "@/lib/server/authHttp";
import { deliverOrderMail } from "@/lib/server/orderMail";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, { params }: Context) {
  try { orderAdmin(request); return NextResponse.json(getOrderStore().detail((await params).id), { headers: noStore }); }
  catch (error) { return authError(error); }
}
export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const actor = orderAdmin(request), body = await authBody(request);
    const order = getOrderStore().update((await params).id, stringField(body, "estado"), stringField(body, "estado_anterior"), stringField(body, "nota"), actor);
    after(deliverOrderMail);
    return NextResponse.json({ order }, { headers: noStore });
  } catch (error) { return authError(error); }
}
