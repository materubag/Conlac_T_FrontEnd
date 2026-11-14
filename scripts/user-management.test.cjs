/* eslint-disable @typescript-eslint/no-require-imports -- SQLite en memoria y rutas reales con sesiones de prueba. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { DatabaseSync } = require('node:sqlite');
const { createHash } = require('node:crypto');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args); };
for (const extension of ['.ts','.tsx']) require.extensions[extension] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const auth = require('../src/lib/server/sqliteAuth.ts');
const management = require('../src/lib/server/userManagement.ts');
const password = 'ClavePrueba123!';
async function setup() {
  const db = new DatabaseSync(':memory:'); db.exec('PRAGMA foreign_keys=ON');
  const store = new auth.SqliteAuthStore(db);
  const hash = await auth.hashPassword(password);
  const insert = db.prepare('INSERT INTO auth_users (id,email,full_name,role,password_hash,created_at) VALUES (?,?,?,?,?,?)');
  for (const role of ['admin','editor','customer']) insert.run(role+'-test', role+'@example.test', role+' de prueba',role,hash,new Date().toISOString());
  const admin = await store.signIn('admin@example.test',password);
  const editor = await store.signIn('editor@example.test',password);
  const customer = await store.signIn('customer@example.test',password);
  return { db,store,admin,editor,customer, manager: new management.SqliteUserManager(db,store) };
}
const body = (overrides={}) => ({full_name:'Nuevo editor',email:'nuevo@example.test',role:'editor',password,confirmation:password,...overrides});

test('admin crea usuarios con hashes y el editor puede iniciar sesión con su rol real', async () => {
  const t = await setup(); const user = await t.manager.create(t.admin.sessionToken,body());
  assert.equal(user.role,'editor');assert.equal(user.is_active,true);assert.equal(user.password_hash,undefined);
  assert.match(t.db.prepare('SELECT password_hash FROM auth_users WHERE id=?').get(user.id).password_hash,/^scrypt\$/);
  assert.equal((await t.store.signIn(user.email,password)).session.profile.role,'editor');
  const admins = await t.manager.create(t.admin.sessionToken,body({email:'otroadmin@example.test',role:'admin'}));
  assert.equal(admins.role,'admin'); assert.equal(t.manager.list(t.admin.sessionToken).length,4);
  assert.equal(t.manager.list(t.admin.sessionToken).some(user=>user.role==='customer'),false);t.db.close();
});
test('invitados, editores y clientes no pueden listar ni modificar usuarios', async () => {
  const t = await setup();
  for (const token of [undefined,t.editor.sessionToken,t.customer.sessionToken]) {
    const status=token?403:401;
    assert.throws(()=>t.manager.list(token),e=>e.status===status);
    await assert.rejects(t.manager.create(token,body()),e=>e.status===status);
    assert.throws(()=>t.manager.update(token,'editor-test',{role:'admin'}),e=>e.status===status);
    assert.throws(()=>t.manager.delete(token,'admin-test'),e=>e.status===status);
  }t.db.close();
});
test('valida roles, duplicados, nombre, correo, contraseña y campos extra', async () => {
  const t = await setup();
  for(const overrides of [{role:'customer'},{role:'superadmin'},{full_name:'x'},{full_name:'a'.repeat(151)},{email:'malo'},{email:'ADMIN@EXAMPLE.TEST'},{password:'corta',confirmation:'corta'},{confirmation:'Distinta123!'},{is_active:true}]) await assert.rejects(t.manager.create(t.admin.sessionToken,body(overrides)));
  assert.throws(()=>t.manager.update(t.admin.sessionToken,'editor-test',{email:'otro@example.test'}));
  assert.throws(()=>t.manager.update(t.admin.sessionToken,'editor-test',{password:'OtraClave123!'}));
  assert.throws(()=>t.manager.update(t.admin.sessionToken,'editor-test',{is_active:'false'}));
  assert.throws(()=>t.manager.update(t.admin.sessionToken,'customer-test',{role:'admin'}),e=>e.status===404);
  assert.equal(t.manager.list(t.admin.sessionToken).length,2);t.db.close();
});
test('no permite desactivar, eliminar ni degradar la cuenta propia o perder el último admin', async () => {
  const t = await setup();
  assert.throws(()=>t.manager.update(t.admin.sessionToken,'admin-test',{role:'editor'}));
  assert.throws(()=>t.manager.update(t.admin.sessionToken,'admin-test',{is_active:false}));
  assert.throws(()=>t.manager.delete(t.admin.sessionToken,'admin-test'));
  assert.equal(t.manager.update(t.admin.sessionToken,'admin-test',{full_name:'Nombre actualizado'}).full_name,'Nombre actualizado');
  assert.ok(t.store.session(t.admin.sessionToken)); assert.equal(t.manager.list(t.admin.sessionToken).filter(u=>u.role==='admin'&&u.is_active).length,1);t.db.close();
});
test('cambio de rol y desactivación revocan sesiones y códigos; reactivación exige nuevo login', async () => {
  const t = await setup(); let code;
  const reset = await t.store.requestReset('editor@example.test','test',async(_,value)=>{code=value;});
  const changed = t.manager.update(t.admin.sessionToken,'editor-test',{role:'admin'});
  assert.equal(changed.role,'admin');assert.equal(t.store.session(t.editor.sessionToken),null);
  await assert.rejects(t.store.verifyResetCode(reset.requestId,code));
  const elevated = await t.store.signIn('editor@example.test',password);
  assert.equal(elevated.session.profile.role,'admin');
  t.manager.update(t.admin.sessionToken,'editor-test',{is_active:false});
  assert.equal(t.store.session(elevated.sessionToken),null);
  await assert.rejects(t.store.signIn('editor@example.test',password));
  let sent=false;await t.store.requestReset('editor@example.test','inactive',async()=>{sent=true;}).catch(e=>assert.equal(e.status,429));assert.equal(sent,false);
  t.manager.update(t.admin.sessionToken,'editor-test',{is_active:true,role:'editor'});
  assert.equal(t.store.session(elevated.sessionToken),null);assert.equal((await t.store.signIn('editor@example.test',password)).session.profile.role,'editor');t.db.close();
});
test('eliminar borra acceso y códigos asociados sin tocar otras cuentas', async () => {
  const t = await setup(); await t.store.requestEmailChange(t.editor.sessionToken,'nuevo@example.test',password,async()=>{});
  t.manager.delete(t.admin.sessionToken,'editor-test');
  assert.equal(t.db.prepare('SELECT count(*) n FROM email_change_challenges').get().n,0);
  assert.equal(t.store.session(t.editor.sessionToken),null);assert.ok(t.store.session(t.admin.sessionToken));
  await assert.rejects(t.store.signIn('editor@example.test',password));
  assert.equal(t.db.prepare('PRAGMA foreign_key_check').all().length,0);t.db.close();
});
test('migración desde el esquema anterior conserva credenciales y sesiones con claves foráneas', async () => {
  const db = new DatabaseSync(':memory:'); db.exec(`PRAGMA foreign_keys=ON;
   CREATE TABLE auth_users(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE COLLATE NOCASE,full_name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('admin','customer')),password_hash TEXT NOT NULL,created_at TEXT NOT NULL);
   CREATE TABLE auth_sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);`);
  const hash=await auth.hashPassword(password),token='migration-session';
  db.prepare('INSERT INTO auth_users VALUES(?,?,?,?,?,?)').run('old-admin','old@example.test','Cuenta existente','admin',hash,new Date().toISOString());
  db.prepare('INSERT INTO auth_sessions VALUES(?,?,?)').run(createHash('sha256').update(token).digest('hex'),'old-admin',Date.now()+60000);
  const store = new auth.SqliteAuthStore(db); await store.initialize();
  assert.equal(store.session(token).user.id,'old-admin');assert.equal(db.prepare('SELECT password_hash FROM auth_users').get().password_hash,hash);
  assert.equal(db.prepare('SELECT count(*) n FROM auth_users').get().n,1);assert.equal(db.prepare('PRAGMA foreign_keys').get().foreign_keys,1);
  const manager = new management.SqliteUserManager(db,store);const created=await manager.create(token,body());assert.equal(created.role,'editor');
  assert.equal(db.prepare('PRAGMA foreign_key_check').all().length,0);assert.ok((await store.signIn('old@example.test',password)).session);db.close();
});
test('una cuenta inicial eliminada no vuelve a crearse al reiniciar el almacén', async () => {
  const t=await setup();const second=await t.manager.create(t.admin.sessionToken,body({role:'admin'}));
  const session=await t.store.signIn(second.email,password);t.manager.delete(session.sessionToken,'admin-test');
  const restarted=new auth.SqliteAuthStore(t.db);await restarted.initialize();
  assert.equal(t.db.prepare('SELECT count(*) n FROM auth_users WHERE id=?').get('admin-test').n,0);t.db.close();
});
test('rutas HTTP comprueban cookies reales, origen y no exponen hashes', async () => {
  const t=await setup(); const { NextRequest }=require('next/server'); const previous=management.getUserManager;management.getUserManager=()=>t.manager;
  try {
   const route=require('../src/app/api/admin/usuarios/route.ts');const detail=require('../src/app/api/admin/usuarios/[id]/route.ts');
   const request=(token,method='GET',payload,extra={})=>new NextRequest('http://localhost/api/admin/usuarios',{method,headers:{...(token?{cookie:`conlact_session=${token}`} : {}),...extra},...(method!=='GET'?{body:JSON.stringify(payload||{})}:{})});
   assert.equal((await route.GET(request())).status,401);assert.equal((await route.GET(request(t.editor.sessionToken))).status,403);
   assert.equal((await route.POST(request(t.admin.sessionToken,'POST',body(),{origin:'https://otro.test'}))).status,403);
   const forged=request(undefined,'POST',body(),{'x-user-role':'admin',authorization:'Bearer admin'});assert.equal((await route.POST(forged)).status,401);
   const created=await route.POST(request(t.admin.sessionToken,'POST',body()));assert.equal(created.status,201);const {user}=await created.json();assert.equal(user.password_hash,undefined);
   const updated=await detail.PATCH(request(t.admin.sessionToken,'PATCH',{role:'admin'}),{params:Promise.resolve({id:user.id})});assert.equal(updated.status,200);
   assert.equal((await detail.DELETE(request(t.editor.sessionToken,'DELETE'),{params:Promise.resolve({id:user.id})})).status,403);
   assert.equal((await detail.DELETE(request(t.admin.sessionToken,'DELETE'),{params:Promise.resolve({id:user.id})})).status,200);
   const list=await route.GET(request(t.admin.sessionToken));assert.equal(list.headers.get('cache-control'),'no-store');assert.equal(JSON.stringify(await list.json()).includes('password_hash'),false);
  }finally{management.getUserManager=previous;t.db.close();}
});
test('contenido admite admin/editor y rechaza clientes, invitados y orígenes ajenos', async () => {
  const t=await setup();const previous=auth.getAuthStore;auth.getAuthStore=()=>t.store;
  try {
   const { contentPermission }=require('../src/lib/server/contentPermission.ts');
   const request=(token,origin)=>new Request('http://localhost/api/admin/recetas',{method:'POST',headers:{...(token?{cookie:`conlact_session=${token}`} : {}),...(origin?{origin}:{})}});
   assert.equal(contentPermission(request(t.admin.sessionToken)),null);assert.equal(contentPermission(request(t.editor.sessionToken)),null);
   assert.equal(contentPermission(request(t.customer.sessionToken)).status,403);assert.equal(contentPermission(request()).status,401);
   assert.equal(contentPermission(request(t.editor.sessionToken,'https://otro.test')).status,403);
   const payload = new Request('http://localhost/api/admin/recetas',{method:'POST',headers:{cookie:`conlact_session=${t.editor.sessionToken}`},body:JSON.stringify({title:'Conservar el cuerpo'})});
   assert.equal(contentPermission(payload),null);assert.deepEqual(await payload.json(),{title:'Conservar el cuerpo'});
   const route=require('../src/app/api/admin/recetas/route.ts');assert.equal((await route.POST(request())).status,401);
   t.manager.update(t.admin.sessionToken,'editor-test',{is_active:false});assert.equal(contentPermission(request(t.editor.sessionToken)).status,401);
  }finally{auth.getAuthStore=previous;t.db.close();}
});
