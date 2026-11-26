-- International financial institutions (spec 044): the four organizations of the Figma design
-- (`2172:3599`) and the page title and intro of "Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq".
--
-- az text comes from Figma; en text from the legacy page 121 where it had one, otherwise it is a
-- draft translation for the editor to check (spec Assumptions). Logos are not seeded: they are
-- files, uploaded through the panel. SECO, on the legacy page but not in Figma, is not added; its
-- old text stays in the page and the site cuts it while organizations exist.
--
-- Skipped when organizations already exist, and on an empty database: the dev seed adds the
-- locales only after the migrations, and the translations reference them.

DO $seed$
DECLARE
    org integer;
    membership bigint;
BEGIN
    -- An editor may have added organizations already; seeding then would duplicate them.
    IF EXISTS (SELECT FROM ifi_organizations) THEN
        RAISE NOTICE 'spec 044: organizations already exist, seed skipped';
        RETURN;
    END IF;
    -- On an empty database the dev seed adds the locales only after the migrations (as in 0023).
    IF (SELECT count(*) FROM locales WHERE code IN ('az', 'en')) < 2 THEN
        RAISE NOTICE 'spec 044: locales az/en missing (empty database), seed skipped';
        RETURN;
    END IF;

    -- World Bank Group
    INSERT INTO ifi_organizations (website_url, member_since, sort_order, status)
    VALUES ('https://www.worldbank.org', 1992, 10, 'published') RETURNING id INTO org;
    INSERT INTO ifi_organization_translations (organization_id, locale, name, mission, membership_intro, content) VALUES
        (org, 'az', 'Dünya Bankı Qrupu',
         $t$Dünya Bankının (DB) əsas missiyası yoxsulluğun azaldılması və ümumi rifah halının artırılmasından ibarətdir.$t$,
         $t$Azərbaycan DB Qrupuna daxil olan beş quruma aşağıda qeyd olunan tarixlərdə üzv olmuşdur:$t$,
         $t$<p>Azərbaycan Respublikası Mərkəzi Bankının (ARMB) sədri DB-də Azərbaycan üzrə müdirdir.</p><p>Azərbaycan DB ilə Ölkə Tərəfdaşlıq Çərçivəsi (ÖTÇ) üzrə əməkdaşlıq edir. ÖTÇ Azərbaycan Hökuməti tərəfindən müəyyən olunmuş ehtiyac və prioritetlərə əsaslanan tərəfdaşlıq planıdır. Ölkədə makroiqtisadi vəziyyətin təhlili, effektiv monetar siyasətin həyata keçirilməsi, eyni zamanda DB ilə birgə həyata keçirilən layihələrin müzakirə edilməsi məqsədilə Azərbaycanda səfərdə olan DB-nin missiyası ilə ARMB-nin rəhbərliyinin mütəmadi görüşləri təşkil edilir və məsləhətləşmələr aparılır.</p><p>ARMB DB ilə əməkdaşlıq çərçivəsində müxtəlif texniki yardım layihələri həyata keçirir.</p>$t$),
        (org, 'en', 'World Bank Group',
         $t$The main mission of the World Bank (WB) is to reduce poverty and increase shared prosperity.$t$,
         $t$The Republic of Azerbaijan became the member of the five institutions in the WB Group on the following dates:$t$,
         $t$<p>The CBA Governor is the Governor for Azerbaijan at the World Bank Group.</p><p>Azerbaijan cooperates with the World Bank within the Country Partnership Framework (CPF). The CPF is a partnership plan based upon needs and priorities determined by the Azerbaijani Government. The WB mission to Azerbaijan and the CBA management regularly meet and conduct consultations to analyze macroeconomic situation in the country, implement an effective monetary policy, as well as discuss joint projects.</p><p>The Central Bank is implementing various technical assistance projects as part of cooperation with the World Bank.</p>$t$);

    INSERT INTO ifi_memberships (organization_id, joined_on, sort_order) VALUES (org, '1992-09-18', 1) RETURNING id INTO membership;
    INSERT INTO ifi_membership_translations (membership_id, locale, name) VALUES
        (membership, 'az', 'Beynəlxalq Yenidənqurma və İnkişaf Bankı'),
        (membership, 'en', 'The International Bank for Reconstruction and Development');
    INSERT INTO ifi_memberships (organization_id, joined_on, sort_order) VALUES (org, '1992-09-23', 2) RETURNING id INTO membership;
    INSERT INTO ifi_membership_translations (membership_id, locale, name) VALUES
        (membership, 'az', 'Çoxtərəfli İnvestisiya Zəmanətləri Agentliyi'),
        (membership, 'en', 'The Multilateral Investment Guarantee Agency');
    INSERT INTO ifi_memberships (organization_id, joined_on, sort_order) VALUES (org, '1992-10-18', 3) RETURNING id INTO membership;
    INSERT INTO ifi_membership_translations (membership_id, locale, name) VALUES
        (membership, 'az', 'Beynəlxalq İnvestisiya Mübahisələrinin Həlli Mərkəzi'),
        (membership, 'en', 'The International Center for the Settlement of Investment Disputes');
    INSERT INTO ifi_memberships (organization_id, joined_on, sort_order) VALUES (org, '1995-03-31', 4) RETURNING id INTO membership;
    INSERT INTO ifi_membership_translations (membership_id, locale, name) VALUES
        (membership, 'az', 'Beynəlxalq İnkişaf Assosiasiyası'),
        (membership, 'en', 'The International Development Association');
    INSERT INTO ifi_memberships (organization_id, joined_on, sort_order) VALUES (org, '1995-10-11', 5) RETURNING id INTO membership;
    INSERT INTO ifi_membership_translations (membership_id, locale, name) VALUES
        (membership, 'az', 'Beynəlxalq Maliyyə Korporasiyası'),
        (membership, 'en', 'The International Finance Corporation');

    -- International Monetary Fund
    INSERT INTO ifi_organizations (website_url, member_since, sort_order, status)
    VALUES ('https://www.imf.org', 1992, 20, 'published') RETURNING id INTO org;
    INSERT INTO ifi_organization_translations (organization_id, locale, name, mission, membership_intro, content) VALUES
        (org, 'az', 'Beynəlxalq Valyuta Fondu',
         $t$Beynəlxalq Valyuta Fondunun (BVF) əsas missiyası davamlı inkişaf və rifaha nail olmaqdan ibarətdir.$t$,
         NULL,
         $t$<p>Azərbaycan BVF-yə 1992-ci ildə üzv olmuşdur. ARMB-nin sədri BVF-də Azərbaycan üzrə əvəzedici müdirdir.</p><p>BVF-nin ekspertlərinin ARMB-yə mütəmadi səfərləri təşkil edilir. Bu səfərlər zamanı inflyasiyanın səviyyəsinin tənzimlənməsi və proqnozların sabitləşdirilməsi üçün ARMB-nin apardığı siyasət, məzənnə və faiz dərəcəsi siyasəti, müdaxilə və sterilizasiya, manatla pul bazasının artımı, valyuta ehtiyatlarının diversifikasiya planları və digər məsələlər barədə BVF ekspertləri ilə müzakirələr aparılır.</p>$t$),
        (org, 'en', 'International Monetary Fund',
         $t$The main mission of the International Monetary Fund (IMF) is to achieve sustainable growth and prosperity.$t$,
         NULL,
         $t$<p>Azerbaijan became the IMF member in 1992. Governor of the CBA is the Alternate Governor for Azerbaijan at the IMF.</p><p>The IMF experts pay regular visits to the CBA, which are fueled by different discussions on CBA policies aimed at decrease in the inflation rate in a short run, and stabilization of inflationary expectations in a medium run, the exchange rate and interest rate policies, intervention, and sterilization, increase in money base in manat, and a diversification plan for foreign exchange reserves and other issues.</p>$t$);

    -- Asian Development Bank
    INSERT INTO ifi_organizations (website_url, member_since, sort_order, status)
    VALUES ('https://www.adb.org', 1999, 30, 'published') RETURNING id INTO org;
    INSERT INTO ifi_organization_translations (organization_id, locale, name, mission, membership_intro, content) VALUES
        (org, 'az', 'Asiya İnkişaf Bankı',
         $t$Asiya İnkişaf Bankının (AİB) əsas missiyası yoxsulluğun aradan qaldırılması, firavan, inklüziv, davamlı və dayanıqlı inkişafa nail olmaqdan ibarətdir.$t$,
         NULL,
         $t$<p>Azərbaycan AİB-ə 1999-cu ildə üzv olmuşdur.</p><p>ARMB AİB ilə əməkdaşlıq çərçivəsində müxtəlif texniki yardım layihələri həyata keçirir.</p>$t$),
        (org, 'en', 'Asian Development Bank',
         $t$The main mission of the Asian Development Bank (ADB) is to eradicate poverty and achieve prosperous, inclusive, resilient and sustainable development.$t$,
         NULL,
         $t$<p>Azerbaijan became a member of the ADB in 1999.</p><p>The Central Bank of Azerbaijan closely cooperates with the Asian Development Bank (ADB) and implements various technical assistance projects as part of this cooperation.</p>$t$);

    -- European Bank for Reconstruction and Development (not on the legacy page: en is a draft)
    INSERT INTO ifi_organizations (website_url, member_since, sort_order, status)
    VALUES ('https://www.ebrd.com', 1992, 40, 'published') RETURNING id INTO org;
    INSERT INTO ifi_organization_translations (organization_id, locale, name, mission, membership_intro, content) VALUES
        (org, 'az', 'Avropa Yenidənqurma və İnkişaf Bankı',
         $t$Avropa Yenidənqurma və İnkişaf Bankının (AYİB) əsas məqsədi ekoloji və sosial cəhətdən sağlam və davamlı inkişafı təşviq etməkdən ibarətdir.$t$,
         NULL,
         $t$<p>Azərbaycan AYİB-ə 1992-ci ildə üzv olmuşdur.</p><p>ARMB AYİB ilə əməkdaşlıq çərçivəsində müxtəlif texniki yardım layihələri həyata keçirir.</p>$t$),
        (org, 'en', 'European Bank for Reconstruction and Development',
         $t$The main purpose of the European Bank for Reconstruction and Development (EBRD) is to promote environmentally and socially sound and sustainable development.$t$,
         NULL,
         $t$<p>Azerbaijan became a member of the EBRD in 1992.</p><p>The CBA implements various technical assistance projects as part of cooperation with the EBRD.</p>$t$);
