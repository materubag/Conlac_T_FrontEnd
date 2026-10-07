export interface RecipeIngredient {
  item?: string;
  cantidad?: string;
  quantity?: string;
}

export interface RecipeStep {
  step?: number;
  instruction?: string;
}

export interface RecipeResponse {
  id: string;
  slug?: string;
  titulo: string;
  descripcion_corta?: string;
  tiempo_preparacion_minutos?: number;
  tiempo_prep?: number;
  porciones?: number;
  ingredientes?: Array<RecipeIngredient | string>;
  pasos?: Array<RecipeStep | string>;
  imagen_url?: string | null;
  is_published?: boolean;
  producto_slug?: string;
  tipo_queso?: string;
}

export interface RecipeDetailResponse extends RecipeResponse {}
