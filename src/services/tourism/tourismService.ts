import { siteConfig } from "@/lib/config";
import type { AtractivoTuristico } from "@/types";

const BACKEND_URL = siteConfig.backendUrl;

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