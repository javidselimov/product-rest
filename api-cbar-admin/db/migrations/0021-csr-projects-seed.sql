-- The four existing CSR projects and their categories (spec 038). Until now they were text in one CMS
-- page. Card titles and summaries did not exist there; the Azerbaijani ones come from Figma, the
-- English ones are drafts for editors to review. Nothing here writes to pages: the old text stays in
-- the page, and the site leaves it out once the projects reach it.
--
-- Photos come from the page's own assets by their az title, since ids differ between environments.
-- A missing page or photo is skipped, so an empty database does not block a deploy, and editors add
-- the photos in the admin panel. A database that already has categories or projects is left alone.
DO $seed$
DECLARE
    csr_page integer;
    new_category integer;
    new_project integer;
    copied integer;
BEGIN
    IF EXISTS (SELECT FROM csr_categories) OR EXISTS (SELECT FROM csr_projects) THEN
        RAISE NOTICE 'spec 038: CSR content already exists, seed skipped';
        RETURN;
    END IF;

    SELECT t.page_id INTO csr_page
    FROM page_translations t
    JOIN pages p ON p.id = t.page_id
    WHERE t.locale = 'az' AND t.slug = 'korporativ-sosial-mesuliyyet' AND p.deleted_at IS NULL;

    IF csr_page IS NULL THEN
        RAISE NOTICE 'spec 038: CSR page not found, projects are seeded without photos';
    END IF;

    INSERT INTO csr_categories (sort_order) VALUES (10) RETURNING id INTO new_category;
    INSERT INTO csr_category_translations (category_id, locale, name) VALUES
        (new_category, 'az', $csr$Maliyyə savadlılığı$csr$),
        (new_category, 'en', $csr$Financial literacy$csr$);

    INSERT INTO csr_projects (category_id, sort_order, status)
    VALUES (new_category, 10, 'published')
    RETURNING id INTO new_project;
    INSERT INTO csr_project_translations (project_id, locale, card_title, summary, title, content) VALUES
        (new_project, 'az',
         $csr$Maliyyə savadlılığı$csr$,
         $csr$Mərkəzi Bankın maliyyə savadlılığı və iqtisadi maariflənmə istiqamətində intellektual layihələrini birləşdirən xüsusi layihə.$csr$,
         $csr$“Maliyyə savadlılığı” layihəsi$csr$,
         $csr$<p>“Maliyyə savadlılığı” layihəsi Azərbaycan Respublikası Mərkəzi Bankının təhsillə bağlı müxtəlif intellektual əsaslı layihələrini birləşdirən xüsusi layihədir. Mərkəzi Bank hədəf qruplarının maliyyə savadlılığı və iqtisadi maariflənməsi istiqamətində sistemli şəkildə və institusional əsasda fəaliyyət göstərir. Layihənin genişmiqyaslı və çoxsaylı məhsulları barədə aşağıdakı portallardan ətraflı məlumat əldə etmək olar:</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://bizimpullar.az/">https://bizimpullar.az</a></p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://edu.e-cbar.az/">https://edu.e-cbar.az</a></p>$csr$),
        (new_project, 'en',
         $csr$Financial literacy$csr$,
         $csr$A dedicated project combining the Central Bank’s intellectual projects on financial literacy and economic awareness.$csr$,
         $csr$‘Financial literacy’$csr$,
         $csr$<p>‘Financial literacy’ is a dedicated project that combines various education related intellectual projects of the Central Bank. The Bank provides systemic and institutional activities for the sake of financial literacy and economic awareness of its target groups. For more information on numerous large-scale products of the project please go to:</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://bizimpullar.az/">https://bizimpullar.az</a></p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://edu.e-cbar.az/">https://edu.e-cbar.az</a></p>$csr$);

    INSERT INTO csr_categories (sort_order) VALUES (20) RETURNING id INTO new_category;
    INSERT INTO csr_category_translations (category_id, locale, name) VALUES
        (new_category, 'az', $csr$Təhsil$csr$),
        (new_category, 'en', $csr$Education$csr$);

    INSERT INTO csr_projects (category_id, sort_order, status)
    VALUES (new_category, 20, 'published')
    RETURNING id INTO new_project;
    INSERT INTO csr_project_translations (project_id, locale, card_title, summary, title, content) VALUES
        (new_project, 'az',
         $csr$Biləsuvar lisey-məktəb kompleksi$csr$,
         $csr$Mərkəzi Bankın dəstəyi ilə fəaliyyət göstərən, 28 sinif otağı olan müasir təhsil kompleksi.$csr$,
         $csr$Biləsuvar şəhərində Milli Qəhrəman Mübariz İbrahimov adına müasir lisey-məktəb kompleksi$csr$,
         $csr$<p>Mərkəzi Bankın dəstəyi ilə Biləsuvar şəhərində Azərbaycan Respublikasının Milli Qəhrəmanı Mübariz İbrahimovun adını daşıyan müasir təhsil lisey-məktəb kompleksi fəaliyyət göstərir.</p><p>Məktəbin pedaqoji kollektivi test üsulu ilə keçirilən silsilə imtahanlar vasitəsilə seçilmişdir. Ümumi sahəsi 1,3 hektar olan təhsil kompleksində müasir beynəlxalq standartlara cavab verən işıqlandırma, havalandırma, isitmə-soyutma sistemləri, su təmizləyici qurğu quraşdırılıb. Liseydə 28 sinif otağı (müəllimlər otağı, fənn kabinetləri, laboratoriyalar, kompüter zalı), idman və rəqs zalları fəaliyyət göstərir. Kompleksdə həmçinin müasir standartlara cavab verən Wi-Fi internet şəbəkəsi ilə təchiz edilmiş kitabxana da fəaliyyət göstərir, eləcə də sinif otaqlarına 5 elektron lövhə (“ağıllı lövhə”) də quraşdırılıb. Birinci mərtəbədə fəaliyyət göstərən “Açıq Sinif” otağında valideynlər arzu edilən təqdirdə dərslərin gedişatını birbaşa izləyə bilərlər.</p><p>Təhsil sisteminin keyfiyyətini artırmaq məqsədi ilə liseydə ödənişsiz təhsil, lisey geyim forması və gündə iki dəfə isti yeməklə pulsuz təminat, aztəminatlı uşaqlara yardım məqsədi ilə xüsusi lisey fondu, 5-40 kilometr məsafədə yaşayan şagird və müəllimlərin xüsusi avtobuslarla daşınması təşkil olunub.</p><p>Təhsil kompleksində şagirdlərin asudə vaxtlarını səmərəli keçirmələri məqsədilə müxtəlif klublar, dərnəklər, idman seksiyaları, mahnı və rəqs ansamblı, lisey teatrının yaradılması nəzərdə tutulub. Sosial yönlü təhsil proqramları çərçivəsində “Məktəb jurnalistikası” və “Debat” kimi layihələr həyata keçirilir.</p><p>Liseydə bir neçə xarici dilin öyrədilməsi əsas prioritetlərdən biridir.</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://www.facebook.com/bilasuvareducomplex/">https://www.facebook.com/bilasuvareducomplex/</a></p>$csr$),
        (new_project, 'en',
         $csr$Bilasuvar lyceum-school complex$csr$,
         $csr$A modern educational complex with 28 classrooms, functioning with the support of the Central Bank.$csr$,
         $csr$Bilasuvar lyceum – school complex named after Mubariz Ibrahimov, the National Hero$csr$,
         $csr$<p>A modern lyceum-school complex named after Mubariz Ibrahimov, the National Hero of the Republic of Azerbaijan is functioning in the town of Bilasuvar at the support of the Central Bank.</p><p>Pedagogical staff of the school is selected by a series of test examinations. The educational complex with total 1,3 ha area has lighting, cooling, heating and water purifying systems up to international standards. There are 28 classroms (a teachers’ room, studies, labs, computer hall), sport and dance halls in the lyceum. The complex also has a wi-fi equipped library, and 5 e-boards (smart board) are installed in classrooms. Parents, if willing, may live observe lessons in the ‘Open classroom’ located on the first floor.</p><p>To increase the level of education, the lyceum provides free-of-charge education, lyceum uniform, hot meals twice a day, a special aid fund for children from low-income families, and a service bus for pupils and teachers residing in the distance of 5-40 kms.</p><p>To help childern have an effective leasure time the lyceum is planning to launch various clubs, circles, sport sections, a song and dance ensemble, and a lyceum theatre. The ‘School journalism’ and ‘Debate’ projects are implemented as part of the social oriented educational programs.</p><p>The lyceum has prioritized teaching of several foreign languages.</p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://www.facebook.com/bilasuvareducomplex/">https://www.facebook.com/bilasuvareducomplex/</a></p>$csr$);

    INSERT INTO csr_project_images (project_id, media_id, sort_order)
    SELECT new_project, a.media_id, row_number() OVER (ORDER BY a.sort_order, a.id)
    FROM page_assets a
    JOIN page_asset_translations t ON t.page_asset_id = a.id AND t.locale = 'az'
    WHERE a.page_id = csr_page AND t.title LIKE 'bilesuvar-nba-%'
    ON CONFLICT (project_id, media_id) DO NOTHING;
    GET DIAGNOSTICS copied = ROW_COUNT;
    RAISE NOTICE 'spec 038: % photos copied for %', copied, 'bilesuvar-nba';

    INSERT INTO csr_categories (sort_order) VALUES (30) RETURNING id INTO new_category;
    INSERT INTO csr_category_translations (category_id, locale, name) VALUES
        (new_category, 'az', $csr$Ekologiya$csr$),
        (new_category, 'en', $csr$Ecology$csr$);

    INSERT INTO csr_projects (category_id, sort_order, status)
    VALUES (new_category, 30, 'published')
    RETURNING id INTO new_project;
    INSERT INTO csr_project_translations (project_id, locale, card_title, summary, title, content) VALUES
        (new_project, 'az',
         $csr$Kağızı emal et – ağacları xilas et$csr$,
         $csr$Tullantı kağızlarının yenidən emalı ilə ildə ən azı 60 ağacın kəsilməsinin qarşısı alınır.$csr$,
         $csr$“Kağızı emal et – ağacları xilas et” layihəsi$csr$,
         $csr$<p>Mərkəzi Bankda “Kağızı emal et – ağacları xilas et” şüarı altında tullantı kağızlarının yenidən emalı sub-layihəsi həyata keçirilir. Layihənin məqsədi tullantı kağızlarını emal şirkətlərinə təhvil verərək bu tullantıların yenidən istehsala yönəldilməsi ilə ətraf mühitin və təbiətin qorunması işinə töhfə verməkdən ibarətdir. Sözügedən layihə il ərzində təqribən 4 tona yaxın kağız tullantısının emala təhvil verilməsinə imkan verir ki, bu da ildə ən azı 60 ədəd ağacın sənaye məqsədilə kəsilməsinin qarşısının alınması deməkdir.</p>$csr$),
        (new_project, 'en',
         $csr$Recycle paper – save trees$csr$,
         $csr$Recycling waste paper prevents the cutting of at least 60 trees a year.$csr$,
         $csr$‘Recycle paper – save trees’$csr$,
         $csr$<p>The Central Bank implements a waste paper recycling sub-project under the motto ‘Recycle paper – save trees’. The goal of the project is to deliver the paper to recycling companies contributing to environmental and nature protection by channelling the waste paper to re-production. The project in question allows to deliver about 4 ton of paper to recycling over a year, which prevents cutting off of at least 60 trees for industrial purposes a year.</p>$csr$);

    INSERT INTO csr_categories (sort_order) VALUES (40) RETURNING id INTO new_category;
    INSERT INTO csr_category_translations (category_id, locale, name) VALUES
        (new_category, 'az', $csr$Səhiyyə$csr$),
        (new_category, 'en', $csr$Healthcare$csr$);

    INSERT INTO csr_projects (category_id, sort_order, status)
    VALUES (new_category, 40, 'published')
    RETURNING id INTO new_project;
    INSERT INTO csr_project_translations (project_id, locale, card_title, summary, title, content) VALUES
        (new_project, 'az',
         $csr$Qanvermə aksiyası$csr$,
         $csr$Mərkəzi Bankın əməkdaşlarının könüllü iştirakı ilə mütəmadi keçirilən qanvermə aksiyası.$csr$,
         $csr$Qanvermə aksiyası$csr$,
         $csr$<p>Mərkəzi Bankda mütəmadi olaraq qanvermə aksiyası təşkil olunur.</p><p>Azərbaycan Talassemiya Federasiyasının əməkdaşlarının, həmçinin B.Ə.Eyvazov adına Elmi Tədqiqat Hematologiya və Transfuziologiya İnstitutunun Mərkəzi Qan Bankının mobil işçi qrupunun iştirakı ilə keçirilən qanvermə aksiyasında könüllü iştirak edən Mərkəzi Bankın əməkdaşları əvvəlcə tibbi müayinədən keçirilir.</p><p>Tədarük olunan qan və qandan hazırlanan preparatlardan hemofiliyalı və talassemiyalı, həmçinin qana ehtiyacı olan insanların müalicəsində istifadə olunur.</p>$csr$),
        (new_project, 'en',
         $csr$Blood donation$csr$,
         $csr$Regular blood donation campaigns with the voluntary participation of Central Bank employees.$csr$,
         $csr$Blood donation$csr$,
         $csr$<p>The Central Bank holds regular blood donation campaigns.</p><p>Volunteering Bank employees pass a medical check for the blood donation action, carried out by the employees of the Azerbaijan Thalassemia Federation and the mobile task force of the Central Blood Bank of the Scientific Research Hematology and Trans-Physiology Institute named after B.A.Eyvazov.</p><p>Collected blood is used in treatment of patients with hemophilia and thalassemia, as well as for people in need of blood.</p>$csr$);

    INSERT INTO csr_project_images (project_id, media_id, sort_order)
    SELECT new_project, a.media_id, row_number() OVER (ORDER BY a.sort_order, a.id)
    FROM page_assets a
    JOIN page_asset_translations t ON t.page_asset_id = a.id AND t.locale = 'az'
    WHERE a.page_id = csr_page AND t.title LIKE 'qanverme_%'
    ON CONFLICT (project_id, media_id) DO NOTHING;
    GET DIAGNOSTICS copied = ROW_COUNT;
    RAISE NOTICE 'spec 038: % photos copied for %', copied, 'qanverme';
END $seed$;
