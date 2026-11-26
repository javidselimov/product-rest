-- Memoranda of Understanding (spec 045): the rows of the table on the page
-- "Mərkəzi banklarla əməkdaşlıq" (CMS page 122, International Cooperation section).
--
-- A content type of its own rather than a table in the page text: a memorandum is signed several
-- times a year, the site sorts the rows by year, and the legacy page never held this list.
-- New tables only; nothing that already exists is altered (see 0014 for why). The memorandums from
-- the Figma design are added by 0028.
CREATE TABLE IF NOT EXISTS memorandums (
    id          serial PRIMARY KEY,
    -- Only the year is known for the older memorandums, so the site shows and sorts by year.
    signed_year smallint NOT NULL CHECK (signed_year BETWEEN 1991 AND 2100),
    -- Order among the memorandums of one year.
    sort_order  integer NOT NULL DEFAULT 0,
    status      content_status NOT NULL DEFAULT 'draft',
    show_az     boolean NOT NULL DEFAULT true,
    show_en     boolean NOT NULL DEFAULT true,
    created_by  integer,
    updated_by  integer,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS memorandums_status_year_idx ON memorandums (status, signed_year DESC, sort_order);

-- country is free text: the design abbreviates some ("BƏƏ"), and nothing filters by it.
CREATE TABLE IF NOT EXISTS memorandum_translations (
    id            bigserial PRIMARY KEY,
    memorandum_id integer NOT NULL REFERENCES memorandums(id) ON DELETE CASCADE,
    locale        varchar(5) NOT NULL,
    organization  varchar(500) NOT NULL,
    country       varchar(100) NOT NULL,
    UNIQUE (memorandum_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017).
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('memorandums', 'created_by', 'users', 'id', 'SET NULL'),
            ('memorandums', 'updated_by', 'users', 'id', 'SET NULL'),
            ('memorandum_translations', 'locale', 'locales', 'code', 'NO ACTION')
        ) AS v(tbl, col, ref_table, ref_col, on_delete)
    LOOP
        IF has_table_privilege(fk.ref_table, 'REFERENCES')
           AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = format('fk_%s_%s', fk.tbl, fk.col)) THEN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I(%I) ON DELETE %s',
                fk.tbl, format('fk_%s_%s', fk.tbl, fk.col), fk.col, fk.ref_table, fk.ref_col, fk.on_delete);
        END IF;
    END LOOP;
END $$;

-- Same trigger 0001 puts on every table with updated_at; controllers do not set the column.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'memorandums_set_updated_at') THEN
        CREATE TRIGGER memorandums_set_updated_at BEFORE UPDATE ON memorandums
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON memorandums, memorandum_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix;
-- admin holds every permission in code. Where this role may not insert the seed is skipped and the
-- API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 045: no INSERT privilege on permissions/role_permissions, memorandum permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('memorandums.read', 'Read memoranda of understanding'),
        ('memorandums.create', 'Create memoranda of understanding'),
        ('memorandums.update', 'Edit memoranda of understanding'),
        ('memorandums.delete', 'Delete memoranda of understanding')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('memorandums.read', 'memorandums.create', 'memorandums.update', 'memorandums.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
