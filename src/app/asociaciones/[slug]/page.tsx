import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { getAssociationById, resolveProductPhotos } from "@/lib/data";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AssociationDetailManager } from "@/components/associations/AssociationDetailManager";
import { Button } from "@/components/ui/Button";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import type { Asociacion, Producto } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchAssociationFromBackend(slugOrId: string): Promise<{
  association: Asociacion | null;
  error: string | null;
  isNotFound: boolean;
}> {
  const apiUrl = `${siteConfig.backendUrl}/associations/${encodeURIComponent(slugOrId)}`;

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (res.status === 404) {
      return { association: null, error: null, isNotFound: true };
    }

    if (!res.ok) {
      return {
        association: null,
        error: `El servidor backend respondió con código HTTP ${res.status} (${res.statusText})`,
        isNotFound: false,
      };
    }

    const data: Asociacion = await res.json();
    return {
      association: {
        ...data,
        fotos: Array.isArray(data.fotos) && data.fotos.length > 0
          ? data.fotos
          : ["/placeholders/association-placeholder.svg"],
      },
      error: null,
      isNotFound: false,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error de conexión";
    return {
      association: null,
      error: `No se pudo conectar con el backend (${message}).`,
      isNotFound: false,
    };
  }
}

async function fetchAssociationProducts(slugOrId: string): Promise<Producto[]> {
  const apiUrl = `${siteConfig.backendUrl}/products?asociacion=${encodeURIComponent(slugOrId)}`;

  try {
    const res = await fetch(apiUrl, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return [];
    }

    const data: Producto[] = await res.json();
    return data.map((item) => ({
      ...item,
      fotos: resolveProductPhotos(item),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { association } = await fetchAssociationFromBackend(slug);
  const fallback = association ?? (await getAssociationById(slug));
  if (!fallback) return { title: "Asociación no encontrada" };

  return {
    title: `${fallback.nombre} - Asociación CONLAC-T`,
    description: fallback.historia || `Perfil de ${fallback.nombre} en Pilahuín, Tungurahua.`,
  };
}

export default async function AssociationDetailPage({ params }: Props) {
  const { slug } = await params;
  const resultado = await fetchAssociationFromBackend(slug);

  const rawAssoc = resultado.association ?? (await getAssociationById(slug));
  const error = rawAssoc ? null : resultado.error;

  if (!rawAssoc && resultado.isNotFound) {
    notFound();
  }

  if (error || !rawAssoc) {
    return (
      <div className="py-12 sm:py-16 bg-background">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Asociaciones", href: "/asociaciones" },
              { label: "Error de carga" },
            ]}
          />
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 max-w-2xl mx-auto my-8">
            <h2 className="font-semibold text-base mb-2">Error al cargar la asociación</h2>
            <p className="text-sm text-red-700">{error || "No se pudo obtener la información de la asociación."}</p>
            <Button href="/asociaciones" variant="outlined" size="sm" className="mt-4">
              Volver a asociaciones
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Cargar personalizaciones guardadas en SQLite para esta asociación
  const config = obtenerPaginaConfig<Asociacion>(`asoc-${slug}`, {
    eyebrow: "Comunidad Productora",
    titulo: rawAssoc.nombre,
    subtitulo: rawAssoc.ubicacion_referencia || "",
    contenido: rawAssoc,
  });

  const association: Asociacion = {
    ...rawAssoc,
    ...(config.contenido || {}),
    nombre: config.contenido?.nombre || config.titulo || rawAssoc.nombre,
  };

  const products = await fetchAssociationProducts(association.slug || association.id || slug);

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Asociaciones", href: "/asociaciones" },
            { label: association.nombre },
          ]}
        />

        <AssociationDetailManager
          slug={slug}
          initialAssociation={association}
          products={products}
        />
      </Container>
    </div>
  );
}
