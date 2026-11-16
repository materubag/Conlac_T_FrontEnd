"use client";
import { useEffect, useState } from "react";
import type { BankSettings } from "@/lib/server/bankSettings";

export function BankDetails() {
  const [bank, setBank] = useState<BankSettings | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/pedidos/banco", { signal: controller.signal, cache: "no-store" })
      .then(response => { if (!response.ok) throw Error(); return response.json(); })
      .then(setBank).catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);
  if (error) return <p className="text-sm text-red-800">No pudimos cargar la cuenta bancaria. Confirma los datos por WhatsApp antes de transferir.</p>;
  if (!bank) return <p className="text-sm text-neutral-muted">Cargando datos bancarios…</p>;
  return <section aria-label="Cuenta para transferencia" className="rounded-2xl border border-border bg-background p-5 text-sm">
    <h3 className="font-headline text-lg font-bold text-primary">{bank.banco}</h3>
    {bank.ejemplo && <p role="note" className="my-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900">Cuenta de ejemplo. No transfieras a estos datos: solicita la cuenta real por WhatsApp.</p>}
    <dl className="mt-3 space-y-2 break-words text-neutral">
      <div><dt className="text-xs text-neutral-muted">Titular</dt><dd className="font-semibold">{bank.titular}</dd></div>
      <div><dt className="text-xs text-neutral-muted">{bank.tipo}</dt><dd className="font-mono text-base tracking-wide">{bank.cuenta}</dd></div>
      <div><dt className="text-xs text-neutral-muted">Cédula / RUC</dt><dd>{bank.identificacion}</dd></div>
    </dl>
    {!bank.ejemplo && <p className="mt-4 text-xs text-neutral-muted">Usa el identificador completo del pedido como referencia y envía el comprobante por WhatsApp. El pago se verifica manualmente.</p>}
  </section>;
}
