# Quickstart: spec 057 — yoxlama

Lokal Docker bu maşında işləmir (yaddaş: `dotnet-sdk-local-build`). Real SQL yoxlaması PGlite + socket ilədir (yaddaş: `pglite-api-testing`),
frontendlər test API-yə qarşı da işlədilə bilər (`npm run local:testcbar`). `dotnet` PATH-da yoxdursa: `C:/Program Files/dotnet/dotnet`.

## 1. OpenAPI (spec-first)

```bash
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle
cd product-rest/api-cbar/openapi && npm run lint && npm run bundle
node .claude/skills/sync-openapi/scripts/route-diff.mjs   # after the controllers: no missing / extra route
```

Gözlənilən: admin spec-də `/api/v1/homepage-strategy-docs`, `/{id}`, `/order`. Public spec-də `Homepage.strategyDocs` (`StrategyDoc[]`).

## 2. Sxem və köçürmə (api-cbar-admin)

```bash
cd product-rest/api-cbar-admin && dotnet build CbarAdminApi.slnx && dotnet test CbarAdminApi.slnx
```

PGlite bazasında API-ni işə sal, sonra yoxla:

- `schema_migrations`-da `0043-homepage-strategy-docs.sql` və `0044-homepage-strategy-docs-seed.sql` var.
- Bazada 104/66/76 səhifələri varsa, `homepage_strategy_docs`-da 3 sətir (`published`, `page_id` doludur) və 6 tərcümə var. Yoxdursa 0 sətir, xəta
  yoxdur.
- API-ni yenidən başlat → sətir sayı dəyişmir.
- `permissions`-da dörd `homepage_strategy_docs.*` kodu, moderatorda dördü də.

## 3. Admin API

`admin` token ilə (`CREDENTIALS.md`):

| Sorğu | Gözlənilən |
|---|---|
| `GET /api/v1/homepage-strategy-docs` | 3 sətir, `sortOrder` 1..3, `linkBroken: false` |
| `POST` başlıqsız | 400, `errors["translations.az.title"]` |
| `POST` səhifəsiz və ünvansız | 400, `errors.pageId` |
| `POST` `url: "javascript:alert(1)"` | 400, `errors["translations.az.url"]` |
| `POST` `coverMediaId` = PDF | 400, `errors["translations.az.coverMediaId"]` |
| `POST` `status: "scheduled"` | 400 |
| `PUT /order` `{ids:[3,1,2]}` | 204. Siyahı 3, 1, 2. `audit_log`-da bir `strategy_doc_reorder` |
| `PUT /order` id-lərin biri yoxdur | 400 |
| `DELETE /{id}` | 204. Siyahıda yoxdur, sətir `deleted_at` ilə qalır |

## 4. Public API (api-cbar, `cbar_web_ro`)

```bash
cd product-rest/api-cbar && dotnet build CbarWebApi.slnx && dotnet test CbarWebApi.slnx
curl "http://localhost:5139/api/v1/homepage?locale=az" | jq .strategyDocs
curl "http://localhost:5139/api/v1/homepage?locale=en" | jq .strategyDocs
```

- az: 3 sənəd, `href` `/maliyye-sektorunun-inkisaf-strategiyasi` və s., `coverUrl: null`.
- en: eyni 3 sənəd, en slug-ları.
- Səhifə 66-nı qaralamaya keçir → o sənəd hər iki dildən düşür. Sənədə en `url` əlavə et → en-də yenidən görünür (`href` = url).
- Sənədi `draft` et → düşür. `cbar_web_ro` ilə yazma cəhdi yoxdur (yalnız SELECT).

## 5. Admin panel

```bash
cd product-rest/web-cbar-admin-new && npm run verify
npm run dev   # :5174, or npm run local:testcbar after the API is deployed to test
```

