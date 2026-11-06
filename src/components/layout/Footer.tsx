"use client";
import { adminFetch, mensajeDeError } from "@/lib/adminFetch";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config";
import { FOOTER_NAV_SECTIONS } from "@/config/navigation";
import { Container } from "@/components/ui/Container";
import { MapPinIcon, ShieldCheckIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { EditableField } from "@/components/admin/EditableField";

export interface FooterConfig {
  subtitulo: string;
  descripcion: string;
  direccion: string;
  metodos_titulo: string;
  metodo1: string;
  metodo2: string;
  metodo3: string;
  garantia: string;
  copyright: string;
}

const defaultFooterConfig: FooterConfig = {
  subtitulo: "Consorcio de Lácteos de Tungurahua",
  descripcion:
    "Unión de asociaciones y familias productoras de Pilahuín comprometidas con la preservación de la tradición quesera andina, calidad sanitaria y desarrollo agroecológico comunitario.",
  direccion: siteConfig.location.address,
  metodos_titulo: "Métodos de Compra",
  metodo1: "Transferencia bancaria directa a cuentas del consorcio",
  metodo2: "Pedidos Asistidos por WhatsApp",
  metodo3: "Retiro en Planta Comunitaria",
  garantia: "Garantía Sanitaria BPM",
  copyright: `${siteConfig.fullName} (CONLAC-T). Todos los derechos reservados.`,
};

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { isAdmin } = useAuth();

  const [modoEdicion, setModoEdicion] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [cfg, setCfg] = useState<FooterConfig>(defaultFooterConfig);

  // Cargar configuración guardada desde PostgreSQL
  useEffect(() => {
    fetch("/api/admin/paginas/footer")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.contenido && Object.keys(data.contenido).length > 0) {
          setCfg({
            ...defaultFooterConfig,
            ...data.contenido,
          });
        }
      })
      .catch(() => {
        // En caso de error de red, mantiene defaults
      });
  }, []);

  const marcarCambio = () => setIsDirty(true);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await adminFetch("/api/admin/paginas/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow: "Pie de Página",
          titulo: "Footer Institucional",
          subtitulo: cfg.subtitulo,
          contenido: cfg,
        }),
      });

      if (!res.ok) throw new Error(await mensajeDeError(res, "Error al guardar pie de página"));
      setIsDirty(false);
      mostrarToast("Pie de página guardado en el servidor");
    } catch (err) {
      console.error(err);
      mostrarToast(err instanceof Error ? err.message : "Error al guardar cambios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <footer
      className="bg-[#184332] text-[#F8F4E9] mt-auto border-t-4 border-tertiary relative"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Pie de página institucional de CONLAC-T
      </h2>

      {/* Toast notificador */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111c17] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* Barra de control de edición del footer para Admin */}
      {isAdmin && (
        <div className="bg-[#111c17] border-b border-[#243d30] px-4 py-2 text-xs flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 font-semibold">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isDirty ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
              }`}
            />
            <span className="text-neutral-200">
              {modoEdicion
                ? isDirty
                  ? "Pie de página · Cambios pendientes"
                  : "Pie de página · Modo edición activo"
                : "Pie de página institucional"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModoEdicion(!modoEdicion)}
              className={`px-3 py-1 rounded-lg font-semibold transition border ${
                modoEdicion
                  ? "bg-white text-[#111c17] border-white"
                  : "bg-transparent text-white border-white/30 hover:bg-white/10"
              }`}
            >
              {modoEdicion ? "Cerrar edición" : "⚙️ Editar pie de página"}
            </button>

            {modoEdicion && (
              <button
                type="button"
                disabled={isSaving}
                onClick={guardarCambios}
                className="px-3.5 py-1 rounded-lg font-bold bg-[#d4a373] text-[#2b1a0d] hover:bg-[#c99563] transition disabled:opacity-50"
              >
                {isSaving ? "Guardando..." : "Guardar pie de página"}
              </button>
            )}
          </div>
        </div>
      )}

      <Container className="py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-[#2D6A4F]/60">
          {/* Columna 1 y 2: Identidad y Territorio */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-tertiary rounded-lg p-1 shrink-0"
            >
              <div className="relative w-12 h-12 flex-shrink-0 bg-surface rounded-full p-1 shadow-sm">
                <Image
                  src={siteConfig.assets.logo}
                  alt="Logo oficial de CONLAC-T"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col shrink-0">
                <span className="font-headline text-2xl font-bold tracking-tight text-[#F8F4E9] whitespace-nowrap">
                  CONLAC&#8209;T
                </span>
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={cfg.subtitulo}
                  onChange={(val) => {
                    setCfg({ ...cfg, subtitulo: val });
                    marcarCambio();
                  }}
                  label="Subtítulo del logo"
                  className="text-xs uppercase font-label tracking-widest text-[#D4A373] block"
                  renderStatic={() => (
                    <span className="text-xs uppercase font-label tracking-widest text-[#D4A373]">
                      {cfg.subtitulo}
                    </span>
                  )}
                />
              </div>
            </Link>

            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={cfg.descripcion}
              onChange={(val) => {
                setCfg({ ...cfg, descripcion: val });
                marcarCambio();
              }}
              label="Descripción institucional"
              className="text-sm text-[#F8F4E9]/80 max-w-md leading-relaxed"
              renderStatic={() => (
                <p className="text-sm text-[#F8F4E9]/80 max-w-md leading-relaxed">
                  {cfg.descripcion}
                </p>
              )}
            />

            <div className="pt-2 flex items-start gap-2.5 text-xs text-[#F8F4E9]/75">
              <MapPinIcon className="w-4 h-4 text-[#D4A373] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={cfg.direccion}
                  onChange={(val) => {
                    setCfg({ ...cfg, direccion: val });
                    marcarCambio();
                  }}
                  label="Dirección y ubicación física"
                  className="text-xs text-[#F8F4E9]/75"
                  renderStatic={() => <span>{cfg.direccion}</span>}
                />
              </div>
            </div>
          </div>

          {/* Columna 3: Explorar */}
          <div>
            <h3 className="font-label text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-4">
              Explorar
            </h3>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAV_SECTIONS.explorar.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#F8F4E9]/80 hover:text-[#D4A373] transition-colors focus-visible:ring-2 focus-visible:ring-tertiary rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Institucional */}
          <div>
            <h3 className="font-label text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-4">
              Institucional
            </h3>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_NAV_SECTIONS.institucional.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-[#F8F4E9]/80 hover:text-[#D4A373] transition-colors focus-visible:ring-2 focus-visible:ring-tertiary rounded"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 5: Métodos y Garantía */}
          <div>
            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={cfg.metodos_titulo}
              onChange={(val) => {
                setCfg({ ...cfg, metodos_titulo: val });
                marcarCambio();
              }}
              label="Título de la columna"
              className="font-label text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-4 block"
              renderStatic={() => (
                <h3 className="font-label text-sm font-semibold uppercase tracking-wider text-[#D4A373] mb-4">
                  {cfg.metodos_titulo}
                </h3>
              )}
            />

            <div className="space-y-3 text-xs text-[#F8F4E9]/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A373] shrink-0" />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={cfg.metodo1}
                  onChange={(val) => {
                    setCfg({ ...cfg, metodo1: val });
                    marcarCambio();
                  }}
                  label="Método 1"
                  className="text-xs text-[#F8F4E9]/80"
                  renderStatic={() => <span>{cfg.metodo1}</span>}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A373] shrink-0" />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={cfg.metodo2}
                  onChange={(val) => {
                    setCfg({ ...cfg, metodo2: val });
                    marcarCambio();
                  }}
                  label="Método 2"
                  className="text-xs text-[#F8F4E9]/80"
                  renderStatic={() => <span>{cfg.metodo2}</span>}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A373] shrink-0" />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={cfg.metodo3}
                  onChange={(val) => {
                    setCfg({ ...cfg, metodo3: val });
                    marcarCambio();
                  }}
                  label="Método 3"
                  className="text-xs text-[#F8F4E9]/80"
                  renderStatic={() => <span>{cfg.metodo3}</span>}
                />
              </div>

              <div className="mt-4 pt-3 border-t border-[#2D6A4F]/60 flex items-center gap-2 text-[#D4A373]">
                <ShieldCheckIcon className="w-5 h-5 flex-shrink-0" />
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={cfg.garantia}
                  onChange={(val) => {
                    setCfg({ ...cfg, garantia: val });
                    marcarCambio();
                  }}
                  label="Garantía"
                  className="font-medium text-xs text-[#D4A373]"
                  renderStatic={() => (
                    <span className="font-medium text-xs">{cfg.garantia}</span>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior: Derechos de autor y Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F8F4E9]/60">
          <div className="flex items-center gap-1.5 flex-1">
            <span>© {currentYear}</span>
            <EditableField
              isEditing={isAdmin && modoEdicion}
              value={cfg.copyright}
              onChange={(val) => {
                setCfg({ ...cfg, copyright: val });
                marcarCambio();
              }}
              label="Texto de copyright"
              className="text-xs text-[#F8F4E9]/60"
              renderStatic={() => <span>{cfg.copyright}</span>}
            />
          </div>

          <div className="flex items-center gap-6">
            {FOOTER_NAV_SECTIONS.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="hover:text-[#D4A373] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};
