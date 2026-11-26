// Contract check: sends real requests to a running api-cbar-admin and validates every
// response (status, content type, body, documented headers) against dist/openapi.json.
//
//   API_URL=https://api-cbar-admin-test.cbar.az node scripts/contract-check.mjs
//   ADMIN_USER=… ADMIN_PASSWORD=… node scripts/contract-check.mjs
//
// Without credentials: the auth endpoints' failure paths, and every protected operation
// called without a token (must be the documented 401). The request is rejected by the
// authentication middleware before any action runs, so the writes are harmless.
// With credentials: additionally every GET, with ids taken from the list responses, plus
// the 404 of each item GET. Nothing is ever written; the session is logged out at the end.

import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const BASE = (process.env.API_URL ?? 'https://api-cbar-admin-test.cbar.az').replace(/\/$/, '');
const { ADMIN_USER, ADMIN_PASSWORD } = process.env;
const spec = JSON.parse(await readFile(new URL('../dist/openapi.json', import.meta.url), 'utf8'));

// strict: false — the spec document itself is not a JSON Schema, and OpenAPI allows
// keywords (`examples`, …) that ajv's strict mode rejects.
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addFormat('int16', { type: 'number', validate: (n) => Number.isInteger(n) && n >= -32768 && n <= 32767 });
ajv.addSchema(spec, 'spec');

const pointer = (...parts) => parts.map((p) => String(p).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');
const at = (ptr) => ptr.split('/').reduce((o, k) => o?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], spec);

const METHODS = ['get', 'put', 'post', 'delete', 'patch'];
const results = [];
const exercised = new Set();

/**
 * Sends `method url` and validates the response against operation `method template`.
 * Returns the parsed JSON body (or null) so later steps can pick ids from it.
 */
