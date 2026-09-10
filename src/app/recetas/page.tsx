import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getRecipes } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChefHatIcon, ArrowRightIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Recetas con Queso Andino",
  description: "Platos tradicionales y recetas familiares para preparar con los quesos artesanales de CONLAC-T.",
};

export default async function RecetasPage() {
  const recipes = await getRecipes();

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Gastronomía Andina
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Recetas Tradicionales
          </h1>
          <p className="mt-3 text-base text-neutral-muted">
            Preparaciones típicas de nuestra serranía que destacan el sabor y textura de
            los quesos frescos, quesillos y madurados de Pilahuín.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recipes.map((receta) => (
            <article
              key={receta.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-sm hover:border-tertiary/70 transition-all"
            >
              <div className="space-y-4">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-light/50">
                  <Image
                    src="/placeholders/recipe-placeholder.svg"
                    alt={`Ilustración de la receta ${receta.titulo}`}
                    fill
                    className="object-cover object-center"
                  />
                  {receta.tiempo_prep && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="highlight">
                        {receta.tiempo_prep} min
                      </Badge>
                    </div>
                  )}
                </div>

                {receta.tipo_queso && (
                  <div className="flex items-center gap-1.5 text-xs text-tertiary font-semibold uppercase tracking-wider">
                    <ChefHatIcon className="w-4 h-4" />
                    <span>{receta.tipo_queso}</span>
                  </div>
                )}

                <h2 className="font-headline text-xl font-bold text-primary">
                  {receta.titulo}
                </h2>

                <p className="text-xs text-neutral-muted">
                  {receta.pasos.length} pasos de preparación artesanal.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <Button
                  href={`/recetas/${receta.id}`}
                  variant="outlined"
                  size="sm"
                  fullWidth
                >
                  <span>Ver preparación</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
