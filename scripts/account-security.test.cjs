/* eslint-disable @typescript-eslint/no-require-imports -- Pruebas CommonJS con carga de TypeScript y servicios de autenticación simulados. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args); };
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const local = require('../src/lib/localAccounts.ts');
const security = require('../src/lib/accountSecurity.ts');

function memoryStorage() {
  const entries = new Map();
  return { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, String(value)), removeItem: key => entries.delete(key) };
}
function contextFor(account) {
  const storage = memoryStorage();
  local.saveStoredAccount(account, storage);
  const session = local.localAccountSession(account);
  storage.setItem(local.LOCAL_STORAGE_SESSION_KEY, JSON.stringify(session));
  return { ...session, storage, supabaseConfigured: false, auth: { getSession() { throw new Error('No se debe consultar un servicio remoto'); } } };
}
const customer = () => ({ id:'local-user-1',fullName:'Persona de prueba',email:'persona@example.test',passwordHash:'Anterior123!',role:'customer',createdAt:'2026-01-01',authProvider:'local' });
const snapshot = storage => [storage.getItem(local.LOCAL_STORAGE_ACCOUNTS_KEY), storage.getItem(local.LOCAL_STORAGE_SESSION_KEY)];

test('PBKDF2 usa sal aleatoria y verifica contraseñas sin guardarlas en texto plano', async () => {
  const first = await local.hashLocalPassword('ClaveNueva123!');
  const second = await local.hashLocalPassword('ClaveNueva123!');
  assert.notEqual(first, second); assert.match(first, /^pbkdf2-sha256\$310000\$/);
  assert.equal(await local.verifyLocalPassword('ClaveNueva123!', first), true);
  assert.equal(await local.verifyLocalPassword('Incorrecta123!', first), false);
  assert.equal(await local.verifyLocalPassword('ClaveNueva123!', 'pbkdf2-sha256$invalid'), false);
});

test('las credenciales locales anteriores se migran al ingresar correctamente', async () => {
  const context = contextFor(customer());
  const result = await local.authenticateLocalAccount(customer().email, customer().passwordHash, context.storage);
  assert.equal(result.status,'found'); assert.match(local.getStoredAccounts(context.storage)[0].passwordHash,/^pbkdf2-sha256\$/);
  assert.equal((await local.authenticateLocalAccount(customer().email,'Incorrecta123!',context.storage)).status,'invalid');
});

test('cambiar correo actualiza sesión y siguiente login; el correo anterior deja de servir', async () => {
  const context = contextFor(customer());
  const result = await security.updateAccountCredentials({kind:'email',email:'  NUEVA@example.test ',currentPassword:'Anterior123!'},context);
  assert.equal(result.success,true); assert.equal(result.user.email,'nueva@example.test'); assert.equal(result.profile.role,'customer');
  assert.equal(JSON.parse(context.storage.getItem(local.LOCAL_STORAGE_SESSION_KEY)).user.email,'nueva@example.test');
  assert.equal((await local.authenticateLocalAccount(customer().email,'Anterior123!',context.storage)).status,'none');
  assert.equal((await local.authenticateLocalAccount('nueva@example.test','Anterior123!',context.storage)).status,'found');
  assert.equal(local.getStoredAccounts(context.storage).length,1);
});

test('cambiar contraseña conserva cuenta y rol e invalida la contraseña anterior', async () => {
  const context = contextFor(customer());
  const result = await security.updateAccountCredentials({kind:'password',password:'NuevaClave123!',currentPassword:'Anterior123!'},context);
  assert.equal(result.success,true); assert.equal(result.profile.role,'customer'); assert.equal(result.user.id,customer().id);
  assert.equal((await local.authenticateLocalAccount(customer().email,'Anterior123!',context.storage)).status,'invalid');
  assert.equal((await local.authenticateLocalAccount(customer().email,'NuevaClave123!',context.storage)).status,'found');
  assert.ok(!JSON.stringify(snapshot(context.storage)).includes('NuevaClave123!'));
});

test('contraseña actual incorrecta, correo repetido y dirección reservada no alteran la cuenta', async () => {
  const context = contextFor(customer());
  const before = snapshot(context.storage);
  assert.equal((await security.updateAccountCredentials({kind:'email',email:'otra@example.test',currentPassword:'Incorrecta123!'},context)).success,false);
  assert.deepEqual(snapshot(context.storage),before);
  local.saveStoredAccount({...customer(),id:'otra-persona',email:'ocupado@example.test'},context.storage);
  const withOther = snapshot(context.storage);
  for(const email of ['ocupado@example.test','admin@conlact.org','cliente@conlact.org']) {
    assert.equal((await security.updateAccountCredentials({kind:'email',email,currentPassword:'Anterior123!'},context)).success,false);
    assert.deepEqual(snapshot(context.storage),withOther);
  }
});

test('el administrador local puede cambiar correo y contraseña manteniendo su rol', async () => {
  const storage = memoryStorage();
  const admin = local.getLocalAccountById('d1000000-0000-0000-0000-000000000001',storage);
  const session = local.localAccountSession(admin); storage.setItem(local.LOCAL_STORAGE_SESSION_KEY,JSON.stringify(session));
  const context = {...session,storage,supabaseConfigured:false,auth:{}};
  assert.equal((await local.authenticateLocalAccount(admin.email,'CualquierClave123!',storage)).status,'invalid');
  const emailResult = await security.updateAccountCredentials({kind:'email',email:'admin-nuevo@example.test',currentPassword:admin.passwordHash},context);
  assert.equal(emailResult.success,true); assert.equal(emailResult.profile.role,'admin');
  assert.equal((await local.authenticateLocalAccount(admin.email,admin.passwordHash,storage)).status,'invalid');
  const passwordResult = await security.updateAccountCredentials({kind:'password',password:'ClaveAdminNueva123!',currentPassword:admin.passwordHash},{...context,user:emailResult.user,profile:emailResult.profile});
  assert.equal(passwordResult.success,true); assert.equal(passwordResult.profile.role,'admin');
  assert.equal((await local.authenticateLocalAccount('admin-nuevo@example.test',admin.passwordHash,storage)).status,'invalid');
  assert.equal((await local.authenticateLocalAccount('admin-nuevo@example.test','ClaveAdminNueva123!',storage)).status,'found');
});

test('un fallo de almacenamiento revierte credenciales y sesión locales', async () => {
  const context = contextFor(customer()); const before = snapshot(context.storage);
  const setItem = context.storage.setItem; let failOnce = true;
  context.storage.setItem = (key,value) => { if(key===local.LOCAL_STORAGE_SESSION_KEY&&failOnce){failOnce=false;throw new Error('Sin espacio');}return setItem(key,value); };
  const result = await security.updateAccountCredentials({kind:'email',email:'nuevo@example.test',currentPassword:'Anterior123!'},context);
  assert.equal(result.success,false); assert.deepEqual(snapshot(context.storage),before);
  assert.equal((await local.authenticateLocalAccount(customer().email,'Anterior123!',context.storage)).status,'found');
});

function remoteContext({ verifyError = null, updateError = null, returnedEmail = 'persona@example.test', differentUser = false } = {}) {
  const context = contextFor({...customer(),id:'e1111111-1111-4111-8111-111111111111',authProvider:'supabase'});
  context.supabaseConfigured = true; const calls = [];
  context.auth = {
    async getSession(){ calls.push('session'); return {data:{session:{user:context.user}},error:null}; },
    async signInWithPassword(attributes){ calls.push(['verify',attributes.email]); return {data:{user:differentUser?{...context.user,id:'otro'}:context.user},error:verifyError}; },
    async updateUser(attributes){ calls.push(['update',attributes]); return {data:{user:updateError?null:{...context.user,email:returnedEmail}},error:updateError}; },
  };
  return {context,calls};
}

test('Supabase verifica contraseña antes del cambio y conserva el correo hasta su confirmación', async () => {
  const {context,calls} = remoteContext();
  const result = await security.updateAccountCredentials({kind:'email',email:'nuevo@example.test',currentPassword:'Anterior123!'},context);
  assert.equal(result.success,true); assert.equal(result.requiresConfirmation,true); assert.equal(result.user.email,'persona@example.test');
  assert.deepEqual(calls,['session',['verify','persona@example.test'],['update',{email:'nuevo@example.test'}]]);
  assert.deepEqual(local.getStoredAccounts(context.storage),[]); assert.equal(context.storage.getItem(local.LOCAL_STORAGE_SESSION_KEY),null);
});

test('Supabase refleja el correo cuando está confirmado y permite actualizar contraseña', async () => {
  const first = remoteContext({returnedEmail:'nuevo@example.test'});
  const result = await security.updateAccountCredentials({kind:'email',email:'nuevo@example.test',currentPassword:'Anterior123!'},first.context);
  assert.equal(result.success,true); assert.equal(result.requiresConfirmation,false); assert.equal(result.profile.email,'nuevo@example.test');
  const second = remoteContext();
  assert.equal((await security.updateAccountCredentials({kind:'password',password:'NuevaClave123!',currentPassword:'Anterior123!'},second.context)).success,true);
  assert.deepEqual(second.calls[2],['update',{password:'NuevaClave123!'}]);
});

test('Supabase no cambia nada si falla la contraseña o la verificación corresponde a otro usuario', async () => {
  for(const options of [{verifyError:{message:'Invalid credentials'}},{differentUser:true}]) {
    const {context,calls} = remoteContext(options); const before = snapshot(context.storage);
    assert.equal((await security.updateAccountCredentials({kind:'password',password:'NuevaClave123!',currentPassword:'Incorrecta123!'},context)).success,false);
    assert.equal(calls.length,2); assert.deepEqual(snapshot(context.storage),before);
  }
});

test('errores remotos no simulan cambios locales y las cuentas remotas no usan copias antiguas', async () => {
  const {context} = remoteContext({updateError:{message:'Email already registered'}}); const before = snapshot(context.storage);
  assert.equal((await security.updateAccountCredentials({kind:'email',email:'ocupado@example.test',currentPassword:'Anterior123!'},context)).success,false);
  assert.deepEqual(snapshot(context.storage),before);
  assert.equal((await local.authenticateLocalAccount(context.user.email,'Anterior123!',context.storage)).status,'none');
  context.auth.getSession = async () => ({data:{session:null},error:null});
  assert.equal((await security.updateAccountCredentials({kind:'password',password:'NuevaClave123!',currentPassword:'Anterior123!'},context)).success,false);
});

test('los límites de correo y contraseña se comprueban antes de cualquier mutación', async () => {
  const context = contextFor(customer()); const before = snapshot(context.storage);
  for(const password of ['12345678','solo-letras','Abc123','a'.repeat(129)+'1','Anterior123!']) {
    assert.equal((await security.updateAccountCredentials({kind:'password',password,currentPassword:'Anterior123!'},context)).success,false);
  }
  for(const email of ['','no-es-correo',customer().email,'a'.repeat(250)+'@example.test']) {
    assert.equal((await security.updateAccountCredentials({kind:'email',email,currentPassword:'Anterior123!'},context)).success,false);
  }
  assert.equal(security.newPasswordError('Ñññññññ1'),null);
  assert.deepEqual(snapshot(context.storage),before);
});
