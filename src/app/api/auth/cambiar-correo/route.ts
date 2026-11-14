import { NextRequest, NextResponse } from "next/server";
import { AuthError, getAuthStore } from "@/lib/server/sqliteAuth";
import { recoveryMailer } from "@/lib/server/recoveryMail";
import { authBody, authError, noStore, sessionCookie, sessionToken, stringField } from "@/lib/server/authHttp";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    const body = await authBody(request);
    if (body.action === "request") {
      const result = await getAuthStore().requestEmailChange(sessionToken(request), stringField(body, "email"), stringField(body, "currentPassword"), recoveryMailer("email"));
      return NextResponse.json({ success: true, message: "Enviamos un código a tu nuevo correo. Verifícalo para completar el cambio.", ...result }, { headers: noStore });
    }
    if (body.action !== "verify") throw new AuthError("Verifica tu nuevo correo con el código de seis dígitos.");
    const result = await getAuthStore().verifyEmailChange(sessionToken(request), stringField(body, "requestId"), stringField(body, "code"));
    const response = NextResponse.json({ success: true, message: "Correo actualizado correctamente.", ...result.session }, { headers: noStore });
    sessionCookie(response, result.sessionToken); return response;
  } catch (error) { return authError(error); }
}
