// Contract check: sends real requests to a running api-cbar and validates every
// response (status, content type, body) against the bundled spec in dist/openapi.json.
//
//   API_URL=https://api-cbar-test.cbar.az node scripts/contract-check.mjs
//
// The controllers return anonymous types, so nothing in the .NET build keeps the spec
// honest — this script is the only thing that does. Run it after changing either side.

import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const BASE = (process.env.API_URL ?? 'https://api-cbar-test.cbar.az').replace(/\/$/, '');
const spec = JSON.parse(await readFile(new URL('../dist/openapi.json', import.meta.url), 'utf8'));

// strict: false — the spec document itself (openapi, info, paths…) is not a JSON Schema,
// and OpenAPI allows keywords like `examples` on schemas that ajv's strict mode rejects.
const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);
ajv.addFormat('int16', { type: 'number', validate: (n) => Number.isInteger(n) && n >= -32768 && n <= 32767 });
ajv.addSchema(spec, 'spec');

const pointer = (...parts) => parts.map((p) => String(p).replace(/~/g, '~0').replace(/\//g, '~1')).join('/');

const results = [];
const exercised = new Set();

/**
 * Requests `url` and validates the response against the operation `template`.
 * Returns the parsed JSON body (or null) so later steps can pick ids/slugs from it.
 */
async function check(template, url, { expect, headers } = {}) {
  const opKey = `GET ${template}`;
  exercised.add(opKey);
  const errors = [];
  let body = null;
  let res;
  try {
    res = await fetch(BASE + url, { headers, redirect: 'manual' });
  } catch (err) {
    results.push({ opKey, url, status: 'ERR', errors: [String(err)] });
    return null;
  }

  const status = String(res.status);
  const op = spec.paths[template]?.get;
  // Shared responses are bundled as `$ref: '#/components/responses/X'`; follow it and keep
  // the pointer to wherever the response object actually lives, for the schema ref below.
  let responsePtr = pointer('paths', template, 'get', 'responses', status);
  let documented = op?.responses?.[status];
  if (documented?.$ref) {
    responsePtr = documented.$ref.replace(/^#\//, '');
    documented = responsePtr.split('/').reduce((o, k) => o?.[k.replace(/~1/g, '/').replace(/~0/g, '~')], spec);
  }
  if (!op) errors.push(`operation ${opKey} is not in the spec`);
  else if (!documented) errors.push(`status ${status} is not documented (documented: ${Object.keys(op.responses).join(', ')})`);
  if (expect && !expect.includes(res.status)) errors.push(`expected ${expect.join('|')}, got ${status}`);

  const text = await res.text();
  const contentType = (res.headers.get('content-type') ?? '').split(';')[0].trim();

  if (documented?.content) {
    const mediaTypes = Object.keys(documented.content);
    const media = mediaTypes.find((m) => m === contentType)
      ?? mediaTypes.find((m) => m === '*/*');
    if (!media) {
      errors.push(`content-type "${contentType}" not documented (documented: ${mediaTypes.join(', ')})`);
    } else if (/json/.test(media)) {
      try {
        body = JSON.parse(text);
      } catch {
        errors.push('body is not valid JSON');
      }
      if (body !== null && documented.content[media].schema) {
        const ref = `spec#/${responsePtr}/${pointer('content', media, 'schema')}`;
        const validate = ajv.getSchema(ref) ?? ajv.compile({ $ref: ref });
        if (!validate(body)) {
          for (const e of validate.errors.slice(0, 8))
            errors.push(`${e.instancePath || '(root)'} ${e.message}${e.params?.allowedValues ? ` ${JSON.stringify(e.params.allowedValues)}` : ''}`);
          if (validate.errors.length > 8) errors.push(`… ${validate.errors.length - 8} more`);
        }
      }
    }
  } else if (documented && text.length > 0 && res.status !== 304) {
    errors.push(`documented without a body, got ${text.length} bytes`);
  }

  // Headers the spec promises on this response.
  for (const [name, h] of Object.entries(documented?.headers ?? {})) {
    const value = res.headers.get(name);
    if (value === null) errors.push(`missing header ${name}`);
    else if (h.schema?.const && value !== h.schema.const) errors.push(`header ${name} = "${value}", expected "${h.schema.const}"`);
  }

  results.push({ opKey, url, status, errors, text: errors.length ? text.slice(0, 300) : undefined });
  return body ?? (contentType.startsWith('text/') || /xml/.test(contentType) ? text : null);
}

const first = (arr) => (Array.isArray(arr) && arr.length ? arr[0] : undefined);
const mediaIdFrom = (url) => (typeof url === 'string' ? url.match(/^\/media\/(\d+)$/)?.[1] : undefined);
const isoDaysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
const enc = encodeURIComponent;

// ---------------------------------------------------------------------------------------

for (const locale of ['az', 'en']) {
  const q = `locale=${locale}`;

  // Currencies
  const sheet = await check('/api/v1/currencies', `/api/v1/currencies?${q}`, { expect: [200, 404] });
  if (locale === 'az' && sheet?.date) {
    const [y, m, d] = sheet.date.split('-');
    const xml = await check('/currencies/{date}.xml', `/currencies/${d}.${m}.${y}.xml`, { expect: [200] });
    if (typeof xml === 'string' && !(xml.startsWith('<?xml') && xml.includes(`<ValCurs Date="${d}.${m}.${y}"`)))
      results.push({ opKey: 'GET /currencies/{date}.xml', url: 'structure', status: '200', errors: ['XML does not start with the declaration + <ValCurs Date=…>'] });
    await check('/api/v1/currencies', `/api/v1/currencies?date=1900-01-01&${q}`, { expect: [200] });
  }

  // Pages
  const tree = await check('/api/v1/pages/tree', `/api/v1/pages/tree?${q}`, { expect: [200] });
  const pageSlug = first(tree)?.slug;
  let pageMediaId;
  if (pageSlug) {
    const page = await check('/api/v1/pages/{slug}', `/api/v1/pages/${enc(pageSlug)}?${q}`, { expect: [200] });
    pageMediaId = first(page?.assets)?.mediaId;
  }

  // Press releases
  const press = await check('/api/v1/press-releases', `/api/v1/press-releases?${q}&pageSize=5`, { expect: [200] });
  if (first(press?.items)) await check('/api/v1/press-releases/{slug}', `/api/v1/press-releases/${enc(press.items[0].slug)}?${q}`, { expect: [200] });

  // Laws
  const laws = await check('/api/v1/laws', `/api/v1/laws?${q}&pageSize=5`, { expect: [200] });
  if (first(laws?.items)) await check('/api/v1/laws/{slug}', `/api/v1/laws/${enc(laws.items[0].slug)}?${q}`, { expect: [200] });
  await check('/api/v1/law-categories', `/api/v1/law-categories?${q}`, { expect: [200] });

  // Homepage
  const home = await check('/api/v1/homepage', `/api/v1/homepage?${q}`, { expect: [200] });

  // Meas
  await check('/api/v1/meas', `/api/v1/meas?${q}&pageSize=5`, { expect: [200] });
  await check('/api/v1/meas-emitents', `/api/v1/meas-emitents?${q}`, { expect: [200] });
  await check('/api/v1/meas-info-types', `/api/v1/meas-info-types?${q}`, { expect: [200] });

  // Money marks
  const marks = await check('/api/v1/money-marks', `/api/v1/money-marks?${q}`, { expect: [200] });
  if (first(marks)) await check('/api/v1/money-marks/{slug}', `/api/v1/money-marks/${enc(marks[0].slug)}?${q}`, { expect: [200] });
  await check('/api/v1/money-mark-categories', `/api/v1/money-mark-categories?${q}`, { expect: [200] });
  const news = await check('/api/v1/money-mark-news', `/api/v1/money-mark-news?${q}&pageSize=5`, { expect: [200] });
  if (first(news?.items)) await check('/api/v1/money-mark-news/{slug}', `/api/v1/money-mark-news/${enc(news.items[0].slug)}?${q}`, { expect: [200] });

  // Organization
  const staff = await check('/api/v1/organization/staff', `/api/v1/organization/staff?${q}`, { expect: [200] });
  if (first(staff)) await check('/api/v1/organization/staff/{id}', `/api/v1/organization/staff/${staff[0].id}?${q}`, { expect: [200] });
  await check('/api/v1/organization/divisions', `/api/v1/organization/divisions?${q}`, { expect: [200] });
  await check('/api/v1/organization/offices', `/api/v1/organization/offices?${q}`, { expect: [200] });

  // Galleries & videos
  const galleries = await check('/api/v1/galleries', `/api/v1/galleries?${q}&pageSize=5`, { expect: [200] });
  if (first(galleries?.items)) await check('/api/v1/galleries/{id}', `/api/v1/galleries/${galleries.items[0].id}?${q}`, { expect: [200] });
  await check('/api/v1/videos', `/api/v1/videos?${q}&pageSize=5`, { expect: [200] });
  await check('/api/v1/video-streams', `/api/v1/video-streams?${q}`, { expect: [200] });

  // Search
  await check('/api/v1/search', `/api/v1/search?q=bank&${q}`, { expect: [200] });

  // Media: once, from whatever content exposes an id.
  if (locale === 'az') {
    const mediaId = pageMediaId
      ?? mediaIdFrom(first(galleries?.items)?.coverUrl)
      ?? mediaIdFrom(first(home?.banners)?.imageUrl)
      ?? mediaIdFrom(first(home?.newsSlider)?.imageUrl);
    if (mediaId) {
      const res = await fetch(`${BASE}/media/${mediaId}`);
      const etag = res.headers.get('etag');
      await res.body?.cancel();
      await check('/media/{id}', `/media/${mediaId}`, { expect: [200] });
      if (etag) await check('/media/{id}', `/media/${mediaId}`, { expect: [304], headers: { 'If-None-Match': etag } });
    }
  }
}

// Locale-independent
await check('/api/v1/azir', `/api/v1/azir?from=${isoDaysAgo(365)}`, { expect: [200] });
await check('/api/v1/azir/summary', '/api/v1/azir/summary', { expect: [200] });
await check('/api/v1/inflation', `/api/v1/inflation?year=${new Date().getFullYear()}`, { expect: [200] });
await check('/api/v1/inflation/settings', '/api/v1/inflation/settings', { expect: [200, 404] });
const curve = await check('/api/v1/yield-curves/latest', '/api/v1/yield-curves/latest', { expect: [200, 404] });
if (curve?.curveDate) await check('/api/v1/yield-curves/{date}', `/api/v1/yield-curves/${curve.curveDate}`, { expect: [200] });
await check('/api/v1/site-settings/accessibility-widget', '/api/v1/site-settings/accessibility-widget', { expect: [200] });
await check('/healthz', '/healthz', { expect: [200] });

// Documented error paths
await check('/api/v1/pages/{slug}', '/api/v1/pages/__contract-check-missing__', { expect: [404] });
await check('/api/v1/laws/{slug}', '/api/v1/laws/__contract-check-missing__', { expect: [404] });
await check('/api/v1/organization/staff/{id}', '/api/v1/organization/staff/2147483647', { expect: [404] });
await check('/api/v1/yield-curves/{date}', '/api/v1/yield-curves/1900-01-01', { expect: [404] });
await check('/media/{id}', '/media/9223372036854775807', { expect: [404] });
await check('/currencies/{date}.xml', '/currencies/2020-01-01.xml', { expect: [400] });
await check('/currencies/{date}.xml', '/currencies/01.01.1900.xml', { expect: [404] });
await check('/api/v1/laws', '/api/v1/laws?page=abc', { expect: [400] });
const clamped = await check('/api/v1/laws', '/api/v1/laws?pageSize=500&page=0', { expect: [200] });
if (clamped && (clamped.pageSize !== 100 || clamped.page !== 1))
  results.push({ opKey: 'GET /api/v1/laws', url: 'clamping', status: '200', errors: [`expected page=1,pageSize=100 after clamping, got ${clamped.page},${clamped.pageSize}`] });
const empty = await check('/api/v1/search', '/api/v1/search?q=%20', { expect: [200] });
if (empty && empty.results?.length !== 0)
  results.push({ opKey: 'GET /api/v1/search', url: 'blank q', status: '200', errors: ['blank q should return no results'] });

// ---------------------------------------------------------------------------------------

let failed = 0;
for (const r of results) {
  const ok = r.errors.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? '✓' : '✗'} ${r.status} ${r.url}`);
  for (const e of r.errors) console.log(`    ${e}`);
  if (!ok && r.text) console.log(`    body: ${r.text.replace(/\s+/g, ' ')}`);
}

const allOps = Object.entries(spec.paths).flatMap(([p, item]) => Object.keys(item).filter((m) => m === 'get').map((m) => `GET ${p}`));
const missed = allOps.filter((k) => !exercised.has(k));

console.log(`\n${BASE}: ${results.length - failed}/${results.length} checks passed, ${allOps.length - missed.length}/${allOps.length} operations exercised.`);
if (missed.length) console.log(`Not exercised (no data to derive a request from): ${missed.join(', ')}`);
process.exitCode = failed ? 1 : 0;
