import { NextRequest, NextResponse } from "next/server";
import { getAuthStore } from "@/lib/server/sqliteAuth";
import { authBody, authError, clientKey, noStore, sessionCookie, stringField } from "@/lib/server/authHttp";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const body = await authBody(request);
    const result = await getAuthStore().signIn(stringField(body, "email"), stringField(body, "password"), clientKey(request));
    const response = NextResponse.json({ success: true, ...result.session }, { headers: noStore });
    sessionCookie(response, result.sessionToken); return response;
  } catch (error) { return authError(error); }
}
