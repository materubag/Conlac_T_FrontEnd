import { Producto, Asociacion, Receta, AtractivoTuristico } from "@/types";

/**
 * ============================================================
 * CAPA DE ACCESO A DATOS (MOCKS Y CONTRATOS) - CONLAC-T
 * Consorcio de Lácteos de Tungurahua
 * ============================================================
 * 
 * NOTA DE ARQUITECTURA:
 * Los componentes consumen exclusivamente las funciones asíncronas
 * (getProducts, getProductById, etc.).
 * En etapas posteriores (Semana 7+), estas funciones se conectarán
 * a Supabase / PostgreSQL o REST API sin modificar los componentes de la UI.
 */

// ============================================================
// 1. DATOS MOCK DE PRODUCTOS
// ============================================================
interface AssociationFormData {
  nombre: string;
  parroquia: string;
  numero_familias: string;
  año_fundacion: string;
  registro_arcsa: string;
  fecha_emision: string;
  estado_vigencia: string;
  foto_principal: string;
  galeria: string[];
  video_url: string;
  lat: string;
  lng: string;
  referencia_vial: string;
  historia: string;
}
export const productosMock: Producto[] = [
  {
    id: "prod-queso-fresco",
    nombre: "Queso Fresco",
    tipo_queso: "Fresco Semidesnatado",
    peso: "500 g",
    precio: 3.25,
    fotos: ["/placeholders/product-queso-fresco.svg"],
    asociacion: "Asociación San Pedro",
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
    asociacion: "Asociación Chibuleo",
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
    asociacion: "Asociación Pilahuín",
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
    asociacion: "Asociación Nueva Vida",
    stock: 8,
    disponible: true,
  },
];

// ============================================================
// 2. DATOS MOCK DE ASOCIACIONES
// ============================================================

export const asociacionesMock: Asociacion[] = [
  {
    id: "asoc-san-pedro",
    nombre: "Asociación San Pedro",
    historia:
      "Ubicada en las faldas del páramo andino de Pilahuín, agrupa a 24 familias dedicadas a la producción de leche de pastoreo de altura y elaboración de queso fresco tradicional con estrictas normas de inocuidad.",
    fotos: ["/placeholders/association-placeholder.svg"],
    sello_sanitario: "BPM-CONLAC-001",
    lat: -1.2985,
    lng: -78.7123,
  },
  {
    id: "asoc-chibuleo",
    nombre: "Asociación Chibuleo",
    historia:
      "Productores indígenas de la comunidad de Chibuleo que preservan la técnica ancestral del queso amasado a mano, garantizando una textura cremosa y sabor auténtico de la sierra tungurahuense.",
    fotos: ["/placeholders/association-placeholder.svg"],
    sello_sanitario: "BPM-CONLAC-002",
    lat: -1.3052,
    lng: -78.6984,
  },
  {
    id: "asoc-pilahuin",
    nombre: "Asociación Pilahuín",
    historia:
      "Núcleo fundador del consorcio, especializada en quesillo tierno y derivados lácteos de alta pureza provenientes de ganado adaptado al ecosistema de páramo a más de 3.300 msnm.",
    fotos: ["/placeholders/association-placeholder.svg"],
    sello_sanitario: "BPM-CONLAC-003",
    lat: -1.2891,
    lng: -78.7219,
  },
  {
    id: "asoc-nueva-vida",
    nombre: "Asociación Nueva Vida",
    historia:
      "Pioneros en la maduración de quesos andinos con técnicas europeas adaptadas al microclima de Tungurahua, logrando notas aromáticas profundas y cortezas naturales.",
    fotos: ["/placeholders/association-placeholder.svg"],
    sello_sanitario: "BPM-CONLAC-004",
    lat: -1.2764,
    lng: -78.7042,
  },
];

// ============================================================
// 3. DATOS MOCK DE RECETAS
// ============================================================

