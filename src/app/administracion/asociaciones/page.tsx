"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AssociationAdminForm } from "@/components/associations/AssociationAdminForm";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function AdministracionAsociacionesPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/administracion/asociaciones");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-neutral-muted">
        Verificando credenciales de administrador...
      </div>
    );
  }

  // Protección 403: Si está autenticado pero no es administrador
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
              Esta sección requiere permisos de <strong>ADMIN</strong> para dar de alta o modificar filiales queseras.
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#F8F4E9]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Administración", href: "/administracion" },
            { label: "Asociaciones" },
          ]}
        />

        <div className="mb-10">
          <span className="font-label text-sm font-semibold uppercase tracking-widest text-primary">
            Backoffice Comunitario
          </span>

          <h1 className="mt-2 font-headline text-3xl font-bold text-primary sm:text-4xl">
            Administración de Asociaciones
          </h1>

          <p className="mt-3 max-w-2xl text-neutral-muted">
            Registra y administra la información de las filiales que forman parte del Consorcio CONLAC-T.
          </p>
        </div>

        <AssociationAdminForm />
      </div>
    </main>
  );
}