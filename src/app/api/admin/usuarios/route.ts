import { NextRequest, NextResponse } from "next/server";
import { getUserManager } from "@/lib/server/userManagement";
import { authBody, authError, noStore, sessionToken } from "@/lib/server/authHttp";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try { return NextResponse.json({ users: getUserManager().list(sessionToken(request)) }, { headers: noStore }); }
  catch (error) { return authError(error); }
}
export async function POST(request: NextRequest) {
  try {
    const body = await authBody(request);
    const user = await getUserManager().create(sessionToken(request), body);
    return NextResponse.json({ success: true, user }, { status: 201, headers: noStore });
  } catch (error) { return authError(error); }
}
