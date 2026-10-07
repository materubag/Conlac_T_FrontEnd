import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { getRecipes } from "@/lib/data";
import { siteConfig } from "@/lib/config";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChefHatIcon, ArrowRightIcon } from "@/components/ui/Icons";
import type { Receta } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recetas con Queso Andino",
  description: "Platos tradicionales y recetas familiares para preparar con los quesos artesanales de CONLAC-T.",
};

async function fetchRecipesFromBackend(): Promise<{
  recipes: Receta[];
  error: string | null;
}> {
  try {
    const res = await fetch(`${siteConfig.backendUrl}/recipes`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return {
        recipes: await getRecipes(),
        error: `HTTP ${res.status}`,
      };
    }

    const data: Receta[] = await res.json();
    return {
      recipes: Array.isArray(data) ? data : [],
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de conexión";
    const fallback = await getRecipes();
    return {
      recipes: fallback,
      error: `No se pudo conectar con el backend (${message}). Mostrando datos locales de respaldo.`,
    };
  }
}

export default async function RecetasPage() {
  const { recipes, error } = await fetchRecipesFromBackend();

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

        {error && (
          <div className="mb-8 rounded-xl border border-border/80 bg-surface/80 p-4 text-xs text-neutral-muted">
            {error}
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-xl mx-auto">
            <ChefHatIcon className="mx-auto h-12 w-12 text-neutral-muted/50 mb-3" />
            <h2 className="font-headline text-lg font-bold text-primary">No hay recetas disponibles</h2>
            <p className="mt-2 text-sm text-neutral-muted">
              Pronto compartiremos nuevas preparaciones tradicionales con nuestros quesos comunitarios.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((receta) => {
              const prepTime = receta.tiempo_preparacion_minutos || receta.tiempo_prep;
              const stepsCount = Array.isArray(receta.pasos) ? receta.pasos.length : 0;
              const linkHref = `/recetas/${receta.slug || receta.id}`;
              const imageSrc = receta.imagen_url || "/placeholders/recipe-placeholder.svg";

              return (
                <article
                  key={receta.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border p-6 shadow-sm hover:border-tertiary/70 transition-all"
                >
                  <div className="space-y-4">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-neutral-light/50">
                      <Image
                        src={imageSrc}
                        alt={`Ilustración de la receta ${receta.titulo}`}
                        fill
                        className="object-cover object-center"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        {prepTime && (
                          <Badge variant="highlight">
                            {prepTime} min
                          </Badge>
                        )}
                        {receta.porciones && (
                          <Badge variant="tertiary">
                            {receta.porciones} porciones
                          </Badge>
                        )}
                      </div>
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

                    {receta.descripcion_corta ? (
                      <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed line-clamp-2">
                        {receta.descripcion_corta}
                      </p>
                    ) : (
                      <p className="text-xs text-neutral-muted">
                        {stepsCount} pasos de preparación artesanal.
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <Button
                      href={linkHref}
                      variant="outlined"
                      size="sm"
                      fullWidth
                    >
                      <span>Ver preparación</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
