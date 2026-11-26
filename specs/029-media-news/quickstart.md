# Quickstart / yoxlama bələdçisi: spec 029

Bu maşında Docker işləmir (lokal Postgres/MinIO qalxmır) — API-lər lokalda yalnız build olunur,
icra yoxlaması test mühitində deploy-dan sonra edilir. Frontend-lər MSW testləri və
`local:testcbar` (test API) ilə yoxlanılır.

## 0. Ön şərtlər

- .NET 10 SDK (`C:/Program Files/dotnet/dotnet.exe`, PATH-da olmaya bilər), Node 24 + Node 22.
- npm: `NODE_EXTRA_CA_CERTS` korporativ CA ilə (yaddaş: npm korporativ CA).

## 1. API-lər (hər biri ayrıca MR)

```bash
# OpenAPI — əvvəl spec (spec-first)
cd product-rest/api-cbar/openapi && npm run lint && npm run bundle && npm run contract && npm run drift
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle && npm run contract && npm run drift
node .claude/skills/sync-openapi/scripts/route-diff.mjs          # route-lar dəyişməyib → fərq yoxdur

# Build
dotnet build product-rest/api-cbar/src/Cbar.WebApi
dotnet build product-rest/api-cbar-admin/src/Cbar.AdminApi
```

Gözlənilən: lint/bundle təmiz, hər iki build 0 xəta, 0 yeni xəbərdarlıq.

**Soft-delete SQL yoxlaması (R9)**: siyahı və detal sorğusunun `ToQueryString()` çıxışında
`p.deleted_at IS NULL` (və ya ekvivalent) var. Nəticə `research.md` R9-a yazılır; yoxdursa açıq
şərt əlavə olunur və yenidən yoxlanır.

## 2. Test mühitində API ssenariləri (deploy-dan sonra)

```bash
B=https://api-cbar-test.cbar.az/api/v1/press-releases
curl -s "$B?locale=az&pageSize=1" | jq '.total, .items[0].type'          # 43, 1|2
curl -s "$B?locale=az&type=1&pageSize=1" | jq .total                      # 20
curl -s "$B?locale=az&q=FinCERT" | jq '[.items[].title]'                  # FinCERT başlığı
curl -s "$B?locale=az&q=%25" | jq .total                                  # 0 və ya yalnız "%" olan başlıqlar — hamısı yox
curl -s "$B?locale=az&from=2026-06-11&to=2026-06-11" | jq '[.items[].publishedAt]'   # yalnız 11.06 (Bakı)
curl -s -o /dev/null -w '%{http_code}\n' "$B?locale=az&from=abc"          # 400
curl -s -o /dev/null -w '%{http_code}\n' "$B?locale=az&q=$(printf 'a%.0s' {1..201})"  # 400
curl -s "$B?locale=az&from=2026-07-01&to=2026-06-01" | jq .total          # 0
curl -s "$B/<slug>?locale=az" | jq .type                                  # 1|2
```

Admin (test admin, JWT ilə): `GET /api/v1/press-releases?type=2` yalnız elanlar; `PUT` gövdəsində
`type` olmadan → növ dəyişmir; `type: 3` → 400 problem+json. Soft-delete: admin-də test yazısını
sil → public detal 404, siyahıda yoxdur (SC-005).

## 3. web-cbar-new

```bash
cd product-rest/web-cbar-new
npm run verify                     # setup:check → self-contained → lint → typecheck → test:run → build
npx -p node@22 npm run test:run    # CI Node 22-dədir (yaddaş)
npm run local:testcbar             # :3002 → test API
```

Əl ilə (`http://localhost:3002`):

1. `/az/press-releases` — H1 "Xəbərlər", menyuda "Xəbərlər" aktiv, 9 kart, paginasiya.
2. `/az/press-releases?type=2` — "Elanlar".
3. Filtr: söz + tarix → "Axtar" → URL `?type=1&q=…&from=…&to=…`; 2-ci səhifəyə keç → filtr qalır;
   "Filtrləri təmizlə" → `?type=1`. (API deploy olunana qədər test API filtrləri nəzərə almır —
   bu yoxlama deploy-dan sonra təkrarlanır.)
4. JS söndür (DevTools → Disable JavaScript): axtarış sözü ilə forma göndərilir, nəticə gəlir.
5. Detal: örtük, tarix, mətn, qalereya (miniatür, oxlar, ←/→), PDF qoşmalarda; Elan detalında
   breadcrumb "Elanlar".
6. Ölçmə: 1728, 744, 390 enlərində Figma node-ları (ui-contract §2–3) ilə `getBoundingClientRect`
   tutuşdurması → `visual-diff.md`.

## 4. web-cbar-admin-new

```bash
cd product-rest/web-cbar-admin-new
npm run verify                     # lint → check:kit → check:i18n → tsc -b → test:run → build
npm run local:testcbar             # :5175 → test admin API
```

Əl ilə: yeni press-reliz formasında "Növ" = "Xəbər"; "Elan" seç, saxla, yenidən aç → "Elan";
siyahıda "Növ" sütunu və filtri. Saytda `/az/press-releases?type=2`-də görünür (SC-004).
Rich-text extension-a toxunulmur — `roundtrip` tələb olunmur.

## 5. Deploy sırası

1. `api-cbar-admin` (type filtri + validasiya; köhnə panellə uyğun)
2. `api-cbar` (q/from/to + `type` sahəsi; köhnə saytla uyğun)
3. `web-cbar-admin-new`
4. `web-cbar-new`
