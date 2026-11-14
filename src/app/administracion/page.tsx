"use client";

import React, { useEffect } from "react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AdministrationDashboard } from "@/components/admin/AdministrationDashboard";

export default function AdministracionHubPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, canEdit, loading, user, profile } = useAuth();

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
  if (isAuthenticated && !canEdit) {
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
              Esta sección requiere un rol admin o editor para acceder al panel de gestión.
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
  return <AdministrationDashboard name={profile?.full_name || user?.user_metadata?.full_name || "CONLAC-T"} email={user?.email || ""} canManageUsers={isAdmin} />;
}
