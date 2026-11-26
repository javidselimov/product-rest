// Drift check against the running API's generated /openapi/v1.json:
//   1. operations — every `METHOD path` on one side must exist on the other;
//   2. request bodies — the generated document does have request schemas (the DTOs are
//      records), so the set of field paths in each JSON request body must match.
// Types and `required` are not compared: the generator marks every constructor parameter
// required, nullable ones included, so its `required` lists are not the real contract.
//
//   API_URL=https://api-cbar-admin-test.cbar.az node scripts/drift-check.mjs

import { readFile } from 'node:fs/promises';

const BASE = (process.env.API_URL ?? 'https://api-cbar-admin-test.cbar.az').replace(/\/$/, '');

// Endpoints mapped outside MVC (Program.cs), which the generated document never lists.
const NOT_IN_GENERATED = new Set(['GET /healthz']);

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'];
const opsOf = (doc) =>
  new Map(Object.entries(doc.paths ?? {}).flatMap(([p, item]) =>
    METHODS.filter((m) => item[m]).map((m) => [`${m.toUpperCase()} ${p}`, item[m]])));

const resolve = (doc, node) => {
  while (node?.$ref) node = node.$ref.replace(/^#\//, '').split('/').reduce((o, k) => o?.[k], doc);
  return node;
};

// Field paths of a schema: `translations.*.title`, `points[].tenor`, … (3 levels deep).
function fieldPaths(doc, schema, prefix = '', depth = 0, out = new Set()) {
  schema = resolve(doc, schema);
  if (!schema || depth > 3) return out;
  for (const part of [...(schema.allOf ?? []), ...(schema.anyOf ?? []), ...(schema.oneOf ?? [])])
    fieldPaths(doc, part, prefix, depth, out);
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    const p = prefix ? `${prefix}.${name}` : name;
    out.add(p);
    fieldPaths(doc, prop, p, depth + 1, out);
  }
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object')
    fieldPaths(doc, schema.additionalProperties, `${prefix}.*`, depth + 1, out);
  if (schema.items) fieldPaths(doc, schema.items, `${prefix}[]`, depth + 1, out);
  return out;
}

const jsonBody = (doc, op) => {
  const content = resolve(doc, op.requestBody)?.content ?? {};
  const key = Object.keys(content).find((k) => /json/.test(k));
  return key ? content[key].schema : undefined;
};

const spec = JSON.parse(await readFile(new URL('../dist/openapi.json', import.meta.url), 'utf8'));
const res = await fetch(`${BASE}/openapi/v1.json`);
if (!res.ok) throw new Error(`${BASE}/openapi/v1.json → ${res.status}`);
const generated = await res.json();

const mine = opsOf(spec);
const theirs = opsOf(generated);
const problems = [];

for (const o of theirs.keys()) if (!mine.has(o)) problems.push(`+ in API, missing from spec: ${o}`);
for (const o of mine.keys())
  if (!theirs.has(o) && !NOT_IN_GENERATED.has(o)) problems.push(`- in spec, not in API:       ${o}`);

let bodies = 0;
for (const [o, op] of theirs) {
  if (!mine.has(o)) continue;
  const g = jsonBody(generated, op);
  const s = jsonBody(spec, mine.get(o));
  if (!g && !s) continue;
  bodies++;
  if (!g || !s) {
    problems.push(`~ ${o}: JSON request body ${g ? 'missing from spec' : 'not in API'}`);
    continue;
  }
  const gp = fieldPaths(generated, g);
  const sp = fieldPaths(spec, s);
  const onlyApi = [...gp].filter((p) => !sp.has(p));
  const onlySpec = [...sp].filter((p) => !gp.has(p));
  if (onlyApi.length || onlySpec.length)
    problems.push(`~ ${o}: body fields${onlyApi.length ? ` missing from spec [${onlyApi}]` : ''}${onlySpec.length ? ` not in API [${onlySpec}]` : ''}`);
}

for (const p of problems) console.log(p);
console.log(`${BASE}: spec ${mine.size} ops, API ${theirs.size} ops, ${bodies} request bodies compared, ${problems.length} differences.`);
process.exitCode = problems.length ? 1 : 0;
