import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Dirección de correo electrónico inválida." },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USERNAME || "deividjosue52@gmail.com";
    const pass = process.env.SMTP_PASSWORD || "fuemvepypglugyyj";
    const from = process.env.SMTP_FROM || `"CONLAC-T" <${user}>`;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9f8; margin: 0; padding: 24px; color: #2d3748; }
          .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #1B4D3E; padding: 32px 24px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
          .header p { color: #d1fae5; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .content h2 { color: #1B4D3E; margin-top: 0; font-size: 20px; }
          .button-wrap { text-align: center; margin: 32px 0; }
          .button { display: inline-block; background: #1B4D3E; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 6px rgba(27,77,62,0.3); }
          .notice { background: #f0fdf4; border-left: 4px solid #1B4D3E; padding: 14px 16px; font-size: 13px; color: #166534; border-radius: 4px; margin-top: 24px; }
          .footer { background: #fafafa; border-top: 1px solid #edf2f7; padding: 20px 24px; text-align: center; font-size: 12px; color: #718096; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>CONLAC-T</h1>
            <p>Consorcio de Lácteos de Tungurahua</p>
          </div>
          <div class="content">
            <h2>Restablecimiento de Contraseña</h2>
            <p>Hola,</p>
            <p>Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta <strong>${email}</strong> en la tienda comunitaria de CONLAC-T.</p>
            <p>Para ingresar y gestionar tu cuenta de forma segura, haz clic en el siguiente botón:</p>
            <div class="button-wrap">
              <a href="${resetUrl}" class="button" target="_blank">Ir a Iniciar Sesión en CONLAC-T</a>
            </div>
            <div class="notice">
              <strong>Nota de seguridad:</strong> Si tú no solicitaste este cambio, puedes ignorar este mensaje de forma segura. Tu cuenta permanece protegida.
            </div>
          </div>
          <div class="footer">
            <p>Pilahuín, Tungurahua • Ecuador<br>Tradición comunitaria y producción láctea de altura</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from,
      to: email,
      subject: "Restablecimiento de Contraseña - CONLAC-T",
      html: htmlContent,
    });

    console.log(`[API Recuperación] Correo enviado exitosamente a ${email} (ID: ${info.messageId})`);

    return NextResponse.json({
      success: true,
      message: "Correo de recuperación enviado exitosamente.",
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error desconocido";
    console.error("[API Recuperación] Error enviando correo:", error);
    return NextResponse.json(
      { success: false, error: errMessage },
      { status: 500 }
    );
  }
}
