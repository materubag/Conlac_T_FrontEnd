"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function RegistroPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!nombre.trim()) {
      setErrorMessage("El nombre completo es obligatorio.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    const res = await register(nombre.trim(), email.trim(), password);
    setSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "No se pudo completar el registro.");
    } else {
      setSuccessMessage(
        "¡Cuenta creada con éxito! Si Supabase requiere confirmación de email, revisa tu bandeja de entrada."
      );
      setTimeout(() => {
        router.push("/tienda");
      }, 2000);
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <div className="max-w-md mx-auto rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
          <div className="text-center space-y-2">
            <span className="text-xs font-label uppercase tracking-widest text-tertiary font-bold block">
              Comunidad CONLAC-T
            </span>
            <h1 className="font-headline text-3xl font-bold text-primary">
              Crear Cuenta
            </h1>
            <p className="text-sm text-neutral-muted">
              Regístrate para guardar tus pedidos, gestionar entregas y acceder a beneficios comunitarios.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
              <p className="font-bold">Error en el registro</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold">Registro exitoso</p>
              <p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="regNombre"
                className="block text-xs font-label uppercase font-bold text-primary mb-1.5"
              >
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                id="regNombre"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
              />
            </div>

            <div>
              <label
                htmlFor="regEmail"
                className="block text-xs font-label uppercase font-bold text-primary mb-1.5"
              >
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="regEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
              />
            </div>

            <div>
              <label
                htmlFor="regPassword"
                className="block text-xs font-label uppercase font-bold text-primary mb-1.5"
              >
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="regPassword"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
              />
            </div>

            <div>
              <label
                htmlFor="regConfirmPassword"
                className="block text-xs font-label uppercase font-bold text-primary mb-1.5"
              >
                Confirmar Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="regConfirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
              className="mt-2"
            >
              {submitting ? "Creando cuenta..." : "Registrarme"}
            </Button>
          </form>

          <div className="pt-4 border-t border-border/80 text-center space-y-2">
            <p className="text-xs text-neutral-muted">
              ¿Ya tienes una cuenta registrada?
            </p>
            <Link
              href="/login"
              className="text-xs font-bold text-primary hover:text-tertiary underline block"
            >
              Iniciar sesión aquí
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
