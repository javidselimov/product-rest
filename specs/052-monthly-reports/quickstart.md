# Quickstart: spec 052 — yoxlama

Docker bu maşında işləmir. API-lər PGlite + socket ilə real SQL üzərində yoxlanır (yaddaş: "API-ləri Docker-siz yoxlamaq"). Ünvanlar kök
`CLAUDE.md`-dədir.

## 1. Sxem və köçürmə (api-cbar-admin)

1. `dotnet build` (iki API). `diff -rq product-rest/api-cbar/src/Cbar.Domain product-rest/api-cbar-admin/src/Cbar.Domain` boş olmalıdır.
2. PGlite bazasına `0001…0033` tətbiq olunur, sonra test API-dən 95, 96, 93-ün az/en `content`-i və onların `/media/N` id-ləri üçün
   `media_assets` sətirləri yüklənir. Bunun üçün köməkçi skript `.tmp-052/` qovluğunda olur (repo-lokal, commit olunmur).
3. API başladılır və `0034`, `0035` tətbiq olunur. `NOTICE` sətirlərində bunlar gözlənilir:
   - `bank-complaint-index az=32 en=32`;
   - `insurance-complaint-index az=45 en=41`;
   - `infographics az=65 en=0`.
4. API yenidən başladılır. Yeni sətir yaranmamalıdır (`schema_migrations` + seriya qoruyucusu).
5. Boş bazada (`0001…0035`, səhifəsiz) xəta olmamalı, sətir yaranmamalıdır.

## 2. Admin API

`POST /api/v1/auth/login`, sonra:

| Sorğu | Gözlənilən |
|---|---|
| `GET /monthly-reports/series` | 3 seriya, `periodMonths` 1/12/1 |
| `GET /monthly-reports?series=bank-complaint-index` | ilk sətir 2026/5 |
| `POST` Bank 2026/6, az faylı | 201, `audit_log`-da `monthly_reports.create` |
| eyni `POST` təkrar | 409, mesaj "Bu seriyada İyun 2026 üçün hesabat artıq var." |
| `POST` `month: 13` / faylsız / `year: 1999` | 400 `problem+json` |
| `DELETE` həmin sətir, sonra eyni `POST` | 204, sonra 201 (partial unique index) |

## 3. Public API (api-cbar, `cbar_web_ro`)

| Sorğu | Gözlənilən |
|---|---|
| `GET /api/v1/monthly-reports?locale=az` | 3 seriya: 32 / 45 / 65 hesabat, ilk `2026/5` |
| `GET …?locale=en` | 2 seriya: 32 / 41 (İnfoqrafika yoxdur) |
| `GET …?locale=az&series=infographics` | yalnız İnfoqrafika |
| Bank sətrini `draft` et, sonra az sorğusu | 31 hesabat |

`route-diff.mjs` hər iki API-də təmiz qalmalıdır.

## 4. Admin panel

`cd product-rest/web-cbar-admin-new && npm run verify` keçməlidir: lint, `check:kit`, `check:i18n`, `check:layout-fixtures`, `tsc -b`, test,
build. Sonra `npm run dev` (:5174, lokal API) ilə əl ilə yoxlanır:
- Sidebar-da "Aylıq hesabatlar" var.
- Bank tabında "Yeni" basılır, forma Bank + İyun 2026 ilə açılır, fayl seçilir və yadda saxlanılır.
- Səhifə 95-in formasında kart seriya süzgəcli siyahıya aparır.

## 5. Sayt

`cd product-rest/web-cbar-new && npm run verify` keçməlidir. Testləri Node 22 ilə də işlət (yaddaş: lokal Node 24, CI isə node:22-dir).
Sonra `npm run dev` (:3001) ilə əl ilə yoxlanır:

| Səhifə | Gözlənilən |
|---|---|
| `/az/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi` | Bank tabı: "Son məlumat" "… şikayət indeksi (May 2026)", 4 il, metodologiya. Köhnə akkordeon görünmür |
| `…?tab=insurance` | Sığorta: "… (İyun 2025 – May 2026)", 5 il |
| `/en/complaint-index-on-bank-customers-use-of-bank-services` | en adları, "(May 2026)", ay adları ingiliscə |
| `/az/vetendas-muracietlerine-dair-statistika#infoqrafika` | İnfoqrafika 6 il, 65 ay |
| api-cbar dayandırılıb (və ya `monthly-reports` 500) | səhifələr spec 050 HTML yolu ilə eyni görünür |

**Ölçmə**: Figma `2453:4111` ilə DOM `getBoundingClientRect` tutuşdurulur (spec 050 ui-contract §3). Gözlənilən fərq 0-dır, çünki komponentlər
dəyişmir.

## 6. Sənədlər

Bu sənədlər yenilənir:
- `web-cbar-new/docs/consumer-rights-cms-guide.md`: arxiv paneldədir, HTML fallback-dır, yeni ay HTML-ə yazılmır;
- `dokumentasiyalar/istehlakci-huquqlari-guide.md`;
- kök `CLAUDE.md`: spec 050 bəndinə spec 052 qeydi, admin bölməsi;
- `web-cbar-admin-new/CLAUDE.md`: yeni bölmə və `newSearch`;
- `business_logic/new_business_logic.md` və `diff_report_logic.md` (`/sync-business-logic consumer`).

Hər iki API-nin `openapi/` qovluğu spec-first qaydası ilə əvvəlcədən yazılır.
