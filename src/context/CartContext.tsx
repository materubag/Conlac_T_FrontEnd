"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { CartItem, Producto } from "@/types";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  notification: { message: string; type: "success" | "warning" } | null;
  addItem: (product: Producto | CartItem, quantity?: number) => { success: boolean; message: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  clearNotification: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "conlact_cart";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  // 1. Cargar desde localStorage tras montaje en cliente para evitar hydration mismatches
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Ignorar error al parsear localStorage
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Persistir en localStorage cuando los items cambian (solo después de haber inicializado)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Manejar cuota de localStorage excedida si aplica
    }
  }, [items, isInitialized]);

  // Limpiar notificación tras 4 segundos
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Subtotal recalculado dinámicamente en el cliente
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  }, [items]);

  // Total de unidades en el carrito
  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.cantidad, 0);
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback(
    (product: Producto | CartItem, quantity: number = 1): { success: boolean; message: string } => {
      const qty = Math.max(1, quantity);
      const stock = typeof product.stock === "number" ? product.stock : 99;

      if (stock <= 0) {
        const msg = `Lo sentimos, "${product.nombre}" se encuentra temporalmente agotado.`;
        setNotification({ message: msg, type: "warning" });
        return { success: false, message: msg };
      }

      let success = true;
      let returnMsg = "";

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.id === product.id);

        if (existingIndex > -1) {
          const currentItem = prevItems[existingIndex];
          const newQty = currentItem.cantidad + qty;

          if (newQty > stock) {
            success = false;
            returnMsg = `Has alcanzado el stock disponible (${stock} unidades) de "${product.nombre}".`;
            setNotification({ message: returnMsg, type: "warning" });
            return prevItems;
          }

          const updated = [...prevItems];
          updated[existingIndex] = {
            ...currentItem,
            cantidad: newQty,
          };
          returnMsg = `Se agregaron ${qty} unidad(es) de "${product.nombre}" al carrito.`;
          setNotification({ message: returnMsg, type: "success" });
          return updated;
        } else {
          if (qty > stock) {
            success = false;
            returnMsg = `Solo hay ${stock} unidades disponibles de "${product.nombre}".`;
            setNotification({ message: returnMsg, type: "warning" });
            return prevItems;
          }

          // Resolver variante_id obligatoria para la orden en backend
          const defaultVariantMap: Record<string, string> = {
            "b0000000-0000-0000-0000-000000000001": "ba000000-0000-0000-0000-000000000001",
            "queso-fresco-artesanal-el-lindero": "ba000000-0000-0000-0000-000000000001",
            "prod-queso-fresco": "ba000000-0000-0000-0000-000000000001",
            "b0000000-0000-0000-0000-000000000002": "ba000000-0000-0000-0000-000000000003",
            "queso-de-hoja-tradicional-mulanleo": "ba000000-0000-0000-0000-000000000003",
            "prod-queso-amasado": "ba000000-0000-0000-0000-000000000003",
            "prod-quesillo": "ba000000-0000-0000-0000-000000000003",
            "b0000000-0000-0000-0000-000000000003": "ba000000-0000-0000-0000-000000000004",
            "queso-andino-con-oregano-silvestre": "ba000000-0000-0000-0000-000000000004",
            "prod-queso-maduro-andino": "ba000000-0000-0000-0000-000000000004",
          };

          let variantId: string | undefined = undefined;
          if ("variante_id" in product && product.variante_id) {
            variantId = product.variante_id;
          } else if ("presentaciones" in product && Array.isArray(product.presentaciones) && product.presentaciones.length > 0) {
            variantId = product.presentaciones[0].id;
          } else {
            variantId = defaultVariantMap[product.id] || (product.slug ? defaultVariantMap[product.slug] : undefined);
          }

          // Resolver imagen con fallback seguro
          let fotoUrl = "/placeholders/product-queso-fresco.svg";
          if ("imagen" in product && product.imagen) {
            fotoUrl = product.imagen;
          } else if ("fotos" in product && Array.isArray(product.fotos) && product.fotos.length > 0) {
            fotoUrl = product.fotos[0];
          }

          const newItem: CartItem = {
            id: product.id,
            variante_id: variantId,
            slug: product.slug,
            nombre: product.nombre,
            precio: product.precio,
            cantidad: qty,
            stock: stock,
            imagen: fotoUrl,
            peso: product.peso,
            asociacion: product.asociacion,
          };

          returnMsg = `"${product.nombre}" se agregó al carrito correctamente.`;
          setNotification({ message: returnMsg, type: "success" });
          return [...prevItems, newItem];
        }
      });

      return { success, message: returnMsg };
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number): { success: boolean; message?: string } => {
      if (quantity <= 0) {
        removeItem(productId);
        return { success: true };
      }

      let success = true;
      let returnMsg: string | undefined = undefined;

      setItems((prevItems) => {
        return prevItems.map((item) => {
          if (item.id === productId) {
            if (quantity > item.stock) {
              success = false;
              returnMsg = `Límite alcanzado: solo hay ${item.stock} unidades en stock.`;
              setNotification({ message: returnMsg, type: "warning" });
              return { ...item, cantidad: item.stock };
            }
            return { ...item, cantidad: quantity };
          }
          return item;
        });
      });

      return { success, message: returnMsg };
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => {
      const removed = prevItems.find((i) => i.id === productId);
      if (removed) {
        setNotification({
          message: `"${removed.nombre}" fue eliminado del carrito.`,
          type: "warning",
        });
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setNotification({
      message: "Se ha vaciado el carrito de compras.",
      type: "warning",
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        isCartOpen,
        notification,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        openCart,
        closeCart,
        toggleCart,
        clearNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser utilizado dentro de un <CartProvider>");
  }
  return context;
}
