-- Regional office card (Figma `2046:3531`, "Ərazi idarələri"): the legacy site stored a
-- building photo, the head of the office and a regulation document per language
-- (`photo`, `director_name_{az,en}`, `filename_{az,en}`), all of which 0001 dropped.
-- The photo is per office; the head's name and the regulation are per locale, like the
-- legacy columns.
--
-- Companion tables rather than new organization_offices / organization_office_translations
-- columns: in shared environments those tables are owned by another role, and ALTER TABLE
-- fails with "must be owner of table" (this replaces 0013, which did exactly that and never
-- applied there). An office or translation without a details row reads as nulls, so existing
-- rows need no backfill. Media links follow organization_staff.photo_media_id: SET NULL on
-- asset deletion, so removing a file from the library never blocks on an office.
CREATE TABLE IF NOT EXISTS organization_office_details (
    office_id      integer PRIMARY KEY,
    photo_media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS organization_office_translation_details (
    translation_id      bigint PRIMARY KEY,
    director_name       varchar(500),
    regulation_media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL
);

-- The FKs to the office tables need the REFERENCES privilege on tables this role may not
-- own; add them only where that is granted, so the migration never blocks a deploy. Without
-- them OrganizationOfficesController still deletes the details rows with their office or
-- translation, and every read starts from the office tables, so a leftover row is never shown.
DO $$
BEGIN
    IF has_table_privilege('organization_offices', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_organization_office_details_office_id') THEN
        ALTER TABLE organization_office_details
            ADD CONSTRAINT fk_organization_office_details_office_id
            FOREIGN KEY (office_id) REFERENCES organization_offices(id) ON DELETE CASCADE;
    END IF;
    IF has_table_privilege('organization_office_translations', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_organization_office_translation_details_translation_id') THEN
        ALTER TABLE organization_office_translation_details
            ADD CONSTRAINT fk_organization_office_translation_details_translation_id
            FOREIGN KEY (translation_id) REFERENCES organization_office_translations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- api-cbar reads these tables. Default privileges cover them where the migrating role owns
-- the schema; grant explicitly for environments where the table owner differs.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON organization_office_details, organization_office_translation_details TO cbar_web_ro;
    END IF;
END $$;
