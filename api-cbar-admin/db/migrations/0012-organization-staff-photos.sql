-- Press photos of a staff member (Figma `2037:4289`, "Fotoşəkillər" under the biography on the
-- public site): an ordered set of media assets offered for download, separately from the single
-- `photo_media_id` portrait shown in the header card. Modelled like `gallery_images` — a link
-- table managed through `/api/v1/organization/staff/{id}/photos`, media deletion blocked while
-- linked (RESTRICT, same as galleries), links dropped with the member (CASCADE).
CREATE TABLE IF NOT EXISTS organization_staff_photos (
    id         bigserial PRIMARY KEY,
    staff_id   integer NOT NULL REFERENCES organization_staff(id) ON DELETE CASCADE,
    media_id   bigint  NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
    sort_order integer NOT NULL DEFAULT 0,
    UNIQUE (staff_id, media_id)
);

CREATE INDEX IF NOT EXISTS ix_organization_staff_photos_staff
    ON organization_staff_photos (staff_id, sort_order);

-- api-cbar reads it as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON organization_staff_photos TO cbar_web_ro;
    END IF;
END $$;
