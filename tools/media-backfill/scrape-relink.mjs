#!/usr/bin/env node
// Second one-off tool, for the images the migration dropped rather than mislinked.
//
// backfill-media.mjs copies files that a media_assets row already points at. This one is
// for the tables where no row was ever created: the migration filled organization_staff,
// banners, money_marks, gallery_images, news_slider and homepage_publications with
// placeholder.png, mock_placeholder.jpg, test-image-2.png or plain NULL, so the original
// image is referenced nowhere in the database and nothing can look it up.
//
// The legacy database would give the mapping directly, but it is not available. What is
// available is the old site, which still renders each record next to its image — so the
// mapping is recovered from the rendered page and matched back onto the new rows by the
// text they share (a staff member's full name, say).
//
// Usage (see README.md):
//   node scrape-relink.mjs --plan --from-dump ../../schema-new/cbar-...sql
//   node scrape-relink.mjs --plan        # same, against the live database
//   node scrape-relink.mjs --apply

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { dirname, join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import * as Minio from "minio";
import * as cheerio from "cheerio";

// Same .env handling as backfill-media.mjs, for the same reason.
try {
  const file = readFileSync(join(dirname(fileURLToPath(import.meta.url)), ".env"), "utf8");
  for (const line of file.split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m || line.trimStart().startsWith("#")) continue;
    const value = m[2].trim();
    const quoted = value.length > 1 && (value.startsWith('"') || value.startsWith("'")) &&
      value.endsWith(value[0]);
    process.env[m[1]] ??= quoted ? value.slice(1, -1) : value;
  }
} catch (err) {
  if (err.code !== "ENOENT") throw err;
}

const { values: flags } = parseArgs({
  options: {
    help: { type: "boolean", short: "h", default: false },
    // Match and report, write nothing. The default, because every apply here both uploads
    // and rewrites a foreign key.
    plan: { type: "boolean", default: false },
    apply: { type: "boolean", default: false },
    "from-dump": { type: "string" },
    recipe: { type: "string", default: "staff" },
    // Collection recipes only replace rows still holding the migration's stand-ins; this
    // overrides that and replaces a record's images even when an editor has filled them in.
    "replace-all": { type: "boolean", default: false },
    "site-base": { type: "string", default: process.env.SITE_BASE ?? "https://www.cbar.az" },
    concurrency: { type: "string", default: "4" },
    report: { type: "string", default: "relink-report.json" },
  },
});

