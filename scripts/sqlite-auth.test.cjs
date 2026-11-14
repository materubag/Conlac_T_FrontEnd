/* eslint-disable @typescript-eslint/no-require-imports -- Pruebas aisladas de SQLite en memoria. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const { DatabaseSync } = require('node:sqlite');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args); };
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const auth = require('../src/lib/server/sqliteAuth.ts');
const email = 'tester@example.test', password = 'Anterior123!';
async function setup() {
  const db = new DatabaseSync(':memory:');
  let now = Date.now(), received;
  const store = new auth.SqliteAuthStore(db, () => now);
  await store.initialize();
  db.prepare('INSERT INTO auth_users (id,email,full_name,role,password_hash,created_at) VALUES (?,?,?,?,?,?)').run('test-user', email, 'Prueba', 'customer', await auth.hashPassword(password), new Date(now).toISOString());
  const send = async (address, code) => { received = {address, code}; };
  return { db, store, send, advance: ms => { now += ms; }, code: () => received?.code };
}
test('flujo completo: código, contraseña nueva, revocación de sesiones y credenciales anteriores', async () => {
  const t = await setup();
  const login = await t.store.signIn(email, password);
  const request = await t.store.requestReset(email, 'test', t.send);
  assert.match(t.code(), /^\d{6}$/);
  const row = t.db.prepare('SELECT * FROM password_reset_challenges WHERE id = ?').get(request.requestId);
  assert.notEqual(row.code_hash, t.code()); assert.match(row.code_hash, /^scrypt\$/);
  await assert.rejects(t.store.finishReset(undefined, 'NuevaClave123!', 'NuevaClave123!'));
  const grant = await t.store.verifyResetCode(request.requestId, t.code());
  await assert.rejects(t.store.verifyResetCode(request.requestId, t.code()));
  await assert.rejects(t.store.finishReset(grant, 'NuevaClave123!', 'Distinta123!'));
  await t.store.finishReset(grant, 'NuevaClave123!', 'NuevaClave123!');
  assert.equal(t.store.session(login.sessionToken), null);
  await assert.rejects(t.store.signIn(email, password));
  assert.equal((await t.store.signIn(email, 'NuevaClave123!')).session.user.email, email);
  await assert.rejects(t.store.finishReset(grant, 'OtraClave123!', 'OtraClave123!'));
  t.db.close();
});
test('bloquea tras cinco códigos incorrectos, incluso el código correcto posterior', async () => {
  const t = await setup(); const r = await t.store.requestReset(email, 'test', t.send);
  const wrong = t.code() === '000000' ? '111111' : '000000';
  for (let i = 0; i < 5; i++) await assert.rejects(t.store.verifyResetCode(r.requestId, wrong));
  await assert.rejects(t.store.verifyResetCode(r.requestId, t.code()));
  assert.equal(t.db.prepare('SELECT attempts FROM password_reset_challenges').get().attempts, 5); t.db.close();
});
test('código caduca a los diez minutos; autorización caduca a los cinco minutos', async () => {
  const t = await setup(); const first = await t.store.requestReset(email, 'test', t.send);
  t.advance(auth.RESET_CODE_TTL);
  await assert.rejects(t.store.verifyResetCode(first.requestId, t.code()));
  const second = await t.store.requestReset(email, 'test', t.send);
  const grant = await t.store.verifyResetCode(second.requestId, t.code()); t.advance(auth.RESET_GRANT_TTL);
  await assert.rejects(t.store.finishReset(grant, 'NuevaClave123!', 'NuevaClave123!'));
  assert.ok((await t.store.signIn(email, password)).session); t.db.close();
});
test('reenviar exige sesenta segundos e invalida el código anterior', async () => {
  const t = await setup(); const first = await t.store.requestReset(email, 'test', t.send); const old = t.code();
  await assert.rejects(t.store.requestReset(email, 'test', t.send), e => e.status === 429 && e.retryAfter > 0);
  t.advance(auth.RESEND_DELAY); const second = await t.store.requestReset(email, 'test', t.send);
  await assert.rejects(t.store.verifyResetCode(first.requestId, old));
  assert.ok(await t.store.verifyResetCode(second.requestId, t.code())); t.db.close();
});
test('dirección desconocida no envía correo ni puede obtener autorización', async () => {
  const t = await setup(); let sent = false;
  const r = await t.store.requestReset('unknown@example.test', 'test', async () => { sent = true; });
  assert.equal(sent, false); assert.equal(r.expiresIn, 600);
  await assert.rejects(t.store.verifyResetCode(r.requestId, '123456'));
  assert.equal(t.db.prepare('SELECT user_id FROM password_reset_challenges').get().user_id, null); t.db.close();
});
test('un fallo SMTP no deja un código utilizable ni invalida el envío anterior', async () => {
  const t = await setup(); const first = await t.store.requestReset(email, 'test', t.send); const code = t.code();
  t.advance(auth.RESEND_DELAY);
  await assert.rejects(t.store.requestReset(email, 'test', async () => { throw Error('SMTP'); }), e => e.status === 503);
  assert.ok(await t.store.verifyResetCode(first.requestId, code)); t.db.close();
});
test('cambio de correo verifica contraseña, rechaza duplicados y rota sesión conservando rol', async () => {
  const t = await setup(); const login = await t.store.signIn(email, password);
  const request = await t.store.requestReset(email, 'test', t.send);
  await assert.rejects(t.store.requestEmailChange(undefined, 'new@example.test', password, t.send));
  await assert.rejects(t.store.requestEmailChange(login.sessionToken, 'new@example.test', 'Incorrecta123!', t.send));
  await assert.rejects(t.store.requestEmailChange(login.sessionToken, 'cliente@conlact.org', password, t.send));
  const pending = await t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, t.send);
  const code = t.code();
  assert.equal(t.store.session(login.sessionToken).user.email, email);
  assert.ok((await t.store.signIn(email, password)).session);
  const changed = await t.store.verifyEmailChange(login.sessionToken, pending.requestId, code);
  assert.equal(changed.session.profile.role, 'customer'); assert.equal(changed.session.user.email, 'new@example.test');
  assert.equal(t.store.session(login.sessionToken), null); assert.ok(t.store.session(changed.sessionToken));
  await assert.rejects(t.store.verifyResetCode(request.requestId, t.code()));
  await assert.rejects(t.store.signIn(email, password));
  assert.ok((await t.store.signIn('new@example.test', password)).session); t.db.close();
});
test('cambio de correo: envío al destino, código cifrado, sesión ligada y uso único', async () => {
  const t = await setup(); const login = await t.store.signIn(email, password);
  let recipient, code;
  const pending = await t.store.requestEmailChange(login.sessionToken, ' NEW@example.test ', password, async (to, value) => { recipient = to; code = value; });
  assert.equal(recipient, 'new@example.test'); assert.match(code, /^\d{6}$/);
  const row = t.db.prepare('SELECT * FROM email_change_challenges').get();
  assert.match(row.code_hash, /^scrypt\$/); assert.notEqual(row.code_hash, code); assert.notEqual(row.session_hash, login.sessionToken);
  const other = await t.store.signIn(email, password);
  await assert.rejects(t.store.verifyEmailChange(other.sessionToken, pending.requestId, code));
  await assert.rejects(t.store.verifyEmailChange(undefined, pending.requestId, code));
  const wrong = code === '000000' ? '111111' : '000000';
  await assert.rejects(t.store.verifyEmailChange(login.sessionToken, pending.requestId, wrong));
  assert.equal(t.store.session(login.sessionToken).user.email, email);
  const changed = await t.store.verifyEmailChange(login.sessionToken, pending.requestId, code);
  assert.equal(t.store.session(other.sessionToken), null);
  await assert.rejects(t.store.verifyEmailChange(changed.sessionToken, pending.requestId, code));
  t.db.close();
});
test('cambio de correo: cinco intentos fallidos bloquean el código sin cambiar la cuenta', async () => {
  const t = await setup(); const login = await t.store.signIn(email, password);
  const pending = await t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, t.send);
  const code = t.code(), wrong = code === '000000' ? '111111' : '000000';
  for (let i = 0; i < 5; i++) await assert.rejects(t.store.verifyEmailChange(login.sessionToken, pending.requestId, wrong));
  await assert.rejects(t.store.verifyEmailChange(login.sessionToken, pending.requestId, code));
  assert.equal(t.db.prepare('SELECT attempts FROM email_change_challenges').get().attempts, 5);
  assert.equal(t.store.session(login.sessionToken).user.email, email); t.db.close();
});
test('cambio de correo: caducidad, reenvío y fallo SMTP preservan el correo actual', async () => {
  const t = await setup(); const login = await t.store.signIn(email, password);
  const first = await t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, t.send); const old = t.code();
  await assert.rejects(t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, t.send), e => e.status === 429);
  t.advance(auth.RESEND_DELAY);
  await assert.rejects(t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, async () => { throw Error('SMTP'); }), e => e.status === 503);
  assert.equal(t.store.session(login.sessionToken).user.email, email);
  // Un fallo de envío no consume el código previamente entregado.
  assert.equal(t.db.prepare('SELECT consumed_at FROM email_change_challenges WHERE id = ?').get(first.requestId).consumed_at, null);
  t.advance(auth.RESEND_DELAY);
  const second = await t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, t.send);
  await assert.rejects(t.store.verifyEmailChange(login.sessionToken, first.requestId, old));
  t.advance(auth.RESET_CODE_TTL);
  await assert.rejects(t.store.verifyEmailChange(login.sessionToken, second.requestId, t.code()));
  assert.equal(t.store.session(login.sessionToken).user.email, email); t.db.close();
});
test('cambio de correo: verifica de nuevo la disponibilidad del destino y la sesión al confirmar', async () => {
  const t = await setup(); const login = await t.store.signIn(email, password);
  const pending = await t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, t.send); const code = t.code();
  t.db.prepare('UPDATE auth_users SET email = ? WHERE email = ?').run('new@example.test','cliente@conlact.org');
  await assert.rejects(t.store.verifyEmailChange(login.sessionToken, pending.requestId, code));
  assert.equal(t.store.session(login.sessionToken).user.email, email);
  t.store.signOut(login.sessionToken);
  await assert.rejects(t.store.verifyEmailChange(login.sessionToken, pending.requestId, code)); t.db.close();
});
test('código de cambio de correo no sirve para recuperar contraseña y reset revoca su sesión', async () => {
  const t = await setup(); const login = await t.store.signIn(email,password);
  const pending = await t.store.requestEmailChange(login.sessionToken, 'new@example.test', password, t.send); const code = t.code();
  await assert.rejects(t.store.verifyResetCode(pending.requestId, code));
  const reset = await t.store.requestReset(email,'test',t.send);
  const grant = await t.store.verifyResetCode(reset.requestId,t.code());
  await t.store.finishReset(grant,'NuevaClave123!','NuevaClave123!');
  await assert.rejects(t.store.verifyEmailChange(login.sessionToken,pending.requestId,code));
  assert.equal((await t.store.signIn(email,'NuevaClave123!')).session.user.email,email); t.db.close();
});
test('API de correo exige código y solo actualiza y rota cookie tras verificarlo', async () => {
  const t = await setup(); const { NextRequest } = require('next/server');
  const mail = require('../src/lib/server/recoveryMail.ts');
  const oldStore = auth.getAuthStore, oldMailer = mail.recoveryMailer;
  auth.getAuthStore = () => t.store; let purpose;
  mail.recoveryMailer = value => { purpose = value; return t.send; };
  try {
    const login = await t.store.signIn(email,password);
    const route = require('../src/app/api/auth/cambiar-correo/route.ts');
    const post = body => route.POST(new NextRequest('http://localhost/api/auth/cambiar-correo',{method:'POST',headers:{cookie:`conlact_session=${login.sessionToken}`},body:JSON.stringify(body)}));
    assert.equal((await post({email:'new@example.test',currentPassword:password})).status,400);
    const response = await post({action:'request',email:'new@example.test',currentPassword:password});
    const data = await response.json(); assert.equal(response.status,200); assert.equal(purpose,'email');
    assert.equal(data.code,undefined); assert.equal(data.user,undefined); assert.equal(response.headers.get('set-cookie'),null);
    assert.equal(t.store.session(login.sessionToken).user.email,email);
    const verified = await post({action:'verify',requestId:data.requestId,code:t.code()});
    assert.equal(verified.status,200); assert.match(verified.headers.get('set-cookie'),/HttpOnly/i);
    const result = await verified.json(); assert.equal(result.user.email,'new@example.test'); assert.equal(result.sessionToken,undefined);
  } finally { auth.getAuthStore = oldStore; mail.recoveryMailer = oldMailer; t.db.close(); }
});
test('contraseña inválida, igual o cancelación no cambian las credenciales', async () => {
  const t = await setup(); const r = await t.store.requestReset(email, 'test', t.send);
  const grant = await t.store.verifyResetCode(r.requestId, t.code());
  for (const invalid of ['corta', 'abcdefgh', password, 'a1'.repeat(65)]) await assert.rejects(t.store.finishReset(grant, invalid, invalid));
  t.store.cancelReset(grant); await assert.rejects(t.store.finishReset(grant, 'NuevaClave123!', 'NuevaClave123!'));
  assert.ok((await t.store.signIn(email, password)).session); t.db.close();
});
test('endpoints rechazan registro y solicitudes desde otro origen', async () => {
  const { NextRequest } = require('next/server');
  const { POST } = require('../src/app/api/auth/register/route.ts');
  assert.equal((await POST()).status, 403);
  const { authBody } = require('../src/lib/server/authHttp.ts');
  await assert.rejects(authBody(new NextRequest('http://localhost/api/auth/login', {method:'POST',headers:{origin:'https://otro.test'},body:'{}'})), e => e.status === 403);
});
test('API usa cookies HttpOnly y jamás devuelve el código o autorización en JSON', async () => {
  const t = await setup(); const { NextRequest } = require('next/server');
  const mail = require('../src/lib/server/recoveryMail.ts');
  const oldStore = auth.getAuthStore, oldMailer = mail.recoveryMailer;
  auth.getAuthStore = () => t.store; mail.recoveryMailer = () => t.send;
  try {
    const route = require('../src/app/api/auth/recuperar-password/route.ts');
    const post = (body, cookie) => route.POST(new NextRequest('http://localhost/api/auth/recuperar-password', {method:'POST',headers:{'Content-Type':'application/json',...(cookie ? {cookie} : {})},body:JSON.stringify(body)}));
    const requested = await post({action:'request',email}); const data = await requested.json();
    assert.equal(requested.status,200); assert.equal(data.code,undefined);
    const verified = await post({action:'verify',requestId:data.requestId,code:t.code()});
    assert.deepEqual(await verified.json(),{success:true});
    const cookie = verified.headers.get('set-cookie'); assert.match(cookie,/HttpOnly/i); assert.match(cookie,/SameSite=strict/i);
    const reset = await post({action:'reset',password:'NuevaClave123!',confirmation:'NuevaClave123!'},cookie.split(';')[0]);
    assert.equal(reset.status,200); assert.match(reset.headers.get('set-cookie'),/Max-Age=0/i);
    const login = require('../src/app/api/auth/login/route.ts');
    const response = await login.POST(new NextRequest('http://localhost/api/auth/login',{method:'POST',body:JSON.stringify({email,password:'NuevaClave123!'})}));
    assert.equal(response.status,200); assert.match(response.headers.get('set-cookie'),/HttpOnly/i);
    assert.equal((await response.json()).sessionToken,undefined);
  } finally { auth.getAuthStore = oldStore; mail.recoveryMailer = oldMailer; t.db.close(); }
});