async function check(method, template, url, { expect, headers = {}, body } = {}) {
  const opKey = `${method} ${template}`;
  exercised.add(opKey);
  const errors = [];
  let res;
  try {
    res = await fetch(BASE + url, {
      method,
      redirect: 'manual',
      headers: { ...(body !== undefined && { 'content-type': 'application/json' }), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    results.push({ opKey, url, status: 'ERR', errors: [String(err)] });
    return null;
  }

  const status = String(res.status);
  const op = spec.paths[template]?.[method.toLowerCase()];
  // Shared responses are bundled as `$ref: '#/components/responses/X'`; follow it and keep
  // the pointer to wherever the response object actually lives, for the schema ref below.
  let responsePtr = pointer('paths', template, method.toLowerCase(), 'responses', status);
  let documented = op?.responses?.[status];
  if (documented?.$ref) {
    responsePtr = documented.$ref.replace(/^#\//, '');
    documented = at(responsePtr);
  }
  if (!op) errors.push(`operation ${opKey} is not in the spec`);
  else if (!documented) errors.push(`status ${status} is not documented (documented: ${Object.keys(op.responses).join(', ')})`);
  if (expect && !expect.includes(res.status)) errors.push(`expected ${expect.join('|')}, got ${status}`);

  const text = await res.text();
  const contentType = (res.headers.get('content-type') ?? '').split(';')[0].trim();
  let parsed = null;

  if (documented?.content) {
    const mediaTypes = Object.keys(documented.content);
    const media = mediaTypes.find((m) => m === contentType) ?? mediaTypes.find((m) => m === '*/*');
    if (!media) {
      errors.push(`content-type "${contentType}" not documented (documented: ${mediaTypes.join(', ')})`);
    } else if (/json/.test(media)) {
      try {
        parsed = JSON.parse(text);
      } catch {
        errors.push('body is not valid JSON');
      }
      if (parsed !== null && documented.content[media].schema) {
        const ref = `spec#/${responsePtr}/${pointer('content', media, 'schema')}`;
        const validate = ajv.getSchema(ref) ?? ajv.compile({ $ref: ref });
        if (!validate(parsed)) {
          for (const e of validate.errors.slice(0, 8))
            errors.push(`${e.instancePath || '(root)'} ${e.message}${e.params?.allowedValues ? ` ${JSON.stringify(e.params.allowedValues)}` : ''}`);
          if (validate.errors.length > 8) errors.push(`… ${validate.errors.length - 8} more`);
        }
      }
    }
  } else if (documented && text.length > 0) {
    errors.push(`documented without a body, got ${text.length} bytes`);
  }

  for (const [name, h] of Object.entries(documented?.headers ?? {})) {
    const value = res.headers.get(name);
    if (value === null) errors.push(`missing header ${name}`);
    else if (h.schema?.pattern && !new RegExp(h.schema.pattern).test(value)) errors.push(`header ${name} = "${value}" does not match ${h.schema.pattern}`);
  }

  results.push({ opKey, url: `${method} ${url}`, status, errors, text: errors.length ? text.slice(0, 300) : undefined });
  return parsed;
}

const note = (opKey, url, error) => results.push({ opKey, url, status: '—', errors: [error] });
const itemsOf = (body) => (Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : []);
const PLACEHOLDER = { id: 1, mediaId: 1, assetId: 1, imageId: 1, code: 'USD', key: 'x' };
const fill = (template, values = PLACEHOLDER) =>
  template.replace(/\{(\w+)\}/g, (_, name) => encodeURIComponent(values[name] ?? 1));

const operations = Object.entries(spec.paths).flatMap(([template, item]) =>
  METHODS.filter((m) => item[m]).map((m) => ({ method: m.toUpperCase(), template, op: item[m] })));
const isPublic = ({ op }) => Array.isArray(op.security) && op.security.length === 0
  || op.security?.some((s) => 'refreshCookie' in s);

// ---------------------------------------------------------------------------------------
// Auth and health — no credentials needed.

const EVIL = { Origin: 'https://contract-check.invalid' };
await check('POST', '/api/v1/auth/login', '/api/v1/auth/login', { body: {}, expect: [400] });
await check('POST', '/api/v1/auth/login', '/api/v1/auth/login',
  { body: { username: `contract-check-${Date.now()}`, password: 'x' }, expect: [401] });
await check('POST', '/api/v1/auth/refresh', '/api/v1/auth/refresh', { expect: [401] });
await check('POST', '/api/v1/auth/refresh', '/api/v1/auth/refresh', { headers: EVIL, expect: [403] });
await check('POST', '/api/v1/auth/logout', '/api/v1/auth/logout', { expect: [204] });
await check('POST', '/api/v1/auth/logout', '/api/v1/auth/logout', { headers: EVIL, expect: [403] });
await check('GET', '/healthz', '/healthz', { expect: [200] });

// Every protected operation without a token → 401.
for (const o of operations.filter((o) => !isPublic(o)))
  await check(o.method, o.template, fill(o.template), { expect: [401] });

// ---------------------------------------------------------------------------------------
// Authenticated GETs.

if (ADMIN_USER && ADMIN_PASSWORD) {
  const login = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: ADMIN_USER, password: ADMIN_PASSWORD }),
  });
  if (!login.ok) throw new Error(`login failed: ${login.status} ${await login.text()}`);
  const { accessToken } = await login.json();
  const cookie = login.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  const auth = { Authorization: `Bearer ${accessToken}` };

  const gets = operations.filter((o) => o.method === 'GET' && !isPublic(o));
  const lists = gets.filter((o) => !o.template.includes('{'));
  const bodies = new Map();
  for (const o of lists) bodies.set(o.template, await check('GET', o.template, o.template, { headers: auth, expect: [200, 404] }));

  // `/x/{id}` takes its id from `/x`; the page tree is flattened first; settings use `key`.
  const flatten = (nodes) => nodes.flatMap((n) => [n, ...flatten(n.children ?? [])]);
  const firstOf = (template) => {
    const parent = template.replace(/\/\{\w+\}$/, '');
    if (parent === '/api/v1/pages') return flatten(itemsOf(bodies.get('/api/v1/pages/tree')))[0];
    return itemsOf(bodies.get(parent))[0];
  };
  for (const o of gets.filter((o) => o.template.includes('{'))) {
    const item = firstOf(o.template);
    if (!item) {
      note(`GET ${o.template}`, o.template, 'no item in the parent list to derive an id from (not a failure of the spec)');
      continue;
    }
    await check('GET', o.template, fill(o.template, { ...PLACEHOLDER, ...item }), { headers: auth, expect: [200] });
    if (o.template.endsWith('{id}'))
      await check('GET', o.template, fill(o.template, { id: 2147483647 }), { headers: auth, expect: [404] });
  }

  // Binding failure on a typed query parameter.
  await check('GET', '/api/v1/press-releases', '/api/v1/press-releases?status=bogus', { headers: auth, expect: [400] });

  await fetch(`${BASE}/api/v1/auth/logout`, { method: 'POST', headers: { cookie } });
}

// ---------------------------------------------------------------------------------------

let failed = 0;
for (const r of results) {
  const skipped = r.status === '—';
  const ok = r.errors.length === 0;
  if (!ok && !skipped) failed++;
  console.log(`${skipped ? '·' : ok ? '✓' : '✗'} ${r.status} ${r.url}`);
  for (const e of r.errors) console.log(`    ${e}`);
  if (!ok && r.text) console.log(`    body: ${r.text.replace(/\s+/g, ' ')}`);
}

const checked = results.filter((r) => r.status !== '—');
const missed = operations.map((o) => `${o.method} ${o.template}`).filter((k) => !exercised.has(k));
console.log(`\n${BASE}: ${checked.length - failed}/${checked.length} checks passed, ${operations.length - missed.length}/${operations.length} operations exercised${ADMIN_USER ? '' : ' (no ADMIN_USER: auth + 401 paths only)'}.`);
if (missed.length) console.log(`Not exercised: ${missed.join(', ')}`);
process.exitCode = failed ? 1 : 0;
