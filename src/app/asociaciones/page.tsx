import React from "react";
import type { Metadata } from "next";
import { asociacionesMock } from "@/lib/data";
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

export default function AsociacionesPage() {
  const defaultAsociaciones: AsociacionEditable[] = asociacionesMock.map((a, idx) => ({
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

  const data = obtenerPaginaConfig<AsociacionesContenido>("asociaciones", {
    eyebrow: "Nuestra Gente",
    titulo: "Asociaciones de CONLAC-T",
    subtitulo:
      "Familias campesinas e indígenas organizadas para garantizar la calidad, comercio justo y preservación del patrimonio lácteo de Tungurahua.",
    contenido: {
      asociaciones: defaultAsociaciones,
    },
  });

  return <AsociacionesManager initialData={data} />;
}
