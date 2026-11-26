-- Homepage inflation summary, as in the legacy panel ("Aylıq inflyasiya parametrləri"):
-- one row holding the current rate, the target (free text, e.g. "4 (±2)") and the
-- date shown next to the current rate. The monthly series in
-- monthly_inflation_parameters stays and still drives the homepage chart.
--
-- Single row enforced by CHECK (id = 1); the admin API upserts that row.
CREATE TABLE IF NOT EXISTS inflation_settings (
    id                smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    current_inflation numeric(6,2) NOT NULL,
    target_inflation  varchar(255) NOT NULL,
    next_update_date  date NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Default privileges cover this where the migrating role owns the schema; grant
-- explicitly for environments where the table owner differs.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON inflation_settings TO cbar_web_ro;
    END IF;
END $$;
