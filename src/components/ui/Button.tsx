import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonVariant, ButtonSize } from "@/types";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

type ButtonAsButtonProps = BaseButtonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLinkProps = BaseButtonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    isExternal?: boolean;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-inverted hover:bg-primary-hover hover:!text-white active:bg-primary-light shadow-sm focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
  secondary:
    "bg-neutral text-inverted hover:bg-neutral-muted active:opacity-90 shadow-sm focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
  outlined:
    "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:!text-white active:opacity-90 focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
  inverted:
    "bg-inverted text-primary hover:bg-neutral-light active:opacity-90 shadow-sm focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-primary hover:bg-neutral-light/60 active:bg-neutral-light focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3.5 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base font-semibold rounded-xl gap-2.5",
};

/**
 * Componente Botón reutilizable y accesible que soporta variantes semánticas
 * y se renderiza como botón nativo o enlace según la presencia de `href`.
 */
export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(
  {
    variant = "primary",
    size = "md",
    children,
    className,
    fullWidth = false,
    ...props
  },
  ref
) {
  const commonClasses = cn(
    "inline-flex items-center justify-center font-label transition-all duration-200 cursor-pointer select-none",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className
  );

  if ("href" in props && typeof props.href === "string") {
    const { href, isExternal, ...anchorProps } = props as ButtonAsLinkProps;
    if (isExternal || href.startsWith("http") || href.startsWith("https") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={commonClasses}
          target={isExternal || href.startsWith("http") ? "_blank" : undefined}
          rel={isExternal || href.startsWith("http") ? "noopener noreferrer" : undefined}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        className={commonClasses}
        {...anchorProps}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButtonProps;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={buttonProps.type || "button"}
      className={commonClasses}
      {...buttonProps}
    >
      {children}
    </button>
  );
});
