"use client";
import { adminFetch } from "@/lib/adminFetch";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AdminBadgeHelp, AdminPageBar } from "@/components/admin/AdminPageBar";
import { EditableField } from "@/components/admin/EditableField";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";

export interface StepItem {
  number: string;
  title: string;
  description: string;
}

export interface ComoComprarContenido {
  steps: StepItem[];
  cta_titulo: string;
  cta_subtitulo: string;
}

interface Props {
  initialData: PaginaEditableConfig<ComoComprarContenido>;
}

export function ComoComprarManager({ initialData }: Props) {
  const { isAdmin } = useAuth();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [titulo, setTitulo] = useState(initialData.titulo);
  const [subtitulo, setSubtitulo] = useState(initialData.subtitulo);
  const [steps, setSteps] = useState<StepItem[]>(initialData.contenido.steps || []);
  const [ctaTitulo, setCtaTitulo] = useState(initialData.contenido.cta_titulo || "¿Listo para ordenar tus quesos?");
  const [ctaSubtitulo, setCtaSubtitulo] = useState(
    initialData.contenido.cta_subtitulo || "Atendemos tus pedidos y consultas de forma personalizada de lunes a domingo."
  );

  const [toast, setToast] = useState<string | null>(null);

  const marcarCambio = () => setIsDirty(true);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await adminFetch("/api/admin/paginas/como-comprar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow,
          titulo,
          subtitulo,
          contenido: {
            steps,
            cta_titulo: ctaTitulo,
            cta_subtitulo: ctaSubtitulo,
          },
        }),
      });

      if (!res.ok) throw new Error("Error al guardar en el servidor");
      setIsDirty(false);
      mostrarToast("Página guardada exitosamente");
    } catch (error) {
      console.error(error);
      mostrarToast("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const agregarPaso = () => {
    const num = String(steps.length + 1).padStart(2, "0");
    setSteps([
      ...steps,
      {
        number: num,
        title: "Nuevo paso de compra",
        description: "Describe el detalle de este paso para el cliente.",
      },
    ]);
    marcarCambio();
    mostrarToast("Paso añadido");
  };

  const eliminarPaso = (idx: number) => {
    if (!confirm("¿Eliminar este paso de compra?")) return;
    setSteps(steps.filter((_, i) => i !== idx));
    marcarCambio();
    mostrarToast("Paso eliminado");
  };

  const whatsappUrl = buildWhatsAppUrl({
    message: "Hola CONLAC-T, deseo realizar un pedido asistido de quesos artesanales.",
  });

  return (
    <div className="relative min-h-screen bg-background">
      {/* Barra de administración (solo admin) */}
      {isAdmin && (
        <AdminPageBar
          pageName="Cómo Comprar"
          isEditing={modoEdicion}
          setIsEditing={setModoEdicion}
          isDirty={isDirty}
          isSaving={isSaving}
          onGuardar={guardarCambios}
        />
      )}

      {/* Toast de confirmación */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111c17] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <main className="py-12 sm:py-16">
        <Container className="space-y-16">
          {/* Encabezado */}
          <div className="max-w-2xl">
            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={eyebrow}
              onChange={(val) => {
                setEyebrow(val);
                marcarCambio();
              }}
              label="Clic para editar categoría"
              className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold"
              placeholder="Categoría / Subtítulo superior..."
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
                placeholder="Título principal..."
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
                placeholder="Descripción del proceso de compra..."
              />
            </div>

            {isAdmin && modoEdicion && (
              <AdminBadgeHelp message="Edita los pasos, textos y el llamado a la acción directamente. Haz clic en Guardar cambios al terminar." />
            )}
          </div>

          {/* Grid de Pasos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-surface border flex flex-col justify-between space-y-4 relative transition-all ${
                  isAdmin && modoEdicion
                    ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500"
                    : "border-border"
                }`}
              >
                {isAdmin && modoEdicion && (
                  <button
                    type="button"
                    onClick={() => eliminarPaso(idx)}
                    title="Eliminar este paso"
                    className="absolute top-3 right-3 text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}

                <div className="space-y-3">
                  <div className="w-16">
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={step.number}
                      onChange={(val) => {
                        const copy = [...steps];
                        copy[idx].number = val;
                        setSteps(copy);
                        marcarCambio();
                      }}
                      label="Número"
                      className="font-headline text-3xl font-bold text-tertiary"
                      placeholder="01"
                    />
                  </div>

                  <div>
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={step.title}
                      onChange={(val) => {
                        const copy = [...steps];
                        copy[idx].title = val;
                        setSteps(copy);
                        marcarCambio();
                      }}
                      label="Título del paso"
                      className="font-headline text-lg font-bold text-primary"
                      renderStatic={() => (
                        <h2 className="font-headline text-lg font-bold text-primary">
                          {step.title}
                        </h2>
                      )}
                      placeholder="Nombre del paso..."
                    />
                  </div>

                  <div>
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={step.description}
                      onChange={(val) => {
                        const copy = [...steps];
                        copy[idx].description = val;
                        setSteps(copy);
                        marcarCambio();
                      }}
                      label="Descripción"
                      type="textarea"
                      rows={3}
                      className="text-xs sm:text-sm text-neutral-muted leading-relaxed"
                      renderStatic={() => (
                        <p className="text-xs sm:text-sm text-neutral-muted leading-relaxed">
                          {step.description}
                        </p>
                      )}
                      placeholder="Detalle del paso..."
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Botón para añadir nuevo paso */}
            {isAdmin && modoEdicion && (
              <button
                type="button"
                onClick={agregarPaso}
                className="p-6 rounded-2xl border-2 border-dashed border-tertiary/70 hover:border-primary hover:bg-primary/5 text-tertiary hover:text-primary transition flex flex-col items-center justify-center min-h-[220px] gap-2 font-semibold text-xs group"
              >
                <div className="w-10 h-10 rounded-full bg-tertiary/15 group-hover:bg-primary/15 flex items-center justify-center text-xl font-bold transition">
                  +
                </div>
                <span>Añadir paso</span>
              </button>
            )}
          </div>

          {/* Banner CTA */}
          <div className="p-8 sm:p-12 rounded-2xl bg-surface border border-tertiary/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="max-w-xl w-full">
              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={ctaTitulo}
                onChange={(val) => {
                  setCtaTitulo(val);
                  marcarCambio();
                }}
                label="Título del banner"
                className="font-headline text-2xl font-bold text-primary"
                renderStatic={() => (
                  <h2 className="font-headline text-2xl font-bold text-primary">
                    {ctaTitulo}
                  </h2>
                )}
                placeholder="Título del banner..."
              />
              <div className="mt-1">
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={ctaSubtitulo}
                  onChange={(val) => {
                    setCtaSubtitulo(val);
                    marcarCambio();
                  }}
                  label="Subtítulo del banner"
                  className="text-sm text-neutral-muted"
                  renderStatic={() => (
                    <p className="text-sm text-neutral-muted">{ctaSubtitulo}</p>
                  )}
                  placeholder="Subtítulo del banner..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-shrink-0">
              <Button href="/tienda" variant="primary">
                <span>Ver catálogo</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
              <Button href={whatsappUrl} variant="outlined" isExternal>
                <WhatsAppIcon className="w-4 h-4" />
                <span>Pedir por WhatsApp</span>
              </Button>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
}

