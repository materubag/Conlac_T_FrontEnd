"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MAIN_NAV_ITEMS } from "@/config/navigation";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { CartIcon, MenuIcon, CloseIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

/**
 * ============================================================
 * NAVBAR PRINCIPAL - CONLAC-T
 * ============================================================
 * 
 * Contiene:
 * - Logo oficial y nombre de marca.
 * - Las 7 pestañas oficiales configuradas de forma centralizada.
 * - Elemento visual de Carrito con contador (mock no funcional).
 * - Botón "Ver tienda".
 * - Menú responsive accesible con soporte completo de teclado.
 */
export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detección de scroll para sombra sutil
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Manejo de tecla Escape para cerrar menú móvil accesible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled
          ? "bg-[#F8F4E9]/95 backdrop-blur-md shadow-sm border-b border-border/80"
          : "bg-[#F8F4E9] border-b border-border/50"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================
            1. LOGO E IDENTIDAD INSTITUCIONAL
            ============================================================ */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none rounded-lg p-1"
          aria-label="Ir a la página de inicio de CONLAC-T"
        >
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={siteConfig.assets.logo}
              alt="Logo oficial de CONLAC-T - Consorcio de Lácteos de Tungurahua"
              fill
              className="object-contain transition-transform group-hover:scale-105"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-xl font-bold tracking-tight text-primary leading-tight">
              CONLAC-T
            </span>
            <span className="text-[10px] uppercase font-label tracking-widest text-neutral-muted font-medium">
              Pilahuín · Tungurahua
            </span>
          </div>
        </Link>

        {/* ============================================================
            2. LAS 7 PESTAÑAS OBLIGATORIAS (DESKTOP)
            ============================================================ */}
        <nav
          className="hidden xl:flex items-center gap-1 lg:gap-2"
          aria-label="Navegación principal"
        >
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-3 py-2 text-sm font-label font-medium transition-colors rounded-md",
                  "focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-neutral/85 hover:text-primary hover:bg-neutral-light/50"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full transition-all"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ============================================================
            3. ACCIONES DE DERECHA (CARRITO VISUAL + CTA + TOGGLE MÓVIL)
            ============================================================ */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Carrito como elemento visual NO funcional para Semana 2 */}
          <div
            className="relative flex items-center justify-center p-2 rounded-xl text-neutral hover:text-primary hover:bg-neutral-light/60 transition-colors cursor-pointer select-none"
            title="Carrito de compras (Disponible en semanas posteriores)"
            role="button"
            tabIndex={0}
            aria-label="Carrito de compras con 0 artículos (Visual para Sprint 2)"
          >
            <CartIcon className="w-6 h-6" />
            <span
              className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary text-[10px] font-bold text-neutral shadow-sm"
              aria-hidden="true"
            >
              0
            </span>
          </div>

          {/* CTA "Ver tienda" Desktop */}
          <div className="hidden sm:block">
            <Button
              href="/tienda"
              variant="primary"
              size="sm"
              className="shadow-sm"
            >
              Ver tienda
            </Button>
          </div>

          {/* Botón Toggle Menú Móvil */}
          <button
            type="button"
            className="flex xl:hidden items-center justify-center p-2 rounded-xl text-neutral hover:text-primary hover:bg-neutral-light transition-colors focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            aria-label={isMobileMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
          >
            {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ============================================================
          4. MENÚ MÓVIL / TABLET RESPONSIVE (DRAWER ACCESIBLE)
          ============================================================ */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="xl:hidden fixed inset-x-0 top-20 bottom-0 bg-[#F8F4E9]/98 backdrop-blur-lg border-t border-border z-50 flex flex-col justify-between overflow-y-auto p-6 animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación móvil"
        >
          <div className="space-y-1">
            <div className="pb-3 mb-2 border-b border-border/60">
              <span className="text-xs font-label uppercase tracking-widest text-neutral-muted">
                Secciones del Consorcio
              </span>
            </div>

            {MAIN_NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-base font-label transition-all",
                    isActive
                      ? "bg-primary text-inverted font-semibold shadow-sm"
                      : "text-neutral hover:bg-neutral-light hover:text-primary"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span>{item.name}</span>
                  {item.description && (
                    <span className={cn(
                      "text-xs ml-2 opacity-75 hidden sm:inline",
                      isActive ? "text-inverted" : "text-neutral-muted"
                    )}>
                      {item.description}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 mt-6 border-t border-border/80 flex flex-col gap-3">
            <Button
              href="/tienda"
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explorar Tienda Completa
            </Button>

            <div className="text-center">
              <p className="text-xs text-neutral-muted">
                {siteConfig.location.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
