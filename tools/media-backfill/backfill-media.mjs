#!/usr/bin/env node
// One-off migration tool: the SQL was moved to the new environment but the files stayed
// behind in the old one's storage, which we have no access to. So media_assets rows exist
// while MinIO holds nothing, and /media/{id} 404s for every migrated asset.
//
// The way in is that the old files are still served publicly. The column that names them
// there is original_name — the legacy Yii app generated it as substr(md5(uniqid()), 0, 25)
// and the migration carried it over — so each row is looked up as
// <source-base>/<folder>/<original_name> across the folders that app used. storage_key is
// left alone: it already holds the key the new API asks MinIO for, so the bytes just need
// to land under it.
//
// Usage (see README.md):
//   node backfill-media.mjs --probe --from-dump dump.sql   # coverage, no credentials
//   node backfill-media.mjs --dry-run
//   node backfill-media.mjs

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { dirname, join } from "node:path";
import { Readable, Transform } from "node:stream";
import { fileURLToPath } from "node:url";
import pg from "pg";
import * as Minio from "minio";

// Credentials come from a .env file next to this script (git-ignored), so they never end
// up in a shell history or a CI log. Real environment variables still win over it.
try {
  const file = readFileSync(join(dirname(fileURLToPath(import.meta.url)), ".env"), "utf8");
  for (const line of file.split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m || line.trimStart().startsWith("#")) continue;
    const value = m[2].trim();
    const quoted =
      value.length > 1 &&
      (value.startsWith('"') || value.startsWith("'")) &&
      value.endsWith(value[0]);
    process.env[m[1]] ??= quoted ? value.slice(1, -1) : value;
  }
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const { values: flags } = parseArgs({
  options: {
    help: { type: "boolean", short: "h", default: false },
    // Read-only survey of what the migrated rows actually look like. Needs PG only, so it
    // runs before the MinIO credentials are in place.
    inspect: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    // Copy the files but leave the rows alone, for a read-only database connection. The
    // rows then still hold the old absolute URL, so the API only finds the objects if it
    // strips the scheme and host before the lookup.
    "no-db": { type: "boolean", default: false },
    force: { type: "boolean", default: false }, // re-upload even if the object exists
    "include-deleted": { type: "boolean", default: false },
    ids: { type: "string" }, // "12,34,56" — restrict to these media_assets ids
    limit: { type: "string" },
    concurrency: { type: "string", default: "4" },
    "source-base": { type: "string", default: process.env.SOURCE_BASE ?? "https://uploads.cbar.az" },
    report: { type: "string", default: "backfill-report.json" },

    // Which column names the file on the old host. The tool was first written for
    // "storage-key", assuming the migration had left an absolute URL there — it had not.
    // In this database storage_key is already the object key the new API generates
    // ({yyyy/MM}/{sha256[..16]}{ext}), and the name the old host still serves the file
    // under sits in original_name, because the legacy Yii app generated it as
    // substr(md5(uniqid()), 0, 25) and the migration carried it over verbatim.
    "source-from": { type: "string", default: "original-name" },
    // Folders the legacy app uploaded into (UploadBehavior's $folder across common/models).
    // Tried in order; "assets" first because every sampled file was found there.
    folders: {
      type: "string",
      default: "assets,news_slider,banners,homepage,photo-gallery,organization," +
        "press-releases,money-marks,meas,homepage_publications,avatars",
    },
    // Read the rows out of a pg_dump COPY block instead of connecting to Postgres, so
    // coverage can be measured before any credential is in place.
    "from-dump": { type: "string" },
    // HEAD only: report which rows the old host can still serve, touch neither MinIO nor
    // the database. Needs no credentials at all.
    probe: { type: "boolean", default: false },
    // Rewrite size_bytes/checksum_sha256 from the bytes actually fetched. Off by default:
    // in "original-name" mode storage_key is already correct, so a clean run needs no
    // write at all, and a rewritten checksum can collide with the admin panel's
    // single-row dedup lookup.
    "fix-metadata": { type: "boolean", default: false },
  },
});

