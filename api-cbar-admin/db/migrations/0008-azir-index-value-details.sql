-- AZIR deal details (spec 021-azir-rates-page, data-model §1): deal volume and count, the
-- last transaction day's min/max rate and the contingency-plan flag shown as `*`. The legacy
-- site kept these as extra text columns and as `LAST MIN RATE` / `LAST MAX RATE` rows.
--
-- A companion table rather than new azir_index_values columns: ALTER TABLE on an existing
-- table fails with "must be owner of table" where another role owns it (as users is), and a
-- new table is always ours. A value without a details row reads as nulls and "not reserve
-- plan", so existing values need no backfill.
CREATE TABLE IF NOT EXISTS azir_index_value_details (
    azir_index_value_id bigint PRIMARY KEY,
    deal_volume         numeric(12,2),
    deal_count          integer,
    min_rate            numeric(8,4),
    max_rate            numeric(8,4),
    is_reserve_plan     boolean NOT NULL DEFAULT false,
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT azir_index_value_details_deal_volume_nonneg CHECK (deal_volume IS NULL OR deal_volume >= 0),
    CONSTRAINT azir_index_value_details_deal_count_nonneg  CHECK (deal_count IS NULL OR deal_count >= 0),
    CONSTRAINT azir_index_value_details_min_rate_nonneg    CHECK (min_rate IS NULL OR min_rate >= 0),
    CONSTRAINT azir_index_value_details_max_rate_nonneg    CHECK (max_rate IS NULL OR max_rate >= 0),
    CONSTRAINT azir_index_value_details_min_le_max
        CHECK (min_rate IS NULL OR max_rate IS NULL OR min_rate <= max_rate)
);

-- The FK needs the REFERENCES privilege on azir_index_values; add it only where that is
-- granted, so the migration never blocks a deploy. Without it AzirController still deletes
-- the details row with its value, and every read starts from azir_index_values, so a
-- leftover row is never shown.
DO $$
BEGIN
    IF has_table_privilege('azir_index_values', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_azir_index_value_details_azir_index_value_id') THEN
        ALTER TABLE azir_index_value_details
            ADD CONSTRAINT fk_azir_index_value_details_azir_index_value_id
            FOREIGN KEY (azir_index_value_id) REFERENCES azir_index_values(id) ON DELETE CASCADE;
    END IF;
END $$;

-- api-cbar reads this table. Default privileges cover it where the migrating role owns the
-- schema; grant explicitly for environments where the table owner differs.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON azir_index_value_details TO cbar_web_ro;
    END IF;
END $$;
