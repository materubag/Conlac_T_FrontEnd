/* eslint-disable @typescript-eslint/no-require-imports -- El cargador de pruebas transpila TS y sustituye SQLite por una base en memoria mediante CommonJS. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const ts = require('typescript');
const { DatabaseSync } = require('node:sqlite');

// Carga los módulos TS del proyecto sin dependencias adicionales.
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args);
};
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (mod, filename) => {
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
};
const rules = require('../src/lib/adminValidation.ts');
const payloads = require('../src/lib/adminPayloadValidation.ts');

test('los límites de texto se aplican sin truncar los datos', () => {
  for (const [name, rule] of Object.entries(rules.ADMIN_RULES)) {
    if (rule.min !== undefined || rule.format) continue;
    assert.equal(rules.fieldError('a'.repeat(rule.maxLength), name), null);
    assert.match(rules.fieldError('a'.repeat(rule.maxLength + 1), name), /Máximo/);
  }
  assert.ok(rules.fieldError('', 'title'));
  assert.equal(rules.fieldError('', 'description'), null);
});

test('números: rangos, enteros, decimales y valores no finitos', () => {
  for (const [name, rule] of Object.entries(rules.ADMIN_RULES)) {
    if (rule.min === undefined) continue;
    assert.equal(rules.fieldError(rule.min, name), null, name);
    assert.equal(rules.fieldError(rule.max, name), null, name);
    for (const invalid of [rule.min - 1, rule.max + 1, Infinity, NaN, '3abc', '1e3', '']) assert.ok(rules.fieldError(invalid, name), `${name}: ${invalid}`);
    if (rule.decimals === 0) assert.ok(rules.fieldError('1.2', name));
  }
  assert.equal(rules.fieldError('3.50', 'price'), null);
  assert.ok(rules.fieldError('3.501', 'price'));
  assert.equal(rules.fieldError('-1.298500', 'latitude'), null);
  assert.ok(rules.fieldError('-1.2985001', 'latitude'));
  assert.equal(rules.fieldError('', 'latitude', true), null);
});

test('YouTube: exige HTTPS, dominio exacto y un ID de video válido', () => {
  const id = 'dQw4w9WgXcQ';
  for (const suffix of [`watch?v=${id}`, `embed/${id}`, `shorts/${id}`, `live/${id}`]) assert.equal(rules.fieldError('https://www.youtube.com/' + suffix, 'youtube'), null);
  for (const url of ['http://www.youtube.com/watch?v='+id, 'https://youtu.be/'+id, 'https://youtube.com/watch?v='+id,
    'https://www.youtube.com.evil.test/watch?v='+id, 'https://www.youtube.com@evil.test/watch?v='+id,
    'https://evil.test/?url=https://www.youtube.com/watch?v='+id, 'https://www.youtube.com/watch?v=short', 'https://vimeo.com/123', 'javascript:alert(1)']) assert.ok(rules.fieldError(url, 'youtube'), url);
  assert.equal(rules.fieldError('', 'youtube'), null);
});

test('imágenes: máximo 5 MB exactos, formato y firma del archivo', () => {
  assert.equal(rules.imageFileError({ type: 'image/png', size: rules.MAX_IMAGE_BYTES }), null);
  assert.ok(rules.imageFileError({ type: 'image/png', size: rules.MAX_IMAGE_BYTES + 1 }));
  assert.ok(rules.imageFileError({ type: 'image/svg+xml', size: 100 }));
  assert.ok(rules.imageFileError({ type: 'image/jpeg', size: 0 }));
  const data = Buffer.alloc(rules.MAX_IMAGE_BYTES); Buffer.from('\x89PNG\r\n\x1a\n', 'latin1').copy(data);
  assert.equal(rules.imageValueError('data:image/png;base64,' + data.toString('base64')), null);
  assert.ok(rules.imageValueError('data:image/png;base64,' + Buffer.concat([data, Buffer.alloc(1)]).toString('base64')));
  assert.ok(rules.imageValueError('data:image/png;base64,' + Buffer.from('not a png').toString('base64')));
  assert.equal(rules.imageValueError('/demo/PROD-fresco.jpg'), null);
});

const header = { eyebrow: 'Comunidad', titulo: 'Página de prueba', subtitulo: 'Descripción breve' };
test('perfiles de asociación: historia, ficha dinámica, coordenadas y video', () => {
  const body = { ...header, contenido: { nombre: 'Asociación de prueba', historia: 'Texto', lat: -1.3, lng: -78.7,
    campos_ficha: [{ label: 'Familias', value: '50' }], fotos: ['/demo/ASOC-paramo.jpg'] } };
  assert.equal(payloads.validatePagePayload('asoc-prueba', body), null);
  body.contenido.lat = -91; assert.match(payloads.validatePagePayload('asoc-prueba', body), /lat/);
  body.contenido.lat = -1.3; body.contenido.campos_ficha[0].value = 'x'.repeat(301);
  assert.match(payloads.validatePagePayload('asoc-prueba', body), /value/);
  body.contenido.campos_ficha[0].value = '50'; body.contenido.historia = 'x'.repeat(5001);
  assert.match(payloads.validatePagePayload('asoc-prueba', body), /historia/);
});

test('recetas: minutos, porciones, pasos y descripciones', () => {
  const body = { config: header, recetas: [{ titulo: 'Receta de prueba', tiempo_prep: 30, porciones: 4, pasos: ['Preparar los ingredientes'] }] };
  assert.equal(payloads.validateRecipesPayload(body), null);
  body.recetas[0].porciones = 101; assert.match(payloads.validateRecipesPayload(body), /porciones/);
  body.recetas[0].porciones = 4; body.recetas[0].pasos[0] = 'x'.repeat(1001);
  assert.match(payloads.validateRecipesPayload(body), /pasos/);
});

test('contenidos: no acepta Vimeo y valida cambios de tipo a video', () => {
  assert.ok(payloads.validateContentPayload({ titulo: 'Video', tipo: 'video', url: 'https://vimeo.com/123' }));
  assert.equal(payloads.validateContentPayload({ titulo: 'Documento', tipo: 'documento', url: 'https://example.org/doc.pdf' }), null);
  assert.ok(payloads.validateContentPayload({ titulo: 'Sin URL', tipo: 'video', url: '' }));
  assert.ok(payloads.validateContentPayload({ titulo: 'Sin texto', tipo: 'texto', cuerpo: '' }));
});

test('los controles renderizan límites, modos numéricos y conservan el fondo del footer', () => {
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { EditableField } = require('../src/components/admin/EditableField.tsx');
  const html = renderToStaticMarkup(React.createElement(EditableField, { isEditing: true, rule: 'title', value: 'Texto de prueba', onChange() {}, className: 'text-white' }));
  assert.match(html, /maxLength="150"/); assert.match(html, /bg-transparent/); assert.doesNotMatch(html, /focus:bg-white/);
  const numeric = renderToStaticMarkup(React.createElement(EditableField, { isEditing: true, rule: 'latitude', value: '-1.2', onChange() {} }));
  assert.match(numeric, /inputMode="decimal"/); assert.match(numeric, /data-admin-field="latitude"/);
});

test('el inventario cubre todos los campos editables y cinco puntos de carga', () => {
  const inventory = require('./admin-fields-inventory.json').filter(item => !item.scope?.startsWith('home'));
  assert.equal(inventory.length, 113);
  const files = new Set(inventory.map(item => item.file));
  let count = 0, images = 0;
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, source, 99, true, 4);
    function visit(node) {
      if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
        const tag = node.tagName.getText(sf);
        const attrs = Object.fromEntries(node.attributes.properties.filter(ts.isJsxAttribute).map(a => [a.name.getText(sf), a.initializer?.getText(sf)]));
        if (['EditableField', 'ValidatedInput', 'ValidatedTextarea'].includes(tag)) { assert.ok(attrs.rule, file); count++; }
        if (tag === 'input' && attrs.value && attrs.type !== '"checkbox"') assert.fail('Campo sin validador: '+file);
        if (tag === 'input' && attrs.type === '"file"') { assert.equal(attrs.accept, '{IMAGE_ACCEPT}'); images++; }
      }
      ts.forEachChild(node, visit);
    }
    visit(sf);
  }
  assert.equal(count, 113); assert.equal(images, 5);
});

// Las rutas reales escriben únicamente en una base en memoria durante las pruebas.
const db = new DatabaseSync(':memory:');
db.exec(`CREATE TABLE paginas_editables (slug TEXT PRIMARY KEY, eyebrow TEXT, titulo TEXT NOT NULL, subtitulo TEXT, contenido_json TEXT, actualizado_en TEXT NOT NULL);`);
db.exec(`CREATE TABLE recetas_editables (id TEXT PRIMARY KEY, slug TEXT, titulo TEXT, descripcion_corta TEXT, tipo_queso TEXT, tiempo_prep INTEGER, porciones INTEGER, imagen_url TEXT, gradient TEXT, video_url TEXT, pasos_json TEXT, orden INTEGER, publicado INTEGER, creado_en TEXT, actualizado_en TEXT);`);
const sqlitePath = require.resolve('../src/lib/db/sqlite.ts');
require.cache[sqlitePath] = { id: sqlitePath, filename: sqlitePath, loaded: true,
  exports: { getDb: () => db, ahora: () => new Date().toISOString(), nuevoId: () => crypto.randomUUID() } };
after(() => db.close());

// Los guardados se validan con una sesión admin real de esta base en memoria.
const { createAuthSchema } = require('../src/lib/server/sqliteAuth.ts');
createAuthSchema(db);
db.prepare('INSERT INTO auth_users (id,email,full_name,role,password_hash,created_at) VALUES (?,?,?,?,?,?)').run('validation-admin','validation@example.test','Validación','admin','unused',new Date().toISOString());
db.prepare('INSERT INTO auth_sessions VALUES (?,?,?)').run(require('node:crypto').createHash('sha256').update('validation-session').digest('hex'),'validation-admin',Date.now()+600000);

test('la ruta de páginas rechaza datos inválidos sin modificar SQLite', async () => {
  const { POST } = require('../src/app/api/admin/paginas/[slug]/route.ts');
  const send = body => POST(new Request('http://localhost/api/admin/paginas/tienda', { method: 'POST', headers:{cookie:'conlact_session=validation-session'}, body: JSON.stringify(body) }), { params: Promise.resolve({ slug: 'tienda' }) });
  const body = { ...header, contenido: { productos: [{ id: 'one', nombre: 'Queso artesanal', precio: 3.5, stock: 25 }] } };
  const { obtenerPaginaConfig } = require('../src/lib/db/paginasRepo.ts');
  body.actualizado_en = obtenerPaginaConfig('tienda', { ...header, contenido: { productos: [] } }).actualizado_en;
  assert.equal((await send(body)).status, 200);
  const saved = db.prepare('SELECT contenido_json FROM paginas_editables WHERE slug = ?').get('tienda').contenido_json;
  body.contenido.productos[0].precio = -1;
  const response = await send(body); assert.equal(response.status, 400); assert.match((await response.json()).error, /precio/);
  assert.equal(db.prepare('SELECT contenido_json FROM paginas_editables WHERE slug = ?').get('tienda').contenido_json, saved);
});

test('la ruta de recetas rechaza videos y cantidades inválidas antes de persistir', async () => {
  const { POST } = require('../src/app/api/admin/recetas/route.ts');
  const body = { config: header, recetas: [{ titulo: 'Receta de prueba', video_url: 'https://vimeo.com/123', tiempo_prep: 30 }] };
  const send = () => POST(new Request('http://localhost/api/admin/recetas', { method: 'POST', headers:{cookie:'conlact_session=validation-session'}, body: JSON.stringify(body) }));
  assert.equal((await send()).status, 400);
  body.recetas[0].video_url = ''; body.recetas[0].tiempo_prep = 0;
  assert.equal((await send()).status, 400);
});

function savePage(slug, content) {
  db.prepare('INSERT OR REPLACE INTO paginas_editables VALUES (?, ?, ?, ?, ?, ?)').run(slug, 'Categoria actual', 'Titulo actual '+slug, 'Descripcion actual '+slug, JSON.stringify(content), new Date().toISOString());
}

test('Home filtra el catálogo completo antes de limitar a cuatro productos y conserva sus imágenes', async () => {
  const { getStorePageData, selectHomeProducts } = require('../src/lib/server/storeCatalog.ts');
  const products = Array.from({ length: 8 }, (_, i) => ({ id: 'p'+i, nombre: 'Producto '+i, stock: i === 2 ? 0 : 20, precio: 4, oculto: i < 2, fotos: ['/actual/'+i+'.jpg'], disponible: true }));
  savePage('tienda', { productos: products });
  const originalFetch = global.fetch;
  global.fetch = () => { throw new Error('No debe consultar otro catálogo'); };
  try {
    const store = await getStorePageData();
    assert.deepEqual(store.products, products);
    const selected = selectHomeProducts(store.products);
    assert.deepEqual(selected.map(p => p.id), ['p3','p4','p5','p6']);
    assert.deepEqual(selected.map(p => p.fotos[0]), ['/actual/3.jpg','/actual/4.jpg','/actual/5.jpg','/actual/6.jpg']);
    assert.equal(store.products.length, 8);
  } finally { global.fetch = originalFetch; }
});

test('Home respeta el catálogo vacío y no restaura productos de muestra', async () => {
  const { getStorePageData, selectHomeProducts } = require('../src/lib/server/storeCatalog.ts');
  savePage('tienda', { productos: [] });
  const originalFetch = global.fetch; let requests = 0;
  global.fetch = async () => { requests++; return Response.json([{ id: 'ficticio' }]); };
  try {
    const store = await getStorePageData();
    assert.deepEqual(store.products, []); assert.deepEqual(selectHomeProducts(store.products), []); assert.equal(requests, 0);
  } finally { global.fetch = originalFetch; }
});

test('sin catálogo guardado usa todos los productos del backend y no inventa imágenes', async () => {
  const { getStorePageData } = require('../src/lib/server/storeCatalog.ts');
  db.prepare('DELETE FROM paginas_editables WHERE slug = ?').run('tienda');
  const originalFetch = global.fetch;
  global.fetch = async url => { assert.match(url, /\/products$/); return Response.json([{ id:'prod-queso-fresco', nombre:'Queso real', stock:10, precio:3, disponible:true, fotos:[] }]); };
  try {
    const store = await getStorePageData();
    assert.deepEqual(store.products[0].fotos, ['/placeholders/product-queso-fresco.svg']);
    global.fetch = async () => { throw new Error('Backend no disponible'); };
    const persisted = await getStorePageData(); assert.deepEqual(persisted.products, JSON.parse(JSON.stringify(store.products))); assert.equal(persisted.error, null);
    db.prepare('DELETE FROM paginas_editables WHERE slug = ?').run('tienda');
    const unavailable = await getStorePageData(); assert.deepEqual(unavailable.products, []); assert.ok(unavailable.error);
  } finally { global.fetch = originalFetch; }
});

test('accesos de Home usan imágenes y cantidades existentes, sin contar recetas no publicadas', async () => {
  const { getHomeAccessCards, getHomeTestimonials } = require('../src/lib/server/homeContent.ts');
  savePage('asociaciones', { asociaciones: [{ foto_url:'/actual/asociacion.jpg' }, { foto_url:'/actual/otra.jpg' }] });
  savePage('turismo', { atractivos: [{ foto_url:'/actual/ruta.jpg' }] });
  savePage('recetas', {});
  savePage('nosotros', { testimonials: [{ quote:'Opinion actual', name:'Autora actual', role:'Clienta' }] });
  db.exec('DELETE FROM recetas_editables');
  const insert = db.prepare('INSERT INTO recetas_editables (id,titulo,imagen_url,pasos_json,orden,publicado) VALUES (?,?,?,?,?,?)');
  insert.run('oculta','Receta oculta','/actual/oculta.jpg','[]',0,0);
  insert.run('publica','Receta publicada','/actual/receta.jpg','[]',1,1);
  const originalFetch = global.fetch;
  global.fetch = () => { throw new Error('No debe usar fuentes paralelas'); };
  try {
    const cards = await getHomeAccessCards();
    assert.deepEqual(cards.map(card => card.count), [2,1,1]);
    assert.deepEqual(cards.map(card => card.image), ['/actual/asociacion.jpg','/actual/receta.jpg','/actual/ruta.jpg']);
    assert.equal(cards[1].title, 'Titulo actual recetas');
    assert.equal((await getHomeTestimonials())[0].quote, 'Opinion actual');
    savePage('asociaciones', { asociaciones: [] }); savePage('turismo', { atractivos: [] }); db.exec('DELETE FROM recetas_editables');
    const empty = await getHomeAccessCards();
    assert.deepEqual(empty.map(card => card.count), [0,0,0]); assert.deepEqual(empty.map(card => card.image), [null,null,null]);
    assert.equal(db.prepare('SELECT count(*) AS n FROM recetas_editables').get().n, 0);
  } finally { global.fetch = originalFetch; }
});

test('Home guarda sus textos con límites sin copiar el catálogo ni los testimonios', async () => {
  const { homeDefaults } = require('../src/lib/homeDefaults.ts');
  const { POST } = require('../src/app/api/admin/paginas/[slug]/route.ts');
  const body = structuredClone(homeDefaults); body.titulo = 'Titulo de inicio modificado';
  const send = () => POST(new Request('http://localhost/api/admin/paginas/home', { method:'POST', headers:{cookie:'conlact_session=validation-session'}, body:JSON.stringify(body) }), { params:Promise.resolve({ slug:'home' }) });
  assert.equal((await send()).status, 200);
  const saved = db.prepare('SELECT * FROM paginas_editables WHERE slug = ?').get('home');
  assert.equal(saved.titulo, body.titulo);
  const content = JSON.parse(saved.contenido_json); assert.equal(content.products.productos, undefined); assert.equal(content.testimonials.testimonials, undefined);
  body.contenido.trust.pillars[0].title = 'x'.repeat(151);
  assert.equal((await send()).status, 400);
  assert.equal(db.prepare('SELECT contenido_json FROM paginas_editables WHERE slug = ?').get('home').contenido_json, saved.contenido_json);
});

test('los 34 campos propios del Home tienen límites y valores iniciales válidos', () => {
  const inventory = require('./admin-fields-inventory.json').filter(item => item.scope === 'home');
  const { homeDefaults } = require('../src/lib/homeDefaults.ts');
  assert.equal(inventory.length, 34);
  for (const item of inventory) {
    const value = item.field.split('.').reduce((current, key) => current[key], homeDefaults);
    assert.equal(rules.fieldError(value, item.rule), null, item.field);
  }
});

test('Home agrega y elimina tarjetas y sincroniza testimonios preservando Nosotros', async () => {
  const { homeDefaults } = require('../src/lib/homeDefaults.ts');
  const { POST } = require('../src/app/api/admin/paginas/[slug]/route.ts');
  const { getHomeTestimonials } = require('../src/lib/server/homeContent.ts');
  savePage('nosotros', { historia_titulo: 'Historia que se conserva', historia_p1:'Texto existente', stats:[{value:'10',label:'Familias',sublabel:'Actuales'}], testimonials:[{quote:'Anterior',name:'Autora anterior',role:'Clienta'}] });
  const body = { ...structuredClone(homeDefaults), testimonios:[{id:'nuevo-id',quote:'Testimonio nuevo',name:'Autora nueva',role:'Productora'}] };
  body.contenido.trust.pillars = [{id:'pilar-nuevo',title:'Tarjeta nueva',description:'Detalle de la nueva tarjeta'}];
  body.contenido.hidden_sections = { trust:true, testimonials:false };
  const send = () => POST(new Request('http://localhost/api/admin/paginas/home', {method:'POST',headers:{cookie:'conlact_session=validation-session'},body:JSON.stringify(body)}),{params:Promise.resolve({slug:'home'})});
  assert.equal((await send()).status,200);
  const home = JSON.parse(db.prepare('SELECT contenido_json FROM paginas_editables WHERE slug = ?').get('home').contenido_json);
  const nosotros = JSON.parse(db.prepare('SELECT contenido_json FROM paginas_editables WHERE slug = ?').get('nosotros').contenido_json);
  assert.equal(home.trust.pillars[0].id,'pilar-nuevo'); assert.equal(home.hidden_sections.trust,true);
  assert.equal(nosotros.historia_titulo,'Historia que se conserva'); assert.equal(nosotros.stats[0].value,'10');
  assert.deepEqual((await getHomeTestimonials()).map(item=>item.id),['nuevo-id']);
  body.contenido.trust.pillars = []; body.testimonios = [];
  assert.equal((await send()).status,200);
  assert.deepEqual((await getHomeTestimonials()),[]);
  assert.deepEqual(JSON.parse(db.prepare('SELECT contenido_json FROM paginas_editables WHERE slug = ?').get('home').contenido_json).trust.pillars,[]);
});

test('testimonios inválidos y visibilidad no booleana no modifican páginas guardadas', async () => {
  const { homeDefaults } = require('../src/lib/homeDefaults.ts');
  const { POST } = require('../src/app/api/admin/paginas/[slug]/route.ts');
  const before = db.prepare('SELECT * FROM paginas_editables WHERE slug IN (?,?) ORDER BY slug').all('home','nosotros');
  const send = body => POST(new Request('http://localhost/api/admin/paginas/home',{method:'POST',headers:{cookie:'conlact_session=validation-session'},body:JSON.stringify(body)}),{params:Promise.resolve({slug:'home'})});
  for(const items of [[{quote:'',name:'Autor',role:''}],[null],[{quote:'Texto',name:'Autor',role:'',rating:6}]]) {
    assert.equal((await send({...structuredClone(homeDefaults),testimonios:items})).status,400);
  }
  const body = structuredClone(homeDefaults); body.contenido.hidden_sections = {trust:'true'};
  assert.equal((await send(body)).status,400);
  assert.deepEqual(db.prepare('SELECT * FROM paginas_editables WHERE slug IN (?,?) ORDER BY slug').all('home','nosotros'),before);
});

test('el guardado de Home y testimonios es atómico y no toca Nosotros si no cambian sus tarjetas', () => {
  const { homeDefaults } = require('../src/lib/homeDefaults.ts');
  const { guardarInicio } = require('../src/lib/db/homeRepo.ts');
  const beforeNosotros = db.prepare('SELECT * FROM paginas_editables WHERE slug = ?').get('nosotros');
  guardarInicio({...structuredClone(homeDefaults),titulo:'Solo cambia el encabezado'});
  assert.deepEqual(db.prepare('SELECT * FROM paginas_editables WHERE slug = ?').get('nosotros'),beforeNosotros);
  const beforeHome = db.prepare('SELECT * FROM paginas_editables WHERE slug = ?').get('home');
  db.exec("CREATE TRIGGER impedir_cambio_nosotros BEFORE UPDATE ON paginas_editables WHEN OLD.slug = 'nosotros' BEGIN SELECT RAISE(ABORT, 'prueba de rollback'); END");
  try {
    assert.throws(()=>guardarInicio({...structuredClone(homeDefaults),titulo:'No debe persistir'},[{id:'card',quote:'Texto',name:'Autora',role:''}]),/rollback/);
  } finally { db.exec('DROP TRIGGER impedir_cambio_nosotros'); }
  assert.deepEqual(db.prepare('SELECT * FROM paginas_editables WHERE slug = ?').get('home'),beforeHome);
  assert.deepEqual(db.prepare('SELECT * FROM paginas_editables WHERE slug = ?').get('nosotros'),beforeNosotros);
});

test('secciones ocultas desaparecen en vista pública y conservan sus controles en edición', () => {
  const React = require('react'); const {renderToStaticMarkup} = require('react-dom/server');
  const {homeDefaults} = require('../src/lib/homeDefaults.ts');
  const {HomeEditingContext} = require('../src/components/home/HomeEditing.tsx');
  const {HomeSection} = require('../src/components/home/HomeControls.tsx');
  const config = {...structuredClone(homeDefaults),slug:'home'}; config.contenido.hidden_sections = {trust:true};
  const render = isEditing => renderToStaticMarkup(React.createElement(HomeEditingContext.Provider,{value:{config,isEditing,setSectionHidden(){}}},React.createElement(HomeSection,{section:'trust',title:'Garantia'},React.createElement('p',null,'Contenido conservado'))));
  assert.equal(render(false),'');
  const editor = render(true); assert.match(editor,/Contenido conservado/); assert.match(editor,/role="switch"/); assert.match(editor,/aria-checked="false"/);
  config.contenido.hidden_sections.trust = false;
  assert.match(render(false),/Contenido conservado/); assert.doesNotMatch(render(false),/role="switch"/);
});

test('las listas vacías mantienen los botones para agregar y el público no ve acciones de borrar', () => {
  const React = require('react'); const {renderToStaticMarkup} = require('react-dom/server');
  const {homeDefaults} = require('../src/lib/homeDefaults.ts');
  const {HomeEditingContext} = require('../src/components/home/HomeEditing.tsx');
  const {TrustSection} = require('../src/components/home/TrustSection.tsx');
  const {TestimonialsSection} = require('../src/components/home/TestimonialsSection.tsx');
  const config = {...structuredClone(homeDefaults),slug:'home'}; config.contenido.trust.pillars = [];
  const state = {config,isEditing:true,update(){},setPillars(){},testimonials:[],setTestimonials(){}};
  const render = component => renderToStaticMarkup(React.createElement(HomeEditingContext.Provider,{value:state},React.createElement(component)));
  assert.match(render(TrustSection),/Añadir tarjeta/); assert.match(render(TestimonialsSection),/Añadir testimonio/);
  state.testimonials = [{id:'one',quote:'Texto real',name:'Autora real',role:'Clienta'}];
  assert.match(render(TestimonialsSection),/Borrar testimonio/);
  state.isEditing = false; const publicView = render(TestimonialsSection);
  assert.match(publicView,/Texto real/); assert.doesNotMatch(publicView,/Borrar|Añadir testimonio|textarea/);
});
