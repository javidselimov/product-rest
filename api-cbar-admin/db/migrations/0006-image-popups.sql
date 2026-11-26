-- Image popups (spec 009): an announcement image shown as a modal on the public
-- site, one image + link + alt text per locale. The public API returns the active
-- popup with the latest activated_at, which is set on create-active and on every
-- inactive -> active switch (plain edits keep it), so re-activating an older popup
-- brings it back to the front.
CREATE TABLE IF NOT EXISTS image_popups (
    id           serial PRIMARY KEY,
    title        varchar(500) NOT NULL,
    is_active    boolean NOT NULL DEFAULT true,
    activated_at timestamptz,
    created_by   integer REFERENCES users(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS image_popups_active_idx
    ON image_popups (is_active, activated_at DESC);

CREATE TABLE IF NOT EXISTS image_popup_translations (
    id       bigserial PRIMARY KEY,
    popup_id integer NOT NULL REFERENCES image_popups(id) ON DELETE CASCADE,
    locale   varchar(5) NOT NULL REFERENCES locales(code),
    media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    link     varchar(1000),
    alt_text varchar(500),
    UNIQUE (popup_id, locale)
);

-- Default privileges cover this where the migrating role owns the schema; grant
-- explicitly for environments where the table owner differs.
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON image_popups, image_popup_translations TO cbar_web_ro;
    END IF;
END $$;
