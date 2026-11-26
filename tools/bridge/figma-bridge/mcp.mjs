// MCP front door: the same commands as cli.mjs, exposed as tools so Claude can
// query Figma itself instead of asking someone to click a button.
//
// Registered in the repo's .mcp.json. Hand-rolled JSON-RPC over stdio — the
// protocol is three methods wide and adding an SDK would mean the first
// `npm install` this directory has ever needed.
//
// Two rules that matter:
//   · stdout carries protocol frames ONLY. Diagnostics go to stderr.
//   · A big answer goes to a file and the tool returns the path. Pasting a
//     200 kB node dump into a context window helps nobody.

import path from 'node:path';
import { COMMANDS, byName, inputSchema, normalise } from './lib/commands.mjs';
import { HERE, call, ensureBridge, kb, slug } from './lib/rpc.mjs';
import { dump, healthReport, icons, saveAnswer } from './lib/tasks.mjs';

const NAME = 'figma-bridge';
const VERSION = '1.0.0';
const PROTOCOL = '2025-06-18';
const INLINE_LIMIT = 64 * 1024; // above this the answer is written to disk

const OUT_ARG = {
  type: 'string',
  description: 'Write the answer to this path (inside the repo) instead of returning it inline.',
};

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
const reply = (id, result) => send({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } });
const text = (body, isError) => ({ content: [{ type: 'text', text: body }], ...(isError ? { isError: true } : {}) });

const tools = COMMANDS.map((cmd) => ({
  name: `figma_${cmd.name}`,
  description: cmd.summary,
  inputSchema: inputSchema(cmd, cmd.where === 'plugin' && !cmd.args.out ? { out: OUT_ARG } : {}),
}));

/** What is in this answer, without printing the answer. */
function outline(json) {
  try {
    const data = JSON.parse(json);
    if (data && data.nodes) {
      return Object.entries(data.nodes)
        .map(([id, entry]) => `${id} — ${entry.document.name} (${entry.document.type})`)
        .join('\n');
    }
    if (!data || typeof data !== 'object') return '';
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? `${value.length} items` : typeof value}`)
      .join('\n');
  } catch {
    return '';
  }
}

async function runTool(name, raw) {
  const cmd = byName(String(name).replace(/^figma_/, ''));
  if (!cmd) throw new Error(`Unknown tool \`${name}\`.`);

  // Even `health` starts the bridge first: this process is its host, so "not
  // running" would only ever be a snapshot of the moment before we host it.
  await ensureBridge();
  if (cmd.name === 'health') return text(await healthReport());

  // `out` is ours, not the command's — read it before normalise drops it.
  const outFile = cmd.args.out ? null : raw && raw.out;
  const args = normalise(cmd, raw || {});

  if (cmd.name === 'dump' || cmd.name === 'icons') {
    const lines = [];
    const summary = await (cmd.name === 'dump' ? dump : icons)(args, (line) => lines.push(line));
    return text([...lines, '', JSON.stringify(summary)].join('\n'));
  }

  const answer = await call(cmd.name, args, { timeout: cmd.big ? 300_000 : 120_000 });
  const bytes = Buffer.byteLength(answer.text);

  if (outFile) {
    const saved = await saveAnswer(cmd, answer.text, outFile);
    const what = cmd.artifact ? '' : `\n\n${outline(answer.text)}`; // an SVG has no shape worth outlining
    return text(`Wrote ${path.relative(HERE, saved.file)} — ${kb(saved.bytes)} in ${answer.ms} ms.${what}`);
  }

  if (bytes > INLINE_LIMIT) {
    const stem = cmd.name + (args.id ? `-${slug(args.id)}` : args.page ? `-${slug(args.page)}` : '');
    const saved = await saveAnswer(cmd, answer.text, path.join(HERE, 'out', `${stem}.json`));
    return text(
      `Answer was ${kb(bytes)} — too large to return inline, so it is on disk:\n` +
        `${saved.file}\n\n${outline(answer.text)}\n\n` +
        `Read that file, or re-run with a smaller \`depth\`.`
    );
  }

  return text(answer.text);
}

async function handle(msg) {
  const { id, method, params } = msg;
  const isRequest = id !== undefined && id !== null;

  switch (method) {
    case 'initialize':
      // Host the bridge now rather than on the first tool call: a plugin window
      // already open in Figma then reconnects within a poll, so the first
      // command does not arrive before the other half is listening.
      ensureBridge().catch((err) => process.stderr.write(`figma-bridge: ${err.message}\n`));
      return reply(id, {
        protocolVersion: typeof params?.protocolVersion === 'string' ? params.protocolVersion : PROTOCOL,
        capabilities: { tools: {} },
        serverInfo: { name: NAME, version: VERSION },
        instructions:
          'Reads a Figma file live through a local plugin — no API token, no rate limit. ' +
          'The "CBAR Figma bridge" plugin must be open in Figma; `figma_health` says whether it is. ' +
          'Start with figma_ping / figma_pages / figma_find to locate a node id, then figma_node to dump it.',
      });

    case 'notifications/initialized':
    case 'notifications/cancelled':
      return; // notifications carry no id and get no answer

    case 'ping':
      return reply(id, {});

    case 'tools/list':
      return reply(id, { tools });

    case 'resources/list':
      return reply(id, { resources: [] });

    case 'prompts/list':
      return reply(id, { prompts: [] });

    case 'tools/call':
      try {
        return reply(id, await runTool(params?.name, params?.arguments));
      } catch (err) {
        // A failed tool is a result, not a protocol error — the model should see
        // the message and pick a different command.
        return reply(id, text(`Error: ${err.message}`, true));
      }

    default:
      if (isRequest) return fail(id, -32601, `Method not found: ${method}`);
  }
}

let buffer = '';
let pending = 0; // in-flight requests — stdin closing must not cut one short
let closing = false;

const settle = () => {
  if (closing && pending === 0) process.exit(0);
};

/** Not awaited by the reader: a slow `figma_dump` must not stall later frames. */
async function dispatch(msg) {
  pending++;
  try {
    await handle(msg);
  } catch (err) {
    process.stderr.write(`figma-bridge: ${err.stack || err.message}\n`);
    if (msg.id !== undefined && msg.id !== null) fail(msg.id, -32603, err.message);
  } finally {
    pending--;
    settle();
  }
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let cut;
  while ((cut = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, cut).trim();
    buffer = buffer.slice(cut + 1);
    if (!line) continue;
    try {
      dispatch(JSON.parse(line));
    } catch {
      process.stderr.write('figma-bridge: unparseable frame dropped\n');
    }
  }
});

process.stdin.on('end', () => {
  closing = true;
  settle();
});
