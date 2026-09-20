import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheckIcon } from "@/components/ui/Icons";

interface ArcsaBadgeProps {
  selloArcsa?: string;
  registroBpm?: string;
  selloSanitario?: string;
  className?: string;
  compact?: boolean;
}

export const ArcsaBadge: React.FC<ArcsaBadgeProps> = ({
  selloArcsa,
  registroBpm,
  selloSanitario,
  className,
  compact = false,
}) => {
  const codigoPrincipal = selloArcsa || selloSanitario;

  if (!codigoPrincipal) return null;

  const detalles = [
    selloArcsa && `ARCSA: ${selloArcsa}`,
    registroBpm && `BPM: ${registroBpm}`,
    !selloArcsa && selloSanitario && `Sello Sanitario: ${selloSanitario}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-transparent bg-primary px-3 py-1 text-xs font-label font-semibold uppercase tracking-wider text-inverted shadow-sm",
        className
      )}
      title={`Registro sanitario verificado — ${detalles}`}
    >
      <ShieldCheckIcon className="w-3.5 h-3.5 shrink-0 text-tertiary" />
      {!compact && <span className="hidden sm:inline">Sello Sanitario</span>}
      <span className="truncate max-w-[10rem] sm:max-w-none">{codigoPrincipal}</span>
    </span>
  );
};
