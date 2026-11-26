-- Monthly reports (spec 052): the year → month archives of the consumer rights pages — the bank and
-- the insurance complaint index (CMS pages 95, 96) and the infographics (page 93).
--
-- Spec 050 kept these archives as nested accordions in the page text, which editors had to build by
-- hand in both languages. Here a report is one row per series and month, with one file per locale;
-- the site builds the archive from the rows and falls back to the page text for a series without
-- any. A report has no title of its own: the site titles it with the series name and the period.
-- New tables only; nothing that already exists is altered (see 0014 for why). 0035 moves the
-- existing archives into these tables.

-- A fixed list: the series are seeded below and have no write endpoints.
CREATE TABLE IF NOT EXISTS monthly_report_series (
    id            smallserial PRIMARY KEY,
    -- Addresses the series in the APIs, the panel and the site; the same in every environment.
    key           varchar(40) NOT NULL UNIQUE,
    -- A report covers this many months ending with its own month (12 for the insurance index).
    period_months smallint NOT NULL DEFAULT 1 CHECK (period_months BETWEEN 1 AND 12),
    sort_order    smallint NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS monthly_report_series_translations (
    id        serial PRIMARY KEY,
    series_id smallint NOT NULL REFERENCES monthly_report_series(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL,
    name      varchar(300) NOT NULL,
    UNIQUE (series_id, locale)
);

CREATE TABLE IF NOT EXISTS monthly_reports (
    id         serial PRIMARY KEY,
    series_id  smallint NOT NULL REFERENCES monthly_report_series(id),
    year       smallint NOT NULL CHECK (year BETWEEN 2000 AND 2100),
    month      smallint NOT NULL CHECK (month BETWEEN 1 AND 12),
    status     content_status NOT NULL DEFAULT 'draft',
    created_by integer,
    updated_by integer,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);
-- One report per series and month; a deleted one frees its month.
CREATE UNIQUE INDEX IF NOT EXISTS monthly_reports_period_uq
    ON monthly_reports (series_id, year, month) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS monthly_reports_list_idx
    ON monthly_reports (series_id, status, year DESC, month DESC);

-- The file of each locale. A locale without a row has no file and the report does not show in it.
CREATE TABLE IF NOT EXISTS monthly_report_translations (
    id        bigserial PRIMARY KEY,
    report_id integer NOT NULL REFERENCES monthly_reports(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL,
    media_id  bigint NOT NULL,
    UNIQUE (report_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only
-- where it is granted and never block a deploy (see 0017).
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('monthly_reports', 'created_by', 'users', 'id', 'SET NULL'),
            ('monthly_reports', 'updated_by', 'users', 'id', 'SET NULL'),
            ('monthly_report_series_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('monthly_report_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('monthly_report_translations', 'media_id', 'media_assets', 'id', 'NO ACTION')
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
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'monthly_reports_set_updated_at') THEN
        CREATE TRIGGER monthly_reports_set_updated_at BEFORE UPDATE ON monthly_reports
            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    END IF;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON monthly_report_series, monthly_report_series_translations,
                        monthly_reports, monthly_report_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix;
-- admin holds every permission in code. Where this role may not insert the seed is skipped and the
-- API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 052: no INSERT privilege on permissions/role_permissions, monthly report permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('monthly_reports.read', 'Read monthly reports'),
        ('monthly_reports.create', 'Create monthly reports'),
        ('monthly_reports.update', 'Edit monthly reports'),
        ('monthly_reports.delete', 'Delete monthly reports')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('monthly_reports.read', 'monthly_reports.create', 'monthly_reports.update', 'monthly_reports.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;

-- The three series. The az names are the legacy link texts; the en names of the two indices are
-- the legacy en link texts, the infographics one is a draft (there is no en infographics page).
INSERT INTO monthly_report_series (key, period_months, sort_order) VALUES
    ('bank-complaint-index', 1, 10),
    ('insurance-complaint-index', 12, 20),
    ('infographics', 1, 30)
ON CONFLICT (key) DO NOTHING;

INSERT INTO monthly_report_series_translations (series_id, locale, name)
SELECT s.id, v.locale, v.name
FROM (VALUES
    ('bank-complaint-index', 'az', 'Bank müştərilərinin bank xidmətlərindən istifadəsi üzrə şikayət indeksi'),
    ('bank-complaint-index', 'en', 'Complaint index on bank customers'' use of bank services'),
    ('insurance-complaint-index', 'az', 'Avto-icbari sığorta üzrə şikayət indeksi'),
    ('insurance-complaint-index', 'en', 'Complaint index on compulsory MTPL insurance'),
    ('infographics', 'az', 'Azərbaycan Respublikasının Mərkəzi Bankına daxil olan müraciətlərə dair statistik hesabat'),
    ('infographics', 'en', 'Statistical report on appeals received by the Central Bank of the Republic of Azerbaijan')
) AS v(key, locale, name)
JOIN monthly_report_series s ON s.key = v.key
ON CONFLICT (series_id, locale) DO NOTHING;