if (flags.help) {
  console.log(`
media-backfill — copies the files behind migrated media_assets rows from the old public
host into MinIO, under the object key each row already carries. No database write is
needed in the default mode.

  node backfill-media.mjs --probe --from-dump dump.sql   coverage only, no credentials
  node backfill-media.mjs --inspect     survey the database, read-only (needs PG only)
  node backfill-media.mjs --dry-run     show what would be copied, write nothing
  node backfill-media.mjs --limit 1     copy a single file as a trial
  node backfill-media.mjs               copy everything

  --source-from C    which column names the file on the old host:
                     original-name (default) or storage-key
  --folders a,b,c    legacy folders to try, in order
  --from-dump FILE   read the rows from a pg_dump COPY block, not from Postgres
  --probe            HEAD only: which rows the old host can still serve
  --fix-metadata     also rewrite size_bytes/checksum_sha256 from the bytes fetched
  --ids 1,2,3        only these media_assets rows
  --limit N          only the first N rows
  --force            re-upload even if the object already exists
  --include-deleted  include soft-deleted rows
  --no-db            copy the files only, never write to the database
  --concurrency N    parallel transfers (default 4)
  --source-base URL  base the legacy paths are resolved against
                     (default https://uploads.cbar.az)
  --report FILE      per-row result file (default backfill-report.json)

Configuration is read from .env next to this script — see README.md.`);
  process.exit(0);
}

const env = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    console.error(`Missing required env var ${name}. See README.md.`);
    process.exit(2);
  }
  return v;
};

const dryRun = flags["dry-run"];
const probe = flags.probe;
const fromDump = flags["from-dump"];
// A dump is a file, not a session — there is nothing to write back to.
const writeDb = !flags["no-db"] && !dryRun && !probe && !fromDump;
const concurrency = Math.max(1, Number(flags.concurrency) || 4);

if (!["original-name", "storage-key"].includes(flags["source-from"])) {
  console.error(`--source-from must be 'original-name' or 'storage-key'.`);
  process.exit(2);
}
const folders = flags.folders.split(",").map((f) => f.trim().replace(/^\/+|\/+$/g, "")).filter(Boolean);

// Built on demand, so --inspect works with nothing but a database connection.
let minio;
let bucket;

function connectMinio() {
  // Vault stores the endpoint in MinIO's convention ("host:port", no scheme), but a value
  // carrying http(s):// is accepted too and then decides the scheme itself — same rule the
  // two APIs follow.
  const rawEndpoint = env("MINIO_ENDPOINT").trim();
  const hasScheme = /^https?:\/\//i.test(rawEndpoint);
  const useSsl = hasScheme
    ? rawEndpoint.toLowerCase().startsWith("https://")
    : env("MINIO_USE_SSL", "true") === "true";
  const [host, port] = rawEndpoint.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").split(":");

  minio = new Minio.Client({
    endPoint: host,
    port: Number(port ?? (useSsl ? 443 : 80)),
    useSSL: useSsl,
    accessKey: env("MINIO_ACCESS_KEY"),
    secretKey: env("MINIO_SECRET_KEY"),
    // Same reason the APIs set MediaStorage__Region: s3.cbar.az signs with its own region
    // and rejects the default "us-east-1" with a bare 400.
    ...(process.env.MINIO_REGION ? { region: process.env.MINIO_REGION } : {}),
  });
  bucket = env("MINIO_BUCKET");
}

// Built lazily too: --probe --from-dump needs neither PG nor MinIO.
let db;

/**
 * Turns whatever the migration left in storage_key into (source URL, object key).
 * An absolute URL keeps its own host; a bare path is resolved against --source-base.
 * The key is the decoded path so MinIO holds a readable key and the value written back
 * into storage_key is byte-for-byte what api-cbar will ask MinIO for.
 */
