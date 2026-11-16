import nodemailer from "nodemailer";
import { getDb } from "@/lib/db/sqlite";
import { siteConfig } from "@/lib/config";
import { ORDER_LABELS, trackingUrl, type OrderStatus } from "@/lib/orders";
import type { OrderCreateResponse } from "@/types";

// Called after the HTTP response. Failures stay in SQLite and retry on subsequent
// order/admin activity, with exponential backoff. No OTP or recipient is logged.
export async function deliverOrderMail() {
  const db = getDb();
  const jobs = db.prepare("SELECT * FROM shop_order_mail WHERE estado IN ('pending','retry') AND attempts<5 AND next_at<=? ORDER BY id LIMIT 3").all(Date.now()) as { id: number; recipient: string; payload_json: string; attempts: number }[];
  if (!jobs.length) return;
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USERNAME, pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return;
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass }, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
  try {
    for (const job of jobs) {
      // A lease prevents concurrent requests from sending the same queue entry.
      const claimed = db.prepare("UPDATE shop_order_mail SET estado='retry',attempts=attempts+1,next_at=? WHERE id=? AND next_at<=? AND estado IN ('pending','retry')").run(Date.now() + 120000, job.id, Date.now());
      if (!claimed.changes) continue;
      try {
        const order: OrderCreateResponse = JSON.parse(job.payload_json);
        const link = trackingUrl(order.id, process.env.APP_ORIGIN || siteConfig.url);
        const result = await transport.sendMail({ from: process.env.SMTP_FROM || user, to: job.recipient,
          subject: `Tu pedido CONLAC-T · ${ORDER_LABELS[order.estado as OrderStatus] || order.estado}`,
          text: `Pedido: ${order.id}\nEstado: ${ORDER_LABELS[order.estado as OrderStatus] || order.estado}\nTotal: $${order.total.toFixed(2)}\n\nConsulta tu pedido: ${link}\n\nConserva este enlace de forma privada.`,
        });
        if (!result.accepted?.length) throw new Error("SMTP_REJECTED");
        db.prepare("UPDATE shop_order_mail SET estado='sent' WHERE id=?").run(job.id);
      } catch {
        db.prepare("UPDATE shop_order_mail SET estado=?,next_at=? WHERE id=?").run(job.attempts + 1 >= 5 ? "failed" : "retry", Date.now() + Math.min(3600000, 60000 * 2 ** job.attempts), job.id);
        console.error("[order-mail] Envío fallido; consulta scripts/smtp-check.cjs. No afecta al pedido.");
      }
    }
  } finally { transport.close(); }
}
