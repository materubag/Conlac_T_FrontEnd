import { createHash, randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { getDb } from "@/lib/db/sqlite";
import { ORDER_ID, ORDER_TRANSITIONS, SHIPPING_ZONES, type OrderStatus } from "@/lib/orders";
import type { CustomerDto, OrderCreateResponse, Producto } from "@/types";
import { AuthError } from "./sqliteAuth";

export interface LocalOrderItem { producto_id: string; variante_id?: string; nombre: string; cantidad: number; precio: number; producto: Producto }
export interface ManagedOrder extends OrderCreateResponse {
  cliente: CustomerDto; items: Omit<LocalOrderItem, "producto">[]; metodo_entrega: string;
  direccion_entrega: string; notas_cliente: string; creado_en: string; actualizado_en: string;
}
interface OrderRow {
  id: string; numero: number; estado: OrderStatus; cliente_json: string; items_json: string;
  subtotal_centavos: number; flete_centavos: number; entrega: string; direccion: string;
  notas: string; creado_en: string; actualizado_en: string; expira_en: string | null;
  stock_reservado: number; request_key: string; fingerprint: string;
}
interface CatalogRow { contenido_json: string; actualizado_en: string }
function text(value: unknown, label: string, max: number, required = true) {
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) {
    if (!required && (value === undefined || value === "")) return "";
    throw new AuthError(`${label}: ${required ? "obligatorio, " : ""}máximo ${max} caracteres.`);
  }
  return value.trim();
}
const cents = (value: number) => Math.round(value * 100);
export function publicOrder(row: OrderRow): OrderCreateResponse {
  return { id: row.id, numero_pedido: row.numero, estado: row.estado, metodo_pago: "transferencia",
    subtotal: row.subtotal_centavos / 100, flete: row.flete_centavos / 100,
    total: (row.subtotal_centavos + row.flete_centavos) / 100, reserva_expira_en: row.expira_en };
}

