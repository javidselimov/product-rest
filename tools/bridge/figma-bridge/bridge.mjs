// The hub. Figma plugins can only talk outwards, so the plugin *pulls* work from
// here (long-poll) and posts the answer back; `cli.mjs` and `mcp.mjs` push work
// in and block until that answer arrives. Nothing here touches the filesystem or
// the network beyond loopback.
//
//   node bridge.mjs        (leave it running while you work in Figma)
//
// | endpoint       | caller | does                                              |
// | -------------- | ------ | ------------------------------------------------- |
// | GET  /pull     | plugin | hands over one job, or holds 25 s and answers 204 |
// | POST /result   | plugin | one chunk of an answer; the last one closes it    |
// | POST /rpc      | client | enqueue a command, wait for the answer            |
// | GET  /health   | client | is the plugin there, what is queued               |

import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';

export const PORT = Number(process.env.FIGMA_BRIDGE_PORT) || 7332;

const HOLD = 25_000; // how long a poll waits before answering 204
const STALE = 45_000; // no poll for this long → the plugin is gone
const RPC_TIMEOUT = 120_000;
const LIMIT = 256 * 1024 * 1024; // an 8-deep page dump is tens of MB

const queue = []; // jobs waiting for a poll
const waiters = []; // polls waiting for a job
const inflight = new Map(); // job id → the client response held open for it
const plugin = { lastSeen: 0, file: null, page: null, seen: false };
let seq = 0;

// `mcp.mjs` hosts this in its own process, where stdout carries JSON-RPC frames
// and a stray console.log would corrupt the protocol. So every line goes through
// a sink the host chooses.
let log = (line) => console.log(line);

const cors = {
  'Access-Control-Allow-Origin': '*', // the plugin iframe's origin is `null`
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const json = (res, code, obj) =>
  res.writeHead(code, { ...cors, 'Content-Type': 'application/json' }).end(JSON.stringify(obj));

const connected = () => Date.now() - plugin.lastSeen < STALE;

const health = () => ({
  ok: true,
  port: PORT,
  plugin: {
    connected: connected(),
    lastSeen: plugin.lastSeen || null,
    idleMs: plugin.lastSeen ? Date.now() - plugin.lastSeen : null,
    file: plugin.file,
    page: plugin.page,
  },
  queued: queue.length,
  inflight: inflight.size,
});

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > LIMIT) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/** Sends a job down a held-open poll. */
function handOff(res, job) {
  job.sentAt = Date.now();
  json(res, 200, { id: job.id, cmd: job.cmd, args: job.args });
}

function dropWaiter(waiter) {
  const i = waiters.indexOf(waiter);
  if (i >= 0) waiters.splice(i, 1);
}

/** Closes out a client request, whether it succeeded, failed or timed out. */
function finish(id, code, body, contentType) {
  const entry = inflight.get(id);
  if (!entry) return;
  inflight.delete(id);
  clearTimeout(entry.timer);
  const ms = Date.now() - entry.started;
  entry.res
    .writeHead(code, { ...cors, 'Content-Type': contentType, 'X-Figma-Ms': String(ms) })
    .end(body);
  log(`${code === 200 ? '✓' : '✗'} ${entry.cmd} — ${ms} ms, ${(body.length / 1024).toFixed(1)} kB`);
}

function pull(req, res, url) {
  if (!plugin.seen || !connected()) log('+ plugin connected');
  plugin.seen = true;
  plugin.lastSeen = Date.now();
  plugin.file = url.searchParams.get('file') || plugin.file;
  plugin.page = url.searchParams.get('page') || plugin.page;

  const job = queue.shift();
  if (job) return handOff(res, job);

  const waiter = {
    res,
    timer: setTimeout(() => {
      dropWaiter(waiter);
      res.writeHead(204, cors).end();
    }, HOLD),
  };
  waiters.push(waiter);
  req.on('close', () => {
    clearTimeout(waiter.timer);
    dropWaiter(waiter);
  });
}

