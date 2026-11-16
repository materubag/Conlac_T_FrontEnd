import { NextRequest, NextResponse } from "next/server";
import { getAuthStore } from "@/lib/server/sqliteAuth";
import { authBody, authError, noStore, sessionCookie, sessionToken } from "@/lib/server/authHttp";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    await authBody(request);
    getAuthStore().signOut(sessionToken(request));
    const response = NextResponse.json({ success: true }, { headers: noStore });
    sessionCookie(response, "", 0); return response;
  } catch (error) { return authError(error); }
}
