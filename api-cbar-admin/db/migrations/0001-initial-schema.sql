-- =============================================================================
-- CBAR.az — redesigned database schema (v0.1, Phase 0)
-- Implements reports/02-rewrite-plan.md §3:
--   * per-entity translation tables (no more *_az / *_en column pairs)
--   * real types: numeric for rates/yields, date/timestamptz for time, boolean flags
--   * FKs everywhere with explicit ON DELETE policies
--   * lifecycle: status enum + created_by/updated_by + soft delete (deleted_at)
--   * ltree page hierarchy (replaces nested set + UI-state flags)
--   * central media registry (replaces per-entity filename columns)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published', 'archived');

-- -----------------------------------------------------------------------------
-- Locales
-- -----------------------------------------------------------------------------
CREATE TABLE locales (
    code        varchar(5) PRIMARY KEY,          -- 'az', 'en'
    name        varchar(50) NOT NULL,
    is_default  boolean NOT NULL DEFAULT false,
    is_active   boolean NOT NULL DEFAULT true
);

-- -----------------------------------------------------------------------------
-- Auth: users, roles, permissions, sessions, tokens
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
    id          smallserial PRIMARY KEY,
    code        varchar(50) NOT NULL UNIQUE,      -- 'admin', 'moderator', 'meas_manager'
    name        varchar(100) NOT NULL
);

CREATE TABLE permissions (
    id          serial PRIMARY KEY,
    code        varchar(100) NOT NULL UNIQUE,     -- '<module>.<action>', e.g. 'pages.publish'
    description varchar(255)
);

