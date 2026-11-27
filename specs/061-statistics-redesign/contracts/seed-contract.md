# Seed contract: `0046-statistics-section-seed.sql` (spec 061)

İstifadəçi şərti: "məlumat bazasını korlamamalıyıq". Bu fayl həmin şərtin yoxlanan formasıdır. Generator
`specs/061-statistics-redesign/seed/build-seed.mjs` (`tree.json`, `file-groups.json` → SQL); SQL əl ilə redaktə olunmur.

## Q0 — Qadağalar (review-da `grep` ilə yoxlanır)

- `DELETE`, `TRUNCATE`, `DROP`, `ALTER TABLE`, `CREATE TABLE`, `BEGIN`, `COMMIT` yoxdur.
- Mövcud miqrasiya dəyişmir. Fayl adı hər iki API-də unikaldır (`0046-` hər iki `db/migrations`-da yoxdur).
- `page_translations.slug` heç vaxt dəyişmir (ünvanlar sabitdir).
- `content` yalnız Q6-da, bir səhifədə yazılır.
- Hər `UPDATE`-in `WHERE`-i köhnə dəyəri yoxlayır (Q4–Q8); hər `INSERT` `NOT EXISTS` və ya `ON CONFLICT DO NOTHING` ilədir.

## Q1 — Hüquq və mövcudluq

`has_table_privilege` ilə `pages`, `page_translations`, `page_details`, `page_assets`, `page_asset_translations` üzrə INSERT/UPDATE
yoxlanır; biri yoxdursa `RAISE WARNING 'spec 061: … skipped'` və `RETURN` (0028/0041 nümunəsi). Kök `page_translations(locale='az',
slug='statistika')` ilə tapılır; yoxdursa `RAISE NOTICE` və `RETURN` (boş baza, FR-040).

## Q2 — Səhifələrin tapılması

Hər səhifə az slug ilə (`tree.json`); NSDP az tərcüməsi olmaya bilər, ona görə en slug (`statistical-data-for-nsdp`) ilə. Kökün birbaşa
uşağı olmayan səhifə "köçürülüb" sayılır və ötülür.

## Q3 — Yeni səhifələr (FR-036)

`Metodologiya` / `Methodology` (`metodologiya` / `methodology`) və `Məlumatların reviziyası siyasəti` / `Data revision policy`
(`melumatlarin-reviziyasi-siyaseti` / `data-revision-policy`): kökün altında həmin az başlıqlı və ya slug-lu səhifə yoxdursa yaradılır,
`status = 'published'`, mətn boş, `path` = kök yolu + id. Slug locale-də başqa səhifədədirsə (kökdən kənar) səhifə **yaradılmır**,
`RAISE NOTICE` (sükutla `-2` əlavə etmək ünvanı gözlənilməz edərdi).

## Q4 — Sıra (FR-033)

Kökün uşaqlarının indiki nisbi sırası (`ORDER BY sort_order, id`, yalnız `tree.json`-da tanınan slug-lar) köhnə sıra ilə **tam eyni**dirsə
`sort_order` Figma sırası ilə `10, 20, …` olur. Fərqlidirsə (redaktor dəyişib) sıraya toxunulmur, `RAISE NOTICE`. Yeni yaradılan iki
səhifə Q4-dən sonra yazılır və həmişə Figma yerini alır (Reviziyadan sonra NSDP, sonda "(Kopya)").

## Q5 — Başlıqlar (FR-034)

`research.md` R10 cədvəli: `UPDATE page_translations SET title = new WHERE page_id = … AND locale = … AND title = old`.

## Q6 — Maliyyə sektorunun mətni (FR-035)

az və en: `content` yalnız `content` = Kredit təşkilatları (`kredit-teskilatlari-3`) səhifəsinin həmin dildəki `content`-i ilə **eyni**
olduqda Figma cümləsi (`3487:293093`) və en qaralaması ilə əvəz olunur. Kredit təşkilatlarının mətni dəyişmir.

## Q7 — Fayllar (FR-037, FR-041, FR-042)

`file-groups.json`, səhifələr: `makroiqtisadi-statistika`, `pul-kredit-statistikasi`, `odenis-sistemlerinin-statistikasi`. Fayl açarı:
`page_asset_translations(locale='az')` başlığı, sondakı ` (dd.mm.yyyy)` atılaraq, `legacy` ilə dəqiq bərabər.

1. `group_label` yalnız `group_label IS NULL` olduqda `group` dəyəri.
2. az başlığı yalnız tarixsiz hissə `legacy`-yə bərabər və `legacy <> figma` olduqda `figma || <köhnə tarix suffiksi>`.
3. Yalnız `reorder: true` səhifədə və yalnız səhifənin **bütün** fayllarının tarixsiz az başlıqları `legacyOrder` ilə eyni sırada olduqda
   `sort_order` Figma sırası (`files` sırası) ilə `10, 20, …`.

Bir səhifədə eyni `legacy` başlıqlı iki fayl varsa həmin başlıq üçün 1–2 ötülür (`RAISE NOTICE`).

## Q8 — "(Kopya)" (FR-038)

`statistika-copy` kökü: `INSERT INTO page_details (page_id, show_in_side_nav) VALUES (…, false) ON CONFLICT (page_id) DO NOTHING` —
redaktorun sətri varsa toxunulmur. `page_nav_details` yazılmır: onun yoxluğu (null) açılan menyuların sol menyu bayrağına tabe olması
deməkdir, ona görə qaralama bütün menyulardan çıxır (0041 nümunəsi). Qaralama səhifələri və mətnləri qalır. `group_label` sütunu
`varchar(100)`-dür; ən uzun dəyər (`Daşınar əmlak reyestri | Reyestr`) 32 simvoldur.

## Q9 — Log və idempotentlik (FR-039)

Hər addım `RAISE NOTICE 'spec 061: % …'` say yazır. İkinci işləmədə bütün saylar 0-dır: Q3 `NOT EXISTS`, Q4 artıq Figma sırasıdır
(köhnə sıra tanınmır), Q5/Q7.2 köhnə başlıq yoxdur, Q6 mətn artıq fərqlidir, Q7.1 `group_label` doludur, Q7.3 `legacyOrder` tanınmır,
Q8 `ON CONFLICT`.

## Q10 — Yoxlama (quickstart §4)

Test mühitinin `pg_dump`-ı (və ya PGlite, memory "API-ləri Docker-siz yoxlamaq") üzərində: seed-dən əvvəl/sonra sətir sayları, dəyişən
sətirlərin siyahısı (yalnız Q3–Q8 hədəfləri), ikinci işləmədə 0 dəyişiklik.
