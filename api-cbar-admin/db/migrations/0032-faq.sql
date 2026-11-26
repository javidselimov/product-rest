-- FAQ "Sual-cavab" (spec 051): topics, questions and videos as a content type of their own.
--
-- The legacy site kept the whole FAQ as one CMS page (8 <details> accordions, 200+ numbered questions in the editor's
-- markup). Editors asked for a section where a question is a row they can add, move and translate without markup.
-- The legacy content is copied by 0033. New tables only; nothing that already exists is altered (see 0014 for why).
CREATE TABLE IF NOT EXISTS faq_topics (
    id          serial PRIMARY KEY,
    slug        varchar(120) NOT NULL UNIQUE,   -- fixed at creation; the site selects a topic with ?topic=<slug>
    sort_order  integer NOT NULL DEFAULT 0,
    status      content_status NOT NULL DEFAULT 'draft',
    created_by  integer,
    updated_by  integer,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS faq_topics_status_sort_idx ON faq_topics (status, sort_order);

CREATE TABLE IF NOT EXISTS faq_topic_translations (
    id        bigserial PRIMARY KEY,
    topic_id  integer NOT NULL REFERENCES faq_topics(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL,
    name      varchar(255) NOT NULL,
    UNIQUE (topic_id, locale)
);

-- CMS pages that show a link card to the topic (e.g. the "Pul siyasəti" section page).
CREATE TABLE IF NOT EXISTS faq_topic_pages (
    topic_id    integer NOT NULL REFERENCES faq_topics(id) ON DELETE CASCADE,
    page_id     integer NOT NULL,
    sort_order  integer NOT NULL DEFAULT 0,
    PRIMARY KEY (topic_id, page_id)
);
CREATE INDEX IF NOT EXISTS faq_topic_pages_page_idx ON faq_topic_pages (page_id);

CREATE TABLE IF NOT EXISTS faq_questions (
    id          serial PRIMARY KEY,
    topic_id    integer NOT NULL REFERENCES faq_topics(id),
    sort_order  integer NOT NULL DEFAULT 0,
    status      content_status NOT NULL DEFAULT 'draft',
    created_by  integer,
    updated_by  integer,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS faq_questions_topic_status_sort_idx ON faq_questions (topic_id, status, sort_order);

-- answer is the rich-text editor's HTML; the site sanitizes it like page content.
CREATE TABLE IF NOT EXISTS faq_question_translations (
    id           bigserial PRIMARY KEY,
    question_id  integer NOT NULL REFERENCES faq_questions(id) ON DELETE CASCADE,
    locale       varchar(5) NOT NULL,
    question     varchar(1000) NOT NULL,
    answer       text NOT NULL,
    UNIQUE (question_id, locale)
);

CREATE TABLE IF NOT EXISTS faq_videos (
    id           serial PRIMARY KEY,
    youtube_url  varchar(500) NOT NULL,
    sort_order   integer NOT NULL DEFAULT 0,
    status       content_status NOT NULL DEFAULT 'draft',
    created_by   integer,
    updated_by   integer,
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now(),
    deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS faq_videos_status_sort_idx ON faq_videos (status, sort_order);

CREATE TABLE IF NOT EXISTS faq_video_translations (
    id        bigserial PRIMARY KEY,
    video_id  integer NOT NULL REFERENCES faq_videos(id) ON DELETE CASCADE,
    locale    varchar(5) NOT NULL,
    title     varchar(255) NOT NULL,
    UNIQUE (video_id, locale)
);

-- FKs onto tables this role may not own need the REFERENCES privilege, so they are added only where it is granted
-- and never block a deploy (see 0017). Without them the admin API checks the ids itself.
DO $$
DECLARE
    fk record;
BEGIN
    FOR fk IN
        SELECT * FROM (VALUES
            ('faq_topics', 'created_by', 'users', 'id', 'SET NULL'),
            ('faq_topics', 'updated_by', 'users', 'id', 'SET NULL'),
            ('faq_questions', 'created_by', 'users', 'id', 'SET NULL'),
            ('faq_questions', 'updated_by', 'users', 'id', 'SET NULL'),
            ('faq_videos', 'created_by', 'users', 'id', 'SET NULL'),
            ('faq_videos', 'updated_by', 'users', 'id', 'SET NULL'),
            ('faq_topic_pages', 'page_id', 'pages', 'id', 'CASCADE'),
            ('faq_topic_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('faq_question_translations', 'locale', 'locales', 'code', 'NO ACTION'),
            ('faq_video_translations', 'locale', 'locales', 'code', 'NO ACTION')
        ) AS v(tbl, col, ref_table, ref_col, on_delete)
    LOOP
        IF has_table_privilege(fk.ref_table, 'REFERENCES')
           AND NOT EXISTS (SELECT FROM pg_constraint WHERE conname = format('fk_%s_%s', fk.tbl, fk.col)) THEN
            EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %I(%I) ON DELETE %s',
                fk.tbl, format('fk_%s_%s', fk.tbl, fk.col), fk.col, fk.ref_table, fk.ref_col, fk.on_delete);
        END IF;
    END LOOP;
END $$;

-- Same trigger 0001 puts on every table with updated_at; controllers do not set the column.
DO $$
DECLARE
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['faq_topics', 'faq_questions', 'faq_videos'] LOOP
        IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = tbl || '_set_updated_at') THEN
            EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
                tbl || '_set_updated_at', tbl);
        END IF;
    END LOOP;
END $$;

-- api-cbar reads these tables as cbar_web_ro (0001 grants SELECT on existing tables only).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        GRANT SELECT ON faq_topics, faq_topic_translations, faq_topic_pages, faq_questions, faq_question_translations,
            faq_videos, faq_video_translations TO cbar_web_ro;
    END IF;
END $$;

-- Catalog rows for Authorization/Permissions.cs. Moderators manage content, as in the 0009 matrix; admin holds every
-- permission in code. Where this role may not insert, the seed is skipped and the API fails closed, as in 0009.
DO $$
BEGIN
    IF NOT has_table_privilege('permissions', 'INSERT')
       OR NOT has_table_privilege('role_permissions', 'INSERT') THEN
        RAISE WARNING 'spec 051: no INSERT privilege on permissions/role_permissions, faq permissions skipped';
        RETURN;
    END IF;

    INSERT INTO permissions (code, description) VALUES
        ('faq.read', 'Read FAQ topics, questions and videos'),
        ('faq.create', 'Create FAQ topics, questions and videos'),
        ('faq.update', 'Edit and reorder FAQ topics, questions and videos'),
        ('faq.delete', 'Delete FAQ topics, questions and videos')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.id, p.id
    FROM roles r
    JOIN permissions p ON p.code IN ('faq.read', 'faq.create', 'faq.update', 'faq.delete')
    WHERE r.code = 'moderator'
    ON CONFLICT DO NOTHING;
END $$;
