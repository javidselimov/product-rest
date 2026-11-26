-- Memoranda of Understanding (spec 045): the 28 rows of the Figma design (`2208:77938`) and the
-- intro paragraph of the page "Mərkəzi banklarla əməkdaşlıq".
--
-- az text comes from Figma. Neither Figma nor the legacy page has English, so every en name, the
-- en countries and the en intro are draft translations for the editor to check (spec Assumptions).
--
-- Skipped when memorandums already exist, and on an empty database: the dev seed adds the
-- locales only after the migrations, and the translations reference them.

DO $seed$
DECLARE
    item record;
    memorandum integer;
BEGIN
    -- An editor may have added memorandums already; seeding then would duplicate them.
    IF EXISTS (SELECT FROM memorandums) THEN
        RAISE NOTICE 'spec 045: memorandums already exist, seed skipped';
        RETURN;
    END IF;
    -- On an empty database the dev seed adds the locales only after the migrations (as in 0023).
    IF (SELECT count(*) FROM locales WHERE code IN ('az', 'en')) < 2 THEN
        RAISE NOTICE 'spec 045: locales az/en missing (empty database), seed skipped';
        RETURN;
    END IF;

    -- sort_order restarts in each year and follows the order of the design.
    FOR item IN
        SELECT * FROM (VALUES
            (2026, 10, 'Slovakiya Milli Bankı', 'Slovakiya', 'National Bank of Slovakia', 'Slovakia'),
            (2026, 20, 'Rusiya Federasiyasının Mərkəzi Bankı', 'Rusiya', 'Central Bank of the Russian Federation', 'Russia'),
            (2026, 30, 'Qırğız Respublikasının İqtisadiyyat və Ticarət Nazirliyi yanında Maliyyə Bazarının Tənzimlənməsi və Nəzarəti Xidməti', 'Qırğızıstan', 'Financial Market Regulation and Supervision Service under the Ministry of Economy and Commerce of the Kyrgyz Republic', 'Kyrgyzstan'),
            (2026, 40, 'Türkmənistanın Maliyyə və İqtisadiyyat Nazirliyi', 'Türkmənistan', 'Ministry of Finance and Economy of Turkmenistan', 'Turkmenistan'),
            (2026, 50, 'Sudan Mərkəzi Bankı', 'Sudan', 'Central Bank of Sudan', 'Sudan'),
            (2026, 60, 'Macarıstan Mərkəzi Bankı', 'Macarıstan', 'Central Bank of Hungary', 'Hungary'),
            (2026, 70, 'Özbəkistan Respublikasının Perspektivli Layihələr üzrə Milli Agentliyi', 'Özbəkistan', 'National Agency of Perspective Projects of the Republic of Uzbekistan', 'Uzbekistan'),
            (2025, 10, 'Belarus Respublikasının Maliyyə Nazirliyi', 'Belarus', 'Ministry of Finance of the Republic of Belarus', 'Belarus'),
            (2025, 20, 'Türkiyə Sığorta və Özəl Pensiyaları Tənzimləmə və Nəzarət Agentliyi', 'Türkiyə', 'Insurance and Private Pension Regulation and Supervision Agency of Türkiye', 'Türkiye'),
            (2025, 30, 'Çin Xalq Bankı', 'Çin', 'People''s Bank of China', 'China'),
            (2025, 40, 'Qazaxıstan Respublikasının Maliyyə Bazarlarının Tənzimlənməsi və İnkişafı Agentliyi', 'Qazaxıstan', 'Agency of the Republic of Kazakhstan for Regulation and Development of the Financial Market', 'Kazakhstan'),
            (2025, 50, 'Birləşmiş Ərəb Əmirliklərinin Mərkəzi Bankı', 'BƏƏ', 'Central Bank of the United Arab Emirates', 'UAE'),
            (2025, 60, 'Gürcüstan Milli Bankı', 'Gürcüstan', 'National Bank of Georgia', 'Georgia'),
            (2024, 10, 'Özbəkistan Mərkəzi Bankı', 'Özbəkistan', 'Central Bank of the Republic of Uzbekistan', 'Uzbekistan'),
            (2024, 20, 'Qırğız Respublikasının Milli Bankı', 'Qırğızıstan', 'National Bank of the Kyrgyz Republic', 'Kyrgyzstan'),
            (2024, 30, 'Belarus Milli Bankı', 'Belarus', 'National Bank of the Republic of Belarus', 'Belarus'),
            (2023, 10, 'Qazaxıstan Milli Bankı', 'Qazaxıstan', 'National Bank of Kazakhstan', 'Kazakhstan'),
            (2023, 20, 'Tacikistan Milli Bankı', 'Tacikistan', 'National Bank of Tajikistan', 'Tajikistan'),
            (2022, 10, 'Çin Xalq Respublikasının Bank və Sığorta Tənzimləmə Komissiyası', 'Çin', 'China Banking and Insurance Regulatory Commission', 'China'),
            (2022, 20, 'Türkiyə Respublikası Prezidenti Administrasiyasının Maliyyə Ofisi', 'Türkiyə', 'Finance Office of the Presidency of the Republic of Türkiye', 'Türkiye'),
            (2021, 10, 'Türkiyə Kapital Bazarları Şurası', 'Türkiyə', 'Capital Markets Board of Türkiye', 'Türkiye'),
            (2020, 10, 'Türkiyə Respublikasının Mərkəzi Bankı', 'Türkiyə', 'Central Bank of the Republic of Türkiye', 'Türkiye'),
            (2020, 20, 'İtaliya Respublikasının Milli Mikrokredit Agentliyi', 'İtaliya', 'Italian National Microcredit Agency', 'Italy'),
            (2016, 10, 'İran İslam Respublikasının Mərkəzi Bankı', 'İran', 'Central Bank of the Islamic Republic of Iran', 'Iran'),
            (2006, 10, 'Rusiya Federasiyasının Mərkəzi Bankı', 'Rusiya', 'Central Bank of the Russian Federation', 'Russia'),
            (2005, 10, 'Türkiyə Bank Tənzimlənməsi və Nəzarəti Agentliyi', 'Türkiyə', 'Banking Regulation and Supervision Agency of Türkiye', 'Türkiye'),
            (2000, 10, 'Ukrayna Milli Bankı', 'Ukrayna', 'National Bank of Ukraine', 'Ukraine'),
            (1996, 10, 'Pakistan İslam Respublikası Mərkəzi Bankı', 'Pakistan', 'State Bank of Pakistan', 'Pakistan')
        ) AS v(signed_year, sort_order, organization_az, country_az, organization_en, country_en)
    LOOP
        INSERT INTO memorandums (signed_year, sort_order, status)
        VALUES (item.signed_year, item.sort_order, 'published') RETURNING id INTO memorandum;
        INSERT INTO memorandum_translations (memorandum_id, locale, organization, country) VALUES
            (memorandum, 'az', item.organization_az, item.country_az),
            (memorandum, 'en', item.organization_en, item.country_en);
    END LOOP;
