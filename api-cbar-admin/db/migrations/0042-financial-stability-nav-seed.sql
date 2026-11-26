-- Header navigation as in Figma (spec 056, specs/056-header-financial-stability-nav/contracts/seed.md): the nav bar
-- (`I813:25657;9:29`) and the hamburger panel (`1088:26873`).
--
-- A. A new root "Maliyyə sabitliyi" / "Financial stability". "Maliyyə sabitliyi hesabatı" and the macroprudential
--    framework move under it from "Nəşrlər və tədqiqatlar" (where 0041 took them out of the menus) and are listed again;
--    "Dayanıqlı Maliyyə" moves under it with its whole subtree, and its "(Kopya)" draft leaves the menus.
-- B. A new root "Rəqəmsal maliyyə ekosistemi" / "Digital financial ecosystem" with eight empty pages; editors fill them.
-- C. The roots are renumbered in the Figma order ("Maliyyə sabitliyi" third, the nine nav-bar sections first), and four
--    roots Figma leaves out of the hamburger panel get the "not in the menus" flag. On a root the site reads that flag
--    for the wide-screen hamburger panel only (spec 056 contracts/ui.md).
--
-- Pages are found by az slug: ids differ between environments. Addresses are slugs, so a move changes none; nothing is
-- deleted. Each part runs only in the run that creates its root, and C only when A or B created one, so a second run
-- changes nothing and an editor's later order, places and flags stand. A database without the legacy tree is skipped.
DO $seed$
DECLARE
    pubs_id      integer;
    root_id      integer;
    root_path    ltree;
    fs_id        integer;
    fs_path      ltree;
    v            record;
    page_row     record;
    parent_id_   integer;
    parent_path  ltree;
    new_id       integer;
    new_path     ltree;
    slug_az      text;
    slug_en      text;
    n            integer;
    created      text[] := ARRAY[]::text[];
    pages_made   integer := 0;
    moved        integer := 0;
    changed      integer;
