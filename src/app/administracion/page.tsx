"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/ui/Icons";

export default function AdministracionHubPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/administracion");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-muted">
        Comprobando permisos administrativos...
      </div>
    );
  }

  // Caso: Usuario autenticado pero NO es administrador -> 403 Acceso Denegado
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="py-16 sm:py-24 bg-background">
        <Container>
          <div className="max-w-md mx-auto text-center rounded-3xl bg-surface border border-red-200 p-8 sm:p-12 space-y-4 shadow-sm">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700 text-2xl font-bold">
              ✕
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-red-900">
              403 — Acceso Denegado
            </h1>
            <p className="text-sm text-neutral-muted">
              Esta sección requiere permisos de administrador para acceder al panel de gestión.
            </p>
            <div className="pt-4 flex flex-col gap-2">
              <Button href="/tienda" variant="primary" size="md">
                Ir a la Tienda
              </Button>
              <Button href="/mi-cuenta" variant="outlined" size="md">
                Ver Mi Cuenta
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Caso: No autenticado (mientras se ejecuta redirección)
  if (!isAuthenticated) {
    return null;
  }

  // Caso: Usuario ADMIN autenticado -> Permitir acceso
  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Panel de Administración" },
          ]}
        />

        <div className="space-y-8 animate-fadeIn">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-label uppercase tracking-widest text-amber-800 font-bold block">
                Backoffice CONLAC-T
              </span>
              <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary mt-1">
                Panel de Administración
              </h1>
              <p className="text-sm text-neutral-muted mt-2">
                Gestión integral de filiales comunitarias, productos, variantes y catálogos lácteos.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
              <ShieldCheckIcon className="w-4 h-4 text-amber-700" />
              <span>Sesión ADMIN Activa</span>
            </div>
          </div>

          {/* Módulos Administrativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tarjeta: Asociaciones */}
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-xs hover:border-tertiary transition-colors">
              <div className="space-y-2">
                <span className="text-xs font-label uppercase tracking-wider text-tertiary font-bold">
                  Módulo de Filiales
                </span>
                <h2 className="font-headline font-bold text-xl text-primary">
                  Gestión de Asociaciones
                </h2>
                <p className="text-xs text-neutral-muted leading-relaxed">
                  Alta de nuevas asociaciones productoras, registro de sellos ARCSA, historias y georreferenciación en Pilahuín.
                </p>
              </div>

              <Button
                href="/administracion/asociaciones"
                variant="primary"
                size="md"
                fullWidth
              >
                <span>Administrar Asociaciones</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Tarjeta: Catálogo y Productos */}
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-2">
                <span className="text-xs font-label uppercase tracking-wider text-neutral-muted font-bold">
                  Catálogo
                </span>
                <h2 className="font-headline font-bold text-xl text-primary">
                  Catálogo de Quesos
                </h2>
                <p className="text-xs text-neutral-muted leading-relaxed">
                  Visualización de productos activos y stock sincronizado con el backend de Spring Boot.
                </p>
              </div>

              <Button
                href="/tienda"
                variant="outlined"
                size="md"
                fullWidth
              >
                <span>Ver Catálogo Público</span>
              </Button>
            </div>

            {/* Tarjeta: Trazabilidad y Pedidos */}
            <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4 shadow-xs">
              <div className="space-y-2">
                <span className="text-xs font-label uppercase tracking-wider text-neutral-muted font-bold">
                  Despachos
                </span>
                <h2 className="font-headline font-bold text-xl text-primary">
                  Seguimiento y Pedidos
                </h2>
                <p className="text-xs text-neutral-muted leading-relaxed">
                  Consulta de órdenes registradas, verificación de depósitos y comprobantes de entrega.
                </p>
              </div>

              <Button
                href="/seguimiento"
                variant="outlined"
                size="md"
                fullWidth
              >
                <span>Rastrear Pedidos</span>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
