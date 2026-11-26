-- Refresh token rotation (spec 005-admin-persistent-session, data-model §1).
-- Every login starts a family; each refresh revokes the presented row and links it
-- to its replacement, so a replayed old token can be detected and the family revoked.
--
-- A new table rather than ALTERing refresh_tokens: in shared environments that table
-- is owned by another role, and ALTER TABLE fails with "must be owner of table".
-- The old refresh_tokens table was never written to and is left untouched.
CREATE TABLE IF NOT EXISTS admin_refresh_tokens (
    id                bigserial PRIMARY KEY,
    user_id           integer NOT NULL,
    token_hash        varchar(255) NOT NULL UNIQUE,
    family_id         uuid NOT NULL,
    family_created_at timestamptz NOT NULL,
    replaced_by_id    bigint REFERENCES admin_refresh_tokens(id) ON DELETE SET NULL,
    expires_at        timestamptz NOT NULL,
    revoked_at        timestamptz,
    ip                inet,
    user_agent        varchar(500),
    created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_admin_refresh_tokens_user_id ON admin_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS ix_admin_refresh_tokens_family_id ON admin_refresh_tokens(family_id);

-- The FK to users needs the REFERENCES privilege on a table this role may not own;
-- add it only where that is granted, so the migration never blocks a deploy.
DO $$
BEGIN
    IF has_table_privilege('users', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_admin_refresh_tokens_user_id') THEN
        ALTER TABLE admin_refresh_tokens
            ADD CONSTRAINT fk_admin_refresh_tokens_user_id
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