function resolve(storageKey) {
  const raw = String(storageKey).trim();
  const absolute = /^https?:\/\//i.test(raw);
  const url = new URL(absolute ? raw : raw.replace(/^\/+/, ""), flags["source-base"] + "/");
  const key = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  return { sourceUrl: url.toString(), key, absolute };
}

/**
 * Where a row's bytes might still be served from, and the key they belong under.
 *
 * In "original-name" mode the old host is asked for <folder>/<original_name> — the legacy
 * app put every upload in one of a handful of fixed folders and the row does not record
 * which, so they are tried in order. The object key is left exactly as storage_key already
 * is: the new API generated it and asks MinIO for that string, so a successful copy needs
 * no database write at all.
 *
 * "storage-key" keeps the original behaviour, for a database whose rows really do carry an
 * old absolute URL.
 */
function candidates(row) {
  if (flags["source-from"] === "storage-key") {
    const { sourceUrl, key } = resolve(row.storage_key);
    return { targetKey: key, urls: [sourceUrl], repointable: true };
  }

  const name = String(row.original_name ?? "").trim().replace(/^\/+/, "");
  if (!name) return { targetKey: row.storage_key, urls: [], repointable: false };

  // A name that already carries a folder ("assets/x.pdf") is taken as given; the migration
  // stored most of them bare.
  const urls = name.includes("/")
    ? [new URL(encodeURI(name), flags["source-base"] + "/").toString()]
    : folders.map((f) => new URL(`${f}/${encodeURIComponent(name)}`, flags["source-base"] + "/").toString());

  return { targetKey: row.storage_key, urls, repointable: false };
}

/**
 * First candidate the old host actually serves. The host answers a miss with 200 and an
 * HTML error page rather than a 404, so the content type decides, not the status — the
 * same soft-404 rule the download path applies.
 */
async function findSource(urls, mimeType) {
  for (const url of urls) {
    let res;
    try {
      res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(30000) });
    } catch {
      continue; // network hiccup on one candidate should not condemn the rest
    }
    if (!res.ok) continue;
    const served = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (served.startsWith("text/html") && !(mimeType ?? "").startsWith("text/html")) continue;
    return { url, served, length: Number(res.headers.get("content-length")) || null };
  }
  return null;
}

async function objectExists(key) {
  try {
    await minio.statObject(bucket, key);
    return true;
  } catch (err) {
    if (err.code === "NotFound" || err.code === "NoSuchKey" || err.statusCode === 404) return false;
    throw err;
  }
}

async function handle(row, report) {
  const { targetKey, urls, repointable } = candidates(row);
  const entry = { id: row.id, key: targetKey, name: row.original_name };

  if (urls.length === 0) {
    entry.status = "no-source";
    entry.error = "row has no original_name to look the file up by";
    report.push(entry);
    return;
  }

  // Skipped while probing: the point there is what the old host still has, and the answer
  // should not depend on how far a previous copy run got.
  if (!probe && !flags.force && (await objectExists(targetKey))) {
    entry.status = "already-in-minio";
    report.push(entry);
    if (writeDb && repointable && row.storage_key !== targetKey) {
      await repoint(row, targetKey, null, null, entry);
    }
    return;
  }

  const found = await findSource(urls, row.mime_type);
  if (!found) {
    entry.status = "source-missing";
    entry.error = `not served under any of: ${folders.join(", ")}`;
    entry.tried = urls.length;
    report.push(entry);
    return;
  }

  entry.source = found.url;

  if (probe || dryRun) {
    entry.status = probe ? "found" : "would-copy";
    if (found.length) entry.bytes = found.length;
    report.push(entry);
    return;
  }

  const res = await fetch(found.url, { signal: AbortSignal.timeout(600000) });
  if (!res.ok) {
    // HEAD said yes a moment ago, so this is a transient failure rather than a missing
    // file — worth a retry rather than a manual look.
    entry.status = "error";
    entry.error = `HTTP ${res.status} on download (HEAD had succeeded)`;
    report.push(entry);
    return;
  }

  const served = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const { bytes, checksum } = await store(res, targetKey, row.mime_type || served, entry);

  entry.status = "copied";
  entry.bytes = bytes;
  report.push(entry);

  // With storage_key already correct, a copy needs no write; --fix-metadata opts into
  // refreshing the size and checksum from what was actually fetched.
  if (writeDb && (repointable || flags["fix-metadata"])) {
    await repoint(row, targetKey, bytes, checksum, entry);
  }
}

