"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CartIcon } from "@/components/ui/Icons";
import type { Producto, CartItem } from "@/types";

interface AddToCartButtonProps {
  product: Producto | CartItem;
  showQuantitySelector?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "outlined" | "secondary";
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  product,
  showQuantitySelector = false,
  size = "md",
  className,
  variant = "primary",
}) => {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);

  const stock = typeof product.stock === "number" ? product.stock : 99;
  const isOutOfStock = stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    const res = addItem(product, quantity);
    if (res.success) {
      setFeedback("¡Agregado!");
      setTimeout(() => setFeedback(null), 2000);
      openCart();
    } else {
      setFeedback(res.message);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  if (isOutOfStock) {
    return (
      <Button
        variant="outlined"
        size={size}
        disabled
        className={`opacity-50 cursor-not-allowed ${className || ""}`}
      >
        <span>Agotado</span>
      </Button>
    );
  }

  if (showQuantitySelector) {
    return (
      <div className={`space-y-3 ${className || ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3.5 py-2 text-base font-bold text-primary hover:bg-neutral-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Disminuir cantidad"
            >
              -
            </button>
            <span className="px-4 text-sm font-label font-bold text-primary min-w-[36px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= stock}
              onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
              className="px-3.5 py-2 text-base font-bold text-primary hover:bg-neutral-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <span className="text-xs text-neutral-muted">
            {stock} disponibles
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={variant}
            size={size}
            onClick={handleAdd}
            className="flex-1 shadow-sm"
          >
            <CartIcon className="w-5 h-5" />
            <span>{feedback || "Agregar al carrito"}</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAdd}
      className={`group ${className || ""}`}
      aria-label={`Agregar ${product.nombre} al carrito`}
    >
      <CartIcon className="w-4 h-4" />
      <span>{feedback || "Al carrito"}</span>
    </Button>
  );
};