CREATE TABLE role_permissions (
    role_id       smallint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id integer  NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE users (
    id              serial PRIMARY KEY,
    username        citext NOT NULL UNIQUE,
    email           citext NOT NULL UNIQUE,
    password_hash   varchar(255) NOT NULL,
    role_id         smallint NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    totp_secret     varchar(255),                 -- null until 2FA enrolled
    is_active       boolean NOT NULL DEFAULT true,
    avatar_media_id bigint,                       -- FK added after media_assets
    failed_logins   smallint NOT NULL DEFAULT 0,
    locked_until    timestamptz,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

CREATE TABLE refresh_tokens (
    id          bigserial PRIMARY KEY,
    user_id     integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  varchar(255) NOT NULL UNIQUE,
    expires_at  timestamptz NOT NULL,
    revoked_at  timestamptz,
    ip          inet,
    user_agent  varchar(500),
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE user_sessions (
    id           bigserial PRIMARY KEY,
    user_id      integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_key  varchar(255) NOT NULL UNIQUE,
    ip           inet,
    user_agent   varchar(500),                    -- bound: mismatch revokes session
    created_at   timestamptz NOT NULL DEFAULT now(),
    last_seen_at timestamptz NOT NULL DEFAULT now(),
    revoked_at   timestamptz
);

CREATE TABLE audit_log (
    id          bigserial PRIMARY KEY,
    actor_id    integer REFERENCES users(id) ON DELETE SET NULL,
    action      varchar(100) NOT NULL,            -- 'login.success', 'pages.update', ...
    entity_type varchar(100),
    entity_id   bigint,
    before      jsonb,
    after       jsonb,
    ip          inet,
    user_agent  varchar(500),
    created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_log_entity_idx ON audit_log (entity_type, entity_id);
CREATE INDEX audit_log_actor_idx  ON audit_log (actor_id, created_at);

-- -----------------------------------------------------------------------------
-- Media registry (MinIO/S3-backed)
-- -----------------------------------------------------------------------------
CREATE TABLE media_assets (
    id              bigserial PRIMARY KEY,
    storage_key     varchar(500) NOT NULL UNIQUE, -- S3 object key
    original_name   varchar(255) NOT NULL,
    mime_type       varchar(150) NOT NULL,
    size_bytes      bigint NOT NULL,
    width           integer,                      -- images only
    height          integer,
    checksum_sha256 char(64) NOT NULL,
    created_by      integer REFERENCES users(id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);

ALTER TABLE users
    ADD CONSTRAINT users_avatar_media_fk
    FOREIGN KEY (avatar_media_id) REFERENCES media_assets(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- CMS pages (ltree hierarchy)
-- -----------------------------------------------------------------------------
CREATE TABLE pages (
    id             serial PRIMARY KEY,
    parent_id      integer REFERENCES pages(id) ON DELETE RESTRICT,
    path           ltree NOT NULL,                -- e.g. '1.14.37' (ids root→leaf)
    sort_order     integer NOT NULL DEFAULT 0,
    status         content_status NOT NULL DEFAULT 'draft',
    nav_url        varchar(500),                  -- menu-link override (app route / external URL)
    -- visibility flags (parity with the legacy admin's per-page checkboxes)
    active         boolean NOT NULL DEFAULT true,  -- master switch: off = hidden everywhere
    visible        boolean NOT NULL DEFAULT true,  -- shown in site navigation
    show_az        boolean NOT NULL DEFAULT true,  -- visible on the az site
    show_en        boolean NOT NULL DEFAULT true,  -- visible on the en site
    show_in_footer boolean NOT NULL DEFAULT false,
    -- admin tree behavior flags (legacy parity)
    readonly       boolean NOT NULL DEFAULT false, -- form opens read-only
    disabled       boolean NOT NULL DEFAULT false, -- node not editable
    removable      boolean NOT NULL DEFAULT true,  -- node can be deleted
    removable_all  boolean NOT NULL DEFAULT false, -- node can be deleted with descendants
    movable_u      boolean NOT NULL DEFAULT true,  -- can move up among siblings
    movable_d      boolean NOT NULL DEFAULT true,  -- can move down among siblings
    movable_l      boolean NOT NULL DEFAULT false, -- can move out to parent level
    movable_r      boolean NOT NULL DEFAULT false, -- can move under a sibling
    -- admin tree display state (legacy parity)
    selected       boolean NOT NULL DEFAULT false, -- preselected in the admin tree
    collapsed      boolean NOT NULL DEFAULT false, -- collapsed by default in the admin tree
    created_by     integer REFERENCES users(id) ON DELETE SET NULL,
    updated_by     integer REFERENCES users(id) ON DELETE SET NULL,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz
);
CREATE INDEX pages_path_gist_idx ON pages USING gist (path);
CREATE INDEX pages_parent_idx    ON pages (parent_id, sort_order);

CREATE TABLE page_translations (
    id       bigserial PRIMARY KEY,
    page_id  integer NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    locale   varchar(5) NOT NULL REFERENCES locales(code),
    title    varchar(500) NOT NULL,
    slug     varchar(500) NOT NULL,
    content  text,
    UNIQUE (page_id, locale),
    UNIQUE (locale, slug)
);

CREATE TABLE page_assets (
    id          bigserial PRIMARY KEY,
    page_id     integer NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    media_id    bigint  NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
    sort_order  integer NOT NULL DEFAULT 0,
    group_label varchar(100)                      -- editor-set accordion group (e.g. a year)
);

CREATE TABLE page_asset_translations (
    id            bigserial PRIMARY KEY,
    page_asset_id bigint NOT NULL REFERENCES page_assets(id) ON DELETE CASCADE,
    locale        varchar(5) NOT NULL REFERENCES locales(code),
    title         varchar(500) NOT NULL,
    UNIQUE (page_asset_id, locale)
);

-- -----------------------------------------------------------------------------
-- Press releases (+ surveys)
-- -----------------------------------------------------------------------------
CREATE TABLE press_releases (
    id           serial PRIMARY KEY,
    type         smallint NOT NULL DEFAULT 1,     -- 1 = press release, 2 = other
    status       content_status NOT NULL DEFAULT 'draft',
    published_at timestamptz,
    created_by   integer REFERENCES users(id) ON DELETE SET NULL,
    updated_by   integer REFERENCES users(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);
CREATE INDEX press_releases_pub_idx ON press_releases (status, published_at DESC);

CREATE TABLE press_release_translations (
    id               bigserial PRIMARY KEY,
    press_release_id integer NOT NULL REFERENCES press_releases(id) ON DELETE CASCADE,
    locale           varchar(5) NOT NULL REFERENCES locales(code),
    title            varchar(500) NOT NULL,
    slug             varchar(500) NOT NULL,
    content          text,
    UNIQUE (press_release_id, locale),
    UNIQUE (locale, slug)
);

CREATE TABLE press_release_assets (
    id               bigserial PRIMARY KEY,
    press_release_id integer NOT NULL REFERENCES press_releases(id) ON DELETE CASCADE,
    media_id         bigint  NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
    sort_order       integer NOT NULL DEFAULT 0
);

CREATE TABLE press_release_questions (
    id               serial PRIMARY KEY,
    press_release_id integer NOT NULL REFERENCES press_releases(id) ON DELETE CASCADE,
    sort_order       integer NOT NULL DEFAULT 0,
    is_active        boolean NOT NULL DEFAULT true
);

CREATE TABLE press_release_question_translations (
    id          bigserial PRIMARY KEY,
    question_id integer NOT NULL REFERENCES press_release_questions(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL REFERENCES locales(code),
    question    varchar(1000) NOT NULL,
    UNIQUE (question_id, locale)
);

CREATE TABLE press_release_votes (
    id          bigserial PRIMARY KEY,
    question_id integer NOT NULL REFERENCES press_release_questions(id) ON DELETE CASCADE,
    answer      smallint NOT NULL,                -- scale value
    voter_hash  varchar(64) NOT NULL,             -- cookie/IP hash (dedup)
    created_at  timestamptz NOT NULL DEFAULT now(),
    UNIQUE (question_id, voter_hash)
);

-- -----------------------------------------------------------------------------
-- Currency (normalized — replaces 50-column currency_rates)
-- -----------------------------------------------------------------------------
CREATE TABLE currencies (
    code       char(3) PRIMARY KEY,               -- ISO 4217
    nominal    integer NOT NULL DEFAULT 1,        -- e.g. 100 for JPY
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true
);

CREATE TABLE currency_translations (
    id            bigserial PRIMARY KEY,
    currency_code char(3) NOT NULL REFERENCES currencies(code) ON DELETE CASCADE,
    locale        varchar(5) NOT NULL REFERENCES locales(code),
    name          varchar(150) NOT NULL,
    UNIQUE (currency_code, locale)
);

CREATE TABLE currency_rates (
    id            bigserial PRIMARY KEY,
    rate_date     date NOT NULL,
    currency_code char(3) NOT NULL REFERENCES currencies(code) ON DELETE RESTRICT,
    rate          numeric(12,4) NOT NULL CHECK (rate > 0),
    created_by    integer REFERENCES users(id) ON DELETE SET NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (rate_date, currency_code)
);
CREATE INDEX currency_rates_date_idx ON currency_rates (rate_date DESC);

-- -----------------------------------------------------------------------------
-- AZIR index & inflation
-- -----------------------------------------------------------------------------
CREATE TABLE azir_index_values (
    id         bigserial PRIMARY KEY,
    value_date date NOT NULL,
    term       varchar(10) NOT NULL DEFAULT '1D', -- 1D, 1W, 1M, ...
    rate       numeric(8,4) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (value_date, term)
);

CREATE TABLE monthly_inflation_parameters (
    id             serial PRIMARY KEY,
    year           smallint NOT NULL,
    month          smallint NOT NULL CHECK (month BETWEEN 1 AND 12),
    parameter_code varchar(50) NOT NULL,          -- e.g. 'cpi_yoy', 'cpi_mom'
    value          numeric(10,4) NOT NULL,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (year, month, parameter_code)
);

-- -----------------------------------------------------------------------------
-- Info lines (homepage key indicators, by alias)
-- -----------------------------------------------------------------------------
CREATE TABLE info_lines (
    id         serial PRIMARY KEY,
    alias      varchar(100) NOT NULL,             -- block identifier
    year       smallint,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    updated_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX info_lines_alias_idx ON info_lines (alias, year);

CREATE TABLE info_line_translations (
    id           bigserial PRIMARY KEY,
    info_line_id integer NOT NULL REFERENCES info_lines(id) ON DELETE CASCADE,
    locale       varchar(5) NOT NULL REFERENCES locales(code),
    title        varchar(500) NOT NULL,
    value        varchar(500),
    UNIQUE (info_line_id, locale)
);

-- -----------------------------------------------------------------------------
-- Yield curves (FKs added — orphan risk in legacy schema)
-- -----------------------------------------------------------------------------
CREATE TABLE yield_curves (
    id         serial PRIMARY KEY,
    curve_date date NOT NULL UNIQUE,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE yield_curve_parameters (
    id       serial PRIMARY KEY,
    curve_id integer NOT NULL REFERENCES yield_curves(id) ON DELETE CASCADE,
    beta0    numeric(12,6) NOT NULL,
    beta1    numeric(12,6) NOT NULL,
    beta2    numeric(12,6) NOT NULL,
    lambda   numeric(12,6) NOT NULL,
    UNIQUE (curve_id)
);

CREATE TABLE yield_curve_yields (
    id       bigserial PRIMARY KEY,
    curve_id integer NOT NULL REFERENCES yield_curves(id) ON DELETE CASCADE,
    period   varchar(20) NOT NULL,                -- '3M', '6M', '1Y', ...
    yield    numeric(8,4) NOT NULL,
    UNIQUE (curve_id, period)
);

-- -----------------------------------------------------------------------------
-- Laws
-- -----------------------------------------------------------------------------
CREATE TABLE law_categories (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true
);

CREATE TABLE law_category_translations (
    id          bigserial PRIMARY KEY,
    category_id integer NOT NULL REFERENCES law_categories(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL REFERENCES locales(code),
    name        varchar(500) NOT NULL,
    UNIQUE (category_id, locale)
);

CREATE TABLE laws (
    id           serial PRIMARY KEY,
    category_id  integer NOT NULL REFERENCES law_categories(id) ON DELETE RESTRICT,
    type         smallint NOT NULL DEFAULT 1,     -- 1 = law, 2 = regulation
    status       content_status NOT NULL DEFAULT 'draft',
    published_at timestamptz,
    created_by   integer REFERENCES users(id) ON DELETE SET NULL,
    updated_by   integer REFERENCES users(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);

CREATE TABLE law_translations (
    id          bigserial PRIMARY KEY,
    law_id      integer NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL REFERENCES locales(code),
    title       varchar(500) NOT NULL,
    slug        varchar(500) NOT NULL,
    description text,
    UNIQUE (law_id, locale),
    UNIQUE (locale, slug)
);

CREATE TABLE law_assets (
    id         bigserial PRIMARY KEY,
    law_id     integer NOT NULL REFERENCES laws(id) ON DELETE CASCADE,
    media_id   bigint  NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
    sort_order integer NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- MEAS (securities document registry)
-- -----------------------------------------------------------------------------
CREATE TABLE meas_emitents (
    id         serial PRIMARY KEY,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE meas_emitent_translations (
    id         bigserial PRIMARY KEY,
    emitent_id integer NOT NULL REFERENCES meas_emitents(id) ON DELETE CASCADE,
    locale     varchar(5) NOT NULL REFERENCES locales(code),
    name       varchar(500) NOT NULL,
    UNIQUE (emitent_id, locale)
);

CREATE TABLE meas_info_types (
    id         serial PRIMARY KEY,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE meas_info_type_translations (
    id           bigserial PRIMARY KEY,
    info_type_id integer NOT NULL REFERENCES meas_info_types(id) ON DELETE CASCADE,
    locale       varchar(5) NOT NULL REFERENCES locales(code),
    name         varchar(500) NOT NULL,
    UNIQUE (info_type_id, locale)
);

CREATE TABLE meas_documents (
    id           bigserial PRIMARY KEY,
    emitent_id   integer NOT NULL REFERENCES meas_emitents(id) ON DELETE RESTRICT,
    info_type_id integer NOT NULL REFERENCES meas_info_types(id) ON DELETE RESTRICT,
    reg_date     date NOT NULL,                   -- was varchar(20) in legacy
    dqn          varchar(100),                    -- state registration number
    media_id     bigint REFERENCES media_assets(id) ON DELETE RESTRICT,
    status       content_status NOT NULL DEFAULT 'draft',
    created_by   integer REFERENCES users(id) ON DELETE SET NULL,
    updated_by   integer REFERENCES users(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);

-- -----------------------------------------------------------------------------
-- Organization
-- -----------------------------------------------------------------------------
CREATE TABLE organization_divisions (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    media_id   bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organization_division_translations (
    id          bigserial PRIMARY KEY,
    division_id integer NOT NULL REFERENCES organization_divisions(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL REFERENCES locales(code),
    name        varchar(500) NOT NULL,
    description text,
    UNIQUE (division_id, locale)
);

CREATE TABLE organization_offices (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organization_office_translations (
    id        bigserial PRIMARY KEY,
    office_id integer NOT NULL REFERENCES organization_offices(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL REFERENCES locales(code),
    name      varchar(500) NOT NULL,
    address   varchar(1000),                      -- fixes legacy 'adress'
    phone     varchar(100),
    UNIQUE (office_id, locale)
);

CREATE TABLE organization_staff (
    id             serial PRIMARY KEY,
    type           smallint NOT NULL DEFAULT 1,   -- 1 = board, 2 = management
    sort_order     integer NOT NULL DEFAULT 0,
    is_active      boolean NOT NULL DEFAULT true,
    phone          varchar(100),
    photo_media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organization_staff_translations (
    id        bigserial PRIMARY KEY,
    staff_id  integer NOT NULL REFERENCES organization_staff(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL REFERENCES locales(code),
    full_name      varchar(300) NOT NULL,
    position       varchar(500),
    reception_days varchar(500),
    bio            text,
    UNIQUE (staff_id, locale)
);

-- -----------------------------------------------------------------------------
-- National currency (numismatics)
-- -----------------------------------------------------------------------------
CREATE TABLE money_mark_categories (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true
);

CREATE TABLE money_mark_category_translations (
    id          bigserial PRIMARY KEY,
    category_id integer NOT NULL REFERENCES money_mark_categories(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL REFERENCES locales(code),
    name        varchar(500) NOT NULL,
    UNIQUE (category_id, locale)
);

CREATE TABLE money_marks (
    id             serial PRIMARY KEY,
    category_id    integer NOT NULL REFERENCES money_mark_categories(id) ON DELETE RESTRICT,
    type           smallint NOT NULL DEFAULT 1,   -- 1 = banknote, 2 = coin
    front_media_id bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    rear_media_id  bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    sort_order     integer NOT NULL DEFAULT 0,
    status         content_status NOT NULL DEFAULT 'draft',
    created_by     integer REFERENCES users(id) ON DELETE SET NULL,
    updated_by     integer REFERENCES users(id) ON DELETE SET NULL,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz
);

CREATE TABLE money_mark_translations (
    id                bigserial PRIMARY KEY,
    money_mark_id     integer NOT NULL REFERENCES money_marks(id) ON DELETE CASCADE,
    locale            varchar(5) NOT NULL REFERENCES locales(code),
    title             varchar(500) NOT NULL,
    slug              varchar(500) NOT NULL,
    description       text,
    security_features text,                       -- fixes legacy 'secure_*'
    UNIQUE (money_mark_id, locale),
    UNIQUE (locale, slug)
);

CREATE TABLE money_mark_news (
    id           serial PRIMARY KEY,
    status       content_status NOT NULL DEFAULT 'draft',
    published_at timestamptz,
    created_by   integer REFERENCES users(id) ON DELETE SET NULL,
    updated_by   integer REFERENCES users(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);

CREATE TABLE money_mark_news_translations (
    id      bigserial PRIMARY KEY,
    news_id integer NOT NULL REFERENCES money_mark_news(id) ON DELETE CASCADE,
    locale  varchar(5) NOT NULL REFERENCES locales(code),
    title   varchar(500) NOT NULL,
    slug    varchar(500) NOT NULL,
    content text,
    UNIQUE (news_id, locale),
    UNIQUE (locale, slug)
);

-- -----------------------------------------------------------------------------
-- Media content: galleries, videos, streams
-- -----------------------------------------------------------------------------
CREATE TABLE galleries (
    id         serial PRIMARY KEY,
    event_date date,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

CREATE TABLE gallery_translations (
    id         bigserial PRIMARY KEY,
    gallery_id integer NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    locale     varchar(5) NOT NULL REFERENCES locales(code),
    title      varchar(500) NOT NULL,
    UNIQUE (gallery_id, locale)
);

CREATE TABLE gallery_images (
    id         bigserial PRIMARY KEY,
    gallery_id integer NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
    media_id   bigint  NOT NULL REFERENCES media_assets(id) ON DELETE RESTRICT,
    sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE videos (
    id           serial PRIMARY KEY,
    youtube_url  varchar(500) NOT NULL,
    published_at timestamptz,
    sort_order   integer NOT NULL DEFAULT 0,
    is_active    boolean NOT NULL DEFAULT true,
    created_by   integer REFERENCES users(id) ON DELETE SET NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);

CREATE TABLE video_translations (
    id       bigserial PRIMARY KEY,
    video_id integer NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    locale   varchar(5) NOT NULL REFERENCES locales(code),
    title    varchar(500) NOT NULL,
    UNIQUE (video_id, locale)
);

CREATE TABLE video_streams (
    id         serial PRIMARY KEY,
    stream_url varchar(500) NOT NULL,
    is_live    boolean NOT NULL DEFAULT false,
    starts_at  timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE video_stream_translations (
    id        bigserial PRIMARY KEY,
    stream_id integer NOT NULL REFERENCES video_streams(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL REFERENCES locales(code),
    title     varchar(500) NOT NULL,
    UNIQUE (stream_id, locale)
);

-- -----------------------------------------------------------------------------
-- Homepage blocks
-- -----------------------------------------------------------------------------
CREATE TABLE banners (
    id         serial PRIMARY KEY,
    media_id   bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    starts_at  timestamptz,
    ends_at    timestamptz,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE banner_translations (
    id        bigserial PRIMARY KEY,
    banner_id integer NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL REFERENCES locales(code),
    title     varchar(500),
    link      varchar(1000),
    UNIQUE (banner_id, locale)
);

CREATE TABLE news_slider (
    id         serial PRIMARY KEY,
    news_date  date NOT NULL,
    media_id   bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE news_slider_translations (
    id          bigserial PRIMARY KEY,
    slider_id   integer NOT NULL REFERENCES news_slider(id) ON DELETE CASCADE,
    locale      varchar(5) NOT NULL REFERENCES locales(code),
    title       varchar(500) NOT NULL,
    description text,
    link        varchar(1000),
    UNIQUE (slider_id, locale)
);

CREATE TABLE running_lines (
    id         serial PRIMARY KEY,
    is_active  boolean NOT NULL DEFAULT true,
    starts_at  timestamptz,
    ends_at    timestamptz,
    created_by integer REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE running_line_translations (
    id              bigserial PRIMARY KEY,
    running_line_id integer NOT NULL REFERENCES running_lines(id) ON DELETE CASCADE,
    locale          varchar(5) NOT NULL REFERENCES locales(code),
    text            varchar(1000) NOT NULL,
    UNIQUE (running_line_id, locale)
);

CREATE TABLE homepage_links (
    id         serial PRIMARY KEY,
    sort_order integer NOT NULL DEFAULT 0,
    is_active  boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE homepage_link_translations (
    id      bigserial PRIMARY KEY,
    link_id integer NOT NULL REFERENCES homepage_links(id) ON DELETE CASCADE,
    locale  varchar(5) NOT NULL REFERENCES locales(code),
    title   varchar(500) NOT NULL,
    url     varchar(1000) NOT NULL,
    UNIQUE (link_id, locale)
);

CREATE TABLE homepage_publications (
    id           serial PRIMARY KEY,
    media_id     bigint REFERENCES media_assets(id) ON DELETE SET NULL,
    published_at timestamptz,
    sort_order   integer NOT NULL DEFAULT 0,
    is_active    boolean NOT NULL DEFAULT true,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE homepage_publication_translations (
    id             bigserial PRIMARY KEY,
    publication_id integer NOT NULL REFERENCES homepage_publications(id) ON DELETE CASCADE,
    locale         varchar(5) NOT NULL REFERENCES locales(code),
    title          varchar(500) NOT NULL,
    url            varchar(1000),
    UNIQUE (publication_id, locale)
);

-- -----------------------------------------------------------------------------
-- Settings (replaces settings_saf)
-- -----------------------------------------------------------------------------
CREATE TABLE settings (
    key        varchar(100) PRIMARY KEY,
    value      jsonb NOT NULL,
    updated_by integer REFERENCES users(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- updated_at maintenance trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
    FOR t IN
        SELECT table_name FROM information_schema.columns
        WHERE table_schema = 'public' AND column_name = 'updated_at'
    LOOP
        EXECUTE format(
            'CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
    END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- Read-only role for cbar-web-api (site backend must not write).
--
-- Only the GRANTs live here: they are idempotent and environment-independent,
-- and they no-op when the role does not exist. Creating the LOGIN role is NOT
-- a migration — a migration would have to hardcode its password, handing every
-- environment the same credentials. Local dev creates it in db/seed.sql; real
-- environments provision it with a secret from the vault, then this block
-- (re-run on the next deploy) grants it read access.
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        EXECUTE format('GRANT CONNECT ON DATABASE %I TO cbar_web_ro', current_database());
        GRANT USAGE ON SCHEMA public TO cbar_web_ro;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO cbar_web_ro;
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cbar_web_ro;
    END IF;
END $$;
