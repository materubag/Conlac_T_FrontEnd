import React from "react";
import type { Metadata } from "next";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import { NosotrosManager, type NosotrosContenido } from "@/components/paginas/NosotrosManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nosotros | Consorcio CONLAC-T",
  description: "Historia, valores y misión del Consorcio de Lácteos de Tungurahua (CONLAC-T).",
};

export default function NosotrosPage() {
  const data = obtenerPaginaConfig<NosotrosContenido>("nosotros", {
    eyebrow: "Herencia y territorio andino",
    titulo: "Nuestra historia y tradición",
    subtitulo:
      "La unión viva de más de 450 familias campesinas e indígenas en las faldas del volcán Tungurahua, preservando la pureza del ordeño artesanal y el pastoreo libre.",
    contenido: {
      historia_titulo: "La fuerza de los páramos de Tungurahua",
      historia_p1:
        "El Consorcio de Lácteos de Tungurahua (CONLAC-T) nació como respuesta comunitaria frente a la intermediación desleal y la pérdida de valor del trabajo campesino en los páramos de Pilahuín.",
      historia_p2:
        "Hoy agrupamos a más de 450 familias distribuidas en asociaciones comunitarias. Cada litro de leche proviene de vacas alimentadas con pastos andinos a más de 3.000 metros sobre el nivel del mar, transformado en quesos con identidad y pureza garantizada.",
      leche_altura_titulo: "Leche de altura",
      leche_altura_subtitulo: "Pastoreo libre a más de 3.000 msnm",
      testimonios_eyebrow: "Confianza & Comunidad",
      testimonios_titulo: "Lo que dicen quienes consumen y apoyan CONLAC-T",
      stats: [
        { value: "450+", label: "Familias campesinas", sublabel: "productoras directas" },
        { value: "7", label: "Asociaciones activas", sublabel: "en red comunitaria" },
        { value: "3.200 m", label: "Altura promedio", sublabel: "leche de páramo" },
        { value: "100%", label: "Leche pura", sublabel: "pastoreo andino libre" },
      ],
      testimonials: [
        {
          quote: "“La cremosidad y el punto de sal del queso de CONLAC-T elevaron los platos tradicionales de nuestra carta.”",
          name: "Chef Mateo Villacís",
          role: "Restaurante Altura & Raíz, Baños",
        },
        {
          quote: "“La frescura es incomparable. Saber que apoyamos directamente a campesinos de nuestra provincia nos da paz.”",
          name: "Carmen Salazar Morales",
          role: "Clienta habitual, Ambato",
        },
        {
          quote: "“La puntualidad de entrega y el compromiso ético los convierten en un socio insustituible.”",
          name: "Diego Barreno",
          role: "Café Páramo & Aroma, Pelileo",
        },
      ],
    },
  });

  return <NosotrosManager initialData={data} />;
}
