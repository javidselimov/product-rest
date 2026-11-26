-- Access token revocation (spec 020-access-token-revocation, data-model §1).
-- One row per user holding the security stamp; every access token carries it in the
-- `sst` claim, and a token whose claim no longer matches the row is rejected.
--
-- A new table rather than a users column: in shared environments users is owned by
-- another role, and ALTER TABLE fails with "must be owner of table".
-- Rows are created lazily when a token is issued, so there is no backfill.
CREATE TABLE IF NOT EXISTS admin_user_security_stamps (
    user_id    integer PRIMARY KEY,
    stamp      uuid NOT NULL,
    changed_at timestamptz NOT NULL DEFAULT now()
);

-- The FK to users needs the REFERENCES privilege on a table this role may not own;
-- add it only where that is granted, so the migration never blocks a deploy.
DO $$
BEGIN
    IF has_table_privilege('users', 'REFERENCES')
       AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'fk_admin_user_security_stamps_user_id') THEN
        ALTER TABLE admin_user_security_stamps
            ADD CONSTRAINT fk_admin_user_security_stamps_user_id
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
