// Builds product-rest/api-cbar-admin/db/migrations/0046-statistics-section-seed.sql from tree.json and file-groups.json
// (spec 061 research R9–R11, contracts/seed-contract.md Q0–Q10). Edit the JSON files, not the SQL.
//
//   node specs/061-statistics-redesign/seed/build-seed.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../../..')
const out = join(root, 'product-rest/api-cbar-admin/db/migrations/0046-statistics-section-seed.sql')
const tree = JSON.parse(readFileSync(join(here, 'tree.json'), 'utf8'))
const files = JSON.parse(readFileSync(join(here, 'file-groups.json'), 'utf8'))

const q = (s) => `'${String(s).replace(/'/g, "''")}'`
const arr = (list) => `ARRAY[${list.map(q).join(', ')}]::text[]`
const DATE_SUFFIX = String.raw`\s*\(\d{2}\.\d{2}\.\d{4}\)\s*$`
/** The az file title without its trailing "(dd.mm.yyyy)", the key the files are matched by. */
const bare = (col) => `btrim(regexp_replace(${col}, ${q(DATE_SUFFIX)}, ''))`

const newPage = (p) => `    IF NOT EXISTS (
        SELECT FROM pages c JOIN page_translations t ON t.page_id = c.id
        WHERE c.parent_id = root_id AND c.deleted_at IS NULL
          AND ((t.locale = 'az' AND (t.slug = ${q(p.az.slug)} OR t.title = ${q(p.az.title)})) OR (t.locale = 'en' AND t.slug = ${q(p.en.slug)}))
    ) THEN
        IF EXISTS (SELECT FROM page_translations WHERE (locale = 'az' AND slug = ${q(p.az.slug)}) OR (locale = 'en' AND slug = ${q(p.en.slug)})) THEN
            RAISE NOTICE 'spec 061: slug ${p.az.slug} / ${p.en.slug} is taken by another page, page not created';
        ELSE
            SELECT coalesce(max(sort_order), 0) + 10 INTO next_sort FROM pages WHERE parent_id = root_id;
            INSERT INTO pages (parent_id, path, sort_order, status) VALUES (root_id, root_path, next_sort, 'published')
            RETURNING id INTO new_id;
            UPDATE pages SET path = root_path || text2ltree(new_id::text) WHERE id = new_id;
            INSERT INTO page_translations (page_id, locale, title, slug, content) VALUES
                (new_id, 'az', ${q(p.az.title)}, ${q(p.az.slug)}, ''),
                (new_id, 'en', ${q(p.en.title)}, ${q(p.en.slug)}, '');
            created := created + 1;
        END IF;
    END IF;`

function filePage(slug, page) {
  const values = page.files.map((f, i) => `            (${i + 1}, ${q(f.legacy)}, ${q(f.figma)}, ${q(f.group)})`).join(',\n')
  const fileRows = `(VALUES\n${values}\n        ) AS f (seq, legacy, figma, grp)`
  // The page's files matched to the list; a legacy title two files share is left alone.
  const matches = `WITH f (seq, legacy, figma, grp) AS (VALUES\n${values}\n        ),
        m AS (
            SELECT a.id AS asset_id, t.id AS tr_id, f.legacy, f.figma, f.grp, coalesce(substring(t.title from ${q(DATE_SUFFIX)}), '') AS suffix
            FROM page_assets a
            JOIN page_asset_translations t ON t.page_asset_id = a.id AND t.locale = 'az'
            JOIN f ON ${bare('t.title')} = f.legacy
            WHERE a.page_id = pid
        ),
        u AS (SELECT * FROM m WHERE (SELECT count(*) FROM m x WHERE x.legacy = m.legacy) = 1)`
  const reorder = page.reorder
    ? `
        -- Q7.3 first, while the titles are still the legacy ones: only while every file of the page is in the legacy order.
        SELECT coalesce(array_agg(${bare('t.title')} ORDER BY a.sort_order, a.id), ARRAY[]::text[]) INTO titles
        FROM page_assets a LEFT JOIN page_asset_translations t ON t.page_asset_id = a.id AND t.locale = 'az'
        WHERE a.page_id = pid;
        IF titles = ${arr(page.legacyOrder)} THEN
            UPDATE page_assets a SET sort_order = f.seq * 10
            FROM page_asset_translations t, ${fileRows}
            WHERE a.page_id = pid AND t.page_asset_id = a.id AND t.locale = 'az'
              AND ${bare('t.title')} = f.legacy AND a.sort_order IS DISTINCT FROM f.seq * 10;
            GET DIAGNOSTICS changed = ROW_COUNT;
            RAISE NOTICE 'spec 061: ${slug}: % files put in the Figma order', changed;
        ELSE
            RAISE NOTICE 'spec 061: ${slug}: the files are not in the legacy order, their order is left as it is';
        END IF;
`
    : ''
  return `
    -- Q7: ${slug}.
    pid := NULL;
    SELECT p.id INTO pid FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az' AND t.slug = ${q(slug)}
    WHERE p.parent_id = root_id AND p.deleted_at IS NULL;
    IF pid IS NULL THEN
        RAISE NOTICE 'spec 061: page ${slug} not found under the root, its files skipped';
    ELSE${reorder}
        -- Q7.1 Groups, only where the file has none.
        ${matches}
        UPDATE page_assets a SET group_label = u.grp
        FROM u
        WHERE a.id = u.asset_id AND (a.group_label IS NULL OR btrim(a.group_label) = '');
        GET DIAGNOSTICS changed = ROW_COUNT;
        RAISE NOTICE 'spec 061: ${slug}: % file groups written', changed;

        -- Q7.2 Figma titles, only over the legacy title; the trailing date stays.
        ${matches}
        UPDATE page_asset_translations t SET title = u.figma || u.suffix
        FROM u
        WHERE t.id = u.tr_id AND u.legacy <> u.figma AND ${bare('t.title')} = u.legacy;
        GET DIAGNOSTICS changed = ROW_COUNT;
        RAISE NOTICE 'spec 061: ${slug}: % file titles written', changed;
    END IF;`
}

