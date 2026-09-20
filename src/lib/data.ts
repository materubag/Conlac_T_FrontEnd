import { Producto, Asociacion, Receta, AtractivoTuristico } from "@/types";

export const productosMock: Producto[] = [
  {
    id: "prod-queso-fresco",
    nombre: "Queso Fresco",
    tipo_queso: "Fresco Semidesnatado",
    peso: "500 g",
    precio: 3.25,
    fotos: ["/placeholders/product-queso-fresco.svg"],
    asociacion: "Asociación El Lindero",
    asociacion_id: "asoc-el-lindero",
    stock: 20,
    disponible: true,
  },
  {
    id: "prod-queso-amasado",
    nombre: "Queso Amasado",
    tipo_queso: "Amasado Tradicional",
    peso: "500 g",
    precio: 3.90,
    fotos: ["/placeholders/product-queso-amasado.svg"],
    asociacion: "Asociación de Lácteos San Francisco de Chibuleo",
    asociacion_id: "asoc-san-francisco-chibuleo",
    stock: 15,
    disponible: true,
  },
  {
    id: "prod-quesillo",
    nombre: "Quesillo",
    tipo_queso: "Tierno Andino",
    peso: "500 g",
    precio: 2.80,
    fotos: ["/placeholders/product-quesillo.svg"],
    asociacion: "Asociación Mulanleo",
    asociacion_id: "asoc-mulanleo",
    stock: 30,
    disponible: true,
  },
  {
    id: "prod-queso-maduro-andino",
    nombre: "Queso Maduro Andino",
    tipo_queso: "Madurado en Cava",
    peso: "400 g",
    precio: 6.50,
    fotos: ["/placeholders/product-queso-maduro.svg"],
    asociacion: "Asociación Apukanlla",
    asociacion_id: "asoc-apukanlla",
    stock: 8,
    disponible: true,
  },
];

