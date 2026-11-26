// PreToolUse hook (Edit|Write|MultiEdit): spec-first for the two .NET APIs.
//
// For a controller in product-rest/{api-cbar,api-cbar-admin}/src/*/Controllers/*.cs it applies
// the proposed edit in memory, diffs the `METHOD path` operations before and after, and denies
// the edit if an added operation is not yet in openapi/dist/openapi.json, or a removed one is
// still there. Edits that leave the route set alone pass with a reminder about response shapes.
// The bundle is rebuilt first when any openapi/ source is newer than it.
//
// Exit 0 with JSON on stdout in all decided cases; any crash exits 1 (non-blocking error).

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, NON_MVC, routesFromSource, specOps } from '../skills/sync-openapi/scripts/routes.mjs';

const CONTROLLER = /\/product-rest\/(api-cbar|api-cbar-admin)\/src\/[^/]+\/Controllers\/[^/]+\.cs$/i;

const input = JSON.parse(readFileSync(0, 'utf8'));
const tool = input.tool_name;
const args = input.tool_input ?? {};
const filePath = String(args.file_path ?? '').replace(/\\/g, '/');
const match = filePath.match(CONTROLLER);
if (!match) process.exit(0);
const api = match[1];

const lf = (s) => String(s ?? '').replace(/\r\n/g, '\n');
const before = existsSync(args.file_path) ? lf(readFileSync(args.file_path, 'utf8')) : '';

function applyEdit(text, { old_string, new_string, replace_all }) {
  const from = lf(old_string);
  const to = lf(new_string);
  if (!from) return to; // Edit with empty old_string creates the file
  if (!text.includes(from)) return null; // the tool itself will reject it
  if (replace_all) return text.split(from).join(to);
  const at = text.indexOf(from);
  return text.slice(0, at) + to + text.slice(at + from.length);
}

let after;
if (tool === 'Write') after = lf(args.content);
else if (tool === 'Edit') after = applyEdit(before, args);
else if (tool === 'MultiEdit') {
  after = before;
  for (const e of args.edits ?? []) {
    after = applyEdit(after, e);
    if (after == null) break;
  }
} else process.exit(0);
if (after == null) process.exit(0);

const was = routesFromSource(before).ops;
const now = routesFromSource(after).ops;
const added = [...now.keys()].filter((o) => !was.has(o) && !NON_MVC.has(o)).sort();
const removed = [...was.keys()].filter((o) => !now.has(o) && !NON_MVC.has(o)).sort();

const specDir = join(ROOT, 'product-rest', api, 'openapi');
const specRel = `product-rest/${api}/openapi`;
const bundle = join(specDir, 'dist', 'openapi.json');

const respond = (out) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', ...out } }));
  process.exit(0);
};
const deny = (reason) => respond({ permissionDecision: 'deny', permissionDecisionReason: reason });

if (!added.length && !removed.length) {
  respond({
    additionalContext:
      `spec-first: this edit leaves the ${api} route set unchanged. If it changes a request body, ` +
      `response shape, status code or query parameter, ${specRel}/ must be updated too ` +
      '(spec first, then code — see the /api-endpoint skill).',
  });
}

// Newest mtime among the spec sources (openapi.yaml, paths/, components/).
function newestSource(dir) {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir === specDir && !['paths', 'components'].includes(entry.name)) continue;
      newest = Math.max(newest, newestSource(p));
    } else if (/\.ya?ml$/.test(entry.name) && (dir !== specDir || entry.name === 'openapi.yaml')) {
      newest = Math.max(newest, statSync(p).mtimeMs);
    }
  }
  return newest;
}

if (!existsSync(bundle) || statSync(bundle).mtimeMs < newestSource(specDir)) {
  if (!existsSync(join(specDir, 'node_modules'))) {
    deny(`spec-first: ${specRel}/dist/openapi.json is missing or stale and node_modules is not installed. ` +
      `Run \`npm ci && npm run bundle\` in ${specRel}, then retry the controller edit.`);
  }
  try {
    execSync('npm run bundle --silent', { cwd: specDir, stdio: 'pipe', timeout: 60_000 });
  } catch (e) {
    deny(`spec-first: \`npm run bundle\` failed in ${specRel} — fix the spec first ` +
      `(\`npm run lint\` shows where).\n${String(e.stderr ?? e.message).slice(0, 1500)}`);
  }
}

const inSpec = await specOps(bundle);
const missing = added.filter((o) => !inSpec.has(o));
const lingering = removed.filter((o) => inSpec.has(o));

if (missing.length || lingering.length) {
  const lines = [
    `spec-first: the ${api} OpenAPI spec must change before the controller.`,
    ...missing.map((o) => `  + ${o} — not in the spec`),
    ...lingering.map((o) => `  - ${o} — removed from code but still in the spec`),
    '',
    `1. Update ${specRel}/ first: paths/<resource>.yaml, components/schemas/*, and the path map in openapi.yaml ` +
      `(conventions in ${specRel}/README.md; the /api-endpoint skill walks through it).`,
    `2. Run \`npm run lint\` and \`npm run bundle\` in ${specRel}.`,
    '3. Then retry this controller edit.',
  ];
  deny(lines.join('\n'));
}

respond({
  additionalContext:
    `spec-first: route changes (${[...added.map((o) => '+' + o), ...removed.map((o) => '-' + o)].join(', ')}) ` +
    `match ${specRel}. After the controller is done, check that request/response shapes match the spec and run ` +
    `\`node .claude/skills/sync-openapi/scripts/route-diff.mjs ${api}\`.`,
});
