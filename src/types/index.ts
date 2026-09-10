/**
 * ============================================================
 * CONTRATO DE DATOS Y TIPOS TYPESCRIPT - CONLAC-T
 * Consorcio de Lácteos de Tungurahua (Pilahuín, Ecuador)
 * ============================================================
 */

// ============================================================
// 1. CONTRATOS DE DOMINIO / BACKEND
// (No modificar nombres de campos para garantizar compatibilidad futura con Supabase/API)
// ============================================================

export interface Producto {
  id: string;
  nombre: string;
  tipo_queso?: string;
  peso?: string;
  precio: number;
  fotos: string[];
  asociacion?: string;
  stock: number;
  disponible: boolean;
}

export interface Asociacion {
  id: string;
  nombre: string;
  historia?: string;
  fotos: string[];
  video_url?: string;
  sello_sanitario?: string;
  lat?: number;
  lng?: number;
}

export interface Receta {
  id: string;
  titulo: string;
  pasos: string[];
  producto_slug?: string;
  tipo_queso?: string;
  tiempo_prep?: number;
}

export interface AtractivoTuristico {
  id: string;
  nombre: string;
  descripcion?: string;
  asociacion_cercana?: string;
  tipo?: string;
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
