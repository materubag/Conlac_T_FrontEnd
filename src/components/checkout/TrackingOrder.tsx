"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { WhatsAppIcon, SearchIcon } from "@/components/ui/Icons";
import { BankDetails } from "./BankDetails";
import { formatPrice, buildWhatsAppUrl } from "@/lib/utils";
import { ORDER_ID, ORDER_LABELS, trackingPath, trackingUrl, type OrderStatus } from "@/lib/orders";
import { getOrderById } from "@/services/ordenes/orderService";
import type { OrderCreateResponse } from "@/types";

function Tracking() {
  const initial = useSearchParams().get("pedido") || "";
  const [input, setInput] = useState(initial);
  const [submitted, setSubmitted] = useState(initial);
  const [attempt, setAttempt] = useState(0);
  const [order, setOrder] = useState<OrderCreateResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!submitted) return;
    let active = true;
    Promise.resolve().then(async () => {
      if (!active) return;
      setBusy(true); setError(""); setOrder(null);
      try { const result = await getOrderById(submitted); if (active) setOrder(result); }
      catch (e) { if (active) setError(e instanceof Error ? e.message : "No pudimos consultar el pedido."); }
      finally { if (active) setBusy(false); }
    });
    return () => { active = false; };
  }, [submitted, attempt]);
  return <div className="bg-background py-10 sm:py-16"><Container>
    <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Buscar pedido" }]} />
    <div className="mx-auto max-w-2xl space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-widest text-tertiary">Seguimiento de tu compra</p><h1 className="mt-2 font-headline text-4xl font-bold text-primary">Buscar pedido</h1><p className="mt-3 text-sm text-neutral-muted">Pega el identificador completo que recibiste al confirmar tu compra. Conserva tu enlace de seguimiento de forma privada.</p></header>
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={event => {
        event.preventDefault(); const id = input.trim();
        if (!ORDER_ID.test(id)) { setOrder(null); setError("Usa el identificador completo, por ejemplo xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx. El número corto no permite buscar pedidos."); return; }
        window.history.replaceState(null, "", trackingPath(id)); setSubmitted(id); setAttempt(value => value + 1);
      }}>
        <label className="min-w-0 flex-1 text-xs font-semibold text-primary">Identificador del pedido<input required maxLength={36} autoComplete="off" value={input} onChange={event => setInput(event.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm text-primary outline-none focus:ring-2 focus:ring-tertiary" /></label>
        <Button type="submit" disabled={busy}><SearchIcon className="h-4 w-4" />{busy ? "Buscando…" : "Buscar pedido"}</Button>
      </form>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {order && <article className="space-y-6 rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <header className="space-y-3 border-b border-border pb-5"><h2 className="font-headline text-2xl font-bold text-primary">Tu pedido</h2><p className="break-all font-mono text-xs text-neutral-muted">{order.id}</p><span className={`inline-block rounded-full border px-3 py-1.5 text-xs font-semibold ${order.estado === "cancelled" ? "border-red-200 bg-red-50 text-red-800" : "border-primary/20 bg-primary/5 text-primary"}`}>{ORDER_LABELS[order.estado as OrderStatus] || order.estado}</span></header>
        <dl className="space-y-3 text-sm text-neutral"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div><div className="flex justify-between"><dt>Entrega</dt><dd>{formatPrice(order.flete)}</dd></div><div className="flex justify-between border-t border-border pt-3 font-bold text-primary"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div><div className="flex justify-between"><dt>Método de pago</dt><dd>Transferencia bancaria</dd></div></dl>
        {order.estado === "pending" && <><BankDetails />{order.reserva_expira_en && <p className="text-xs text-neutral-muted">Reserva hasta {new Date(order.reserva_expira_en).toLocaleString("es-EC", { timeZone: "America/Guayaquil" })}. Envía tu comprobante para verificar el pago.</p>}</>}
        <div className="flex flex-col gap-3 sm:flex-row"><Button href={buildWhatsAppUrl({ message: `Hola CONLAC-T, consulto el pedido ${order.id}. Seguimiento: ${trackingUrl(order.id, window.location.origin)}` })} isExternal variant="outlined"><WhatsAppIcon className="h-4 w-4" />Consultar por WhatsApp</Button><Button href="/tienda">Seguir comprando</Button></div>
      </article>}
    </div>
  </Container></div>;
}
export function TrackingOrder() { return <Suspense fallback={<p className="p-10 text-center text-neutral-muted">Cargando seguimiento…</p>}><Tracking /></Suspense>; }
