-- banner_translations.description was added ad-hoc to dev databases but never
-- captured in the schema; the web api homepage endpoint selects it.
ALTER TABLE banner_translations ADD COLUMN IF NOT EXISTS description varchar;
