"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AccountSecurityActions } from "@/components/account/AccountSecurityActions";

export default function MiCuentaPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isAdmin, canEdit, loading, logout, changeEmail, verifyEmailChange } = useAuth();

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
              {canEdit && (
                <span className="px-3 py-1.5 rounded-full text-xs font-label font-bold border uppercase tracking-wider bg-amber-100 text-amber-800 border-amber-300">
                  {isAdmin ? "Administrador" : "Editor"}
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

          <AccountSecurityActions email={user?.email || ""} changeEmail={changeEmail} verifyEmailChange={verifyEmailChange} />
        </div>
      </Container>
    </div>
  );
}
