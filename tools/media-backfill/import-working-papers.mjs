#!/usr/bin/env node
/**
 * Spec 054 US6: puts the legacy working papers into an environment straight through PostgreSQL and MinIO, with the same
 * .env as backfill-media.mjs / scrape-relink.mjs, so no admin login is needed.
 *
 * Input: specs/054-publications-research/seed/working-papers.json (extract-papers.mjs, read from test.cbar.az).
 *
 *   1. PDFs: each one is downloaded from the old site's uploads host, stored in MinIO under the key the admin API gives an
 *      upload (`YYYY/MM/<sha256[0..16]>.pdf`) and gets a media_assets row (+ media_asset_details, as an upload does). Bytes
 *      already in the library reuse the existing row, so a rerun uploads nothing.
 *   2. Papers: one transaction. A paper whose number + year or legacy page already exists is skipped, so one an editor
 *      entered by hand stays as it is.
 *
 *   node import-working-papers.mjs --plan        # nothing but the JSON: what would be written
 *   node import-working-papers.mjs --dry-run     # + PG (read): which papers are already there
 *   node import-working-papers.mjs --apply       # writes (PG with write access + MinIO)
 *   --only 02-2025   one paper    --status draft   instead of published
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import pg from "pg";
import * as Minio from "minio";

const here = dirname(fileURLToPath(import.meta.url));

// Same .env handling as backfill-media.mjs.
try {
  const file = readFileSync(join(here, ".env"), "utf8");
  for (const line of file.split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m || line.trimStart().startsWith("#")) continue;
    const value = m[2].trim();
    const quoted = value.length > 1 && (value.startsWith('"') || value.startsWith("'")) && value.endsWith(value[0]);
    process.env[m[1]] ??= quoted ? value.slice(1, -1) : value;
  }
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const { values: flags } = parseArgs({
  options: {
    plan: { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    apply: { type: "boolean", default: false },
    only: { type: "string" },
    status: { type: "string", default: "published" },
    input: { type: "string", default: join(here, "../../specs/054-publications-research/seed/working-papers.json") },
  },
});
if (!flags.plan && !flags["dry-run"] && !flags.apply) {
  console.log("Pick one: --plan | --dry-run | --apply (see the header of this file).");
  process.exit(0);
}
if (!["published", "draft"].includes(flags.status)) throw new Error("--status must be published or draft");

const env = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    console.error(`Missing required env var ${name}. See README.md.`);
    process.exit(2);
  }
  return v;
};

const JEL = /^[A-Z][0-9]{1,2}$/;
const ADMIN_USER_ID = 1; // like scrape-relink.mjs: the seeded admin
const code = (p) => `${String(p.number).padStart(2, "0")}-${p.year}`;
const { papers: all } = JSON.parse(readFileSync(flags.input, "utf8"));
const papers = all.filter((p) => !flags.only || code(p) === flags.only);
if (!papers.length) throw new Error(`no paper ${flags.only}`);
const pdfUrls = [...new Set(papers.flatMap((p) => Object.values(p.translations).map((t) => t.files[0]?.url)).filter(Boolean))];

console.log(`${flags.apply ? "APPLY" : flags["dry-run"] ? "DRY RUN" : "PLAN"}: ${papers.length} papers, ${pdfUrls.length} PDFs, status ${flags.status}`);
if (flags.plan) {
  for (const p of papers) console.log(`  ${code(p)} page-${p.legacyPageId} ${p.paperLanguage} — ${p.translations.az?.title?.slice(0, 70)}`);
  process.exit(0);
}

const db = new pg.Client({ connectionString: env("PG") });
await db.connect();

const { rows: taken } = await db.query(
  `SELECT number, year, legacy_page_id FROM working_papers WHERE deleted_at IS NULL`,
);
const exists = (p) => taken.some((t) => (t.number === p.number && t.year === p.year) || t.legacy_page_id === p.legacyPageId);
const todo = papers.filter((p) => !exists(p));
console.log(`${papers.length - todo.length} already in the database, ${todo.length} to write`);
if (flags["dry-run"]) {
  for (const p of todo) console.log(`  + ${code(p)} page-${p.legacyPageId}`);
  await db.end();
  process.exit(0);
}

/* ---------------------------------------------------------------- 1. PDFs */
const rawEndpoint = env("MINIO_ENDPOINT").trim();
const hasScheme = /^https?:\/\//i.test(rawEndpoint);
const useSsl = hasScheme ? rawEndpoint.toLowerCase().startsWith("https://") : env("MINIO_USE_SSL", "true") === "true";
const [host, port] = rawEndpoint.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").split(":");
const minio = new Minio.Client({
  endPoint: host,
  port: Number(port ?? (useSsl ? 443 : 80)),
  useSSL: useSsl,
  accessKey: env("MINIO_ACCESS_KEY"),
  secretKey: env("MINIO_SECRET_KEY"),
  ...(process.env.MINIO_REGION ? { region: process.env.MINIO_REGION } : {}),
});
const bucket = env("MINIO_BUCKET");

