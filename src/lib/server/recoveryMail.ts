import nodemailer from "nodemailer";
import { AuthError, type ResetMailer } from "./sqliteAuth";

export function recoveryMailer(purpose: "password" | "email" = "password"): ResetMailer {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;
  const port = Number(process.env.SMTP_PORT || 587);
  if (!host || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) throw new AuthError("El servicio de correo no está configurado. Contacta con la administración.", 503);
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
  return async (email, code) => {
    const title = purpose === "email" ? "Verifica tu nuevo correo" : "Cambia tu contraseña";
    const instruction = purpose === "email" ? "Ingresa este código en el modal de cambio de correo para confirmar tu nueva dirección:" : "Ingresa este código en la pantalla de recuperación:";
    const result = await transport.sendMail({
      from: process.env.SMTP_FROM || `"CONLAC-T" <${user}>`, to: email,
      subject: `${title} · CONLAC-T`,
      text: `${title}\n\n${instruction}\n${code}\n\nCaduca en 10 minutos y solo puede utilizarse una vez. Si no solicitaste este cambio, ignora este correo.`,
      html: `<div style="background:#F8F4E9;padding:32px;font-family:Arial,sans-serif;color:#184332"><div style="max-width:480px;margin:auto;background:white;padding:28px;border-radius:18px"><h1 style="font-size:24px">CONLAC-T</h1><h2 style="font-size:20px">${title}</h2><p>${instruction}</p><p style="font-size:34px;font-weight:bold;letter-spacing:8px;background:#F8F4E9;padding:18px;text-align:center;border-radius:12px">${code}</p><p>El código caduca en <strong>10 minutos</strong> y solo puede utilizarse una vez.</p><p style="font-size:12px;color:#7A624E">Si no solicitaste este cambio, ignora este correo.</p></div></div>`,
    });
    if (!result.accepted?.length) throw new Error("El servidor de correo no aceptó el envío.");
  };
}
