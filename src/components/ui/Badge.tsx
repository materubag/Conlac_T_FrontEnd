import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "primary" | "secondary" | "tertiary" | "outline" | "highlight";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: "bg-primary text-inverted border-transparent",
  secondary: "bg-neutral text-inverted border-transparent",
  tertiary: "bg-tertiary text-neutral border-transparent font-semibold",
  outline: "bg-transparent text-primary border-primary border",
  highlight: "bg-neutral-light text-primary border-border font-semibold",
};

/**
 * Componente Badge para etiquetas editoriales, categorías, sellos y estados.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "highlight",
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-label uppercase tracking-wider transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
