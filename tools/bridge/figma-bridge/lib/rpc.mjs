// Thin client for bridge.mjs, shared by cli.mjs and mcp.mjs.
//
// `call()` returns the answer as **text**, not as a parsed object: most answers
// go straight to a file, and parsing a 20 MB dump only to re-stringify it is
// pure waste. Parse it yourself when you actually need to look inside.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PORT = Number(process.env.FIGMA_BRIDGE_PORT) || 7332;
export const HERE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const REPO = path.resolve(HERE, '..', '..');

const BASE = `http://127.0.0.1:${PORT}`;

/** Both an error and the reason, so callers do not have to guess at a string. */
export class BridgeError extends Error {
  constructor(message, kind) {
    super(message);
    this.kind = kind; // 'offline' | 'no-plugin' | 'timeout' | 'plugin' | 'bad'
  }
}

export async function health(timeout = 1500) {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(timeout) });
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Uses the bridge already on the port, or hosts one right here.
 *
 * In-process rather than a detached child on purpose: a long-lived host (the
 * MCP server) then owns the bridge's lifetime, there is no orphan left behind
 * when it exits, and Windows is spared the libuv abort that `spawn(detached)`
 * followed by a quick exit triggers. `log` matters — the MCP server's stdout is
 * a protocol channel, so bridge chatter has to go to stderr.
 */
export async function ensureBridge({ log } = {}) {
  const running = await health();
  if (running) return running;

  const { startBridge } = await import('../bridge.mjs');
  try {
    await startBridge({ log: log || ((line) => process.stderr.write(`${line}\n`)) });
  } catch (err) {
    // Lost a race with another host — fine, as long as something is listening.
    const late = await health();
    if (!late) throw new BridgeError(`Could not start the bridge on port ${PORT}: ${err.message}`, 'offline');
    return late;
  }
  return (await health()) || { ok: true, port: PORT, plugin: { connected: false }, queued: 0, inflight: 0 };
}

/**
 * @returns {Promise<{text: string, ms: number}>}
 */
export async function call(cmd, args = {}, { timeout = 120_000 } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd, args, timeout }),
      signal: AbortSignal.timeout(timeout + 10_000),
    });
  } catch (err) {
    throw new BridgeError(
      `No bridge on ${BASE} — start it with \`node tools/figma-bridge/bridge.mjs\`. (${err.message})`,
      'offline'
    );
  }

  const text = await res.text();
  if (res.ok) return { text, ms: Number(res.headers.get('X-Figma-Ms')) || 0 };

  let message = text;
  try {
    message = JSON.parse(text).error || text;
  } catch {
    /* the body was not JSON — show it raw */
  }
  const kind = res.status === 503 ? 'no-plugin' : res.status === 504 ? 'timeout' : res.status === 500 ? 'plugin' : 'bad';
  throw new BridgeError(message, kind);
}

/** `call()` plus JSON.parse, for the commands whose answers are small. */
export async function callJSON(cmd, args = {}, opts) {
  const { text, ms } = await call(cmd, args, opts);
  return { data: JSON.parse(text), ms };
}

/**
 * Writes `data` (string or Buffer) to `file`, creating parent directories.
 * Refuses to leave the repo — the MCP server takes this path from a model.
 */
export async function writeOut(file, data) {
  const target = path.resolve(file);
  if (target !== REPO && !target.startsWith(REPO + path.sep)) {
    throw new BridgeError(`Refusing to write outside the repo: ${target}`, 'bad');
  }
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, data);
  return target;
}

export const kb = (n) => (n < 1024 ? `${n} B` : `${(n / 1024).toFixed(n < 1024 * 100 ? 1 : 0)} kB`);

/** Filesystem-safe stem for a Figma node name. */
export const slug = (name) =>
  String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'node';