- "Ana səhifə blokları" → "Strategiya və sənədlər" tabı və hub kartı var.
- Siyahının təsviri ilk üç qaydasını deyir. "Sıranı dəyiş" sırasını dəyişir, siyahı yenilənir.
- Yeni sənəd: səhifə axtarışla seçilir, az üz qabığı seçicisində PDF-lər söndürülüb. Yadda saxla → siyahıda görünür.
- Başlıqsız yadda saxla → xəta az tabında başlıq altındadır. Formanı dəyişib tabdan çıx → panel soruşur.

## 6. Sayt

```bash
cd product-rest/web-cbar-new && npm run verify
npm run dev   # :3001
```

- `/az`: blok 3 sənədi admin sırası ilə göstərir. Birinci böyük kartdır, kartlar CMS səhifələrinə aparır. `/en`: en başlıqları və en ünvanları.
- Admin-də sırası dəyiş → 10 saniyə ərzində ana səhifə yeni sıranı göstərir.
- Xarici ünvanlı sənəd → kart yeni vərəqdə açılır.
- Bütün sənədləri qaralama et → blok yoxdur, Təqvim tək qalır.
- 1728 / 744 / 390 enliklərində blok bugünkü ölçülərdədir (Figma `813:25097`, `831:4378`). Ölçü `getBoundingClientRect` ilə alınır (yaddaş:
  `figma-measure-dom`), yana sürüşmə yoxdur.
- Node 22 ilə də: `npx -y node@22 node_modules/vitest/vitest.mjs run` (yaddaş: `run-tests-on-node22`).

## 7. Strategiya səhifəsi və köhnə ünvanlar (US4)

```bash
cd product-rest/web-cbar-admin-new && npx vitest run src/features/rich-text/roundtrip.test.ts   # strategy-letter fixture unchanged
cd product-rest/web-cbar-new && npx vitest run src/proxy.test.ts
cd tools/media-backfill && node import-strategy-page.mjs --plan && node import-strategy-page.mjs --dry-run
node import-strategy-page.mjs --apply      # test env .env; run twice: the second run writes nothing
```

- `--plan`: üç fayl, ölçülər 768 848 / 36 573 801 / 32 901 902 bayt, səhifələr 104 və 105 tapılıb, az/en qərarı `written`.
- `--apply`-dan sonra test API-də:
  - `GET /api/v1/pages/maliyye-sektorunun-inkisaf-strategiyasi?locale=az` portreti, `<h3>`, imzanı və `/media/{id}` PDF linkini qaytarır;
  - `GET /media/{id}` üç fayl üçün 200 qaytarır. HEAD 405 verir, ona görə GET işlədilir.
- İkinci `--apply`: `pages.az = 'same'`, yeni media yoxdur.
- 104-ün az mətnini əl ilə dəyiş, aləti yenidən işlət → `pages.az = 'edited'`, mətnə toxunulmayıb.
- Sayt (`npm run local:testcbar`):
  - `/az/maliyye-sektorunun-inkisaf-strategiyasi`: sağda portret, müraciət, sağa düzlənmiş imza, PDF linki; sol menyuda 105; 390-da portret tam enə yayılır,
    yana sürüşmə yoxdur;
  - header, mobil menyu və footer-də "Maliyyə sektorunun inkişaf Strategiyası" yerindədir.
- Yönləndirmələr (`curl -sI`): `/pages/strategy`, `/pages/strategy?language=en`, `/en/pages/strategy`, `/page-872/x`, `/page-878`,
  `/2024_2026_Azerbaijani.pdf`, `/2024_2026_English.pdf` → 308 və düzgün `location`.
- Admin-də 104-ü aç və dəyişmədən yadda saxla → sayt eyni görünür (FR-022).

## 8. Sənədlər

- `dokumentasiyalar/ana-sehife-bloklari-guide.md`-də yeni tab: sahələr, ilk üç qaydası, üz qabığı ölçüləri, `specs/057-homepage-strategy-docs/assets/`
  faylları.
- Kök `CLAUDE.md`, `web-cbar-new/CLAUDE.md`, `web-cbar-admin-new/CLAUDE.md`-də qısa qeyd.
- `/sync-business-logic`, `/sync-openapi` → `# Sync:` sətirləri yenilənib.
