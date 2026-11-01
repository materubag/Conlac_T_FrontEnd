"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChefHatIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { EditableField } from "@/components/admin/EditableField";
import { getVideoEmbedUrl } from "@/lib/utils";
import type { PaginaRecetasData, RecetaEditable } from "@/lib/db/recetasRepo";

interface RecetasManagerProps {
  initialData: PaginaRecetasData;
}

export function RecetasManager({ initialData }: RecetasManagerProps) {
  const { isAdmin } = useAuth();

  // Estado del contenido
  const [config, setConfig] = useState(initialData.config);
  const [recetas, setRecetas] = useState<RecetaEditable[]>(initialData.recetas);

  // Estados de interfaz administrativa
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estado del drawer de pasos
  const [recetaActivaIndex, setRecetaActivaIndex] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Control de pestaña multimedia ("foto" o "video") por cada receta
  const [mediaActiva, setMediaActiva] = useState<Record<string, "foto" | "video">>({});

  // Input de archivo oculto para subir imágenes de recetas
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetImageIndexRef = useRef<number | null>(null);

  // Marcar cambios sin guardar
  const marcarCambio = () => {
    setIsDirty(true);
  };

  const mostrarToast = (mensaje: string) => {
    setToastMessage(mensaje);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Guardar cambios en SQLite (unificado, publica automáticamente)
  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/recetas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          recetas,
          publicar: true,
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo guardar la información en el servidor.");
      }

      const resData = await res.json();
      if (resData.success && resData.data) {
        setConfig(resData.data.config);
        setRecetas(resData.data.recetas);
      }

      setIsDirty(false);
      mostrarToast("¡Cambios guardados con éxito en la base de datos!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      alert("Error: " + msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Acciones sobre tarjetas de recetas
  const moverIzquierda = (index: number) => {
    if (index <= 0) return;
    const nuevas = [...recetas];
    const item = nuevas.splice(index, 1)[0];
    nuevas.splice(index - 1, 0, item);
    setRecetas(nuevas);
    marcarCambio();
  };

  const moverDerecha = (index: number) => {
    if (index >= recetas.length - 1) return;
    const nuevas = [...recetas];
    const item = nuevas.splice(index, 1)[0];
    nuevas.splice(index + 1, 0, item);
    setRecetas(nuevas);
    marcarCambio();
  };

  const duplicarReceta = (index: number) => {
    const original = recetas[index];
    const copia: RecetaEditable = {
      ...JSON.parse(JSON.stringify(original)),
      id: `receta-${Date.now()}`,
      titulo: `${original.titulo} (Copia)`,
      orden: index + 1,
    };
    const nuevas = [...recetas];
    nuevas.splice(index + 1, 0, copia);
    setRecetas(nuevas);
    marcarCambio();
    mostrarToast("Receta duplicada");
  };

  const eliminarReceta = (index: number) => {
    const receta = recetas[index];
    if (!confirm(`¿Eliminar la receta "${receta.titulo}"?`)) return;
    const nuevas = recetas.filter((_, i) => i !== index);
    setRecetas(nuevas);
    marcarCambio();
    mostrarToast("Receta eliminada");
  };

  const agregarNuevaReceta = () => {
    const nueva: RecetaEditable = {
      id: `receta-${Date.now()}`,
      titulo: "Nueva Receta Tradicional",
      descripcion_corta: "Preparación comunitaria con quesos artesanales de Pilahuín.",
      tipo_queso: "Queso Andino Tradicional",
      tiempo_prep: 30,
      porciones: 4,
      imagen_url: null,
      gradient: "linear-gradient(135deg,#d4a373,#8a5a3a)",
      pasos: ["Describe el primer paso de la preparación."],
      orden: recetas.length,
      publicado: true,
    };
    setRecetas([...recetas, nueva]);
    marcarCambio();
    mostrarToast("Nueva receta creada");
  };

  // Manejo de cambio de imagen
  const abrirSelectorImagen = (index: number) => {
    targetImageIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = targetImageIndexRef.current;
    if (!file || index === null || !recetas[index]) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const nuevas = [...recetas];
      nuevas[index] = { ...nuevas[index], imagen_url: dataUrl };
      setRecetas(nuevas);
      marcarCambio();
      mostrarToast("Imagen actualizada");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Drawer de pasos
  const abrirDrawerPasos = (index: number) => {
    setRecetaActivaIndex(index);
    setIsDrawerOpen(true);
  };

  const cerrarDrawerPasos = () => {
    setIsDrawerOpen(false);
    setRecetaActivaIndex(null);
  };

  const actualizarPaso = (pasoIndex: number, texto: string) => {
    if (recetaActivaIndex === null) return;
    const nuevas = [...recetas];
    const receta = { ...nuevas[recetaActivaIndex] };
    const pasos = [...receta.pasos];
    pasos[pasoIndex] = texto;
    receta.pasos = pasos;
    nuevas[recetaActivaIndex] = receta;
    setRecetas(nuevas);
    marcarCambio();
  };

  const eliminarPaso = (pasoIndex: number) => {
    if (recetaActivaIndex === null) return;
    const nuevas = [...recetas];
    const receta = { ...nuevas[recetaActivaIndex] };
    const pasos = receta.pasos.filter((_, i) => i !== pasoIndex);
    receta.pasos = pasos;
    nuevas[recetaActivaIndex] = receta;
    setRecetas(nuevas);
    marcarCambio();
  };

  const agregarPaso = () => {
    if (recetaActivaIndex === null) return;
    const nuevas = [...recetas];
    const receta = { ...nuevas[recetaActivaIndex] };
    receta.pasos = [...receta.pasos, ""];
    nuevas[recetaActivaIndex] = receta;
    setRecetas(nuevas);
    marcarCambio();
  };

  // Receta seleccionada en el drawer
  const recetaActiva = recetaActivaIndex !== null ? recetas[recetaActivaIndex] : null;

  return (
    <div className="relative min-h-screen bg-background">
      {/* ==============================================================
          BARRA DE ADMINISTRACIÓN SUPERIOR (Visible sólo para Admin)
          ============================================================== */}
      {isAdmin && (
        <aside
          aria-label="Barra de administración en vivo"
          className="sticky top-0 z-40 bg-[#111c17] text-white border-b border-[#243d30] px-4 sm:px-8 py-2.5 shadow-md"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
            {/* Indicador de estado */}
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <span
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                }`}
              />
              <span className="text-neutral-200">
                {isDirty ? "Cambios sin guardar" : "Panel de administración · Recetas"}
              </span>
            </div>

            {/* Controles de administración */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {/* Toggle Modo Edición / Vista Previa */}
              <button
                type="button"
                onClick={() => setModoEdicion(!modoEdicion)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  modoEdicion
                    ? "bg-white text-[#111c17] border-white shadow-xs"
                    : "bg-transparent text-white border-white/30 hover:bg-white/10"
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {modoEdicion ? (
                    <>
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
                <span>{modoEdicion ? "Modo edición activo" : "Vista previa"}</span>
              </button>

              {/* Botón único Guardar Cambios (persiste y publica en SQLite) */}
              <button
                type="button"
                disabled={isSaving}
                onClick={guardarCambios}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#d4a373] text-[#2b1a0d] hover:bg-[#c99563] active:scale-95 transition disabled:opacity-50 shadow-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>{isSaving ? "Guardando..." : "Guardar cambios"}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ==============================================================
          CUERPO DE LA PÁGINA DE RECETAS
          ============================================================== */}
      <main className="py-12 sm:py-16">
        <Container>
          {/* ================= ENCABEZADO ================= */}
          <div className="max-w-3xl mb-10">
            {/* 1. Eyebrow editable */}
            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={config.eyebrow}
              onChange={(val) => {
                setConfig({ ...config, eyebrow: val });
                marcarCambio();
              }}
              label="Clic para editar categoría"
              className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold block mb-2"
              placeholder="Categoría / Subtítulo superior..."
            />

            {/* 2. Título Principal editable */}
            <div className="mt-1">
              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={config.titulo}
                onChange={(val) => {
                  setConfig({ ...config, titulo: val });
                  marcarCambio();
                }}
                label="Clic para editar título"
                className="text-3xl sm:text-4xl font-headline font-bold text-primary"
                renderStatic={() => (
                  <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary">
                    {config.titulo}
                  </h1>
                )}
                placeholder="Título de la sección..."
              />
            </div>

            {/* 3. Subtítulo / Descripción editable */}
            <div className="mt-3">
              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={config.subtitulo}
                onChange={(val) => {
                  setConfig({ ...config, subtitulo: val });
                  marcarCambio();
                }}
                label="Clic para editar descripción general"
                className="text-base text-neutral-muted"
                renderStatic={() => (
                  <p className="text-base text-neutral-muted leading-relaxed">
                    {config.subtitulo}
                  </p>
                )}
                placeholder="Descripción general de las recetas..."
              />
            </div>

            {/* Indicador compacto con popover al hacer hover */}
            {isAdmin && modoEdicion && (
              <div className="relative inline-flex items-center mt-3 group">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold cursor-help shadow-2xs hover:bg-blue-100 transition">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    !
                  </span>
                  <span>Modo edición activo</span>
                </div>
                {/* Popover / Tooltip informativo en hover */}
                <div className="pointer-events-none absolute left-0 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 w-72 p-3 bg-neutral-900 text-white text-xs rounded-xl shadow-xl leading-relaxed">
                  Todos los recuadros con borde azul punteado son editables directamente. Usa los controles flotantes de cada tarjeta para ordenar, duplicar o cambiar imágenes.
                  <div className="absolute top-full left-5 -mt-1 border-4 border-transparent border-t-neutral-900" />
                </div>
              </div>
            )}
          </div>

          {/* ================= GRID DE RECETAS ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recetas.map((receta, index) => {
              const imageSrc = receta.imagen_url || "/placeholders/recipe-placeholder.svg";
              const hasCustomImage = Boolean(receta.imagen_url);
              const linkHref = `/recetas/${receta.slug || receta.id}`;

              return (
                <article
                  key={receta.id}
                  className={`relative flex flex-col justify-between rounded-2xl bg-surface border p-6 shadow-sm transition-all ${
                    isAdmin && modoEdicion
                      ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500 hover:shadow-md"
                      : "border-border hover:border-tertiary/70"
                  }`}
                >
                  {/* Barra de herramientas flotante de la tarjeta (Admin) */}
                  {isAdmin && modoEdicion && (
                    <div className="absolute -top-3.5 right-4 z-20 flex items-center gap-1 bg-surface border border-border rounded-full px-2 py-1 shadow-md">
                      <button
                        type="button"
                        onClick={() => moverIzquierda(index)}
                        disabled={index === 0}
                        title="Mover a la izquierda"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => moverDerecha(index)}
                        disabled={index === recetas.length - 1}
                        title="Mover a la derecha"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-600 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:pointer-events-none transition"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => duplicarReceta(index)}
                        title="Duplicar receta"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarReceta(index)}
                        title="Eliminar receta"
                        className="w-7 h-7 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition"
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Imagen y Badges */}
                  <div className="space-y-4">
                    {(() => {
                      const embedUrl = getVideoEmbedUrl(receta.video_url || "");
                      const tieneVideo = Boolean(embedUrl);
                      const modoActual = mediaActiva[receta.id] || (tieneVideo && !hasCustomImage ? "video" : "foto");

                      return (
                        <>
                          <div
                            className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-black"
                            style={
                              !hasCustomImage && receta.gradient && modoActual === "foto"
                                ? { background: receta.gradient }
                                : undefined
                            }
                          >
                            {modoActual === "video" && embedUrl ? (
                              <iframe
                                src={embedUrl}
                                title={`Video de ${receta.titulo}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 h-full w-full border-0 z-10"
                              />
                            ) : (
                              <>
                                {hasCustomImage ? (
                                  <Image
                                    src={imageSrc}
                                    alt={receta.titulo}
                                    fill
                                    className="object-cover object-center"
                                    unoptimized={imageSrc.startsWith("data:")}
                                  />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center text-white/80">
                                    <ChefHatIcon className="w-14 h-14" />
                                  </div>
                                )}

                                {/* Botón flotante para reproducir video si está disponible */}
                                {tieneVideo && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setMediaActiva((prev) => ({ ...prev, [receta.id]: "video" }))
                                    }
                                    className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition active:scale-95 z-20 group"
                                    title="Reproducir video de esta receta"
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
                                    setMediaActiva((prev) => ({ ...prev, [receta.id]: "foto" }))
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
                                    setMediaActiva((prev) => ({ ...prev, [receta.id]: "video" }))
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

                            {/* Badges superiores (Editables) */}
                            <div className="absolute top-3 right-3 flex gap-2 z-20">
                              {isAdmin && modoEdicion ? (
                                <div className="flex items-center gap-1.5 bg-[#111c17]/80 backdrop-blur-xs px-2 py-1 rounded-xl border border-white/20 shadow-sm">
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min={1}
                                      value={receta.tiempo_prep ?? 30}
                                      onChange={(e) => {
                                        const nuevas = [...recetas];
                                        nuevas[index] = { ...nuevas[index], tiempo_prep: parseInt(e.target.value) || 0 };
                                        setRecetas(nuevas);
                                        marcarCambio();
                                      }}
                                      className="w-10 bg-white/95 text-[#111c17] text-xs font-bold px-1 py-0.5 rounded text-center focus:outline-none"
                                      title="Minutos de preparación"
                                    />
                                    <span className="text-[10px] text-white font-medium">min</span>
                                  </div>
                                  <span className="text-white/40">•</span>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min={1}
                                      value={receta.porciones ?? 4}
                                      onChange={(e) => {
                                        const nuevas = [...recetas];
                                        nuevas[index] = { ...nuevas[index], porciones: parseInt(e.target.value) || 0 };
                                        setRecetas(nuevas);
                                        marcarCambio();
                                      }}
                                      className="w-10 bg-white/95 text-[#111c17] text-xs font-bold px-1 py-0.5 rounded text-center focus:outline-none"
                                      title="Porciones"
                                    />
                                    <span className="text-[10px] text-white font-medium">porc.</span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {receta.tiempo_prep && (
                                    <Badge variant="highlight">{receta.tiempo_prep} min</Badge>
                                  )}
                                  {receta.porciones && (
                                    <Badge variant="tertiary">{receta.porciones} porciones</Badge>
                                  )}
                                  {tieneVideo && (
                                    <Badge variant="outline" className="bg-red-600 text-white border-none text-[10px] py-0.5 px-2 font-bold">
                                      ▶ Video
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Botón cambiar imagen (Modo Edición) */}
                            {isAdmin && modoEdicion && modoActual === "foto" && (
                              <button
                                type="button"
                                onClick={() => abrirSelectorImagen(index)}
                                className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111c17]/90 hover:bg-[#111c17] text-white text-xs font-semibold backdrop-blur-xs transition shadow-sm active:scale-95"
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

                          {/* Enlace de YouTube de esta receta (Modo Edición) */}
                          {isAdmin && modoEdicion && (
                            <div className="p-3 bg-neutral-light/70 rounded-xl border border-blue-200">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[11px] font-bold text-neutral-700">
                                  Video de YouTube de esta receta:
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
                                value={receta.video_url || ""}
                                onChange={(e) => {
                                  const nuevas = [...recetas];
                                  nuevas[index] = { ...nuevas[index], video_url: e.target.value };
                                  setRecetas(nuevas);
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
                                        [receta.id]: modoActual === "video" ? "foto" : "video",
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
                        </>
                      );
                    })()}

                    {/* Título de la Receta (Editable autoajustable) */}
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={receta.titulo}
                      onChange={(val) => {
                        const nuevas = [...recetas];
                        nuevas[index] = { ...nuevas[index], titulo: val };
                        setRecetas(nuevas);
                        marcarCambio();
                      }}
                      label="Clic para editar título"
                      className="font-headline text-xl font-bold text-primary leading-snug"
                      renderStatic={() => (
                        <h2 className="font-headline text-xl font-bold text-primary leading-snug">
                          {receta.titulo}
                        </h2>
                      )}
                      placeholder="Escribe el nombre del plato..."
                    />

                    {/* Descripción corta (Editable autoajustable) */}
                    <div className="mt-2">
                      <EditableField
                        isEditing={isAdmin && modoEdicion}
                        value={receta.descripcion_corta || ""}
                        onChange={(val) => {
                          const nuevas = [...recetas];
                          nuevas[index] = { ...nuevas[index], descripcion_corta: val };
                          setRecetas(nuevas);
                          marcarCambio();
                        }}
                        label="Clic para editar descripción"
                        className="text-xs sm:text-sm text-neutral-muted leading-relaxed"
                        renderStatic={() => (
                          <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed line-clamp-2">
                            {receta.descripcion_corta || `${receta.pasos.length} pasos de preparación artesanal.`}
                          </p>
                        )}
                        placeholder="Breve reseña del plato o queso utilizado..."
                      />
                    </div>

                    {/* Conteo de pasos */}
                    <p className="text-xs text-neutral-muted font-medium pt-1">
                      {receta.pasos.length} pasos de preparación artesanal.
                    </p>
                  </div>

                  {/* Botones inferiores */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-col gap-2">
                    {receta.video_url && getVideoEmbedUrl(receta.video_url) && (
                      <button
                        type="button"
                        onClick={() =>
                          setMediaActiva((prev) => ({
                            ...prev,
                            [receta.id]: prev[receta.id] === "video" ? "foto" : "video",
                          }))
                        }
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                          mediaActiva[receta.id] === "video"
                            ? "bg-neutral-light text-neutral border-border"
                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        <span>
                          {mediaActiva[receta.id] === "video"
                            ? "📷 Ver Foto de Receta"
                            : "▶ Ver Video de Preparación"}
                        </span>
                      </button>
                    )}

                    {isAdmin && modoEdicion ? (
                      <button
                        type="button"
                        onClick={() => abrirDrawerPasos(index)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary text-primary hover:text-white font-semibold text-xs transition shadow-2xs group"
                      >
                        <svg className="w-3.5 h-3.5 text-tertiary group-hover:text-white transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
                        </svg>
                        <span>Editar pasos de preparación</span>
                        <ArrowRightIcon className="w-3 h-3" />
                      </button>
                    ) : (
                      <Button href={linkHref} variant="outlined" size="sm" fullWidth>
                        <span>Ver preparación</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}

            {/* Tarjeta "+ Nueva receta" (Modo Edición) */}
            {isAdmin && modoEdicion && (
              <button
                type="button"
                onClick={agregarNuevaReceta}
                className="flex flex-col items-center justify-center gap-3 min-h-[380px] rounded-2xl border-2 border-dashed border-tertiary hover:border-primary hover:bg-primary/5 text-tertiary hover:text-primary transition p-8 group shadow-2xs"
              >
                <div className="w-14 h-14 rounded-full bg-tertiary/10 group-hover:bg-primary/10 flex items-center justify-center transition">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <span className="font-headline font-bold text-lg">Nueva receta</span>
                <span className="text-xs text-neutral-muted max-w-[200px] text-center">
                  Agrega una preparación comunitaria con sus ingredientes y pasos.
                </span>
              </button>
            )}
          </div>
        </Container>
      </main>

      {/* Input oculto para carga de imágenes */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleArchivoSeleccionado}
        className="hidden"
      />

      {/* ==============================================================
          DRAWER LATERAL PARA EDICIÓN DE PASOS
          ============================================================== */}
      {/* Velo / Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={cerrarDrawerPasos}
      />

      {/* Panel Deslizante Lateral */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-surface border-l border-border shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 ease-out ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Cabecera del Drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2 text-primary font-headline font-bold text-lg min-w-0 pr-2">
              <ChefHatIcon className="w-5 h-5 text-tertiary flex-shrink-0" />
              <h2 className="truncate">{recetaActiva?.titulo || "Pasos de la receta"}</h2>
            </div>
            <button
              type="button"
              onClick={cerrarDrawerPasos}
              aria-label="Cerrar panel de pasos"
              className="p-1 rounded-lg text-neutral-muted hover:text-primary hover:bg-neutral-light transition flex-shrink-0"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-neutral-muted mt-2 mb-4">
            Añade, redacta o elimina los pasos de preparación artesanal para esta receta.
          </p>

          {/* Video de YouTube de la receta individual */}
          {recetaActiva && (
            <div className="mb-4">
              {isAdmin && modoEdicion && (
                <div className="mb-3 p-3 bg-neutral-light/70 rounded-xl border border-border">
                  <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                    Enlace de YouTube de esta receta (opcional):
                  </label>
                  <input
                    type="text"
                    value={recetaActiva.video_url || ""}
                    onChange={(e) => {
                      if (recetaActivaIndex === null) return;
                      const nuevas = [...recetas];
                      nuevas[recetaActivaIndex] = {
                        ...nuevas[recetaActivaIndex],
                        video_url: e.target.value,
                      };
                      setRecetas(nuevas);
                      marcarCambio();
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-neutral-muted mt-1">
                    Si agregas un enlace, el video se reproducirá aquí y aparecerá el badge de video en la tarjeta.
                  </p>
                </div>
              )}

              {getVideoEmbedUrl(recetaActiva.video_url || "") && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-sm mb-3">
                  <iframe
                    src={getVideoEmbedUrl(recetaActiva.video_url || "")!}
                    title={`Video de ${recetaActiva.titulo}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              )}
            </div>
          )}

          {/* Lista de pasos con scroll */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
            {recetaActiva?.pasos.map((paso, pasoIdx) => (
              <div
                key={pasoIdx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-background border border-border shadow-2xs"
              >
                {/* Número de paso */}
                <div className="w-7 h-7 rounded-full bg-primary text-white flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1">
                  {pasoIdx + 1}
                </div>

                {/* Textarea del paso */}
                <textarea
                  rows={2}
                  value={paso}
                  onChange={(e) => actualizarPaso(pasoIdx, e.target.value)}
                  className="flex-1 bg-surface border border-border focus:border-primary focus:outline-none rounded-lg p-2 text-xs sm:text-sm text-neutral resize-none leading-relaxed"
                  placeholder={`Describe el paso ${pasoIdx + 1}...`}
                />

                {/* Botón eliminar paso */}
                <button
                  type="button"
                  onClick={() => eliminarPaso(pasoIdx)}
                  title="Eliminar este paso"
                  className="text-neutral-muted hover:text-red-600 p-1.5 transition mt-0.5 rounded-md hover:bg-red-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Botón para añadir paso después de la última tarjeta */}
            {recetaActiva && (
              <button
                type="button"
                onClick={agregarPaso}
                className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 border-dashed border-tertiary hover:border-primary hover:bg-primary/5 text-tertiary hover:text-primary transition font-semibold text-xs group my-2 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-tertiary/15 group-hover:bg-primary/15 flex items-center justify-center text-sm font-bold transition">
                  +
                </div>
                <span>Añadir paso a la receta</span>
              </button>
            )}

            {/* Mensaje si aún no hay pasos */}
            {recetaActiva && recetaActiva.pasos.length === 0 && (
              <p className="text-center text-xs text-neutral-muted py-2">
                No hay pasos redactados todavía. Pulsa el botón de arriba para crear el primero.
              </p>
            )}
          </div>

          {/* Pie del Drawer */}
          <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
            <span className="text-xs text-neutral-muted">
              {recetaActiva?.pasos.length || 0} pasos registrados
            </span>

            <button
              type="button"
              onClick={cerrarDrawerPasos}
              className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-xs"
            >
              Listo
            </button>
          </div>
        </div>
      </aside>

      {/* ==============================================================
          TOAST NOTIFICATION (Flotante)
          ============================================================== */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111c17] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-white/20 animate-fadeIn">
          <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
