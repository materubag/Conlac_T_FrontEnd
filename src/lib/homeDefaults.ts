import type { HomeContent } from "@/types/home";

// Textos editoriales iniciales; no contiene productos, recetas ni imágenes de muestra.
export const homeDefaults = {
  eyebrow: "Pilahuín · Ambato · Tungurahua",
  titulo: "Tradición, Oficio y el",
  subtitulo: "Quesos artesanales de Pilahuín elaborados con leche fresca de páramo por asociaciones y familias productoras locales.",
  contenido: {
    hidden_sections: {},
    hero_accent: "Corazón de los Andes",
    hero_primary_label: "Ver productos",
    hero_whatsapp_label: "Comprar por WhatsApp",
    hero_whatsapp_message: "Hola CONLAC-T, vi su página web y deseo consultar sobre los quesos artesanales disponibles.",
    hero_claims: ["100% Leche pura de páramo", "Técnicas artesanales comunitarias", "Comercio justo directo"],
    products: {
      eyebrow: "Nuestra Selección Artesanal", title: "Quesos Destacados de Tungurahua",
      description: "Variedades elaboradas diariamente en las plantas de nuestras asociaciones aliadas bajo estándares de pureza y calidad.",
      link_label: "Ver catálogo completo", empty: "En este momento no hay productos disponibles. Puedes consultar por WhatsApp.",
    },
    trust: {
      eyebrow: "Garantía y Procedencia", title: "Confianza desde el Origen",
      description: "Cada queso de CONLAC-T representa la dedicación de nuestras familias y la riqueza natural del páramo andino de Tungurahua.",
      pillars: [
        { title: "Origen en el Páramo", description: "Leche fresca obtenida a más de 3.300 msnm con pastoreo natural libre de químicos." },
        { title: "Comunidades Unidas", description: "Asociaciones familiares de Pilahuín y Chibuleo impulsando la economía solidaria." },
        { title: "Buenas Prácticas (BPM)", description: "Procesamiento con estrictas normas sanitarias y trazabilidad desde el ordeño." },
        { title: "Sabor Auténtico", description: "Recetas ancestrales de amasado y maduración que conservan la textura única de Tungurahua." },
      ],
    },
    access: {
      eyebrow: "Descubre más de CONLAC-T", title: "Nuestra Gente, Sabores y Territorio",
      description: "Más que una tienda, somos un consorcio comunitario que promueve el patrimonio cultural y agropecuario de Tungurahua.",
      link_label: "Explorar sección",
    },
    testimonials: {
      eyebrow: "Voces de Nuestra Comunidad", title: "Testimonios y Experiencias",
      description: "Lo que opinan familias consumidoras y aliados comerciales que confían en los lácteos de nuestras asociaciones de Tungurahua.",
      empty: "Próximamente publicaremos nuevas valoraciones de nuestra comunidad.",
    },
  } satisfies HomeContent,
};
