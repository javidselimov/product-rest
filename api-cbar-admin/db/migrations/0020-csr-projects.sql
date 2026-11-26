-- CSR projects (spec 038): the project cards and dialogs of the corporate social responsibility page.
--
-- A content type of its own rather than markup in the page. Photos are not a gallery, because an
-- active gallery also lists in /media/galleries. Categories are not event categories, because every
-- active one becomes a tab in the events filter. New tables only; nothing that already exists is
-- altered (see 0014 for why). The existing projects are added by 0021.
CREATE TABLE IF NOT EXISTS csr_categories (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS csr_category_translations (
    id          bigserial PRIMARY KEY,
    category_id integer NOT NULL REFERENCES csr_categories(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL,
    name        varchar(200) NOT NULL,
    UNIQUE (category_id, locale)
);

-- A category in use cannot be removed. Soft-deleted projects count: they still hold the row.
CREATE TABLE IF NOT EXISTS csr_projects (
    id             serial PRIMARY KEY,
    category_id    integer NOT NULL REFERENCES csr_categories(id) ON DELETE RESTRICT,
    cover_media_id bigint,
    sort_order     integer NOT NULL DEFAULT 0,
    status         content_status NOT NULL DEFAULT 'draft',
    show_az        boolean NOT NULL DEFAULT true,
    show_en        boolean NOT NULL DEFAULT true,
    created_by     integer,
    updated_by     integer,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz
);
CREATE INDEX IF NOT EXISTS csr_projects_status_sort_idx ON csr_projects (status, sort_order);
CREATE INDEX IF NOT EXISTS csr_projects_category_idx ON csr_projects (category_id);

-- card_title and summary fill the card, title heads the dialog; Figma has both titles.
CREATE TABLE IF NOT EXISTS csr_project_translations (
    id         bigserial PRIMARY KEY,
    project_id integer NOT NULL REFERENCES csr_projects(id) ON DELETE CASCADE,
    locale     varchar(5) NOT NULL,
    card_title varchar(255) NOT NULL,
    summary    varchar(500) NOT NULL,
    title      varchar(500) NOT NULL,
    content    text,
    UNIQUE (project_id, locale)
);

CREATE TABLE IF NOT EXISTS csr_project_images (
    id         bigserial PRIMARY KEY,
    project_id integer NOT NULL REFERENCES csr_projects(id) ON DELETE CASCADE,
    media_id   bigint NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    UNIQUE (project_id, media_id)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017). Without them the admin API checks the
-- ids itself, and MediaController keeps a file in use from being deleted.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('csr_projects', 'cover_media_id', 'media_assets', 'id', 'SET NULL'),
            ('csr_projects', 'created_by', 'users', 'id', 'SET NULL'),
            ('csr_projects', 'updated_by', 'users', 'id', 'SET NULL'),
            ('csr_project_images', 'media_id', 'media_assets', 'id', 'RESTRICT'),
            ('csr_project_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('csr_category_translations', 'locale', 'locales', 'code', 'NO ACTION')
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
    FOREACH t IN ARRAY ARRAY['csr_projects', 'csr_categories'] LOOP
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
        GRANT SELECT ON csr_categories, csr_category_translations, csr_projects, csr_project_translations, csr_project_images TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix;
-- admin holds every permission in code. Where this role may not insert the seed is skipped and the
-- API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 038: no INSERT privilege on permissions/role_permissions, csr permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('csr.read', 'Read CSR projects'),
        ('csr.create', 'Create CSR projects'),
        ('csr.update', 'Edit CSR projects'),
        ('csr.delete', 'Delete CSR projects')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('csr.read', 'csr.create', 'csr.update', 'csr.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
