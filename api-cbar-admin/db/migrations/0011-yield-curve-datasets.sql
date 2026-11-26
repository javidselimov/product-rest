-- Yield curve as the legacy admin kept it (product-host/admin/controllers/YieldCurveController.php):
-- three independent datasets keyed by date, each imported from its own .xlsx and deleted by date
-- on its own — curve points (YCYields), Nelson–Siegel parameters (YCParams) and the seven
-- standard-tenor yields (YCPeriods), which 0001's single `yield_curves` aggregate had dropped.
--
-- Existing data is copied over: points whose period is a whole number of days (the legacy
-- format; anything else, e.g. '3M', has no place in `yc_yields.period`) and every parameter set.
--
-- The old tables stay until api-cbar reads the new ones in every environment (it is deployed
-- after api-cbar-admin); a later migration drops `yield_curve_yields`, `yield_curve_parameters`
-- and `yield_curves`.
CREATE TABLE IF NOT EXISTS yc_yields (
    id         bigserial PRIMARY KEY,
    curve_date date NOT NULL,
    period     integer NOT NULL CHECK (period BETWEEN 1 AND 32767),   -- tenor in days
    yield      numeric(8,4) NOT NULL,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (curve_date, period)
);

CREATE TABLE IF NOT EXISTS yc_parameters (
    id         serial PRIMARY KEY,
    curve_date date NOT NULL UNIQUE,
    beta0      numeric(12,6) NOT NULL,
    beta1      numeric(12,6) NOT NULL,
    beta2      numeric(12,6) NOT NULL,
    lambda     numeric(12,6) NOT NULL,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS yc_periods (
    id          serial PRIMARY KEY,
    curve_date  date NOT NULL UNIQUE,
    three_month numeric(8,4) NOT NULL,
    six_month   numeric(8,4) NOT NULL,
    nine_month  numeric(8,4) NOT NULL,
    one_year    numeric(8,4) NOT NULL,
    two_year    numeric(8,4) NOT NULL,
    three_year  numeric(8,4) NOT NULL,
    four_year   numeric(8,4) NOT NULL,
    created_by  integer REFERENCES users(id) ON DELETE SET NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO yc_yields (curve_date, period, yield, created_by, created_at)
SELECT c.curve_date, CASE WHEN y.period ~ '^[0-9]{1,5}$' THEN y.period::integer END, y.yield, c.created_by, c.updated_at
FROM yield_curve_yields y
JOIN yield_curves c ON c.id = y.curve_id
-- CASE, not AND: PostgreSQL may evaluate the cast before the pattern test.
WHERE CASE WHEN y.period ~ '^[0-9]{1,5}$' THEN y.period::integer END BETWEEN 1 AND 32767
ON CONFLICT (curve_date, period) DO NOTHING;

INSERT INTO yc_parameters (curve_date, beta0, beta1, beta2, lambda, created_by, created_at, updated_at)
SELECT c.curve_date, p.beta0, p.beta1, p.beta2, p.lambda, c.created_by, c.created_at, c.updated_at
FROM yield_curve_parameters p
JOIN yield_curves c ON c.id = p.curve_id
ON CONFLICT (curve_date) DO NOTHING;

-- Default privileges cover this where the migrating role owns the schema; grant
-- explicitly for environments where the table owner differs.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON yc_yields, yc_parameters, yc_periods TO cbar_web_ro;
    END IF;
END $$;
