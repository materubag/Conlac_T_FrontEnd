import React from "react";
import type { Metadata } from "next";
import { atractivosMock } from "@/lib/data";
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

export default function TurismoPage() {
  const defaultAttractions: AtractivoEditable[] = atractivosMock.map((a, i) => ({
    id: a.id,
    nombre: a.nombre,
    descripcion:
      a.descripcion ||
      "Hermosa ruta de páramo andino con visita y degustación de quesos artesanales.",
    foto_url: a.foto_url || null,
    duracion: "3 - 4 horas",
    dificultad: "Moderada",
    video_url: i === 0 ? "https://www.youtube.com/watch?v=s5Rsw9hR278" : null,
  }));

  const data = obtenerPaginaConfig<TurismoContenido>("turismo", {
    eyebrow: "Experiencias Andinas",
    titulo: "Turismo Comunitario en Pilahuín",
    subtitulo:
      "Descubre los majestuosos paisajes del páramo andino de Tungurahua y vive la experiencia del agroturismo lechero y degustación en nuestras plantas comunitarias.",
    contenido: {
      atractivos: defaultAttractions,
    },
  });

  return <TurismoManager initialData={data} />;
}
