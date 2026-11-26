-- Homepage "Strategiya və sənədlər" block (spec 057): the documents the block shows, managed in the admin panel.
--
-- Until now the site kept the three documents in code (web-cbar-new views/home/mock.ts). Each document has a title, a short
-- text, a cover and a link per locale, and an optional CMS page the card opens where a locale has no link. The site shows
-- the first three published documents of the locale. The three legacy documents are copied by 0044. New tables only;
-- nothing that already exists is altered (see 0014 for why).

CREATE TABLE IF NOT EXISTS homepage_strategy_docs (
    id          serial PRIMARY KEY,
    page_id     integer,                       -- the card opens this page where a locale has no url
    sort_order  integer NOT NULL DEFAULT 0,
    status      content_status NOT NULL DEFAULT 'draft',
    created_by  integer,
    updated_by  integer,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS homepage_strategy_docs_status_sort_idx ON homepage_strategy_docs (status, sort_order);

-- A locale is stored only with a title. url wins over the page in its locale: http(s)://… or a site path /….
CREATE TABLE IF NOT EXISTS homepage_strategy_doc_translations (
    id              bigserial PRIMARY KEY,
    doc_id          integer NOT NULL REFERENCES homepage_strategy_docs(id) ON DELETE CASCADE,
    locale          varchar(5) NOT NULL,
    title           varchar(300) NOT NULL,
    summary         varchar(500),
    cover_media_id  bigint,
    url             varchar(1000),
    UNIQUE (doc_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only where it is granted
-- and never block a deploy (see 0017). Without them the admin API checks the ids itself.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('homepage_strategy_docs', 'page_id', 'pages', 'id', 'SET NULL'),
            ('homepage_strategy_docs', 'created_by', 'users', 'id', 'SET NULL'),
            ('homepage_strategy_docs', 'updated_by', 'users', 'id', 'SET NULL'),
            ('homepage_strategy_doc_translations', 'cover_media_id', 'media_assets', 'id', 'NO ACTION'),
            ('homepage_strategy_doc_translations', 'locale', 'locales', 'code', 'NO ACTION')
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
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'homepage_strategy_docs_set_updated_at') THEN
        CREATE TRIGGER homepage_strategy_docs_set_updated_at BEFORE UPDATE ON homepage_strategy_docs
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON homepage_strategy_docs, homepage_strategy_doc_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix; admin holds every
-- permission in code. Where this role may not insert, the seed is skipped and the API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 057: no INSERT privilege on permissions/role_permissions, homepage_strategy_docs permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('homepage_strategy_docs.read', 'Read the homepage strategy documents'),
        ('homepage_strategy_docs.create', 'Create homepage strategy documents'),
        ('homepage_strategy_docs.update', 'Edit and reorder the homepage strategy documents'),
        ('homepage_strategy_docs.delete', 'Delete homepage strategy documents')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('homepage_strategy_docs.read', 'homepage_strategy_docs.create',
                                     'homepage_strategy_docs.update', 'homepage_strategy_docs.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
