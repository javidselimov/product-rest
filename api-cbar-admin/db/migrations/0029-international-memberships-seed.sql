-- Membership in international organizations (spec 046): the 14 rows of the Figma design (`2287:120701`)
-- written into the page text of "Beynəlxalq təşkilatlarda üzvlük" as an ordinary editor table.
--
-- The site reads the first table of that page (organization | year) and sorts it itself; there is no
-- content type, so only `page_translations` is touched and no schema changes. az text comes from Figma.
-- Figma has no English: every en name is a draft translation for the editor to check (spec Assumptions).
--
-- Written only over the placeholder: an empty page text or the editor's "Beynəlxalq təşkilatlarda üzvlük"
-- paragraph. An en translation is written when it is missing or is still the editor's copy of the az one
-- (same title, placeholder text). A page the editor has filled is left alone, so the file can run again.
-- The table markup is the form the admin editor saves (`fixtures/layouts/memberships.html`), so opening
-- and saving the page does not change it.

DO $seed$
DECLARE
    target integer;
    az_title text;
    en_row page_translations%ROWTYPE;
    az_table text;
    en_table text;
    placeholder constant text := '<p>Beynəlxalq təşkilatlarda üzvlük</p>';
    en_title constant text := 'Membership in international organizations';
    en_slug constant text := 'membership-in-international-organizations';
BEGIN
    -- In shared environments the table may belong to another role (see `0028`).
    IF NOT has_table_privilege('page_translations', 'UPDATE') OR NOT has_table_privilege('page_translations', 'INSERT') THEN
        RAISE WARNING 'spec 046: no UPDATE/INSERT privilege on page_translations, membership table skipped';
        RETURN;
    END IF;

    SELECT t.page_id, t.title INTO target, az_title
    FROM page_translations t
    WHERE t.locale = 'az' AND t.slug = 'beynelxalq-teskilatlarda-uzvluk';
    IF target IS NULL THEN
        RAISE NOTICE 'spec 046: page beynelxalq-teskilatlarda-uzvluk not found, membership table skipped';
        RETURN;
    END IF;

    -- Header row in `th` cells (the editor's "insert table" makes one), then the rows in the design's order.
    WITH membership_rows (ord, az, en, year) AS (
        VALUES
            (1, 'Beynəlxalq Maliyyə İstehlakçılarının Müdafiəsi Təşkilatı', 'International Financial Consumer Protection Organisation (FinCoNet)', '2025'),
            (2, 'İqtisadi Əməkdaşlıq və İnkişaf Təşkilatının Beynəlxalq Maliyyə Savadlılığı Şəbəkəsi', 'OECD International Network on Financial Education (OECD/INFE)', '2025'),
            (3, 'Berlin Qrup üzrə Açıq Maliyyə İşçi Qrupu', 'Berlin Group Open Finance Task Force', '2025'),
            (4, 'Qlobal Maliyyə İnnovasiyaları Şəbəkəsi', 'Global Financial Innovation Network (GFIN)', '2025'),
            (5, 'Beynəlxalq Qiymətli Kağızlar Komissiyaları Təşkilatının “Artım və inkişaf etməkdə olan bazarlar Komitəsi”', 'Growth and Emerging Markets Committee of the International Organization of Securities Commissions', '2024'),
            (6, 'Beynəlxalq Pul Nişanları Assosiasiyası', 'International Currency Association', '2022'),
            (7, 'Dayanıqlı Bankçılıq və Maliyyə Şəbəkəsi', 'Sustainable Banking and Finance Network (SBFN)', '2022'),
            (8, 'Beynəlxalq Qiymətli Kağızlar Komissiyaları Təşkilatı', 'International Organization of Securities Commissions (IOSCO)', '2020'),
            (9, 'Beynəlxalq Sığorta Nəzarəti Qurumları Assosiasiyası', 'International Association of Insurance Supervisors (IAIS)', '2020'),
            (10, 'Bazel Komitəsinin Bazel Konsultativ Qrupu', 'Basel Consultative Group of the Basel Committee', '2020'),
            (11, 'MDB-yə üzv dövlətlərin qiymətli kağızlar bazarının tənzimlənməsi üzrə səlahiyyətli orqanlarının rəhbərləri Şurası', 'Council of Heads of Securities Market Regulators of the CIS Member States', '2020'),
            (12, 'Maliyyə Savadlılığı üzrə Beynəlxalq Şəbəkə', 'International Network on Financial Education', '2011'),
            (13, 'Pulların Saxtalaşdırılmasına qarşı Mərkəzi Banklar Qrupu', 'Central Bank Counterfeit Deterrence Group (CBCDG)', '2005'),
            (14, 'Mərkəzi Asiya, Qara Dəniz Regionu və Balkan ölkələrinin Mərkəzi Bank Sədrləri Klubu', 'Club of Governors of Central Banks of Central Asia, the Black Sea Region and the Balkan Countries', '1997')
    ),
    cells AS (
        SELECT
            string_agg('<tr><td colspan="1" rowspan="1"><p>' || az || '</p></td><td colspan="1" rowspan="1"><p>' || year || '</p></td></tr>', '' ORDER BY ord) AS az_rows,
            string_agg('<tr><td colspan="1" rowspan="1"><p>' || en || '</p></td><td colspan="1" rowspan="1"><p>' || year || '</p></td></tr>', '' ORDER BY ord) AS en_rows
        FROM membership_rows
    )
    SELECT
        '<table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody>'
            || '<tr><th colspan="1" rowspan="1"><p>Təşkilat</p></th><th colspan="1" rowspan="1"><p>Üzvlük tarixi</p></th></tr>'
            || az_rows || '</tbody></table>',
        '<table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody>'
            || '<tr><th colspan="1" rowspan="1"><p>Organization</p></th><th colspan="1" rowspan="1"><p>Year of membership</p></th></tr>'
            || en_rows || '</tbody></table>'
    INTO az_table, en_table
    FROM cells;

    -- az: only over the placeholder (whitespace ignored).
    UPDATE page_translations
    SET content = az_table
    WHERE page_id = target AND locale = 'az'
      AND btrim(regexp_replace(coalesce(content, ''), '\s+', ' ', 'g')) IN ('', '<p></p>', placeholder);

    -- en: missing, or still the editor's copy of the az page.
    SELECT * INTO en_row FROM page_translations WHERE page_id = target AND locale = 'en';
    IF NOT FOUND THEN
        IF EXISTS (SELECT FROM page_translations WHERE locale = 'en' AND slug = en_slug) THEN
            RAISE WARNING 'spec 046: en slug % is taken, en membership page skipped', en_slug;
            RETURN;
        END IF;
        INSERT INTO page_translations (page_id, locale, title, slug, content)
        VALUES (target, 'en', en_title, en_slug, en_table);
    ELSIF en_row.title = az_title
      AND btrim(regexp_replace(coalesce(en_row.content, ''), '\s+', ' ', 'g')) IN ('', '<p></p>', placeholder) THEN
        UPDATE page_translations
        SET title = en_title,
            content = en_table,
            slug = CASE
                WHEN EXISTS (SELECT FROM page_translations o WHERE o.locale = 'en' AND o.slug = en_slug AND o.id <> en_row.id)
                    THEN slug
                ELSE en_slug
            END
        WHERE id = en_row.id;
    END IF;
END $seed$;
