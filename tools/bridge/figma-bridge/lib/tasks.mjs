// The work that is neither protocol nor argument parsing: saving an answer, and
// the two composite commands that are several plugin calls in a trench coat.
//
// Both front doors use these — `cli.mjs` prints the lines, `mcp.mjs` collects
// them into a tool result — so `dump` behaves identically whether a human or a
// model asked for it. Nothing here writes to the console itself.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { call, callJSON, health, kb, slug, writeOut } from './rpc.mjs';

/**
 * Writes an answer to `outFile`. Artifact commands (`svg`, `png`) write the
 * thing itself when the extension asks for it, the JSON envelope otherwise.
 * @returns {Promise<{file: string, bytes: number}>}
 */
export async function saveAnswer(cmd, text, outFile) {
  const lower = outFile.toLowerCase();

  if (cmd.artifact === 'svg' && lower.endsWith('.svg')) {
    const { svg } = JSON.parse(text);
    return { file: await writeOut(outFile, svg), bytes: Buffer.byteLength(svg) };
  }
  if (cmd.artifact === 'png' && lower.endsWith('.png')) {
    const buf = Buffer.from(JSON.parse(text).base64, 'base64');
    return { file: await writeOut(outFile, buf), bytes: buf.length };
  }

  return { file: await writeOut(outFile, text), bytes: Buffer.byteLength(text) };
}

/** `foo` is a substring match; `/foo/i` is a regular expression. */
function matcher(pattern) {
  if (!pattern) return () => true;
  const re = /^\/(.*)\/([a-z]*)$/.exec(pattern);
  if (re) {
    const rx = new RegExp(re[1], re[2]);
    return (name) => rx.test(name);
  }
  const needle = pattern.toLowerCase();
  return (name) => name.toLowerCase().includes(needle);
}

/**
 * variables.json + styles.json + index.json + sets.json + one <slug>-set.json
 * per component set. This is the command that replaces a day of clicking.
 */
export async function dump(args, log) {
  const dir = args.out;
  let files = 0;
  let total = 0;

  const save = async (name, text) => {
    const file = await writeOut(path.join(dir, name), text);
    const bytes = Buffer.byteLength(text);
    files++;
    total += bytes;
    log(`✓ ${path.relative(process.cwd(), file) || file} — ${kb(bytes)}`);
  };

  const { data: ping } = await callJSON('ping');
  log(`${ping.file} · ${args.page === '*' ? 'whole document' : args.page || ping.page.name}`);

  await save('variables.json', (await call('variables', {}, { timeout: 300_000 })).text);
  await save('styles.json', (await call('styles')).text);
  if (args.page !== '*') await save('index.json', (await call('index', { page: args.page })).text);

  const setsText = (await call('sets', { page: args.page }, { timeout: 300_000 })).text;
  await save('sets.json', setsText);

  const { sets } = JSON.parse(setsText);
  log(`${sets.length} component set${sets.length === 1 ? '' : 's'} at depth ${args.depth}`);

  const seen = new Set();
  for (const set of sets) {
    let name = slug(set.name);
    while (seen.has(name)) name += '-2'; // two pages may hold sets with one name
    seen.add(name);
    const { text } = await call('node', { id: set.id, depth: args.depth }, { timeout: 300_000 });
    await save(`${name}-set.json`, text);
  }

  log(`${files} files, ${kb(total)} → ${path.resolve(dir)}`);
  return { files, bytes: total, dir: path.resolve(dir) };
}

/**
 * One .svg per icon, named the way `gen-icons.js` expects. With `--map` the
 * names come from an icon-map.json ({ "Outline/General/Calendar": {id, kit} });
 * without one, every component on the page is exported under its own name.
 */
export async function icons(args, log) {
  const targets = [];

  if (args.map) {
    const map = JSON.parse(await readFile(path.resolve(args.map), 'utf8'));
    for (const [figmaName, entry] of Object.entries(map)) {
      if (!entry || !entry.id) continue;
      // `?` shows up in icon-map.json wherever the kit mapping was still a guess.
      const stem = String(entry.kit || figmaName).replace(/[^A-Za-z0-9._-]/g, '_');
      targets.push({ id: entry.id, stem });
    }
  } else {
    const match = matcher(args.match);
    const { data } = await callJSON('components', { page: args.page }, { timeout: 300_000 });
    for (const component of data.components) {
      if (match(component.name)) {
        targets.push({ id: component.id, stem: component.name.replace(/[^A-Za-z0-9._-]/g, '_') });
      }
    }
  }

  if (!targets.length) throw new Error('Nothing matched — check --page/--match, or pass --map.');
  log(`${targets.length} icons → ${path.resolve(args.out)}`);

  const failures = [];
  for (const target of targets) {
    try {
      const { svg } = JSON.parse((await call('svg', { id: target.id })).text);
      const file = await writeOut(path.join(args.out, `${target.stem}.svg`), svg);
      log(`✓ ${path.relative(process.cwd(), file) || file} — ${kb(Buffer.byteLength(svg))}`);
    } catch (err) {
      failures.push(`✗ ${target.stem} (${target.id}): ${err.message}`);
    }
  }
  failures.forEach(log);
  if (failures.length) log(`${failures.length} of ${targets.length} failed.`);
  return { written: targets.length - failures.length, failed: failures.length };
}

/** Plain-text state of the bridge — the first thing to check when nothing works. */
export async function healthReport() {
  const state = await health(2000);
  if (!state) return 'bridge:  not running — start it with `node tools/figma-bridge/bridge.mjs`';
  return [
    `bridge:  up on 127.0.0.1:${state.port}`,
    `plugin:  ${
      state.plugin.connected ? 'connected' : 'NOT connected — open "CBAR Figma bridge" in Figma (Plugins → Development)'
    }${state.plugin.file ? ` · ${state.plugin.file} · ${state.plugin.page}` : ''}`,
    `queued:  ${state.queued} waiting, ${state.inflight} in flight`,
  ].join('\n');
}
