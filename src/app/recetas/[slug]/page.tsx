import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe } from "@/services/recipes/recipeService";
import { recetasMock } from "@/lib/data";
import { obtenerRecetaPorIdOSlug } from "@/lib/db/recetasRepo";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ChefHatIcon } from "@/components/ui/Icons";
import { getVideoEmbedUrl } from "@/lib/utils";
import type { RecipeResponse, RecipeIngredient, RecipeStep } from "@/types/recipe";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchRecipeDetail(
  slug: string
): Promise<RecipeResponse | null> {
  // 1. Consultar almacén local SQLite de recetas editables
  try {
    const local = obtenerRecetaPorIdOSlug(slug);
    if (local) {
      return {
        id: local.id,
        slug: local.slug,
        titulo: local.titulo,
        descripcion_corta: local.descripcion_corta || undefined,
        tipo_queso: local.tipo_queso || undefined,
        tiempo_prep: local.tiempo_prep || undefined,
        tiempo_preparacion_minutos: local.tiempo_prep || undefined,
        porciones: local.porciones || undefined,
        imagen_url: local.imagen_url || undefined,
        video_url: local.video_url || undefined,
        pasos: local.pasos.map((p, idx) => ({ step: idx + 1, instruction: p })),
        ingredientes: [],
      };
    }
  } catch {
    // Si falla consulta a SQLite, continuar al fallback
  }

  // 2. Consultar backend Spring Boot si está disponible
  try {
    const receta = await getRecipe(slug);
    if (receta) {
      return receta;
    }
  } catch {
    // Backend no disponible: seguimos con el recetario local.
  }

  // 3. Fallback en catálogo mock estático
  return recetasMock.find((r) => r.id === slug || r.slug === slug) ?? null;
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

  const prepTime = recipe.tiempo_preparacion_minutos ?? recipe.tiempo_prep;

  const imageSrc =
    recipe.imagen_url || "/placeholders/recipe-placeholder.svg";

  const ingredientes = Array.isArray(recipe.ingredientes)
    ? recipe.ingredientes
    : [];

  const pasos = Array.isArray(recipe.pasos) ? recipe.pasos : [];
  const embedUrl = getVideoEmbedUrl(recipe.video_url || "");

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
              unoptimized={imageSrc.startsWith("data:")}
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

              {recipe.tipo_queso && (
                <Badge variant="secondary">
                  Queso: {recipe.tipo_queso}
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

          {/* Ingredientes (si existen) */}
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

          {/* Video de preparación si está configurado en la receta */}
          {embedUrl && (
            <div className="pt-4 border-t border-border">
              <h2 className="font-headline text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="text-red-600 font-bold">▶</span>
                <span>Video de Preparación</span>
              </h2>
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm">
                <iframe
                  src={embedUrl}
                  title={`Video de preparación de ${recipe.titulo}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
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
                      className="p-4 rounded-xl bg-background border border-border flex items-start gap-3.5"
                    >
                      <span className="w-7 h-7 rounded-full bg-primary text-white flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5">
                        {stepNum}
                      </span>

                      <div className="text-sm text-neutral-muted leading-relaxed pt-0.5">
                        {text}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
