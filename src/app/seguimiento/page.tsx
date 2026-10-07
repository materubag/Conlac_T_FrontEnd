"use client";

import React, {
  useState,
  useEffect,
  Suspense,
} from "react";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { formatPrice, buildWhatsAppUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  WhatsAppIcon,
  ShieldCheckIcon,
} from "@/components/ui/Icons";
import {
  getOrderById,
  getOrderByTrackingNumber,
} from "@/services/ordenes/orderService";
import type { OrderCreateResponse } from "@/types";

function SeguimientoContent() {
  const searchParams = useSearchParams();

  const initialPedido =
    searchParams.get("pedido") || "";

  const [orderNumberInput, setOrderNumberInput] =
    useState(initialPedido);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [order, setOrder] =
    useState<OrderCreateResponse | null>(null);

  const fetchOrder = async (num: string) => {
    const cleanNum = num.trim();

    if (!cleanNum) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // Determina si el usuario ingresó un UUID
      // o un número de pedido.
      const isUuid =
        cleanNum.includes("-") &&
        cleanNum.length > 20;

      const data = isUuid
        ? await getOrderById(cleanNum)
        : await getOrderByTrackingNumber(cleanNum);

      setOrder(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al consultar el pedido";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPedido) return;
    const timeoutId = window.setTimeout(() => {
      void fetchOrder(initialPedido);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [initialPedido]);

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    fetchOrder(orderNumberInput);
  };

  const getStatusBadge = (
    status: string
  ) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "pendiente":
        return {
          label: "Pendiente de Confirmación",
          color:
            "bg-amber-100 text-amber-800 border-amber-300",
        };

      case "confirmed":
      case "confirmado":
        return {
          label: "Confirmado / En Preparación",
          color:
            "bg-blue-100 text-blue-800 border-blue-300",
        };

      case "delivered":
      case "entregado":
      case "completed":
        return {
          label: "Completado y Entregado",
          color:
            "bg-emerald-100 text-emerald-800 border-emerald-300",
        };

      case "cancelled":
      case "cancelado":
        return {
          label: "Cancelado",
          color:
            "bg-red-100 text-red-800 border-red-300",
        };

      default:
        return {
          label: status || "En proceso",
          color:
            "bg-neutral-light text-neutral border-border",
        };
    }
  };

  const statusBadge = order
    ? getStatusBadge(order.estado)
    : null;

  const whatsappUrl = order
    ? buildWhatsAppUrl({
        message: `Hola CONLAC-T, consulto por mi pedido #${order.numero_pedido} (Total: ${formatPrice(order.total)}).`,
      })
    : buildWhatsAppUrl({
        message:
          "Hola CONLAC-T, deseo consultar el estado de mi pedido.",
      });

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            {
              label: "Inicio",
              href: "/",
            },
            {
              label: "Tienda",
              href: "/tienda",
            },
            {
              label: "Seguimiento de Pedido",
            },
          ]}
        />

        <div className="max-w-2xl mx-auto text-center mb-10 space-y-3">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Trazabilidad Comunitaria
          </span>

          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary">
            Seguimiento de tu Pedido
          </h1>

          <p className="text-sm text-neutral-muted">
            Ingresa el número de pedido proporcionado en
            tu comprobante para verificar el estado de
            despacho.
          </p>
        </div>

        {/* Formulario de Consulta */}
        <div className="max-w-xl mx-auto mb-10">
          <form
            onSubmit={handleSubmit}
            className="flex gap-2"
          >
            <input
              type="text"
              required
              value={orderNumberInput}
              onChange={(e) =>
                setOrderNumberInput(e.target.value)
              }
              placeholder="Ej. 1 o eeb81f27..."
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary shadow-xs"
              aria-label="Número de pedido"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading}
              className="flex-shrink-0"
            >
              {loading
                ? "Buscando..."
                : "Consultar"}
            </Button>
          </form>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="max-w-xl mx-auto mb-8 rounded-2xl bg-red-50 border border-red-200 p-6 text-center space-y-2">
            <p className="text-sm font-bold text-red-800">
              No se encontró el pedido
            </p>

            <p className="text-xs text-red-700">
              {error}
            </p>

            <p className="text-xs text-neutral-muted pt-2">
              Verifique el número ingresado o comuníquese
              con el consorcio para asistencia directa.
            </p>
          </div>
        )}

        {/* Ficha de Pedido Encontrado */}
        {order && (
          <div className="max-w-2xl mx-auto rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-sm space-y-6 animate-fadeIn">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-xs text-neutral-muted">
                  Identificador Oficial:
                </span>

                <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">
                  Pedido #{order.numero_pedido}
                </h2>

                <span className="text-[11px] text-neutral-muted font-mono block mt-0.5">
                  ID: {order.id}
                </span>
              </div>

              {statusBadge && (
                <div
                  className={`px-3 py-1.5 rounded-full border text-xs font-label font-bold text-center self-start sm:self-auto ${statusBadge.color}`}
                >
                  {statusBadge.label}
                </div>
              )}
            </div>

            {/* Datos Financieros */}
            <div className="rounded-2xl bg-background border border-border p-5 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-muted">
                  Subtotal de Quesos:
                </span>

                <span className="font-semibold text-neutral">
                  {formatPrice(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-neutral-muted">
                  Flete de Envío:
                </span>

                <span className="font-semibold text-neutral">
                  {formatPrice(order.flete)}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-border font-bold text-base text-primary">
                <span>Total del Pedido:</span>

                <span>
                  {formatPrice(order.total)}
                </span>
              </div>

              <div className="flex justify-between pt-1 text-xs text-neutral-muted">
                <span>Método de Pago:</span>

                <span className="capitalize font-medium text-neutral">
                  {order.metodo_pago}
                </span>
              </div>
            </div>

            {/* Garantía y Asistencia */}
            <div className="rounded-xl bg-background p-4 text-xs text-neutral-muted border border-border/70 flex items-center gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-tertiary flex-shrink-0" />

              <span>
                Los pedidos son preparados directamente en
                las plantas lecheras de Pilahuín y
                Chibuleo.
              </span>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                href={whatsappUrl}
                variant="outlined"
                size="md"
                isExternal
                fullWidth
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />

                <span>
                  Consultar por WhatsApp
                </span>
              </Button>

              <Button
                href="/tienda"
                variant="primary"
                size="md"
                fullWidth
              >
                Seguir Comprando
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

export default function SeguimientoPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-neutral-muted">
          Cargando seguimiento...
        </div>
      }
    >
      <SeguimientoContent />
    </Suspense>
  );
}