export const asociacionesMock: Asociacion[] = [
  {
    id: "asoc-el-lindero",
    slug: "asociacion-el-lindero",
    nombre: "Asociación El Lindero",
    historia:
      "Ubicada en el sector El Lindero en las faldas del páramo andino de Pilahuín, agrupa a familias campesinas dedicadas a la producción de leche de pastoreo de altura y elaboración de queso fresco tradicional con estrictas normas de inocuidad.",
    fotos: [
      "/placeholders/association-placeholder.svg",
      "/placeholders/association-placeholder.svg",
      "/placeholders/association-placeholder.svg",
    ],
    sello_sanitario: "BPM-CONLAC-001",
    sello_arcsa: "ARCSA-BPM-TUN-00124 (Provisional / Mock)",
    registro_bpm: "BPM-2024-089 (Mock)",
    numero_familias: 24,
    altitud_msnm: 3400,
    lat: -1.298500,
    lng: -78.712300,
    ubicacion_referencia: "Sector El Lindero, Parroquia Pilahuín, Cantón Ambato, Tungurahua",
    productos_ids: ["prod-queso-fresco"],
    horario_atencion: "Lunes a Viernes: 07h00 - 16h00 (Provisional)",
    contacto_asociacion: "+593 99 999 9901 (Provisional)",
    redes_sociales: {
      whatsapp: "593999999901",
      facebook: "https://facebook.com",
    },
  },
  {
    id: "asoc-mulanleo",
    slug: "asociacion-mulanleo",
    nombre: "Asociación Mulanleo",
    historia:
      "Núcleo comunitario productor de Mulanleo en Pilahuín, especializado en derivados lácteos de alta pureza y quesillos tiernos elaborados con ganado adaptado al ecosistema de páramo a más de 3.350 msnm.",
    fotos: [
      "/placeholders/association-placeholder.svg",
      "/placeholders/association-placeholder.svg",
    ],
    sello_sanitario: "BPM-CONLAC-002",
    sello_arcsa: "ARCSA-BPM-TUN-00125 (Provisional / Mock)",
    registro_bpm: "BPM-2024-090 (Mock)",
    numero_familias: 18,
    altitud_msnm: 3350,
    lat: -1.289100,
    lng: -78.725400,
    ubicacion_referencia: "Comunidad Mulanleo, Parroquia Pilahuín, Tungurahua",
    productos_ids: ["prod-quesillo"],
    horario_atencion: "Lunes a Sábado: 08h00 - 15h00 (Provisional)",
    contacto_asociacion: "+593 99 999 9902 (Provisional)",
    redes_sociales: {
      whatsapp: "593999999902",
    },
  },
  {
    id: "asoc-apukanlla",
    slug: "asociacion-apukanlla",
    nombre: "Asociación Apukanlla",
    historia:
      "Pioneros en la maduración de quesos andinos de cava natural en el sector Apukanlla, aprovechando el microclima frío y seco del páramo para lograr notas aromáticas profundas y cortezas naturales.",
    fotos: [
      "/placeholders/association-placeholder.svg",
      "/placeholders/association-placeholder.svg",
    ],
    sello_sanitario: "BPM-CONLAC-003",
    sello_arcsa: "ARCSA-BPM-TUN-00126 (Provisional / Mock)",
    registro_bpm: "BPM-2024-091 (Mock)",
    numero_familias: 15,
    altitud_msnm: 3500,
    lat: -1.305000,
    lng: -78.701100,
    ubicacion_referencia: "Sector Apukanlla, Parroquia Pilahuín, Tungurahua",
    productos_ids: ["prod-queso-maduro-andino"],
    horario_atencion: "Lunes a Viernes: 08h30 - 16h30 (Provisional)",
    contacto_asociacion: "+593 99 999 9903 (Provisional)",
    redes_sociales: {
      whatsapp: "593999999903",
    },
  },
  {
    id: "asoc-san-francisco-chibuleo",
    slug: "asociacion-san-francisco-chibuleo",
    nombre: "Asociación de Lácteos San Francisco de Chibuleo",
    historia:
      "Productores indígenas de la comunidad de Chibuleo San Francisco que preservan la técnica ancestral del queso amasado a mano, garantizando una textura cremosa y sabor auténtico de la serranía.",
    fotos: ["/placeholders/association-placeholder.svg"],
    sello_sanitario: "BPM-CONLAC-004",
    sello_arcsa: "ARCSA-BPM-TUN-00127 (Provisional / Mock)",
    registro_bpm: "BPM-2024-092 (Mock)",
    numero_familias: 22,
    altitud_msnm: 3200,
    lat: -1.276400,
    lng: -78.704200,
    ubicacion_referencia: "Pueblo Chibuleo San Francisco, Parroquia Juan Benigno Vela / Pilahuín, Tungurahua",
    productos_ids: ["prod-queso-amasado"],
    horario_atencion: "Lunes a Domingo: 07h30 - 17h00 (Provisional)",
    contacto_asociacion: "+593 99 999 9904 (Provisional)",
    redes_sociales: {
      whatsapp: "593999999904",
    },
  },
];

const associationAliasMap: Record<string, string> = {
  "asoc-san-pedro": "asoc-el-lindero",
  "asoc-pilahuin": "asoc-mulanleo",
  "asoc-nueva-vida": "asoc-apukanlla",
  "asoc-chibuleo": "asoc-san-francisco-chibuleo",
};

export const recetasMock: Receta[] = [
  {
    id: "receta-locro-papa-queso",
    titulo: "Locro de Papa Andino con Queso Fresco",
    tipo_queso: "Queso Fresco El Lindero",
    tiempo_prep: 45,
    producto_slug: "prod-queso-fresco",
    pasos: [
      "Pelar y picar las papas chola y chahuaco en cubos.",
      "Preparar un refrito con cebolla blanca picada finamente y achiote.",
      "Agregar las papas y agua hirviendo; cocinar hasta que espesen de manera natural.",
      "Añadir leche entera fresca y rectificar la sal.",
      "Servir humeante coronando con abundante Queso Fresco en cubos y rodajas de aguacate.",
    ],
  },
  {
    id: "receta-empanadas-viento-quesillo",
    titulo: "Empanadas de Viento con Quesillo de Mulanleo",
    tipo_queso: "Quesillo Mulanleo",
    tiempo_prep: 30,
    producto_slug: "prod-quesillo",
    pasos: [
      "Elaborar masa fina con harina de trigo, manteca tibia y agua con sal.",
      "Extender discos delgados y rellenar con rodajas de Quesillo tierno.",
      "Repulgar los bordes y freír en aceite bien caliente bañando la superficie para que infle.",
      "Escurrir, espolvorear azúcar granulada y servir inmediatamente.",
    ],
  },
  {
    id: "receta-fondue-maduro-andino",
    titulo: "Tabla & Fondue Rústico de Maduro Andino",
    tipo_queso: "Queso Maduro Andino Apukanlla",
    tiempo_prep: 20,
    producto_slug: "prod-queso-maduro-andino",
    pasos: [
      "Rallar o trocear el Queso Maduro Andino a temperatura ambiente.",
      "Fundir suavemente en cazuela de barro con un toque de vino blanco o manzana andina.",
      "Acompañar con pan campesino de masa madre, uvas y frutos secos.",
    ],
  },
];

