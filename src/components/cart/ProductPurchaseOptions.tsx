"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import type { Producto } from "@/types";

export function ProductPurchaseOptions({ product }: { product: Producto }) {
  const presentations = product.presentaciones || [];
  const [presentationId, setPresentationId] = useState(presentations[0]?.id ?? "");
  const presentation = presentations.find((item) => item.id === presentationId) ?? presentations[0];

  const purchaseProduct: Producto = presentation
    ? {
        ...product,
        precio: presentation.precio,
        stock: product.disponible ? presentation.stock : 0,
        peso: presentation.nombre_presentacion
          || (presentation.peso_gramos ? `${presentation.peso_gramos} g` : product.peso),
        variante_id: presentation.id,
      }
    : { ...product, stock: product.disponible ? product.stock : 0 };

  const isAvailable = product.disponible && purchaseProduct.stock > 0;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-background/60 p-4">
      {presentations.length > 0 && (
        <div className="space-y-2">
          <label htmlFor="product-presentation" className="block text-xs font-label font-semibold text-neutral">
            Presentación
          </label>
          {presentations.length > 1 ? (
            <select
              id="product-presentation"
              value={presentation?.id ?? ""}
              onChange={(event) => setPresentationId(event.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary"
            >
              {presentations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre_presentacion || `${item.peso_gramos ?? ""} g`} — {formatPrice(item.precio)}
                  {item.stock <= 0 ? " — Agotado" : ` — ${item.stock} disponibles`}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-neutral">
              {presentation?.nombre_presentacion || product.peso}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase font-label tracking-wider text-neutral-muted">Precio unitario</span>
          <p className="font-headline text-3xl font-bold text-primary">
            {formatPrice(purchaseProduct.precio)}
          </p>
        </div>
        {isAvailable ? (
          presentation?.is_low_stock ? <Badge variant="tertiary">Stock bajo</Badge> : null
        ) : (
          <Badge variant="secondary">Agotado</Badge>
        )}
      </div>

      <p className="text-xs text-neutral-muted">
        Stock disponible para esta presentación: {purchaseProduct.stock} unidades
      </p>
      <AddToCartButton
        key={purchaseProduct.variante_id ?? product.id}
        product={purchaseProduct}
        showQuantitySelector
        size="lg"
        variant="primary"
      />
    </div>
  );
}
