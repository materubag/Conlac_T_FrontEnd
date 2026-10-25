"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function MiCuentaPage() {
  const router = useRouter();
  const { user, profile, role, isAuthenticated, isAdmin, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/mi-cuenta");
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <div className="py-20 text-center text-sm text-neutral-muted">
        Cargando perfil de usuario...
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Mi Cuenta" },
          ]}
        />

        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-label uppercase tracking-widest text-tertiary font-bold block">
                Área de Usuario
              </span>
              <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
                Mi Cuenta
              </h1>
              <p className="text-sm text-neutral-muted mt-1">
                Información personal y estado de tu cuenta en CONLAC-T.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <span className="px-3 py-1.5 rounded-full text-xs font-label font-bold border uppercase tracking-wider bg-amber-100 text-amber-800 border-amber-300">
                  Administrador
                </span>
              )}

              <Button
                variant="outlined"
                size="sm"
                onClick={handleLogout}
                className="text-red-700 hover:text-red-800 hover:border-red-400"
              >
                Cerrar Sesión
              </Button>
            </div>
          </div>

          {/* Ficha de Información de Usuario */}
          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-headline text-xl font-bold text-primary border-b border-border pb-3">
              Datos Personales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-neutral-muted block text-xs">Nombre Completo</span>
                <span className="font-bold text-primary text-base">
                  {profile?.full_name || user?.user_metadata?.full_name || "Sin registrar"}
                </span>
              </div>

              <div>
                <span className="text-neutral-muted block text-xs">Correo Electrónico</span>
                <span className="font-semibold text-neutral text-base">
                  {user?.email || "No disponible"}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
              <h3 className="font-headline font-bold text-lg text-primary">
                Mis Pedidos
              </h3>
              <p className="text-xs text-neutral-muted">
                Revisa el historial de quesos adquiridos, fletes y estado de preparación.
              </p>
              <Button href="/mis-pedidos" variant="primary" size="md" fullWidth>
                Ver Historial de Pedidos
              </Button>
            </div>

            {isAdmin && (
              <div className="p-6 rounded-2xl bg-surface border border-amber-300 bg-amber-50/40 space-y-3">
                <h3 className="font-headline font-bold text-lg text-amber-900">
                  Panel de Administración
                </h3>
                <p className="text-xs text-amber-800">
                  Acceso exclusivo para gestión de filiales queseras, productos y backoffice.
                </p>
                <Button href="/administracion" variant="primary" size="md" fullWidth>
                  Ir a Administración
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