export const atractivosMock: AtractivoTuristico[] = [
  {
    id: "tur-reserva-chimborazo",
    nombre: "Reserva de Producción de Fauna Chimborazo",
    descripcion:
      "Extensos páramos andinos, senderos de alta montaña y avistamiento de vicuñas en su hábitat natural, contiguo a las zonas de pastoreo de Pilahuín.",
    asociacion_cercana: "Asociación Mulanleo",
    tipo: "Naturaleza & Senderismo",
  },
  {
    id: "tur-ruta-queso-artesanal",
    nombre: "Ruta Agroecológica del Queso de Páramo",
    descripcion:
      "Recorrido vivencial por las plantas queseras comunitarias para conocer el proceso de ordeño en altura, cuajado artesanal y degustación guiada.",
    asociacion_cercana: "Asociación El Lindero",
    tipo: "Agroturismo & Gastronomía",
  },
  {
    id: "tur-mirador-carihuairazo",
    nombre: "Mirador Natural del Volcán Carihuairazo",
    descripcion:
      "Panorámica imponente de los valles interandinos de Tungurahua y senderos botánicos de frailejones y flora nativa de páramo.",
    asociacion_cercana: "Asociación Apukanlla",
    tipo: "Paisajismo & Fotografía",
  },
];

export async function getProducts(): Promise<Producto[]> {
  return Promise.resolve([...productosMock]);
}

export async function getProductById(id: string): Promise<Producto | null> {
  const item = productosMock.find((p) => p.id === id);
  return Promise.resolve(item || null);
}

export async function getFeaturedProducts(): Promise<Producto[]> {
  const featured = productosMock.filter((p) => p.disponible).slice(0, 4);
  return Promise.resolve(featured);
}

export async function getAssociations(): Promise<Asociacion[]> {
  console.log("Total de asociaciones:", asociacionesMock.length);
  console.log("Asociaciones:", asociacionesMock);

  return Promise.resolve([...asociacionesMock]);
}

export async function getAssociationById(idOrSlug: string): Promise<Asociacion | null> {
  const resolvedId = associationAliasMap[idOrSlug] || idOrSlug;
  const item = asociacionesMock.find(
    (a) => a.id === resolvedId || a.slug === resolvedId || a.id === idOrSlug || a.slug === idOrSlug
  );
  return Promise.resolve(item || null);
}

export async function createAssociation(
  asociacion: Omit<Asociacion, "id">
): Promise<Asociacion> {
  const nuevaAsociacion: Asociacion = {
    id: `asoc-${Date.now()}`,
    ...asociacion,
  };

  asociacionesMock.push(nuevaAsociacion);

  return Promise.resolve(nuevaAsociacion);
}

export function getProductsByAssociationId(associationId: string): Producto[] {
  if (!associationId) return [];

  const targetId = associationAliasMap[associationId] || associationId;

  const assoc = asociacionesMock.find(
    (a) => a.id === targetId || a.slug === targetId || a.id === associationId || a.slug === associationId
  );

  if (assoc && assoc.productos_ids && assoc.productos_ids.length > 0) {
    const matched = productosMock.filter((p) => assoc.productos_ids?.includes(p.id));
    if (matched.length > 0) return matched;
  }

  return productosMock.filter(
    (p) =>
      p.asociacion_id === targetId ||
      p.asociacion_id === associationId ||
      p.asociacion === targetId ||
      p.asociacion === associationId
  );
}

export async function getRecipes(): Promise<Receta[]> {
  return Promise.resolve([...recetasMock]);
}

export async function getTouristAttractions(): Promise<AtractivoTuristico[]> {
  return Promise.resolve([...atractivosMock]);
}
