-- The existing information disclosure schedule (spec 039): the hand-typed table of CMS page 130
-- (legacy page 72), as groups, periodicities and rows. Nothing here writes to pages: the page keeps its
-- text, and the site leaves its old table out while rows exist.
--
-- Texts come from the page as of the 2026-09-14 dump (specs/039-media-release-schedule/data-model.md
-- §Seed), trimmed of trailing colons and spaces. Rows 15–19 had no periodicity or timing in the old
-- table; they get the values the Figma shows, for editors to review. The "according to the schedule"
-- row opens the decisions dialog instead of the old yearly page. A migration runs once, so a later
-- deploy cannot overwrite an edit.
--
-- Skipped when any of the tables already has rows, and on an empty database: the dev seed adds the
-- locales only after the migrations, and the translations reference them.
DO $seed$
DECLARE
    g_monetary integer;
    g_legal integer;
    p_annual integer;
    p_quarterly integer;
    p_monthly integer;
    p_daily integer;
    p_on_change integer;
    p_on_decision integer;
    p_on_draft integer;
    new_item integer;
    r record;
BEGIN
    IF EXISTS (SELECT FROM release_schedule_groups)
       OR EXISTS (SELECT FROM release_schedule_periodicities)
       OR EXISTS (SELECT FROM release_schedule_items) THEN
        RAISE NOTICE 'spec 039: release schedule content already exists, seed skipped';
        RETURN;
    END IF;
    IF (SELECT count(*) FROM locales WHERE code IN ('az', 'en')) < 2 THEN
        RAISE NOTICE 'spec 039: locales az/en missing (empty database), seed skipped';
        RETURN;
    END IF;

    INSERT INTO release_schedule_groups (sort_order) VALUES (10) RETURNING id INTO g_monetary;
    INSERT INTO release_schedule_group_translations (group_id, locale, name) VALUES
        (g_monetary, 'az', 'Pul və məzənnə siyasəti üzrə'),
        (g_monetary, 'en', 'Monetary and exchange rate policy');
    INSERT INTO release_schedule_groups (sort_order) VALUES (20) RETURNING id INTO g_legal;
    INSERT INTO release_schedule_group_translations (group_id, locale, name) VALUES
        (g_legal, 'az', 'Normativ-hüquqi baza üzrə'),
        (g_legal, 'en', 'Normative and legal base');

    INSERT INTO release_schedule_periodicities (sort_order) VALUES (10) RETURNING id INTO p_annual;
    INSERT INTO release_schedule_periodicities (sort_order) VALUES (20) RETURNING id INTO p_quarterly;
    INSERT INTO release_schedule_periodicities (sort_order) VALUES (30) RETURNING id INTO p_monthly;
    INSERT INTO release_schedule_periodicities (sort_order) VALUES (40) RETURNING id INTO p_daily;
    INSERT INTO release_schedule_periodicities (sort_order) VALUES (50) RETURNING id INTO p_on_change;
    INSERT INTO release_schedule_periodicities (sort_order) VALUES (60) RETURNING id INTO p_on_decision;
    INSERT INTO release_schedule_periodicities (sort_order) VALUES (70) RETURNING id INTO p_on_draft;
    INSERT INTO release_schedule_periodicity_translations (periodicity_id, locale, name) VALUES
        (p_annual, 'az', 'İllik'), (p_annual, 'en', 'Annually'),
        (p_quarterly, 'az', 'Rüblük'), (p_quarterly, 'en', 'Quarterly'),
        (p_monthly, 'az', 'Aylıq'), (p_monthly, 'en', 'Monthly'),
        (p_daily, 'az', 'Gündəlik'), (p_daily, 'en', 'Daily'),
        (p_on_change, 'az', 'İnformasiyanın dəyişməsindən asılı olaraq'), (p_on_change, 'en', 'Depending on updates'),
        (p_on_decision, 'az', 'Qərar müvafiq qaydada təsdiq edildikdə'), (p_on_decision, 'en', 'When decisions are accordingly approved'),
        (p_on_draft, 'az', 'Yeni layihə müzakirələrə təqdim edildikdə'), (p_on_draft, 'en', 'When new drafts are released');

    FOR r IN
        SELECT * FROM (VALUES
            (g_monetary, 10, p_annual, 1,
             $rs$Pul siyasətinin əsas istiqamətləri (Bəyanat)$rs$, $rs$Dekabr ayının 31-dək$rs$,
             $rs$Main directions of the monetary policy (Statement)$rs$, $rs$Up to December 31$rs$),
            (g_monetary, 20, p_on_decision, 3,
             $rs$Pul siyasəti ilə bağlı qəbul olunan qərarlar$rs$, $rs$Qrafikə uyğun$rs$,
             $rs$Monetary policy related decisions$rs$, $rs$According to the schedule$rs$),
            (g_monetary, 30, p_quarterly, 1,
             $rs$Pul siyasəti icmalı$rs$, $rs$Növbəti aydan sonrakı ayın 15-dək$rs$,
             $rs$Monetary Policy Review$rs$, $rs$Up to the 15th day of the month following the next month$rs$),
            (g_monetary, 40, p_daily, 1,
             $rs$Pul bazarının kəmiyyət göstəriciləri$rs$, $rs$Dərhal$rs$,
             $rs$Quantitative indicators of the money market$rs$, $rs$Instantly$rs$),
            (g_monetary, 50, p_on_change, 1,
             $rs$Pul siyasəti alətləri haqqında press-relizlər$rs$, $rs$Dərhal$rs$,
             $rs$Press releases on monetary policy tools$rs$, $rs$Instantly$rs$),
            (g_monetary, 60, p_monthly, 1,
             $rs$İllik inflyasiya$rs$, $rs$Növbəti ayın 20-dək$rs$,
             $rs$12-month inflation$rs$, $rs$Up to the 20th day of the following month$rs$),
            (g_monetary, 70, p_daily, 1,
             $rs$AZN məzənnəsi$rs$, $rs$Dərhal$rs$,
             $rs$AZN exchange rate$rs$, $rs$Instantly$rs$),
            (g_monetary, 80, p_monthly, 1,
             $rs$Monetar göstəricilər$rs$, $rs$Növbəti ayın 10-dək$rs$,
             $rs$Monetary indicators$rs$, $rs$Up to the 10th day of the following month$rs$),
            (g_monetary, 90, p_on_change, 1,
             $rs$Pul Siyasəti və Maliyyə Sabitliyi Komitəsi haqqında məlumat$rs$, $rs$Dərhal$rs$,
             $rs$Information on the Monetary Policy and Financial Stability Committee$rs$, $rs$Instantly$rs$),
            (g_legal, 10, p_on_change, 1,
             $rs$Normativ-xarakterli aktlar$rs$, $rs$Normativ hüquqi aktların vahid internet elektron reyestrinə daxil edildikdən sonra$rs$,
             $rs$Regulations$rs$, $rs$Upon entry to the unified Internet electronic registry of normative acts of legal nature$rs$),
            (g_legal, 20, p_on_draft, 1,
             $rs$Normativ-xarakterli aktların layihələri$rs$, $rs$Dərhal$rs$,
             $rs$Draft regulations$rs$, $rs$Instantly$rs$),
            (g_legal, 30, NULL::integer, 1,
             $rs$Statistik hesabatların yayımlanması qrafiki$rs$, $rs$“Statistika” bölməsində yerləşdirilib$rs$,
             $rs$The schedule of statistical releases$rs$, $rs$Placed in the ‘Statistics’ section$rs$),
            (g_legal, 40, p_annual, 1,
             $rs$Audit rəyi ilə təsdiq olunmuş ilin yekunlarına dair konsolidə edilmiş (birləşdirilmiş) maliyyə hesabatı$rs$, $rs$İyun ayının 30-dək$rs$,
             $rs$Audited consolidated financial statements for the year-end$rs$, $rs$Until June 30$rs$),
            (g_legal, 50, p_on_change, 1,
             $rs$Ödəniş və hesablaşmalar sistemləri üzrə məlumatlar$rs$, $rs$Dərhal$rs$,
             $rs$Payment and settlement systems$rs$, $rs$Instantly$rs$),
            (g_legal, 60, p_on_change, 1,
             $rs$Milli pul nişanları üzrə məlumatlar$rs$, $rs$Dərhal$rs$,
             $rs$National currency$rs$, $rs$Instantly$rs$),
            (g_legal, 70, p_on_change, 1,
             $rs$Nəşrlər və tədqiqatlar üzrə məlumatlar$rs$, $rs$Dərhal$rs$,
             $rs$Publications and research$rs$, $rs$Instantly$rs$),
            (g_legal, 80, p_on_change, 1,
             $rs$Maliyyə savadlılığı üzrə məlumatlar$rs$, $rs$Dərhal$rs$,
             $rs$Financial literacy$rs$, $rs$Instantly$rs$),
            (g_legal, 90, p_on_change, 1,
             $rs$Beynəlxalq əməkdaşlıq üzrə$rs$, $rs$Dərhal$rs$,
             $rs$International cooperation$rs$, $rs$Instantly$rs$),
            (g_legal, 100, p_on_change, 1,
             $rs$Ümumi kommunikasiya məlumatları$rs$, $rs$Dərhal$rs$,
             $rs$Communication$rs$, $rs$Instantly$rs$),
            (g_legal, 110, p_monthly, 1,
             $rs$Maliyyə xidmətləri istehlakçılarının müraciətlərinə dair statistik məlumatlar$rs$, $rs$Növbəti ayın 10-dək$rs$,
             $rs$Statistical information on appeals of financial service consumers$rs$, $rs$Up to the 10th day of the following month$rs$),
            (g_legal, 120, p_monthly, 1,
             $rs$Bank xidmətlərindən istifadə üzrə “şikayət indeksi”$rs$, $rs$Növbəti ayın 10-dək$rs$,
             $rs$Complaint index on bank customers' use of bank services$rs$, $rs$Up to the 10th day of the following month$rs$),
            (g_legal, 130, p_monthly, 1,
             $rs$Avtonəqliyyat vasitəsi sahiblərinin mülki məsuliyyətinin icbari sığortası üzrə “şikayət indeksi”$rs$, $rs$Növbəti ayın 10-dək$rs$,
             $rs$Complaint index on compulsory civil liability insurance of vehicle owners$rs$, $rs$Up to the 10th day of the following month$rs$)
        ) AS v(group_id, sort_order, periodicity_id, timing_mode, title_az, timing_az, title_en, timing_en)
    LOOP
        INSERT INTO release_schedule_items (group_id, periodicity_id, timing_mode, sort_order, status)
        VALUES (r.group_id, r.periodicity_id, r.timing_mode, r.sort_order, 'published')
        RETURNING id INTO new_item;

        INSERT INTO release_schedule_item_translations (item_id, locale, title, timing) VALUES
            (new_item, 'az', r.title_az, r.timing_az),
            (new_item, 'en', r.title_en, r.timing_en);
    END LOOP;
END $seed$;
