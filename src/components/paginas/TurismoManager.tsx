"use client";
import { adminFetch, mensajeDeError } from "@/lib/adminFetch";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl, getVideoEmbedUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AdminBadgeHelp, AdminPageBar } from "@/components/admin/AdminPageBar";
import { EditableField } from "@/components/admin/EditableField";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";

export interface AtractivoEditable {
  id: string;
  nombre: string;
  descripcion: string;
  foto_url: string | null;
  duracion?: string;
  dificultad?: string;
  video_url?: string | null;
}

export interface TurismoContenido {
  atractivos: AtractivoEditable[];
}

interface Props {
  initialData: PaginaEditableConfig<TurismoContenido>;
}

export function TurismoManager({ initialData }: Props) {
  const { isAdmin } = useAuth();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [titulo, setTitulo] = useState(initialData.titulo);
  const [subtitulo, setSubtitulo] = useState(initialData.subtitulo);
  const [atractivos, setAtractivos] = useState<AtractivoEditable[]>(
    initialData.contenido?.atractivos || []
  );

  // Control de pestaña multimedia ("foto" o "video") por cada lugar turístico
  const [mediaActiva, setMediaActiva] = useState<Record<string, "foto" | "video">>({});

  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetImageIndexRef = useRef<number | null>(null);

  const marcarCambio = () => setIsDirty(true);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await adminFetch("/api/admin/paginas/turismo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow,
          titulo,
          subtitulo,
          contenido: { atractivos },
        }),
      });

      if (!res.ok) throw new Error(await mensajeDeError(res, "Error al guardar"));
      const saved = await res.json();
      if (saved.data?.contenido?.atractivos) setAtractivos(saved.data.contenido.atractivos);
      setIsDirty(false);
      mostrarToast("Página de turismo guardada exitosamente");
    } catch (error) {
      console.error(error);
      mostrarToast(error instanceof Error ? error.message : "Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const abrirSelectorImagen = (index: number) => {
    targetImageIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = targetImageIndexRef.current;
    if (!file || index === null || !atractivos[index]) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const nuevas = [...atractivos];
      nuevas[index] = { ...nuevas[index], foto_url: dataUrl };
      setAtractivos(nuevas);
      marcarCambio();
      mostrarToast("Foto actualizada");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const agregarAtractivo = () => {
    const nuevo: AtractivoEditable = {
      id: `turismo-${Date.now()}`,
      nombre: "Nueva Ruta Comunitaria",
      descripcion: "Hermosa ruta de páramo andino con visita y degustación de quesos artesanales.",
      foto_url: null,
      duracion: "3 - 4 horas",
      dificultad: "Moderada",
      video_url: "https://www.youtube.com/watch?v=s5Rsw9hR278",
    };
    setAtractivos([...atractivos, nuevo]);
    marcarCambio();
    mostrarToast("Nueva ruta creada con video listo");
  };

  const eliminarAtractivo = (index: number) => {
    if (!confirm(`¿Eliminar la ruta "${atractivos[index].nombre}"?`)) return;
    setAtractivos(atractivos.filter((_, i) => i !== index));
    marcarCambio();
    mostrarToast("Ruta eliminada");
  };

  const moverIzquierda = (index: number) => {
    if (index === 0) return;
    const nuevas = [...atractivos];
    const temp = nuevas[index];
    nuevas[index] = nuevas[index - 1];
    nuevas[index - 1] = temp;
    setAtractivos(nuevas);
    marcarCambio();
  };

  const moverDerecha = (index: number) => {
    if (index === atractivos.length - 1) return;
    const nuevas = [...atractivos];
    const temp = nuevas[index];
    nuevas[index] = nuevas[index + 1];
    nuevas[index + 1] = temp;
    setAtractivos(nuevas);
    marcarCambio();
  };

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
          pageName="Turismo"
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

      <main className="py-12 sm:py-16">
        <Container>
          <div className="max-w-2xl mb-12">
            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={eyebrow}
              onChange={(val) => {
                setEyebrow(val);
                marcarCambio();
              }}
              label="Clic para editar categoría"
              className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold"
            />

            <div className="mt-2">
              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={titulo}
                onChange={(val) => {
                  setTitulo(val);
                  marcarCambio();
                }}
                label="Clic para editar título"
                className="text-3xl sm:text-4xl font-headline font-bold text-primary"
                renderStatic={() => (
                  <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary">
                    {titulo}
                  </h1>
                )}
              />
            </div>

            <div className="mt-3">
              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={subtitulo}
                onChange={(val) => {
                  setSubtitulo(val);
                  marcarCambio();
                }}
                label="Clic para editar descripción"
                type="textarea"
                rows={2}
                className="text-base text-neutral-muted"
                renderStatic={() => (
                  <p className="text-base text-neutral-muted">{subtitulo}</p>
                )}
              />
            </div>

            {isAdmin && modoEdicion && (
              <AdminBadgeHelp message="Puedes editar títulos, descripciones, cambiar fotos o agregar videos de YouTube para cada lugar turístico." />
            )}
          </div>

          {/* Grid de Atractivos Turísticos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {atractivos.map((attraction, index) => {
              const imageSrc =
                attraction.foto_url ||
                (index % 2 === 0
                  ? "/demo/HERO-chimborazo.jpg"
                  : "/demo/ASOC-paramo.jpg");

              const whatsappUrl = buildWhatsAppUrl({
                message: `Hola CONLAC-T, deseo información sobre la ruta "${attraction.nombre}".`,
              });

              const embedUrl = getVideoEmbedUrl(attraction.video_url || "");
              const tieneVideo = Boolean(embedUrl);
              const modoActual = mediaActiva[attraction.id] || (tieneVideo && !attraction.foto_url ? "video" : "foto");

              return (
                <article
                  key={attraction.id}
                  className={`flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border p-6 shadow-sm transition-all relative ${
                    isAdmin && modoEdicion
                      ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500"
                      : "border-border hover:border-tertiary/70"
                  }`}
                >
                  {/* Herramientas admin flotantes */}
                  {isAdmin && modoEdicion && (
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-surface/95 border border-border rounded-full px-2 py-1 shadow-md">
                      <button
                        type="button"
                        onClick={() => moverIzquierda(index)}
                        disabled={index === 0}
                        title="Mover a la izquierda"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-600 hover:text-blue-600 disabled:opacity-30"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moverDerecha(index)}
                        disabled={index === atractivos.length - 1}
                        title="Mover a la derecha"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-600 hover:text-blue-600 disabled:opacity-30"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => eliminarAtractivo(index)}
                        title="Eliminar atractivo"
                        className="w-6 h-6 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Contenedor Multimedia (Foto o Reproductor de Video de YouTube) */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black">
                      {modoActual === "video" && embedUrl ? (
                        <iframe
                          src={embedUrl}
                          title={`Video de ${attraction.nombre}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 h-full w-full border-0 z-10"
                        />
                      ) : (
                        <>
                          <Image
                            src={imageSrc}
                            alt={`Fotografía de ${attraction.nombre}`}
                            fill
                            className="object-cover object-center"
                            unoptimized={imageSrc.startsWith("data:")}
                          />

                          {/* Botón flotante para reproducir video si está disponible */}
                          {tieneVideo && (
                            <button
                              type="button"
                              onClick={() =>
                                setMediaActiva((prev) => ({ ...prev, [attraction.id]: "video" }))
                              }
                              className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition active:scale-95 z-20 group"
                              title="Reproducir video de este lugar"
                            >
                              <span className="text-xl pl-0.5 group-hover:scale-110 transition">▶</span>
                            </button>
                          )}
                        </>
                      )}

                      {/* Selector de Pestañas Foto / Video */}
                      {tieneVideo && (
                        <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1 bg-[#111c17]/85 backdrop-blur-xs p-1 rounded-lg border border-white/20">
                          <button
                            type="button"
                            onClick={() =>
                              setMediaActiva((prev) => ({ ...prev, [attraction.id]: "foto" }))
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                              modoActual === "foto"
                                ? "bg-white text-[#111c17] shadow-xs"
                                : "text-white/80 hover:text-white"
                            }`}
                          >
                            📷 Foto
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setMediaActiva((prev) => ({ ...prev, [attraction.id]: "video" }))
                            }
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                              modoActual === "video"
                                ? "bg-red-600 text-white shadow-xs"
                                : "text-white/80 hover:text-white"
                            }`}
                          >
                            <span>▶ Video</span>
                          </button>
                        </div>
                      )}

                      {/* Badges superiores (Duración / Dificultad) */}
                      <div className="absolute top-3 left-3 flex gap-2 z-20">
                        {isAdmin && modoEdicion ? (
                          <div className="flex items-center gap-2 bg-[#111c17]/85 backdrop-blur-xs p-1.5 rounded-xl border border-white/20 shadow-sm">
                            <input
                              type="text"
                              value={attraction.duracion || "3 - 4 horas"}
                              onChange={(e) => {
                                const copy = [...atractivos];
                                copy[index].duracion = e.target.value;
                                setAtractivos(copy);
                                marcarCambio();
                              }}
                              className="w-24 bg-white/95 text-[#111c17] text-xs font-bold px-2 py-0.5 rounded text-center focus:outline-none"
                              placeholder="Duración..."
                              title="Duración del recorrido"
                            />
                            <input
                              type="text"
                              value={attraction.dificultad || "Moderada"}
                              onChange={(e) => {
                                const copy = [...atractivos];
                                copy[index].dificultad = e.target.value;
                                setAtractivos(copy);
                                marcarCambio();
                              }}
                              className="w-20 bg-white/95 text-[#111c17] text-xs font-bold px-2 py-0.5 rounded text-center focus:outline-none"
                              placeholder="Dificultad..."
                              title="Dificultad de la ruta"
                            />
                          </div>
                        ) : (
                          <>
                            {attraction.duracion && (
                              <Badge variant="highlight">{attraction.duracion}</Badge>
                            )}
                            {attraction.dificultad && (
                              <Badge variant="tertiary">{attraction.dificultad}</Badge>
                            )}
                          </>
                        )}
                      </div>

                      {/* Botón cambiar imagen (Modo Edición) */}
                      {isAdmin && modoEdicion && modoActual === "foto" && (
                        <button
                          type="button"
                          onClick={() => abrirSelectorImagen(index)}
                          className="absolute right-3 bottom-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111c17]/90 hover:bg-[#111c17] text-white text-xs font-semibold backdrop-blur-xs transition shadow-sm"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                          <span>Cambiar imagen</span>
                        </button>
                      )}
                    </div>

                    {/* Título de la ruta */}
                    <div>
                      <EditableField
                        isEditing={isAdmin && modoEdicion}
                        value={attraction.nombre}
                        onChange={(val) => {
                          const copy = [...atractivos];
                          copy[index].nombre = val;
                          setAtractivos(copy);
                          marcarCambio();
                        }}
                        label="Nombre de la ruta"
                        className="font-headline text-xl font-bold text-primary"
                        renderStatic={() => (
                          <h2 className="font-headline text-xl font-bold text-primary">
                            {attraction.nombre}
                          </h2>
                        )}
                      />
                    </div>

                    {/* Enlace de YouTube de este lugar turístico (Modo Edición) */}
                    {isAdmin && modoEdicion && (
                      <div className="p-3 bg-neutral-light/70 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-neutral-700">
                            Video de YouTube de este lugar:
                          </label>
                          {tieneVideo ? (
                            <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full">
                              ✓ Video listo
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-500 italic">
                              Opcional
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={attraction.video_url || ""}
                          onChange={(e) => {
                            const copy = [...atractivos];
                            copy[index].video_url = e.target.value;
                            setAtractivos(copy);
                            marcarCambio();
                          }}
                          placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                          className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-neutral-muted">
                            {tieneVideo ? "El reproductor se activará en la tarjeta." : "Pega un enlace para activar el reproductor."}
                          </span>
                          {tieneVideo && (
                            <button
                              type="button"
                              onClick={() =>
                                setMediaActiva((prev) => ({
                                  ...prev,
                                  [attraction.id]: modoActual === "video" ? "foto" : "video",
                                }))
                              }
                              className="font-semibold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 px-2 py-0.5 rounded shadow-2xs"
                            >
                              {modoActual === "video" ? "Ver Foto" : "▶ Probar Video"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Descripción de la ruta */}
                    <div>
                      <EditableField
                        isEditing={isAdmin && modoEdicion}
                        value={attraction.descripcion}
                        onChange={(val) => {
                          const copy = [...atractivos];
                          copy[index].descripcion = val;
                          setAtractivos(copy);
                          marcarCambio();
                        }}
                        label="Descripción de la ruta"
                        type="textarea"
                        rows={3}
                        className="text-xs sm:text-sm text-neutral-muted leading-relaxed"
                        renderStatic={() => (
                          <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                            {attraction.descripcion}
                          </p>
                        )}
                      />
                    </div>
                  </div>

                  {/* Acciones inferiores de la tarjeta */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row gap-2">
                    {tieneVideo && (
                      <button
                        type="button"
                        onClick={() =>
                          setMediaActiva((prev) => ({
                            ...prev,
                            [attraction.id]: modoActual === "video" ? "foto" : "video",
                          }))
                        }
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          modoActual === "video"
                            ? "bg-neutral-light text-neutral border-border"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        <span>{modoActual === "video" ? "📷 Ver Foto" : "▶ Ver Video"}</span>
                      </button>
                    )}

                    <Button href={whatsappUrl} variant="outlined" isExternal fullWidth size="sm">
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                      <span>Coordinar visita</span>
                    </Button>
                  </div>
                </article>
              );
            })}

            {/* Tarjeta + Nueva Ruta */}
            {isAdmin && modoEdicion && (
              <button
                type="button"
                onClick={agregarAtractivo}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-tertiary/70 hover:border-primary hover:bg-primary/5 text-tertiary hover:text-primary transition min-h-[360px] gap-3 font-semibold text-sm group"
              >
                <div className="w-12 h-12 rounded-full bg-tertiary/15 group-hover:bg-primary/15 flex items-center justify-center text-2xl font-bold transition">
                  +
                </div>
                <span>Añadir ruta turística</span>
              </button>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
