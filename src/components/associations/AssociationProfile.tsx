import React from "react";
import Image from "next/image";
import { Asociacion, Producto } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArcsaBadge } from "@/components/ui/ArcsaBadge";
import { ProductCard } from "@/components/home/ProductCard";
import { AssociationMapPreview } from "@/components/associations/AssociationMapPreview";
import { MapPinIcon, UsersIcon, MountainIcon, ClockIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl, getVideoEmbedUrl } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

interface AssociationProfileProps {
  association: Asociacion;
  products: Producto[];
}

export const AssociationProfile: React.FC<AssociationProfileProps> = ({
  association,
  products,
}) => {
  const embedUrl = getVideoEmbedUrl(association.video_url);
  const whatsappPhone = association.redes_sociales?.whatsapp || association.contacto_asociacion;
  const whatsappUrl = buildWhatsAppUrl({
    phone: whatsappPhone,
    associationName: association.nombre,
  });
  const fotosValidas = association.fotos.filter((foto) => foto && foto.trim().length > 0);
  const gallery = fotosValidas.length > 0
    ? fotosValidas
    : ["/placeholders/association-placeholder.svg"];

  const fichaTecnica = [
    association.numero_familias && {
      icon: UsersIcon,
      label: "Familias",
      value: `${association.numero_familias}`,
    },
    association.altitud_msnm && {
      icon: MountainIcon,
      label: "Altitud",
      value: `${association.altitud_msnm.toLocaleString("es-EC")} msnm`,
    },
    association.horario_atencion && {
      icon: ClockIcon,
      label: "Atención",
      value: association.horario_atencion,
    },
    (association.sello_arcsa || association.registro_bpm || association.sello_sanitario) && {
      icon: MapPinIcon,
      label: "Registro Sanitario",
      value: association.sello_arcsa || association.registro_bpm || association.sello_sanitario || "",
    },
  ].filter(Boolean) as { icon: typeof UsersIcon; label: string; value: string }[];

  return (
    <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-border space-y-10">
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
        <Image
          src={gallery[0]}
          alt={`Fotografía principal de ${association.nombre}`}
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="space-y-4 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <ArcsaBadge
            selloArcsa={association.sello_arcsa}
            registroBpm={association.registro_bpm}
            selloSanitario={association.sello_sanitario}
          />
          <Badge variant="tertiary">Comunidad Productora</Badge>
        </div>

        <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
          {association.nombre}
        </h1>

        {association.historia && (
          <p className="text-base sm:text-lg text-neutral-muted leading-relaxed">
            {association.historia}
          </p>
        )}

        <div className="pt-2 flex items-center gap-2 text-sm text-neutral-muted">
          <MapPinIcon className="w-4 h-4 text-tertiary shrink-0" />
          <span>{association.ubicacion_referencia || siteConfig.location.address}</span>
        </div>
      </div>

      {fichaTecnica.length > 0 && (
        <div className="pt-6 border-t border-border">
          <h2 className="font-headline text-xl font-bold text-primary mb-5">
            Ficha Técnica
          </h2>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {fichaTecnica.map((item) => (
              <div
                key={item.label}
                className="flex flex-col gap-1.5 rounded-xl bg-neutral-light/50 border border-border p-4"
              >
                <dt className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wider text-neutral-muted">
                  <item.icon className="w-4 h-4 text-tertiary shrink-0" />
                  {item.label}
                </dt>
                <dd className="font-headline text-base sm:text-xl font-bold text-primary break-words">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {gallery.length > 1 && (
        <div className="pt-6 border-t border-border">
          <h2 className="font-headline text-xl font-bold text-primary mb-5">
            Galería
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((foto, index) => (
              <div
                key={`${association.id}-foto-${index}`}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-light/50"
              >
                <Image
                  src={foto}
                  alt={`Fotografía ${index + 1} de ${association.nombre}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover object-center"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {embedUrl && (
        <div className="pt-6 border-t border-border">
          <h2 className="font-headline text-xl font-bold text-primary mb-5">
            Conoce a la Asociación
          </h2>
          <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-neutral">
            <iframe
              src={embedUrl}
              title={`Video institucional de ${association.nombre}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="pt-6 border-t border-border">
          <h2 className="font-headline text-xl font-bold text-primary mb-5">
            Productos de {association.nombre}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      <AssociationMapPreview association={association} />

      <div className="pt-6 border-t border-border flex flex-wrap items-center gap-4">
        <Button href={whatsappUrl} variant="primary" isExternal>
          Escribir por WhatsApp
        </Button>
        <Button href={`/tienda?asociacion=${association.id}`} variant="outlined">
          Ver quesos de esta asociación
        </Button>
        <Button href="/asociaciones" variant="ghost">
          Volver a asociaciones
        </Button>
      </div>
    </div>
  );
};
