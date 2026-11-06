import React from "react";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { obtenerPaginaConfig } from "@/lib/db/paginasRepo";
import { ContactoManager, type ContactoContenido } from "@/components/paginas/ContactoManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contacto | CONLAC-T",
  description: "Contáctanos para pedidos por mayor, visitas a plantas queseras y atención personalizada.",
};

export default async function ContactoPage() {
  const data = await obtenerPaginaConfig<ContactoContenido>("contacto", {
    eyebrow: "Canales de Atención",
    titulo: "Contáctanos",
    subtitulo:
      "Estamos a tu disposición para atender pedidos individuales, institucionales, visitas técnicas y consultas sobre la red de asociaciones.",
    contenido: {
      whatsapp_titulo: "Atención por WhatsApp",
      whatsapp_descripcion: "Respuestas rápidas para pedidos, catálogo del día y confirmación de transferencias.",
      whatsapp_mensaje: "Hola CONLAC-T, deseo comunicarme con un asesor de ventas o coordinación.",
      ubicacion_titulo: "Ubicación y Plantas",
      ubicacion_direccion: siteConfig.location.address,
      ubicacion_horario: siteConfig.contact.schedule,
      email_titulo: "Correo Institucional",
      email_descripcion:
        "Para alianzas institucionales, convenios comunitarios y proyectos de vinculación universitaria.",
      email_direccion: siteConfig.contact.email,
    },
  });

  return <ContactoManager initialData={data} />;
}
