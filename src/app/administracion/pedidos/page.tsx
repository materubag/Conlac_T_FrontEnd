"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SearchIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { ORDER_LABELS, ORDER_TRANSITIONS, trackingPath, trackingUrl, type OrderStatus } from "@/lib/orders";
import { buildWhatsAppUrl, formatPrice } from "@/lib/utils";
import type { ManagedOrder } from "@/lib/server/sqliteOrders";
import type { BankSettings } from "@/lib/server/bankSettings";

type Event = { anterior: string | null; nuevo: OrderStatus; nota: string; creado_en: string; actor_id: string };
type Detail = { order: ManagedOrder; events: Event[] };
type List = { orders: ManagedOrder[]; total: number; page: number; pages: number };
const inputClass = "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-primary outline-none focus:ring-2 focus:ring-tertiary";
const date = (value: string) => new Date(value).toLocaleString("es-EC", { timeZone: "America/Guayaquil" });
async function read(response: Response) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No pudimos completar la operación.");
  return data;
}
function State({ value }: { value: string }) {
  return <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${value === "cancelled" ? "border-red-200 bg-red-50 text-red-800" : value === "pending" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-primary/20 bg-primary/5 text-primary"}`}>{ORDER_LABELS[value as OrderStatus] || value}</span>;
}

export default function OrdersPage() {
  const { loading: authLoading, isAdmin } = useAuth();
  const [list, setList] = useState<List | null>(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [target, setTarget] = useState("");
  const [note, setNote] = useState("");
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [bank, setBank] = useState<BankSettings | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);

  const reload = useCallback(() => setRefresh(value => value + 1), []);
  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    Promise.resolve().then(() => { if (!controller.signal.aborted) setBusy(true); });
    fetch(`/api/admin/pedidos?estado=${encodeURIComponent(status)}&q=${encodeURIComponent(query)}&page=${page}`, { signal: controller.signal, cache: "no-store" })
      .then(read).then(data => { if (!controller.signal.aborted) setList(data); })
      .catch(error => { if (!controller.signal.aborted) setNotice(error.message); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [isAdmin, status, query, page, refresh]);
  useEffect(() => {
    if (!isAdmin || !selected) return;
    const controller = new AbortController();
    fetch(`/api/admin/pedidos/${selected}`, { signal: controller.signal, cache: "no-store" }).then(read)
      .then(data => { if (!controller.signal.aborted) { setDetail(data); setTarget(""); setNote(""); setVerified(false); } })
      .catch(error => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [isAdmin, selected, refresh]);
  useEffect(() => {
    if (!isAdmin) return;
    const controller = new AbortController();
    fetch("/api/pedidos/banco", { signal: controller.signal }).then(read).then(setBank)
      .catch(error => { if (!controller.signal.aborted) setNotice(error.message); });
    return () => controller.abort();
  }, [isAdmin]);

  if (authLoading) return <p className="p-12 text-center text-neutral-muted">Comprobando acceso…</p>;
  if (!isAdmin) return <Container><div className="my-12 space-y-4 rounded-2xl border border-border bg-surface p-8"><h1 className="font-headline text-2xl text-primary">Gestión de pedidos</h1><p className="text-sm text-neutral-muted">Necesitas una cuenta administradora para consultar clientes y gestionar sus pedidos.</p><Button href="/login?redirect=/administracion/pedidos">Acceso de gestión</Button></div></Container>;

  const order = detail?.order;
  const transitions = order ? (ORDER_TRANSITIONS[order.estado as OrderStatus] || []).filter(next => !(next === "shipped" && order.metodo_entrega === "pickup") && !(next === "completed" && order.metodo_entrega === "delivery" && order.estado === "preparing")) : [];

  return <div className="bg-background py-8 sm:py-12"><Container>
    <Breadcrumbs items={[{ label: "Inicio", href: "/" }, { label: "Administración", href: "/administracion" }, { label: "Pedidos" }]} />
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-tertiary">Gestión de pedidos</p><h1 className="mt-2 font-headline text-3xl font-bold text-primary sm:text-4xl">Pedidos y entregas</h1><p className="mt-2 max-w-xl text-sm text-neutral-muted">Verifica pagos por transferencia y acompaña cada pedido hasta su entrega.</p></div><div className="flex gap-2"><Button variant="outlined" onClick={() => setBankOpen(value => !value)}>Cuenta bancaria</Button><Button variant="outlined" onClick={reload} disabled={busy}>Actualizar</Button></div></header>
    <p className="mb-5 rounded-xl border border-border bg-surface p-4 text-xs leading-relaxed text-neutral-muted">Aquí aparecen los pedidos creados con la nueva tienda. Los pedidos anteriores se pueden consultar con su identificador completo. El stock se reserva al crear la compra y se devuelve al cancelarla o vencer las 24 horas sin verificar el pago.</p>
    {notice && <div role="status" className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-tertiary/40 bg-tertiary/10 p-4 text-sm text-primary"><p>{notice}</p><button className="underline" onClick={() => setNotice("")}>Cerrar</button></div>}
    {bankOpen && bank && <form className="mb-6 space-y-4 rounded-2xl border border-border bg-surface p-6" onSubmit={async event => {
      event.preventDefault(); setBankSaving(true); setNotice("");
      try { const saved = await fetch("/api/pedidos/banco", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bank) }).then(read); setBank(saved); setBankOpen(false); setNotice("Cuenta bancaria actualizada en el checkout."); }
      catch (error) { setNotice(error instanceof Error ? error.message : "No se guardó la cuenta."); }
      finally { setBankSaving(false); }
    }}><h2 className="font-headline text-xl font-bold text-primary">Transferencias · Banco Pichincha</h2>{bank.ejemplo && <p className="text-sm text-amber-900">El checkout muestra datos de ejemplo. Configura la cuenta real antes de recibir transferencias.</p>}<div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-semibold text-primary">Titular<input required minLength={3} maxLength={150} value={bank.titular} onChange={e => setBank({ ...bank, titular: e.target.value })} className={`${inputClass} mt-2`} /></label>
      <label className="text-xs font-semibold text-primary">Tipo<select value={bank.tipo} onChange={e => setBank({ ...bank, tipo: e.target.value })} className={`${inputClass} mt-2`}><option>Cuenta corriente</option><option>Cuenta de ahorros</option></select></label>
      <label className="text-xs font-semibold text-primary">Número de cuenta<input required inputMode="numeric" pattern="[0-9]{6,20}" maxLength={20} value={bank.cuenta} onChange={e => setBank({ ...bank, cuenta: e.target.value })} className={`${inputClass} mt-2`} /></label>
      <label className="text-xs font-semibold text-primary">Cédula / RUC<input required inputMode="numeric" pattern="[0-9]{10}([0-9]{3})?" maxLength={13} value={bank.identificacion} onChange={e => setBank({ ...bank, identificacion: e.target.value })} className={`${inputClass} mt-2`} /></label>
    </div><Button type="submit" disabled={bankSaving}>{bankSaving ? "Guardando…" : "Guardar cuenta real"}</Button></form>}
    <form className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={event => { event.preventDefault(); setQuery(search.trim()); setPage(1); }}>
      <label className="min-w-0 flex-1 text-xs font-semibold text-primary">Buscar por identificador, cliente o correo<input maxLength={150} value={search} onChange={e => setSearch(e.target.value)} className={`${inputClass} mt-2`} placeholder="Nombre del cliente o identificador completo" /></label>
      <label className="text-xs font-semibold text-primary">Estado<select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={`${inputClass} mt-2`}><option value="">Todos los estados</option>{Object.entries(ORDER_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <Button type="submit"><SearchIcon className="h-4 w-4" />Buscar</Button>
    </form>
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section aria-label="Lista de pedidos" aria-busy={busy} className="min-w-0 space-y-3"><p className="text-xs text-neutral-muted">{busy ? "Actualizando pedidos…" : `${list?.total ?? 0} pedidos encontrados`}</p>
        {!busy && list?.orders.length === 0 && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-neutral-muted">No hay pedidos con esos filtros.</p>}
        {list?.orders.map(item => <button key={item.id} onClick={() => { setDetail(null); setSelected(item.id); reload(); }} className={`w-full space-y-3 rounded-2xl border bg-surface p-5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-tertiary ${selected === item.id ? "border-primary shadow-sm" : "border-border hover:border-primary/40"}`}><div className="flex flex-wrap items-center justify-between gap-2"><State value={item.estado} /><span className="font-bold text-primary">{formatPrice(item.total)}</span></div><p className="font-semibold text-primary">{item.cliente.nombre}</p><p className="break-all font-mono text-[11px] text-neutral-muted">{item.id}</p><p className="text-xs text-neutral-muted">{date(item.creado_en)} · {item.metodo_entrega === "pickup" ? "Retiro en planta" : "Envío a domicilio"}</p></button>)}
        {list && list.pages > 1 && <div className="flex items-center justify-between gap-3 py-3"><Button variant="outlined" disabled={page <= 1 || busy} onClick={() => setPage(value => value - 1)}>Anterior</Button><span className="text-xs text-neutral-muted">{page} / {list.pages}</span><Button variant="outlined" disabled={page >= list.pages || busy} onClick={() => setPage(value => value + 1)}>Siguiente</Button></div>}
      </section>
      <section aria-label="Detalle del pedido" className="min-w-0 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        {!order ? <p className="py-10 text-center text-sm text-neutral-muted">{selected ? "Cargando detalle…" : "Selecciona un pedido para ver sus datos y gestionar la entrega."}</p> : <div className="space-y-6">
          <header><h2 className="font-headline text-2xl font-bold text-primary">Detalle del pedido</h2><p className="my-3 break-all font-mono text-xs text-neutral-muted">{order.id}</p><State value={order.estado} /></header>
          <div className="space-y-2 border-t border-border pt-4 text-sm text-neutral"><h3 className="font-semibold text-primary">Cliente y entrega</h3><p>{order.cliente.nombre}</p><p>Cédula/RUC: {order.cliente.cedula_ruc}</p><p>Teléfono: {order.cliente.telefono}</p>{order.cliente.email && <p className="break-all">{order.cliente.email}</p>}<p>{order.direccion_entrega}</p>{order.notas_cliente && <p className="rounded-xl bg-background p-3">{order.notas_cliente}</p>}</div>
          <div className="space-y-3 border-t border-border pt-4 text-sm">{order.items.map((item, i) => <div key={`${item.producto_id}-${i}`} className="flex justify-between gap-3 text-neutral"><span>{item.cantidad} × {item.nombre}</span><span className="shrink-0">{formatPrice(item.precio * item.cantidad)}</span></div>)}<div className="flex justify-between text-neutral-muted"><span>Entrega</span><span>{formatPrice(order.flete)}</span></div><div className="flex justify-between border-t border-border pt-3 font-bold text-primary"><span>Total</span><span>{formatPrice(order.total)}</span></div></div>
          {transitions.length > 0 && <form className="space-y-3 rounded-xl border border-border bg-background p-4" onSubmit={async event => {
            event.preventDefault(); if (target === "paid" && !verified) return;
            setSaving(true); setNotice("");
            try { await fetch(`/api/admin/pedidos/${order.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado: target, estado_anterior: order.estado, nota: note }) }).then(read); setNotice("Estado actualizado. El historial y el seguimiento ya reflejan el cambio."); reload(); }
            catch (error) { setNotice(error instanceof Error ? error.message : "No se actualizó el pedido."); reload(); }
            finally { setSaving(false); }
          }}><h3 className="font-semibold text-primary">Actualizar estado</h3><label className="block text-xs text-primary">Nuevo estado<select required value={target} onChange={e => { setTarget(e.target.value); setVerified(false); }} className={`${inputClass} mt-2`}><option value="">Selecciona una acción</option>{transitions.map(next => <option key={next} value={next}>{ORDER_LABELS[next]}</option>)}</select></label>
          {target === "paid" && <label className="flex items-start gap-2 text-xs text-primary"><input required type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} className="mt-0.5" />He verificado que la transferencia está acreditada en la cuenta bancaria.</label>}
          {target === "cancelled" && <p className="text-xs text-red-800">Se devolverán las unidades al stock. Si ya hubo un pago, coordina el reembolso manualmente y deja constancia en la nota.</p>}
          <label className="block text-xs text-primary">Nota {target === "cancelled" ? "(obligatoria)" : "(opcional)"}<textarea maxLength={500} required={target === "cancelled"} value={note} onChange={e => setNote(e.target.value)} rows={2} className={`${inputClass} mt-2`} /></label><Button type="submit" disabled={saving || !target || (target === "paid" && !verified)}>{saving ? "Guardando…" : "Confirmar cambio"}</Button></form>}
          <div className="flex flex-wrap gap-3"><Link href={trackingPath(order.id)} className="text-sm font-semibold text-primary underline">Ver seguimiento público</Link><a href={buildWhatsAppUrl({ phone: order.cliente.telefono.startsWith("0") ? `593${order.cliente.telefono.slice(1)}` : order.cliente.telefono, message: `Hola ${order.cliente.nombre}, tu pedido CONLAC-T está ${ORDER_LABELS[order.estado as OrderStatus]}. Puedes consultarlo aquí: ${trackingUrl(order.id, window.location.origin)}` })} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline"><WhatsAppIcon className="h-4 w-4" />Contactar al cliente</a></div>
          <section className="border-t border-border pt-4"><h3 className="mb-3 font-semibold text-primary">Historial de estados</h3><ol className="space-y-3">{detail?.events.map((event, i) => <li key={i} className="border-l-2 border-tertiary/50 pl-3 text-xs"><p className="font-semibold text-primary">{ORDER_LABELS[event.nuevo]}</p><p className="mt-1 text-neutral-muted">{date(event.creado_en)} · {event.actor_id === "system" ? "Sistema" : event.actor_id === "guest" ? "Compra web" : "Administración"}</p>{event.nota && <p className="mt-1 text-neutral">{event.nota}</p>}</li>)}</ol></section>
        </div>}
      </section>
    </div>
  </Container></div>;
}
