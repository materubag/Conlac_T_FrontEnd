"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { urlDeIncrustacion } from "@/lib/video";
import {
  ETIQUETA_TIPO,
  TIPOS_CONTENIDO,
  type Contenido,
  type SeccionConContenidos,
  type TipoContenido,
} from "@/types/contenido";

const CAMPO =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary";
const ETIQUETA = "block text-xs font-label uppercase font-bold text-primary mb-1";

interface FormularioContenido {
  titulo: string;
  descripcion: string;
  tipo: TipoContenido;
  url: string;
  cuerpo: string;
  publicado: boolean;
}

const FORMULARIO_VACIO: FormularioContenido = {
  titulo: "",
  descripcion: "",
  tipo: "video",
  url: "",
  cuerpo: "",
  publicado: true,
};

export default function AdminContenidosPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading: cargandoSesion } = useAuth();

  const [secciones, setSecciones] = useState<SeccionConContenidos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  // Formulario de sección nueva
  const [tituloSeccion, setTituloSeccion] = useState("");
  const [descripcionSeccion, setDescripcionSeccion] = useState("");

  // Formulario de contenido: guarda el id de la sección en la que está abierto
  const [seccionAbierta, setSeccionAbierta] = useState<string | null>(null);
  const [formulario, setFormulario] = useState<FormularioContenido>(FORMULARIO_VACIO);
  const [editando, setEditando] = useState<string | null>(null);

  useEffect(() => {
    if (!cargandoSesion && !isAuthenticated) {
      router.push("/login?redirect=/administracion/contenidos");
    }
  }, [cargandoSesion, isAuthenticated, router]);

  // Solo obtiene datos; quien llama decide qué hacer con ellos. Mantenerlo sin
  // setState permite invocarlo desde un efecto sin provocar renders en cascada.
  const pedirSecciones = useCallback(async (): Promise<SeccionConContenidos[]> => {
    const res = await fetch("/api/admin/secciones", { cache: "no-store" });
    if (!res.ok) throw new Error(`No se pudo cargar el contenido (HTTP ${res.status})`);
    return res.json();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    let activo = true;
    pedirSecciones()
      .then((datos) => {
        if (!activo) return;
        setSecciones(datos);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!activo) return;
        setError(err instanceof Error ? err.message : "Error inesperado al cargar.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [isAdmin, pedirSecciones]);

  /** Envuelve una llamada mutante: bloquea la UI, propaga el mensaje de error y recarga. */
  const ejecutar = useCallback(
    async (fn: () => Promise<Response>) => {
      if (ocupado) return false;
      setOcupado(true);
      setError(null);
      try {
        const res = await fn();
        if (!res.ok) {
          let mensaje = `La operación falló (HTTP ${res.status})`;
          try {
            const datos = await res.json();
            if (datos?.error) mensaje = datos.error;
          } catch {
            // respuesta sin cuerpo JSON
          }
          throw new Error(mensaje);
        }
        setSecciones(await pedirSecciones());
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado.");
        return false;
      } finally {
        setOcupado(false);
      }
    },
    [ocupado, pedirSecciones]
  );

  const crearSeccion = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const ok = await ejecutar(() =>
      fetch("/api/admin/secciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: tituloSeccion.trim(),
          descripcion: descripcionSeccion.trim() || null,
          publicado: true,
        }),
      })
    );
    if (ok) {
      setTituloSeccion("");
      setDescripcionSeccion("");
    }
  };

  const guardarContenido = async (evento: React.FormEvent, seccionId: string) => {
    evento.preventDefault();

    const cuerpo = {
      titulo: formulario.titulo.trim(),
      descripcion: formulario.descripcion.trim() || null,
      tipo: formulario.tipo,
      url: formulario.tipo === "texto" ? null : formulario.url.trim(),
      cuerpo: formulario.tipo === "texto" ? formulario.cuerpo.trim() : null,
      publicado: formulario.publicado,
    };

    const ok = await ejecutar(() =>
      editando
        ? fetch(`/api/admin/contenidos/${editando}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cuerpo),
          })
        : fetch("/api/admin/contenidos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...cuerpo, seccion_id: seccionId }),
          })
    );

    if (ok) {
      setFormulario(FORMULARIO_VACIO);
      setSeccionAbierta(null);
      setEditando(null);
    }
  };

  const abrirEdicion = (contenido: Contenido) => {
    setFormulario({
      titulo: contenido.titulo,
      descripcion: contenido.descripcion ?? "",
      tipo: contenido.tipo,
      url: contenido.url ?? "",
      cuerpo: contenido.cuerpo ?? "",
      publicado: contenido.publicado,
    });
    setEditando(contenido.id);
    setSeccionAbierta(contenido.seccion_id);
  };

  // ---- Estados de acceso -----------------------------------------------

  if (cargandoSesion) {
    return (
      <div className="py-20 text-center text-sm text-neutral-muted">
        Comprobando permisos administrativos...
      </div>
    );
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <div className="py-16 bg-background">
        <Container>
          <div className="max-w-md mx-auto text-center rounded-3xl bg-surface border border-red-200 p-8 space-y-4">
            <h1 className="font-headline text-2xl font-bold text-red-900">
              403 — Acceso Denegado
            </h1>
            <p className="text-sm text-neutral-muted">
              La gestión de contenidos requiere permisos de administrador.
            </p>
            <Button href="/" variant="primary" size="md">
              Volver al inicio
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // ---- Panel -------------------------------------------------------------

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Administración", href: "/administracion" },
            { label: "Contenidos" },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border mb-8">
          <div>
            <span className="text-xs font-label uppercase tracking-widest text-amber-800 font-bold block">
              Gestor de Contenidos
            </span>
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary mt-1">
              Capacitación y Materiales
            </h1>
            <p className="text-sm text-neutral-muted mt-2 max-w-2xl">
              Organiza videos, documentos y guías en secciones, como en un aula virtual.
              Lo que publiques aquí aparece en la página pública de capacitación.
            </p>
          </div>
          <Button href="/capacitacion" variant="outlined" size="sm">
            Ver página pública
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-300 p-4 text-sm text-red-900">
            <span className="font-bold block">No se pudo completar la acción:</span>
            {error}
          </div>
        )}

        {/* Nueva sección */}
        <form
          onSubmit={crearSeccion}
          className="mb-10 p-6 rounded-2xl bg-surface border border-border space-y-4"
        >
          <h2 className="font-headline text-lg font-bold text-primary">Nueva sección</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="tituloSeccion" className={ETIQUETA}>
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="tituloSeccion"
                className={CAMPO}
                required
                minLength={3}
                maxLength={150}
                value={tituloSeccion}
                onChange={(e) => setTituloSeccion(e.target.value)}
                placeholder="Ej. Buenas prácticas de ordeño"
              />
            </div>
            <div>
              <label htmlFor="descSeccion" className={ETIQUETA}>
                Descripción (opcional)
              </label>
              <input
                id="descSeccion"
                className={CAMPO}
                maxLength={300}
                value={descripcionSeccion}
                onChange={(e) => setDescripcionSeccion(e.target.value)}
                placeholder="Para qué sirve esta sección"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" size="md" disabled={ocupado}>
            {ocupado ? "Guardando..." : "Crear sección"}
          </Button>
        </form>

        {/* Listado */}
        {cargando ? (
          <p className="text-sm text-neutral-muted py-8 text-center">Cargando contenidos...</p>
        ) : secciones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-neutral-muted">
              Todavía no hay secciones. Crea la primera con el formulario de arriba.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {secciones.map((seccion, indice) => (
              <section
                key={seccion.id}
                className="rounded-2xl bg-surface border border-border overflow-hidden"
              >
                <header className="p-5 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-headline text-xl font-bold text-primary">
                        {seccion.titulo}
                      </h2>
                      <Badge variant={seccion.publicado ? "tertiary" : "outline"}>
                        {seccion.publicado ? "Publicada" : "Borrador"}
                      </Badge>
                      <span className="text-xs text-neutral-muted">
                        {seccion.contenidos.length}{" "}
                        {seccion.contenidos.length === 1 ? "material" : "materiales"}
                      </span>
                    </div>
                    {seccion.descripcion && (
                      <p className="text-sm text-neutral-muted mt-1">{seccion.descripcion}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      aria-label="Subir sección"
                      disabled={ocupado || indice === 0}
                      onClick={() =>
                        ejecutar(() =>
                          fetch(`/api/admin/secciones/${seccion.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ mover: "arriba" }),
                          })
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-border text-xs hover:border-tertiary disabled:opacity-40"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Bajar sección"
                      disabled={ocupado || indice === secciones.length - 1}
                      onClick={() =>
                        ejecutar(() =>
                          fetch(`/api/admin/secciones/${seccion.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ mover: "abajo" }),
                          })
                        )
                      }
                      className="px-2.5 py-1.5 rounded-lg border border-border text-xs hover:border-tertiary disabled:opacity-40"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() =>
                        ejecutar(() =>
                          fetch(`/api/admin/secciones/${seccion.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ publicado: !seccion.publicado }),
                          })
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:border-tertiary disabled:opacity-40"
                    >
                      {seccion.publicado ? "Despublicar" : "Publicar"}
                    </button>
                    <button
                      type="button"
                      disabled={ocupado}
                      onClick={() => {
                        if (
                          confirm(
                            `¿Eliminar la sección "${seccion.titulo}" y sus ${seccion.contenidos.length} materiales? Esta acción no se puede deshacer.`
                          )
                        ) {
                          void ejecutar(() =>
                            fetch(`/api/admin/secciones/${seccion.id}`, { method: "DELETE" })
                          );
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-red-300 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </header>

                {/* Materiales */}
                <div className="divide-y divide-border">
                  {seccion.contenidos.length === 0 ? (
                    <p className="px-5 sm:px-6 py-5 text-sm text-neutral-muted">
                      Esta sección aún no tiene materiales.
                    </p>
                  ) : (
                    seccion.contenidos.map((contenido, i) => {
                      const incrustado =
                        contenido.tipo === "video" ? urlDeIncrustacion(contenido.url) : null;

                      return (
                        <article
                          key={contenido.id}
                          className="px-5 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-start gap-4"
                        >
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="highlight">{ETIQUETA_TIPO[contenido.tipo]}</Badge>
                              <span className="font-semibold text-sm text-primary">
                                {contenido.titulo}
                              </span>
                              {!contenido.publicado && (
                                <Badge variant="outline">Borrador</Badge>
                              )}
                            </div>

                            {contenido.descripcion && (
                              <p className="text-xs text-neutral-muted">{contenido.descripcion}</p>
                            )}

                            {contenido.tipo === "texto" && contenido.cuerpo && (
                              <p className="text-xs text-neutral whitespace-pre-line bg-background rounded-lg p-3 border border-border/70 mt-2">
                                {contenido.cuerpo}
                              </p>
                            )}

                            {contenido.url && (
                              <a
                                href={contenido.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-tertiary underline break-all inline-block"
                              >
                                {contenido.url}
                              </a>
                            )}

                            {incrustado && (
                              <div className="mt-2 aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border">
                                <iframe
                                  src={incrustado}
                                  title={contenido.titulo}
                                  className="h-full w-full"
                                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}

                            {contenido.tipo === "video" && contenido.url && !incrustado && (
                              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 inline-block">
                                No se reconoce el proveedor; se mostrará como enlace. Usa YouTube o
                                Vimeo para ver el reproductor.
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            <button
                              type="button"
                              aria-label="Subir material"
                              disabled={ocupado || i === 0}
                              onClick={() =>
                                ejecutar(() =>
                                  fetch(`/api/admin/contenidos/${contenido.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ mover: "arriba" }),
                                  })
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-border text-xs hover:border-tertiary disabled:opacity-40"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              aria-label="Bajar material"
                              disabled={ocupado || i === seccion.contenidos.length - 1}
                              onClick={() =>
                                ejecutar(() =>
                                  fetch(`/api/admin/contenidos/${contenido.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ mover: "abajo" }),
                                  })
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-border text-xs hover:border-tertiary disabled:opacity-40"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              disabled={ocupado}
                              onClick={() =>
                                ejecutar(() =>
                                  fetch(`/api/admin/contenidos/${contenido.id}`, {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ publicado: !contenido.publicado }),
                                  })
                                )
                              }
                              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:border-tertiary disabled:opacity-40"
                            >
                              {contenido.publicado ? "Despublicar" : "Publicar"}
                            </button>
                            <button
                              type="button"
                              disabled={ocupado}
                              onClick={() => abrirEdicion(contenido)}
                              className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:border-tertiary disabled:opacity-40"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              disabled={ocupado}
                              onClick={() => {
                                if (confirm(`¿Eliminar "${contenido.titulo}"?`)) {
                                  void ejecutar(() =>
                                    fetch(`/api/admin/contenidos/${contenido.id}`, {
                                      method: "DELETE",
                                    })
                                  );
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-red-300 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
                            >
                              Eliminar
                            </button>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>

                {/* Formulario de material */}
                <div className="px-5 sm:px-6 py-4 bg-background border-t border-border">
                  {seccionAbierta === seccion.id ? (
                    <form
                      onSubmit={(e) => guardarContenido(e, seccion.id)}
                      className="space-y-4 animate-fadeIn"
                    >
                      <h3 className="font-headline text-sm font-bold text-primary">
                        {editando ? "Editar material" : "Nuevo material"}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className={ETIQUETA} htmlFor={`titulo-${seccion.id}`}>
                            Título <span className="text-red-500">*</span>
                          </label>
                          <input
                            id={`titulo-${seccion.id}`}
                            className={CAMPO}
                            required
                            minLength={3}
                            maxLength={150}
                            value={formulario.titulo}
                            onChange={(e) =>
                              setFormulario({ ...formulario, titulo: e.target.value })
                            }
                            placeholder="Ej. Ordeño higiénico paso a paso"
                          />
                        </div>

                        <div>
                          <label className={ETIQUETA} htmlFor={`tipo-${seccion.id}`}>
                            Tipo <span className="text-red-500">*</span>
                          </label>
                          <select
                            id={`tipo-${seccion.id}`}
                            className={CAMPO}
                            value={formulario.tipo}
                            onChange={(e) =>
                              setFormulario({
                                ...formulario,
                                tipo: e.target.value as TipoContenido,
                              })
                            }
                          >
                            {TIPOS_CONTENIDO.map((t) => (
                              <option key={t} value={t}>
                                {ETIQUETA_TIPO[t]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={ETIQUETA} htmlFor={`desc-${seccion.id}`}>
                          Descripción (opcional)
                        </label>
                        <input
                          id={`desc-${seccion.id}`}
                          className={CAMPO}
                          maxLength={300}
                          value={formulario.descripcion}
                          onChange={(e) =>
                            setFormulario({ ...formulario, descripcion: e.target.value })
                          }
                        />
                      </div>

                      {formulario.tipo === "texto" ? (
                        <div>
                          <label className={ETIQUETA} htmlFor={`cuerpo-${seccion.id}`}>
                            Contenido <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            id={`cuerpo-${seccion.id}`}
                            className={`${CAMPO} resize-y`}
                            rows={5}
                            required
                            maxLength={5000}
                            value={formulario.cuerpo}
                            onChange={(e) =>
                              setFormulario({ ...formulario, cuerpo: e.target.value })
                            }
                            placeholder="Escribe aquí la guía, el instructivo o los pasos."
                          />
                        </div>
                      ) : (
                        <div>
                          <label className={ETIQUETA} htmlFor={`url-${seccion.id}`}>
                            Enlace <span className="text-red-500">*</span>
                          </label>
                          <input
                            id={`url-${seccion.id}`}
                            className={CAMPO}
                            type="url"
                            required
                            value={formulario.url}
                            onChange={(e) => setFormulario({ ...formulario, url: e.target.value })}
                            placeholder={
                              formulario.tipo === "video"
                                ? "https://www.youtube.com/watch?v=..."
                                : "https://..."
                            }
                          />
                          {formulario.tipo === "video" && (
                            <p className="text-[11px] text-neutral-muted mt-1">
                              Se reconocen YouTube y Vimeo para mostrar el reproductor incrustado.
                            </p>
                          )}
                        </div>
                      )}

                      <label className="flex items-center gap-2 text-xs text-neutral">
                        <input
                          type="checkbox"
                          checked={formulario.publicado}
                          onChange={(e) =>
                            setFormulario({ ...formulario, publicado: e.target.checked })
                          }
                        />
                        Visible en la página pública
                      </label>

                      <div className="flex gap-2">
                        <Button type="submit" variant="primary" size="sm" disabled={ocupado}>
                          {ocupado ? "Guardando..." : editando ? "Guardar cambios" : "Agregar"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSeccionAbierta(null);
                            setEditando(null);
                            setFormulario(FORMULARIO_VACIO);
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="outlined"
                      size="sm"
                      onClick={() => {
                        setSeccionAbierta(seccion.id);
                        setEditando(null);
                        setFormulario(FORMULARIO_VACIO);
                      }}
                    >
                      + Agregar material
                    </Button>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
