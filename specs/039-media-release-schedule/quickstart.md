# Quickstart: Məlumatların yayımlanması qrafiki — yoxlama bələdçisi

Bu maşında Docker işləmir: API-lər PGlite ilə real SQL üzərində yoxlanır (memory `pglite-api-testing`). `dotnet` PATH-da olmaya bilər: `"C:/Program Files/dotnet/dotnet.exe"`.

## 1. Miqrasiyalar

1. PGlite skripti ilə boş bazaya bütün miqrasiyaları (`0001` … `0023`) tətbiq et → xəta yoxdur.
2. Dump-dan (`schema-new/cbar-schema-and-data-20260914.sql`) bərpa olunmuş bazaya `0022`, `0023` tətbiq et → 2 qrup, 7 dövrilik, 22 sətir; sətir 2 `timing_mode = 3`.
3. `0023`-ü ikinci dəfə işlət → `NOTICE … seed skipped`, say dəyişmir (FR-026).
4. `UPDATE release_schedule_items SET timing_mode = 2 WHERE id = 1` (URL-siz) → `CHECK` pozuntusu.

## 2. api-cbar-admin

1. `dotnet build` hər iki API → 0 xəta. `diff -rq api-cbar/src/Cbar.Domain api-cbar-admin/src/Cbar.Domain` (bin/obj xaric) → fərq yoxdur.
2. `cd openapi && npm run lint && npm run bundle` → 0 xəta / 0 xəbərdarlıq; `node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin` → 0 fərq.
3. Admin ilə daxil ol, `contracts/admin-api.md` əməliyyatlarını işlət:
   - sətir yarat (yalnız az) → 201, `audit_log`-da `release_schedule.item.create`;
   - `timingMode: "link"`, `timingUrl: null` → 400 "A link is required for the link mode.";
   - `timingUrl: "javascript:alert(1)"` → 400;
   - sətri olan qrupu sil → 409; sətri soft-delete et, yenə 409;
   - `moderator` rolunda `release_schedule.*` icazələri var.

## 3. api-cbar

1. `openapi` lint + bundle, `route-diff.mjs api-cbar` → 0 fərq.
2. `GET /api/v1/release-schedule?locale=az` → 2 qrup, 22 sətir, `contracts/public-api.md` forması.
3. Sətri `draft` et / `show_en = false` et / qrupu deaktiv et → müvafiq olaraq itir (en-də itir / qrup itir).
4. Tədbirlərə cari il üçün 3 `type = 1` (biri keçmiş, ikisi gələcək) və gələcəklərdən birinin günündə `type = 2` əlavə et → `decisions.dates` 3, `withPressConference` düzgün, `next` ilk gələcək tarix. Növbəti ilə bir `type = 1` əlavə et, cari ilin gələcəklərini sil → `next` növbəti ilin tarixidir, `dates` yalnız cari il.
5. `cbar_web_ro` rolu ilə qoşulub yazmağa cəhd → permission denied (Maddə III).

## 4. web-cbar-admin-new

1. `npm run verify` (Node 24 və Node 22) → yaşıl; `check:i18n` az/en açarları eyni.
2. `npm run dev` (:5174) → "Yayım qrafiki" menyusu, üç tab; sətir formasında qrup/dövrilik seçimi, rejim "Link" seçib URL boş saxla → forma xətası; "Mətn"-ə qaytar → URL göndərilmir.

## 5. web-cbar-new

1. `npm run verify` (Node 24 və Node 22) → yaşıl; `app/metadata.test.ts` route siyahısında `/media/release-schedule`.
2. `npm run dev` (:3001) və ya `local:testcbar` + fikstür proxy (memory `hybrid-fixture-proxy-for-ui-measuring`, test API-də endpoint yoxdursa):
   - `/az/media/release-schedule`: başlıq, giriş (köhnə cədvəl yoxdur), axtarış, 2 qrup, 22 sətir;
   - `?q=INFLYASIYA` → yalnız "İllik inflyasiya" və onun qrupu; "Filtrləri təmizlə" → hamısı;
   - `?q=zzz` → boş nəticə mesajı;
   - "Qrafikə uyğun ↗" → modal; Escape → bağlanır, fokus linkə qayıdır; JS söndürülüb → `/az/media/events?type=1`;
   - `/en/media/release-schedule` → en mətnlər, modal en etiketləri;
   - `/page-72/x`, `/en/page-72/x?language=en`, `/az/melumatlarin-yayimlanmasi-qrafiki` → 308 yeni route-a;
   - `api-cbar` dayandırılıb və ya qrafik boşdur → səhifə açılır, CMS mətni köhnə cədvəli ilə görünür, axtarış və xəta mesajı yoxdur.
3. Ölçü (Edge CDP, `getBoundingClientRect`, memory `figma-measure-dom`): 1728, 744, 390 enlərdə `contracts/ui-contract.md` cədvəlləri — sütun enləri 440/260/282 və 300/160/202, başlıq sətri 56, qrup sətri 61, axtarış sahəsi 672×54, modal 560, plitə 122×108. 744-də scrollbar 15px-i nəzərə al.

## 6. Redaktor addımları (yayımdan sonra)

`web-cbar-new/docs/media-cms-guide.md`: səhifə 130-u Media altına keçir (sol menyu), giriş mətnini Figma cümləsi ilə yenilə; Tədbirlərdə cari ilin qərar tarixlərini daxil et / yoxla; seed-də ⚑ işarəli sətirləri yoxla.
