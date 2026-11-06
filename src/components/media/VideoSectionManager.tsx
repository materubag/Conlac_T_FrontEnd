"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EditableField } from "@/components/admin/EditableField";
import { getVideoEmbedUrl } from "@/lib/utils";

export interface VideoItem {
  id: string;
  titulo: string;
  descripcion?: string;
  url: string;
}

interface VideoSectionManagerProps {
  isAdmin: boolean;
  isEditing: boolean;
  eyebrow: string;
  onEyebrowChange: (val: string) => void;
  titulo: string;
  onTituloChange: (val: string) => void;
  subtitulo: string;
  onSubtituloChange: (val: string) => void;
  videos: VideoItem[];
  onVideosChange: (videos: VideoItem[]) => void;
  onDirty: () => void;
  defaultVideoTemplate?: Partial<VideoItem>;
}

export function VideoSectionManager({
  isAdmin,
  isEditing,
  eyebrow,
  onEyebrowChange,
  titulo,
  onTituloChange,
  subtitulo,
  onSubtituloChange,
  videos,
  onVideosChange,
  onDirty,
  defaultVideoTemplate,
}: VideoSectionManagerProps) {
  // Si no está en modo edición y no hay videos válidos para mostrar, ocultar la sección
  const videosVisibles = videos.filter((v) => getVideoEmbedUrl(v.url) !== null);
  if (!isEditing && videosVisibles.length === 0) {
    return null;
  }

  const agregarVideo = () => {
    const nuevo: VideoItem = {
      id: `vid-${Date.now()}`,
      titulo: defaultVideoTemplate?.titulo || "Nuevo Video de YouTube",
      descripcion:
        defaultVideoTemplate?.descripcion ||
        "Video explicativo de nuestras tradiciones, procesos y preparaciones.",
      url: defaultVideoTemplate?.url || "",
    };
    onVideosChange([...videos, nuevo]);
    onDirty();
  };

  const eliminarVideo = (index: number) => {
    if (!confirm(`¿Deseas eliminar el video "${videos[index].titulo}"?`)) return;
    const nuevas = videos.filter((_, i) => i !== index);
    onVideosChange(nuevas);
    onDirty();
  };

  const actualizarVideo = (index: number, campos: Partial<VideoItem>) => {
    const nuevas = [...videos];
    nuevas[index] = { ...nuevas[index], ...campos };
    onVideosChange(nuevas);
    onDirty();
  };

  const moverIzquierda = (index: number) => {
    if (index === 0) return;
    const nuevas = [...videos];
    const temp = nuevas[index];
    nuevas[index] = nuevas[index - 1];
    nuevas[index - 1] = temp;
    onVideosChange(nuevas);
    onDirty();
  };

  const moverDerecha = (index: number) => {
    if (index === videos.length - 1) return;
    const nuevas = [...videos];
    const temp = nuevas[index];
    nuevas[index] = nuevas[index + 1];
    nuevas[index + 1] = temp;
    onVideosChange(nuevas);
    onDirty();
  };

  return (
    <section className="py-12 sm:py-16 border-t border-border bg-neutral-light/30">
      <Container>
        {/* Cabecera de la sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <EditableField
              isEditing={isEditing}
              value={eyebrow}
              onChange={onEyebrowChange}
              label="Clic para editar categoría"
              className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold"
            />

            <div className="mt-2">
              <EditableField
                isEditing={isEditing}
                value={titulo}
                onChange={onTituloChange}
                label="Clic para editar título"
                className="text-2xl sm:text-3xl font-headline font-bold text-primary"
                renderStatic={() => (
                  <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">
                    {titulo}
                  </h2>
                )}
              />
            </div>

            <div className="mt-2">
              <EditableField
                isEditing={isEditing}
                value={subtitulo}
                onChange={onSubtituloChange}
                label="Clic para editar descripción"
                type="textarea"
                rows={2}
                className="text-sm sm:text-base text-neutral-muted"
                renderStatic={() => (
                  <p className="text-sm sm:text-base text-neutral-muted">{subtitulo}</p>
                )}
              />
            </div>
          </div>

          {/* Botón de añadir video en modo edición */}
          {isEditing && (
            <div className="shrink-0">
              <Button
                type="button"
                variant="outlined"
                size="sm"
                onClick={agregarVideo}
                className="bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:border-red-400 font-semibold shadow-sm"
              >
                <span className="text-base mr-1">▶</span> + Añadir video de YouTube
              </Button>
            </div>
          )}
        </div>

        {/* Estado vacío en modo edición */}
        {isEditing && videos.length === 0 && (
          <div className="p-8 sm:p-12 border-2 border-dashed border-red-200 bg-red-50/40 rounded-2xl text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
              ▶
            </div>
            <h3 className="font-headline text-lg font-bold text-primary">
              Sección de Videos de YouTube
            </h3>
            <p className="text-xs sm:text-sm text-neutral-muted max-w-md mx-auto mt-1 mb-5">
              Añade videos explicativos, tutoriales o recorridos audiovisuales pegando directamente el enlace de YouTube. Los visitantes podrán reproducirlos aquí mismo.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={agregarVideo}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
            >
              + Añadir primer video
            </Button>
          </div>
        )}

        {/* Galería / Grid de videos */}
        {videos.length > 0 && (
          <div
            className={`grid gap-8 ${
              videos.length === 1
                ? "grid-cols-1 max-w-3xl mx-auto"
                : "grid-cols-1 md:grid-cols-2"
            }`}
          >
            {videos.map((vid, index) => {
              const embedUrl = getVideoEmbedUrl(vid.url);
              const isValid = embedUrl !== null;

              return (
                <div
                  key={vid.id || index}
                  className={`flex flex-col overflow-hidden rounded-2xl bg-surface border transition-all ${
                    isEditing
                      ? "border-blue-300 ring-2 ring-blue-500/10 shadow-sm"
                      : "border-border shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Barra superior de herramientas en modo edición */}
                  {isEditing && (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50/80 border-b border-blue-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-900">
                          Video #{index + 1}
                        </span>
                        {isValid ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            YouTube Listo
                          </span>
                        ) : vid.url.trim() ? (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            ⚠️ Enlace no válido
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded-full">
                            Sin enlace
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moverIzquierda(index)}
                          disabled={index === 0}
                          title="Mover antes"
                          className="px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-800 disabled:opacity-30 hover:bg-blue-100 text-[11px]"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => moverDerecha(index)}
                          disabled={index === videos.length - 1}
                          title="Mover después"
                          className="px-2 py-0.5 bg-white border border-blue-200 rounded text-blue-800 disabled:opacity-30 hover:bg-blue-100 text-[11px]"
                        >
                          →
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarVideo(index)}
                          title="Eliminar este video"
                          className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 text-[11px] font-semibold ml-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reproductor de Video */}
                  <div className="relative aspect-video w-full bg-black overflow-hidden shadow-inner">
                    {embedUrl ? (
                      <iframe
                        src={embedUrl}
                        title={vid.titulo || `Video de YouTube ${index + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-neutral-900 to-neutral-800 text-white/80">
                        <span className="text-3xl text-red-500 mb-2">▶</span>
                        <p className="text-xs sm:text-sm font-medium">
                          {isEditing
                            ? "Pega el enlace de YouTube en el campo inferior para activar el reproductor."
                            : "Video no disponible temporalmente."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Información y edición del video */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Título del video */}
                      <div className="mb-2">
                        <EditableField
                          isEditing={isEditing}
                          value={vid.titulo}
                          onChange={(val) => {
                            actualizarVideo(index, { titulo: val });
                          }}
                          label="Clic para editar título del video"
                          className="text-base sm:text-lg font-headline font-bold text-primary"
                          renderStatic={() => (
                            <h3 className="text-base sm:text-lg font-headline font-bold text-primary">
                              {vid.titulo}
                            </h3>
                          )}
                        />
                      </div>

                      {/* URL de YouTube (visible en modo edición) */}
                      {isEditing && (
                        <div className="my-3 p-3 bg-neutral-light/70 rounded-xl border border-border">
                          <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                            Enlace de YouTube:
                          </label>
                          <input
                            type="text"
                            value={vid.url || ""}
                            onChange={(e) => {
                              actualizarVideo(index, { url: e.target.value });
                            }}
                            placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                            className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-[10px] text-neutral-muted mt-1">
                            Soporta videos normales, enlaces cortos (youtu.be), Shorts y listas.
                          </p>
                        </div>
                      )}

                      {/* Descripción del video */}
                      <EditableField
                        isEditing={isEditing}
                        value={vid.descripcion || ""}
                        onChange={(val) => {
                          actualizarVideo(index, { descripcion: val });
                        }}
                        label="Clic para editar descripción del video"
                        type="textarea"
                        rows={2}
                        className="text-xs sm:text-sm text-neutral-muted"
                        renderStatic={() => (
                          <p className="text-xs sm:text-sm text-neutral-muted">
                            {vid.descripcion}
                          </p>
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}

