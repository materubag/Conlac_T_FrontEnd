export type HomeSectionKey = "hero" | "products" | "trust" | "access" | "testimonials";

export interface HomeSectionText {
  eyebrow: string;
  title: string;
  description: string;
}

export interface HomeContent {
  hidden_sections?: Partial<Record<HomeSectionKey, boolean>>;
  hero_accent: string;
  hero_primary_label: string;
  hero_whatsapp_label: string;
  hero_whatsapp_message: string;
  hero_claims: string[];
  products: HomeSectionText & { link_label: string; empty: string };
  trust: HomeSectionText & { pillars: { id?: string; title: string; description: string }[] };
  access: HomeSectionText & { link_label: string };
  testimonials: HomeSectionText & { empty: string };
}

export interface HomeAccessCard {
  key: "asociaciones" | "recetas" | "turismo";
  href: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string | null;
  count: number;
}

export interface HomeTestimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating?: number;
}