export class SqliteOrderStore {
  constructor(private db: DatabaseSync, private now = () => Date.now()) {
    db.exec(`CREATE TABLE IF NOT EXISTS shop_orders (
      numero INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL UNIQUE, estado TEXT NOT NULL,
      cliente_json TEXT NOT NULL, items_json TEXT NOT NULL, subtotal_centavos INTEGER NOT NULL,
      flete_centavos INTEGER NOT NULL, entrega TEXT NOT NULL, direccion TEXT NOT NULL, notas TEXT NOT NULL,
      creado_en TEXT NOT NULL, actualizado_en TEXT NOT NULL, expira_en TEXT, stock_reservado INTEGER NOT NULL DEFAULT 1,
      request_key TEXT NOT NULL UNIQUE, fingerprint TEXT NOT NULL
    ); CREATE INDEX IF NOT EXISTS shop_orders_status ON shop_orders(estado,creado_en);
    CREATE TABLE IF NOT EXISTS shop_order_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES shop_orders(id),
      actor_id TEXT NOT NULL, anterior TEXT, nuevo TEXT NOT NULL, nota TEXT NOT NULL, creado_en TEXT NOT NULL
    ); CREATE TABLE IF NOT EXISTS shop_order_mail (
      id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES shop_orders(id),
      recipient TEXT NOT NULL, payload_json TEXT NOT NULL, estado TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0, next_at INTEGER NOT NULL DEFAULT 0
    );`);
  }
  private transaction<T>(fn: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try { const result = fn(); this.db.exec("COMMIT"); return result; }
    catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  private row(id: string) {
    return this.db.prepare("SELECT * FROM shop_orders WHERE id=?").get(id) as unknown as OrderRow | undefined;
  }
  private catalog() {
    const row = this.db.prepare("SELECT contenido_json,actualizado_en FROM paginas_editables WHERE slug='tienda'").get() as unknown as CatalogRow | undefined;
    const content: { productos?: Producto[] } = row ? JSON.parse(row.contenido_json) : {};
    if (!Array.isArray(content.productos)) throw new AuthError("El catálogo todavía no está disponible.", 503);
    return { content, products: content.productos, previous: row!.actualizado_en };
  }
  private saveCatalog(catalog: ReturnType<SqliteOrderStore["catalog"]>) {
    const updated = new Date(Math.max(this.now(), Date.parse(catalog.previous) + 1 || 0)).toISOString();
    this.db.prepare("UPDATE paginas_editables SET contenido_json=?,actualizado_en=? WHERE slug='tienda'")
      .run(JSON.stringify(catalog.content), updated);
  }
  private presentation(product: Producto, variant?: string) {
    if (!product.presentaciones?.length) return undefined;
    const first = product.presentaciones[0];
    // The editable scalar fields are the authoritative first presentation.
    first.stock = product.stock; first.precio = product.precio;
    const selected = variant ? product.presentaciones.find(p => p.id === variant) : first;
    if (!selected) throw new AuthError("La presentación ya no existe. Actualiza el carrito.", 409);
    return selected;
  }
  private event(row: OrderRow, actor: string, previous: string | null, note: string) {
    this.db.prepare("INSERT INTO shop_order_events(order_id,actor_id,anterior,nuevo,nota,creado_en) VALUES (?,?,?,?,?,?)")
      .run(row.id, actor, previous, row.estado, note, new Date(this.now()).toISOString());
    const customer: CustomerDto = JSON.parse(row.cliente_json);
    if (customer.email) this.db.prepare("INSERT INTO shop_order_mail(order_id,recipient,payload_json) VALUES (?,?,?)")
      .run(row.id, customer.email, JSON.stringify(publicOrder(row)));
  }
  private release(row: OrderRow) {
    if (!row.stock_reservado) return;
    const catalog = this.catalog();
    const items: LocalOrderItem[] = JSON.parse(row.items_json);
    for (const item of items) {
      let product = catalog.products.find(p => p.id === item.producto_id);
      if (!product) {
        product = { ...item.producto, stock: 0, oculto: true,
          presentaciones: item.producto.presentaciones?.map(p => ({ ...p, stock: 0 })) };
        catalog.products.push(product);
      }
      const variant = this.presentation(product, item.variante_id);
      if (variant) {
        variant.stock += item.cantidad;
        product.stock = product.presentaciones![0].stock;
      } else product.stock += item.cantidad;
    }
    this.saveCatalog(catalog);
    this.db.prepare("UPDATE shop_orders SET stock_reservado=0 WHERE id=?").run(row.id);
  }
  private expireInside() {
    const rows = this.db.prepare("SELECT * FROM shop_orders WHERE estado='pending' AND expira_en<=?").all(new Date(this.now()).toISOString()) as unknown as OrderRow[];
    for (const row of rows) {
      this.release(row);
      this.db.prepare("UPDATE shop_orders SET estado='cancelled',expira_en=NULL,actualizado_en=? WHERE id=?")
        .run(new Date(this.now()).toISOString(), row.id);
      this.event(this.row(row.id)!, "system", "pending", "Reserva vencida: transcurrieron 24 horas sin verificar el pago.");
    }
  }
  expire() {
    // Normal catalog reads should not take a write lock when nothing expired.
    if (!this.db.prepare("SELECT id FROM shop_orders WHERE estado='pending' AND expira_en<=? LIMIT 1").get(new Date(this.now()).toISOString())) return;
    this.transaction(() => this.expireInside());
  }
  create(body: Record<string, unknown>, key: string): OrderCreateResponse {
    if (!ORDER_ID.test(key)) throw new AuthError("La clave de solicitud no es válida.");
    if (body.metodo_pago !== "transferencia") throw new AuthError("Solo se acepta transferencia bancaria.");
    const input = body.cliente as Record<string, unknown> | undefined;
    if (!input || typeof input !== "object") throw new AuthError("Completa los datos del cliente.");
    const cliente: CustomerDto = {
      nombre: text(input.nombre, "Nombre", 150), cedula_ruc: text(input.cedula_ruc, "Cédula/RUC", 13),
      telefono: text(input.telefono, "Teléfono", 25).replace(/[\s()-]/g, ""),
      email: text(input.email, "Correo", 254, false).toLowerCase(),
    };
    if (!/^(?:\d{10}|\d{13})$/.test(cliente.cedula_ruc)) throw new AuthError("La cédula o RUC debe tener 10 o 13 dígitos.");
    if (!/^\+?\d{10,15}$/.test(cliente.telefono)) throw new AuthError("El teléfono debe tener de 10 a 15 dígitos.");
    if (cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.email)) throw new AuthError("El correo no es válido.");
    const entrega = body.metodo_entrega;
    if (entrega !== "pickup" && entrega !== "delivery") throw new AuthError("Selecciona un método de entrega válido.");
    const zone = SHIPPING_ZONES.find(z => z.id === body.zona_envio_id);
    if (entrega === "delivery" && !zone) throw new AuthError("Selecciona una zona de envío válida.");
    const direccion = entrega === "delivery" ? text(body.direccion_entrega, "Dirección", 300) : "Retiro en planta, Pilahuín";
    const notas = text(body.notas_cliente, "Notas", 1000, false);
    if (!Array.isArray(body.items) || !body.items.length || body.items.length > 50) throw new AuthError("El pedido debe incluir entre 1 y 50 líneas.");
    const lines = new Map<string, { id: string; variant?: string; cantidad: number; precio?: number }>();
    for (const item of body.items) {
      if (!item || typeof item !== "object") throw new AuthError("Producto inválido.");
      const id = text(item.producto_id, "Producto", 150);
      const variant = text(item.variante_id, "Presentación", 150, false) || undefined;
      if (!Number.isSafeInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 100000) throw new AuthError("Cantidad inválida.");
      const lineId = `${id}::${variant || ""}`;
      if (lines.has(lineId)) throw new AuthError("Unifica las cantidades del mismo producto antes de confirmar.");
      lines.set(lineId, { id, variant, cantidad: item.cantidad, precio: item.precio_unitario });
    }
    const fingerprint = createHash("sha256").update(JSON.stringify({ cliente, entrega, direccion, notas, zone: entrega === "delivery" ? zone?.id : null, lines: [...lines] })).digest("hex");
    return this.transaction(() => {
      this.expireInside();
      const existing = this.db.prepare("SELECT * FROM shop_orders WHERE request_key=?").get(key) as unknown as OrderRow | undefined;
      if (existing) {
        if (existing.fingerprint !== fingerprint) throw new AuthError("La solicitud ya fue utilizada con otros datos.", 409);
        return publicOrder(existing);
      }
      const catalog = this.catalog();
      const items: LocalOrderItem[] = [];
      let subtotal = 0;
      for (const line of lines.values()) {
        const id = line.id;
        const product = catalog.products.find(p => p.id === id);
        if (!product || product.oculto || product.disponible === false) throw new AuthError("Un producto ya no está a la venta. Revisa el carrito.", 409);
        const variant = this.presentation(product, line.variant);
        const stock = variant?.stock ?? product.stock, price = variant?.precio ?? product.precio;
        if (!Number.isSafeInteger(stock) || stock < line.cantidad) throw new AuthError(`Stock insuficiente para ${product.nombre}. Disponible: ${stock}.`, 409);
        if (!Number.isFinite(price) || price < 0 || price > 10000) throw new AuthError("El precio del producto no está disponible.", 409);
        if (line.precio !== undefined && (!Number.isFinite(line.precio) || cents(line.precio) !== cents(price))) throw new AuthError(`Cambió el precio de ${product.nombre}. Actualiza el carrito.`, 409);
        items.push({ producto_id: id, variante_id: variant?.id, nombre: `${product.nombre}${variant?.nombre_presentacion ? ` · ${variant.nombre_presentacion}` : ""}`, cantidad: line.cantidad, precio: cents(price) / 100, producto: JSON.parse(JSON.stringify(product)) });
        subtotal += cents(price) * line.cantidad;
        if (variant) { variant.stock -= line.cantidad; product.stock = product.presentaciones![0].stock; }
        else product.stock -= line.cantidad;
      }
      this.saveCatalog(catalog);
      const id = randomUUID(), date = new Date(this.now()).toISOString();
      const expiry = new Date(this.now() + 24 * 60 * 60 * 1000).toISOString();
      this.db.prepare(`INSERT INTO shop_orders(id,estado,cliente_json,items_json,subtotal_centavos,flete_centavos,entrega,direccion,notas,creado_en,actualizado_en,expira_en,request_key,fingerprint)
        VALUES (?,'pending',?,?,?,?,?,?,?,?,?,?,?,?)`).run(id, JSON.stringify(cliente), JSON.stringify(items), subtotal,
          entrega === "delivery" ? cents(zone!.delivery_fee) : 0, entrega, direccion, notas, date, date, expiry, key, fingerprint);
      const row = this.row(id)!;
      this.event(row, "guest", null, "Pedido creado y existencias reservadas durante 24 horas.");
      return publicOrder(row);
    });
  }
  get(id: string) {
    if (!ORDER_ID.test(id)) throw new AuthError("Usa el identificador completo del pedido.", 400);
    this.expire();
    const row = this.row(id);
    return row ? publicOrder(row) : null;
  }
  private managed(row: OrderRow): ManagedOrder {
    const items: LocalOrderItem[] = JSON.parse(row.items_json);
    return { ...publicOrder(row), cliente: JSON.parse(row.cliente_json),
      items: items.map(({ producto_id, nombre, cantidad, precio }) => ({ producto_id, nombre, cantidad, precio })),
      metodo_entrega: row.entrega, direccion_entrega: row.direccion, notas_cliente: row.notas,
      creado_en: row.creado_en, actualizado_en: row.actualizado_en };
  }
  list(status: string, search: string, page: number) {
    this.expire();
    if (status && !Object.hasOwn(ORDER_TRANSITIONS, status)) throw new AuthError("Estado inválido.");
    if (search.length > 150) throw new AuthError("Búsqueda demasiado larga.");
    const where = "WHERE (?='' OR estado=?) AND (?='' OR instr(lower(id||cliente_json),lower(?))>0)";
    const args = [status, status, search, search];
    const total = (this.db.prepare(`SELECT count(*) AS total FROM shop_orders ${where}`).get(...args) as { total: number }).total;
    const rows = this.db.prepare(`SELECT * FROM shop_orders ${where} ORDER BY numero DESC LIMIT 20 OFFSET ?`).all(...args, (page - 1) * 20) as unknown as OrderRow[];
    return { orders: rows.map(row => this.managed(row)), total, page, pages: Math.ceil(total / 20) };
  }
  detail(id: string) {
    this.get(id);
    const row = this.row(id);
    if (!row) throw new AuthError("El pedido no existe en SQLite.", 404);
    const events = this.db.prepare("SELECT anterior,nuevo,nota,creado_en,actor_id FROM shop_order_events WHERE order_id=? ORDER BY id DESC LIMIT 100").all(id);
    return { order: this.managed(row), events };
  }
  update(id: string, target: string, expected: string, note: string, actor: string) {
    if (!ORDER_ID.test(id) || !Object.hasOwn(ORDER_TRANSITIONS, target)) throw new AuthError("Pedido o estado inválido.");
    if (note.length > 500) throw new AuthError("La nota admite hasta 500 caracteres.");
    return this.transaction(() => {
      this.expireInside();
      const row = this.row(id);
      if (!row) throw new AuthError("Pedido no encontrado.", 404);
      if (row.estado !== expected) throw new AuthError("Otro operador cambió el pedido. Actualiza su estado.", 409);
      if (!ORDER_TRANSITIONS[row.estado].includes(target as OrderStatus)) throw new AuthError("Ese cambio de estado no está permitido.", 409);
      if (target === "shipped" && row.entrega === "pickup") throw new AuthError("Un retiro en planta pasa de preparación a entregado.");
      if (target === "completed" && row.entrega === "delivery" && row.estado === "preparing") throw new AuthError("Marca primero el envío del pedido.");
      if (target === "cancelled" && !note.trim()) throw new AuthError("Indica el motivo de cancelación y, si corresponde, cómo se coordinará el reembolso.");
      if (target === "cancelled") this.release(row);
      this.db.prepare("UPDATE shop_orders SET estado=?,actualizado_en=?,expira_en=NULL WHERE id=?")
        .run(target, new Date(this.now()).toISOString(), id);
      const updated = this.row(id)!;
      this.event(updated, actor, row.estado, note.trim());
      return this.managed(updated);
    });
  }
}
let store: SqliteOrderStore | undefined;
export function getOrderStore() { return store ??= new SqliteOrderStore(getDb()); }
