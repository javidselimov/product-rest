// Shared by route-diff.mjs and the spec-first hook (.claude/hooks/spec-first.mjs):
// extracts `METHOD path` operations from controller source and from the bundled spec.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const APIS = {
  'api-cbar': 'Cbar.WebApi',
  'api-cbar-admin': 'Cbar.AdminApi',
};
// Mapped in Program.cs, outside MVC.
export const NON_MVC = new Set(['GET /healthz']);
const METHODS = ['get', 'put', 'post', 'delete', 'patch'];

// `{id:int}` → `{id}`, `{slug?}` → `{slug}`; leading `/` and `~/` dropped.
export const normalise = (tpl) =>
  '/' + tpl.replace(/^~?\//, '').replace(/\{([^}:?=]+)[^}]*\}/g, '{$1}').replace(/\/$/, '');

const join2 = (prefix, tpl) => {
  if (tpl == null) return prefix ?? '';
  if (/^~?\//.test(tpl) || !prefix) return tpl;
  return tpl ? `${prefix}/${tpl}` : prefix;
};

// Operations declared in one controller file. `ops` maps `METHOD path` → 0-based line;
// `warnings` holds the 0-based lines of action-level [Route]s, which are not handled.
export function routesFromSource(source) {
  const ops = new Map();
  const warnings = [];
  // A file may hold several controllers; a [Route] belongs to whichever comes next —
  // a class declaration (prefix) or an action (not handled, flagged instead).
  let prefix = null;
  let inClass = false;
  let pending = null;
  source.split(/\r?\n/).forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '');
    const route = code.match(/\[\s*Route\(\s*"([^"]*)"\s*\)/);
    if (route) pending = { tpl: route[1], line: i };
    const cls = code.match(/\bclass\s+(\w+)/);
    if (cls) {
      inClass = true;
      prefix = pending?.tpl.replace('[controller]', cls[1].replace(/Controller$/, '').toLowerCase()) ?? null;
      pending = null;
    }
    for (const m of code.matchAll(/\bHttp(Get|Post|Put|Delete|Patch)(?:Attribute)?\b(?:\(\s*"([^"]*)"[^)]*\))?/g)) {
      if (!inClass) continue;
      if (pending) {
        warnings.push(pending.line);
        pending = null;
      }
      ops.set(`${m[1].toUpperCase()} ${normalise(join2(prefix, m[2] ?? null))}`, i);
    }
  });
  return { ops, warnings };
}

export async function specOps(bundlePath) {
  const spec = JSON.parse(await readFile(bundlePath, 'utf8'));
  return new Set(Object.entries(spec.paths ?? {}).flatMap(([p, item]) =>
    METHODS.filter((m) => item[m]).map((m) => `${m.toUpperCase()} ${p}`)));
}
