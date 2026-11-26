# Quickstart: Admin paneldə şəkillərin önizləməsi — yoxlama

**Feature**: [spec.md](./spec.md) | Kontraktlar: [admin-api.md](./contracts/admin-api.md), [ui.md](./contracts/ui.md)

## 0. Avtomatik gate (panel)

```bash
cd product-rest/web-cbar-admin-new
npm run verify      # lint + check:kit + check:i18n + tsc -b + test + build — hamısı keçməlidir
```

Gözlənilən: yeni testlər, yəni form önizləməsi, seçim və təmizləmə, PDF ikonu, 404 yer tutucusu
və lightbox yaşıldır. Mövcud media, galleries, assets, image-popups testləri dəyişmədən keçir (SC-007).

## 1. API (MR 1, `api-cbar-admin`)

Lokalda .NET SDK yoxdur. Bu addım MR deploy olunduqdan sonra **test mühitində** icra olunur.
SDK olan maşında isə `dotnet build` + `dotnet run --project src/Cbar.AdminApi` ilə lokalda yoxlanılır.

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1      # və ya http://localhost:5253/api/v1
TOKEN=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"<CREDENTIALS.md>"}' | jq -r .accessToken)

IMG=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/media?pageSize=50" \
  | jq '[.items[]|select(.mimeType|startswith("image/"))][0].id')
DOC=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/media?pageSize=50" \
  | jq '[.items[]|select(.mimeType|startswith("image/")|not)][0].id')

curl -s -o /dev/null -w '%{http_code} %{content_type}\n' -H "Authorization: Bearer $TOKEN" $API/media/$IMG/preview  # 200 image/...
curl -s -o /dev/null -w '%{http_code}\n' $API/media/$IMG/preview                                       # 401
curl -s -w '\n%{http_code}\n' -H "Authorization: Bearer $TOKEN" $API/media/$DOC/preview                 # 415 + mimeType
curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" $API/media/999999999/preview  # 404
curl -sI -H "Authorization: Bearer $TOKEN" $API/media/$IMG/preview | grep -iE 'etag|cache-control|nosniff|content-security'
```

Gözlənilən başlıqlar: `ETag`, `Cache-Control: private, …, immutable`, `X-Content-Type-Options: nosniff`,
`Content-Security-Policy: … sandbox`.

## 2. Panel əl ilə (MR 2, `web-cbar-admin-new`)

```bash
npm run local:testcbar     # :5175, test API (API MR-ı deploy olunandan sonra)
# və ya lokal tam stack: ..\..\dev.ps1 -Seed  → http://localhost:5174
```

| # | Addım | Gözlənilən | Spec |
| --- | --- | --- | --- |
| 1 | Ana səhifə → Banner, şəkli olan qeydi redaktə et | Sahədə saxlanılmış şəklin önizləməsi ~1 s ərzində görünür | US1-1, SC-002 |
| 2 | "Dəyiş" → başqa şəkil seç (saxlamadan) | Önizləmə dərhal dəyişir | US1-2/3, SC-003 |
| 3 | "Təmizlə" | Önizləmə yox olur | US1-3 |
| 4 | Yeni banner → şəkil seç | Önizləmə görünür | US1-2 |
| 5 | Şəkilli popup → az və en tablarına fərqli şəkil seç, tabları dəyiş | Hər tab öz şəklini göstərir | US1-4 |
| 6 | MEAS sənədinə PDF bağla, redaktə et | İkon + ad görünür, sınıq şəkil görünmür | US1-5, SC-005 |
| 7 | Media seçicini aç | Şəkillər önizləmə ilə, sənədlər ikonla görünür. 24 kartlıq səhifə ~2 s-də hazır olur | US2-1, SC-006 |
| 8 | Qalereyanı redaktə et; səhifəyə şəkil əlavəsi bağla | Sətirlərdə önizləmə görünür | US2-2/3 |
| 9 | Önizləməyə klik → lightbox; Esc / × / fon | Böyük şəkil açılır, hər üç yolla bağlanır, forma dəyişmir | US3-1/2 |
| 10 | Media kitabxanası | Şəkil kartları önizləmə ilə görünür | US3-3 |
| 11 | DevTools → Network: eyni şəkil iki yerdə (seçici + sahə) | Şəkil bir dəfə endirilir. Yenilənmədən sonra brauzer keşindən gəlir | FR-017 |
| 12 | DevTools → Network: önizləmə sorğusu | URL-də token yoxdur, `Authorization` header-dədir | R2, Template X.3 |
| 13 | SVG mock şəkli (`placeholder-1.svg`) | `<img>` kimi görünür. Elements panelində inline `<svg>` yoxdur | FR-014 |

## 3. Deploy sırası

`api-cbar-admin` (MR 1) → `web-cbar-admin-new` (MR 2). Panel API-dən əvvəl deploy olunsa,
önizləmələr 404 alır və yer tutucu göstərir. Forma işləməyə davam edir (FR-011), yəni sıra
pozulsa da heç nə sınmır, amma önizləmə görünmür.
