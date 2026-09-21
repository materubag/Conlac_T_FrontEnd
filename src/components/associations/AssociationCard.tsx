import React from "react";
import Image from "next/image";
import { Asociacion } from "@/types";
import { Button } from "@/components/ui/Button";
import { ArcsaBadge } from "@/components/ui/ArcsaBadge";
import { ArrowRightIcon, ShieldCheckIcon } from "@/components/ui/Icons";

interface AssociationCardProps {
  association: Asociacion;
  priorityImage?: boolean;
  className?: string;
}

export const AssociationCard: React.FC<AssociationCardProps> = ({
  association,
  priorityImage = false,
  className,
}) => {
  return (
    <article
      className={`flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border border-border p-6 sm:p-8 shadow-sm hover:border-tertiary/70 transition-all ${className || ""}`}
      aria-labelledby={`association-title-${association.id}`}
    >
      <div className="space-y-4">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
          <Image
            src={association.fotos[0] || "/placeholders/association-placeholder.svg"}
            alt={`Planta y comunidad de ${association.nombre}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
            priority={priorityImage}
          />
          <div className="absolute top-3 right-3">
            <ArcsaBadge
              selloArcsa={association.sello_arcsa}
              registroBpm={association.registro_bpm}
              selloSanitario={association.sello_sanitario}
              compact
            />
          </div>
        </div>

        <h2
          id={`association-title-${association.id}`}
          className="font-headline text-2xl font-bold text-primary"
        >
          {association.nombre}
        </h2>

        {association.historia && (
          <p className="text-sm text-neutral-muted leading-relaxed line-clamp-4">
            {association.historia}
          </p>
        )}

        {(association.numero_familias || association.altitud_msnm) && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-label text-neutral-muted">
            {association.numero_familias && (
              <span>
                <strong className="text-primary">{association.numero_familias}</strong> familias
              </span>
            )}
            {association.altitud_msnm && (
              <span>
                <strong className="text-primary">{association.altitud_msnm.toLocaleString("es-EC")} msnm</strong>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
          <ShieldCheckIcon className="w-4 h-4 text-tertiary" />
          <span>Socio Fundador CONLAC-T</span>
        </div>

        <Button
          href={`/asociaciones/${association.slug || association.id}`}
          variant="outlined"
          size="sm"
          aria-label={`Ver perfil completo de ${association.nombre}`}
        >
          <span>Ver perfil</span>
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </Button>
      </div>
    </article>
  );
};
