import { NextRequest, NextResponse } from "next/server";
import { getUserManager } from "@/lib/server/userManagement";
import { authBody, authError, noStore, sessionToken } from "@/lib/server/authHttp";

export const runtime = "nodejs";
interface Params { params: Promise<{ id: string }> }
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await authBody(request);
    const { id } = await params;
    const user = getUserManager().update(sessionToken(request), id, body);
    return NextResponse.json({ success: true, user }, { headers: noStore });
  } catch (error) { return authError(error); }
}
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await authBody(request);
    const { id } = await params;
    getUserManager().delete(sessionToken(request), id);
    return NextResponse.json({ success: true }, { headers: noStore });
  } catch (error) { return authError(error); }
}
