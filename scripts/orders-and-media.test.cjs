/* eslint-disable @typescript-eslint/no-require-imports -- Real SQLite transactions in isolated databases. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { randomUUID } = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.resolve(__dirname, '../src', request.slice(2)) : request, ...args); };
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const { SqliteOrderStore } = require('../src/lib/server/sqliteOrders.ts');
const media = require('../src/lib/db/media.ts');
const { ORDER_ID, trackingUrl } = require('../src/lib/orders.ts');
function setup(extra = []) {
  const db = new DatabaseSync(':memory:');
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE paginas_editables(slug TEXT PRIMARY KEY,contenido_json TEXT,actualizado_en TEXT);
    CREATE TABLE recetas_editables(id TEXT PRIMARY KEY,imagen_url TEXT);`);
  const products = [{ id: 'queso-local', nombre: 'Queso artesanal', precio: 3.25, stock: 5, fotos: ['/demo/PROD-fresco.jpg'], disponible: true, ...extra[0] },
    { id: 'queso-segundo', nombre: 'Otro queso', precio: 2, stock: 1, fotos: [], disponible: true }];
  db.prepare("INSERT INTO paginas_editables VALUES ('tienda',?,?)").run(JSON.stringify({ productos: products }), new Date(1700000000000).toISOString());
  let now = 1800000000000;
  const store = new SqliteOrderStore(db, () => now);
  const catalog = () => JSON.parse(db.prepare("SELECT contenido_json FROM paginas_editables WHERE slug='tienda'").get().contenido_json).productos;
  const body = { cliente: { nombre: 'Cliente de prueba', cedula_ruc: '1801234567', telefono: '0991234567', email: 'test@example.test' }, metodo_entrega: 'pickup', metodo_pago: 'transferencia', items: [{ producto_id: 'queso-local', cantidad: 2, precio_unitario: 3.25 }] };
  return { db, store, body, catalog, advance: ms => { now += ms; } };
}
test('checkout descuenta el catalogo real, calcula centavos y no expone datos privados', () => {
  const t = setup(); const order = t.store.create(t.body, randomUUID());
  assert.match(order.id, ORDER_ID); assert.equal(order.total, 6.5); assert.equal(t.catalog()[0].stock, 3);
  assert.equal(t.store.detail(order.id).order.items[0].nombre, 'Queso artesanal');
  assert.equal(t.store.get(order.id).cliente, undefined);
  assert.equal(t.db.prepare('SELECT count(*) n FROM shop_order_mail').get().n, 1);
  t.db.close();
});
test('un reintento con la misma clave devuelve el pedido sin volver a descontar', () => {
  const t = setup(), key = randomUUID(); const first = t.store.create(t.body, key);
  assert.equal(t.store.create(t.body, key).id, first.id); assert.equal(t.catalog()[0].stock, 3);
  assert.throws(() => t.store.create({ ...t.body, notas_cliente: 'cambio' }, key), { status: 409 });
  assert.equal(t.db.prepare('SELECT count(*) n FROM shop_orders').get().n, 1); t.db.close();
});
test('una segunda linea sin stock revierte todo el pedido y su primer descuento', () => {
  const t = setup(); t.body.items.push({ producto_id: 'queso-segundo', cantidad: 2, precio_unitario: 2 });
  assert.throws(() => t.store.create(t.body, randomUUID()), { status: 409 });
  assert.equal(t.catalog()[0].stock, 5); assert.equal(t.db.prepare('SELECT count(*) n FROM shop_orders').get().n, 0); t.db.close();
});
test('rechaza stock insuficiente, cantidades fraccionarias y productos ocultos', () => {
  for (const quantity of [0, -1, 1.5, 6]) { const t = setup(); t.body.items[0].cantidad = quantity; assert.throws(() => t.store.create(t.body, randomUUID())); assert.equal(t.catalog()[0].stock, 5); t.db.close(); }
  const t = setup([{ oculto: true }]); assert.throws(() => t.store.create(t.body, randomUUID()), { status: 409 }); t.db.close();
});
test('el cliente no puede imponer precio, flete o metodo de pago', () => {
  const t = setup(); t.body.items[0].precio_unitario = .01;
  assert.throws(() => t.store.create(t.body, randomUUID()), { status: 409 });
  delete t.body.items[0].precio_unitario; t.body.metodo_entrega = 'delivery'; t.body.zona_envio_id = 'f0000000-0000-0000-0000-000000000003'; t.body.direccion_entrega = 'Direccion real'; t.body.flete = 0;
  assert.equal(t.store.create(t.body, randomUUID()).total, 11);
  t.body.metodo_pago = 'payphone'; assert.throws(() => t.store.create(t.body, randomUUID())); t.db.close();
});
test('cancelar devuelve stock una sola vez y deja auditoria', () => {
  const t = setup(), order = t.store.create(t.body, randomUUID());
  t.store.update(order.id, 'cancelled', 'pending', 'Cliente cancela', 'admin-id'); assert.equal(t.catalog()[0].stock, 5);
  assert.throws(() => t.store.update(order.id, 'cancelled', 'pending', 'Repeticion', 'admin-id'), { status: 409 });
  assert.equal(t.catalog()[0].stock, 5); assert.equal(t.store.detail(order.id).events[0].actor_id, 'admin-id'); t.db.close();
});
test('expira a las 24 horas y la liberacion es idempotente', () => {
  const t = setup(), order = t.store.create(t.body, randomUUID()); t.advance(24 * 3600000 + 1);
  assert.equal(t.store.get(order.id).estado, 'cancelled'); assert.equal(t.catalog()[0].stock, 5);
  t.store.expire(); assert.equal(t.catalog()[0].stock, 5); t.db.close();
});
test('pago, preparacion y retiro completado no descuentan otra vez ni expiran', () => {
  const t = setup(), order = t.store.create(t.body, randomUUID());
  assert.throws(() => t.store.update(order.id, 'completed', 'pending', '', 'admin'), { status: 409 });
  t.store.update(order.id, 'paid', 'pending', 'Transferencia verificada', 'admin'); t.advance(25 * 3600000);
  assert.equal(t.store.get(order.id).estado, 'paid'); t.store.update(order.id, 'preparing', 'paid', '', 'admin');
  assert.throws(() => t.store.update(order.id, 'shipped', 'preparing', '', 'admin'));
  t.store.update(order.id, 'completed', 'preparing', '', 'admin'); assert.equal(t.catalog()[0].stock, 3);
  assert.throws(() => t.store.update(order.id, 'cancelled', 'completed', 'Cambio', 'admin'), { status: 409 }); t.db.close();
});
test('envios deben marcarse enviados antes de completarlos', () => {
  const t = setup(); t.body.metodo_entrega = 'delivery'; t.body.zona_envio_id = 'f0000000-0000-0000-0000-000000000001'; t.body.direccion_entrega = 'Direccion';
  const order = t.store.create(t.body, randomUUID()); t.store.update(order.id, 'paid', 'pending', '', 'admin'); t.store.update(order.id, 'preparing', 'paid', '', 'admin');
  assert.throws(() => t.store.update(order.id, 'completed', 'preparing', '', 'admin'));
  t.store.update(order.id, 'shipped', 'preparing', '', 'admin'); t.store.update(order.id, 'completed', 'shipped', '', 'admin'); t.db.close();
});
test('restaura oculto un producto retirado del catalogo antes de cancelar', () => {
  const t = setup(), order = t.store.create(t.body, randomUUID());
  t.db.prepare("UPDATE paginas_editables SET contenido_json=? WHERE slug='tienda'").run(JSON.stringify({ productos: [] }));
  t.store.update(order.id, 'cancelled', 'pending', 'Retirado', 'admin');
  assert.equal(t.catalog()[0].stock, 2); assert.equal(t.catalog()[0].oculto, true); t.db.close();
});
test('las presentaciones descuentan y devuelven sus existencias correctas', () => {
  const t = setup([{ presentaciones: [{ id: 'v1', precio: 99, stock: 99 }, { id: 'v2', precio: 5, stock: 8 }] }]);
  t.body.items = [{ producto_id: 'queso-local', variante_id: 'v1', cantidad: 2, precio_unitario: 3.25 }, { producto_id: 'queso-local', variante_id: 'v2', cantidad: 3, precio_unitario: 5 }];
  const order = t.store.create(t.body, randomUUID()); assert.equal(order.total, 21.5);
  assert.equal(t.catalog()[0].stock, 3); assert.equal(t.catalog()[0].presentaciones[1].stock, 5);
  t.store.update(order.id, 'cancelled', 'pending', 'Cancelacion', 'admin'); assert.equal(t.catalog()[0].stock, 5); assert.equal(t.catalog()[0].presentaciones[1].stock, 8); t.db.close();
});
test('identificadores cortos no permiten consultar pedidos y el enlace usa UUID', () => {
  const t = setup(); assert.throws(() => t.store.get('1'), { status: 400 });
  const order = t.store.create(t.body, randomUUID()); assert.equal(trackingUrl(order.id, 'https://conlact.example.test'), `https://conlact.example.test/seguimiento?pedido=${order.id}`); t.db.close();
});
test('imagenes repetidas salen del JSON y se guardan una sola vez como bytes', () => {
  const t = setup(); media.mediaSchema(t.db);
  const png = Buffer.alloc(3 * 1024 * 1024); Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
  const url = `data:image/png;base64,${png.toString('base64')}`;
  const content = media.separateImages(t.db, { productos: [{ fotos: [url] }, { fotos: [url] }] });
  assert.equal(content.productos[0].fotos[0], content.productos[1].fotos[0]); assert.ok(JSON.stringify(content).length < 300);
  assert.equal(t.db.prepare('SELECT count(*) n FROM content_images').get().n, 1);
  assert.equal(t.db.prepare('SELECT length(bytes) n FROM content_images').get().n, png.length);
  assert.throws(() => media.separateImages(t.db, 'data:image/svg+xml;base64,PHN2Zy8+')); t.db.close();
});
test('migracion de imagenes conserva paginas y recetas y se puede repetir', () => {
  const t = setup(), png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jJvUAAAAASUVORK5CYII=';
  t.db.prepare("UPDATE paginas_editables SET contenido_json=? WHERE slug='tienda'").run(JSON.stringify({ productos: [{ fotos: [png] }] }));
  t.db.prepare('INSERT INTO recetas_editables VALUES (?,?)').run('receta', png);
  media.migrateInlineImages(t.db); media.migrateInlineImages(t.db);
  const image = t.catalog()[0].fotos[0]; assert.match(image, /^\/api\/media\/[a-f0-9]{64}$/);
  assert.equal(t.db.prepare('SELECT imagen_url FROM recetas_editables').get().imagen_url, image);
  assert.equal(t.db.prepare('SELECT count(*) n FROM content_images').get().n, 1); t.db.close();
});
test('API de gestion rechaza visitantes y editores; la consulta publica rechaza numeros', async () => {
  const auth = require('../src/lib/server/sqliteAuth.ts'); const original = auth.getAuthStore;
  const { NextRequest } = require('next/server');
  const api = require('../src/app/api/admin/pedidos/route.ts');
  const pub = require('../src/app/api/pedidos/[id]/route.ts');
  try {
    auth.getAuthStore = () => ({ session: () => null });
    assert.equal(api.GET(new NextRequest('http://localhost/api/admin/pedidos')).status, 401);
    auth.getAuthStore = () => ({ session: () => ({ profile: { role: 'editor' } }) });
    assert.equal(api.GET(new NextRequest('http://localhost/api/admin/pedidos')).status, 403);
    assert.equal((await pub.GET(new Request('http://localhost/api/pedidos/1'), { params: Promise.resolve({ id: '1' }) })).status, 400);
    auth.getAuthStore = () => ({ session: () => ({ profile: { role: 'admin', id: 'test-admin' } }) });
    const mutation = require('../src/app/api/admin/pedidos/[id]/route.ts');
    const crossSite = new NextRequest('http://localhost/api/admin/pedidos/'+randomUUID(), { method: 'PATCH', headers: { origin: 'https://attacker.test', 'content-type': 'application/json' }, body: '{}' });
    assert.equal((await mutation.PATCH(crossSite, { params: Promise.resolve({ id: randomUUID() }) })).status, 403);
  } finally { auth.getAuthStore = original; }
});

test('los correos de pedido incluyen el enlace UUID y fallos SMTP quedan para reintento', async () => {
  const t = setup(), order = t.store.create(t.body, randomUUID());
  const sqlite = require('../src/lib/db/sqlite.ts'), originalDb = sqlite.getDb;
  const mailer = require('nodemailer'), originalTransport = mailer.createTransport;
  const envNames = ['SMTP_HOST','SMTP_USERNAME','SMTP_PASSWORD','APP_ORIGIN'];
  const previous = Object.fromEntries(envNames.map(key => [key, process.env[key]]));
  const sent = [];
  try {
    sqlite.getDb = () => t.db;
    process.env.SMTP_HOST='smtp.example.test'; process.env.SMTP_USERNAME='test'; process.env.SMTP_PASSWORD='fake-test-password'; process.env.APP_ORIGIN='https://conlact.example.test';
    mailer.createTransport = () => ({ sendMail: async body => { sent.push(body); return { accepted: ['test@example.test'] }; }, close() {} });
    const { deliverOrderMail } = require('../src/lib/server/orderMail.ts');
    await deliverOrderMail();
    assert.equal(sent.length, 1); assert.ok(sent[0].text.includes(`https://conlact.example.test/seguimiento?pedido=${order.id}`));
    assert.equal(t.db.prepare('SELECT estado FROM shop_order_mail').get().estado, 'sent');
    t.store.update(order.id,'paid','pending','Pago verificado','admin');
    mailer.createTransport = () => ({ sendMail: async () => { throw new Error('SMTP unavailable'); }, close() {} });
    await deliverOrderMail();
    const pending = t.db.prepare("SELECT estado,attempts,next_at FROM shop_order_mail WHERE estado!='sent'").get();
    assert.equal(pending.estado, 'retry'); assert.equal(pending.attempts, 1); assert.ok(pending.next_at > Date.now());
    assert.equal(t.store.get(order.id).estado, 'paid'); assert.equal(t.catalog()[0].stock, 3);
  } finally {
    sqlite.getDb = originalDb; mailer.createTransport = originalTransport;
    for (const key of envNames) { if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key]; }
    t.db.close();
  }
});
