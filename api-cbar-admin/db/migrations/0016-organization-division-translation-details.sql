-- Department page (Figma `1003:12461`, "Maliyyə idarəetməsi departamenti"): under the info
-- card the design shows the department's regulation ("Əsasnamə") as a file row, one document
-- per language — the same shape the regional office card got in 0014. The legacy site had no
-- such column for divisions, so there is nothing to backfill.
--
-- Companion table rather than an organization_division_translations column, for the same
-- reason as 0014: in shared environments that table is owned by another role and ALTER TABLE
-- fails with "must be owner of table". A translation without a details row reads as null.
-- The media link follows organization_office_translation_details.regulation_media_id:
-- SET NULL on asset deletion, so removing a file from the library never blocks on a division.
CREATE TABLE IF NOT EXISTS organization_division_translation_details (
    translation_id      bigint PRIMARY KEY,
    regulation_media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL
);

-- The FK to organization_division_translations needs the REFERENCES privilege on a table this
-- role may not own; add it only where that is granted, so the migration never blocks a deploy.
-- Without it OrganizationDivisionsController still deletes the details row with its
-- translation, and every read starts from the division tables, so a leftover row is never shown.
DO $$
BEGIN
    IF has_table_privilege('organization_division_translations', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_organization_division_translation_details_translation_id') THEN
        ALTER TABLE organization_division_translation_details
            ADD CONSTRAINT fk_organization_division_translation_details_translation_id
            FOREIGN KEY (translation_id) REFERENCES organization_division_translations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- api-cbar reads this table as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON organization_division_translation_details TO cbar_web_ro;
    END IF;
END $$;
