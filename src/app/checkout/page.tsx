"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { siteConfig } from "@/lib/config";
import { formatPrice, buildWhatsAppUrl } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ShieldCheckIcon, WhatsAppIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { bankDetails } from "@/lib/bank";
import type { OrderCreateRequest, OrderCreateResponse } from "@/types";

type ShippingZone = {id:string;name:string;delivery_fee:number;delivery_days:string};

export default function CheckoutPage() {
  const { items, totalItems, subtotal, clearCart } = useCart();
  const { user, profile, isAuthenticated, getAccessToken } = useAuth();

  const [SHIPPING_ZONES, setShippingZones] = useState<ShippingZone[]>([]);
  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [cedulaRuc, setCedulaRuc] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [metodoEntrega, setMetodoEntrega] = useState<"delivery" | "pickup">("pickup");
  const [zonaEnvioId, setZonaEnvioId] = useState("");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const metodoPago = "transferencia" as const;
  const [notasCliente, setNotasCliente] = useState("");

  // Autocomplete only when the authenticated identity changes; keep customer edits.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        setNombre(current => current || profile?.full_name || user.user_metadata?.full_name || "");
        setEmail(current => current || user.email || "");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user, profile]);

  // Estados de proceso
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderCreateResponse | null>(null);

  useEffect(() => { fetch(`${siteConfig.backendUrl}/zonas-envio`).then(async res => {
    if (!res.ok) throw new Error("No se pudieron cargar las zonas de envío");
    const zones = await res.json(); setShippingZones(zones); if(zones.length) setZonaEnvioId(zones[0].id);
  }).catch(() => setErrorMessage("Las zonas de envío no están disponibles. Puedes retirar en planta o intentar de nuevo.")); }, []);

  // Cálculo de flete y total
  const selectedZone = metodoEntrega === "delivery" 
    ? SHIPPING_ZONES.find((z) => z.id === zonaEnvioId) 
    : null;
  const flete = selectedZone ? selectedZone.delivery_fee : 0;
  const total = subtotal + flete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (items.length === 0) {
      setErrorMessage("El carrito está vacío. Agregue productos antes de continuar.");
      return;
    }

    if (!nombre.trim() || !cedulaRuc.trim() || !telefono.trim()) {
      setErrorMessage("Por favor complete los campos obligatorios del cliente.");
      return;
    }

    if (metodoEntrega === "delivery" && (!zonaEnvioId || !direccionEntrega.trim())) {
      setErrorMessage("La dirección de entrega es obligatoria para envíos a domicilio.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mapear items con variante_id obligatoria
      if (items.some(item => !item.variante_id)) throw new Error("Actualiza tu carrito seleccionando una presentación del catálogo.");
      const orderItems = items.map((item) => ({
        producto_id: item.producto_id || item.id,
        variante_id: item.variante_id!,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      }));

      const payload: OrderCreateRequest = {
        cliente: {
          nombre: nombre.trim(),
          cedula_ruc: cedulaRuc.trim(),
          telefono: telefono.trim(),
          email: email.trim() || undefined,
          direccion: metodoEntrega === "delivery" ? direccionEntrega.trim() : "Retiro en Pilahuín",
        },
        metodo_entrega: metodoEntrega,
        zona_envio_id: metodoEntrega === "delivery" ? zonaEnvioId : undefined,
        direccion_entrega: metodoEntrega === "delivery" ? direccionEntrega.trim() : undefined,
        metodo_pago: metodoPago,
        notas_cliente: notasCliente.trim() || undefined,
        items: orderItems,
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      // Adjuntar token JWT si el usuario tiene sesión activa
      const token = await getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${siteConfig.backendUrl}/orders`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errDesc = `Error ${res.status} al crear el pedido`;
        try {
          const errData = await res.json();
          if (errData.message) errDesc = errData.message;
        } catch {
          // ignore
        }
        throw new Error(errDesc);
      }

      const orderData: OrderCreateResponse = await res.json();
      setCreatedOrder(orderData);
      clearCart();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado de conexión";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // PANTALLA DE CONFIRMACIÓN DE PEDIDO CREADO
  // ============================================================
  if (createdOrder) {
    const whatsappOrderMsg = buildWhatsAppUrl({
      message: `Hola CONLAC-T, acabo de registrar el pedido #${createdOrder.numero_pedido} por un total de ${formatPrice(createdOrder.total)}. Deseo enviar el comprobante de mi transferencia para su verificación manual.`,
    });

    return (
      <div className="py-12 sm:py-16 bg-background">
        <Container>
          <div className="max-w-2xl mx-auto rounded-3xl bg-surface border border-border p-6 sm:p-10 shadow-sm space-y-8 animate-fadeIn">
            <div className="text-center space-y-3">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                <span className="text-2xl font-bold">✓</span>
              </div>
              <span className="text-xs font-label uppercase tracking-widest text-emerald-800 font-bold block">
                ¡Confirmación Exitosa!
              </span>
              <h1 className="font-headline text-3xl sm:text-4xl font-bold text-primary">
                Pedido Registrado #{createdOrder.numero_pedido}
              </h1>
              <p className="text-sm text-neutral-muted">
                Tu solicitud ha sido ingresada correctamente en el sistema de CONLAC-T con estado{" "}
                <span className="font-semibold text-primary uppercase">
                  {createdOrder.estado || "pendiente"}
                </span>.
              </p>
            </div>

            {/* Ficha Resumen */}
            <div className="rounded-2xl bg-background border border-border p-6 space-y-4">
              <h2 className="font-headline text-base font-bold text-primary border-b border-border/80 pb-2">
                Detalle Financiero
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-muted">Número de Pedido:</span>
                  <span className="font-bold text-primary">#{createdOrder.numero_pedido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-muted">Subtotal:</span>
                  <span>{formatPrice(createdOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-muted">Flete de Envío:</span>
                  <span>{formatPrice(createdOrder.flete)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border font-bold text-base text-primary">
                  <span>Total a Pagar:</span>
                  <span>{formatPrice(createdOrder.total)}</span>
                </div>
                <div className="flex justify-between pt-1 text-xs text-neutral-muted">
                  <span>Método de Pago:</span>
                  <span className="capitalize font-medium text-neutral">{createdOrder.metodo_pago}</span>
                </div>
              </div>
            </div>

            {/* Instrucciones para transferencia */}
            {createdOrder.metodo_pago === "transferencia" && (
              <div className="p-5 rounded-2xl bg-background border border-border/80 text-xs text-neutral-muted space-y-2">
                <span className="font-bold text-primary block text-sm">
                  Instrucciones para Transferencia Bancaria:
                </span>
                <p>
                  Realiza la transferencia e indica el pedido <strong>#{createdOrder.numero_pedido}</strong> como referencia. Envía el comprobante por WhatsApp; el consorcio verificará el abono antes de confirmar el pago.
                </p>
                <dl className="space-y-1 text-sm">
                  {Object.entries(bankDetails).map(([label, value]) => <div key={label}><dt className="inline font-semibold">{label}: </dt><dd className="inline">{value || "Consultar al consorcio por WhatsApp"}</dd></div>)}
                </dl>
                <div className="rounded-lg bg-surface border border-border/70 p-3 mt-2 text-[11px] text-neutral space-y-1">
                  <p><strong>Referencia del Pedido:</strong> #{createdOrder.numero_pedido} — {nombre}</p>
                  <p><strong>Total a transferir:</strong> {formatPrice(createdOrder.total)}</p>
                  <p className="text-neutral-muted italic">
                    Nota: Los datos de cuenta se confirman directamente con el consorcio para garantizar la trazabilidad de los fondos a las comunidades.
                  </p>
                </div>
              </div>
            )}

            {createdOrder.reserva_expira_en && <p className="text-sm">Reserva válida hasta {new Date(createdOrder.reserva_expira_en).toLocaleString("es-EC")}. Envía el comprobante dentro de este plazo.</p>}
            {/* Acciones finales */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                href={`/seguimiento?pedido=${createdOrder.numero_pedido}`}
                variant="primary"
                size="md"
                fullWidth
              >
                <span>Consultar Seguimiento</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Button>

              {isAuthenticated && (
                <Button
                  href="/mis-pedidos"
                  variant="outlined"
                  size="md"
                  fullWidth
                >
                  <span>Ver en Mis Pedidos</span>
                </Button>
              )}

              <Button
                href={whatsappOrderMsg}
                variant="outlined"
                size="md"
                isExternal
                fullWidth
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span>Enviar comprobante por WhatsApp</span>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ============================================================
  // ESTADO VACÍO SI SE INGRESA DIRECTO A /checkout SIN PRODUCTOS
  // ============================================================
  if (items.length === 0) {
    return (
      <div className="py-16 bg-background">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-4 p-8 rounded-2xl bg-surface border border-border">
            <h1 className="font-headline text-2xl font-bold text-primary">
              No hay productos para el checkout
            </h1>
            <p className="text-sm text-neutral-muted">
              Tu carrito está vacío. Agrega tus quesos favoritos antes de procesar un pedido.
            </p>
            <Button href="/tienda" variant="primary" size="md">
              Explorar Tienda
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // ============================================================
  // FORMULARIO DE CHECKOUT Y CREACIÓN DE PEDIDO
  // ============================================================
  return (
    <div className="py-12 sm:py-16 bg-background">
      <Container>
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Tienda", href: "/tienda" },
            { label: "Carrito", href: "/carrito" },
            { label: "Checkout" },
          ]}
        />

        <div className="max-w-2xl mb-8">
          <span className="text-xs font-label uppercase tracking-widest text-tertiary font-semibold">
            Finalizar Pedido
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-headline font-bold text-primary">
            Datos de Entrega y Pago
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-muted">
            Ingresa tus datos de contacto y selecciona tu método preferido de entrega y pago.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-xl bg-red-50 border border-red-300 p-4 text-red-900 text-sm">
            <span className="font-bold block">No se pudo procesar el pedido:</span>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12 items-start">
          
          {/* ============================================================
              1. FORMULARIO PRINCIPAL
              ============================================================ */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sección: Datos del Cliente */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-6">
              <h2 className="font-headline text-xl font-bold text-primary border-b border-border pb-3">
                1. Datos del Cliente
              </h2>

              {/* Banner de estado de sesión (Invitado vs Autenticado) */}
              {isAuthenticated ? (
                <div className="rounded-xl bg-tertiary/10 border border-tertiary/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="text-primary">
                    <span className="font-bold">Sesión iniciada:</span> Realizando pedido como{" "}
                    <span className="font-semibold text-tertiary">{profile?.full_name || user?.email}</span> ({user?.email}).
                  </div>
                  <Link href="/mis-pedidos" className="text-tertiary hover:underline font-bold self-start sm:self-auto shrink-0">
                    Ver mis pedidos →
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl bg-surface-alt/60 border border-border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <div className="text-neutral-muted">
                    <span className="font-semibold text-primary">Modo Invitado:</span> Puedes comprar sin registrarte. Los detalles de tu pedido se enviarán a tu correo y podrás rastrearlo con tu código.
                  </div>
                  <Link href="/login?redirect=/checkout" className="text-tertiary hover:underline font-bold self-start sm:self-auto shrink-0">
                    ¿Tienes cuenta? Ingresa aquí →
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-xs font-label uppercase font-bold text-primary mb-1">
                    Nombre Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Mateo Villacís"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                  />
                </div>

                <div>
                  <label htmlFor="cedulaRuc" className="block text-xs font-label uppercase font-bold text-primary mb-1">
                    Cédula o RUC <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cedulaRuc"
                    type="text"
                    required
                    value={cedulaRuc}
                    onChange={(e) => setCedulaRuc(e.target.value)}
                    placeholder="1801234567"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-xs font-label uppercase font-bold text-primary mb-1">
                    Teléfono / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="099 123 4567"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-label uppercase font-bold text-primary mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                  />
                </div>
              </div>
            </div>

            {/* Sección: Método de Entrega */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-6">
              <h2 className="font-headline text-xl font-bold text-primary border-b border-border pb-3">
                2. Método de Entrega
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    metodoEntrega === "pickup"
                      ? "border-primary bg-[#F8F4E9] ring-2 ring-primary"
                      : "border-border bg-background hover:border-tertiary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="metodoEntrega"
                      value="pickup"
                      checked={metodoEntrega === "pickup"}
                      onChange={() => setMetodoEntrega("pickup")}
                      className="text-primary focus:ring-tertiary"
                    />
                    <div>
                      <span className="font-headline font-bold text-sm text-primary block">
                        Retiro en Planta (Pilahuín)
                      </span>
                      <span className="text-xs text-neutral-muted">
                        Sin costo adicional. Retiro en queserías comunitarias.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary mt-2">Gratis ($0.00)</span>
                </label>

                <label
                  className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                    metodoEntrega === "delivery"
                      ? "border-primary bg-[#F8F4E9] ring-2 ring-primary"
                      : "border-border bg-background hover:border-tertiary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="metodoEntrega"
                      value="delivery"
                      checked={metodoEntrega === "delivery"}
                      onChange={() => setMetodoEntrega("delivery")}
                      className="text-primary focus:ring-tertiary"
                    />
                    <div>
                      <span className="font-headline font-bold text-sm text-primary block">
                        Envío a Domicilio
                      </span>
                      <span className="text-xs text-neutral-muted">
                        Despacho directo coordinado con la asociación.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary mt-2">
                    Desde $1.50
                  </span>
                </label>
              </div>

              {/* Si es delivery, seleccionar zona y dirección */}
              {metodoEntrega === "delivery" && (
                <div className="space-y-4 pt-4 border-t border-border animate-fadeIn">
                  <div>
                    <label htmlFor="zonaEnvio" className="block text-xs font-label uppercase font-bold text-primary mb-1">
                      Zona de Envío <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="zonaEnvio"
                      value={zonaEnvioId}
                      onChange={(e) => setZonaEnvioId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                    >
                      {SHIPPING_ZONES.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} — {formatPrice(zone.delivery_fee)} ({zone.delivery_days})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="direccionEntrega" className="block text-xs font-label uppercase font-bold text-primary mb-1">
                      Dirección de Entrega y Referencia <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="direccionEntrega"
                      type="text"
                      required={metodoEntrega === "delivery"}
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      placeholder="Calle Principal, número de casa, sector o punto de referencia"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sección: Método de Pago */}
            <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border space-y-6">
              <h2 className="font-headline text-xl font-bold text-primary border-b border-border pb-3">
                3. Método de Pago
              </h2>

              <p className="rounded-xl border border-border bg-background p-4 text-sm">
                Transferencia bancaria directa a cuentas del consorcio. Envía el comprobante por WhatsApp con el número de pedido. La administración verificará el abono y confirmará el pago manualmente.
              </p>

              <div>
                <label htmlFor="notasCliente" className="block text-xs font-label uppercase font-bold text-primary mb-1">
                  Notas adicionales (Opcional)
                </label>
                <textarea
                  id="notasCliente"
                  rows={2}
                  value={notasCliente}
                  onChange={(e) => setNotasCliente(e.target.value)}
                  placeholder="Ej. Entregar después de las 14:00, empacar por separado..."
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-neutral focus:border-tertiary focus:outline-none focus:ring-1 focus:ring-tertiary resize-y"
                />
              </div>
            </div>

          </div>

          {/* ============================================================
              2. RESUMEN LATERAL DE COMPRA
              ============================================================ */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm space-y-6 lg:sticky lg:top-24">
            <h2 className="font-headline text-xl font-bold text-primary border-b border-border pb-3">
              Resumen del Pedido
            </h2>

            {/* Lista condensada de productos */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-light border border-border">
                      <Image
                        src={item.imagen}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-primary block line-clamp-1">{item.nombre}</span>
                      <span className="text-neutral-muted">{item.cantidad} x {formatPrice(item.precio)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-neutral">
                    {formatPrice(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-border text-sm">
              <div className="flex justify-between text-neutral-muted">
                <span>Subtotal ({totalItems} unidades)</span>
                <span className="font-semibold text-neutral">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-muted">
                <span>Flete / Entrega</span>
                <span className="font-semibold text-neutral">
                  {flete > 0 ? formatPrice(flete) : "Gratis ($0.00)"}
                </span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between text-base font-bold text-primary">
                <span>Total Final</span>
                <span className="font-headline text-2xl text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-background p-3 text-xs text-neutral-muted border border-border/80 flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-tertiary flex-shrink-0" />
              <span>Transacción comunitaria directa con los productores de Tungurahua.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando Pedido..." : `Confirmar y Crear Pedido (${formatPrice(total)})`}
            </Button>

            <div className="text-center">
              <Link href="/carrito" className="text-xs text-neutral-muted hover:text-primary underline">
                ← Volver al carrito
              </Link>
            </div>
          </div>

        </form>
      </Container>
    </div>
  );
}
