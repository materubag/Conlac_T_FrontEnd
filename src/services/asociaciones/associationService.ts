import type {
  AssociationResponse,
  CreateAssociationRequest,
} from "@/types/index";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL no está configurada en las variables de entorno"
  );
}

/**
 * Obtiene todas las asociaciones publicadas.
 *
 * GET /api/asociaciones
 */
export async function getAssociations(): Promise<
  AssociationResponse[]
> {
  const response = await fetch(
    `${BACKEND_URL}/asociaciones`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Error al obtener las asociaciones: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Obtiene una asociación por ID o slug.
 *
 * GET /api/asociaciones/{identifier}
 */
export async function getAssociation(
  identifier: string
): Promise<AssociationResponse> {
  const response = await fetch(
    `${BACKEND_URL}/asociaciones/${encodeURIComponent(
      identifier
    )}`,
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
      throw new Error(
        "Asociación no encontrada"
      );
    }

    throw new Error(
      `Error al obtener la asociación: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Crea una nueva asociación.
 *
 * POST /api/asociaciones
 */
export async function createAssociation(
  data: CreateAssociationRequest
): Promise<AssociationResponse> {
  const response = await fetch(
    `${BACKEND_URL}/asociaciones`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Error al crear la asociación: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}