BEGIN
    -- In shared environments the tables may belong to another role (see 0028, 0030, 0031, 0041).
    IF NOT has_table_privilege('pages', 'INSERT')
       OR NOT has_table_privilege('pages', 'UPDATE')
       OR NOT has_table_privilege('page_translations', 'INSERT')
       OR NOT has_table_privilege('page_details', 'INSERT')
       OR NOT has_table_privilege('page_details', 'UPDATE')
       OR NOT has_table_privilege('page_nav_details', 'UPDATE') THEN
        RAISE WARNING 'spec 056: missing INSERT/UPDATE privileges on the page tables, navigation seed skipped';
        RETURN;
    END IF;

    IF NOT EXISTS (
        SELECT FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az'
        WHERE t.slug = 'pul-siyaseti' AND p.parent_id IS NULL AND p.deleted_at IS NULL
    ) THEN
        RAISE NOTICE 'spec 056: no legacy page tree, navigation seed skipped';
        RETURN;
    END IF;

    -- A + B. New pages in order: a root first, then its children. A root is created only while no root has its az slug
    -- (or the "-n" form SlugService would have given it); its children only in the run that creates it.
    FOR v IN
        SELECT * FROM (VALUES
        (1, NULL, 'maliyye-sabitliyi', 'financial-stability', 'Maliyyə sabitliyi', 'Financial stability'),
        (2, NULL, 'reqemsal-maliyye-ekosistemi', 'digital-financial-ecosystem', 'Rəqəmsal maliyyə ekosistemi', 'Digital financial ecosystem'),
        (3, 'reqemsal-maliyye-ekosistemi', 'maliyye-texnologiyalari', 'financial-technologies', 'Maliyyə texnologiyaları', 'Financial technologies'),
        (4, 'reqemsal-maliyye-ekosistemi', 'aciq-bankciliq', 'open-banking', 'Açıq bankçılıq', 'Open banking'),
        (5, 'reqemsal-maliyye-ekosistemi', 'xususi-tenzimleme-rejimi', 'regulatory-sandbox', 'Xüsusi tənzimləmə rejimi', 'Regulatory sandbox'),
        (6, 'reqemsal-maliyye-ekosistemi', 'reqemsal-kyc', 'digital-kyc', 'Rəqəmsal KYC', 'Digital KYC'),
        (7, 'reqemsal-maliyye-ekosistemi', 'kriptoaktivlerin-tenzimlenmesi', 'regulation-of-crypto-assets', 'Kriptoaktivlərin tənzimlənməsi', 'Regulation of crypto-assets'),
        (8, 'reqemsal-maliyye-ekosistemi', 'merkezi-bankin-reqemsal-valyutasi', 'central-bank-digital-currency', 'Mərkəzi Bankın rəqəmsal valyutası', 'Central bank digital currency'),
        (9, 'reqemsal-maliyye-ekosistemi', 'maliyye-texnologiyalari-ekosisteminin-xeritesi', 'fintech-ecosystem-map', 'Maliyyə texnologiyaları ekosisteminin xəritəsi', 'Fintech ecosystem map'),
        (10, 'reqemsal-maliyye-ekosistemi', 'maliyye-texnologiyalari-ve-innovasiyalar-uzre-yenilik-ve-tedbirler', 'fintech-and-innovation-news-and-events', 'Maliyyə texnologiyaları və innovasiyalar üzrə yenilik və tədbirlər', 'Fintech and innovation news and events')
        ) AS t (seq, parent_slug, slug_az, slug_en, title_az, title_en)
        ORDER BY seq
    LOOP
        IF v.parent_slug IS NULL THEN
            IF EXISTS (
                SELECT FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az'
                WHERE p.parent_id IS NULL AND p.deleted_at IS NULL AND t.slug ~ ('^' || v.slug_az || '(-[0-9]+)?$')
            ) THEN
                CONTINUE;
            END IF;
            parent_id_ := NULL;
            parent_path := NULL;
        ELSE
            -- The root was just created (its slug may have become "-2"), so its id and path are at hand.
            IF NOT v.parent_slug = ANY (created) THEN
                CONTINUE;
            END IF;
            parent_id_ := root_id;
            parent_path := root_path;
        END IF;

        -- The path needs the id: insert with the parent's path (or a placeholder for a root), then set it.
        INSERT INTO pages (parent_id, path, sort_order, status)
        VALUES (parent_id_, coalesce(parent_path, text2ltree('0')), (v.seq - 2) * 10, 'published')
        RETURNING id INTO new_id;
        new_path := CASE WHEN parent_path IS NULL THEN text2ltree(new_id::text) ELSE parent_path || text2ltree(new_id::text) END;
        UPDATE pages SET path = new_path WHERE id = new_id;

        -- A slug taken in the locale gets "-2", "-3"…, as SlugService would ("Açıq bankçılıq" is also under Ödəniş sistemləri).
        slug_az := v.slug_az;
        n := 1;
        WHILE EXISTS (SELECT FROM page_translations WHERE locale = 'az' AND slug = slug_az) LOOP
            n := n + 1;
            slug_az := v.slug_az || '-' || n;
        END LOOP;
        slug_en := v.slug_en;
        n := 1;
        WHILE EXISTS (SELECT FROM page_translations WHERE locale = 'en' AND slug = slug_en) LOOP
            n := n + 1;
            slug_en := v.slug_en || '-' || n;
        END LOOP;
        INSERT INTO page_translations (page_id, locale, title, slug, content) VALUES (new_id, 'az', v.title_az, slug_az, NULL);
        INSERT INTO page_translations (page_id, locale, title, slug, content) VALUES (new_id, 'en', v.title_en, slug_en, NULL);

        IF v.parent_slug IS NULL THEN
            created := created || v.slug_az;
            root_id := new_id;
            root_path := new_path;
            IF v.slug_az = 'maliyye-sabitliyi' THEN
                fs_id := new_id;
                fs_path := new_path;
            END IF;
        END IF;
        pages_made := pages_made + 1;
    END LOOP;
    RAISE NOTICE 'spec 056: % pages created (roots: %)', pages_made, coalesce(array_to_string(created, ', '), '');

    -- A. The financial stability section's pages, in the run that creates it.
    IF fs_id IS NOT NULL THEN
        SELECT page_id INTO pubs_id FROM page_translations WHERE locale = 'az' AND slug = 'nesrler-ve-tedqiqatlar';

        FOR v IN
            SELECT * FROM (VALUES
            (1, 'maliyye-sabitliyi-hesabati', 'publications'),
            (2, 'bank-sektoru-uzre-makroprudensial-siyaset-cercivesi', 'publications'),
            (3, 'dayaniqli-maliyye', 'root')
            ) AS t (seq, slug, source)
            ORDER BY seq
        LOOP
            SELECT p.id, p.parent_id, p.path INTO page_row
            FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az' AND t.slug = v.slug
            WHERE p.deleted_at IS NULL;
            -- Only from where the legacy tree has it: a page an editor already placed elsewhere stays there.
            IF page_row.id IS NULL
               OR v.source = 'publications' AND page_row.parent_id IS DISTINCT FROM pubs_id
               OR v.source = 'root' AND page_row.parent_id IS NOT NULL THEN
                CONTINUE;
            END IF;

            new_path := fs_path || text2ltree(page_row.id::text);
            UPDATE pages SET parent_id = fs_id, path = new_path, sort_order = v.seq * 10 WHERE id = page_row.id;
            UPDATE pages SET path = new_path || subpath(path, nlevel(page_row.path))
            WHERE path <@ page_row.path AND id <> page_row.id;
            moved := moved + 1;

            -- 0041 took the two reports out of the publications menus; in this section they are listed.
            IF v.source = 'publications' THEN
                INSERT INTO page_details (page_id, show_in_side_nav) VALUES (page_row.id, true)
                ON CONFLICT (page_id) DO UPDATE SET show_in_side_nav = true;
            END IF;
        END LOOP;

        INSERT INTO page_details (page_id, show_in_side_nav)
        SELECT t.page_id, false
        FROM page_translations t
        WHERE t.locale = 'az' AND t.slug = 'dayaniqli-maliyye-copy'
        ON CONFLICT (page_id) DO UPDATE SET show_in_side_nav = false;
        RAISE NOTICE 'spec 056: % pages moved under maliyye-sabitliyi', moved;
    END IF;

    -- C. Root order and the hamburger panel, in a run that created a root.
    IF cardinality(created) = 0 THEN
        RAISE NOTICE 'spec 056: roots already in place, order and flags left as they are';
        RETURN;
    END IF;

    WITH wanted AS (
        SELECT slug, ord FROM unnest(ARRAY[
            'haqqimizda', 'pul-siyaseti', 'maliyye-sabitliyi', 'bazar-istirakcilari', 'huquqi-aktlar', 'odenis-sistemleri',
            'milli-pul-nisanlari', 'statistika', 'nesrler-ve-tedqiqatlar', 'media', 'istehlakcilarin-ve-investorlarin-huquqlari',
            'reqemsal-maliyye-ekosistemi', 'maliyye-sektorunun-inkisaf-strategiyasi', 'beynelxalq-emekdasliq', 'maliyye-savadliligi',
            'insan-resurslari', 'melumatlarin-yayimlanmasi-qrafiki', 'sual-cavab', 'istinadlar', 'fincert',
            'naxcivan-muxtar-respublikasi-idaresi'
        ]) WITH ORDINALITY AS w (slug, ord)
    ), ordered AS (
        -- Roots not in the list keep their relative order after the listed ones.
        SELECT p.id, row_number() OVER (ORDER BY w.ord NULLS LAST, p.sort_order, p.id) AS rn
        FROM pages p
        LEFT JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az'
        LEFT JOIN wanted w ON w.slug = t.slug
        WHERE p.parent_id IS NULL AND p.deleted_at IS NULL
    )
    UPDATE pages p SET sort_order = o.rn * 10 FROM ordered o WHERE p.id = o.id;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 056: % roots renumbered', changed;

    -- "Menyularda yox" on a root: showInSideNav false, and a stored dropdown value must not override it.
    INSERT INTO page_details (page_id, show_in_side_nav)
    SELECT p.id, false
    FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az'
    WHERE p.parent_id IS NULL AND p.deleted_at IS NULL
      AND t.slug = ANY (ARRAY['maliyye-sektorunun-inkisaf-strategiyasi', 'melumatlarin-yayimlanmasi-qrafiki', 'sual-cavab', 'istinadlar'])
    ON CONFLICT (page_id) DO UPDATE SET show_in_side_nav = false;
    GET DIAGNOSTICS changed = ROW_COUNT;
    UPDATE page_nav_details d SET show_in_dropdown_nav = false
    FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az'
    WHERE d.page_id = p.id AND p.parent_id IS NULL
      AND t.slug = ANY (ARRAY['maliyye-sektorunun-inkisaf-strategiyasi', 'melumatlarin-yayimlanmasi-qrafiki', 'sual-cavab', 'istinadlar']);
    RAISE NOTICE 'spec 056: % roots left out of the hamburger panel', changed;
END
$seed$;
