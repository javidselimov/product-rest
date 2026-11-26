-- Information disclosure schedule (spec 039): the table of the Media page "Məlumatların yayımlanması
-- qrafiki" — what the bank publishes, how often and by when.
--
-- On the old site this was a hand-typed table in a CMS page (legacy page 72). It becomes a content type
-- of its own: groups head the table sections, periodicities are a managed list editors pick from, and
-- each item is one row. The decision dates the "according to the schedule" dialog shows are not stored
-- here: they are events of type 1 (spec 034). New tables only; nothing that already exists is altered
-- (see 0014 for why). The existing rows are added by 0023.
CREATE TABLE IF NOT EXISTS release_schedule_groups (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS release_schedule_group_translations (
    id       bigserial PRIMARY KEY,
    group_id integer NOT NULL REFERENCES release_schedule_groups(id) ON DELETE CASCADE,
    locale   varchar(5) NOT NULL,
    name     varchar(300) NOT NULL,
    UNIQUE (group_id, locale)
);

CREATE TABLE IF NOT EXISTS release_schedule_periodicities (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS release_schedule_periodicity_translations (
    id             bigserial PRIMARY KEY,
    periodicity_id integer NOT NULL REFERENCES release_schedule_periodicities(id) ON DELETE CASCADE,
    locale         varchar(5) NOT NULL,
    name           varchar(300) NOT NULL,
    UNIQUE (periodicity_id, locale)
);

-- A group or periodicity in use cannot be removed. Soft-deleted items count: they still hold the row.
-- timing_mode: 1 plain text, 2 link (timing_url), 3 opens the monetary policy decisions dialog.
CREATE TABLE IF NOT EXISTS release_schedule_items (
    id             serial PRIMARY KEY,
    group_id       integer NOT NULL REFERENCES release_schedule_groups(id) ON DELETE RESTRICT,
    periodicity_id integer REFERENCES release_schedule_periodicities(id) ON DELETE RESTRICT,
    timing_mode    smallint NOT NULL DEFAULT 1 CHECK (timing_mode BETWEEN 1 AND 3),
    timing_url     varchar(1000),
    sort_order     integer NOT NULL DEFAULT 0,
    status         content_status NOT NULL DEFAULT 'draft',
    show_az        boolean NOT NULL DEFAULT true,
    show_en        boolean NOT NULL DEFAULT true,
    created_by     integer,
    updated_by     integer,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz,
    CONSTRAINT release_schedule_items_timing_url_check CHECK ((timing_mode = 2) = (timing_url IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS release_schedule_items_status_group_sort_idx
    ON release_schedule_items (status, group_id, sort_order);
CREATE INDEX IF NOT EXISTS release_schedule_items_periodicity_idx ON release_schedule_items (periodicity_id);

CREATE TABLE IF NOT EXISTS release_schedule_item_translations (
    id      bigserial PRIMARY KEY,
    item_id integer NOT NULL REFERENCES release_schedule_items(id) ON DELETE CASCADE,
    locale  varchar(5) NOT NULL,
    title   varchar(500) NOT NULL,
    timing  varchar(500),
    UNIQUE (item_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017).
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('release_schedule_items', 'created_by', 'users', 'id', 'SET NULL'),
            ('release_schedule_items', 'updated_by', 'users', 'id', 'SET NULL'),
            ('release_schedule_item_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('release_schedule_group_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('release_schedule_periodicity_translations', 'locale', 'locales', 'code', 'NO ACTION')
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
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['release_schedule_items', 'release_schedule_groups', 'release_schedule_periodicities'] LOOP
        IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = t || '_set_updated_at') THEN
            EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
                t || '_set_updated_at', t);
        END IF;
    END LOOP;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON release_schedule_groups, release_schedule_group_translations,
            release_schedule_periodicities, release_schedule_periodicity_translations,
            release_schedule_items, release_schedule_item_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix;
-- admin holds every permission in code. Where this role may not insert the seed is skipped and the
-- API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 039: no INSERT privilege on permissions/role_permissions, release_schedule permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('release_schedule.read', 'Read the information disclosure schedule'),
        ('release_schedule.create', 'Create information disclosure schedule entries'),
        ('release_schedule.update', 'Edit information disclosure schedule entries'),
        ('release_schedule.delete', 'Delete information disclosure schedule entries')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('release_schedule.read', 'release_schedule.create',
                                     'release_schedule.update', 'release_schedule.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