END $seed$;

-- The page takes the Figma title and intro only while its az title is still the legacy one, so an
-- editor's change is kept and a second run changes nothing. The old organization list stays in the
-- text below the intro as a fallback (the site cuts it while organizations exist). Slugs do not change.
DO $page$
DECLARE
    ifi_page integer;
BEGIN
    IF NOT has_table_privilege('page_translations', 'UPDATE') THEN
        RAISE WARNING 'spec 044: no UPDATE privilege on page_translations, page title and intro skipped';
        RETURN;
    END IF;

    SELECT t.page_id INTO ifi_page
    FROM page_translations t JOIN pages p ON p.id = t.page_id
    WHERE t.locale = 'az' AND t.slug = 'beynelxalq-teskilatlarla-emekdasliq'
      AND t.title = 'Beynəlxalq təşkilatlarla əməkdaşlıq' AND p.deleted_at IS NULL;
    IF ifi_page IS NULL THEN
        RAISE NOTICE 'spec 044: page not found or already retitled, page left as it is';
        RETURN;
    END IF;

    UPDATE page_translations
    SET title = 'Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq',
        content = $t$<p>Azərbaycan Respublikasının Mərkəzi Bankı (ARMB) Dünya Bankı Qrupu, Beynəlxalq Valyuta Fondu, Asiya İnkişaf Bankı və Avropa Yenidənqurma və İnkişaf Bankı ilə əməkdaşlıq edir.</p>$t$ || coalesce(content, '')
    WHERE page_id = ifi_page AND locale = 'az';

    UPDATE page_translations
    SET content = $t$<p>The Central Bank of the Republic of Azerbaijan (CBA) cooperates with the World Bank Group, the International Monetary Fund, the Asian Development Bank and the European Bank for Reconstruction and Development.</p>$t$ || coalesce(content, '')
    WHERE page_id = ifi_page AND locale = 'en';
END $page$;
