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
}

export interface Asociacion {
  id: string;
  nombre: string;
  slug?: string;
  historia?: string;
  fotos: string[];
  video_url?: string;
  sello_sanitario?: string;
  lat?: number;
  lng?: number;

  // Nuevos campos para Sprint 3 (preparados para integración con Backend):
  sello_arcsa?: string;
  registro_bpm?: string;
  numero_familias?: number;
  altitud_msnm?: number;
  productos_ids?: string[];
  horario_atencion?: string;
  contacto_asociacion?: string;
  ubicacion_referencia?: string;
  redes_sociales?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    whatsapp?: string;
  };
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
  id: string; // ID del producto
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
