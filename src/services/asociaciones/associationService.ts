import { adminFetch, mensajeDeError } from "@/lib/adminFetch";
import { siteConfig } from "@/lib/config";
import type {
  AssociationResponse,
  CreateAssociationRequest,
} from "@/types/index";

const BACKEND_URL = siteConfig.backendUrl;

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
export async function createAssociation(data: CreateAssociationRequest): Promise<AssociationResponse> {
  const response=await adminFetch(`${BACKEND_URL}/admin/asociaciones`,{method:"POST",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({
      slug:data.slug,nombre:data.name,descripcion_corta:data.shortDescription,historia:data.history,
      ubicacion:data.locationText,lat:data.latitude,lng:data.longitude,registro_arcsa:data.arcsaRegistration,
      registro_agrocalidad:data.agrocalidadRegistration,sello_sanitario:data.sanitarySealText,
      video_url:data.videoUrl,instagram_url:data.instagramUrl,tiktok_url:data.tiktokUrl,
      facebook_url:data.facebookUrl,whatsapp:data.whatsapp,is_published:data.isPublished,
    })});
  if(!response.ok)throw new Error(await mensajeDeError(response,"No se pudo crear la asociación"));
  return response.json();
}
