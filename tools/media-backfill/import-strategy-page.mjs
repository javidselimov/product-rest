#!/usr/bin/env node
/**
 * Spec 057 US4: puts the legacy "/pages/strategy" (the governor's letter on the 2024-2026 Financial Sector Development
 * Strategy) into CMS page 104, straight through PostgreSQL and MinIO, with the same .env as import-working-papers.mjs.
 *
 *   1. Files: the portrait and the az / en PDFs are downloaded from the legacy site's root and checked (PNG / PDF
 *      signature). One that cannot be downloaded stops the run before anything is written.
 *   2. Media: bytes already in the library (same sha256) reuse that row; new ones go to MinIO under the key the admin API
 *      gives an upload (`YYYY/MM/<sha256[0..16]>.<ext>`) and get a media_assets row (+ media_asset_details).
 *   3. Page 104 (az slug `maliyye-sektorunun-inkisaf-strategiyasi`) gets the letter in each locale from
 *      strategy-letter.<locale>.html, only while its text is still the copy of page 105's (its child, the progress
 *      reports). A text an editor changed is left as it is. Title, slug, tree and menus are not touched.
 *
 *   node import-strategy-page.mjs --plan       # downloads and checks the files; no database, no MinIO
 *   node import-strategy-page.mjs --dry-run    # + PG (read): media found or new, what each locale would get
 *   node import-strategy-page.mjs --apply      # writes: MinIO, then one PG transaction
 *   --source https://test.cbar.az (default) | https://www.cbar.az     --report strategy-report.json
 *
 * Undo: copy page 105's content back into page 104's (per locale); the media rows stay, other pages may use them.
 * No audit_log rows are written, as with import-working-papers.mjs.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

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
    source: { type: "string", default: "https://test.cbar.az" },
    report: { type: "string" },
  },
});
if (!flags.plan && !flags["dry-run"] && !flags.apply) {
  console.log("Pick one: --plan | --dry-run | --apply (see the header of this file).");
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

const ADMIN_USER_ID = 1; // like import-working-papers.mjs: the seeded admin
const STRATEGY_AZ_SLUG = "maliyye-sektorunun-inkisaf-strategiyasi";
const PROGRESS_AZ_SLUG = "2024-2026-ci-illerde-maliyye-sektorunun-inkisaf-strategiyasi-icra-statusu";
const LOCALES = ["az", "en"];

/** The legacy files: the key in the templates, the path on the legacy site, the mime type and its signature. */
const FILES = [
  { role: "portrait", name: "9183.png", mime: "image/png", ext: "png", signature: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
  { role: "pdf-az", name: "2024_2026_Azerbaijani.pdf", mime: "application/pdf", ext: "pdf", signature: Buffer.from("%PDF") },
  { role: "pdf-en", name: "2024_2026_English.pdf", mime: "application/pdf", ext: "pdf", signature: Buffer.from("%PDF") },
];
const TEMPLATES = Object.fromEntries(
  LOCALES.map((locale) => [locale, readFileSync(join(here, `strategy-letter.${locale}.html`), "utf8").trim()]),
);
const normalize = (html) => (html ?? "").replace(/\s+/g, " ").trim();
const mode = flags.apply ? "APPLY" : flags["dry-run"] ? "DRY RUN" : "PLAN";
const report = { mode, source: flags.source, files: [], pages: {} };
const finish = (code = 0) => {
  if (flags.report) writeFileSync(flags.report, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(JSON.stringify(report, null, 2));
  process.exit(code);
};

/* ------------------------------------------------------------ 1. download */
console.log(`${mode}: ${flags.source}`);
for (const file of FILES) {
  const url = new URL(`/${file.name}`, flags.source).href;
  let res;
  try {
    res = await fetch(url, { headers: { "User-Agent": "cbar-media-backfill/1.0" } });
  } catch (err) {
    console.error(`download ${url}: ${err.message}`);
    finish(1);
  }
  if (!res.ok) {
    console.error(`download ${url}: ${res.status}`);
    finish(1);
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  if (!bytes.subarray(0, file.signature.length).equals(file.signature)) {
    console.error(`${url} is not a ${file.mime} file`);
    finish(1);
  }
  file.bytes = bytes;
  file.checksum = createHash("sha256").update(bytes).digest("hex");
  report.files.push({ name: file.name, size: bytes.length, sha256: file.checksum });
}
if (flags.plan) finish();

/* ------------------------------------------------------------ 2. database */
const { default: pg } = await import("pg");
const db = new pg.Client({ connectionString: env("PG") });
await db.connect();

for (const file of FILES) {
  const existing = await db.query(
    "SELECT id FROM media_assets WHERE checksum_sha256 = $1 AND deleted_at IS NULL ORDER BY id LIMIT 1",
    [file.checksum],
  );
  file.mediaId = existing.rowCount > 0 ? Number(existing.rows[0].id) : null;
  Object.assign(report.files.find((f) => f.name === file.name), { mediaId: file.mediaId, created: false });
}

const pageId = async (sql, params) => (await db.query(sql, params)).rows[0]?.page_id ?? null;
const strategyPage = await pageId(
  `SELECT t.page_id FROM page_translations t JOIN pages p ON p.id = t.page_id
   WHERE t.locale = 'az' AND t.slug = $1 AND p.deleted_at IS NULL ORDER BY t.page_id LIMIT 1`,
  [STRATEGY_AZ_SLUG],
);
const progressPage = strategyPage === null ? null : await pageId(
  `SELECT t.page_id FROM page_translations t JOIN pages p ON p.id = t.page_id
   WHERE t.locale = 'az' AND t.slug = $1 AND p.parent_id = $2 AND p.deleted_at IS NULL ORDER BY t.page_id LIMIT 1`,
  [PROGRESS_AZ_SLUG, strategyPage],
);
report.strategyPage = strategyPage;
report.progressPage = progressPage;
if (strategyPage === null || progressPage === null) {
  console.error(`page ${strategyPage === null ? STRATEGY_AZ_SLUG : PROGRESS_AZ_SLUG} not found`);
  await db.end();
  finish(1);
}

const contentOf = async (id, locale) =>
  (await db.query("SELECT content FROM page_translations WHERE page_id = $1 AND locale = $2", [id, locale])).rows[0];
const fill = (locale, ids) =>
  TEMPLATES[locale].replace("{PORTRAIT_ID}", String(ids.portrait)).replace("{PDF_ID}", String(ids[`pdf-${locale}`]));

/** What a locale gets: `written` (still the copy of 105), `same` (already the letter), `edited`, or `missing`. */
async function decide(ids) {
  const decisions = {};
  for (const locale of LOCALES) {
    const own = await contentOf(strategyPage, locale);
    if (!own) {
      decisions[locale] = "missing";
      continue;
    }
    const progress = await contentOf(progressPage, locale);
    if (ids && normalize(own.content) === normalize(fill(locale, ids))) decisions[locale] = "same";
    else if (normalize(own.content) === normalize(progress?.content)) decisions[locale] = "written";
    else decisions[locale] = "edited";
  }
  return decisions;
}

if (flags["dry-run"]) {
  const known = Object.fromEntries(FILES.map((f) => [f.role, f.mediaId ?? `<new ${f.name}>`]));
  report.pages = await decide(FILES.every((f) => f.mediaId) ? known : null);
  for (const locale of LOCALES) if (report.pages[locale] === "written") console.log(`--- ${locale}\n${fill(locale, known)}`);
  await db.end();
  finish();
}

/* --------------------------------------------------------------- 3. write */
const rawEndpoint = env("MINIO_ENDPOINT").trim();
const hasScheme = /^https?:\/\//i.test(rawEndpoint);
const useSsl = hasScheme ? rawEndpoint.toLowerCase().startsWith("https://") : env("MINIO_USE_SSL", "true") === "true";
const [host, port] = rawEndpoint.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").split(":");
const Minio = await import("minio");
const minio = new Minio.Client({
  endPoint: host,
  port: Number(port ?? (useSsl ? 443 : 80)),
  useSSL: useSsl,
  accessKey: env("MINIO_ACCESS_KEY"),
  secretKey: env("MINIO_SECRET_KEY"),
  ...(process.env.MINIO_REGION ? { region: process.env.MINIO_REGION } : {}),
});
const bucket = env("MINIO_BUCKET");

// Objects first: a failure here leaves the database untouched, and a rerun writes the same key again.
const stamp = new Date().toISOString().slice(0, 7).replace("-", "/");
for (const file of FILES.filter((f) => f.mediaId === null)) {
  file.key = `${stamp}/${file.checksum.slice(0, 16)}.${file.ext}`;
  await minio.putObject(bucket, file.key, file.bytes, file.bytes.length, { "Content-Type": file.mime });
}

await db.query("BEGIN");
try {
  for (const file of FILES.filter((f) => f.mediaId === null)) {
    const inserted = await db.query(
      `INSERT INTO media_assets (storage_key, original_name, mime_type, size_bytes, checksum_sha256, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [file.key, file.name, file.mime, file.bytes.length, file.checksum, ADMIN_USER_ID],
    );
    file.mediaId = Number(inserted.rows[0].id);
    // The size is real, so MediaSizeBackfillService has nothing to check (as for an upload).
    await db.query("INSERT INTO media_asset_details (media_id) VALUES ($1) ON CONFLICT DO NOTHING", [file.mediaId]);
    Object.assign(report.files.find((f) => f.name === file.name), { mediaId: file.mediaId, created: true });
  }
  const ids = Object.fromEntries(FILES.map((f) => [f.role, f.mediaId]));
  report.pages = await decide(ids);
  for (const locale of LOCALES.filter((l) => report.pages[l] === "written")) {
    await db.query("UPDATE page_translations SET content = $1 WHERE page_id = $2 AND locale = $3", [
      fill(locale, ids),
      strategyPage,
      locale,
    ]);
  }
  await db.query("COMMIT");
} catch (err) {
  await db.query("ROLLBACK");
  await db.end();
  throw err;
}
await db.end();
finish();