const PDF_SIGNATURE = "%PDF";
const mediaByUrl = new Map();
const neededUrls = new Set(todo.flatMap((p) => Object.values(p.translations).map((t) => t.files[0]?.url)).filter(Boolean));
let uploaded = 0;
let reused = 0;
for (const url of neededUrls) {
  const res = await fetch(url, { headers: { "User-Agent": "cbar-media-backfill/1.0" } });
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.subarray(0, 4).toString("latin1") !== PDF_SIGNATURE) throw new Error(`${url} is not a PDF`);
  const checksum = createHash("sha256").update(bytes).digest("hex");

  // The admin panel's duplicate lookup expects one live row per checksum: reuse it.
  const existing = await db.query(
    "SELECT id FROM media_assets WHERE checksum_sha256 = $1 AND deleted_at IS NULL ORDER BY id LIMIT 1",
    [checksum],
  );
  if (existing.rowCount > 0) {
    mediaByUrl.set(url, Number(existing.rows[0].id));
    reused++;
    continue;
  }
  const stamp = new Date().toISOString().slice(0, 7).replace("-", "/");
  const key = `${stamp}/${checksum.slice(0, 16)}.pdf`;
  await minio.putObject(bucket, key, bytes, bytes.length, { "Content-Type": "application/pdf" });
  const inserted = await db.query(
    `INSERT INTO media_assets (storage_key, original_name, mime_type, size_bytes, checksum_sha256, created_by)
     VALUES ($1, $2, 'application/pdf', $3, $4, $5) RETURNING id`,
    [key, basename(new URL(url).pathname), bytes.length, checksum, ADMIN_USER_ID],
  );
  const id = Number(inserted.rows[0].id);
  // The size is real, so MediaSizeBackfillService has nothing to check (as for an upload).
  await db.query(`INSERT INTO media_asset_details (media_id) VALUES ($1) ON CONFLICT DO NOTHING`, [id]);
  mediaByUrl.set(url, id);
  uploaded++;
  process.stdout.write(`\r  PDFs: ${uploaded} uploaded, ${reused} already there / ${neededUrls.size}`);
}
console.log(`\r  PDFs: ${uploaded} uploaded, ${reused} already there / ${neededUrls.size}`);

/* -------------------------------------------------------------- 2. papers */
await db.query("BEGIN");
try {
  for (const p of todo) {
    const { rows } = await db.query(
      `INSERT INTO working_papers (number, year, paper_language, jel_codes, legacy_page_id, status, created_by, updated_by)
       VALUES ($1, $2, $3, $4::text[], $5, $6::content_status, $7, $7) RETURNING id`,
      [p.number, p.year, p.paperLanguage ?? "other", p.jelCodes.filter((c) => JEL.test(c)), p.legacyPageId, flags.status, ADMIN_USER_ID],
    );
    for (const [locale, t] of Object.entries(p.translations)) {
      await db.query(
        `INSERT INTO working_paper_translations (paper_id, locale, title, authors, abstract, keywords, media_id)
         VALUES ($1, $2, $3, $4::text[], $5, $6::text[], $7)`,
        [rows[0].id, locale, t.title, t.authors, t.abstract, t.keywords, mediaByUrl.get(t.files[0]?.url) ?? null],
      );
    }
    console.log(`  + ${code(p)} id ${rows[0].id}`);
  }
  await db.query("COMMIT");
} catch (err) {
  await db.query("ROLLBACK");
  throw err;
}
await db.end();
console.log(`done: ${todo.length} papers written, ${papers.length - todo.length} skipped`);
