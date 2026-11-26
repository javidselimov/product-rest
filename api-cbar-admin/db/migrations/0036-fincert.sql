-- FinCERT (spec 053): the FinCERT page as a content type of its own — one settings record (contacts, reporting portal,
-- RFC-2350 document, mission), activity directions and international memberships.
--
-- The legacy site kept the whole page as one CMS page (133, `fincert`) in the editor's markup. The new design shows the
-- parts as separate blocks, and editors asked to change a phone number or add a direction without markup. CMS page 133
-- still gives the title, the address and the fallback text. The legacy content is copied by 0037. New tables only;
-- nothing that already exists is altered (see 0014 for why).

-- Single record: the CHECK keeps it to one row, the admin API upserts id 1.
CREATE TABLE IF NOT EXISTS fincert_settings (
    id          smallint PRIMARY KEY CHECK (id = 1),
    email       varchar(255),
    phone       varchar(64),                  -- as written; the site builds tel: from its digits and '+'
    portal_url  varchar(500),
    updated_by  integer,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

-- rfc_media_id wins over rfc_url on the site; rfc_url carries the legacy file address until the document is uploaded.
CREATE TABLE IF NOT EXISTS fincert_setting_translations (
    id                  bigserial PRIMARY KEY,
    settings_id         smallint NOT NULL REFERENCES fincert_settings(id) ON DELETE CASCADE,
    locale              varchar(5) NOT NULL,
    mission             text,
    portal_title        varchar(255),
    portal_description  varchar(1000),
    rfc_media_id        bigint,
    rfc_url             varchar(500),
    UNIQUE (settings_id, locale)
);

CREATE TABLE IF NOT EXISTS fincert_directions (
    id          serial PRIMARY KEY,
    sort_order  integer NOT NULL DEFAULT 0,
    status      content_status NOT NULL DEFAULT 'draft',
    created_by  integer,
    updated_by  integer,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS fincert_directions_status_sort_idx ON fincert_directions (status, sort_order);

-- body is the rich-text editor's HTML; the site sanitizes it like page content.
CREATE TABLE IF NOT EXISTS fincert_direction_translations (
    id            bigserial PRIMARY KEY,
    direction_id  integer NOT NULL REFERENCES fincert_directions(id) ON DELETE CASCADE,
    locale        varchar(5) NOT NULL,
    title         varchar(500) NOT NULL,
    body          text NOT NULL DEFAULT '',
    UNIQUE (direction_id, locale)
);

CREATE TABLE IF NOT EXISTS fincert_memberships (
    id             serial PRIMARY KEY,
    logo_media_id  bigint,
    url            varchar(500),
    sort_order     integer NOT NULL DEFAULT 0,
    status         content_status NOT NULL DEFAULT 'draft',
    created_by     integer,
    updated_by     integer,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz
);
CREATE INDEX IF NOT EXISTS fincert_memberships_status_sort_idx ON fincert_memberships (status, sort_order);

CREATE TABLE IF NOT EXISTS fincert_membership_translations (
    id             bigserial PRIMARY KEY,
    membership_id  integer NOT NULL REFERENCES fincert_memberships(id) ON DELETE CASCADE,
    locale         varchar(5) NOT NULL,
    name           varchar(255) NOT NULL,
    description    varchar(1000),
    badge          varchar(120),
    UNIQUE (membership_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only where it is granted
-- and never block a deploy (see 0017). Without them the admin API checks the ids itself.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('fincert_settings', 'updated_by', 'users', 'id', 'SET NULL'),
            ('fincert_directions', 'created_by', 'users', 'id', 'SET NULL'),
            ('fincert_directions', 'updated_by', 'users', 'id', 'SET NULL'),
            ('fincert_memberships', 'created_by', 'users', 'id', 'SET NULL'),
            ('fincert_memberships', 'updated_by', 'users', 'id', 'SET NULL'),
            ('fincert_setting_translations', 'rfc_media_id', 'media_assets', 'id', 'NO ACTION'),
            ('fincert_memberships', 'logo_media_id', 'media_assets', 'id', 'NO ACTION'),
            ('fincert_setting_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('fincert_direction_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('fincert_membership_translations', 'locale', 'locales', 'code', 'NO ACTION')
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
DECLARE
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['fincert_settings', 'fincert_directions', 'fincert_memberships'] LOOP
        IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = tbl || '_set_updated_at') THEN
            EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
                tbl || '_set_updated_at', tbl);
        END IF;
    END LOOP;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON fincert_settings, fincert_setting_translations, fincert_directions, fincert_direction_translations,
            fincert_memberships, fincert_membership_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix; admin holds every
-- permission in code. Where this role may not insert, the seed is skipped and the API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 053: no INSERT privilege on permissions/role_permissions, fincert permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('fincert.read', 'Read the FinCERT settings, directions and memberships'),
        ('fincert.create', 'Create FinCERT directions and memberships'),
        ('fincert.update', 'Edit and reorder the FinCERT settings, directions and memberships'),
        ('fincert.delete', 'Delete FinCERT directions and memberships')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('fincert.read', 'fincert.create', 'fincert.update', 'fincert.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
