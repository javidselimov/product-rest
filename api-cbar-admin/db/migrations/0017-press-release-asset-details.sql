-- Interviews and speeches (spec 033): most items carry one PDF per language, while Figma shows a
-- single download button, so an attachment needs a language. The legacy site kept this as
-- `filename_az` / `filename_en`, which 0001 did not carry over to press release assets.
--
-- Companion table rather than a press_release_assets column: in shared environments that table
-- may be owned by another role, and ALTER TABLE fails with "must be owner of table" (see 0014).
-- An attachment without a row, or with a null locale, is shown in both languages, so existing
-- rows need no backfill and news and announcements stay as they are.
CREATE TABLE IF NOT EXISTS press_release_asset_details (
    asset_id bigint PRIMARY KEY,
    locale   varchar(5)
);

-- Both FKs need the REFERENCES privilege on tables this role may not own; add them only where
-- that is granted, so the migration never blocks a deploy. Without them
-- PressReleasesController deletes the row with its attachment and checks the locale itself.
DO $$
BEGIN
    IF has_table_privilege('press_release_assets', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_press_release_asset_details_asset_id') THEN
        ALTER TABLE press_release_asset_details
            ADD CONSTRAINT fk_press_release_asset_details_asset_id
            FOREIGN KEY (asset_id) REFERENCES press_release_assets(id) ON DELETE CASCADE;
    END IF;
    IF has_table_privilege('locales', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_press_release_asset_details_locale') THEN
        ALTER TABLE press_release_asset_details
            ADD CONSTRAINT fk_press_release_asset_details_locale
            FOREIGN KEY (locale) REFERENCES locales(code);
    END IF;
END $$;

-- api-cbar reads this table as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON press_release_asset_details TO cbar_web_ro;
    END IF;
END $$;
