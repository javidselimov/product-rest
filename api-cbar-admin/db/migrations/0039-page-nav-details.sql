-- Menu placement of a page, part two (spec 054). Two companion tables, for the same reason as
-- page_details (0024): in shared environments pages and page_translations may be owned by another
-- role, and ALTER TABLE fails with "must be owner of table".

-- "Only in the dropdown menus": page_details.show_in_side_nav = false hides a page from its
-- section's left menu and, below the section root, from the dropdown menus too (spec 048). A page
-- such as "Ödəniş xidmətləri" belongs in the mega menu but not in the left menu, which that one flag
-- cannot say. NULL follows show_in_side_nav, so every existing page keeps its menus; the admin API
-- writes a row only when the value differs from that, or a row already exists.
CREATE TABLE IF NOT EXISTS page_nav_details (
    page_id              integer PRIMARY KEY,
    show_in_dropdown_nav boolean
);

-- Menu group label per locale: siblings with the same label form one group in the dropdown menus.
-- Stored now; the public site shows it with the header redesign (spec 055). Keyed by (page_id,
-- locale), not by the translation id: the admin API deletes the translation of a locale that is
-- left out of an update, and without an FK a translation-id key would leave orphans.
CREATE TABLE IF NOT EXISTS page_translation_details (
    page_id    integer NOT NULL,
    locale     varchar(5) NOT NULL,
    menu_group varchar(120),
    PRIMARY KEY (page_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017). Pages are soft-deleted and their ids
-- are never reused, so without an FK a leftover row is harmless.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('page_nav_details', 'page_id', 'pages', 'id', 'CASCADE'),
            ('page_translation_details', 'page_id', 'pages', 'id', 'CASCADE'),
            ('page_translation_details', 'locale', 'locales', 'code', 'NO ACTION')
        ) AS v(tbl, col, ref_table, ref_col, on_delete)
    LOOP
        IF has_table_privilege(fk.ref_table, 'REFERENCES')
           AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = format('fk_%s_%s', fk.tbl, fk.col)) THEN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I(%I) ON DELETE %s',
                fk.tbl, format('fk_%s_%s', fk.tbl, fk.col), fk.col, fk.ref_table, fk.ref_col, fk.on_delete);
        END IF;
    END LOOP;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON page_nav_details, page_translation_details TO cbar_web_ro;
    END IF;
END $$;
