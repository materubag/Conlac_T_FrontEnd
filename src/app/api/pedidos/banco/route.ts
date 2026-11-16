import { NextRequest, NextResponse } from "next/server";
import { getBank, saveBank } from "@/lib/server/bankSettings";
import { orderAdmin } from "@/lib/server/orderHttp";
import { authBody, authError, noStore } from "@/lib/server/authHttp";
export const runtime = "nodejs";
export function GET() { return NextResponse.json(getBank(), { headers: noStore }); }
export async function PUT(request: NextRequest) {
  try { orderAdmin(request); return NextResponse.json(saveBank(await authBody(request)), { headers: noStore }); }
  catch (error) { return authError(error); }
}
