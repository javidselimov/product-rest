-- Consumer and investor rights (spec 050): the Figma structure of the section, written as ordinary editor markup.
--
-- The site builds its blocks from the page text (year and month accordions, channel tables, a three-paragraph quote as
-- the formula; see specs/050-consumer-rights/contracts/cms-markup.md), so only pages, page_translations and page_details
-- change and the schema stays as it is. The markup is the form the admin editor saves, so opening and saving a page does
-- not change it. The en texts are drafts for the editor to check.
--
-- Every step changes a row only while it is still in its legacy state, so a page an editor has changed is left alone and
-- a second run changes nothing. Pages are found by their az slug; a database without them is not touched.
--
--   1. "İnzibati işlərə baxan vəzifəli şəxslər" moves from Media into the section, after the complaint index, and is
--      listed in the section's left menu. Its address is its slug, so it does not change (research R7).
--   2. The complaint index (bank) and "Kapital bazarı" take their Figma titles: "Şikayət indeksləri", "Sənədlər".
--   3. The root's first paragraph becomes the lead and the "In this regard" paragraph (legacy text only, by md5).
--   4. The bank and insurance complaint indices get their methodology after the archive.
--   5. "Sənədlər" gets its "İnformasiya sorğusu" section.
--   6. The pages Figma leaves out of the left menu leave it (spec 041); an existing page_details row is the editor's choice.

DO $seed$
DECLARE
    root_id       integer;
    root_path     ltree;
    media_id      integer;
    officials_id  integer;
    officials_parent integer;
    officials_path ltree;
    new_path      ltree;
    complaint_id  integer;
    anchor_rank   bigint;
    changed       integer;
