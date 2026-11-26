# Quickstart: spec 053 — yoxlama

Docker bu maşında işləmir. API-lər PGlite + socket ilə real SQL üzərində yoxlanır (yaddaş: "API-ləri Docker-siz yoxlamaq"). Köməkçi skriptlər
repo-lokal `.tmp-053/`-dədir (commit olunmur). Ünvanlar kök `CLAUDE.md`-dədir.

## 1. Seed generatoru

1. `node specs/053-fincert-page/seed/extract.mjs` test API-dən səhifə `fincert`-in az/en mətnini oxuyur və `fincert-az.json`, `fincert-en.json`
   yazır. Yoxlama çıxışı: `az: mission ok, directions 4, email fincert@cbar.az, rfc f7322827bd3688a2be3136204.pdf`, en üçün eyni (rfc
   `02c3d655e376515419c623ce2.pdf`).
2. `node specs/053-fincert-page/seed/build-seed.mjs` → `api-cbar-admin/db/migrations/0037-fincert-seed.sql`. Faylı ikinci dəfə qurmaq eyni baytları
   verir.

## 2. Sxem və köçürmə (api-cbar-admin)

1. `dotnet build` (iki API). `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş olmalıdır.
2. PGlite bazasına `0001…0035` tətbiq olunur, test API-dən səhifə 133 (`fincert`) və 479 (`fincert-copy`) yüklənir.
3. API başladılır, `0036`, `0037` tətbiq olunur. `NOTICE`: `spec 053: fincert seeded (directions 4, memberships 1, rfc az=url en=url)`.
   `page_details`-də 479 üçün `show_in_side_nav = false`.
4. API yenidən başladılır: yeni sətir yoxdur. `fincert_directions`-dən birini silib (`deleted_at`) `0037`-ni əl ilə yenidən işlətmək: heç nə yaranmır.
5. Boş bazada (`0001…0037`, səhifəsiz) xəta yoxdur, sətir yaranmır.

## 3. Admin API

`POST /api/v1/auth/login`, sonra:

| Sorğu | Gözlənilən |
|---|---|
| `GET /fincert/settings` | `email fincert@cbar.az`, `translations.az.rfcUrl` köhnə link |
| `PUT /fincert/settings` `email: "fincert(at)cbar.az"` | 400 `problem+json`, `errors.email` |
| `PUT /fincert/settings` `portalUrl: "portal.e-cbar.az"` | 400 |
| `PUT /fincert/settings` düzgün, `translations.en` göndərilmir | 200, en dəyişmir; `audit_log`-da `fincert.settings_update` |
| `GET /fincert/directions` | 4 sətir, `number` 1–4, `locales ["az","en"]` |
| `POST /fincert/directions` yalnız az başlıq, mətnsiz | 400 (yarımçıq dil) |
| `PUT /fincert/directions/order` 3 id (4 lazımdır) | 400 |
| `PUT /fincert/memberships/{id}` `logoMediaId` = PDF media | 400 (şəkil deyil) |

## 4. Public API (api-cbar, `cbar_web_ro`)

| Sorğu | Gözlənilən |
|---|---|
| `GET /api/v1/fincert?locale=az` | missiya, 4 istiqamət, portal, `rfc.url` köhnə link, 1 üzvlük |
| `GET …?locale=en` | en mətnləri, 4 istiqamət, `rfc.url` en linki |
| bir istiqaməti `draft` et | 3 istiqamət |
| en başlığı silinmiş istiqamət | en-də yoxdur, az-da var |
| RFC media faylı yüklənib `rfcMediaId` yazılır | `rfc.file.url` `/media/{id}`, `mimeType application/pdf` |
| `cbar_web_ro` ilə `INSERT INTO fincert_directions …` | permission denied |

`route-diff.mjs` hər iki API-də təmiz qalmalıdır.

## 5. Admin panel

`cd product-rest/web-cbar-admin-new && npm run verify` (lint, `check:kit`, `check:i18n`, `check:layout-fixtures`, `tsc -b`, test, build) keçməlidir.
`npm run roundtrip -- "Haqqımızda" "Pul siyasəti"` dəyişməz qalmalıdır (redaktora extension əlavə olunmur). Əl ilə (`npm run dev`, :5174):

- Sidebar-da "FinCERT" (Sual-cavab-dan sonra). Üç tab işləyir.
- Ümumi formada telefonu dəyişib yadda saxla, səhifəni yenilə: dəyər qalır. Dəyişib başqa menyuya keç: soruşur.
- "Səhifələr" → FinCERT: sol menyuda "FinCERT" aktivdir, formada keçid kartı. Səhifə 122: "Memorandumlar" aktiv, "Beynəlxalq əməkdaşlıq" açıq.
  Adi səhifə: "Səhifələr" aktiv. Mobil enlikdə menyu pəncərəsində eyni.

## 6. Sayt

`cd product-rest/web-cbar-new && npm run verify` keçməlidir; testlər Node 22 ilə də işlədilir. Əl ilə (`npm run dev`, :3001):

| Ünvan | Gözlənilən |
|---|---|
| `/az/fincert` | Figma sırası ilə 6 bölmə, akkordionlar bağlı, açılır |
| `/en/fincert` | en mətnləri, eyni bölmələr |
| `/az/fincert#rfc-2350` | RFC bölməsindən açılır, header altında qalmır |
| `/page-893/fincert`, `/en/page-893/fincert`, `/page-893/fincert?language=en` | 308 → `/az/fincert`, `/en/fincert`, `/en/fincert` |
| api-cbar dayandırılıb və ya `GET /fincert` 500 | səhifə 133-ün köhnə CMS mətni |
| JS söndürülüb | hər şey görünür, akkordionlar açılır |

**Ölçmə**: 1728, 744, 390 enliklərində Figma rəqəmləri (`contracts/ui-contract.md`) DOM `getBoundingClientRect` ilə tutuşdurulur, fərq ≤ 2 px (SC-001).
Test API-də endpoint hələ yoxdursa: MSW fikstürü + test API-yə forward edən Node proxy (yaddaş: "Fikstür proxy ilə UI ölçmə"), ölçmə Edge CDP ilə.

## 7. Sənədlər

- `web-cbar-new/docs/fincert-cms-guide.md` (yeni) və `dokumentasiyalar/fincert-guide.md` (yeni, azərbaycanca idarəetmə təlimatı) + `dokumentasiyalar/README.md`
  sətri;
- kök `CLAUDE.md`: web-cbar-new bəndi (FinCERT məzmun növü), admin bölməsi, sol menyu aktivliyi qaydası;
- `web-cbar-new/CLAUDE.md`, `web-cbar-admin-new/CLAUDE.md`;
- `specs/046-international-memberships/contracts/admin-nav.md` (sidebar sırası);
- `business_logic/` (`/sync-business-logic`), hər iki API-nin `openapi/` (spec-first, əvvəlcədən).
