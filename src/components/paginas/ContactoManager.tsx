"use client";
import { adminFetch } from "@/lib/adminFetch";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MapPinIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { buildWhatsAppUrl } from "@/lib/utils";
import { ContactForm } from "@/components/contact/ContactForm";
import { useAuth } from "@/context/AuthContext";
import { AdminBadgeHelp, AdminPageBar } from "@/components/admin/AdminPageBar";
import { EditableField } from "@/components/admin/EditableField";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";

export interface ContactoContenido {
  whatsapp_titulo: string;
  whatsapp_descripcion: string;
  whatsapp_mensaje: string;
  ubicacion_titulo: string;
  ubicacion_direccion: string;
  ubicacion_horario: string;
  email_titulo: string;
  email_descripcion: string;
  email_direccion: string;
}

interface Props {
  initialData: PaginaEditableConfig<ContactoContenido>;
}

export function ContactoManager({ initialData }: Props) {
  const { isAdmin } = useAuth();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [titulo, setTitulo] = useState(initialData.titulo);
  const [subtitulo, setSubtitulo] = useState(initialData.subtitulo);
  const [c, setC] = useState<ContactoContenido>(initialData.contenido);

  const [toast, setToast] = useState<string | null>(null);

  const marcarCambio = () => setIsDirty(true);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await adminFetch("/api/admin/paginas/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow,
          titulo,
          subtitulo,
          contenido: c,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar");
      setIsDirty(false);
      mostrarToast("Página guardada exitosamente");
    } catch (error) {
      console.error(error);
      mostrarToast("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const whatsappUrl = buildWhatsAppUrl({
    message: c.whatsapp_mensaje || "Hola CONLAC-T, deseo comunicarme con un asesor.",
  });

  return (
    <div className="relative min-h-screen bg-background">
      {isAdmin && (
        <AdminPageBar
          pageName="Contacto"
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
        <Container className="space-y-12">
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
              <AdminBadgeHelp message="Modifica la información de contacto, direcciones y teléfonos directamente." />
            )}
          </div>

          {/* Tarjetas de Canales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* WhatsApp */}
            <div
              className={`p-8 rounded-2xl bg-surface border flex flex-col justify-between space-y-6 transition-all ${
                isAdmin && modoEdicion
                  ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500"
                  : "border-border"
              }`}
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#25D366] text-white">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.whatsapp_titulo}
                  onChange={(val) => {
                    setC({ ...c, whatsapp_titulo: val });
                    marcarCambio();
                  }}
                  label="Título WhatsApp"
                  className="font-headline text-xl font-bold text-primary"
                  renderStatic={() => (
                    <h2 className="font-headline text-xl font-bold text-primary">
                      {c.whatsapp_titulo}
                    </h2>
                  )}
                />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.whatsapp_descripcion}
                  onChange={(val) => {
                    setC({ ...c, whatsapp_descripcion: val });
                    marcarCambio();
                  }}
                  label="Descripción WhatsApp"
                  type="textarea"
                  rows={2}
                  className="text-sm text-neutral-muted"
                  renderStatic={() => (
                    <p className="text-sm text-neutral-muted">{c.whatsapp_descripcion}</p>
                  )}
                />
              </div>
              <Button href={whatsappUrl} variant="primary" isExternal fullWidth>
                <WhatsAppIcon className="w-4 h-4" />
                <span>Enviar mensaje directo</span>
              </Button>
            </div>

            {/* Ubicación */}
            <div
              className={`p-8 rounded-2xl bg-surface border flex flex-col justify-between space-y-6 transition-all ${
                isAdmin && modoEdicion
                  ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500"
                  : "border-border"
              }`}
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-inverted">
                  <MapPinIcon className="w-6 h-6" />
                </div>
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.ubicacion_titulo}
                  onChange={(val) => {
                    setC({ ...c, ubicacion_titulo: val });
                    marcarCambio();
                  }}
                  label="Título Ubicación"
                  className="font-headline text-xl font-bold text-primary"
                  renderStatic={() => (
                    <h2 className="font-headline text-xl font-bold text-primary">
                      {c.ubicacion_titulo}
                    </h2>
                  )}
                />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.ubicacion_direccion}
                  onChange={(val) => {
                    setC({ ...c, ubicacion_direccion: val });
                    marcarCambio();
                  }}
                  label="Dirección"
                  className="text-sm text-neutral-muted"
                  renderStatic={() => (
                    <p className="text-sm text-neutral-muted">{c.ubicacion_direccion}</p>
                  )}
                />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.ubicacion_horario}
                  onChange={(val) => {
                    setC({ ...c, ubicacion_horario: val });
                    marcarCambio();
                  }}
                  label="Horario"
                  className="text-xs text-neutral-muted"
                  renderStatic={() => (
                    <p className="text-xs text-neutral-muted">Horario: {c.ubicacion_horario}</p>
                  )}
                />
              </div>
              <div className="pt-2">
                <span className="text-xs font-label font-semibold text-primary">
                  Tungurahua · Ecuador
                </span>
              </div>
            </div>

            {/* Correo */}
            <div
              className={`p-8 rounded-2xl bg-surface border flex flex-col justify-between space-y-6 transition-all ${
                isAdmin && modoEdicion
                  ? "border-blue-300 ring-2 ring-blue-500/10 hover:border-blue-500"
                  : "border-border"
              }`}
            >
              <div className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary text-neutral">
                  <span className="font-bold text-lg">@</span>
                </div>
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.email_titulo}
                  onChange={(val) => {
                    setC({ ...c, email_titulo: val });
                    marcarCambio();
                  }}
                  label="Título Correo"
                  className="font-headline text-xl font-bold text-primary"
                  renderStatic={() => (
                    <h2 className="font-headline text-xl font-bold text-primary">
                      {c.email_titulo}
                    </h2>
                  )}
                />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.email_descripcion}
                  onChange={(val) => {
                    setC({ ...c, email_descripcion: val });
                    marcarCambio();
                  }}
                  label="Descripción Correo"
                  type="textarea"
                  rows={2}
                  className="text-sm text-neutral-muted"
                  renderStatic={() => (
                    <p className="text-sm text-neutral-muted">{c.email_descripcion}</p>
                  )}
                />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.email_direccion}
                  onChange={(val) => {
                    setC({ ...c, email_direccion: val });
                    marcarCambio();
                  }}
                  label="Correo Electrónico"
                  className="text-sm font-semibold text-primary break-all"
                  renderStatic={() => (
                    <p className="text-sm font-semibold text-primary break-all">{c.email_direccion}</p>
                  )}
                />
              </div>
              <Button href={`mailto:${c.email_direccion}`} variant="outlined" fullWidth>
                <span>Escribir por correo</span>
              </Button>
            </div>
          </div>

          {/* Formulario de Mensajería */}
          <div className="max-w-4xl mx-auto pt-4">
            <ContactForm />
          </div>
        </Container>
      </main>
    </div>
  );
}