/**
 * Downloads the response into MinIO and reports the real size and checksum.
 * Streamed rather than buffered where the length is known: annual-report PDFs run to
 * ~200MB, and at --concurrency 8 buffering would be well over a gigabyte of resident
 * memory. The tap hashes and counts the bytes on their way through, so size_bytes and
 * checksum_sha256 come from the actual file rather than from the old system's values.
 */
async function store(res, targetKey, mimeType, entry) {
  const contentType = mimeType || "application/octet-stream";
  const declared = Number(res.headers.get("content-length"));
  const hash = createHash("sha256");

  if (!Number.isFinite(declared) || declared <= 0) {
    // No Content-Length to go on. Buffering one file is the lesser evil: handed a stream
    // of unknown length the client sizes its part buffers from the 5TiB maximum.
    const body = Buffer.from(await res.arrayBuffer());
    await minio.putObject(bucket, targetKey, body, body.length, { "Content-Type": contentType });
    return { bytes: body.length, checksum: hash.update(body).digest("hex") };
  }

  let bytes = 0;
  const tap = new Transform({
    transform(chunk, _enc, cb) {
      hash.update(chunk);
      bytes += chunk.length;
      cb(null, chunk);
    },
  });

  await minio.putObject(bucket, targetKey, Readable.fromWeb(res.body).pipe(tap), declared, {
    "Content-Type": contentType,
  });
  if (bytes !== declared) entry.warning = `content-length ${declared} but read ${bytes} bytes`;

  return { bytes, checksum: hash.digest("hex") };
}

/**
 * Points the row at the object that now exists. storage_key is UNIQUE and the admin API
 * looks assets up by checksum with a single-row query, so both are checked for an
 * existing owner first — a clash means two rows share one file and needs a human.
 */
async function repoint(row, targetKey, sizeBytes, checksum, entry) {
  if (row.storage_key !== targetKey) {
    const clash = await db.query(
      "SELECT id FROM media_assets WHERE storage_key = $1 AND id <> $2",
      [targetKey, row.id],
    );
    if (clash.rowCount > 0) {
      entry.status = "key-conflict";
      entry.error = `storage_key already belongs to media_assets.id=${clash.rows[0].id}`;
      return;
    }
  }

  let newChecksum = null;
  if (checksum && checksum !== row.checksum_sha256) {
    const dup = await db.query(
      "SELECT id FROM media_assets WHERE checksum_sha256 = $1 AND id <> $2",
      [checksum, row.id],
    );
    // Leaving the stale checksum in place is the lesser evil: a duplicate would make the
    // admin panel's dedup lookup throw on the next upload.
    if (dup.rowCount > 0) entry.checksumSkipped = `duplicate of media_assets.id=${dup.rows[0].id}`;
    else newChecksum = checksum;
  }

  await db.query(
    `UPDATE media_assets
        SET storage_key = $2,
            size_bytes = COALESCE($3, size_bytes),
            checksum_sha256 = COALESCE($4, checksum_sha256)
      WHERE id = $1`,
    [row.id, targetKey, sizeBytes, newChecksum],
  );
  entry.dbUpdated = true;
}

