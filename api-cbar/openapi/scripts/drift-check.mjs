// Drift check: compares the operations in this spec with the ones the running API
// reports in its generated /openapi/v1.json. The generated document has no response
// schemas, but its path + method list is exact — so a new or removed endpoint that the
// spec does not reflect shows up here.
//
//   API_URL=https://api-cbar-test.cbar.az node scripts/drift-check.mjs

import { readFile } from 'node:fs/promises';

const BASE = (process.env.API_URL ?? 'https://api-cbar-test.cbar.az').replace(/\/$/, '');

// Endpoints mapped outside MVC (Program.cs), which the generated document never lists.
const NOT_IN_GENERATED = new Set(['GET /healthz']);

const METHODS = ['get', 'put', 'post', 'delete', 'patch', 'head', 'options'];
const ops = (doc) =>
  new Set(Object.entries(doc.paths ?? {}).flatMap(([p, item]) =>
    METHODS.filter((m) => item[m]).map((m) => `${m.toUpperCase()} ${p}`)));

const spec = JSON.parse(await readFile(new URL('../dist/openapi.json', import.meta.url), 'utf8'));

const res = await fetch(`${BASE}/openapi/v1.json`);
if (!res.ok) throw new Error(`${BASE}/openapi/v1.json → ${res.status}`);
const generated = await res.json();

const mine = ops(spec);
const theirs = ops(generated);
const onlyApi = [...theirs].filter((o) => !mine.has(o));
const onlySpec = [...mine].filter((o) => !theirs.has(o) && !NOT_IN_GENERATED.has(o));

for (const o of onlyApi) console.log(`+ in API, missing from spec: ${o}`);
for (const o of onlySpec) console.log(`- in spec, not in API:       ${o}`);
console.log(`${BASE}: spec ${mine.size} ops, API ${theirs.size} ops, ${onlyApi.length + onlySpec.length} differences.`);
process.exitCode = onlyApi.length + onlySpec.length ? 1 : 0;
