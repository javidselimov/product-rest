BEGIN;

-- ---------------------------------------------------------------------------
-- Interest-rate corridor (info_lines aliases corridor_min/max/percent).
-- Mock values; editable later via the admin info-lines screen.
-- ---------------------------------------------------------------------------
DELETE FROM info_line_translations WHERE info_line_id IN
  (SELECT id FROM info_lines WHERE alias IN ('corridor_min','corridor_max','corridor_percent'));
DELETE FROM info_lines WHERE alias IN ('corridor_min','corridor_max','corridor_percent');

WITH ins AS (
  INSERT INTO info_lines (alias, year, sort_order, is_active, created_at, updated_at)
  VALUES ('corridor_min', 2026, 1, true, now(), now()),
         ('corridor_max', 2026, 2, true, now(), now()),
         ('corridor_percent', 2026, 3, true, now(), now())
  RETURNING id, alias
)
INSERT INTO info_line_translations (info_line_id, locale, title, value)
SELECT id, 'az',
  CASE alias WHEN 'corridor_min' THEN 'Faiz dəhlizinin aşağı həddi'
             WHEN 'corridor_max' THEN 'Faiz dəhlizinin yuxarı həddi'
             ELSE 'Uçot dərəcəsi (refinansirləşdirmə)' END,
  CASE alias WHEN 'corridor_min' THEN '5.5%' WHEN 'corridor_max' THEN '8.5%' ELSE '7.25%' END
FROM ins
UNION ALL
SELECT id, 'en',
  CASE alias WHEN 'corridor_min' THEN 'Floor of the interest rate corridor'
             WHEN 'corridor_max' THEN 'Ceiling of the interest rate corridor'
             ELSE 'Refinancing rate' END,
  CASE alias WHEN 'corridor_min' THEN '5.5%' WHEN 'corridor_max' THEN '8.5%' ELSE '7.25%' END
FROM ins;

-- ---------------------------------------------------------------------------
-- Inflation: 12-month CPI YoY series + a target value (mock).
-- ---------------------------------------------------------------------------
DELETE FROM monthly_inflation_parameters WHERE parameter_code IN ('cpi_yoy','target');
INSERT INTO monthly_inflation_parameters (year, month, parameter_code, value, created_at, updated_at) VALUES
  (2025, 6,'cpi_yoy',5.9,now(),now()),
  (2025, 7,'cpi_yoy',5.7,now(),now()),
  (2025, 8,'cpi_yoy',5.6,now(),now()),
  (2025, 9,'cpi_yoy',5.4,now(),now()),
  (2025,10,'cpi_yoy',5.3,now(),now()),
  (2025,11,'cpi_yoy',5.1,now(),now()),
  (2025,12,'cpi_yoy',5.0,now(),now()),
  (2026, 1,'cpi_yoy',5.2,now(),now()),
  (2026, 2,'cpi_yoy',5.0,now(),now()),
  (2026, 3,'cpi_yoy',4.9,now(),now()),
  (2026, 4,'cpi_yoy',4.9,now(),now()),
  (2026, 5,'cpi_yoy',4.8,now(),now()),
  (2026, 5,'target', 4.0,now(),now());

-- ---------------------------------------------------------------------------
-- AZIR: add compounded terms for the latest date (1D already exists).
-- ---------------------------------------------------------------------------
DELETE FROM azir_index_values WHERE value_date='2026-06-10' AND term IN ('30D','90D','180D');
INSERT INTO azir_index_values (value_date, term, rate, created_at, updated_at) VALUES
  ('2026-06-10','30D',7.15,now(),now()),
  ('2026-06-10','90D',7.05,now(),now()),
  ('2026-06-10','180D',6.95,now(),now());

-- ---------------------------------------------------------------------------
-- Currency rates: add RUB/TRY for the latest sheet + a previous-day sheet
-- (2026-06-09) for all five widget currencies so trend arrows render.
-- ---------------------------------------------------------------------------
DELETE FROM currency_rates WHERE rate_date='2026-06-10' AND currency_code IN ('RUB','TRY');
INSERT INTO currency_rates (rate_date, currency_code, rate, created_at, updated_at) VALUES
  ('2026-06-10','RUB',2.1050,now(),now()),
  ('2026-06-10','TRY',0.0423,now(),now());

DELETE FROM currency_rates WHERE rate_date='2026-06-09' AND currency_code IN ('USD','EUR','GBP','RUB','TRY');
INSERT INTO currency_rates (rate_date, currency_code, rate, created_at, updated_at) VALUES
  ('2026-06-09','USD',1.7000,now(),now()),
  ('2026-06-09','EUR',1.9500,now(),now()),
  ('2026-06-09','GBP',2.2850,now(),now()),
  ('2026-06-09','RUB',2.1100,now(),now()),
  ('2026-06-09','TRY',0.0421,now(),now());

COMMIT;
