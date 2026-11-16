export const ORDER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const ORDER_LABELS = { pending: "Pendiente de pago", paid: "Pago verificado", preparing: "En preparación", shipped: "En camino", completed: "Entregado", cancelled: "Cancelado" } as const;
export type OrderStatus = keyof typeof ORDER_LABELS;
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["paid", "cancelled"], paid: ["preparing", "cancelled"],
  preparing: ["shipped", "completed", "cancelled"], shipped: ["completed"], completed: [], cancelled: [],
};
export const SHIPPING_ZONES = [
  { id: "f0000000-0000-0000-0000-000000000001", name: "Ambato Urbano", delivery_fee: 1.5, delivery_days: "Martes, jueves y sábados" },
  { id: "f0000000-0000-0000-0000-000000000003", name: "Quito Metropolitano", delivery_fee: 4.5, delivery_days: "Miércoles y viernes" },
  { id: "f0000000-0000-0000-0000-000000000004", name: "Guayaquil y Costa", delivery_fee: 6, delivery_days: "Sábados" },
];
export function trackingPath(id: string) { return `/seguimiento?pedido=${encodeURIComponent(id)}`; }
export function trackingUrl(id: string, origin: string) { return `${origin.replace(/\/$/, "")}${trackingPath(id)}`; }
