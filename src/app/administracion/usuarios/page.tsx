"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UsersManager } from "@/components/admin/UsersManager";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function UsersPage() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !isAuthenticated) router.replace("/login?redirect=/administracion/usuarios"); }, [loading, isAuthenticated, router]);
  if (loading || !isAuthenticated) return <p className="py-20 text-center text-sm text-neutral-muted">Comprobando permisos…</p>;
  if (!isAdmin) return <Container className="py-16"><div className="mx-auto max-w-lg space-y-4 rounded-3xl border border-border bg-surface p-8 text-center"><h1 className="font-headline text-2xl text-primary">Acceso reservado al administrador</h1><p className="text-sm text-neutral-muted">Solo el rol admin puede crear usuarios y administrar sus permisos.</p><Button href="/administracion" variant="outlined">Volver al panel</Button></div></Container>;
  return <UsersManager currentUserId={user!.id} />;
}
