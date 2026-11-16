/* eslint-disable @typescript-eslint/no-require-imports -- Execute server TypeScript in isolated tests. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const resolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.resolve(__dirname, '../src', request.slice(2)) : request, ...args);
};
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }, fileName: filename,
}).outputText, filename);
const { assertSameOrigin } = require('../src/lib/server/authHttp.ts');

test('origin validation behind HTTPS proxy', () => {
  const previous = process.env.APP_ORIGIN;
  try {
    process.env.APP_ORIGIN = 'https://conlact.example.test';
    const request = (origin, extra = {}) => new Request('http://frontend:3000/api/auth/login', {
      method: 'POST', headers: { origin, ...extra },
    });
    assert.doesNotThrow(() => assertSameOrigin(request('https://conlact.example.test')));
    for (const origin of ['https://attacker.test', 'http://conlact.example.test', 'null', 'https://conlact.example.test:3079']) {
      assert.throws(() => assertSameOrigin(request(origin)), { status: 403 });
    }
    assert.throws(() => assertSameOrigin(request('https://attacker.test', {
      host: 'attacker.test', 'x-forwarded-host': 'attacker.test', 'x-forwarded-proto': 'https',
    })), { status: 403 });
    assert.throws(() => assertSameOrigin(request('https://conlact.example.test', { 'sec-fetch-site': 'cross-site' })), { status: 403 });
    delete process.env.APP_ORIGIN;
    assert.doesNotThrow(() => assertSameOrigin(new Request('http://localhost:3000/api/auth/login', {
      method: 'POST', headers: { origin: 'http://localhost:3000' },
    })));
    assert.throws(() => assertSameOrigin(request('https://attacker.test')), { status: 403 });
  } finally {
    if (previous === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = previous;
  }
});
