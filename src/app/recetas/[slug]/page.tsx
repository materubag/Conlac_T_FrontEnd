import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe } from "@/services/recipes/recipeService";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChefHatIcon } from "@/components/ui/Icons";
import type { RecipeResponse, RecipeIngredient, RecipeStep } from "@/types/recipe";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchRecipeDetail(
  slug: string
): Promise<RecipeResponse | null> {
  try {
    return await getRecipe(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await fetchRecipeDetail(slug);

  if (!recipe) {
    return {
      title: "Receta no encontrada | CONLAC-T",
    };
  }

  return {
    title: `${recipe.titulo} - Receta Tradicional | CONLAC-T`,
    description:
      recipe.descripcion_corta ||
      `Aprende a preparar ${recipe.titulo} utilizando quesos artesanales de Tungurahua.`,
  };
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  const recipe = await fetchRecipeDetail(slug);

  if (!recipe) {
    notFound();
  }

  const prepTime = recipe.tiempo_preparacion_minutos;

  const imageSrc =
    recipe.imagen_url || "/placeholders/recipe-placeholder.svg";

  const ingredientes = Array.isArray(recipe.ingredientes)
    ? recipe.ingredientes
    : [];

  const pasos = Array.isArray(recipe.pasos) ? recipe.pasos : [];

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 text-xs font-label text-neutral-muted"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary">
                Inicio
              </Link>
            </li>

            <li>/</li>

            <li>
              <Link href="/recetas" className="hover:text-primary">
                Recetas
              </Link>
            </li>

            <li>/</li>

            <li className="font-semibold text-primary">
              {recipe.titulo}
            </li>
          </ol>
        </nav>

        <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-border space-y-8 max-w-4xl mx-auto shadow-sm">
          {/* Imagen */}
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
            <Image
              src={imageSrc}
              alt={`Ilustración de ${recipe.titulo}`}
              fill
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Información principal */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {prepTime && (
                <Badge variant="tertiary">
                  Tiempo: {prepTime} min
                </Badge>
              )}

              {recipe.porciones && (
                <Badge variant="highlight">
                  Porciones: {recipe.porciones}
                </Badge>
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

          {/* Ingredientes */}
          {ingredientes.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h2 className="font-headline text-xl font-bold text-primary mb-4">
                Ingredientes Requeridos
              </h2>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ingredientes.map((ing: RecipeIngredient | string, idx: number) => {
                  const item =
                    typeof ing === "object" && ing !== null
                      ? String(ing.item ?? "")
                      : String(ing);

                  const cantidad =
                    typeof ing === "object" && ing !== null
                      ? String(ing.cantidad ?? "")
                      : "";

                  const label = cantidad
                    ? `${cantidad} - ${item}`
                    : item;

                  return (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 text-sm text-neutral p-2.5 rounded-lg bg-background border border-border/60"
                    >
                      <span className="h-2 w-2 rounded-full bg-tertiary flex-shrink-0" />

                      <span>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Pasos de preparación */}
          {pasos.length > 0 && (
            <div className="pt-4 border-t border-border">
              <h2 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <ChefHatIcon className="w-5 h-5 text-tertiary" />

                <span>Instrucciones de Preparación</span>
              </h2>

              <ol className="space-y-4">
                {pasos.map((paso: RecipeStep | string, index: number) => {
                  const stepNum =
                    typeof paso === "object" &&
                    paso !== null &&
                    typeof paso.step === "number"
                      ? paso.step
                      : index + 1;

                  const text =
                    typeof paso === "object" &&
                    paso !== null
                      ? String(paso.instruction ?? "")
                      : String(paso);

                  return (
                    <li
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/70"
                    >
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
          )}

          {/* Botones */}
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