"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function RecuperarPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setSubmitting(true);
    const res = await resetPassword(email.trim());
    setSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "No se pudo procesar la solicitud de recuperación.");
    } else {
      setSuccessMessage(
        "Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada o spam."
      );
    }
  };

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <div className="max-w-md mx-auto rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
          <div className="text-center space-y-2">
            <span className="text-xs font-label uppercase tracking-widest text-tertiary font-bold block">
              Seguridad de la cuenta
            </span>
            <h1 className="font-headline text-3xl font-bold text-primary">
              Recuperar Contraseña
            </h1>
            <p className="text-sm text-neutral-muted">
              Ingresa el correo registrado con tu cuenta para enviarte un enlace de restablecimiento.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 space-y-1">
              <p className="font-bold">Error</p>
              <p>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-bold">Instrucciones enviadas</p>
              <p>{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="resetEmail"
                className="block text-xs font-label uppercase font-bold text-primary mb-1.5"
              >
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="resetEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={submitting}
            >
              {submitting ? "Enviando..." : "Enviar Enlace de Recuperación"}
            </Button>
          </form>

          <div className="pt-4 border-t border-border/80 text-center">
            <Link
              href="/login"
              className="text-xs font-bold text-primary hover:text-tertiary underline"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