BEGIN
    -- In shared environments the tables may belong to another role (see 0028, 0030).
    IF NOT has_table_privilege('pages', 'UPDATE')
       OR NOT has_table_privilege('page_translations', 'UPDATE')
       OR NOT has_table_privilege('page_details', 'INSERT')
       OR NOT has_table_privilege('page_details', 'UPDATE') THEN
        RAISE WARNING 'spec 050: no UPDATE on pages/page_translations or INSERT/UPDATE on page_details, consumer rights seed skipped';
        RETURN;
    END IF;

    SELECT page_id INTO root_id FROM page_translations WHERE locale = 'az' AND slug = 'istehlakcilarin-ve-investorlarin-huquqlari';
    IF root_id IS NULL THEN
        RAISE NOTICE 'spec 050: no consumer rights section, seed skipped';
        RETURN;
    END IF;
    SELECT path INTO root_path FROM pages WHERE id = root_id;
    SELECT page_id INTO complaint_id FROM page_translations WHERE locale = 'az' AND slug = 'bank-xidmetlerinden-istifade-uzre-sikayet-indeksi';

    -- 1. Move the administrative officials page from Media into the section.
    SELECT page_id INTO media_id FROM page_translations WHERE locale = 'az' AND slug = 'media';
    SELECT p.id, p.parent_id, p.path INTO officials_id, officials_parent, officials_path
    FROM pages p JOIN page_translations t ON t.page_id = p.id AND t.locale = 'az' AND t.slug = 'inzibati-islere-baxan-vezifeli-sexsler';

    IF officials_id IS NOT NULL AND media_id IS NOT NULL AND officials_parent = media_id THEN
        -- The tree is ordered by (sort_order, id). Number the root's children in their current order, ten apart, and
        -- put the page right after the complaint index (at the end without it): the other pages keep their order.
        WITH ordered AS (
            SELECT id, row_number() OVER (ORDER BY sort_order, id) AS rn FROM pages WHERE parent_id = root_id
        )
        SELECT rn INTO anchor_rank FROM ordered WHERE id = complaint_id;
        IF anchor_rank IS NULL THEN
            SELECT count(*) INTO anchor_rank FROM pages WHERE parent_id = root_id;
        END IF;

        WITH ordered AS (
            SELECT id, row_number() OVER (ORDER BY sort_order, id) AS rn FROM pages WHERE parent_id = root_id
        )
        UPDATE pages p
        SET sort_order = (o.rn + CASE WHEN o.rn > anchor_rank THEN 1 ELSE 0 END) * 10
        FROM ordered o
        WHERE p.id = o.id;

        new_path := root_path || text2ltree(officials_id::text);
        UPDATE pages SET parent_id = root_id, path = new_path, sort_order = (anchor_rank + 1) * 10 WHERE id = officials_id;
        UPDATE pages SET path = new_path || subpath(path, nlevel(officials_path))
        WHERE path <@ officials_path AND id <> officials_id;

        -- It was hidden from the Media left menu; in the section it is one of the four Figma items.
        INSERT INTO page_details (page_id, show_in_side_nav) VALUES (officials_id, true)
        ON CONFLICT (page_id) DO UPDATE SET show_in_side_nav = true;
        RAISE NOTICE 'spec 050: page % moved into the consumer rights section', officials_id;
    END IF;

    -- 2. Figma titles, only over the legacy ones (slugs stay, so addresses do not change).
    UPDATE page_translations t
    SET title = v.title
    FROM (VALUES
        ('bank-xidmetlerinden-istifade-uzre-sikayet-indeksi', 'az', 'Bank xidmətlərindən istifadə üzrə şikayət indeksi', 'Şikayət indeksləri'),
        ('bank-xidmetlerinden-istifade-uzre-sikayet-indeksi', 'en', 'Complaint index on bank customers'' use of bank services', 'Complaint indices'),
        ('kapital-bazari-3', 'az', 'Kapital bazarı', 'Sənədlər'),
        ('kapital-bazari-3', 'en', 'Capital market', 'Documents')
    ) AS v (az_slug, locale, legacy, title)
    JOIN page_translations az ON az.locale = 'az' AND az.slug = v.az_slug
    WHERE t.page_id = az.page_id AND t.locale = v.locale AND t.title = v.legacy;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 050: % titles written', changed;

    -- 3. The root's lead, over the legacy text only.
    UPDATE page_translations t
    SET content = v.content
    FROM (VALUES
        ('az', '5b9a9c14452a9a6811cd82a463600261', $html$<p>Azərbaycan Respublikasının Mərkəzi Bankının mühüm vəzifələrindən biri maliyyə xidmətləri istehlakçılarının və investorların hüquqlarını müdafiə etməkdir.</p><p>Bununla əlaqədar, Mərkəzi Bank istehlakçıların və investorların hüquqlarının müdafiəsi sahəsində aşağıdakı işləri görür:</p><ul><li><p>maliyyə xidmətləri istehlakçılarından və investorlardan Mərkəzi Banka daxil olmuş ərizə və şikayətlərə baxır, onları təhlil edir və qanunvericiliklə müəyyən edilmiş qaydada araşdırmalar aparmaqla müvafiq tədbirlər görür;</p></li><li><p>maliyyə xidmətləri istehlakçılarının və investorların hüquqlarının müdafiəsini, onların pozulmuş hüquqlarının bərpa olunmasını təmin edir;</p></li><li><p>emitentlərdən hesabatları qəbul edir, onları təhlil edir və qanunvericiliklə müəyyən edilmiş qaydada müvafiq tədbirlər görür;</p></li><li><p>maliyyə xidmətləri istehlakçılarının və investorların hüquqlarının pozulması ilə bağlı məhkəmə instansiyalarında iştirak edir;</p></li><li><p>maliyyə xidmətləri istehlakçılarının və investorların hüquqlarının müdafiəsi sahəsində qanun pozuntularının qarşısının alınması, onların pozulmuş hüquqlarının bərpa olunması məqsədi ilə icrası məcburi olan göstərişlər verir, qanunvericiliyi pozan şəxslərin inzibati məsuliyyətə cəlb edilməsi ilə bağlı müvafiq struktur bölməyə məlumat ötürür;</p></li><li><p>vətəndaşların qəbulunu həyata keçirir, problemlərini dinləyir, qeydiyyatını aparır və müvafiq izahat verir;</p></li><li><p>vətəndaşların şifahi müraciətlərini qəbul edir, müraciətlərin cavablandırılmasını təmin edir və qeydiyyatını aparır;</p></li><li><p>nəzarət subyektləri ilə mütəmadi görüşlər təşkil edir;</p></li><li><p>öz səlahiyyətləri çərçivəsində digər tədbirləri həyata keçirir.</p></li></ul>$html$),
        ('en', '623e5506f63f0c84452912009a1c083d', $html$<p>One of the main objectives of the Central Bank of the Republic of Azerbaijan is to protect the rights of financial service consumers and investors.</p><p>In this regard, to protect the rights of consumers and investors the Central Bank:</p><ul><li><p>reviews applications and complaints from financial service consumers and investors, analyzes and investigates them as per the legislation and takes relevant measures;</p></li><li><p>ensures protection of the rights of financial service consumers and investors, and restoration of their violated rights;</p></li><li><p>receives and analyzes reports from issuers, and takes relevant measures as per the legislation;</p></li><li><p>participates in court proceedings related to violation of the rights of financial service consumers and investors;</p></li><li><p>issues binding instructions in order to prevent violations of the legislation on protection of the rights of financial service consumers and investors, provides the relevant structural unit with information on the administrative liability of persons who violate the law;</p></li><li><p>receives citizens, listens to and registers their problems and issues relevant explanations;</p></li><li><p>receives citizens' verbal appeals, ensures that requests are answered and registers them;</p></li><li><p>holds regular meetings with subjects of supervision;</p></li><li><p>takes other measures within its competence.</p></li></ul>$html$)
    ) AS v (locale, legacy_md5, content)
    WHERE t.page_id = root_id AND t.locale = v.locale AND md5(t.content) = v.legacy_md5;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 050: % root texts written', changed;

    -- 4. Methodology after the archive, while the page has none (recognised by its heading).
    UPDATE page_translations t
    SET content = coalesce(t.content, '') || v.content
    FROM (VALUES
        ('bank-xidmetlerinden-istifade-uzre-sikayet-indeksi', 'az', '<h2>Şikayət indeksinin metodologiyası</h2>', $html$<h2>Şikayət indeksinin metodologiyası</h2><p>Banklar üzrə şikayət indeksinin hesablanması üçün aşağıdakı düsturdan istifadə olunmuşdur:</p><blockquote><p>Şikayət indeksi =</p><p>Şikayətlər üzrə bazar payı</p><p>Müştərilər üzrə bazar payı</p></blockquote><p>“Şikayətlər üzrə bazar payı” – Mərkəzi Banka bir ay ərzində daxil olan şifahi, yazılı və vətəndaş qəbulu üzrə şikayətlərin hər bir bank üzrə sayının ümumi bank sektoru üzrə olan şikayətlərin sayına nisbətidir. Təkrar şikayət, eləcə də kredit üzrə güzəştlərin verilməsi, kredit istənilməsi və Mərkəzi Bankın səlahiyyətlərinə aid olmayan digər mövzularla bağlı şikayətlər hesablamadan istisna olunmuşdur.</p><p>“Müştərilər üzrə bazar payı” – cari hesab qalığı 100 manat və yuxarı olan, habelə son üç ayda ən azı bir əməliyyat aparmış bank müştərilərinin hər bir bank üzrə olan sayının ümumi bank sektoru üzrə olan sayına nisbətidir.</p><p>Şikayət indeksinin izahı: İndeks hər-hansı bank tərəfindən göstərilən maliyyə xidmətlərinin həcmi və əhatə dairəsi nəzərə alınmaqla, həmin bankın müştəri xidmətləri ilə bağlı Mərkəzi Banka daxil olan şikayətlərin proporsionallığı prinsipi əsasında hesablanmışdır.</p><p>Qeyd: Şikayət indeksi göstəricisi bankların maliyyə dayanıqlılığı və ya fəaliyyətinin davamlılığı ilə bağlı təhdid yaratmır.</p>$html$),
        ('bank-xidmetlerinden-istifade-uzre-sikayet-indeksi', 'en', '<h2>Complaint index methodology</h2>', $html$<h2>Complaint index methodology</h2><p>The complaint index for banks is calculated with the following formula:</p><blockquote><p>Complaint index =</p><p>Market share in complaints</p><p>Market share in customers</p></blockquote><p>“Market share in complaints” is the ratio of the number of oral, written and reception complaints about each bank received by the Central Bank in a month to the number of complaints about the whole banking sector. Repeated complaints, as well as complaints about loan concessions, loan requests and other matters outside the Central Bank’s authority, are excluded from the calculation.</p><p>“Market share in customers” is the ratio of the number of each bank’s customers with a current account balance of 100 manat or more who made at least one transaction in the last three months to the number of such customers in the whole banking sector.</p><p>Explanation of the complaint index: the index is calculated on the principle of proportionality of the complaints received by the Central Bank about a bank’s customer service, taking into account the volume and scope of the financial services the bank provides.</p><p>Note: The complaint index does not indicate a threat to the financial soundness or the continuity of banks.</p>$html$),
        ('avto-icbari-sigorta-uzre-sikayet-indeksi', 'az', '<h2>Şikayət indeksinin metodologiyası</h2>', $html$<h2>Şikayət indeksinin metodologiyası</h2><p>Müvafiq şikayət indeksinin hesablanması üçün aşağıdakı düsturdan istifadə olunmuşdur:</p><blockquote><p>Şikayət indeksi =</p><p>Şikayətlər üzrə bazar payı</p><p>Bağlanan müqavilələr üzrə bazar payı</p></blockquote><p>Şikayətlər üzrə bazar payı – müvafiq sığortaçı üzrə şikayətlərin ümumi şikayətlərə nisbəti,</p><p>Bağlanan müqavilələr üzrə bazar payı – müvafiq sığortaçı üzrə bağlanan müqavilələrin sayının ümumi müqavilələrin sayına nisbəti.</p><p>Şikayət indeksinin izahı: İndeksin 1.00-dən aşağı olması həmin portfel üzrə xidmət səviyyəsinin digər şirkətlərə nisbətdə yaxşı olduğunu, lakin 1.00-i üstələməsi xidmət səviyyəsinin digər şirkətlərə nəzərən aşağı olduğunu göstərir.</p><p>Qeyd: Şikayət indeksi göstəricisi sığorta şirkətlərinin maliyyə dayanıqlılığı və ya fəaliyyətinin davamlılığı ilə bağlı təhdid yaratmır.</p><p>Avto-icbari sığorta üzrə şikayət indeksi vətəndaşların bu növ üzrə sığorta xidmətlərini əldə edərkən seçim etmələrinə dəstək göstərilməsi məqsədilə hesablanılır və yayımlanır. Şikayət indeksinin hesablanmasında beynəlxalq səviyyədə istifadə olunan metodologiyaya əsaslanaraq avto-icbari sığorta növü üzrə lisenziyası aktiv olan sığorta şirkətləri ilə bağlı daxil olan şikayətlər nəzərə alınmışdır. Eyni zamanda avto-icbari sığorta növünün aparılması üzrə verilən icazənin ləğv edilməsi yolu ilə lisenziyasının qüvvəsi məhdudlaşdırılmış və lisenziyası ləğv olunmuş sığorta şirkətləri ilə bağlı şikayətlərin tənzimlənməsi Mərkəzi Bank tərəfindən əvvəlki qaydada davam etdirilir.</p>$html$),
        ('avto-icbari-sigorta-uzre-sikayet-indeksi', 'en', '<h2>Complaint index methodology</h2>', $html$<h2>Complaint index methodology</h2><p>The complaint index is calculated with the following formula:</p><blockquote><p>Complaint index =</p><p>Market share in complaints</p><p>Market share in contracts concluded</p></blockquote><p>Market share in complaints – the ratio of complaints about the insurer to all complaints,</p><p>Market share in contracts concluded – the ratio of the number of contracts concluded by the insurer to the total number of contracts.</p><p>Explanation of the complaint index: an index below 1.00 shows that the insurer’s service in this portfolio is better than that of other companies; an index above 1.00 shows that it is worse.</p><p>Note: The complaint index does not indicate a threat to the financial soundness or the continuity of insurance companies.</p><p>The compulsory motor third-party liability insurance complaint index is calculated and published to help citizens choose when buying this type of insurance. Following the internationally used methodology, it takes into account complaints about insurance companies with an active licence for this type of insurance. Complaints about insurance companies whose licence for this type has been restricted or revoked are still handled by the Central Bank as before.</p>$html$)
    ) AS v (az_slug, locale, marker, content)
    JOIN page_translations az ON az.locale = 'az' AND az.slug = v.az_slug
    WHERE t.page_id = az.page_id AND t.locale = v.locale AND position(v.marker IN coalesce(t.content, '')) = 0;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 050: % methodology texts written', changed;

    -- 5. "Information request" section of the documents page, while it has none.
    UPDATE page_translations t
    SET content = coalesce(t.content, '') || v.content
    FROM (VALUES
        ('az', '<summary>İnformasiya sorğusu</summary>', $html$<details data-accordion=""><summary>İnformasiya sorğusu</summary><div data-type="details-content"><p>Azərbaycan Respublikası Mərkəzi Bankının sədrinin 06.03.2026-cı il tarixli 21s nömrəli Sərəncamı ilə mediadan daxil olan informasiya sorğuları ilə bağlı Beynəlxalq əməkdaşlıq və kommunikasiya departamentinin direktoru, digər informasiya sorğuları ilə bağlı İstehlakçılarla iş departamentinin direktoru Mərkəzi Bankın informasiya azadlığı üzrə məsul şəxsləri təyin edilmişdir.</p></div></details>$html$),
        ('en', '<summary>Information request</summary>', $html$<details data-accordion=""><summary>Information request</summary><div data-type="details-content"><p>By Order No. 21s of the Governor of the Central Bank of the Republic of Azerbaijan dated 06.03.2026, the Director of the International Cooperation and Communication Department (for information requests from the media) and the Director of the Consumer Relations Department (for other information requests) were appointed as the Central Bank’s officers responsible for freedom of information.</p></div></details>$html$)
    ) AS v (locale, marker, content)
    JOIN page_translations az ON az.locale = 'az' AND az.slug = 'kapital-bazari-3'
    WHERE t.page_id = az.page_id AND t.locale = v.locale AND position(v.marker IN coalesce(t.content, '')) = 0;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 050: % information request sections written', changed;

    -- 6. Pages Figma leaves out of the section's left menu; they keep their addresses.
    INSERT INTO page_details (page_id, show_in_side_nav)
    SELECT t.page_id, false
    FROM page_translations t
    WHERE t.locale = 'az'
      AND t.slug IN (
          'fealiyyet-istiqametleri', 'muracietlere-baxilmasi', 'vetendaslarin-qebulu', 'bizimle-elaqe', 'eks-elaqe',
          'infoqrafika', 'avto-icbari-sigorta-uzre-sikayet-indeksi', 'tedbirler-2', 'teklifler', 'erazi-idarelerine-muraciet',
          'tetbiq-edilmis-nezaret-tedbirleri', 'odenis-xidmetleri', 'reqemsal-firildaqciliq-statistikasi',
          'istehlakcilarin-ve-investorlarin-huquqlari-copy'
      )
    ON CONFLICT (page_id) DO NOTHING;
    GET DIAGNOSTICS changed = ROW_COUNT;
    RAISE NOTICE 'spec 050: % pages left out of the left menu', changed;
END
$seed$;
