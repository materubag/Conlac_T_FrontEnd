"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { adminFetch } from "@/lib/adminFetch";
import { formatPrice, buildWhatsAppUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
type Order = { id: string; numero_pedido: number; estado: string; cliente: string; telefono: string;
  email: string; cedula_ruc: string; entrega: string; direccion: string; total: number; fecha: string;
  notas_administrativas: string; items: { nombre: string; presentacion: string; cantidad: number; precio: number }[] };
const labels: Record<string,string> = { pending: "Pendiente", paid: "Pagado", preparing: "En preparación", shipped: "Enviado", completed: "Completado", cancelled: "Cancelado" };
const transitions: Record<string,string[]> = { pending: ["paid","cancelled"], paid: ["preparing","cancelled"], preparing: ["shipped","cancelled"], shipped: ["completed","cancelled"] };
export default function OrdersPage() {
  const { isAdmin, isAuthenticated, loading } = useAuth(); const router = useRouter();
  const [orders,setOrders] = useState<Order[]>([]); const [filter,setFilter] = useState("pending");
  const [error,setError] = useState(""); const [busy,setBusy] = useState(true);
  const [notes,setNotes] = useState<Record<string,string>>({}); const [verified,setVerified] = useState<Record<string,boolean>>({});
  const query = filter ? `?estado=${filter}` : "";
  const load = useCallback(async () => {
    try { const res = await adminFetch(`${siteConfig.backendUrl}/admin/pedidos/operacion${query}`);
      if (!res.ok) {
        if(res.status===401) throw new Error("Tu sesión caducó. Inicia sesión nuevamente.");
        if(res.status===403) throw new Error("Tu cuenta no tiene permisos para consultar pedidos.");
        throw new Error("No se pudieron cargar los pedidos por un error del servidor. Intenta nuevamente.");
      }
      setOrders(await res.json()); setError("");
    } catch(e) { setError(e instanceof Error ? e.message : "Error de conexión"); } finally { setBusy(false); }
  },[query]);
  useEffect(() => { if (!loading && !isAuthenticated) router.replace("/login?redirect=/administracion/pedidos"); },[loading,isAuthenticated,router]);
  useEffect(() => { if (!isAdmin) return; const timer=setTimeout(()=>void load(),0); return ()=>clearTimeout(timer); },[isAdmin,load]);
  async function update(order: Order, state: string) {
    if (state === "paid" && !verified[order.id]) { setError("Verifica el comprobante recibido por WhatsApp y el abono bancario antes de marcar pagado."); return; }
    if (state === "cancelled" && !confirm(`¿Cancelar el pedido #${order.numero_pedido} y devolver sus unidades al inventario?`)) return;
    setBusy(true); setError("");
    try { const res = await adminFetch(`${siteConfig.backendUrl}/admin/pedidos/${order.id}/estado`, { method: "PATCH", headers: { "Content-Type":"application/json" },
      body: JSON.stringify({ nuevo_estado: state, notas_administrativas: notes[order.id] || (state === "paid" ? "Comprobante recibido por WhatsApp y abono bancario verificados." : undefined) }) });
      if (!res.ok) { const data = await res.json(); throw new Error(data.message || "No se pudo cambiar el estado"); }
      setVerified(v => ({...v,[order.id]:false})); await load();
    } catch(e) { setError(e instanceof Error ? e.message : "Error de conexión"); } finally { setBusy(false); }
  }
  async function exportCsv() {
    setError(""); try { const res = await adminFetch(`${siteConfig.backendUrl}/admin/pedidos/exportar-csv${query}`);
      if (!res.ok) throw new Error("No se pudo exportar el reporte");
      const url = URL.createObjectURL(await res.blob()); const a = document.createElement("a"); a.href=url; a.download="pedidos-conlact.csv"; a.click(); URL.revokeObjectURL(url);
    } catch(e) {setError(e instanceof Error ? e.message : "Error al exportar");}
  }
  if(loading) return <p className="p-8">Comprobando sesión…</p>;
  if(!isAdmin) return <p className="p-8">Se requiere acceso de administrador.</p>;
  return <Container className="py-12"><Link href="/administracion">← Administración</Link>
    <h1 className="text-3xl font-bold my-6">Gestión de pedidos</h1>
    <p>Recibe el comprobante por WhatsApp, verifica el abono en la cuenta del consorcio y confirma el pago manualmente.</p>
    <div className="flex flex-wrap gap-4 my-6"><label>Estado <select value={filter} onChange={e=>setFilter(e.target.value)} className="border rounded p-2"><option value="">Todos</option>{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
      <button onClick={load} disabled={busy} className="border rounded px-4">Actualizar</button><button onClick={exportCsv} disabled={busy} className="border rounded px-4">Exportar CSV</button></div>
    {error && <p role="alert" className="text-red-700 my-4">{error}</p>}
    {busy && <p role="status">Procesando…</p>}
    {!busy && !error && !orders.length && <p>No hay pedidos en este estado.</p>}
    <div className="space-y-5">{orders.map(o=><article key={o.id} className="border rounded-2xl p-5 bg-surface space-y-3">
      <h2 className="text-xl font-bold">#{o.numero_pedido} · {labels[o.estado] || o.estado} · {formatPrice(o.total)}</h2>
      <p>{o.cliente} · {o.cedula_ruc} · {o.telefono} · {o.email}</p><p>{o.entrega === "pickup" ? "Retiro en planta" : o.direccion} · {new Date(o.fecha).toLocaleString("es-EC")}</p>
      <ul>{o.items.map((i,n)=><li key={n}>{i.cantidad} × {i.nombre} ({i.presentacion}) — {formatPrice(i.precio)}</li>)}</ul>
      <a href={buildWhatsAppUrl({phone:o.telefono, message:`Hola, sobre tu pedido #${o.numero_pedido}: por favor envía el comprobante de transferencia para verificar el pago de ${formatPrice(o.total)}.`})} target="_blank" rel="noreferrer" className="underline">Contactar al cliente por WhatsApp</a>
      {o.notas_administrativas && <p>Notas: {o.notas_administrativas}</p>}
      {transitions[o.estado] && <><label className="block">Referencia bancaria / notas<textarea value={notes[o.id] || ""} onChange={e=>setNotes({...notes,[o.id]:e.target.value})} className="block border rounded w-full p-2" /></label>
      {o.estado === "pending" && <label className="block"><input type="checkbox" checked={!!verified[o.id]} onChange={e=>setVerified({...verified,[o.id]:e.target.checked})} /> Comprobante y abono bancario verificados</label>}
      <div className="flex flex-wrap gap-3">{transitions[o.estado].map(state=><button key={state} disabled={busy || (state === "paid" && !verified[o.id])} onClick={()=>update(o,state)} className="rounded border px-4 py-2 disabled:opacity-40">Marcar {labels[state].toLowerCase()}</button>)}</div></>}
    </article>)}</div></Container>;
}
