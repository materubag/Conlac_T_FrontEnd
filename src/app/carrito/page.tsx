"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CartIcon, ArrowRightIcon, ShieldCheckIcon } from "@/components/ui/Icons";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function CarritoPage() {
  const {
    items,
    totalItems,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Tienda", href: "/tienda" },
            { label: "Carrito de Compras" },
          ]}
        />

        <div className="max-w-2xl mb-8">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Resumen de tu pedido
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Carrito de Compras
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-muted">
            Revisa los quesos seleccionados y sus cantidades antes de coordinar tu pedido.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center max-w-lg mx-auto space-y-4 my-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-light/60 text-neutral-muted mx-auto">
              <CartIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-headline text-xl font-bold text-primary">
                Tu carrito está vacío
              </h2>
              <p className="text-sm text-neutral-muted">
                No tienes productos en tu pedido. Visita nuestro catálogo para conocer nuestros quesos andinos.
              </p>
            </div>
            <Button href="/tienda" variant="primary" size="md">
              <span>Explorar la Tienda</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
            
            {/* ============================================================
                1. LISTA DE PRODUCTOS EN EL CARRITO
                ============================================================ */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <span className="text-xs font-label uppercase tracking-wider text-neutral-muted font-semibold">
                  Productos ({totalItems} unidades)
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-neutral-muted hover:text-red-600 transition-colors underline"
                >
                  Vaciar carrito
                </button>
              </div>

              {items.map((item) => {
                const isMax = item.cantidad >= item.stock;
                const itemTotal = item.precio * item.cantidad;

                return (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between shadow-xs"
                  >
                    <div className="flex items-center gap-4">
                      {/* Imagen con fallback */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-light/50 border border-border/60">
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          className="object-cover object-center"
                        />
                      </div>

                      <div>
                        <h3 className="font-headline text-base sm:text-lg font-bold text-primary">
                          {item.slug ? (
                            <Link href={`/tienda/${item.slug}`} className="hover:underline">
                              {item.nombre}
                            </Link>
                          ) : (
                            item.nombre
                          )}
                        </h3>
                        {item.asociacion && (
                          <p className="text-xs text-neutral-muted mt-0.5">
                            {item.asociacion}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-primary mt-1">
                          {formatPrice(item.precio)} c/u
                        </p>
                      </div>
                    </div>

                    {/* Controles de cantidad y precio */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border/60">
                      <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="px-3 py-1.5 text-sm text-primary hover:bg-neutral-light transition-colors font-bold select-none"
                          aria-label={`Disminuir ${item.nombre}`}
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-label font-bold text-primary min-w-[28px] text-center">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          disabled={isMax}
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className={`px-3 py-1.5 text-sm font-bold select-none transition-colors ${
                            isMax
                              ? "text-neutral-muted/40 cursor-not-allowed bg-neutral-light/40"
                              : "text-primary hover:bg-neutral-light"
                          }`}
                          aria-label={`Aumentar ${item.nombre}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <span className="font-headline text-base sm:text-lg font-bold text-primary block">
                          {formatPrice(itemTotal)}
                        </span>
                        {isMax && (
                          <span className="text-[10px] text-amber-700 font-medium block">
                            Máx. disponible
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-muted hover:text-red-600 transition-colors p-1"
                        title="Eliminar del carrito"
                        aria-label={`Eliminar ${item.nombre}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <Button href="/tienda" variant="outlined" size="sm">
                  <span>← Continuar comprando</span>
                </Button>
              </div>
            </div>

            {/* ============================================================
                2. TARJETA RESUMEN DE COMPRA
                ============================================================ */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm space-y-6">
              <h2 className="font-headline text-xl font-bold text-primary border-b border-border pb-3">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-neutral-muted">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span className="font-semibold text-neutral">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-neutral-muted">
                  <span>Entrega / Envío</span>
                  <span className="text-xs text-primary font-medium">Por coordinar</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between text-base font-bold text-primary">
                  <span>Total estimado</span>
                  <span className="font-headline text-2xl text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-background p-4 text-xs text-neutral-muted border border-border/80 space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <ShieldCheckIcon className="w-4 h-4 text-tertiary" />
                  <span>Garantía Comunitaria</span>
                </div>
                <p>
                  Tus quesos se preparan artesanalmente en las plantas comunitarias de Pilahuín bajo rigurosos estándares sanitarios.
                </p>
              </div>

              <Button
                href="/checkout"
                variant="primary"
                size="lg"
                fullWidth
              >
                <span>Continuar al Checkout</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>
            </div>

          </div>
        )}

      </Container>
    </div>
  );
}
