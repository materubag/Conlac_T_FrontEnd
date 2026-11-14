import { NextRequest, NextResponse } from "next/server";
import { getAuthStore } from "@/lib/server/sqliteAuth";
import { authError, noStore, sessionToken } from "@/lib/server/authHttp";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    const token = sessionToken(request);
    return NextResponse.json({ session: token ? getAuthStore().session(token) : null }, { headers: noStore });
  } catch (error) { return authError(error); }
}
