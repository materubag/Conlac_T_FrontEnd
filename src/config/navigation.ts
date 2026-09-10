import { NavigationItem } from "@/types";

/**
 * ============================================================
 * CONFIGURACIÓN CENTRALIZADA DE NAVEGACIÓN - CONLAC-T
 * ============================================================
 * 
 * Define las 7 pestañas oficiales del proyecto y los enlaces del footer.
 * Se centraliza para evitar código duplicado y facilitar cambios futuros.
 */

export const MAIN_NAV_ITEMS: NavigationItem[] = [
  {
    name: "Tienda",
    href: "/tienda",
    description: "Catálogo de quesos y lácteos artesanales",
  },
  {
    name: "Asociaciones",
    href: "/asociaciones",
    description: "Comunidades y familias productoras de Tungurahua",
  },
  {
    name: "Recetas",
    href: "/recetas",
    description: "Preparaciones tradicionales con nuestros quesos",
  },
  {
    name: "Turismo",
    href: "/turismo",
    description: "Rutas agroecológicas y parajes andinos en Pilahuín",
  },
  {
    name: "Nosotros",
    href: "/nosotros",
    description: "Historia, valores y misión del Consorcio",
  },
  {
    name: "Cómo comprar",
    href: "/como-comprar",
    description: "Guía de compra local, transferencias y envíos",
  },
  {
    name: "Contacto",
    href: "/contacto",
    description: "Atención al cliente, pedidos especiales y visitas",
  },
];

export const FOOTER_NAV_SECTIONS = {
  explorar: [
    { name: "Tienda de Quesos", href: "/tienda" },
    { name: "Nuestras Asociaciones", href: "/asociaciones" },
    { name: "Recetas Andinas", href: "/recetas" },
    { name: "Rutas de Turismo", href: "/turismo" },
  ],
  institucional: [
    { name: "Quiénes Somos", href: "/nosotros" },
    { name: "Cómo Comprar", href: "/como-comprar" },
    { name: "Sellos Sanitarios y Calidad", href: "/nosotros#calidad" },
    { name: "Contacto y Ubicación", href: "/contacto" },
  ],
  legal: [
    { name: "Términos de Servicio", href: "#" },
    { name: "Política de Privacidad", href: "#" },
    { name: "Políticas de Entrega", href: "#" },
  ],
};
