import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipes } from "@/lib/data";
import { siteConfig } from "@/lib/config";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChefHatIcon } from "@/components/ui/Icons";
import type { Receta, IngredienteReceta, PasoReceta } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchRecipeDetail(slug: string): Promise<Receta | null> {
  // 1. Intentar obtener desde backend real
  try {
    const res = await fetch(`${siteConfig.backendUrl}/recipes/${encodeURIComponent(slug)}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data: Receta = await res.json();
      return data;
    }
  } catch {
    // Si backend no responde, intentamos con datos locales de respaldo
  }

  // 2. Fallback a datos locales mock
  const localRecipes = await getRecipes();
  const found = localRecipes.find(
    (r) => r.id === slug || r.slug === slug || r.titulo.toLowerCase().includes(slug.toLowerCase())
  );

  return found || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await fetchRecipeDetail(slug);
  if (!recipe) return { title: "Receta no encontrada | CONLAC-T" };

  return {
    title: `${recipe.titulo} - Receta Tradicional | CONLAC-T`,
    description: recipe.descripcion_corta || `Aprende a preparar ${recipe.titulo} utilizando quesos artesanales de Tungurahua.`,
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  const recipe = await fetchRecipeDetail(slug);

  if (!recipe) {
    notFound();
  }

  const prepTime = recipe.tiempo_preparacion_minutos || recipe.tiempo_prep;
  const imageSrc = recipe.imagen_url || "/placeholders/recipe-placeholder.svg";

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-8 text-xs font-label text-neutral-muted">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
            <li>/</li>
            <li><Link href="/recetas" className="hover:text-primary">Recetas</Link></li>
            <li>/</li>
            <li className="font-semibold text-primary">{recipe.titulo}</li>
          </ol>
        </nav>

        <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-border space-y-8 max-w-4xl mx-auto shadow-sm">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
            <Image
              src={imageSrc}
              alt={`Ilustración de ${recipe.titulo}`}
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {recipe.tipo_queso && (
                <Badge variant="primary">Queso base: {recipe.tipo_queso}</Badge>
              )}
              {prepTime && (
                <Badge variant="tertiary">Tiempo: {prepTime} min</Badge>
              )}
              {recipe.porciones && (
                <Badge variant="highlight">Porciones: {recipe.porciones}</Badge>
              )}
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
              {recipe.titulo}
            </h1>

            {recipe.descripcion_corta && (
              <p className="text-base text-neutral-muted leading-relaxed">
                {recipe.descripcion_corta}
              </p>
            )}
          </div>

          {/* Ingredientes si están disponibles */}
          {recipe.ingredientes && recipe.ingredientes.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h2 className="font-headline text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span>Ingredientes Requeridos</span>
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {recipe.ingredientes.map((ing, idx) => {
                  const label = typeof ing === "string"
                    ? ing
                    : (ing as IngredienteReceta).quantity
                      ? `${(ing as IngredienteReceta).quantity} - ${(ing as IngredienteReceta).item}`
                      : (ing as IngredienteReceta).item;

                  return (
                    <li key={idx} className="flex items-center gap-2.5 text-sm text-neutral p-2.5 rounded-lg bg-background border border-border/60">
                      <span className="h-2 w-2 rounded-full bg-tertiary flex-shrink-0" />
                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Pasos de preparación */}
          <div className="pt-4 border-t border-border">
            <h2 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <ChefHatIcon className="w-5 h-5 text-tertiary" />
              <span>Instrucciones de Preparación</span>
            </h2>

            <ol className="space-y-4">
              {recipe.pasos.map((paso, index) => {
                const stepNum = typeof paso === "string" ? index + 1 : (paso as PasoReceta).step || index + 1;
                const text = typeof paso === "string" ? paso : (paso as PasoReceta).instruction;

                return (
                  <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/70">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-inverted text-xs font-bold font-label">
                      {stepNum}
                    </span>
                    <p className="text-sm sm:text-base text-neutral leading-relaxed">
                      {text}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="pt-6 border-t border-border flex flex-wrap items-center gap-4">
            <Button href="/tienda" variant="primary">
              Conseguir el queso para esta receta
            </Button>
            <Button href="/recetas" variant="outlined">
              Ver más recetas
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
