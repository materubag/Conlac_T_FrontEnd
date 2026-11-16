import { NextRequest, NextResponse } from "next/server";
import { AuthError, getAuthStore } from "@/lib/server/sqliteAuth";
import { recoveryMailer } from "@/lib/server/recoveryMail";
import { authBody, authError, clientKey, noStore, resetCookie, sessionCookie, stringField, RESET_COOKIE } from "@/lib/server/authHttp";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
 try {
  const body = await authBody(request);
  const store = getAuthStore();
  if (body.action === "request") {
   const result = await store.requestReset(stringField(body,"email"), clientKey(request), recoveryMailer());
   const response = NextResponse.json({success:true,message:"Si existe una cuenta con ese correo, recibirás un código de recuperación.",...result},{headers:noStore});
   resetCookie(response,"",0); return response;
  }
  if (body.action === "verify") {
   const token = await store.verifyResetCode(stringField(body,"requestId"),stringField(body,"code"));
   const response = NextResponse.json({success:true},{headers:noStore}); resetCookie(response,token); return response;
  }
  if (body.action === "reset") {
   await store.finishReset(request.cookies.get(RESET_COOKIE)?.value,stringField(body,"password"),stringField(body,"confirmation"));
   const response = NextResponse.json({success:true},{headers:noStore}); resetCookie(response,"",0); sessionCookie(response,"",0); return response;
  }
  if (body.action === "cancel") {
   store.cancelReset(request.cookies.get(RESET_COOKIE)?.value);
   const response = NextResponse.json({success:true},{headers:noStore}); resetCookie(response,"",0); return response;
  }
  throw new AuthError("Acción de recuperación no válida.");
 } catch(error) { return authError(error); }
}
