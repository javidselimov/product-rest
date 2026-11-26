-- "Show in left menu" (spec 041): an editor can leave a page out of its section's left menu while
-- it stays in the top menu, footer and breadcrumb. The existing `visible` flag drops the page from
-- the whole navigation and lifts its children to the top level, so it cannot do this.
--
-- Companion table rather than a pages column: in shared environments that table may be owned by
-- another role, and ALTER TABLE fails with "must be owner of table" (see 0014, 0017). A page
-- without a row is shown, so existing pages need no backfill; the admin API writes a row only
-- when the flag is turned off, or one already exists.
CREATE TABLE IF NOT EXISTS page_details (
    page_id          integer PRIMARY KEY,
    show_in_side_nav boolean NOT NULL DEFAULT true
);

-- The FK needs the REFERENCES privilege on a table this role may not own; add it only where that
-- is granted, so the migration never blocks a deploy. Pages are soft-deleted, so without it a
-- leftover row is harmless: page ids are never reused.
DO $$
BEGIN
    IF has_table_privilege('pages', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_page_details_page_id') THEN
        ALTER TABLE page_details
            ADD CONSTRAINT fk_page_details_page_id
            FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE;
    END IF;
END $$;

-- api-cbar reads this table as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON page_details TO cbar_web_ro;
    END IF;
END $$;
