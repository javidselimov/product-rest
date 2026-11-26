-- Working papers (spec 054): the research papers of the "Nəşrlər və tədqiqatlar" section.
--
-- On the legacy site every paper was a CMS page of its own and editors linked it by hand from the
-- year accordions of the "İşçi məqalələr silsiləsi" page. Here a paper is one row with typed fields
-- and a translation per locale; the site lists, searches and pages them on that CMS page's address
-- and gives each paper a detail page keyed by number and year (`02-2025`).
-- New tables only; nothing that already exists is altered (see 0014 for why). The legacy papers are
-- moved in by a later seed.

CREATE TABLE IF NOT EXISTS working_papers (
    id             serial PRIMARY KEY,
    -- Position within the year: "02" in "02/2025".
    number         smallint NOT NULL CHECK (number BETWEEN 1 AND 99),
    year           smallint NOT NULL CHECK (year BETWEEN 1990 AND 2100),
    -- The language the paper is written in, not a site locale.
    paper_language varchar(8) NOT NULL DEFAULT 'en' CHECK (paper_language IN ('az', 'en', 'other')),
    jel_codes      text[] NOT NULL DEFAULT '{}',
    -- The legacy site's page id (`page-<id>/…`): provenance, and the key the migration seed skips on.
    legacy_page_id integer,
    status         content_status NOT NULL DEFAULT 'draft',
    created_by     integer,
    updated_by     integer,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz
);
-- One paper per number and year; a deleted one frees its number.
CREATE UNIQUE INDEX IF NOT EXISTS working_papers_number_year_uq
    ON working_papers (number, year) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS working_papers_legacy_page_uq
    ON working_papers (legacy_page_id) WHERE legacy_page_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS working_papers_list_idx
    ON working_papers (status, year DESC, number DESC);

-- A locale shows the paper only when its title is filled (the API checks, not a constraint, so an
-- editor can keep a half-filled draft).
CREATE TABLE IF NOT EXISTS working_paper_translations (
    id       bigserial PRIMARY KEY,
    paper_id integer NOT NULL REFERENCES working_papers(id) ON DELETE CASCADE,
    locale   varchar(5) NOT NULL,
    title    varchar(500),
    authors  text[] NOT NULL DEFAULT '{}',
    abstract text,
    keywords text[] NOT NULL DEFAULT '{}',
    -- The PDF of the locale.
    media_id bigint,
    UNIQUE (paper_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017).
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('working_papers', 'created_by', 'users', 'id', 'SET NULL'),
            ('working_papers', 'updated_by', 'users', 'id', 'SET NULL'),
            ('working_paper_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('working_paper_translations', 'media_id', 'media_assets', 'id', 'SET NULL')
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
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'working_papers_set_updated_at') THEN
        CREATE TRIGGER working_papers_set_updated_at BEFORE UPDATE ON working_papers
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON working_papers, working_paper_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix;
-- admin holds every permission in code. Where this role may not insert the seed is skipped and the
-- API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 054: no INSERT privilege on permissions/role_permissions, working paper permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('working_papers.read', 'Read working papers'),
        ('working_papers.create', 'Create working papers'),
        ('working_papers.update', 'Edit working papers'),
        ('working_papers.delete', 'Delete working papers')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('working_papers.read', 'working_papers.create', 'working_papers.update', 'working_papers.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
