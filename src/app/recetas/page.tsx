import type { Metadata } from "next";
import Image from "next/image";
import { getRecipes } from "@/services/recipes/recipeService";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChefHatIcon, ArrowRightIcon } from "@/components/ui/Icons";
import type { RecipeResponse } from "@/types/recipe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recetas con Queso Andino",
  description:
    "Platos tradicionales y recetas familiares para preparar con los quesos artesanales de CONLAC-T.",
};

export default async function RecetasPage() {
  let recipes: RecipeResponse[] = [];
  let error: string | null = null;

  try {
    recipes = await getRecipes();

    if (!Array.isArray(recipes)) {
      recipes = [];
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error de conexión";

    error = `No se pudieron cargar las recetas (${message}). Verifique que el servicio backend esté en ejecución.`;
  }

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
            Preparaciones típicas de nuestra serranía que destacan el
            sabor y textura de los quesos frescos, quesillos y madurados
            de Pilahuín.
          </p>
        </div>

        {/* Estado de conexión */}
        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
            {error}
          </div>
        )}

        {!error && (
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              API Backend Conectada ({recipes.length} recetas en vivo)
            </span>
          </div>
        )}

        {recipes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-xl mx-auto">
            <ChefHatIcon className="mx-auto h-12 w-12 text-neutral-muted/50 mb-3" />

            <h2 className="font-headline text-lg font-bold text-primary">
              No hay recetas disponibles
            </h2>

            <p className="mt-2 text-sm text-neutral-muted">
              Pronto compartiremos nuevas preparaciones tradicionales
              con nuestros quesos comunitarios.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((receta) => {
              const prepTime = receta.tiempo_preparacion_minutos;

              const stepsCount = Array.isArray(receta.pasos)
                ? receta.pasos.length
                : 0;

              const linkHref = `/recetas/${receta.slug || receta.id}`;

              const imageSrc =
                receta.imagen_url ||
                "/placeholders/recipe-placeholder.svg";

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
