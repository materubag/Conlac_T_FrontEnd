"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { CloseIcon, CartIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    notification,
    clearNotification,
  } = useCart();

  const goToCheckout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    router.push("/checkout");
    closeCart();
  };

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Bloquear scroll de la página cuando el drawer está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="cart-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Fondo oscuro traslúcido */}
      <div
        className="fixed inset-0 bg-neutral/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#F8F4E9] shadow-2xl flex flex-col justify-between border-l border-border animate-slideInRight">
          
          {/* ============================================================
              1. ENCABEZADO DEL DRAWER
              ============================================================ */}
          <div className="p-6 border-b border-border bg-surface flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-inverted">
                <CartIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 id="cart-drawer-title" className="font-headline text-lg font-bold text-primary">
                  Carrito de Compras
                </h2>
                <p className="text-xs text-neutral-muted">
                  {totalItems} {totalItems === 1 ? "unidad" : "unidades"} en tu pedido
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCart}
              className="p-2 rounded-xl text-neutral hover:text-primary hover:bg-neutral-light transition-colors focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:outline-none"
              aria-label="Cerrar carrito de compras"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Toast de notificación interna */}
          {notification && (
            <div
              className={`mx-4 mt-4 p-3 rounded-xl text-xs flex items-center justify-between ${
                notification.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              <span>{notification.message}</span>
              <button
                type="button"
                onClick={clearNotification}
                className="ml-2 font-bold hover:opacity-70"
                aria-label="Cerrar notificación"
              >
                ✕
              </button>
            </div>
          )}

          {/* ============================================================
              2. LISTA DE PRODUCTOS O ESTADO VACÍO
              ============================================================ */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-light/60 text-neutral-muted">
                  <CartIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-headline text-lg font-bold text-primary">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-muted max-w-xs">
                    Explora nuestra selección de quesos frescos, amasados y madurados de Tungurahua.
                  </p>
                </div>
                <Button
                  href="/tienda"
                  variant="primary"
                  size="md"
                  onClick={closeCart}
                >
                  Explorar la Tienda
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const isMaxStock = item.cantidad >= item.stock;
                  const itemTotal = item.precio * item.cantidad;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-surface border border-border shadow-xs flex gap-4"
                    >
                      {/* Imagen con fallback */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-light/50 border border-border/60">
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          className="object-cover object-center"
                        />
                      </div>

                      {/* Info y controles */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-headline text-sm font-bold text-primary line-clamp-1">
                              {item.slug ? (
                                <Link
                                  href={`/tienda/${item.slug}`}
                                  onClick={closeCart}
                                  className="hover:underline"
                                >
                                  {item.nombre}
                                </Link>
                              ) : (
                                item.nombre
                              )}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-neutral-muted hover:text-red-600 transition-colors text-xs p-1"
                              title="Eliminar producto"
                              aria-label={`Eliminar ${item.nombre} del carrito`}
                            >
                              ✕
                            </button>
                          </div>

                          {item.asociacion && (
                            <p className="text-[11px] text-neutral-muted">
                              {item.asociacion}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-primary mt-1">
                            {formatPrice(item.precio)} c/u
                          </p>
                        </div>

                        {/* Modificador de cantidad y subtotal de línea */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                              className="px-2.5 py-1 text-xs text-primary hover:bg-neutral-light transition-colors font-bold select-none"
                              aria-label={`Disminuir cantidad de ${item.nombre}`}
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-label font-bold text-primary min-w-[20px] text-center">
                              {item.cantidad}
                            </span>
                            <button
                              type="button"
                              disabled={isMaxStock}
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              className={`px-2.5 py-1 text-xs font-bold select-none transition-colors ${
                                isMaxStock
                                  ? "text-neutral-muted/40 cursor-not-allowed bg-neutral-light/40"
                                  : "text-primary hover:bg-neutral-light"
                              }`}
                              aria-label={`Aumentar cantidad de ${item.nombre}`}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="font-headline text-sm font-bold text-primary">
                              {formatPrice(itemTotal)}
                            </span>
                            {isMaxStock && (
                              <span className="block text-[10px] text-amber-700 font-medium">
                                Máx. {item.stock} uds.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ============================================================
              3. RESUMEN Y BOTONES DE ACCIÓN
              ============================================================ */}
          {items.length > 0 && (
            <div className="p-6 border-t border-border bg-surface space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-base">
                  <span className="font-label font-bold text-neutral">Subtotal</span>
                  <span className="font-headline text-xl font-bold text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-muted">
                  Envío calculado al coordinar entrega con la asociación productora.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  href="/checkout"
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={goToCheckout}
                >
                  Continuar al checkout
                </Button>

                <div className="flex gap-2">
                  <Button
                    href="/carrito"
                    variant="outlined"
                    size="sm"
                    fullWidth
                    onClick={closeCart}
                  >
                    Ver carrito
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-xs text-neutral-muted hover:text-red-600"
                  >
                    Vaciar
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
