import React from "react";
import type { Metadata } from "next";
import { getTouristAttractions } from "@/services/tourism/tourismService";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import {
  TurismoManager,
  type TurismoContenido,
  type AtractivoEditable,
} from "@/components/paginas/TurismoManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Turismo Comunitario y Rutas | CONLAC-T",
  description:
    "Rutas agroecológicas y parajes andinos en Pilahuín, faldas del Chimborazo y Carihuairazo.",
};

export default async function TurismoPage() {
  const defaultAttractions: AtractivoEditable[] = (await getTouristAttractions()).map(a => ({
    ...a, descripcion: a.descripcion || "", foto_url: a.foto_url || null,
  }));

  const data = await obtenerPaginaConfig<TurismoContenido>("turismo", {
    eyebrow: "Experiencias Andinas",
    titulo: "Turismo Comunitario en Pilahuín",
    subtitulo:
      "Descubre los majestuosos paisajes del páramo andino de Tungurahua y vive la experiencia del agroturismo lechero y degustación en nuestras plantas comunitarias.",
    contenido: {
      atractivos: defaultAttractions,
    },
  });

  data.contenido.atractivos = defaultAttractions;
  return <TurismoManager initialData={data} />;
}