END $seed$;

-- The page's intro. The legacy text has none: it opens straight with the first bank's heading line
-- (`<p><strong>…`), and the site cuts the text there while memorandums exist. The intro is put in
-- front of that, per locale and only while the text still opens that way, so a second run and a
-- page an editor has already rewritten are left alone. The old text is kept, not removed.
DO $page$
DECLARE
    target integer;
BEGIN
    IF NOT has_table_privilege('page_translations', 'UPDATE') THEN
        RAISE WARNING 'spec 045: no UPDATE privilege on page_translations, page intro skipped';
        RETURN;
    END IF;

    SELECT t.page_id INTO target
    FROM page_translations t
    WHERE t.locale = 'az' AND t.slug = 'merkezi-banklarla-emekdasliq';
    IF target IS NULL THEN
        RAISE NOTICE 'spec 045: page merkezi-banklarla-emekdasliq not found, page intro skipped';
        RETURN;
    END IF;

    UPDATE page_translations
    SET content = $t$<p>Azərbaycan Respublikasının Mərkəzi Bankı (ARMB) beynəlxalq arenada fəal rol oynamaq məqsədilə öz fəaliyyəti çərçivəsində xarici ölkələrin mərkəzi bankları, maliyyə bazarlarına nəzarət orqanları, rezolyusiya orqanları ilə ikitərəfli formatda sıx əməkdaşlıq edir. Bu çərçivədə ARMB sözügedən qurumlar ilə Anlaşma Memorandumları imzalayaraq texniki əməkdaşlıq və yüksək səviyyəli dialoq fəaliyyəti həyata keçirir. Bu Memorandumların əsas məqsədi monetar siyasət, bank nəzarəti, kapital bazarı, sığorta sektoru, ödəniş sistemləri, maliyyə texnologiyaları sahəsində əməkdaşlıq edilməsi, təcrübə və məlumat mübadiləsinin aparılması, aktual məsələlərin müzakirəsi, təlim, internatura proqramları və seminarların keçirilməsi, texniki məsləhətlərin verilməsi məqsədilə araşdırma və tədqiqat xarakterli səfərlərin təşkilindən ibarətdir.</p>
$t$ || content
    WHERE page_id = target AND locale = 'az' AND ltrim(content, E' \n\r\t') LIKE '<p><strong>%';

    UPDATE page_translations
    SET content = $t$<p>In order to play an active role in the international arena, the Central Bank of the Republic of Azerbaijan (CBA) cooperates closely on a bilateral basis with the central banks, financial market supervisory authorities and resolution authorities of foreign countries. Within this framework the CBA signs Memoranda of Understanding with these institutions and carries out technical cooperation and high-level dialogue. The main purpose of these Memoranda is cooperation in monetary policy, banking supervision, the capital market, the insurance sector, payment systems and financial technologies, the exchange of experience and information, the discussion of topical issues, trainings, internship programmes and seminars, and study and research visits for technical advice.</p>
$t$ || content
    WHERE page_id = target AND locale = 'en' AND ltrim(content, E' \n\r\t') LIKE '<p><strong>%';
END $page$;
