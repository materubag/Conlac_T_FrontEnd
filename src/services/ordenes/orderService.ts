import type { OrderCreateResponse } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL no está configurada en las variables de entorno"
  );
}

/**
 * Obtiene un pedido por su ID (UUID).
 *
 * GET /api/orders/{id}
 */
export async function getOrderById(
  id: string
): Promise<OrderCreateResponse> {
  const response = await fetch(
    `${BACKEND_URL}/orders/${encodeURIComponent(id)}`,
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
        `No se encontró ningún pedido con el identificador "${id}".`
      );
    }

    throw new Error(
      `El servidor respondió con código HTTP ${response.status}.`
    );
  }

  return response.json();
}

/**
 * Obtiene un pedido por su número de seguimiento.
 *
 * GET /api/orders/track/{numero}
 */
export async function getOrderByTrackingNumber(
  numero: string
): Promise<OrderCreateResponse> {
  const response = await fetch(
    `${BACKEND_URL}/orders/track/${encodeURIComponent(numero)}`,
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
        `No se encontró ningún pedido con el identificador "${numero}".`
      );
    }

    throw new Error(
      `El servidor respondió con código HTTP ${response.status}.`
    );
  }

  return response.json();
}