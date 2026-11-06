import React from "react";
import type { Metadata } from "next";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import { ComoComprarManager, type ComoComprarContenido } from "@/components/paginas/ComoComprarManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cómo Comprar | CONLAC-T",
  description: "Guía paso a paso para realizar tus pedidos de quesos artesanales con entrega local y retiro.",
};

const defaultSteps = [
  {
    number: "01",
    title: "Elige tus quesos favoritos",
    description: "Revisa nuestro catálogo online con opciones de queso fresco, amasado, quesillo y maduro andino.",
  },
  {
    number: "02",
    title: "Escríbenos por WhatsApp o solicita en tienda",
    description: "Envíanos tu lista de productos y la cantidad requerida para verificar stock inmediato y confirmar el total.",
  },
  {
    number: "03",
    title: "Pago por Transferencia Bancaria",
    description: "Realiza el pago seguro vía transferencia directa a la cuenta del consorcio y envía el comprobante por WhatsApp. El pago se confirma manualmente después de verificar el abono.",
  },
  {
    number: "04",
    title: "Entrega a domicilio o Retiro en Planta",
    description: "Coordinamos la entrega directa en Ambato y sectores aledaños o retira tus productos frescos en Pilahuín.",
  },
];

export default async function ComoComprarPage() {
  const data = await obtenerPaginaConfig<ComoComprarContenido>("como-comprar", {
    eyebrow: "Guía de Pedidos",
    titulo: "¿Cómo Comprar en CONLAC-T?",
    subtitulo: "Un proceso directo, transparente y solidario que apoya a los productores de Tungurahua.",
    contenido: {
      steps: defaultSteps,
      cta_titulo: "¿Listo para ordenar tus quesos?",
      cta_subtitulo: "Atendemos tus pedidos y consultas de forma personalizada de lunes a domingo.",
    },
  });

  return <ComoComprarManager initialData={data} />;
}
