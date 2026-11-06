import React from "react";
import type { Metadata } from "next";
import { getAssociations } from "@/lib/data";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import {
  AsociacionesManager,
  type AsociacionesContenido,
  type AsociacionEditable,
} from "@/components/paginas/AsociacionesManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Asociaciones Productoras | CONLAC-T",
  description:
    "Conoce las asociaciones comunitarias y familias queseras del consorcio CONLAC-T en Tungurahua.",
};

export default async function AsociacionesPage() {
  const defaultAsociaciones: AsociacionEditable[] = (await getAssociations()).map((a, idx) => ({
    id: a.id,
    slug: a.slug || a.id,
    nombre: a.nombre,
    descripcion:
      a.descripcion_corta ||
      a.historia ||
      "Familias productoras de leche artesanal y quesos andinos de altura.",
    parroquia: a.ubicacion || "Pilahuín",
    miembros: 30 + idx * 10,
    foto_url: (Array.isArray(a.fotos) && a.fotos[0]) || null,
  }));

  const data = await obtenerPaginaConfig<AsociacionesContenido>("asociaciones", {
    eyebrow: "Nuestra Gente",
    titulo: "Asociaciones de CONLAC-T",
    subtitulo:
      "Familias campesinas e indígenas organizadas para garantizar la calidad, comercio justo y preservación del patrimonio lácteo de Tungurahua.",
    contenido: {
      asociaciones: defaultAsociaciones,
    },
  });

  data.contenido.asociaciones = defaultAsociaciones.map(a=>({
    ...data.contenido.asociaciones?.find(saved=>saved.id===a.id), ...a,
    miembros: data.contenido.asociaciones?.find(saved=>saved.id===a.id)?.miembros ?? a.miembros,
    foto_url: a.foto_url || data.contenido.asociaciones?.find(saved=>saved.id===a.id)?.foto_url || null,
  }));
  return <AsociacionesManager initialData={data} />;
}
