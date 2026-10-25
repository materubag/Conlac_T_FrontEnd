import type {
  RecipeResponse,
  RecipeDetailResponse,
} from "@/types/recipe";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL no está configurada en las variables de entorno"
  );
}

/**
 * Obtiene todas las recetas publicadas.
 *
 * GET /api/recetas
 */
export async function getRecipes(): Promise<RecipeResponse[]> {
  const response = await fetch(`${BACKEND_URL}/recetas`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener las recetas: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Obtiene una receta por UUID o slug.
 *
 * GET /api/recetas/{identifier}
 *
 * El backend determina automáticamente si identifier
 * es un UUID o un slug.
 */
export async function getRecipe(
  identifier: string
): Promise<RecipeDetailResponse> {
  const response = await fetch(
    `${BACKEND_URL}/recetas/${encodeURIComponent(identifier)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Receta no encontrada");
    }

    throw new Error(
      `Error al obtener la receta: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

