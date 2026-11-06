"use client";
import { adminFetch, mensajeDeError } from "@/lib/adminFetch";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { AdminPageBar, AdminBadgeHelp } from "@/components/admin/AdminPageBar";
import { EditableField } from "@/components/admin/EditableField";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/home/ProductCard";
import { MapPinIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl, getVideoEmbedUrl } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import type { Asociacion, Producto } from "@/types";

export interface CampoFicha {
  id: string;
  label: string;
  value: string;
}

interface AssociationDetailManagerProps {
  slug: string;
  initialAssociation: Asociacion;
  products: Producto[];
}

export function AssociationDetailManager({
  slug,
  initialAssociation,
  products,
}: AssociationDetailManagerProps) {
  const { isAdmin } = useAuth();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [assoc, setAssoc] = useState<Asociacion>(initialAssociation);

  // Campos dinámicos de información (ficha)
  const [camposFicha, setCamposFicha] = useState<CampoFicha[]>(() => {
    if (Array.isArray(initialAssociation.campos_ficha) && initialAssociation.campos_ficha.length > 0) {
      return initialAssociation.campos_ficha;
    }
    return [
      { id: "familias", label: "Familias", value: `${initialAssociation.numero_familias || 24}` },
      {
        id: "altitud",
        label: "Altitud",
        value: `${initialAssociation.altitud_msnm ? initialAssociation.altitud_msnm.toLocaleString("es-EC") + " msnm" : "3.400 msnm"}`,
      },
      {
        id: "horario",
        label: "Atención",
        value: initialAssociation.horario_atencion || "Lunes a Viernes: 07h00 - 16h00",
      },
      {
        id: "registro",
        label: "Registro Sanitario",
        value:
          initialAssociation.sello_arcsa ||
          initialAssociation.registro_bpm ||
          initialAssociation.sello_sanitario ||
          "ARCSA-BPM-TUN-00124",
      },
    ];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetPhotoIndexRef = useRef<number | "main" | "new">("main");

  const marcarCambio = () => setIsDirty(true);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const payload: Asociacion = {
        ...assoc,
        campos_ficha: camposFicha,
      };

      const res = await adminFetch(`/api/admin/paginas/asoc-${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: "Comunidad Productora",
          titulo: payload.nombre,
          subtitulo: payload.ubicacion_referencia || "",
          contenido: payload,
        }),
      });

      if (!res.ok) throw new Error(await mensajeDeError(res, "Error al guardar"));
      setIsDirty(false);
      mostrarToast("Información de la asociación guardada");
    } catch (err) {
      console.error(err);
      mostrarToast(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const abrirSelectorFoto = (target: number | "main" | "new") => {
    targetPhotoIndexRef.current = target;
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = targetPhotoIndexRef.current;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const fotosActuales = [...(assoc.fotos || [])];

      if (target === "main") {
        if (fotosActuales.length > 0) {
          fotosActuales[0] = dataUrl;
        } else {
          fotosActuales.push(dataUrl);
        }
      } else if (target === "new") {
        fotosActuales.push(dataUrl);
      } else if (typeof target === "number") {
        fotosActuales[target] = dataUrl;
      }

      setAssoc({ ...assoc, fotos: fotosActuales });
      marcarCambio();
      mostrarToast("Fotografía actualizada");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const eliminarFotoGaleria = (idx: number) => {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    const nuevasFotos = assoc.fotos.filter((_, i) => i !== idx);
    setAssoc({ ...assoc, fotos: nuevasFotos });
    marcarCambio();
    mostrarToast("Foto eliminada");
  };

  // Manejo de campos dinámicos
  const agregarCampoFicha = () => {
    const nuevo: CampoFicha = {
      id: `campo-${Date.now()}`,
      label: "Nuevo Dato",
      value: "Detalle o valor",
    };
    const nuevosCampos = [...camposFicha, nuevo];
    setCamposFicha(nuevosCampos);
    setAssoc({ ...assoc, campos_ficha: nuevosCampos });
    marcarCambio();
    mostrarToast("Campo añadido");
  };

  const eliminarCampoFicha = (idx: number) => {
    const campo = camposFicha[idx];
    if (!confirm(`¿Eliminar el campo "${campo.label}"?`)) return;
    const nuevosCampos = camposFicha.filter((_, i) => i !== idx);
    setCamposFicha(nuevosCampos);
    setAssoc({ ...assoc, campos_ficha: nuevosCampos });
    marcarCambio();
    mostrarToast("Campo eliminado");
  };

  // Cálculo de coordenadas de mapa
  const latNum = typeof assoc.lat === "number" ? assoc.lat : parseFloat(String(assoc.lat)) || -1.2985;
  const lngNum = typeof assoc.lng === "number" ? assoc.lng : parseFloat(String(assoc.lng)) || -78.7123;
  const hasCoordinates =
    Number.isFinite(latNum) && Math.abs(latNum) <= 90 &&
    Number.isFinite(lngNum) && Math.abs(lngNum) <= 180;

  const coordinates = hasCoordinates ? `${latNum},${lngNum}` : null;
  const bounds = hasCoordinates
    ? [
        Math.max(-180, lngNum - 0.015),
        Math.max(-90, latNum - 0.01),
        Math.min(180, lngNum + 0.015),
        Math.min(90, latNum + 0.01),
      ].join(",")
    : null;

  const embedUrl = getVideoEmbedUrl(assoc.video_url);
  const whatsappPhone = assoc.redes_sociales?.whatsapp || assoc.contacto_asociacion;
  const whatsappUrl = buildWhatsAppUrl({
    phone: whatsappPhone,
    associationName: assoc.nombre,
  });

  const fotosValidas = (assoc.fotos || []).filter((foto) => foto && foto.trim().length > 0);
  const gallery = fotosValidas.length > 0
    ? fotosValidas
    : ["/placeholders/association-placeholder.svg"];

  return (
    <div className="relative min-h-screen bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleArchivoSeleccionado}
        className="hidden"
      />

      {isAdmin && (
        <AdminPageBar
          pageName={assoc.nombre}
          isEditing={modoEdicion}
          setIsEditing={setModoEdicion}
          isDirty={isDirty}
          isSaving={isSaving}
          onGuardar={guardarCambios}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111c17] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <div className="bg-surface rounded-2xl p-6 sm:p-10 border border-border space-y-10 my-4 shadow-sm">
        {/* Banner de ayuda admin */}
        {isAdmin && modoEdicion && (
          <div className="mb-2">
            <AdminBadgeHelp message="Puedes editar en vivo la historia, añadir o quitar campos informativos, ajustar las coordenadas del mapa y cambiar fotos de portada o galería." />
          </div>
        )}

        {/* 1. Fotografía de Portada */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl bg-neutral-light/50">
          <Image
            src={gallery[0]}
            alt={`Fotografía principal de ${assoc.nombre}`}
            fill
            className="object-cover object-center"
            priority
            unoptimized={gallery[0].startsWith("data:")}
          />

          {isAdmin && modoEdicion && (
            <button
              type="button"
              onClick={() => abrirSelectorFoto("main")}
              className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111c17]/90 text-white text-xs font-bold hover:bg-[#111c17] backdrop-blur-xs transition shadow-md active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Cambiar foto de portada</span>
            </button>
          )}
        </div>

        {/* 2. Encabezado e Historia */}
        <div className="space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="tertiary">Comunidad Productora</Badge>
          </div>

          <div>
            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={assoc.nombre}
              onChange={(val) => {
                setAssoc({ ...assoc, nombre: val });
                marcarCambio();
              }}
              label="Nombre de la asociación"
              className="font-headline text-3xl sm:text-4xl font-bold text-primary"
              renderStatic={() => (
                <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
                  {assoc.nombre}
                </h1>
              )}
            />
          </div>

          <div>
            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={assoc.historia || ""}
              onChange={(val) => {
                setAssoc({ ...assoc, historia: val });
                marcarCambio();
              }}
              label="Historia y trayectoria comunitaria"
              className="text-base sm:text-lg text-neutral-muted leading-relaxed"
              renderStatic={() => (
                <p className="text-base sm:text-lg text-neutral-muted leading-relaxed">
                  {assoc.historia}
                </p>
              )}
              placeholder="Escribe la historia comunitaria..."
            />
          </div>

          <div className="pt-2 flex items-center gap-2 text-sm text-neutral-muted">
            <MapPinIcon className="w-4 h-4 text-tertiary shrink-0" />
            <div className="flex-1">
              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={assoc.ubicacion_referencia || siteConfig.location.address}
                onChange={(val) => {
                  setAssoc({ ...assoc, ubicacion_referencia: val });
                  marcarCambio();
                }}
                label="Ubicación y referencia territorial"
                className="text-sm text-neutral-muted"
                renderStatic={() => (
                  <span>{assoc.ubicacion_referencia || siteConfig.location.address}</span>
                )}
              />
            </div>
          </div>
        </div>

        {/* 3. Campos Informativos Dinámicos (Ficha) */}
        <div className="pt-6 border-t border-border">
          {/* Controles para añadir campos (solo visible para admin en modo edición) */}
          {isAdmin && modoEdicion && (
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-tertiary uppercase tracking-wider">
                Campos informativos de la asociación
              </span>
              <button
                type="button"
                onClick={agregarCampoFicha}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-dashed border-tertiary hover:border-primary text-tertiary hover:text-primary text-xs font-bold transition shadow-2xs hover:bg-primary/5"
              >
                <span className="text-sm">+</span>
                <span>Añadir campo</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {camposFicha.map((campo, idx) => (
              <div
                key={campo.id || idx}
                className={`relative flex flex-col justify-between gap-1.5 rounded-xl bg-neutral-light/50 border p-4 transition-all ${
                  isAdmin && modoEdicion
                    ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500"
                    : "border-border"
                }`}
              >
                {isAdmin && modoEdicion && (
                  <button
                    type="button"
                    onClick={() => eliminarCampoFicha(idx)}
                    title="Eliminar este campo"
                    className="absolute top-2 right-2 w-6 h-6 rounded-full text-neutral-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}

                <div className="text-xs font-label uppercase tracking-wider text-neutral-muted">
                  <EditableField
                    isEditing={isAdmin && modoEdicion}
                    value={campo.label}
                    onChange={(val) => {
                      const copy = [...camposFicha];
                      copy[idx].label = val;
                      setCamposFicha(copy);
                      setAssoc({ ...assoc, campos_ficha: copy });
                      marcarCambio();
                    }}
                    label="Nombre del dato"
                    className="text-xs font-label uppercase tracking-wider text-neutral-muted font-bold"
                  />
                </div>

                <div className="font-headline text-base sm:text-lg font-bold text-primary break-words">
                  <EditableField
                    isEditing={isAdmin && modoEdicion}
                    value={campo.value}
                    onChange={(val) => {
                      const copy = [...camposFicha];
                      copy[idx].value = val;
                      setCamposFicha(copy);
                      setAssoc({ ...assoc, campos_ficha: copy });
                      marcarCambio();
                    }}
                    label="Valor o detalle"
                    className="font-headline text-base sm:text-lg font-bold text-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Galería Fotográfica */}
        <div className="pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline text-xl font-bold text-primary">
              Galería Comunitaria
            </h2>
            {isAdmin && modoEdicion && (
              <button
                type="button"
                onClick={() => abrirSelectorFoto("new")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-dashed border-tertiary text-tertiary hover:border-primary hover:text-primary text-xs font-bold transition"
              >
                <span>+ Añadir foto a galería</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {gallery.map((foto, index) => (
              <div
                key={`${assoc.id}-foto-${index}`}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-light/50 group"
              >
                <Image
                  src={foto}
                  alt={`Fotografía ${index + 1} de ${assoc.nombre}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover object-center"
                  unoptimized={foto.startsWith("data:")}
                />

                {isAdmin && modoEdicion && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => abrirSelectorFoto(index)}
                      className="px-2.5 py-1 rounded-md bg-white text-[#111c17] text-[11px] font-bold shadow-md hover:bg-neutral-100"
                    >
                      Cambiar
                    </button>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => eliminarFotoGaleria(index)}
                        className="px-2 py-1 rounded-md bg-red-600 text-white text-[11px] font-bold shadow-md hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Video Institucional (Solo se muestra a visitantes si hay un enlace válido) */}
        {(embedUrl || (isAdmin && modoEdicion)) && (
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-headline text-xl font-bold text-primary">
                Conoce a la Asociación
              </h2>
              {isAdmin && modoEdicion && !embedUrl && (
                <span className="text-xs text-neutral-muted italic bg-neutral-light/60 px-2.5 py-0.5 rounded-md">
                  Oculto para visitantes (sin enlace de video)
                </span>
              )}
            </div>

            {isAdmin && modoEdicion && (
              <div className="mb-4 max-w-lg">
                <label className="text-xs font-semibold text-neutral-muted block mb-1">
                  Enlace de YouTube del video institucional (deja vacío para no mostrar):
                </label>
                <EditableField
                  isEditing={true}
                  value={assoc.video_url || ""}
                  onChange={(val) => {
                    setAssoc({ ...assoc, video_url: val });
                    marcarCambio();
                  }}
                  label="URL de YouTube"
                  className="text-xs text-neutral font-mono"
                  placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                />
              </div>
            )}

            {embedUrl ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-sm">
                <iframe
                  src={embedUrl}
                  title={`Video institucional de ${assoc.nombre}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            ) : null}
          </div>
        )}

        {/* 6. Productos elaborados por esta asociación */}
        {products.length > 0 && (
          <div className="pt-6 border-t border-border">
            <h2 className="font-headline text-xl font-bold text-primary mb-5">
              Productos de {assoc.nombre}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* 7. Ubicación y Mapa Editable */}
        <section className="min-w-0 space-y-4 border-t border-border pt-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-headline text-2xl font-bold text-primary">Ubicación</h2>
            {isAdmin && modoEdicion && (
              <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full font-semibold">
                📍 Edición de Coordenadas
              </span>
            )}
          </div>

          {/* Formulario de coordenadas en modo edición */}
          {isAdmin && modoEdicion && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3">
              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>¿Cómo cambiar la ubicación del mapa?</strong> Ingresa la Latitud y Longitud exacta (puedes obtenerlas en Google Maps haciendo clic derecho sobre la ubicación deseada).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                    Latitud (ej: -1.298500):
                  </label>
                  <EditableField
                    isEditing={true}
                    value={String(assoc.lat ?? -1.2985)}
                    onChange={(val) => {
                      const num = parseFloat(val);
                      setAssoc({ ...assoc, lat: isNaN(num) ? 0 : num });
                      marcarCambio();
                    }}
                    label="Latitud"
                    className="font-mono text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                    Longitud (ej: -78.712300):
                  </label>
                  <EditableField
                    isEditing={true}
                    value={String(assoc.lng ?? -78.7123)}
                    onChange={(val) => {
                      const num = parseFloat(val);
                      setAssoc({ ...assoc, lng: isNaN(num) ? 0 : num });
                      marcarCambio();
                    }}
                    label="Longitud"
                    className="font-mono text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {assoc.ubicacion_referencia && (
            <p className="break-words text-sm text-neutral-muted">{assoc.ubicacion_referencia}</p>
          )}

          {coordinates && bounds ? (
            <>
              <iframe
                title={`Mapa de ubicación de ${assoc.nombre}`}
                src={`https://www.openstreetmap.org/export/embed.html?${new URLSearchParams({
                  bbox: bounds,
                  layer: "mapnik",
                  marker: coordinates,
                })}`}
                className="h-64 w-full rounded-xl border border-border bg-neutral-light sm:h-80 shadow-2xs"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <p className="break-words text-xs text-neutral-muted">
                Coordenadas registradas: {latNum}, {lngNum}.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`}
                  variant="outlined"
                  isExternal
                  className="group text-center"
                >
                  <span className="text-primary group-hover:text-inverted">Abrir en Google Maps</span>
                </Button>
                <Button
                  href={`https://www.openstreetmap.org/?mlat=${latNum}&mlon=${lngNum}#map=15/${latNum}/${lngNum}`}
                  variant="outlined"
                  isExternal
                  className="group text-center"
                >
                  <span className="text-primary group-hover:text-inverted">Abrir en OpenStreetMap</span>
                </Button>
              </div>
            </>
          ) : (
            <p className="rounded-xl border border-border bg-neutral-light/30 p-4 text-sm text-neutral-muted">
              La ubicación geográfica de esta asociación todavía no está configurada.
            </p>
          )}
        </section>

        {/* 8. Botones de Acción */}
        <div className="pt-6 border-t border-border flex flex-wrap items-center gap-4">
          <Button href={whatsappUrl} variant="primary" isExternal>
            Escribir por WhatsApp
          </Button>
          <Button href={`/tienda?asociacion=${assoc.id}`} variant="outlined">
            Ver quesos de esta asociación
          </Button>
          <Button href="/asociaciones" variant="ghost">
            Volver a asociaciones
          </Button>
        </div>
      </div>
    </div>
  );
}