export const recetasMock: Receta[] = [
  {
    id: "receta-locro-papa-queso",
    titulo: "Locro de Papa Andino con Queso Fresco",
    tipo_queso: "Queso Fresco San Pedro",
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
    titulo: "Empanadas de Viento con Quesillo de Pilahuín",
    tipo_queso: "Quesillo Pilahuín",
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
    tipo_queso: "Queso Maduro Andino",
    tiempo_prep: 20,
    producto_slug: "prod-queso-maduro-andino",
    pasos: [
      "Rallar o trocear el Queso Maduro Andino a temperatura ambiente.",
      "Fundir suavemente en cazuela de barro con un toque de vino blanco o manzana andina.",
      "Acompañar con pan campesino de masa madre, uvas y frutos secos.",
    ],
  },
];

// ============================================================
// 4. DATOS MOCK DE ATRACTIVOS TURÍSTICOS
// ============================================================

export const atractivosMock: AtractivoTuristico[] = [
  {
    id: "tur-reserva-chimborazo",
    nombre: "Reserva de Producción de Fauna Chimborazo",
    descripcion:
      "Extensos páramos andinos, senderos de alta montaña y avistamiento de vicuñas en su hábitat natural, contiguo a las zonas de pastoreo de Pilahuín.",
    asociacion_cercana: "Asociación Pilahuín",
    tipo: "Naturaleza & Senderismo",
  },
  {
    id: "tur-ruta-queso-artesanal",
    nombre: "Ruta Agroecológica del Queso de Páramo",
    descripcion:
      "Recorrido vivencial por las plantas queseras comunitarias para conocer el proceso de ordeño en altura, cuajado artesanal y degustación guiada.",
    asociacion_cercana: "Asociación San Pedro",
    tipo: "Agroturismo & Gastronomía",
  },
  {
    id: "tur-mirador-carihuairazo",
    nombre: "Mirador Natural del Volcán Carihuairazo",
    descripcion:
      "Panorámica imponente de los valles interandinos de Tungurahua y senderos botánicos de frailejones y flora nativa de páramo.",
    asociacion_cercana: "Asociación Nueva Vida",
    tipo: "Paisajismo & Fotografía",
  },
];

// ============================================================
// 5. FUNCIONES ASÍNCRONAS DE CONSULTA (CAPA DE DATOS DESACOPLADA)
// ============================================================

/**
 * Obtiene todos los productos disponibles en catálogo.
 */
export async function getProducts(): Promise<Producto[]> {
  // Simulación asíncrona - listo para reemplazar por llamada a API/Supabase
  return Promise.resolve([...productosMock]);
}

/**
 * Obtiene un producto por su identificador.
 */
export async function getProductById(id: string): Promise<Producto | null> {
  const item = productosMock.find((p) => p.id === id);
  return Promise.resolve(item || null);
}

/**
 * Obtiene los productos destacados para la página de inicio.
 */
export async function getFeaturedProducts(): Promise<Producto[]> {
  const featured = productosMock.filter((p) => p.disponible).slice(0, 4);
  return Promise.resolve(featured);
}

/**
 * Obtiene todas las asociaciones productoras.
 */
export async function getAssociations(): Promise<Asociacion[]> {
  return Promise.resolve([...asociacionesMock]);
}

/**
 * Obtiene una asociación por su ID.
 */
export async function getAssociationById(id: string): Promise<Asociacion | null> {
  const item = asociacionesMock.find((a) => a.id === id);
  return Promise.resolve(item || null);
}

/**
 * Obtiene el listado de recetas tradicionales.
 */
export async function getRecipes(): Promise<Receta[]> {
  return Promise.resolve([...recetasMock]);
}

/**
 * Obtiene los atractivos turísticos comunitarios.
 */
export async function getTouristAttractions(): Promise<AtractivoTuristico[]> {
  return Promise.resolve([...atractivosMock]);
}
