import type { Asociacion } from "@/types";
import { Button } from "@/components/ui/Button";

interface AssociationMapPreviewProps {
  association: Asociacion;
}

export function AssociationMapPreview({ association }: AssociationMapPreviewProps) {
  const { nombre, lat, lng, ubicacion_referencia } = association;
  const hasCoordinates =
    typeof lat === "number" && Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    typeof lng === "number" && Number.isFinite(lng) && Math.abs(lng) <= 180;

  // Do not substitute missing coordinates with a different association's location.
  const coordinates = hasCoordinates ? `${lat},${lng}` : null;
  const bounds = hasCoordinates
    ? [Math.max(-180, lng - 0.015), Math.max(-90, lat - 0.01),
       Math.min(180, lng + 0.015), Math.min(90, lat + 0.01)].join(",")
    : null;

  return (
    <section className="min-w-0 space-y-4 border-t border-border pt-6">
      <h2 className="font-headline text-2xl font-bold text-primary">Ubicación</h2>
      {ubicacion_referencia && (
        <p className="break-words text-sm text-neutral-muted">{ubicacion_referencia}</p>
      )}
      {coordinates && bounds ? (
        <>
          <iframe
            title={`Mapa de ubicación de ${nombre}`}
            src={`https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({
              bbox: bounds, layer: "mapnik", marker: coordinates,
            })}`}
            className="h-64 w-full rounded-xl border border-border bg-neutral-light sm:h-80"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <p className="break-words text-xs text-neutral-muted">
            Coordenadas: {lat}, {lng}. Si el mapa no carga, abre la ubicación con los siguientes enlaces.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`}
              variant="outlined"
              isExternal
              className="group text-center"
            >
              <span className="text-primary group-hover:text-inverted">Abrir en Google Maps</span>
              <span className="sr-only"> (nueva pestaña)</span>
            </Button>
            <Button
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
              variant="outlined"
              isExternal
              className="group text-center"
            >
              <span className="text-primary group-hover:text-inverted">Abrir en OpenStreetMap</span>
              <span className="sr-only"> (nueva pestaña)</span>
            </Button>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-border bg-neutral-light/30 p-4 text-sm text-neutral-muted">
          La ubicación exacta de esta asociación todavía no está disponible.
        </p>
      )}
    </section>
  );
}
