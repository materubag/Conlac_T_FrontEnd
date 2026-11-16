import React from "react";
import type { Metadata } from "next";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import { nosotrosDefaults } from "@/lib/nosotrosDefaults";
import { NosotrosManager, type NosotrosContenido } from "@/components/paginas/NosotrosManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nosotros | Consorcio CONLAC-T",
  description: "Historia, valores y misión del Consorcio de Lácteos de Tungurahua (CONLAC-T).",
};

export default function NosotrosPage() {
  const data = obtenerPaginaConfig<NosotrosContenido>("nosotros", nosotrosDefaults);

  return <NosotrosManager initialData={data} />;
}
