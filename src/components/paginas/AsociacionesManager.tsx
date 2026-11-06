"use client";
import { adminFetch, mensajeDeError } from "@/lib/adminFetch";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, UsersIcon, MapPinIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { AdminBadgeHelp, AdminPageBar } from "@/components/admin/AdminPageBar";
import { EditableField } from "@/components/admin/EditableField";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";

export interface AsociacionEditable {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  parroquia: string;
  miembros: number;
  foto_url: string | null;
}

export interface AsociacionesContenido {
  asociaciones: AsociacionEditable[];
}

interface Props {
  initialData: PaginaEditableConfig<AsociacionesContenido>;
}

export function AsociacionesManager({ initialData }: Props) {
  const { isAdmin } = useAuth();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [titulo, setTitulo] = useState(initialData.titulo);
  const [subtitulo, setSubtitulo] = useState(initialData.subtitulo);
  const [asociaciones, setAsociaciones] = useState<AsociacionEditable[]>(
    initialData.contenido.asociaciones || []
  );

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
      const res = await adminFetch("/api/admin/paginas/asociaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow,
          titulo,
          subtitulo,
          contenido: { asociaciones },
        }),
      });

      if (!res.ok) throw new Error(await mensajeDeError(res, "Error al guardar"));
      const saved = await res.json();
      if(saved.data?.contenido?.asociaciones) setAsociaciones(saved.data.contenido.asociaciones);
      setIsDirty(false);
      mostrarToast("Página de asociaciones guardada");
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
    if (!file || index === null || !asociaciones[index]) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const nuevas = [...asociaciones];
      nuevas[index] = { ...nuevas[index], foto_url: dataUrl };
      setAsociaciones(nuevas);
      marcarCambio();
      mostrarToast("Foto de asociación actualizada");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const agregarAsociacion = () => {
    const nueva: AsociacionEditable = {
      id: `asoc-${Date.now()}`,
      slug: `nueva-asociacion-${Date.now()}`,
      nombre: "Nueva Asociación de Productores",
      descripcion: "Familias productoras de leche artesanal y quesos andinos de altura.",
      parroquia: "Pilahuín",
      miembros: 40,
      foto_url: null,
    };
    setAsociaciones([...asociaciones, nueva]);
    marcarCambio();
    mostrarToast("Nueva asociación añadida");
  };

  const eliminarAsociacion = (index: number) => {
    if (!confirm(`¿Eliminar la asociación "${asociaciones[index].nombre}"?`)) return;
    setAsociaciones(asociaciones.filter((_, i) => i !== index));
    marcarCambio();
    mostrarToast("Asociación eliminada");
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
          pageName="Asociaciones"
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
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Asociaciones" },
            ]}
          />

          <div className="max-w-2xl mb-10">
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
              <AdminBadgeHelp message="Puedes editar títulos, descripciones comunitarias, cambiar fotos y gestionar asociaciones." />
            )}
          </div>

          {/* Grid de Asociaciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {asociaciones.map((assoc, index) => {
              const imageSrc =
                assoc.foto_url ||
                (index % 2 === 0
                  ? "/demo/ASOC-paramo.jpg"
                  : "/demo/HERO-chimborazo.jpg");

              return (
                <article
                  key={assoc.id}
                  className={`flex flex-col sm:flex-row overflow-hidden rounded-2xl bg-surface border shadow-sm transition-all relative ${
                    isAdmin && modoEdicion
                      ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500"
                      : "border-border hover:border-tertiary/70"
                  }`}
                >
                  {isAdmin && modoEdicion && (
                    <button
                      type="button"
                      onClick={() => eliminarAsociacion(index)}
                      title="Eliminar asociación"
                      className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-white/90 text-red-600 hover:bg-red-50 flex items-center justify-center shadow-md"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}

                  {/* Imagen */}
                  <div className="relative aspect-[4/3] sm:w-2/5 shrink-0 bg-neutral-light/50">
                    <Image
                      src={imageSrc}
                      alt={assoc.nombre}
                      fill
                      className="object-cover"
                      unoptimized={imageSrc.startsWith("data:")}
                    />

                    {isAdmin && modoEdicion && (
                      <button
                        type="button"
                        onClick={() => abrirSelectorImagen(index)}
                        className="absolute inset-x-2 bottom-2 py-1 px-2 rounded-lg bg-[#111c17]/90 text-white text-[11px] font-semibold text-center hover:bg-[#111c17] transition shadow-xs"
                      >
                        Cambiar foto
                      </button>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs text-neutral-muted">
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="w-3.5 h-3.5 text-tertiary" />
                          <EditableField
                            isEditing={isAdmin && modoEdicion}
                            value={assoc.parroquia}
                            onChange={(val) => {
                              const copy = [...asociaciones];
                              copy[index].parroquia = val;
                              setAsociaciones(copy);
                              marcarCambio();
                            }}
                            label="Parroquia"
                            className="font-medium"
                          />
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <UsersIcon className="w-3.5 h-3.5 text-tertiary" />
                          <EditableField
                            isEditing={isAdmin && modoEdicion}
                            value={String(assoc.miembros)}
                            onChange={(val) => {
                              const copy = [...asociaciones];
                              copy[index].miembros = parseInt(val) || 0;
                              setAsociaciones(copy);
                              marcarCambio();
                            }}
                            label="Miembros"
                            className="font-medium w-12"
                            renderStatic={() => <span>{assoc.miembros} familias</span>}
                          />
                        </span>
                      </div>

                      <EditableField
                        isEditing={isAdmin && modoEdicion}
                        value={assoc.nombre}
                        onChange={(val) => {
                          const copy = [...asociaciones];
                          copy[index].nombre = val;
                          setAsociaciones(copy);
                          marcarCambio();
                        }}
                        label="Nombre asociación"
                        className="font-headline text-xl font-bold text-primary"
                        renderStatic={() => (
                          <h2 className="font-headline text-xl font-bold text-primary">
                            {assoc.nombre}
                          </h2>
                        )}
                      />

                      <EditableField
                        isEditing={isAdmin && modoEdicion}
                        value={assoc.descripcion}
                        onChange={(val) => {
                          const copy = [...asociaciones];
                          copy[index].descripcion = val;
                          setAsociaciones(copy);
                          marcarCambio();
                        }}
                        label="Descripción"
                        type="textarea"
                        rows={3}
                        className="text-xs sm:text-sm text-neutral-muted leading-relaxed"
                        renderStatic={() => (
                          <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed line-clamp-3">
                            {assoc.descripcion}
                          </p>
                        )}
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        href={`/asociaciones/${assoc.slug || assoc.id}`}
                        variant="outlined"
                        size="sm"
                        fullWidth
                      >
                        <span>Conocer historia y quesos</span>
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Añadir Asociación */}
            {isAdmin && modoEdicion && (
              <button
                type="button"
                onClick={agregarAsociacion}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-tertiary/70 hover:border-primary hover:bg-primary/5 text-tertiary hover:text-primary transition min-h-[220px] gap-2 font-semibold text-xs group"
              >
                <div className="w-10 h-10 rounded-full bg-tertiary/15 group-hover:bg-primary/15 flex items-center justify-center text-xl font-bold transition">
                  +
                </div>
                <span>Añadir asociación</span>
              </button>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}

