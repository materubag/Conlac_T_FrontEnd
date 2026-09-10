import { ThemeConfig } from "@/types";

/**
 * ============================================================
 * SISTEMA DE DISEÑO / DESIGN TOKENS - CONLAC-T
 * Consorcio de Lácteos de Tungurahua
 * ============================================================
 * 
 * Identidad visual definitiva:
 * - Color 1 (Primary): #184332 -> Principal: marca, botones primarios, títulos, navegación activa
 * - Color 2 (Background): #F8F4E9 -> Superficie base y fondos claros cálidos
 * - Tertiary: #D4A373 -> Acentos visuales, detalles dorados/tostados, estados destacados
 * - Neutral: #4A3728 -> Tipografía principal oscura, iconografía y secundarios
 */

export const DEFAULT_THEME: ThemeConfig = {
  primary: "#184332",
  primaryHover: "#123427",
  background: "#F8F4E9",
  surface: "#FFFFFF",
  tertiary: "#D4A373",
  tertiaryHover: "#C58F5E",
  neutral: "#4A3728",
  neutralMuted: "#7A624E",
  neutralLight: "#F0E8D9",
  border: "#E2D7C3",
  inverted: "#FFFFFF",
  headlineFont: "var(--font-headline)",
  bodyFont: "var(--font-body)",
  labelFont: "var(--font-label)",
};

/**
 * Aplica tokens de diseño en tiempo de ejecución (Runtime Theme).
 * Permite que un futuro panel administrativo o backend modifique
 * los colores y tipografías dinámicamente sin reconstruir la aplicación.
 */
export function applyTheme(theme: Partial<ThemeConfig>): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (theme.primary) root.style.setProperty("--theme-color-primary", theme.primary);
  if (theme.primaryHover) root.style.setProperty("--theme-color-primary-hover", theme.primaryHover);
  if (theme.background) root.style.setProperty("--theme-color-background", theme.background);
  if (theme.surface) root.style.setProperty("--theme-color-background-surface", theme.surface);
  if (theme.tertiary) root.style.setProperty("--theme-color-tertiary", theme.tertiary);
  if (theme.tertiaryHover) root.style.setProperty("--theme-color-tertiary-hover", theme.tertiaryHover);
  if (theme.neutral) root.style.setProperty("--theme-color-neutral", theme.neutral);
  if (theme.neutralMuted) root.style.setProperty("--theme-color-neutral-muted", theme.neutralMuted);
  if (theme.neutralLight) root.style.setProperty("--theme-color-neutral-light", theme.neutralLight);
  if (theme.border) root.style.setProperty("--theme-color-border", theme.border);
  if (theme.inverted) root.style.setProperty("--theme-color-inverted", theme.inverted);
}