/**
 * Read-only survey, so the shape of the migrated data can be checked without a SQL client:
 * how many rows carry an old absolute URL, which folders they sit in, a few samples, and
 * whether the old host is also hard-coded inside CMS text (those files are not rows in
 * media_assets, so this tool does not move them).
 */
async function inspect() {
  const shape = await db.query(`
    SELECT count(*) AS total,
           count(*) FILTER (WHERE storage_key ILIKE 'http%') AS absolute_url,
           count(*) FILTER (WHERE storage_key NOT ILIKE 'http%' AND storage_key LIKE '%/%') AS relative_path,
           count(*) FILTER (WHERE storage_key NOT ILIKE 'http%' AND storage_key NOT LIKE '%/%') AS bare_name,
           count(*) FILTER (WHERE deleted_at IS NOT NULL) AS soft_deleted
      FROM media_assets`);
  console.log("media_assets:");
  console.table(shape.rows);

  const keyFolders = await db.query(`
    SELECT split_part(regexp_replace(storage_key, '^(https?://[^/]+)?/+', ''), '/', 1) AS folder,
           count(*) AS rows,
           count(DISTINCT mime_type) AS mime_types
      FROM media_assets
     WHERE deleted_at IS NULL
     GROUP BY 1 ORDER BY 2 DESC LIMIT 25`);
  console.log("\nstorage_key folders:");
  console.table(keyFolders.rows);

  const types = await db.query(`
    SELECT mime_type, count(*) AS rows, pg_size_pretty(sum(size_bytes)::bigint) AS claimed_size
      FROM media_assets WHERE deleted_at IS NULL
     GROUP BY 1 ORDER BY 2 DESC LIMIT 25`);
  console.log("\nmime types:");
  console.table(types.rows);

  const samples = await db.query(`
    SELECT id, storage_key, mime_type FROM media_assets
     WHERE deleted_at IS NULL ORDER BY random() LIMIT 10`);
  console.log("\nsamples:");
  console.table(samples.rows);

  // Every text column in the schema is counted, rather than guessing which ones hold HTML.
  const host = new URL(flags["source-base"]).host;
  const columns = await db.query(`
    SELECT c.table_name, c.column_name
      FROM information_schema.columns c
      JOIN information_schema.tables t
        ON t.table_schema = c.table_schema AND t.table_name = c.table_name
       AND t.table_type = 'BASE TABLE'
     WHERE c.table_schema = 'public'
       AND c.data_type IN ('text', 'character varying')
       AND NOT (c.table_name = 'media_assets' AND c.column_name = 'storage_key')
     ORDER BY c.table_name, c.column_name`);

  const embedded = [];
  for (const { table_name, column_name } of columns.rows) {
    const q = (id) => `"${id.replaceAll('"', '""')}"`;
    const { rows } = await db.query(
      `SELECT count(*)::int AS hits FROM ${q(table_name)} WHERE ${q(column_name)} ILIKE $1`,
      [`%${host}%`],
    );
    if (rows[0].hits > 0) embedded.push({ table: table_name, column: column_name, hits: rows[0].hits });
  }

  console.log(`\nrows with '${host}' written inside other columns (this tool does NOT move those):`);
  if (embedded.length === 0) console.log("  none");
  else console.table(embedded.toSorted((a, b) => b.hits - a.hits));
}

/**
 * Reads the media_assets rows straight out of a pg_dump COPY block. The column order is
 * taken from the COPY header rather than assumed, and the tab-separated text format's
 * escapes are undone — \N is NULL, the rest are the usual backslash pairs.
 */
