-- International financial institutions (spec 044): the organization cards of the page
-- "Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq" (CMS page 121, International Cooperation section).
--
-- A content type of its own rather than markup in the page: each card has a logo, a membership year,
-- a mission box and a list of membership dates, none of which the legacy page stored as data.
-- New tables only; nothing that already exists is altered (see 0014 for why). The organizations from
-- the Figma design are added by 0026.
CREATE TABLE IF NOT EXISTS ifi_organizations (
    id            serial PRIMARY KEY,
    logo_media_id bigint,
    website_url   varchar(500),
    member_since  smallint CHECK (member_since BETWEEN 1900 AND 2100),
    sort_order    integer NOT NULL DEFAULT 0,
    status        content_status NOT NULL DEFAULT 'draft',
    show_az       boolean NOT NULL DEFAULT true,
    show_en       boolean NOT NULL DEFAULT true,
    created_by    integer,
    updated_by    integer,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    deleted_at    timestamptz
);
CREATE INDEX IF NOT EXISTS ifi_organizations_status_sort_idx ON ifi_organizations (status, sort_order);

-- mission fills the "Əsas missiya" box, membership_intro is the bold line above the dates,
-- content is the rich text below them.
CREATE TABLE IF NOT EXISTS ifi_organization_translations (
    id               bigserial PRIMARY KEY,
    organization_id  integer NOT NULL REFERENCES ifi_organizations(id) ON DELETE CASCADE,
    locale           varchar(5) NOT NULL,
    name             varchar(255) NOT NULL,
    mission          text,
    membership_intro varchar(500),
    content          text,
    UNIQUE (organization_id, locale)
);

-- The institutions of a group the country joined, each with its own date (the World Bank Group has five).
CREATE TABLE IF NOT EXISTS ifi_memberships (
    id              bigserial PRIMARY KEY,
    organization_id integer NOT NULL REFERENCES ifi_organizations(id) ON DELETE CASCADE,
    joined_on       date NOT NULL,
    sort_order      integer NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS ifi_memberships_org_sort_idx ON ifi_memberships (organization_id, sort_order);

CREATE TABLE IF NOT EXISTS ifi_membership_translations (
    id            bigserial PRIMARY KEY,
    membership_id bigint NOT NULL REFERENCES ifi_memberships(id) ON DELETE CASCADE,
    locale        varchar(5) NOT NULL,
    name          varchar(255) NOT NULL,
    UNIQUE (membership_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017). Without them the admin API checks the
-- ids itself, and MediaController keeps a logo in use from being deleted.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('ifi_organizations', 'logo_media_id', 'media_assets', 'id', 'SET NULL'),
            ('ifi_organizations', 'created_by', 'users', 'id', 'SET NULL'),
            ('ifi_organizations', 'updated_by', 'users', 'id', 'SET NULL'),
            ('ifi_organization_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('ifi_membership_translations', 'locale', 'locales', 'code', 'NO ACTION')
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
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'ifi_organizations_set_updated_at') THEN
        CREATE TRIGGER ifi_organizations_set_updated_at BEFORE UPDATE ON ifi_organizations
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON ifi_organizations, ifi_organization_translations, ifi_memberships, ifi_membership_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix;
-- admin holds every permission in code. Where this role may not insert the seed is skipped and the
-- API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 044: no INSERT privilege on permissions/role_permissions, ifi permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('ifi.read', 'Read international financial institutions'),
        ('ifi.create', 'Create international financial institutions'),
        ('ifi.update', 'Edit international financial institutions'),
        ('ifi.delete', 'Delete international financial institutions')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('ifi.read', 'ifi.create', 'ifi.update', 'ifi.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
