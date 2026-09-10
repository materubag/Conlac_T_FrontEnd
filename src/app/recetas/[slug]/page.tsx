import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipes } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChefHatIcon } from "@/components/ui/Icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipes = await getRecipes();
  const recipe = recipes.find((r) => r.id === slug);
  if (!recipe) return { title: "Receta no encontrada" };

  return {
    title: `${recipe.titulo} - Receta CONLAC-T`,
    description: `Aprende a preparar ${recipe.titulo} utilizando quesos artesanales de Tungurahua.`,
  };
}

export async function generateStaticParams() {
  const recipes = await getRecipes();
  return recipes.map((r) => ({ slug: r.id }));
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  const recipes = await getRecipes();
  const recipe = recipes.find((r) => r.id === slug);

  if (!recipe) {
    notFound();
  }

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

        <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-border space-y-8 max-w-4xl mx-auto">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
            <Image
              src="/placeholders/recipe-placeholder.svg"
              alt={`Ilustración de ${recipe.titulo}`}
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {recipe.tipo_queso && (
                <Badge variant="primary">Queso base: {recipe.tipo_queso}</Badge>
              )}
              {recipe.tiempo_prep && (
                <Badge variant="tertiary">Tiempo: {recipe.tiempo_prep} min</Badge>
              )}
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
              {recipe.titulo}
            </h1>
          </div>

          <div className="pt-4 border-t border-border">
            <h2 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <ChefHatIcon className="w-5 h-5 text-tertiary" />
              <span>Instrucciones de Preparación</span>
            </h2>

            <ol className="space-y-4">
              {recipe.pasos.map((paso, index) => (
                <li key={index} className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/70">
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-inverted text-xs font-bold">
                    {index + 1}
                  </span>
                  <p className="text-sm sm:text-base text-neutral leading-relaxed">
                    {paso}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div className="pt-6 border-t border-border flex items-center gap-4">
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
