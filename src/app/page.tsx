import React from "react";
import { Hero } from "@/components/home/Hero";
import { TrustSection } from "@/components/home/TrustSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { CategoryAccessCards } from "@/components/home/CategoryAccessCards";
import { StoreCTA } from "@/components/home/StoreCTA";

/**
 * ============================================================
 * PÁGINA DE INICIO (PORTADA) - CONLAC-T
 * Consorcio de Lácteos de Tungurahua
 * ============================================================
 * 
 * Estructura de la portada para Semanas 1 y 2:
 * 1. HERO: Transmite identidad de quesos artesanales de Pilahuín.
 * 2. PRODUCTOS DESTACADOS: Grilla dinámica que consume lib/data.ts.
 * 3. PROCEDENCIA / IDENTIDAD: "Confianza desde el Origen".
 * 4. ACCESO MODULAR: Asociaciones, Recetas y Turismo.
 * 5. CTA TIENDA: Invitación hacia el catálogo completo.
 */
export default function HomePage() {
  return (
    <>
      {/* 1. Hero Principal */}
      <Hero />

      {/* 2. Productos Destacados */}
      <FeaturedProducts />

      {/* 3. Confianza y Procedencia */}
      <TrustSection />

      {/* 4. Tarjetas de Acceso a Secciones */}
      <CategoryAccessCards />

      {/* 5. Llamado a la Acción Final */}
      <StoreCTA />
    </>
  );
}
