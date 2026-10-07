"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { siteConfig } from "@/lib/config";
import { formatPrice } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/ui/Icons";
import type { OrderCreateResponse } from "@/types";

export default function MisPedidosPage() {
  const router = useRouter();
  const { isAuthenticated, loading, getAccessToken } = useAuth();

  const [orders, setOrders] = useState<OrderCreateResponse[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const [backendEndpointSupported, setBackendEndpointSupported] = useState<boolean>(true);
  const [quickQueryInput, setQuickQueryInput] = useState<string>("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/mis-pedidos");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      setFetching(true);

      try {
        const token = await getAccessToken();
        const headers: HeadersInit = { Accept: "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Intentar consultar el endpoint estándar para pedidos del usuario autenticado
        const res = await fetch(`${siteConfig.backendUrl}/orders/my-orders`, {
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setOrders(data);
          }
          setBackendEndpointSupported(true);
        } else if (res.status === 404 || res.status === 405) {
          // El backend de Spring Boot aún no tiene implementado GET /api/orders/my-orders
          setBackendEndpointSupported(false);
        }
      } catch {
        setBackendEndpointSupported(false);
      } finally {
        setFetching(false);
      }
    }

    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, getAccessToken]);

  if (loading || (!isAuthenticated && fetching)) {
    return (
      <div className="py-20 text-center text-sm text-neutral-muted">
        Verificando sesión...
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "pendiente":
        return { label: "Pendiente", color: "bg-amber-100 text-amber-800 border-amber-300" };
      case "confirmed":
      case "confirmado":
        return { label: "Confirmado", color: "bg-blue-100 text-blue-800 border-blue-300" };
      case "delivered":
      case "entregado":
      case "completed":
        return { label: "Entregado", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "cancelled":
      case "cancelado":
        return { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-300" };
      default:
        return { label: status || "En proceso", color: "bg-neutral-light text-neutral border-border" };
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Mi Cuenta", href: "/mi-cuenta" },
            { label: "Mis Pedidos" },
          ]}
        />

        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          {/* Encabezado */}
          <div>
            <span className="text-xs font-label uppercase tracking-widest text-tertiary font-bold block">
              Historial de Compras
            </span>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary mt-1">
              Mis Pedidos
            </h1>
            <p className="text-sm text-neutral-muted mt-2">
              Consulta el estado de despacho, número de orden y trazabilidad de tus quesos andinos.
            </p>
          </div>

          {/* Consulta rápida de pedido */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
            <h2 className="font-headline text-base font-bold text-primary">
              Consultar pedido por número
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (quickQueryInput.trim()) {
                  router.push(`/seguimiento?pedido=${encodeURIComponent(quickQueryInput.trim())}`);
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={quickQueryInput}
                onChange={(e) => setQuickQueryInput(e.target.value)}
                placeholder="Ingresa el número de tu pedido (ej: 1, 2, 3...)"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
              />
              <Button type="submit" variant="primary" size="md">
                <span>Rastrear</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* Listado de pedidos si el endpoint devuelve órdenes */}
          {fetching ? (
            <div className="py-12 text-center text-sm text-neutral-muted">
              Consultando pedidos en el servidor...
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const badge = getStatusBadge(order.estado);
                return (
                  <div
                    key={order.id}
                    className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-headline font-bold text-lg text-primary">
                          Pedido #{order.numero_pedido}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-muted">
                        Método de pago: <span className="capitalize text-neutral font-medium">{order.metodo_pago}</span> · 
                        Total: <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                      </p>
                    </div>

                    <Button
                      href={`/seguimiento?pedido=${order.numero_pedido}`}
                      variant="outlined"
                      size="sm"
                    >
                      <span>Ver Seguimiento</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </Container>
    </div>
  );
}
