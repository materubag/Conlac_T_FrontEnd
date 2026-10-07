/**
 * ============================================================
 * CONTRATO DE DATOS Y TIPOS TYPESCRIPT - CONLAC-T
 * Consorcio de Lácteos de Tungurahua (Pilahuín, Ecuador)
 * ============================================================
 */

// ============================================================
// 1. CONTRATOS DE DOMINIO / BACKEND
// (Estructura base alineada con las entidades del Backend / Supabase)
// ============================================================

export interface PresentacionProducto {
  id: string; // UUID de variante
  sku?: string;
  nombre_presentacion?: string;
  peso_gramos?: number;
  precio: number;
  stock: number;
  is_low_stock?: boolean;
}

export interface Producto {
  id: string;
  nombre: string;
  slug?: string;
  tipo_queso?: string;
  peso?: string;
  precio: number;
  fotos: string[];
  asociacion?: string;       // Nombre de la asociación (retrocompatibilidad)
  asociacion_id?: string;    // ID de la asociación (relación products.association_id -> associations.id)
  stock: number;
  disponible: boolean;
  presentaciones?: PresentacionProducto[];
  variante_id?: string;
}
export interface Asociacion {
  id: string;
  slug?: string;

  nombre: string;
  descripcion_corta?: string;
  historia?: string;

  ubicacion?: string;
  ubicacion_referencia?: string;

  fotos: string[];

  video_url?: string;

  sello_sanitario?: string;
  registro_arcsa?: string;
  sello_arcsa?: string;
  registro_agrocalidad?: string;
  registro_bpm?: string;

  lat?: number;
  lng?: number;

  whatsapp?: string;
  contacto_asociacion?: string;

  instagram_url?: string;
  tiktok_url?: string;
  facebook_url?: string;

  redes_sociales?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
  };

  numero_familias?: number;
  altitud_msnm?: number;
  horario_atencion?: string;

  productos_ids?: string[];

  is_published?: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface Testimonial {
  id: string;
  autor_nombre: string;
  autor_tipo?: string;
  frase: string;
  fecha?: string;
  avatar_url?: string | null;
  calificacion?: number | null;
  is_featured?: boolean;
}

export interface IngredienteReceta {
  item: string;
  quantity?: string;
}

export interface PasoReceta {
  step: number;
  instruction: string;
}

export interface Receta {
  id: string;
  slug?: string;
  titulo: string;
  descripcion_corta?: string;
  tiempo_preparacion_minutos?: number;
  porciones?: number;
  ingredientes?: Array<IngredienteReceta | string>;
  pasos: Array<PasoReceta | string>;
  imagen_url?: string | null;
  is_published?: boolean;
  producto_slug?: string;
  tipo_queso?: string;
  tiempo_prep?: number;
}

export interface AtractivoTuristico {
  id: string;
  nombre: string;
  descripcion?: string;
  asociacion_cercana?: string;
  asociacion_id?: string;
  tipo?: string;
  lat?: number;
  lng?: number;
  requiere_confirmacion?: boolean;
  condiciones_acceso?: string;
  foto_url?: string | null;
}

export interface ContactMessageRequest {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
  privacy_accepted: boolean;
}

export interface ContactMessageResponse {
  id: string;
  status: string;
  message: string;
}

export interface CartItem {
  id: string; // Clave de carrito (producto + variante cuando corresponda)
  producto_id?: string;
  variante_id?: string; // UUID de la variante/presentación requerida por el backend
  slug?: string;
  nombre: string;
  precio: number;
  cantidad: number;
  stock: number;
  imagen: string;
  peso?: string;
  asociacion?: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  description?: string;
  delivery_fee: number;
  delivery_days_text?: string;
  is_active: boolean;
}

export interface CustomerDto {
  nombre: string;
  cedula_ruc: string;
  telefono: string;
  email?: string;
  direccion?: string;
}

export interface OrderItemRequest {
  producto_id?: string;
  variante_id: string;
  cantidad: number;
  precio_unitario?: number;
}

export interface OrderCreateRequest {
  cliente: CustomerDto;
  metodo_entrega: "delivery" | "pickup";
  zona_envio_id?: string;
  direccion_entrega?: string;
  metodo_pago: "transferencia" | "payphone";
  notas_cliente?: string;
  items: OrderItemRequest[];
}

export interface OrderCreateResponse {
  id: string;
  numero_pedido: number;
  subtotal: number;
  flete: number;
  total: number;
  estado: string;
  metodo_pago: string;
  payphone_url?: string | null;
  reserva_expira_en?: string | null;
}

export interface ItemPedido {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: string;
  cliente: string;
  items: ItemPedido[];
  subtotal: number;
  flete: number;
  total: number;
  metodo_pago: string;
  estado: string;
}

// ============================================================
// 2. TIPOS EXCLUSIVOS DE UI / VIEWMODEL
// (Aislados para no contaminar los contratos de datos del dominio)
// ============================================================

export interface NavigationItem {
  name: string;
  href: string;
  description?: string;
  isExternal?: boolean;
}

export interface EditorialTag {
  text: string;
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "highlight";
}

export interface ProductCardProps {
  product: Producto;
  editorialTag?: EditorialTag;
  priorityImage?: boolean;
  className?: string;
}

export type ButtonVariant = "primary" | "secondary" | "outlined" | "inverted" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ThemeConfig {
  primary: string;
  primaryHover: string;
  background: string;
  surface: string;
  tertiary: string;
  tertiaryHover: string;
  neutral: string;
  neutralMuted: string;
  neutralLight: string;
  border: string;
  inverted: string;
  headlineFont: string;
  bodyFont: string;
  labelFont: string;
}

// ============================================================
// 3. TIPOS DE AUTENTICACIÓN Y PERFIL DE USUARIO
// ============================================================

export type UserRole = "admin" | "customer";

export interface UserProfile {
  id: string; // UUID de auth.users / profiles
  full_name: string;
  role: UserRole;
  is_active: boolean;
  email?: string;
  phone?: string;
  tax_id?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// 4. TIPOS DE ASOCIACIONES (ADMINISTRACIÓN Y CRUD)
// ============================================================

export interface AssociationFormData {
  slug: string;
  name: string;
  shortDescription: string;
  history: string;

  locationText: string;
  latitude: string;
  longitude: string;

  arcsaRegistration: string;
  agrocalidadRegistration: string;
  sanitarySealText: string;

  videoUrl: string;

  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  whatsapp: string;

  isPublished: boolean;
}

export interface AssociationResponse {
  id: string;

  slug: string;
  nombre: string;
  descripcion_corta?: string;
  historia?: string;

  ubicacion?: string;
  ubicacion_referencia?: string;

  fotos?: string[];

  video_url?: string;

  sello_sanitario?: string;
  registro_arcsa?: string;
  registro_agrocalidad?: string;

  lat?: number;
  lng?: number;

  whatsapp?: string;

  instagram_url?: string;
  tiktok_url?: string;
  facebook_url?: string;

  is_published: boolean;

  created_at: string;
  updated_at: string;
}

export interface CreateAssociationRequest {
  slug: string;
  name: string;
  shortDescription?: string;
  history?: string;

  locationText?: string;
  latitude?: number;
  longitude?: number;

  arcsaRegistration?: string;
  agrocalidadRegistration?: string;
  sanitarySealText?: string;

  videoUrl?: string;

  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  whatsapp?: string;

  isPublished: boolean;
}

