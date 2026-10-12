import { Producto, PresentacionProducto, Asociacion, Receta, AtractivoTuristico } from "@/types";
import { siteConfig } from "@/lib/config";

// Fotos locales por producto (demo), usadas mientras el backend no tenga imágenes
// cargadas en Supabase Storage. Se indexan por slug y también por id, porque el
// catálogo mock usa ids y el backend usa slugs.
// Las fotos que vengan del backend siempre tienen prioridad sobre estas.
const LOCAL_PRODUCT_PHOTOS: Record<string, string> = {
  // Slugs reales del backend
  "queso-fresco-artesanal-el-lindero": "/demo/PROD-fresco.jpg",
  "queso-de-hoja-tradicional-mulanleo": "/demo/PROD-quesillo.jpg",
  "queso-andino-oregano-apukanlla": "/demo/PROD-maduro.jpg",
  // Ids del catálogo mock (fallback sin backend)
  "prod-queso-fresco": "/demo/PROD-fresco.jpg",
  "prod-queso-amasado": "/demo/PROD-amasado.jpg",
  "prod-quesillo": "/demo/PROD-quesillo.jpg",
  "prod-queso-maduro-andino": "/demo/PROD-maduro.jpg",
};

// Repertorio de imágenes demo para las secciones cuyo contenido aún no tiene
// fotos cargadas en el backend. Se reparten por posición para que cada tarjeta
// muestre una imagen distinta.
const DEMO_PHOTOS = {
  asociaciones: [
    "/demo/ASOC-paramo.jpg",
    "/demo/ASOC-canon.jpg",
    "/demo/ASOC-paisaje.jpg",
    "/demo/ASOC-comunidad.jpg",
  ],
  recetas: ["/demo/REC-locro.jpg", "/demo/REC-empanadas.jpg", "/demo/REC-tabla.jpg"],
  turismo: ["/demo/TUR-vicunas.jpg", "/demo/TUR-carihuairazo.jpg", "/demo/TUR-chimborazo.jpg"],
} as const;

export function demoPhoto(seccion: keyof typeof DEMO_PHOTOS, indice: number): string {
  const pool = DEMO_PHOTOS[seccion];
  return pool[Math.abs(indice) % pool.length];
}

export function resolveProductPhotos(product: Pick<Producto, "fotos" | "slug" | "id">): string[] {
  const fromBackend = Array.isArray(product.fotos) ? product.fotos.filter(Boolean) : [];
  if (fromBackend.length > 0) {
    return fromBackend;
  }

  const local = LOCAL_PRODUCT_PHOTOS[product.slug ?? ""] ?? LOCAL_PRODUCT_PHOTOS[product.id ?? ""];
  return [local ?? siteConfig.assets.productPlaceholder];
}

export function normalizeBackendProduct(product: Producto): Producto {
  const presentations: PresentacionProducto[] = Array.isArray(product.presentaciones)
    ? product.presentaciones.map((presentation) => ({
        ...presentation,
        precio: Number(presentation.precio ?? 0),
        stock: Number(presentation.stock ?? 0),
      }))
    : [];
  const primaryPresentation = presentations[0];

  return {
    ...product,
    fotos: resolveProductPhotos(product),
    precio: Number(primaryPresentation?.precio ?? product.precio ?? 0),
    stock: Number(primaryPresentation?.stock ?? product.stock ?? 0),
    peso: primaryPresentation?.nombre_presentacion ?? product.peso,
    disponible: Boolean(product.disponible),
    presentaciones: presentations,
    variante_id: primaryPresentation?.id,
  };
}

async function fetchBackendProducts(): Promise<Producto[] | null> {
  try {
    const response = await fetch(`${siteConfig.backendUrl}/products`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;

    const products: Producto[] = await response.json();
    if (!Array.isArray(products)) return null;

    return products.map(normalizeBackendProduct);
  } catch {
    return null;
  }
}

export const productosMock: Producto[] = [
  {
    id: "prod-queso-fresco",
    nombre: "Queso Fresco",
    tipo_queso: "Fresco Semidesnatado",
    peso: "500 g",
    precio: 3.25,
    fotos: ["/demo/PROD-fresco.jpg"],
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
    fotos: ["/demo/PROD-amasado.jpg"],
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
    fotos: ["/demo/PROD-quesillo.jpg"],
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
    fotos: ["/demo/PROD-maduro.jpg"],
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
      "/demo/ASOC-paramo.jpg",
      "/demo/PROD-hoja.jpg",
      "/demo/ASOC-paisaje.jpg",
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
      "/demo/ASOC-canon.jpg",
      "/demo/ASOC-lienzo.jpg",
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
      "/demo/ASOC-paisaje.jpg",
      "/demo/PROD-maduro.jpg",
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
    fotos: ["/demo/ASOC-comunidad.jpg", "/demo/PROD-amasado.jpg"],
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
    imagen_url: "/demo/REC-locro.jpg",
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
    imagen_url: "/demo/REC-empanadas.jpg",
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
    imagen_url: "/demo/REC-tabla.jpg",
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
    foto_url: "/demo/TUR-vicunas.jpg",
  },
  {
    id: "tur-ruta-queso-artesanal",
    nombre: "Ruta Agroecológica del Queso de Páramo",
    descripcion:
      "Recorrido vivencial por las plantas queseras comunitarias para conocer el proceso de ordeño en altura, cuajado artesanal y degustación guiada.",
    asociacion_cercana: "Asociación El Lindero",
    tipo: "Agroturismo & Gastronomía",
    foto_url: "/demo/PROD-hoja.jpg",
  },
  {
    id: "tur-mirador-carihuairazo",
    nombre: "Mirador Natural del Volcán Carihuairazo",
    descripcion:
      "Panorámica imponente de los valles interandinos de Tungurahua y senderos botánicos de frailejones y flora nativa de páramo.",
    asociacion_cercana: "Asociación Apukanlla",
    tipo: "Paisajismo & Fotografía",
    foto_url: "/demo/TUR-carihuairazo.jpg",
  },
];

export async function getProducts(): Promise<Producto[]> {
  return (await fetchBackendProducts()) ?? [...productosMock];
}

export async function getProductById(id: string): Promise<Producto | null> {
  try {
    const response = await fetch(`${siteConfig.backendUrl}/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      const product: Producto = await response.json();
      return normalizeBackendProduct(product);
    }
  } catch {
    // Use demo data if the local API is not running.
  }

  const item = productosMock.find((p) => p.id === id);
  return Promise.resolve(item || null);
}

export async function getFeaturedProducts(): Promise<Producto[]> {
  const featured = ((await fetchBackendProducts()) ?? productosMock)
    .filter((p) => p.disponible)
    .slice(0, 4);
  return Promise.resolve(featured);
}

export async function getAssociations(): Promise<Asociacion[]> {
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
