"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Iconos vectoriales
function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function ArrowLeftIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function SupportIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "";

  const { login, isAuthenticated, isAdmin, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (redirectParam) {
        router.push(redirectParam);
      } else if (isAdmin) {
        router.push("/administracion");
      } else {
        router.push("/tienda");
      }
    }
  }, [loading, isAuthenticated, isAdmin, redirectParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setSubmitting(true);
    const res = await login(email.trim(), password);
    setSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "Credenciales incorrectas o usuario no encontrado.");
    } else {
      if (redirectParam) {
        router.push(redirectParam);
      } else if (email.trim().toLowerCase() === "admin@conlact.org") {
        router.push("/administracion");
      } else {
        router.push("/tienda");
      }
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-background min-h-[calc(100vh-140px)] flex flex-col justify-center">
      {/* Contenedor más angosto y centrado */}
      <div className="w-full max-w-[980px] mx-auto px-4 sm:px-6">
        
        {/* Barra superior de retorno */}
        <div className="mb-5 flex items-center justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
            <span>Volver al portal público de CONLAC-T</span>
          </Link>
        </div>

        {/* Contenedor Split Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-xl bg-surface border border-border">
          
          {/* Split Izquierdo: Andean Heritage Panel */}
          <div className="lg:col-span-5 relative flex flex-col justify-between p-7 sm:p-9 lg:p-10 overflow-hidden bg-[#012d1d] text-white min-h-[420px] lg:min-h-[580px]">
            {/* Imagen andina de fondo con overlay y gradiente */}
            <div
              className="absolute inset-0 z-0 opacity-25 bg-cover bg-center mix-blend-luminosity scale-105 transition-transform duration-700 hover:scale-110"
              style={{ backgroundImage: "url('/images/hero-andes.svg')" }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#012d1d] via-[#012d1d]/85 to-[#012d1d]/40" />

            {/* Cabecera del Panel Izquierdo (sin icono de escudo) */}
            <div className="relative z-10 flex flex-col items-start gap-3">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200">
                <span>Portal Oficial</span>
              </div>
              <h2 className="font-headline text-3xl sm:text-4xl text-white font-bold tracking-tight">
                CONLAC-T
              </h2>
              <p className="text-sm text-emerald-100/90 font-medium">
                Consorcio de Lácteos de Tungurahua
              </p>
            </div>

            {/* Mensaje Central y Métricas */}
            <div className="relative z-10 my-auto py-6">
              <div className="w-10 h-1 bg-[#D4A373] mb-4 rounded-full"></div>
              <p className="font-headline text-2xl text-white font-medium leading-snug">
                Calidad andina de origen garantizada.
              </p>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-[#184332]/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 shadow-xs">
                  <div className="font-headline text-2xl text-[#D4A373] font-bold leading-none">
                    14+
                  </div>
                  <div className="text-[11px] text-emerald-200/90 mt-1 uppercase tracking-wider font-semibold">
                    Asociaciones
                  </div>
                </div>

                <div className="bg-[#184332]/80 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 shadow-xs">
                  <div className="font-headline text-2xl text-[#D4A373] font-bold leading-none">
                    100%
                  </div>
                  <div className="text-[11px] text-emerald-200/90 mt-1 uppercase tracking-wider font-semibold">
                    Certificado
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Split Derecho: Authentication Interface */}
          <div className="lg:col-span-7 p-7 sm:p-9 lg:p-11 flex flex-col justify-between bg-surface">
            <div>
              {/* Logo y Título Principal */}
              <div className="flex items-center gap-4 mb-7">
                <div className="w-16 h-16 sm:w-18 sm:h-18 flex-shrink-0 p-2 rounded-2xl bg-[#F8F4E9] border border-border shadow-xs flex items-center justify-center">
                  <Image
                    src="/logo/logo-conlac-t.png"
                    alt="Logo CONLAC-T"
                    width={68}
                    height={68}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div>
                  <span className="text-xs font-label uppercase tracking-widest text-tertiary font-bold block">
                    Acceso a la plataforma
                  </span>
                  <h1 className="font-headline text-2xl sm:text-3xl font-bold text-primary">
                    Iniciar Sesión
                  </h1>
                </div>
              </div>

              {/* Mensaje de Error */}
              {errorMessage && (
                <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-1 animate-fadeIn">
                  <span className="font-bold block text-sm">Error de autenticación:</span>
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                
                {/* Campo: Correo Electrónico */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="loginEmail" className="text-xs font-label uppercase font-bold text-primary">
                    Usuario o Correo
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-muted pointer-events-none">
                      <MailIcon className="w-4 h-4" />
                    </span>
                    <input
                      id="loginEmail"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@conlact.org"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#F8F4E9]/60 text-neutral rounded-xl font-body text-sm placeholder:text-neutral-muted/60 border border-border focus:outline-none focus:bg-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
                    />
                  </div>
                </div>

                {/* Campo: Contraseña */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="loginPassword" className="text-xs font-label uppercase font-bold text-primary">
                      Contraseña
                    </label>
                    <Link
                      href="/recuperar-password"
                      className="text-xs text-primary hover:text-tertiary underline font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-neutral-muted pointer-events-none">
                      <LockIcon className="w-4 h-4" />
                    </span>
                    <input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8F4E9]/60 text-neutral rounded-xl font-body text-sm placeholder:text-neutral-muted/60 border border-border focus:outline-none focus:bg-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
                    />
                    <button
                      type="button"
                      aria-label="Mostrar u ocultar contraseña"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-neutral-muted hover:text-primary transition-colors p-1"
                    >
                      {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Opción Recordarme (sin el texto SSL) */}
                <div className="flex items-center justify-start pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 border-border bg-[#F8F4E9]"
                    />
                    <span className="text-xs text-neutral-muted font-medium">Recordarme</span>
                  </label>
                </div>

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-label text-sm font-bold tracking-wider transition-all duration-200 shadow-sm flex items-center justify-center gap-2 disabled:opacity-75 group cursor-pointer"
                >
                  <span>{submitting ? "Verificando con CONLAC-T..." : "Iniciar Sesión"}</span>
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Enlace de Registro */}
                <div className="text-center mt-3 text-sm text-neutral-muted font-body">
                  ¿No tienes una cuenta aún?{" "}
                  <Link href="/registro" className="text-primary font-bold hover:underline">
                    Crear una cuenta
                  </Link>
                </div>
              </form>
            </div>

            {/* Footer con borde en la parte blanca (sin icono de escudo) */}
            <div className="mt-8 pt-4 border-t border-border flex items-center justify-between text-xs text-neutral-muted">
              <span>Autenticación protegida</span>
              
              <a
                href="https://wa.me/593987654321?text=Hola,%20soporte%20CONLAC-T"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:text-tertiary font-semibold transition-colors"
              >
                <SupportIcon className="w-4 h-4 text-emerald-700" />
                <span>Soporte</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-neutral-muted">
          Cargando pantalla de acceso...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
