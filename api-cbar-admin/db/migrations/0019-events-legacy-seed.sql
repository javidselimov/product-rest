-- The six legacy events (spec 034). On the old site an event was a CMS page with no date, so each
-- becomes an event linked to that page: the card opens the page, whose content and address stay
-- as they are. Nothing here writes to pages.
--
-- The dates are starting values for editors to review and change in the admin panel. Sources are
-- in specs/034-media-events/spec.md; 100 years is the date of the decree, and the last two have no
-- date in the page text and are estimates. A migration runs once, so a later deploy cannot
-- overwrite an edit. Type and category stay empty: editors set them.
--
-- A page is found by its az slug, since ids differ between environments. A missing page is skipped
-- so that an empty database, or one with other slugs, does not block a deploy.
DO $$
DECLARE
    legacy record;
    linked_page integer;
    new_event integer;
BEGIN
    FOR legacy IN
        SELECT * FROM (VALUES
            ('cop29', DATE '2024-11-14'),
            ('azerbaycan-merkezi-bankciligi-105-il', DATE '2024-09-30'),
            ('azerbaycan-merkezi-bankciligi-100-il', DATE '2019-09-28'),
            ('heyder-eliyev-90-il', DATE '2013-05-08'),
            ('heyder-eliyev-100-il', DATE '2023-05-10'),
            ('ar-merkezi-banki-20-il', DATE '2012-01-16')
        ) AS v(slug, starts_on)
    LOOP
        SELECT t.page_id INTO linked_page
        FROM page_translations t
        JOIN pages p ON p.id = t.page_id
        WHERE t.locale = 'az' AND t.slug = legacy.slug AND p.deleted_at IS NULL;

        IF linked_page IS NULL THEN
            RAISE NOTICE 'spec 034: page % not found, legacy event skipped', legacy.slug;
            CONTINUE;
        END IF;
        IF EXISTS (SELECT FROM events WHERE page_id = linked_page) THEN
            CONTINUE;
        END IF;

        INSERT INTO events (status, starts_on, page_id)
        VALUES ('published', legacy.starts_on, linked_page)
        RETURNING id INTO new_event;

        INSERT INTO event_translations (event_id, locale, title, slug)
        SELECT new_event, t.locale, t.title, t.slug
        FROM page_translations t
        WHERE t.page_id = linked_page;
    END LOOP;
END $$;
