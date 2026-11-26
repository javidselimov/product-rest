-- Events (spec 034): upcoming and past events with a date range, time, place, type and category.
--
-- A separate content type rather than a press release: api-cbar hides a press release until its
-- publication date, while an event is public before it happens. New tables only; nothing that
-- already exists is altered (see 0014 for why). The legacy events are added by 0019.
CREATE TABLE IF NOT EXISTS event_categories (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_category_translations (
    id          bigserial PRIMARY KEY,
    category_id integer NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL,
    name        varchar(200) NOT NULL,
    UNIQUE (category_id, locale)
);

-- type: 1 decision, 2 press conference, 3 conference, 4 seminar. Null for the legacy anniversaries,
-- which are none of these. start_time is Asia/Baku time.
CREATE TABLE IF NOT EXISTS events (
    id               serial PRIMARY KEY,
    type             smallint CHECK (type BETWEEN 1 AND 4),
    category_id      integer REFERENCES event_categories(id) ON DELETE SET NULL,
    status           content_status NOT NULL DEFAULT 'draft',
    starts_on        date NOT NULL,
    ends_on          date,
    start_time       time,
    gallery_id       integer,
    press_release_id integer,
    page_id          integer,
    created_by       integer,
    updated_by       integer,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),
    deleted_at       timestamptz,
    CHECK (ends_on IS NULL OR ends_on >= starts_on)
);
CREATE INDEX IF NOT EXISTS events_status_starts_idx ON events (status, starts_on);
CREATE INDEX IF NOT EXISTS events_status_ends_idx ON events (status, (COALESCE(ends_on, starts_on)));
CREATE INDEX IF NOT EXISTS events_category_idx ON events (category_id);

CREATE TABLE IF NOT EXISTS event_translations (
    id       bigserial PRIMARY KEY,
    event_id integer NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    locale   varchar(5) NOT NULL,
    title    varchar(500) NOT NULL,
    slug     varchar(500) NOT NULL,
    location varchar(255),
    content  text,
    UNIQUE (event_id, locale),
    UNIQUE (locale, slug)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017). Without them the admin API checks the
-- ids itself and api-cbar treats a dangling link as no link.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('events', 'gallery_id', 'galleries', 'id', 'SET NULL'),
            ('events', 'press_release_id', 'press_releases', 'id', 'SET NULL'),
            ('events', 'page_id', 'pages', 'id', 'SET NULL'),
            ('events', 'created_by', 'users', 'id', 'SET NULL'),
            ('events', 'updated_by', 'users', 'id', 'SET NULL'),
            ('event_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('event_category_translations', 'locale', 'locales', 'code', 'NO ACTION')
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
    FOREACH t IN ARRAY ARRAY['events', 'event_categories'] LOOP
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
        GRANT SELECT ON event_categories, event_category_translations, events, event_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix;
-- admin holds every permission in code. Where this role may not insert the seed is skipped and the
-- API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 034: no INSERT privilege on permissions/role_permissions, events permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('events.read', 'Read events'),
        ('events.create', 'Create events'),
        ('events.update', 'Edit events'),
        ('events.delete', 'Delete events')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('events.read', 'events.create', 'events.update', 'events.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
