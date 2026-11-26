#!/usr/bin/env node
// Permission inventory for api-cbar-admin (spec 008, SC-001): lists every controller action
// with the permission(s) it requires and fails when an action behind [Authorize] names none.
// Static — reads the C# source, so it needs no .NET SDK and no running API. Route extraction
// is shared with route-diff.mjs and the spec-first hook (.claude/skills/sync-openapi/scripts/routes.mjs).
//
// Usage: node scripts/permission-inventory.mjs [--json]
// Exit 1 when any protected action is unbound.

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { routesFromSource } from '../../../.claude/skills/sync-openapi/scripts/routes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const controllers = path.join(here, '..', 'src', 'Cbar.AdminApi', 'Controllers');
const json = process.argv.includes('--json');

// `Permissions.Pages.Read` → `pages.read`; the codes are generated with the same rule.
const snake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const codeOf = (expr) => {
  const m = expr.trim().match(/^Permissions\.(\w+)\.(\w+)$/);
  return m ? `${snake(m[1])}.${snake(m[2])}` : `?${expr.trim()}`;
};

// The contiguous block of attribute lines around `line` (which may itself be one): an action's
// [RequirePermission] can sit above or below its [HttpX].
function attributeBlock(lines, line) {
  const isAttr = (i) => i >= 0 && i < lines.length && lines[i].replace(/\/\/.*$/, '').trim().startsWith('[');
  let top = line;
  while (isAttr(top - 1)) top--;
  let bottom = line;
  while (isAttr(bottom + 1)) bottom++;
  return lines.slice(top, bottom + 1).map((l) => l.replace(/\/\/.*$/, '').trim()).join(' ');
}

function parse(attrs) {
  const perm = attrs.match(/\[RequirePermission\(([^\]]*)\)\]/);
  return {
    permissions: perm ? perm[1].split(',').map(codeOf) : null,
    anyAuthenticated: /\[AnyAuthenticatedUser\]/.test(attrs),
    allowAnonymous: /\[AllowAnonymous\]/.test(attrs),
    authorize: /\[(Authorize|RequirePermission|AnyAuthenticatedUser)\b/.test(attrs),
  };
}

const rows = [];
for (const file of (await readdir(controllers)).filter((f) => f.endsWith('.cs')).sort()) {
  const source = await readFile(path.join(controllers, file), 'utf8');
  const lines = source.split(/\r?\n/);
  // Class attribute block for every class line, so an action finds its own controller's.
  const classes = [];
  lines.forEach((l, i) => { if (/\bclass\s+\w+.*Controller/.test(l.replace(/\/\/.*$/, ''))) classes.push(i); });

  const { ops } = routesFromSource(source);
  for (const [op, line] of ops) {
    const action = parse(attributeBlock(lines, line));
    const classLine = classes.findLast((c) => c < line);
    // The class's attributes end on the line above its declaration.
    const cls = classLine === undefined || classLine === 0 ? parse('') : parse(attributeBlock(lines, classLine - 1));

    const required = [cls.permissions, action.permissions].filter(Boolean);
    const open = action.anyAuthenticated || cls.anyAuthenticated;
    const anonymous = action.allowAnonymous || cls.allowAnonymous || !(action.authorize || cls.authorize);
    let status = 'UNBOUND';
    if (required.length) status = 'bound';
    else if (open) status = 'authenticated';
    else if (anonymous) status = 'anonymous';
    rows.push({ op, file, status, permissions: required.map((anyOf) => anyOf.join(' | ')) });
  }
}

const unbound = rows.filter((r) => r.status === 'UNBOUND');
const unknown = rows.filter((r) => r.permissions.some((p) => p.includes('?')));

if (json) {
  console.log(JSON.stringify({ rows, unbound: unbound.length, unparsed: unknown.length }, null, 2));
} else {
  const width = Math.max(...rows.map((r) => r.op.length));
  for (const r of rows)
    console.log(`${r.op.padEnd(width)}  ${r.status === 'bound' ? r.permissions.join(' + ') : r.status}`);
  console.log(`\n${rows.length} actions, ${unbound.length} unbound actions, ${unknown.length} unparsed permission expressions`);
}
process.exit(unbound.length || unknown.length ? 1 : 0);
