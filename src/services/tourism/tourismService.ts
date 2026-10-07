import type { AtractivoTuristico } from "@/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL no está configurada en las variables de entorno"
  );
}

export async function getTouristAttractions(): Promise<AtractivoTuristico[]> {
  const response = await fetch(`${BACKEND_URL}/turismo`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Error al obtener los atractivos turísticos: ${response.status} ${response.statusText}`
    );
  }

  const data: AtractivoTuristico[] = await response.json();

  return Array.isArray(data) ? data : [];
}