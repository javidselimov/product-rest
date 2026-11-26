-- Media size check (spec 054). Files imported from the legacy site carry made-up sizes in
-- media_assets.size_bytes (1064 or 2008/2009 bytes for files of several MB), so every file card
-- showed a wrong size. MediaSizeBackfillService reads the real size from object storage once per
-- file and records here that the row was checked, so a restart does not check it again; uploads
-- record their own row. Companion table rather than a media_assets column (see 0014 for why).
CREATE TABLE IF NOT EXISTS media_asset_details (
    media_id         bigint PRIMARY KEY,
    size_verified_at timestamptz NOT NULL DEFAULT now()
);

-- The FK needs the REFERENCES privilege on a table this role may not own; add it only where that
-- is granted, so the migration never blocks a deploy (see 0017).
DO $$
BEGIN
    IF has_table_privilege('media_assets', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_media_asset_details_media_id') THEN
        ALTER TABLE media_asset_details
            ADD CONSTRAINT fk_media_asset_details_media_id
            FOREIGN KEY (media_id) REFERENCES media_assets(id) ON DELETE CASCADE;
    END IF;
END $$;
-- No grant to cbar_web_ro: the public API does not read this table.
