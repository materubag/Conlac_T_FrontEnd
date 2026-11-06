"use client";
import { adminFetch, mensajeDeError } from "@/lib/adminFetch";

import React, { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowRightIcon,
  ChefHatIcon,
  MountainIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthContext";
import { AdminBadgeHelp, AdminPageBar } from "@/components/admin/AdminPageBar";
import { EditableField } from "@/components/admin/EditableField";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";

export interface TestimonioItem {
  id?: string;
  authorized?: boolean;
  quote: string;
  name: string;
  role: string;
}

export interface StatItem {
  value: string;
  label: string;
  sublabel: string;
}

export interface NosotrosContenido {
  historia_titulo: string;
  historia_p1: string;
  historia_p2: string;
  leche_altura_titulo?: string;
  leche_altura_subtitulo?: string;
  testimonios_eyebrow?: string;
  testimonios_titulo?: string;
  stats: StatItem[];
  testimonials: TestimonioItem[];
}

interface Props {
  initialData: PaginaEditableConfig<NosotrosContenido>;
}

export function NosotrosManager({ initialData }: Props) {
  const { isAdmin } = useAuth();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [eyebrow, setEyebrow] = useState(initialData.eyebrow);
  const [titulo, setTitulo] = useState(initialData.titulo);
  const [subtitulo, setSubtitulo] = useState(initialData.subtitulo);
  const [c, setC] = useState<NosotrosContenido>(initialData.contenido);

  const [toast, setToast] = useState<string | null>(null);

  const marcarCambio = () => setIsDirty(true);

  const mostrarToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const guardarCambios = async () => {
    setIsSaving(true);
    try {
      const res = await adminFetch("/api/admin/paginas/nosotros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow,
          titulo,
          subtitulo,
          contenido: c,
        }),
      });

      if (!res.ok) throw new Error(await mensajeDeError(res, "Error al guardar"));
      const saved = await res.json();
      if (saved.data?.contenido) setC(saved.data.contenido);
      setIsDirty(false);
      mostrarToast("Página de Nosotros guardada exitosamente");
    } catch (error) {
      console.error(error);
      mostrarToast(error instanceof Error ? error.message : "Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background">
      {isAdmin && (
        <AdminPageBar
          pageName="Nosotros"
          isEditing={modoEdicion}
          setIsEditing={setModoEdicion}
          isDirty={isDirty}
          isSaving={isSaving}
          onGuardar={guardarCambios}
        />
      )}

      {isAdmin && modoEdicion && <Container className="py-4"><h2 className="font-bold">Autorización de testimonios</h2>{c.testimonials.map((t,i)=><label key={i} className="block"><input type="checkbox" checked={!!t.authorized} onChange={e=>{setC({...c,testimonials:c.testimonials.map((v,n)=>n===i?{...v,authorized:e.target.checked}:v)});marcarCambio();}}/> {t.name}: cuento con autorización para publicar su testimonio</label>)}</Container>}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111c17] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-white/20 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      <main className="bg-background pb-16 sm:pb-24">
        <Container className="space-y-16 sm:space-y-24 pt-8">
          {/* Hero Banner */}
          <section className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-inverted shadow-artisan sm:px-12 sm:py-24 lg:px-20">
            <Image
              src="/demo/HERO-chimborazo.jpg"
              alt="Paisaje andino de Tungurahua"
              fill
              priority
              className="-z-20 object-cover opacity-35"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary/90 to-primary/25" />
            <div className="max-w-3xl">
              <div className="inline-block">
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={eyebrow}
                  onChange={(val) => {
                    setEyebrow(val);
                    marcarCambio();
                  }}
                  label="Badge superior"
                  className="text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full"
                  renderStatic={() => <Badge variant="tertiary">{eyebrow}</Badge>}
                />
              </div>

              <div className="mt-4">
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={titulo}
                  onChange={(val) => {
                    setTitulo(val);
                    marcarCambio();
                  }}
                  label="Título principal"
                  className="text-4xl leading-tight text-white font-headline font-bold sm:text-6xl"
                  renderStatic={() => (
                    <h1 className="text-4xl leading-tight !text-inverted sm:text-6xl font-headline font-bold">
                      {titulo}
                    </h1>
                  )}
                />
              </div>

              <div className="mt-6">
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={subtitulo}
                  onChange={(val) => {
                    setSubtitulo(val);
                    marcarCambio();
                  }}
                  label="Subtítulo del hero"
                  type="textarea"
                  rows={3}
                  className="text-base leading-relaxed text-white/90 sm:text-lg"
                  renderStatic={() => (
                    <p className="text-base leading-relaxed text-inverted/85 sm:text-lg">
                      {subtitulo}
                    </p>
                  )}
                />
              </div>

              {isAdmin && modoEdicion && (
                <div className="mt-4">
                  <AdminBadgeHelp message="Edita la historia, misión, testimonios y cifras de impacto de CONLAC-T." />
                </div>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="#historia" variant="inverted" className="!text-primary">
                  Conocer nuestra raíz <ArrowRightIcon />
                </Button>
                <Button href="#impacto" variant="outlined" className="!border-white !text-white hover:bg-inverted hover:!text-primary">
                  Impacto en cifras
                </Button>
              </div>
            </div>
          </section>

          {/* Sección Historia */}
          <section id="historia" className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="relative lg:col-span-5">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-surface-warm shadow-artisan">
                <Image
                  src="/demo/ASOC-paramo.jpg"
                  alt="Paisaje de las comunidades productoras de Tungurahua"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -right-3 max-w-[15rem] rounded-2xl bg-surface p-5 shadow-artisan sm:right-5">
                <div className="flex items-center gap-3">
                  <MountainIcon className="h-8 w-8 shrink-0 text-primary" />
                  <div className="w-full">
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={c.leche_altura_titulo || "Leche de altura"}
                      onChange={(val) => {
                        setC({ ...c, leche_altura_titulo: val });
                        marcarCambio();
                      }}
                      label="Título insignia"
                      className="font-label text-sm font-bold text-primary block"
                      renderStatic={() => (
                        <p className="font-label text-sm font-bold text-primary">
                          {c.leche_altura_titulo || "Leche de altura"}
                        </p>
                      )}
                    />
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={c.leche_altura_subtitulo || "Pastoreo libre a más de 3.000 msnm"}
                      onChange={(val) => {
                        setC({ ...c, leche_altura_subtitulo: val });
                        marcarCambio();
                      }}
                      label="Subtítulo insignia"
                      className="text-xs leading-relaxed text-neutral-muted block"
                      renderStatic={() => (
                        <p className="text-xs leading-relaxed text-neutral-muted">
                          {c.leche_altura_subtitulo || "Pastoreo libre a más de 3.000 msnm"}
                        </p>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-7">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-tertiary">
                Nuestra raíz comunitaria
              </span>

              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={c.historia_titulo}
                onChange={(val) => {
                  setC({ ...c, historia_titulo: val });
                  marcarCambio();
                }}
                label="Título de historia"
                className="text-3xl font-headline font-bold text-primary sm:text-4xl"
                renderStatic={() => (
                  <h2 className="text-3xl font-headline font-bold text-primary sm:text-4xl">
                    {c.historia_titulo}
                  </h2>
                )}
              />

              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={c.historia_p1}
                onChange={(val) => {
                  setC({ ...c, historia_p1: val });
                  marcarCambio();
                }}
                label="Párrafo 1"
                type="textarea"
                rows={4}
                className="text-base leading-relaxed text-neutral-muted"
                renderStatic={() => (
                  <p className="text-base leading-relaxed text-neutral-muted">
                    {c.historia_p1}
                  </p>
                )}
              />

              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={c.historia_p2}
                onChange={(val) => {
                  setC({ ...c, historia_p2: val });
                  marcarCambio();
                }}
                label="Párrafo 2"
                type="textarea"
                rows={4}
                className="text-base leading-relaxed text-neutral-muted"
                renderStatic={() => (
                  <p className="text-base leading-relaxed text-neutral-muted">
                    {c.historia_p2}
                  </p>
                )}
              />
            </div>
          </section>

          {/* Impacto en Cifras */}
          <section id="impacto" className="rounded-3xl bg-surface-warm p-8 sm:p-12 border border-border">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="font-label text-xs font-bold uppercase tracking-widest text-tertiary">
                Resultados
              </span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-headline font-bold text-primary">
                Impacto social y productivo en Tungurahua
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {c.stats.map((stat, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-surface border border-border text-center">
                  <EditableField
                    isEditing={isAdmin && modoEdicion}
                    value={stat.value}
                    onChange={(val) => {
                      const copy = [...c.stats];
                      copy[idx].value = val;
                      setC({ ...c, stats: copy });
                      marcarCambio();
                    }}
                    label="Cifra"
                    className="text-3xl sm:text-4xl font-headline font-bold text-tertiary"
                    renderStatic={() => (
                      <span className="text-3xl sm:text-4xl font-headline font-bold text-tertiary">
                        {stat.value}
                      </span>
                    )}
                  />
                  <div className="mt-2">
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={stat.label}
                      onChange={(val) => {
                        const copy = [...c.stats];
                        copy[idx].label = val;
                        setC({ ...c, stats: copy });
                        marcarCambio();
                      }}
                      label="Etiqueta"
                      className="text-sm font-bold text-primary block"
                    />
                  </div>
                  <EditableField
                    isEditing={isAdmin && modoEdicion}
                    value={stat.sublabel}
                    onChange={(val) => {
                      const copy = [...c.stats];
                      copy[idx].sublabel = val;
                      setC({ ...c, stats: copy });
                      marcarCambio();
                    }}
                    label="Detalle"
                    className="text-xs text-neutral-muted block mt-1"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Testimonios */}
          <section className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <EditableField
                isEditing={isAdmin && modoEdicion}
                value={c.testimonios_eyebrow || "Confianza & Comunidad"}
                onChange={(val) => {
                  setC({ ...c, testimonios_eyebrow: val });
                  marcarCambio();
                }}
                label="Categoría testimonios"
                className="font-label text-xs font-bold uppercase tracking-widest text-tertiary block"
                renderStatic={() => (
                  <span className="font-label text-xs font-bold uppercase tracking-widest text-tertiary">
                    {c.testimonios_eyebrow || "Confianza & Comunidad"}
                  </span>
                )}
              />

              <div className="mt-2">
                <EditableField
                  isEditing={isAdmin && modoEdicion}
                  value={c.testimonios_titulo || "Lo que dicen quienes consumen y apoyan CONLAC-T"}
                  onChange={(val) => {
                    setC({ ...c, testimonios_titulo: val });
                    marcarCambio();
                  }}
                  label="Título testimonios"
                  className="text-2xl sm:text-3xl font-headline font-bold text-primary"
                  renderStatic={() => (
                    <h2 className="text-2xl sm:text-3xl font-headline font-bold text-primary">
                      {c.testimonios_titulo || "Lo que dicen quienes consumen y apoyan CONLAC-T"}
                    </h2>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {c.testimonials.map((test, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between space-y-4">
                  <EditableField
                    isEditing={isAdmin && modoEdicion}
                    value={test.quote}
                    onChange={(val) => {
                      const copy = [...c.testimonials];
                      copy[idx].quote = val;
                      setC({ ...c, testimonials: copy });
                      marcarCambio();
                    }}
                    label="Testimonio"
                    type="textarea"
                    rows={3}
                    className="text-sm italic text-neutral-muted leading-relaxed"
                    renderStatic={() => (
                      <p className="text-sm italic text-neutral-muted leading-relaxed">
                        {test.quote}
                      </p>
                    )}
                  />

                  <div className="pt-2 border-t border-border">
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={test.name}
                      onChange={(val) => {
                        const copy = [...c.testimonials];
                        copy[idx].name = val;
                        setC({ ...c, testimonials: copy });
                        marcarCambio();
                      }}
                      label="Nombre autor"
                      className="text-xs font-bold text-primary"
                    />
                    <EditableField
                      isEditing={isAdmin && modoEdicion}
                      value={test.role}
                      onChange={(val) => {
                        const copy = [...c.testimonials];
                        copy[idx].role = val;
                        setC({ ...c, testimonials: copy });
                        marcarCambio();
                      }}
                      label="Cargo o rol"
                      className="text-[11px] text-tertiary block"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Container>
      </main>
    </div>
  );
}

