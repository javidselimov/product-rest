-- Monthly reports (spec 052): moves the year → month archives of the consumer rights pages into
-- monthly_reports, so editors keep them in the panel instead of nested accordions.
--
-- Each archive is read the way the site's spec 050 parser reads it: a year accordion (`<summary>2026`)
-- holding month accordions (`<summary>May`), each with a media library link (`href="/media/N"`). The
-- az text gives the reports and their az files; the en text of the same page adds the en files, by
-- year and month. Pages are found by their az slug, since ids differ between environments; a database
-- without them is not touched.
--
-- Left out, with a notice: a month whose label is not a month name, a link outside the media library
-- (two en insurance months link uploads.cbar.az; the site does not show them today either), a file the
-- media library does not have. A series that already has a report (deleted ones too) is left as it
-- is, so an editor's work is never overwritten. Page texts are not changed: while a series has
-- reports the site leaves the legacy archive out, and without them it shows it again.

DO $seed$
DECLARE
    v_src         record;
    v_loc         text;
    v_series_id   smallint;
    v_page_id     integer;
    v_content     text;
    v_chunk       text;
    v_year_value  smallint;
    v_month_match text[];
    v_month_value smallint;
    v_media_value bigint;
    v_report_id   integer;
    v_added       jsonb;
BEGIN
    FOR v_src IN
        SELECT * FROM (VALUES
            ('bank-complaint-index', 'bank-xidmetlerinden-istifade-uzre-sikayet-indeksi'),
            ('insurance-complaint-index', 'avto-icbari-sigorta-uzre-sikayet-indeksi'),
            ('infographics', 'infoqrafika')
        ) AS v(key, az_slug)
    LOOP
        SELECT s.id INTO v_series_id FROM monthly_report_series s WHERE s.key = v_src.key;
        IF v_series_id IS NULL THEN
            CONTINUE;
        END IF;
        IF EXISTS (SELECT FROM monthly_reports r WHERE r.series_id = v_series_id) THEN
            RAISE NOTICE 'spec 052: % already has reports, left as it is', v_src.key;
            CONTINUE;
        END IF;

        SELECT t.page_id INTO v_page_id FROM page_translations t WHERE t.locale = 'az' AND t.slug = v_src.az_slug LIMIT 1;
        IF v_page_id IS NULL THEN
            RAISE NOTICE 'spec 052: page % not found, % skipped', v_src.az_slug, v_src.key;
            CONTINUE;
        END IF;

        v_added := '{}'::jsonb;
        FOREACH v_loc IN ARRAY ARRAY['az', 'en'] LOOP
            SELECT t.content INTO v_content FROM page_translations t WHERE t.page_id = v_page_id AND t.locale = v_loc;
            v_added := v_added || jsonb_build_object(v_loc, 0);
            CONTINUE WHEN v_content IS NULL;

            -- One chunk per year accordion; the text before the first year is not part of the archive.
            FOR v_chunk IN
                SELECT part FROM regexp_split_to_table(v_content, '<summary>\s*(?=\d{4}\s*</summary>)') WITH ORDINALITY AS p(part, n)
                WHERE n > 1
            LOOP
                v_year_value := substring(v_chunk FROM '^\s*(\d{4})')::smallint;
                CONTINUE WHEN v_year_value IS NULL OR v_year_value < 2000 OR v_year_value > 2100;

                -- A month accordion: its label and its body up to the next accordion.
                FOR v_month_match IN
                    SELECT regexp_matches(v_chunk, '<summary>\s*([^<]+?)\s*</summary>((?:(?!<summary>).)*)', 'g')
                LOOP
                    SELECT m.n INTO v_month_value
                    FROM (VALUES
                        ('yanvar', 1), ('fevral', 2), ('mart', 3), ('aprel', 4), ('may', 5), ('iyun', 6),
                        ('iyul', 7), ('avqust', 8), ('sentyabr', 9), ('oktyabr', 10), ('noyabr', 11), ('dekabr', 12),
                        ('january', 1), ('february', 2), ('march', 3), ('april', 4), ('june', 6), ('july', 7),
                        ('august', 8), ('september', 9), ('october', 10), ('november', 11), ('december', 12)
                    ) AS m(name, n)
                    WHERE m.name = lower(regexp_replace(translate(v_month_match[1], 'İIı', 'iii'), '\s+', ' ', 'g'));
                    IF v_month_value IS NULL THEN
                        RAISE NOTICE 'spec 052: % % "%" is not a month, left in the page text', v_src.key, v_year_value, v_month_match[1];
                        CONTINUE;
                    END IF;

                    -- The first media library link of the month, as the site reads it.
                    v_media_value := substring(v_month_match[2] FROM 'href="/media/(\d+)"')::bigint;
                    CONTINUE WHEN v_media_value IS NULL
                        OR NOT EXISTS (SELECT FROM media_assets a WHERE a.id = v_media_value AND a.deleted_at IS NULL);

                    SELECT r.id INTO v_report_id FROM monthly_reports r
                    WHERE r.series_id = v_series_id AND r.year = v_year_value AND r.month = v_month_value AND r.deleted_at IS NULL;
                    IF v_report_id IS NULL THEN
                        INSERT INTO monthly_reports (series_id, year, month, status)
                        VALUES (v_series_id, v_year_value, v_month_value, 'published')
                        RETURNING id INTO v_report_id;
                    END IF;

                    INSERT INTO monthly_report_translations (report_id, locale, media_id)
                    VALUES (v_report_id, v_loc, v_media_value)
                    ON CONFLICT (report_id, locale) DO NOTHING;
                    IF FOUND THEN
                        v_added := jsonb_set(v_added, ARRAY[v_loc], to_jsonb((v_added ->> v_loc)::int + 1));
                    END IF;
                    v_month_value := NULL;
                    v_report_id := NULL;
                END LOOP;
            END LOOP;
            v_content := NULL;
        END LOOP;

        RAISE NOTICE 'spec 052: % az=% en=%', v_src.key, v_added ->> 'az', v_added ->> 'en';
        v_page_id := NULL;
    END LOOP;
END $seed$;