async function result(req, res) {
  const msg = JSON.parse(await readBody(req));
  const entry = inflight.get(String(msg.id));
  // A late chunk for a job the client already gave up on: acknowledge and drop.
  if (!entry) return json(res, 200, { ok: true, note: 'no longer waiting' });

  if (msg.ok === false) {
    finish(String(msg.id), 500, JSON.stringify({ error: msg.error || 'plugin error' }), 'application/json');
    return json(res, 200, { ok: true });
  }

  entry.chunks[Number(msg.seq) || 0] = String(msg.chunk ?? '');
  if (msg.final) {
    const holes = [...entry.chunks].some((c) => c === undefined);
    if (holes) {
      finish(String(msg.id), 502, JSON.stringify({ error: 'answer arrived incomplete' }), 'application/json');
    } else {
      // The body IS the answer — wrapping it in an envelope would mean escaping
      // a multi-MB JSON string into another JSON string.
      finish(String(msg.id), 200, entry.chunks.join(''), 'application/json');
    }
  }
  return json(res, 200, { ok: true });
}

async function rpc(req, res) {
  const msg = JSON.parse(await readBody(req));
  if (!msg.cmd) return json(res, 400, { error: 'missing `cmd`' });

  if (!connected()) {
    return json(res, 503, {
      error:
        'The Figma plugin is not connected. In Figma: Plugins → Development → "CBAR Figma bridge". ' +
        (plugin.seen ? 'It was connected earlier — the plugin window was probably closed.' : ''),
    });
  }

  const id = String(++seq);
  const job = { id, cmd: msg.cmd, args: msg.args || {} };
  const timeout = Math.min(Number(msg.timeout) || RPC_TIMEOUT, 15 * 60_000);

  inflight.set(id, {
    res,
    chunks: [],
    cmd: msg.cmd,
    started: Date.now(),
    timer: setTimeout(() => {
      const i = queue.indexOf(job);
      if (i >= 0) queue.splice(i, 1);
      finish(
        id,
        504,
        JSON.stringify({
          error: `\`${job.cmd}\` did not answer within ${Math.round(timeout / 1000)}s. ${
            job.sentAt ? 'The plugin took the job — the node may be very large; try a smaller --depth.' : 'The plugin never took the job.'
          }`,
        }),
        'application/json'
      );
    }, timeout),
  });

  const waiter = waiters.shift();
  if (waiter) {
    clearTimeout(waiter.timer);
    handOff(waiter.res, job);
  } else {
    queue.push(job);
  }
}

const handler = async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/health') return json(res, 200, health());
    if (url.pathname === '/pull' && req.method === 'GET') return pull(req, res, url);
    if (url.pathname === '/result' && req.method === 'POST') return result(req, res);
    if (url.pathname === '/rpc' && req.method === 'POST') return rpc(req, res);
    return json(res, 404, { error: 'unknown endpoint — /pull, /result, /rpc, /health' });
  } catch (err) {
    if (!res.headersSent) json(res, 400, { error: err.message });
  }
};

/**
 * Both loopback stacks, never a wildcard bind: the plugin reaches the bridge by
 * the name in devAllowedDomains, and on Windows `localhost` resolves to `::1`
 * before `127.0.0.1`. One socket per address keeps the LAN out of it either way.
 *
 * Resolves once either address is listening; rejects only if both fail.
 */
export function startBridge({ log: sink } = {}) {
  if (sink) log = sink;
  const hosts = ['127.0.0.1', '::1'];
  const servers = [];

  return new Promise((resolve, reject) => {
    let settled = false;
    let failures = 0;

    for (const host of hosts) {
      const server = createServer(handler);
      servers.push(server);
      server.on('error', (err) => {
        failures++;
        if (err.code !== 'EADDRINUSE') log(`· ${host} unavailable (${err.code})`);
        else if (!settled) log(`· ${host}:${PORT} already in use`);
        if (failures === hosts.length && !settled) {
          settled = true;
          reject(new Error(`port ${PORT} is already in use — another bridge is probably running`));
        }
      });
      server.listen(PORT, host, () => {
        log(`listening on ${host}:${PORT}`);
        if (!settled) {
          settled = true;
          resolve({ servers, port: PORT });
        }
      });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startBridge().then(
    () => console.log('figma bridge — waiting for the plugin (Ctrl+C to stop)'),
    (err) => {
      console.error(`✗ ${err.message}`);
      process.exit(1);
    }
  );
}
