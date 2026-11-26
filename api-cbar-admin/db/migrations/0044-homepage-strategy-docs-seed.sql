-- Homepage "Strategiya və sənədlər" (spec 057): the three documents the site kept in code until now
-- (web-cbar-new views/home/mock.ts), linked to their CMS pages, so the block is not empty after the deploy.
--
-- Pages are found by their az slug, since ids differ between environments; a document whose page is not found is left
-- out. Titles are the ones the site showed (az and en); the short text, the address and the covers stay empty: covers
-- get environment-specific media ids, so editors upload them in the panel (specs/057-homepage-strategy-docs/assets/).
-- Nothing is written while the table has a row (deleted ones too), so an editor's work is never overwritten, and CMS
-- pages, media and every other table are left as they are.

DO $seed$
DECLARE
    v_doc     record;
    v_page_id integer;
    v_doc_id  integer;
    v_added   integer := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM homepage_strategy_docs) THEN
        RAISE NOTICE 'spec 057: strategy documents already exist, seed skipped';
        RETURN;
    END IF;

    FOR v_doc IN
        SELECT * FROM (VALUES
            (1, 'maliyye-sektorunun-inkisaf-strategiyasi',
             '2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası',
             'Financial Sector Development Strategy for 2024-2026'),
            (2, 'risk-esasli-nezaret-uzre-siyaset-konsepsiyasi',
             'Azərbaycan Respublikası Mərkəzi Bankının risk əsaslı nəzarət üzrə Siyasət Konsepsiyası',
             'Risk-Based Supervision Policy Concept of the Central Bank of the Republic of Azerbaijan'),
            (3, 'mikromaliyye-modeli-uzre-strateji-cercive',
             'Mikromaliyyə Modeli üzrə Strateji Çərçivə',
             'Strategic Framework for a Microfinance Model')
        ) AS v(seq, az_slug, az_title, en_title)
        ORDER BY seq
    LOOP
        SELECT t.page_id INTO v_page_id
        FROM page_translations t
        JOIN pages p ON p.id = t.page_id
        WHERE t.locale = 'az' AND t.slug = v_doc.az_slug AND p.deleted_at IS NULL
        ORDER BY t.page_id
        LIMIT 1;
        IF v_page_id IS NULL THEN
            RAISE NOTICE 'spec 057: page % not found, document % left out', v_doc.az_slug, v_doc.seq;
            CONTINUE;
        END IF;

        INSERT INTO homepage_strategy_docs (page_id, sort_order, status)
        VALUES (v_page_id, v_doc.seq, 'published')
        RETURNING id INTO v_doc_id;
        INSERT INTO homepage_strategy_doc_translations (doc_id, locale, title)
        VALUES (v_doc_id, 'az', v_doc.az_title), (v_doc_id, 'en', v_doc.en_title);
        v_added := v_added + 1;
    END LOOP;

    RAISE NOTICE 'spec 057: % strategy documents written', v_added;
END
$seed$;