function rowsFromDump(path) {
  const text = readFileSync(path, "utf8");
  const start = text.indexOf("COPY public.media_assets (");
  if (start === -1) throw new Error(`No 'COPY public.media_assets' block in ${path}.`);

  const lines = text.slice(start).split(/\r?\n/);
  const columns = /\(([^)]*)\)/.exec(lines[0])[1].split(",").map((c) => c.trim());

  const unescape = (v) =>
    v === "\\N" ? null : v.replace(/\\(.)/g, (_, c) => ({ t: "\t", n: "\n", r: "\r" })[c] ?? c);

  const rows = [];
  for (const line of lines.slice(1)) {
    if (line === "\\.") break;
    if (!line) continue;
    const values = line.split("\t");
    rows.push(Object.fromEntries(columns.map((c, i) => [c, unescape(values[i] ?? "\\N")])));
  }
  return rows;
}

function selectRows(rows) {
  let out = rows;
  if (!flags["include-deleted"]) out = out.filter((r) => r.deleted_at === null);
  if (flags.ids) {
    const wanted = new Set(flags.ids.split(",").map((s) => s.trim()));
    out = out.filter((r) => wanted.has(String(r.id)));
  }
  out = out.toSorted((a, b) => Number(a.id) - Number(b.id));
  return flags.limit ? out.slice(0, Number(flags.limit)) : out;
}

async function main() {
  // --probe --from-dump touches neither service, so neither connection is opened.
  const needsDb = !fromDump;
  if (needsDb) {
    db = new pg.Client({ connectionString: env("PG") });
    await db.connect();
  }

  if (flags.inspect) {
    await inspect();
    await db.end();
    return;
  }

  if (!probe) connectMinio();

  let rows;
  if (fromDump) {
    rows = selectRows(rowsFromDump(fromDump));
  } else {
    const where = [];
    const params = [];
    if (!flags["include-deleted"]) where.push("deleted_at IS NULL");
    if (flags.ids) {
      params.push(flags.ids.split(",").map((s) => Number(s.trim())).filter(Number.isFinite));
      where.push(`id = ANY($${params.length})`);
    }

    ({ rows } = await db.query(
      `SELECT id, storage_key, original_name, mime_type, size_bytes, checksum_sha256
         FROM media_assets
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY id
        ${flags.limit ? "LIMIT " + Number(flags.limit) : ""}`,
      params,
    ));
  }

  let mode;
  if (probe) mode = "PROBE (HEAD only, nothing written)";
  else if (dryRun) mode = "DRY RUN";
  else if (writeDb) mode = flags["fix-metadata"] ? "upload + metadata refresh" : "upload only";
  else mode = "upload only (--no-db)";

  console.log(
    `${rows.length} media_assets rows | source=${flags["source-from"]} | ` +
      `${probe ? "no bucket" : "bucket=" + bucket} | ${mode}`,
  );

  if (!probe && !dryRun && !(await minio.bucketExists(bucket))) {
    console.error(`Bucket '${bucket}' does not exist at the configured endpoint.`);
    process.exit(1);
  }

  const report = [];
  let cursor = 0;
  let done = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (cursor < rows.length) {
        const row = rows[cursor++];
        try {
          await handle(row, report);
        } catch (err) {
          report.push({ id: row.id, key: row.storage_key, status: "error", error: String(err.message ?? err) });
        }
        if (++done % 25 === 0 || done === rows.length) process.stdout.write(`\r  ${done}/${rows.length}`);
      }
    }),
  );
  process.stdout.write("\n");

  const counts = report.reduce((acc, e) => ({ ...acc, [e.status]: (acc[e.status] ?? 0) + 1 }), {});
  for (const [status, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status.padEnd(18)} ${n}`);
  }

  await writeFile(flags.report, JSON.stringify(report, null, 2));
  console.log(`\nPer-row detail: ${flags.report}`);

  const failed = report.filter((e) =>
    ["source-missing", "no-source", "error", "key-conflict"].includes(e.status));
  if (failed.length) console.log(`${failed.length} row(s) need attention — grep the report for their status.`);

  await db?.end();
}

main().catch(async (err) => {
  console.error(err);
  await db?.end().catch(() => {});
  process.exit(1);
});
