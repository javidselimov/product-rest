# cbar-web-api migrations

Migrations for tables **owned by the web api** (none yet — the whole current
schema is owned by `cbar-admin-api`, see its `db/migrations/`).

All apps share one PostgreSQL database and one `schema_migrations` table keyed
by full filename, so (same rules as the rena project):

1. **Filenames must be globally unique across apps.** Use descriptive,
   app-specific names, e.g. `0003-web-search-log.sql` — never a bare
   `0003-init.sql` that another app might also use.
2. **The admin api migrates first** on a fresh database — web-owned tables may
   FK-reference admin-owned ones, never the other way around.
3. **No `BEGIN`/`COMMIT` inside files** — the runner wraps each file in its own
   transaction.

The runner (`src/Cbar.WebApi/MigrationRunner.cs`) no-ops while this directory
has no `.sql` files. When adding the first migration, set
`ConnectionStrings:Migrations` to a role with DDL rights — the default
`cbar_web_ro` connection is SELECT-only.