// --recipe list is its own question and answers without a mode, so it is checked first.
if (flags.help || (!flags.plan && !flags.apply && flags.recipe !== "list")) {
  console.log(`
scrape-relink — recovers the images the migration dropped, by reading the old site and
matching each record back onto its new row.

  node scrape-relink.mjs --plan --from-dump dump.sql   match only, no credentials
  node scrape-relink.mjs --plan                        match against the live database
  node scrape-relink.mjs --apply                       upload + relink

  --recipe NAME     which set of records (default staff); 'list' names them
  --replace-all     gallery: replace images even where an editor has filled them in
  --site-base URL   old site (default https://www.cbar.az)
  --from-dump FILE  read the rows from a pg_dump COPY block instead of Postgres
  --concurrency N   parallel transfers (default 4)
  --report FILE     per-record result (default relink-report.json)

--plan needs nothing but network access. --apply needs PG (write) and MinIO from .env.`);
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

const concurrency = Math.max(1, Number(flags.concurrency) || 4);
const apply = flags.apply;

/* ------------------------------------------------------------------ recipes */

/**
 * A recipe knows four things: which legacy pages carry the records, how to read a record
 * off one of those pages, which columns the images belong in, and how to find the new row
 * each record belongs to.
 *
 * `key` is what the two sides are matched on. Matching on text the editors wrote — a
 * person's full name, a banknote's title — rather than on position in the page, because
 * the order of the two differs and a silent off-by-one would attach the wrong image to
 * the wrong record.
 *
 * `columns` maps an image role to the column holding it, so a record with a front and a
 * rear picture is no different in kind from one with a single photo.
 *
 * `detail`, when present, means the list page names the records but not all their images;
 * each record's own page is fetched and read as well.
 */
const RECIPES = {
  staff: {
    label: "organization_staff.photo_media_id",
    pages: ["/organization/management-1", "/organization/management-2"],
    columns: { main: "photo_media_id" },

    // Each staff member is one <a href="/organization/staff/detail/N"> carrying an <img>,
    // a <p> with the full name and a <span> with the position.
    scrape($, page) {
      const out = [];
      $('a[href*="/organization/staff/detail/"]').each((_, el) => {
        const $el = $(el);
        const src = $el.find("img").attr("src");
        const name = $el.find(".man_txt p").first().text().trim();
        if (!src || !name) return;
        out.push({
          key: name,
          images: { main: new URL(src, flags["site-base"]).toString() },
          legacyId: /detail\/(\d+)/.exec($el.attr("href"))?.[1] ?? null,
          position: $el.find(".man_txt span").first().text().trim(),
          page,
        });
      });
      return out;
    },

    // The rows needing a photo, each with the name to match on.
    targets(tables) {
      const staff = rowsOf(tables, "organization_staff");
      const tr = rowsOf(tables, "organization_staff_translations");
      const azByStaff = new Map(tr.filter((t) => t.locale === "az").map((t) => [t.staff_id, t]));
      return staff.map((s) => ({
        table: "organization_staff",
        id: s.id,
        current: { main: s.photo_media_id },
        key: azByStaff.get(s.id)?.full_name ?? null,
      }));
    },
  },

  moneymarks: {
    label: "money_marks.front_media_id / rear_media_id",
    // Banknotes and coins, each across the three categories the site paginates by. The
    // titles are unique across all six, so the category never has to be mapped across.
    pages: [1, 2, 3].flatMap((c) => [
      `/moneymarks/banknotes?category=${c}`,
      `/moneymarks/coins?category=${c}`,
    ]),
    columns: { front: "front_media_id", rear: "rear_media_id" },

    // The list page carries only the front, as a CSS background on .gallery-item.
    scrape($, page) {
      const out = [];
      $(".gallery-item[data-href]").each((_, el) => {
        const $el = $(el);
        const title = $el.find(".caption p").first().text().trim();
        const href = $el.attr("data-href");
        if (!title || !href) return;
        out.push({ key: title, images: {}, detail: href, page });
      });
      return out;
    },

    // The detail page shows both sides inside .money_sides, in document order. The two
    // .side_name labels do not sit next to the image they name — they bracket the pair
    // ("Ön", image, image, "Arxa"), a layout choice rather than a semantic one — so the
    // order is what carries the meaning here. Banknotes wrap each image in .side_img and
    // coins in .side_img_coin, so the images are read directly.
    //
    // The bracketing labels are still checked: if a page ever stops matching that shape,
    // it is reported rather than silently assigned front-to-rear the wrong way round.
    detail($) {
      const $box = $(".money_sides").first();
      const labels = $box.find(".side_name").map((_, el) =>
        $(el).text().trim().toLocaleLowerCase("az")).get();
      const srcs = $box.find("img").map((_, el) => $(el).attr("src")).get().filter(Boolean);

      const shaped = labels.length === 2 && labels[0].startsWith("ön") && labels[1].startsWith("arxa");
      if (!shaped && srcs.length > 1) {
        return { images: {}, warning: `unexpected side labels: ${labels.join(" | ") || "none"}` };
      }

      const images = {};
      if (srcs[0]) images.front = new URL(srcs[0], flags["site-base"]).toString();
      if (srcs[1]) images.rear = new URL(srcs[1], flags["site-base"]).toString();
      return { images };
    },

    targets(tables) {
      const marks = rowsOf(tables, "money_marks").filter((m) => m.deleted_at === null);
      const tr = rowsOf(tables, "money_mark_translations");
      const azByMark = new Map(tr.filter((t) => t.locale === "az").map((t) => [t.money_mark_id, t]));
      return marks.map((m) => ({
        table: "money_marks",
        id: m.id,
        current: { front: m.front_media_id, rear: m.rear_media_id },
        key: azByMark.get(m.id)?.title ?? null,
      }));
    },
  },

  divisions: {
    label: "organization_divisions.media_id",
    pages: ["/organization/divisions"],
    columns: { main: "media_id" },

    // Despite the column name, what hangs off a division is not a picture but its
    // "Əsasnamə" — the regulation PDF, linked from inside the accordion panel whose title
    // names the department.
    scrape($, page) {
      const out = [];
      $(".accordion__item").each((_, el) => {
        const $el = $(el);
        const name = $el.find(".accordion__title h2").first().text().trim();
        const href = $el.find('a[href*="/organization/"]').first().attr("href");
        if (!name || !href) return;
        out.push({ key: name, images: { main: new URL(href, flags["site-base"]).toString() }, page });
      });
      return out;
    },

    targets(tables) {
      const divisions = rowsOf(tables, "organization_divisions");
      const tr = rowsOf(tables, "organization_division_translations");
      const azById = new Map(tr.filter((t) => t.locale === "az").map((t) => [t.division_id, t]));
      return divisions.map((d) => ({
        table: "organization_divisions",
        id: d.id,
        current: { main: d.media_id },
        key: azById.get(d.id)?.name ?? null,
      }));
    },
  },

  gallery: {
    label: "gallery_images (gallery_id → media_id)",
    pages: ["/gallery/photos"],

    // The only recipe that does not set a column on the matched row. A gallery owns a
    // list of images, and the migration brought the galleries but not their photos — so
    // the child rows have to be created, not repointed.
    collection: {
      childTable: "gallery_images",
      parentColumn: "gallery_id",
      mediaColumn: "media_id",
      orderColumn: "sort_order",
      // An existing child is safe to discard only if it points at one of the stand-ins the
      // migration left behind. A gallery holding anything else was filled in by hand after
      // the migration, and replacing it would destroy that work — so it is skipped unless
      // --replace-all says otherwise.
      placeholders: ["mock_placeholder.jpg", "placeholder.png", "test-image-2.png", "1.png", "2.png"],
    },

    // Listing page: same shape as the money-marks grid, a tile per gallery.
    //
    // The title alone is not unique here — the bank visits the same memorial every year,
    // so several galleries share a title word for word and differ only by date. Matching on
    // the title alone gave two different rows the same gallery. So the date the tile shows
    // joins the key, and the bare title stays as a fallback for the rows that carry none.
    scrape($, page) {
      const out = [];
      $(".gallery-item[data-href]").each((_, el) => {
        const $el = $(el);
        const title = $el.find(".caption p").first().text().trim();
        const href = $el.attr("data-href");
        if (!title || !href) return;
        const shown = $el.find(".caption span").first().text().trim();
        const iso = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(shown);
        out.push({
          key: iso ? `${title} @${iso[3]}-${iso[2]}-${iso[1]}` : title,
          fallbackKey: title,
          images: {},
          detail: href,
          date: shown,
          page,
        });
      });
      return out;
    },

    // Detail page: the full-size photos, each linked from the thumbnail grid. The <a> href
    // is taken rather than the <img> src — on this site they are the same file, but the
    // link is the one that means "the photo", not "a rendering of it".
    photos($) {
      return $(".justified-gallery a[href]").map((_, el) => $(el).attr("href")).get()
        .filter((h) => /\/photo-gallery\//.test(h))
        .map((h) => new URL(h, flags["site-base"]).toString());
    },

    targets(tables) {
      const galleries = rowsOf(tables, "galleries").filter((g) => g.deleted_at === null);
      const tr = rowsOf(tables, "gallery_translations");
      const azById = new Map(tr.filter((t) => t.locale === "az").map((t) => [t.gallery_id, t]));
      const assetName = new Map(rowsOf(tables, "media_assets").map((a) => [String(a.id), a.original_name]));

      const childrenByGallery = new Map();
      for (const img of rowsOf(tables, "gallery_images")) {
        if (!childrenByGallery.has(img.gallery_id)) childrenByGallery.set(img.gallery_id, []);
        childrenByGallery.get(img.gallery_id).push(img);
      }

      return galleries.map((g) => {
        const children = childrenByGallery.get(g.id) ?? [];
        const names = children.map((c) => assetName.get(String(c.media_id)) ?? "?");
        const title = azById.get(g.id)?.title ?? null;
        const day = asDay(g.event_date);
        return {
          table: "galleries",
          id: g.id,
          key: title && day ? `${title} @${day}` : title,
          fallbackKey: title,
          current: { images: children.length, names: [...new Set(names)] },
          // Nothing to lose when the gallery is empty or holds only stand-ins.
          disposable: names.every((n) => RECIPES.gallery.collection.placeholders.includes(n)),
        };
      });
    },
  },
};

// Which tables each recipe reads, so the live-database path fetches only those.
const RECIPE_TABLES = {
  staff: ["organization_staff", "organization_staff_translations"],
  moneymarks: ["money_marks", "money_mark_translations"],
  divisions: ["organization_divisions", "organization_division_translations"],
  gallery: ["galleries", "gallery_translations", "gallery_images", "media_assets"],
};

if (flags.recipe === "list") {
  for (const [name, r] of Object.entries(RECIPES)) console.log(`  ${name.padEnd(10)} → ${r.label}`);
  process.exit(0);
}
const recipe = RECIPES[flags.recipe];
if (!recipe) {
  console.error(`Unknown recipe '${flags.recipe}'. Try --recipe list.`);
  process.exit(2);
}

/* ------------------------------------------------------------------ matching */

/**
 * The two sides spell a name slightly differently — the site collapses whitespace, the
 * database keeps editors' copies marked "(Kopya)" — so both are reduced to a comparable
 * form. Azerbaijani letters are left alone; lowercasing them is enough and transliterating
 * would merge names that genuinely differ.
 */
/**
 * A calendar day as yyyy-mm-dd, from either row source.
 *
 * The dump hands every column back as text, but pg parses a `date` column into a Date at
 * *local* midnight — so toISOString() would report the previous day anywhere east of UTC,
 * Baku included, and quietly match a gallery to the wrong year's visit. The local parts are
 * read instead, which is what the column meant in the first place.
 */
function asDay(value) {
  if (!value) return "";
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-` +
      String(value.getDate()).padStart(2, "0");
  }
  return String(value).slice(0, 10);
}

function normalize(text) {
  return String(text ?? "")
    .replace(/\((?:kopya|copy)\)/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("az");
}

/* ------------------------------------------------------------------ dump reader */

// Shared shape with backfill-media.mjs: every COPY block as {name, columns, rows}.
function tablesFromDump(path) {
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const tables = new Map();
  for (let i = 0; i < lines.length; i++) {
    const m = /^COPY public\.(\w+) \(([^)]*)\) FROM stdin;$/.exec(lines[i]);
    if (!m) continue;
    const columns = m[2].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const unescape = (v) =>
      v === "\\N" ? null : v.replace(/\\(.)/g, (_, c) => ({ t: "\t", n: "\n", r: "\r" })[c] ?? c);
    const rows = [];
    for (let j = i + 1; j < lines.length && lines[j] !== "\\."; j++) {
      if (!lines[j]) continue;
      const values = lines[j].split("\t");
      rows.push(Object.fromEntries(columns.map((c, k) => [c, unescape(values[k] ?? "\\N")])));
    }
    tables.set(m[1], rows);
  }
  return tables;
}

const rowsOf = (tables, name) => tables.get(name) ?? [];

async function tablesFromDb(db, names) {
  const tables = new Map();
  for (const name of names) {
    const { rows } = await db.query(`SELECT * FROM ${name}`);
    tables.set(name, rows);
  }
  return tables;
}

/* ------------------------------------------------------------------ image bytes */

/**
 * Width and height straight out of the file header, so the new rows carry the same
 * dimensions the admin API records on a normal upload. Only PNG and JPEG are read; any
 * other type simply gets nulls rather than a wrong guess.
 */
function dimensions(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0..SOF15, skipping the four that are not start-of-frame.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return { width: null, height: null };
}

// Not every recipe moves pictures: a division's "image" is its regulation PDF.
const MIME = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
  ".pdf": "application/pdf", ".doc": "application/msword", ".xls": "application/vnd.ms-excel",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

/* ------------------------------------------------------------------ MinIO */

let minio;
let bucket;

function connectMinio() {
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
    ...(process.env.MINIO_REGION ? { region: process.env.MINIO_REGION } : {}),
  });
  bucket = env("MINIO_BUCKET");
}

/**
 * Stores the image and returns the media_assets row to point at, creating one only if the
 * bytes are new. The admin panel finds duplicates with a query that expects a single row
 * per checksum, so an identical image must reuse the existing asset rather than add a
 * second — and several staff members legitimately share one photo.
 */
async function ensureAsset(db, image, bytes, entry) {
  const checksum = createHash("sha256").update(bytes).digest("hex");

  const existing = await db.query(
    "SELECT id FROM media_assets WHERE checksum_sha256 = $1 AND deleted_at IS NULL LIMIT 1",
    [checksum],
  );
  if (existing.rowCount > 0) {
    entry.reusedAsset = Number(existing.rows[0].id);
    return entry.reusedAsset;
  }

  const name = decodeURIComponent(new URL(image).pathname.split("/").pop());
  const ext = extname(name).toLowerCase();
  const mimeType = MIME[ext] ?? "application/octet-stream";
  // Same key shape the admin API generates on upload (MediaController), so these rows are
  // indistinguishable from a normal one afterwards.
  const stamp = new Date().toISOString().slice(0, 7).replace("-", "/");
  const key = `${stamp}/${checksum.slice(0, 16)}${ext}`;
  const { width, height } = dimensions(bytes);

  await minio.putObject(bucket, key, bytes, bytes.length, { "Content-Type": mimeType });

  const inserted = await db.query(
    `INSERT INTO media_assets
       (storage_key, original_name, mime_type, size_bytes, width, height, checksum_sha256, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 1)
     RETURNING id`,
    [key, name, mimeType, bytes.length, width, height, checksum],
  );
  entry.createdAsset = Number(inserted.rows[0].id);
  entry.key = key;
  entry.dimensions = width ? `${width}×${height}` : null;
  return entry.createdAsset;
}

/**
 * Replaces one row's child images with the set the old site shows for it.
 *
 * Every photo is uploaded first and only then are the rows swapped, inside a transaction:
 * a gallery that loses its stand-in but does not gain its photos would look worse than one
 * left untouched, and a half-finished run must not leave that behind.
 */
async function relinkCollection(db, target, entry) {
  const { childTable, parentColumn, mediaColumn, orderColumn } = recipe.collection;

  const mediaIds = [];
  entry.assets = [];
  for (const photo of entry.photos) {
    const res = await fetch(photo, { signal: AbortSignal.timeout(120000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${photo}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const detail = {};
    const mediaId = await ensureAsset(db, photo, bytes, detail);
    mediaIds.push(mediaId);
    entry.assets.push({ mediaId, bytes: bytes.length, ...detail });
  }

  await db.query("BEGIN");
  try {
    const removed = await db.query(
      `DELETE FROM ${childTable} WHERE ${parentColumn} = $1`, [target.id],
    );
    // One statement rather than a row at a time, so the new set either lands whole or not
    // at all even if the connection drops mid-way.
    const values = mediaIds.map((_, i) => `($1, $${i + 2}, ${i + 1})`).join(", ");
    await db.query(
      `INSERT INTO ${childTable} (${parentColumn}, ${mediaColumn}, ${orderColumn}) VALUES ${values}`,
      [target.id, ...mediaIds],
    );
    await db.query("COMMIT");
    entry.removed = removed.rowCount;
    entry.inserted = mediaIds.length;
    entry.status = "relinked";
  } catch (err) {
    await db.query("ROLLBACK");
    throw err;
  }
}

/* ------------------------------------------------------------------ main */

async function main() {
  const needsDb = apply || !flags["from-dump"];
  let db;
  if (needsDb) {
    db = new pg.Client({ connectionString: env("PG") });
    await db.connect();
  }
  if (apply) connectMinio();

  // Scrape first: with no match there is nothing to ask the database for.
  const scraped = [];
  for (const path of recipe.pages) {
    const url = new URL(path, flags["site-base"]).toString();
    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) {
      console.error(`  ${url} → HTTP ${res.status}, skipped`);
      continue;
    }
    const found = recipe.scrape(cheerio.load(await res.text()), path);
    console.log(`  ${path.padEnd(34)} ${found.length} record(s)`);
    scraped.push(...found);
  }

  // Second pass for recipes whose list page names the records but not every image.
  // A collection recipe only needs the detail pages of records it will actually use, and
  // the old site has far more galleries than the migration brought across — so the pages
  // are narrowed to the matched ones once the database has been read.
  const needsDetail = recipe.detail || recipe.photos;
  const fetchDetails = async (records) => {
    let cursor = 0;
    let done = 0;
    await Promise.all(Array.from({ length: concurrency }, async () => {
      while (cursor < records.length) {
        const record = records[cursor++];
        const url = new URL(record.detail, flags["site-base"]).toString();
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const $ = cheerio.load(await res.text());
          if (recipe.photos) {
            record.photos = recipe.photos($, record);
          } else {
            const extra = recipe.detail($, record);
            Object.assign(record.images, extra.images);
            if (extra.warning) record.detailError = extra.warning;
          }
        } catch (err) {
          record.detailError = String(err.message ?? err);
        }
        process.stdout.write(`\r  detail pages ${++done}/${records.length}`);
      }
    }));
    process.stdout.write("\n");
  };

  if (needsDetail && !recipe.collection) await fetchDetails(scraped.filter((s) => s.detail));

  const tables = flags["from-dump"]
    ? tablesFromDump(flags["from-dump"])
    : await tablesFromDb(db, RECIPE_TABLES[flags.recipe]);

  const targets = recipe.targets(tables);
  const byKey = new Map();
  // Second index on the looser key, with its collisions counted: a fallback is only safe
  // where exactly one record answers to it. Two galleries sharing a title must not both
  // collapse onto whichever one came first.
  const byFallback = new Map();
  for (const s of scraped) {
    const k = normalize(s.key);
    // First page wins: management-1 carries the board, management-2 repeats some of them.
    if (!byKey.has(k)) byKey.set(k, s);
    if (s.fallbackKey) {
      const f = normalize(s.fallbackKey);
      byFallback.set(f, byFallback.has(f) ? "ambiguous" : s);
    }
  }

  const lookup = (t) => {
    if (!t.key) return null;
    const exact = byKey.get(normalize(t.key));
    if (exact) return exact;
    if (!t.fallbackKey) return null;
    const loose = byFallback.get(normalize(t.fallbackKey));
    return loose && loose !== "ambiguous" ? loose : null;
  };

  console.log(
    `\n${scraped.length} scraped | ${targets.length} rows in ${recipe.label} | ` +
      `${apply ? "APPLY (upload + relink)" : "PLAN (nothing written)"}\n`,
  );

  const report = [];
  const queue = [];

  // Pair each row with its record first; the collection path then fetches only the detail
  // pages those pairs actually point at.
  const pairs = [];
  for (const t of targets) {
    const entry = { table: t.table, id: t.id, key: t.key, current: t.current };
    const hit = lookup(t);
    if (!t.key) entry.status = "no-key";
    else if (!hit) entry.status = "unmatched";
    else pairs.push({ t, hit, entry });
    report.push(entry);
  }

  if (recipe.collection) {
    const { placeholders } = recipe.collection;
    // Galleries an editor has already filled in are left alone: replacing a collection
    // means deleting what is there, and that is only safe for rows still holding the
    // migration's stand-ins.
    const usable = pairs.filter(({ t, entry }) => {
      if (t.disposable || flags["replace-all"]) return true;
      entry.status = "has-content";
      entry.note = `holds ${entry.current.images} image(s) that are not placeholders (${entry.current.names.join(", ")})`;
      return false;
    });

    await fetchDetails(usable.map(({ hit }) => hit).filter((h) => h.detail));

    for (const { t, hit, entry } of usable) {
      entry.photos = hit.photos ?? [];
      entry.legacyPage = hit.detail;
      if (hit.detailError) entry.detailError = hit.detailError;
      if (entry.photos.length === 0) entry.status = "no-image";
      else {
        entry.status = "matched";
        queue.push({ target: t, hit, entry });
      }
    }

    console.log(
      `  placeholder-only: ${usable.length} | already filled in: ${pairs.length - usable.length}` +
        (flags["replace-all"] ? " (ignored, --replace-all)" : "") +
        ` | discardable stand-ins: ${placeholders.join(", ")}\n`,
    );
  } else {
    const roles = Object.keys(recipe.columns);
    for (const { t, hit, entry } of pairs) {
      entry.images = Object.fromEntries(roles.filter((r) => hit.images[r]).map((r) => [r, hit.images[r]]));
      entry.legacyId = hit.legacyId ?? null;
      if (hit.detailError) entry.detailError = hit.detailError;
      // A record found on the site but with none of its images readable is a scrape
      // problem, not a missing record, and is worth separating from "unmatched".
      if (Object.keys(entry.images).length === 0) entry.status = "no-image";
      else {
        entry.status = "matched";
        if (Object.keys(entry.images).length < roles.length) entry.partial = true;
        queue.push({ target: t, hit, entry });
      }
    }
  }

  if (apply) {
    let cursor = 0;
    let done = 0;
    // A collection replacement wraps its writes in a transaction, and all workers share
    // one pg client — running two at once would put one worker's statements inside the
    // other's BEGIN. So that path goes one record at a time.
    const workers = recipe.collection ? 1 : concurrency;
    await Promise.all(Array.from({ length: workers }, async () => {
      while (cursor < queue.length) {
        const { target, entry } = queue[cursor++];
        try {
          if (recipe.collection) {
            await relinkCollection(db, target, entry);
            process.stdout.write(`\r  ${++done}/${queue.length}`);
            continue;
          }

          // Every image of this record first, then one UPDATE: a half-written row whose
          // front points at a new asset and whose rear still points at the placeholder is
          // harder to reason about on a re-run than a row left entirely alone.
          const assigned = {};
          for (const [role, image] of Object.entries(entry.images)) {
            const res = await fetch(image, { signal: AbortSignal.timeout(120000) });
            if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${role} image`);
            const bytes = Buffer.from(await res.arrayBuffer());
            const detail = {};
            assigned[role] = await ensureAsset(db, image, bytes, detail);
            entry.assets ??= {};
            entry.assets[role] = { mediaId: assigned[role], bytes: bytes.length, ...detail };
          }

          const cols = Object.keys(assigned);
          await db.query(
            `UPDATE ${target.table}
                SET ${cols.map((r, i) => `${recipe.columns[r]} = $${i + 1}`).join(", ")}
              WHERE id = $${cols.length + 1}`,
            [...cols.map((r) => assigned[r]), target.id],
          );
          entry.status = "relinked";
        } catch (err) {
          entry.status = "error";
          entry.error = String(err.message ?? err);
        }
        process.stdout.write(`\r  ${++done}/${queue.length}`);
      }
    }));
    process.stdout.write("\n\n");
  }

  const counts = report.reduce((acc, e) => ({ ...acc, [e.status]: (acc[e.status] ?? 0) + 1 }), {});
  for (const [status, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status.padEnd(12)} ${n}`);
  }

  const unmatched = report.filter((e) => e.status === "unmatched");
  if (unmatched.length) {
    console.log(`\nNot found on the old site (left untouched):`);
    for (const e of unmatched) console.log(`  ${String(e.id).padStart(4)}  ${e.key}`);
  }

  await writeFile(flags.report, JSON.stringify(report, null, 2));
  console.log(`\nPer-record detail: ${flags.report}`);

  await db?.end();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