const sql = `-- Statistika (spec 061, research R9–R11): the section as in Figma ("cbar website" → "Statistics"). Generated by
-- specs/061-statistics-redesign/seed/build-seed.mjs from tree.json and file-groups.json — edit those, not this file.
-- The rules are specs/061-statistics-redesign/contracts/seed-contract.md (Q0–Q10). In short, no row is removed, no table
-- is altered or created, no slug (address) changes, and every write first checks that the row still holds the legacy
-- import's value, so an editor's change stands and a second run changes nothing:
--
-- Q3 "Metodologiya" and "Məlumatların reviziyası siyasəti" are created, empty, only while the root has no such page and
--    their slugs are free.
-- Q4 The root's children take the Figma order only while the root holds exactly the legacy pages in the legacy order.
-- Q5 Figma titles (az, and the en titles of the Figma en menu), only over the legacy titles.
-- Q6 The financial sector page gets its Figma intro only while its text is the credit institutions page's text (the
--    legacy import copied it there; it stays on the credit institutions page).
-- Q7 The macroeconomic, monetary and payment files get their Figma group, only where they have none; eight az file titles
--    their Figma spelling, only over the legacy title (the trailing date stays); the payment files the Figma order, only
--    while every file of the page is in the legacy order. Files are matched by their az title without the trailing date.
-- Q8 The "(Kopya)" draft root leaves every menu, only while it has no menu row; its pages and texts stay.
-- Pages are found by slug: ids differ between environments.
DO $seed$
DECLARE
    root_id    integer;
    root_path  ltree;
    pid        integer;
    new_id     integer;
    known      integer[];
    cur_ids    integer[];
    titles     text[];
    reorder    boolean := false;
    next_sort  integer;
    seq        integer;
    created    integer := 0;
    changed    integer;
    slug_item  text;
    loc        text;
    sl         text;
BEGIN
    -- Q1. In shared environments the tables may belong to another role (see 0028, 0030, 0041).
    IF NOT has_table_privilege('pages', 'INSERT')
       OR NOT has_table_privilege('pages', 'UPDATE')
       OR NOT has_table_privilege('page_translations', 'INSERT')
       OR NOT has_table_privilege('page_translations', 'UPDATE')
       OR NOT has_table_privilege('page_details', 'INSERT')
       OR NOT has_table_privilege('page_assets', 'UPDATE')
       OR NOT has_table_privilege('page_asset_translations', 'UPDATE') THEN
        RAISE WARNING 'spec 061: missing INSERT/UPDATE privileges on the page tables, statistics seed skipped';
        RETURN;
    END IF;

    SELECT p.id, p.path INTO root_id, root_path
    FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az' AND t.slug = ${q(tree.root.az)}
    WHERE p.deleted_at IS NULL AND p.parent_id IS NULL;
    IF root_id IS NULL THEN
        RAISE NOTICE 'spec 061: no statistics section, seed skipped';
        RETURN;
    END IF;

    -- Q4 (check, before Q3 adds pages). The legacy children found by slug under the root, in the legacy order.
    known := ARRAY[]::integer[];
    FOREACH slug_item IN ARRAY ${arr(tree.legacyOrder)}
    LOOP
        loc := CASE WHEN slug_item LIKE 'en:%' THEN 'en' ELSE 'az' END;
        sl := CASE WHEN loc = 'en' THEN substr(slug_item, 4) ELSE slug_item END;
        pid := NULL;
        SELECT p.id INTO pid FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = loc AND t.slug = sl
        WHERE p.parent_id = root_id AND p.deleted_at IS NULL;
        IF pid IS NOT NULL THEN known := known || pid; END IF;
    END LOOP;
    SELECT coalesce(array_agg(id ORDER BY sort_order, id), ARRAY[]::integer[]) INTO cur_ids
    FROM pages WHERE parent_id = root_id AND deleted_at IS NULL;
    reorder := cardinality(known) > 0 AND cur_ids = known;
    IF NOT reorder THEN
        RAISE NOTICE 'spec 061: the root''s children are not the legacy set in the legacy order, their order is left as it is';
    END IF;

    -- Q3. The two new pages.
${tree.newPages.map(newPage).join('\n')}
    RAISE NOTICE 'spec 061: % pages created', created;

    -- Q4 (write). The Figma order, only when the check above passed.
    IF reorder THEN
        seq := 0;
        FOREACH slug_item IN ARRAY ${arr(tree.figmaOrder)}
        LOOP
            loc := CASE WHEN slug_item LIKE 'en:%' THEN 'en' ELSE 'az' END;
            sl := CASE WHEN loc = 'en' THEN substr(slug_item, 4) ELSE slug_item END;
            pid := NULL;
            SELECT p.id INTO pid FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = loc AND t.slug = sl
            WHERE p.parent_id = root_id AND p.deleted_at IS NULL;
            IF pid IS NOT NULL THEN
                seq := seq + 1;
                UPDATE pages SET sort_order = seq * 10 WHERE id = pid AND sort_order IS DISTINCT FROM seq * 10;
            END IF;
        END LOOP;
        RAISE NOTICE 'spec 061: the root''s children put in the Figma order (% pages)', seq;
    END IF;

    -- Q5. Titles, only over the legacy ones.
    UPDATE page_translations t
    SET title = v.title
    FROM (VALUES
${tree.titles.map((t) => `        (${q(t.slug)}, ${q(t.locale)}, ${q(t.old)}, ${q(t.new)})`).join(',\n')}
    ) AS v (az_slug, locale, legacy, title)
    JOIN page_translations az ON az.locale = 'az' AND az.slug = v.az_slug
    JOIN pages p ON p.id = az.page_id AND p.deleted_at IS NULL AND p.path <@ root_path
    WHERE t.page_id = az.page_id AND t.locale = v.locale AND t.title = v.legacy;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 061: % titles written', changed;

    -- Q6. The financial sector intro, only over the credit institutions page's copy.
    UPDATE page_translations t
    SET content = v.intro
    FROM (VALUES
        ('az', ${q(tree.financialSectorIntro.az)}),
        ('en', ${q(tree.financialSectorIntro.en)})
    ) AS v (locale, intro)
    JOIN page_translations fs ON fs.locale = 'az' AND fs.slug = ${q(tree.financialSectorIntro.slug)}
    JOIN pages fp ON fp.id = fs.page_id AND fp.parent_id = root_id AND fp.deleted_at IS NULL
    JOIN page_translations ci ON ci.locale = 'az' AND ci.slug = ${q(tree.financialSectorIntro.sameAs)}
    JOIN page_translations cl ON cl.page_id = ci.page_id AND cl.locale = v.locale
    WHERE t.page_id = fs.page_id AND t.locale = v.locale AND coalesce(t.content, '') = coalesce(cl.content, '');
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 061: % financial sector intros written', changed;
${Object.entries(files.pages)
  .map(([slug, page]) => filePage(slug, page))
  .join('\n')}

    -- Q8. The "(Kopya)" draft root leaves the menus, only while it has no menu row.
    INSERT INTO page_details (page_id, show_in_side_nav)
    SELECT t.page_id, false
    FROM page_translations t JOIN pages p ON p.id = t.page_id AND p.parent_id = root_id AND p.deleted_at IS NULL
    WHERE t.locale = 'az' AND t.slug = ${q(tree.draftRoot)}
    ON CONFLICT (page_id) DO NOTHING;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 061: % draft roots left out of the menus', changed;
END
$seed$;
`

writeFileSync(out, sql)
console.log(`written ${out}`)
