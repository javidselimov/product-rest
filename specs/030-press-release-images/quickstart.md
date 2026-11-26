# Quickstart / yoxlama bələdçisi: spec 030

Bu maşında Docker işləmir — admin API lokalda yalnız build olunur; endpoint icrası test mühitində
deploy-dan sonra yoxlanır. Panel MSW testləri ilə, sonra `local:testcbar` ilə yoxlanır.

## 0. Ön şərtlər

- .NET 10 SDK (`C:/Program Files/dotnet/dotnet.exe`, PATH-da olmaya bilər), Node 24 + Node 22.
- npm: `NODE_EXTRA_CA_CERTS` korporativ CA ilə.

## 1. `api-cbar-admin` (spec-first)

```bash
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle
#   contract / drift — deploy olunmuş API-yə qarşı; yeni endpoint deploy-dan əvvəl "spec-də var, API-də yox" fərqi verir
cd .. && dotnet build src/Cbar.AdminApi                       # 0 xəta
cd ../.. && node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin   # fərq yoxdur
```

Deploy-dan sonra (test mühiti, `TOKEN` = admin login):

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
curl -s -H "Authorization: Bearer $TOKEN" $API/press-releases/{id} | jq '.assets[].mediaId'
curl -s -o /dev/null -w '%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"mediaIds":[B,A,C,D]}' $API/press-releases/{id}/assets/order   # 204
curl -s -X PUT … -d '{"mediaIds":[A]}' $API/press-releases/{id}/assets/order | jq .message              # 400
curl -s -H "Authorization: Bearer $TOKEN" $API/press-releases/{id} | jq '.assets[].mediaId'            # [B,A,C,D]
```

## 2. `web-cbar-admin-new`

```bash
cd product-rest/web-cbar-admin-new
npm run verify                    # lint + check:kit + check:i18n + tsc -b + test + build
~/.nodevm/versions/22.23.2/node.exe node_modules/vitest/vitest.mjs run   # CI Node 22 (npx node@22 korporativ proxy-dən keçmir)
npm run local:testcbar            # :5175 — test API; admin API deploy olunandan sonra sıralama işləyir
```

Panel ssenarisi: Media → Press-relizlər → bir xəbər → "Şəkillər və sənədlər": 4 şəkil + 1 PDF bağla
→ nişanlar (1-ci şəkil "Örtük", qalanı "Qalereya", PDF nişansız) → oxlarla sıranı dəyiş → "Sıra
yeniləndi", nişan köçür.

## 3. `web-cbar-new` — ölçmə (kod yox)

```bash
cd product-rest/web-cbar-new && npm run local:testcbar    # :3002, test api-cbar
# /az/press-releases/{slug} — 1728 / 744 / 390
curl -s https://api-cbar-test.cbar.az/api/v1/press-releases/{slug} | jq '.assets[].mediaId'   # admin ilə eyni sıra
```

Brauzer konsolunda (1728):

```js
const g = document.querySelector('[data-photo-gallery], .photo-gallery') ?? document.querySelector('section:has(img + div)')
const big = g.querySelector('img'); const r = big.getBoundingClientRect()
;[r.width, r.height]                                   // 984 × 601
const thumbs = [...g.querySelectorAll('button img')].map(i => i.getBoundingClientRect())
;[thumbs[0].width, thumbs[0].height, thumbs[1].left - thumbs[0].right]   // 180 × 124, gap 24
```

Nəticə → `specs/029-media-news/visual-diff.md` (qalereya cədvəli); fərq > 2px → `tasks.md`-yə
düzəliş task-ı.
