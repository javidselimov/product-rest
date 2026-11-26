// Static route diff: reads the controllers' [Route]/[HttpX] attributes straight from the
// C# source and compares the resulting `METHOD path` list with the bundled spec
// (openapi/dist/openapi.json). Needs no .NET SDK and no running API, so it reflects the
// *local* code — unlike `npm run drift`, which sees whatever is deployed to test.
//
//   node .claude/skills/sync-openapi/scripts/route-diff.mjs [api-cbar|api-cbar-admin|all]
//
// Run `npm run bundle` in the API's openapi/ folder first. Exit code 1 on any difference.

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, APIS, NON_MVC, routesFromSource, specOps as readSpecOps } from './routes.mjs';

const arg = process.argv[2] ?? 'all';
const targets = arg === 'all' ? Object.keys(APIS) : [arg];
if (targets.some((t) => !APIS[t])) {
  console.error(`unknown API "${arg}" — expected one of: ${Object.keys(APIS).join(', ')}, all`);
  process.exit(2);
}

async function routesOf(api) {
  const dir = join(ROOT, 'product-rest', api, 'src', APIS[api], 'Controllers');
  const ops = new Map();
  const warnings = [];
  for (const name of (await readdir(dir)).filter((f) => f.endsWith('.cs')).sort()) {
    const file = join(dir, name);
    const where = (i) => `${relative(ROOT, file).replace(/\\/g, '/')}:${i + 1}`;
    const parsed = routesFromSource(await readFile(file, 'utf8'));
    for (const [op, i] of parsed.ops) ops.set(op, where(i));
    for (const i of parsed.warnings) warnings.push(`${where(i)}: action-level [Route] not handled — check by hand`);
  }
  return { ops, warnings };
}

let differences = 0;
for (const api of targets) {
  const bundle = join(ROOT, 'product-rest', api, 'openapi', 'dist', 'openapi.json');
  if (!existsSync(bundle)) {
    console.error(`${api}: ${relative(ROOT, bundle)} missing — run \`npm run bundle\` in product-rest/${api}/openapi first`);
    process.exitCode = 2;
    continue;
  }
  const specOps = await readSpecOps(bundle);
  const { ops: codeOps, warnings } = await routesOf(api);

  const onlyCode = [...codeOps.keys()].filter((o) => !specOps.has(o)).sort();
  const onlySpec = [...specOps].filter((o) => !codeOps.has(o) && !NON_MVC.has(o)).sort();

  console.log(`\n== ${api}: code ${codeOps.size} ops, spec ${specOps.size} ops`);
  for (const o of onlyCode) console.log(`+ in code, missing from spec: ${o.padEnd(55)} ${codeOps.get(o)}`);
  for (const o of onlySpec) console.log(`- in spec, not in code:       ${o}`);
  for (const w of warnings) console.log(`! ${w}`);
  if (!onlyCode.length && !onlySpec.length) console.log('no differences');
  differences += onlyCode.length + onlySpec.length;
}
if (differences) process.exitCode = 1;
