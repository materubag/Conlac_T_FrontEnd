"use client";

import { adminResponseError, imageFileError, imageValueError, IMAGE_ACCEPT } from "@/lib/adminValidation";
import React, { useState, useRef } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/home/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { AdminBadgeHelp, AdminPageBar } from "@/components/admin/AdminPageBar";
import { EditableField } from "@/components/admin/EditableField";
import type { PaginaEditableConfig } from "@/lib/db/paginasRepo";
import type { Producto, Asociacion } from "@/types";

export interface TiendaContenido {
  productos?: Producto[];
}

interface Props {
  initialConfig: PaginaEditableConfig<TiendaContenido>;
  products: Producto[];
  asociacion: Asociacion | null;
  error: string | null;
}

export function TiendaManager({ initialConfig, products: serverProducts, asociacion, error }: Props) {
  const { canEdit } = useAuth();
  const [modoEdicion, setModoEdicion] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [eyebrow, setEyebrow] = useState(initialConfig.eyebrow);
  const [titulo, setTitulo] = useState(
    asociacion ? `Quesos de ${asociacion.nombre}` : initialConfig.titulo
  );
  const [subtitulo, setSubtitulo] = useState(
    asociacion
      ? `Explora los productos elaborados por ${asociacion.nombre}.`
      : initialConfig.subtitulo
  );

  // Inicializar productos desde SQLite si existen, o desde el fallback del servidor
  const [productos, setProductos] = useState<Producto[]>(() => {
    if (initialConfig.contenido?.productos && initialConfig.contenido.productos.length > 0) {
      return initialConfig.contenido.productos;
    }
    return serverProducts;
  });

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
      const res = await fetch("/api/admin/paginas/tienda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow,
          titulo,
          subtitulo,
          contenido: {
            productos,
          },
        }),
      });

      if (!res.ok) throw new Error(await adminResponseError(res));
      setIsDirty(false);
      mostrarToast("Catálogo y productos guardados en SQLite");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al guardar los cambios";
      console.error(err);
      mostrarToast(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Manejo de fotos de producto
  const abrirSelectorImagen = (index: number) => {
    targetImageIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = targetImageIndexRef.current;
    if (!file || index === null || !productos[index]) return;

    const imageError = imageFileError(file);
    if (imageError) { mostrarToast(imageError); e.target.value = ""; return; }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const imageError = imageValueError(dataUrl);
      if (imageError) { mostrarToast(imageError); return; }
      const nuevos = [...productos];
      nuevos[index] = { ...nuevos[index], fotos: [dataUrl] };
      setProductos(nuevos);
      marcarCambio();
      mostrarToast("Foto de producto actualizada");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Acciones sobre productos
  const agregarProducto = () => {
    const nuevo: Producto = {
      id: `prod-${Date.now()}`,
      slug: `producto-artesanal-${Date.now()}`,
      nombre: "Nuevo Queso Artesanal",
      tipo_queso: "Queso Especial de Páramo",
      peso: "500 g",
      precio: 3.5,
      fotos: ["/demo/PROD-fresco.jpg"],
      asociacion: "Asociación Comunitaria CONLAC-T",
      stock: 25,
      disponible: true,
      oculto: false,
    };
    setProductos([...productos, nuevo]);
    marcarCambio();
    mostrarToast("Nuevo producto añadido al catálogo");
  };

  const duplicarProducto = (index: number) => {
    const p = productos[index];
    const copia: Producto = {
      ...p,
      id: `prod-${Date.now()}`,
      slug: `${p.slug || p.id}-copia-${Date.now()}`,
      nombre: `${p.nombre} (Copia)`,
    };
    const nuevos = [...productos];
    nuevos.splice(index + 1, 0, copia);
    setProductos(nuevos);
    marcarCambio();
    mostrarToast("Producto duplicado");
  };

  const eliminarProducto = (index: number) => {
    const p = productos[index];
    if (!confirm(`¿Eliminar el producto "${p.nombre}" de la tienda?`)) return;
    setProductos(productos.filter((_, i) => i !== index));
    marcarCambio();
    mostrarToast("Producto eliminado");
  };

  const alternarVisibilidad = (index: number) => {
    setProductos((actuales) => actuales.map((producto, i) =>
      i === index ? { ...producto, oculto: !producto.oculto } : producto
    ));
    marcarCambio();
  };

  const enModoEdicion = canEdit && modoEdicion;
  const coincideAsociacion = (producto: Producto) => !asociacion || producto.asociacion_id === asociacion.id ||
    producto.asociacion_id === asociacion.slug || producto.asociacion === asociacion.nombre;
  const hayProductosVisibles = productos.some((producto) => !producto.oculto && producto.stock > 0 && coincideAsociacion(producto));

  const moverIzquierda = (index: number) => {
    if (index === 0) return;
    const nuevos = [...productos];
    const temp = nuevos[index];
    nuevos[index] = nuevos[index - 1];
    nuevos[index - 1] = temp;
    setProductos(nuevos);
    marcarCambio();
  };

  const moverDerecha = (index: number) => {
    if (index === productos.length - 1) return;
    const nuevos = [...productos];
    const temp = nuevos[index];
    nuevos[index] = nuevos[index + 1];
    nuevos[index + 1] = temp;
    setProductos(nuevos);
    marcarCambio();
  };

  return (
    <div className="relative min-h-screen bg-background">
      <input
        ref={fileInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        onChange={handleArchivoSeleccionado}
        className="hidden"
      />

      {canEdit && (
        <AdminPageBar
          pageName="Tienda"
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
              { label: "Tienda" },
            ]}
          />

          <div className="max-w-2xl mb-10">
            <EditableField rule="short"
              isEditing={canEdit && modoEdicion}
              value={eyebrow}
              onChange={(val) => {
                setEyebrow(val);
                marcarCambio();
              }}
              label="Clic para editar categoría"
              className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold"
            />

            <div className="mt-2">
              <EditableField rule="title"
                isEditing={canEdit && modoEdicion}
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
              <EditableField rule="subtitle"
                isEditing={canEdit && modoEdicion}
                value={subtitulo}
                onChange={(val) => {
                  setSubtitulo(val);
                  marcarCambio();
                }}
                label="Clic para editar descripción"
                className="text-base text-neutral-muted"
                renderStatic={() => (
                  <p className="text-base text-neutral-muted">{subtitulo}</p>
                )}
              />
            </div>

            {asociacion && (
              <Button href="/tienda" variant="ghost" size="sm" className="mt-3">
                Ver catálogo completo
              </Button>
            )}

            {canEdit && modoEdicion && (
              <AdminBadgeHelp message="Puedes editar los productos y controlar su visibilidad sin cambiar el stock. Pulsa Guardar cambios para publicar." />
            )}
          </div>

          {error && productos.length === 0 && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden="true">
                  ⚠️
                </span>
                <div>
                  <h3 className="font-semibold text-sm">No pudimos cargar el catálogo</h3>
                  <p className="text-xs mt-1 text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Grid de Productos */}
          {!enModoEdicion && !hayProductosVisibles && !error && (
            <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-neutral-muted">
              No hay productos para mostrar en este momento.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {productos.map((product, index) => {
              if (!enModoEdicion && (product.oculto || !(product.stock > 0))) return null;
              if (!enModoEdicion && !coincideAsociacion(product)) return null;

              const imageSrc =
                product.fotos?.[0] || "/placeholders/product-queso-fresco.svg";

              // Si NO es modo admin edición, renderizamos el ProductCard original
              if (!canEdit || !modoEdicion) {
                return <ProductCard key={product.id} product={product} />;
              }

              // Si es MODO EDICIÓN, renderizamos la tarjeta interactiva editable
              return (
                <article
                  key={product.id}
                  className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface border-2 border-blue-300 ring-2 ring-blue-500/10 p-4 shadow-sm hover:border-blue-500 transition-all"
                >
                  {/* Barra de herramientas flotante */}
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-surface/95 border border-border rounded-full px-2 py-1 shadow-md">
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
                      disabled={index === productos.length - 1}
                      title="Mover a la derecha"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-600 hover:text-blue-600 disabled:opacity-30"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicarProducto(index)}
                      title="Duplicar producto"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-neutral-600 hover:text-blue-600"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarProducto(index)}
                      title="Eliminar producto"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  {/* Imagen y Cambio de foto */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-neutral-light/40 mb-3">
                    <Image
                      src={imageSrc}
                      alt={product.nombre}
                      fill
                      className="object-cover object-center"
                      unoptimized={imageSrc.startsWith("data:")}
                    />

                    {/* Botón cambiar imagen */}
                    <button
                      type="button"
                      onClick={() => abrirSelectorImagen(index)}
                      className="absolute inset-x-2 bottom-2 py-1 px-2 rounded-lg bg-[#111c17]/90 text-white text-[11px] font-semibold text-center hover:bg-[#111c17] transition shadow-xs"
                    >
                      Cambiar foto · máx. 5 MB
                    </button>
                  </div>

                  <div className="mb-3 rounded-xl border border-border bg-background p-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={!product.oculto}
                      aria-label={`Mostrar en tienda: ${product.nombre}`}
                      onClick={() => alternarVisibilidad(index)}
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2"
                    >
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                        <svg aria-hidden="true" className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                          <circle cx="12" cy="12" r="3" />
                          {product.oculto && <path d="m3 3 18 18" />}
                        </svg>
                        {product.oculto ? "Oculto al público" : "Mostrar en tienda"}
                      </span>
                      <span aria-hidden="true" className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors ${product.oculto ? "border-tertiary bg-tertiary/30" : "border-primary bg-primary"}`}>
                        <span className={`h-4 w-4 rounded-full bg-surface shadow-sm transition-transform ${product.oculto ? "translate-x-0" : "translate-x-5"}`} />
                      </span>
                    </button>
                  </div>

                  {/* Datos editables */}
                  <div className="space-y-2 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      {/* Tipo / Badge */}
                      <EditableField rule="short"
                        isEditing={true}
                        value={product.tipo_queso || "Queso Artesanal"}
                        onChange={(val) => {
                          const copy = [...productos];
                          copy[index].tipo_queso = val;
                          setProductos(copy);
                          marcarCambio();
                        }}
                        label="Tipo de queso"
                        className="text-[11px] font-bold text-tertiary"
                      />

                      {/* Nombre */}
                      <EditableField rule="title"
                        isEditing={true}
                        value={product.nombre}
                        onChange={(val) => {
                          const copy = [...productos];
                          copy[index].nombre = val;
                          setProductos(copy);
                          marcarCambio();
                        }}
                        label="Nombre del producto"
                        className="font-headline text-base font-bold text-primary"
                      />

                      {/* Asociación */}
                      <EditableField rule="title"
                        isEditing={true}
                        value={product.asociacion || "CONLAC-T"}
                        onChange={(val) => {
                          const copy = [...productos];
                          copy[index].asociacion = val;
                          setProductos(copy);
                          marcarCambio();
                        }}
                        label="Asociación"
                        className="text-xs text-neutral-muted"
                      />
                    </div>

                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {/* Peso */}
                        <div className="w-1/2">
                          <label className="text-[10px] text-neutral-muted block font-semibold mb-0.5">
                            Presentación:
                          </label>
                          <EditableField rule="short"
                            isEditing={true}
                            value={product.peso || "500 g"}
                            onChange={(val) => {
                              const copy = [...productos];
                              copy[index].peso = val;
                              setProductos(copy);
                              marcarCambio();
                            }}
                            label="Peso / Presentación"
                            className="text-xs font-semibold text-neutral"
                          />
                        </div>

                        {/* Precio */}
                        <div className="w-1/2">
                          <label className="text-[10px] text-neutral-muted block font-semibold mb-0.5">
                            Precio ($):
                          </label>
                          <EditableField rule="price"
                            isEditing={true}
                            value={String(product.precio)}
                            onChange={(val) => {
                              const copy = [...productos];
                              copy[index].precio = parseFloat(val) || 0;
                              setProductos(copy);
                              marcarCambio();
                            }}
                            label="Precio"
                            className="text-sm font-bold text-primary"
                          />
                        </div>
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="text-[10px] text-neutral-muted block font-semibold mb-0.5">
                          Unidades en stock:
                        </label>
                        <EditableField rule="stock"
                          isEditing={true}
                          value={String(product.stock ?? 10)}
                          onChange={(val) => {
                            const copy = [...productos];
                            copy[index].stock = parseInt(val) || 0;
                            setProductos(copy);
                            marcarCambio();
                          }}
                          label="Stock disponible"
                          className="text-xs font-medium text-neutral"
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Tarjeta "+ Añadir Producto" */}
            {canEdit && modoEdicion && (
              <button
                type="button"
                onClick={agregarProducto}
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-tertiary/70 hover:border-primary hover:bg-primary/5 text-tertiary hover:text-primary transition min-h-[380px] gap-3 font-semibold text-sm group"
              >
                <div className="w-12 h-12 rounded-full bg-tertiary/15 group-hover:bg-primary/15 flex items-center justify-center text-2xl font-bold transition">
                  +
                </div>
                <span>Añadir nuevo producto</span>
              </button>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
