# Local development credentials

Everything here is **local-development only**. These values are already in the
repo (`docker-compose.yml`, `db/seed.sql`, `appsettings.Development.json`) —
this file just collects them in one place for a new machine.

**None of these may be used in a deployed environment.** Staging and production
must get their own secrets from the vault: the admin password, the JWT signing
key, the database passwords and the MinIO/S3 keys all have to be replaced.

## Admin panel

| | |
|---|---|
| URL | http://localhost:5173 |
| Username | `admin` |
| Password | `ChangeMe123!` |

Seeded by `db/seed.sql` on a fresh database (Development environment only).
Roles that exist out of the box: `admin`, `moderator`, `meas_manager` — only
`admin` may manage users.

## Services (started by `docker compose up -d` in this repo)

| Service | Address | User | Password |
|---|---|---|---|
| PostgreSQL | `localhost:5433`, database `cbar` | `cbar` | `cbar_local_dev` |
| PostgreSQL (read-only, used by cbar-web-api) | same | `cbar_web_ro` | `cbar_web_ro_local_dev` |
| MinIO (S3) | http://localhost:9002, console http://localhost:9003 | `cbar` | `cbar_local_dev` |
| Redis | `localhost:6379` | — | — |
| Meilisearch | http://localhost:7700 | master key | `cbar_local_dev_master_key` |
| Mailpit | SMTP `localhost:1025`, UI http://localhost:8025 | — | — |

Postgres is on 5433 and MinIO on 9002/9003 because 5432 and 9000/9001 are taken
by another local project (rena). The MinIO bucket `cbar-media` is created
automatically on first upload.

Connection string used by the admin API:

```
Host=localhost;Port=5433;Database=cbar;Username=cbar;Password=cbar_local_dev
```

## The four repositories

Clone all four side by side. The GitLab project names differ from the .NET
project names inside them, so the mapping is worth having up front — the
directory you get from `git clone` is the one in the first column.

| Repo (clone directory) | What it is | URL when running |
|---|---|---|
| `api-cbar-admin` | Admin/CMS API — owns the database, migrations and docker-compose | http://localhost:5253 (`/healthz`, `/openapi/v1.json` — not in Production) |
| `api-cbar` | Public read-only API | http://localhost:5139 (`/healthz`) |
| `web-cbar-admin` | Admin panel (React + Vite) | http://localhost:5173 |
| `web-cbar` | Public website (Next.js) | http://localhost:3000 → `/az` |

All four live under
https://gitlab.cbar.az/cbar.az/cbar-new-website.

The frontends default to those API URLs, so no `.env` file is needed. Override
with `VITE_API_URL` (admin panel) or `API_URL` (public site) if you change ports.

## Start order on a new machine

Prerequisites: Docker, the .NET 10 SDK, and Node.

```bash
cd api-cbar-admin
docker compose up -d                        # Postgres, Redis, MinIO, Meili, Mailpit
dotnet run --project src/Cbar.AdminApi      # applies migrations + dev seed

cd ../api-cbar        && dotnet run --project src/Cbar.WebApi
cd ../web-cbar-admin  && npm install && npm run dev
cd ../web-cbar        && npm install && npm run dev
```

The admin API provisions the database on first run: it applies
`db/migrations/*.sql` and, when the database is empty and the environment is
Development, `db/seed.sql` (which also creates the `cbar_web_ro` role). A fresh
database therefore has the schema, the admin login above, and currency
reference data — but no content. Ask for a `pg_dump` if you need the seeded
pages and press releases.

## JWT

`Jwt:SigningKey` in `appsettings.Development.json` is
`local-dev-only-signing-key-change-me-32+chars`. Access tokens last 15 minutes.
Real environments must inject this key from the vault.
