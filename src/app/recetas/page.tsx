import type { Metadata } from "next";
import { obtenerPaginaRecetas } from "@/lib/db/recetasRepo";
import { RecetasManager } from "@/components/recetas/RecetasManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recetas con Queso Andino | CONLAC-T",
  description:
    "Platos tradicionales y recetas familiares para preparar con los quesos artesanales de CONLAC-T en Tungurahua.",
};

export default async function RecetasPage() {
  const data = obtenerPaginaRecetas(false);

  return <RecetasManager initialData={data} />;
}
