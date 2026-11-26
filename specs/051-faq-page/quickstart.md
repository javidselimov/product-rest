# Quickstart — 051 Sual-cavab (FAQ) yoxlaması

Bu maşında Docker işləmir (memory): API-ləri PGlite + socket ilə yoxla (`pglite-api-testing`), UI-ni fikstür proxy və ya test API ilə ölç
(`hybrid-fixture-proxy-for-ui-measuring`). `dotnet` `C:/Program Files/dotnet`-dədir.

## 0. Seed generatoru

```bash
cd specs/051-faq-page/seed
node extract-faq.mjs            # test API → faq-az.json; mövzu/sual saylarını çap edir (8 mövzu; Pul siyasəti 23, Valyuta 6 …)
node build-seed.mjs             # faq-az.json + topic-names-en.json → product-rest/api-cbar-admin/db/migrations/0033-faq-seed.sql
```

Gözlənilən: saylar köhnə HTML-dəki tək bəndli sual sətirləri ilə eynidir; 8 mövzunun en adı var. Sual/cavab en tərcüməsi təxirə salınıb.

## 1. API-lər

```bash
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle     # spec-first (faq.yaml)
cd product-rest/api-cbar/openapi && npm run lint && npm run bundle
"C:/Program Files/dotnet/dotnet" build product-rest/api-cbar-admin
"C:/Program Files/dotnet/dotnet" build product-rest/api-cbar
node .claude/skills/sync-openapi/scripts/route-diff.mjs                      # route-diff təmiz
git diff --no-index product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain   # boş (Maddə V.1)
```

Boş bazada (PGlite): `api-cbar-admin` start → 0032, 0033 tətbiq olunur; ikinci start → 0033 heç nə etmir. Sonra:

- `GET /api/v1/faq?locale=az` → 8 mövzu, `topics[0].questions.length == 23`, 1 video.
- `GET /api/v1/faq?locale=en` → `topics: []` (en sualı yoxdur — mövzu görünmür); admin-də bir suala en əlavə et → həmin mövzu en-də görünür.
- `GET /api/v1/faq/topics?pageId=<pul-siyaseti id>` → `[{ slug: 'pul-siyaseti', name: 'Pul siyasəti', questionCount: 23 }]`.
- Admin: mövzu yarat/redaktə/sıra; sualı başqa mövzuya keçir (sayı dəyişir); sualı olan mövzunu sil → 409; səhv YouTube linki → 400; audit_log sətirləri.
- Qaralama sual public-də görünmür; yalnız az doldurulmuş sual en-də görünmür.

## 2. Sayt (web-cbar-new)

```bash
cd product-rest/web-cbar-new && npm run verify
```

Əl ilə (test API + fikstür proxy, ya da lokal stack):

| Ünvan | Gözlənilən |
|---|---|
| `/az/sual-cavab` | A: 8 bağlı mövzu kartı, saylar; JS söndürülüb — akkordeonlar işləyir |
| `/az/sual-cavab?q=REPO` | yalnız uyğun suallar, açıq; `?q=İNFLYASİYA` = `?q=inflyasiya` |
| `/az/sual-cavab?topic=valyuta-ehtiyatlarinin-idare-olunmasi` | B: başlıq + 6 nömrəli sual |
| `/az/sual-cavab?topic=yoxdur` | A, xəta yox |
| `/en/faq` | seed-dən sonra "tapılmadı" (en səhifə yoxdur); en fikstürü ilə testdə en şablonu |
| `/az/pul-siyaseti` | mətndən sonra keçid kartı "Pul siyasəti üzrə sual-cavab · 23 sual · Bax →" → B |
| `/az/sual-cavab#sual-<id>` | həmin sualın mövzusu və sualı açıq, səhifə ona sürüşüb |
| istənilən səhifənin footer-i | "Naviqasiya" sütununda "Sual-cavab" linki |
| `/az/sual-cavab` (A) | mövzu seçimi yoxdur, axtarış tam endə; açıq kartda "Ayrıca aç" → B |
| `/page-131/sual-cavab` | 308 → `/az/sual-cavab` (`?language=en` → `/en/faq`, en səhifə yaranana qədər "tapılmadı") |

Ölçmə: Edge CDP ilə 1728/744/390 enlərində `getBoundingClientRect` → `contracts/ui-contract.md` (2 px tolerans), səhifə üfüqi sürüşməsi yoxdur
(744-də scrollbar 15 px — memory).

## 3. Admin (web-cbar-admin-new)

```bash
cd product-rest/web-cbar-admin-new && npm run verify
npm run roundtrip -- "Haqqımızda" "Pul siyasəti"     # rich-text extension dəyişməyib, yenə də cavab fikstürü üçün işlət
```

Əl ilə (moderator rolu): "Sual-cavab" menyusu → Suallar tabında "Pul siyasəti" tabı → "Yeni sual" mövzu seçilmiş açılır → az/en sual + cədvəlli cavab
yaz → saxla → saytda görünür (< 2 dəq, SC-004). Mövzu formunda sualı sürüşdür və klaviatura ilə yuxarı keçir → saytda nömrə dəyişir (SC-005).
Videolar: səhv link xətası, önizləmə, sıralama. Səhifə formu: `sual-cavab` səhifəsində bölmə kartı, `pul-siyaseti`-də "FAQ bloku" kartı.

## 4. Testlər Node 22 ilə də

Lokal Node 24, CI node:22 (memory) — `verify`-ı Node 22 ilə də işlət.

## 5. Deploy sırası

`api-cbar-admin` (0032 + 0033) → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`. Canlı köhnə FAQ ünvanını (`page-<id>/…`) produksiya dump-ında
yoxla (R12) — `page-131` deyilsə `proxy.ts` regex-i dəyişir.
