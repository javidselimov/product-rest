ALTER TABLE currencies ADD COLUMN IF NOT EXISTS show_on_homepage boolean NOT NULL DEFAULT false;
UPDATE currencies SET show_on_homepage = false;
UPDATE currencies SET show_on_homepage = true WHERE code IN ('USD','EUR','RUB','TRY');
