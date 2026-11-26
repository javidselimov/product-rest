# Contract: `api-cbar-admin` HTTP kontraktı (panelin istehlak etdiyi hissə)

Mənbə: `api-cbar-admin/src/Cbar.AdminApi/Controllers/*.cs` (2026-09-07 vəziyyəti). Bu sənəd
**dəyişməz mövcud kontraktı** qeyd edir; MSW handler-ləri (`src/shared/testing/handlers/*`) və
servis Zod sxemləri bura uyğun yazılır. API-yə dəyişiklik bu spec-in əhatəsində deyil.

Baza: `<apiUrl>` = `…/api/v1`. Bütün endpoint-lər `Authorization: Bearer <jwt>` tələb edir
(`auth/login` istisna). JSON camelCase; `DateOnly` → `"2025-09-07"`, `DateTimeOffset` → ISO-8601
offset ilə; enum-lar kiçik hərfli string.

## 1. Auth

| Endpoint | Sorğu | Cavab |
| --- | --- | --- |
| `POST /auth/login` | `{ username, password }` | 200 `{ accessToken, expiresAt }`; 401 `{ message }` ("Invalid credentials." / "Account temporarily locked.") |

- Token müddəti 15 dəq (`Jwt:AccessTokenMinutes`). Refresh, `me`, logout, roles endpoint-i **yoxdur**.
- JWT payload: `sub` (user id), `preferred_username`, rol açarı
  `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` (`admin|moderator|meas_manager`),
  `iss`, `aud`, `exp`. `name`/`email` yoxdur.
- Qorunan endpoint-də 401/403: **boş gövdə** (`WWW-Authenticate` header-i ilə).

## 2. Envelope və xəta formaları

**Siyahı envelope-ları** (üç növ — `ModuleConfig.listEnvelope`):

| Növ | Forma | Resurslar |
| --- | --- | --- |
| `paged` | `{ items: T[], total, page, pageSize }` (`page/pageSize` sorğudan əks-səda; `totalPages` yoxdur) | laws, press-releases, money-marks, money-mark-news, meas-documents, users, galleries, videos, yield-curves, media, azir, info-lines, currency-rates/dates |
| `items` | `{ items: T[] }` | banners, news-slider, running-lines, homepage-links, homepage-publications, video-streams, image-popups, currencies, settings |
| `array` | `T[]` | law-categories, money-mark-categories, organization/{divisions,offices,staff}, meas-emitents, meas-info-types, inflation, pages/tree |

`page` 1-əsaslı; `pageSize` clamp olunmur; `page=0` → 500. Panel həmişə `page≥1`, `pageSize`
konfiqdən göndərir.

**Xəta gövdələri** (`normalizeApiError` hamısını əhatə edir — research R3):

| Hal | Gövdə |
| --- | --- |
| Açıq `BadRequest/Conflict/NotFound(new { message })` | `{ "message": "…" }` |
| Bare `NotFound()` | ProblemDetails `{ type, title: "Not Found", status: 404, traceId }` |
| Model validasiyası | ValidationProblemDetails `{ title, status: 400, errors: { "Translations": ["…"], "$.status": ["…"] }, traceId }` |
| 401/403 | boş |
| 500 | boş (dev-də HTML səhifə) |

## 3. Tərcümələr

Hər iki istiqamətdə **açarlı obyekt**: `translations: { az: {...}, en: {...} }`. PUT-da **tam
əvəzləmə** — göndərilməyən locale silinir. Boş `translations` → 400 `{message:"At least one
translation is required."}` (banner istisna). Detail cavablarında `slug` server tərəfindən
yaradılır (başlıqdan, `-2`/`-3` toqquşma), yalnız pages-də sorğuda qəbul edilir.

Siyahı elementləri detail-dən **fərqli, düz** formadadır (məsələn laws list: `{id, categoryId,
type, status, publishedAt, updatedAt, title}` — `title` az→ilk mövcud). Panel siyahı sütunlarını
list DTO-suna görə, formanı detail DTO-suna görə konfiqləyir.

## 4. Pages

```ts
PageFlags = { active, visible, showAz, showEn, readonly, disabled, removable, removableAll,
              movableU, movableD, movableL, movableR, selected, collapsed }   // 14 boolean
PageNode  = { id, parentId, sortOrder, status, title|null, slug|null, navUrl|null, flags, children: PageNode[] }
PageDetail= { id, parentId, sortOrder, status, showInFooter, navUrl, flags,
              translations: { [locale]: { title, slug, content } },
              assets: PageAsset[] }
PageAsset = { id, mediaId, originalName, mimeType, sizeBytes, sortOrder, groupLabel|null,
              translations: { [locale]: { title } } }
PageUpsert= { parentId, sortOrder, status: 'draft'|'published'|'archived', showInFooter,
              translations: { [locale]: { title, content?, slug? } }, navUrl?, flags? }
```

| Endpoint | Sorğu | Cavab / qeyd |
| --- | --- | --- |
| `GET /pages/tree?locale=az` | | `PageNode[]` (bare array, kök səviyyə) |
| `GET /pages/{id}` | | `PageDetail` |
| `POST /pages` | `PageUpsert` | 201 `PageDetail` |
| `PUT /pages/{id}` | `PageUpsert` | 200 `PageDetail`. `parentId` dəyişikliyi → 400 (move istifadə et). `flags` omit → saxlanılır; **qismən `flags` default-larla doldurulur** → panel həmişə tam obyekt göndərir. `slug` omit → update-də toxunulmur |
| `POST /pages/{id}/move` | `{ newParentId: int|null, sortOrder }` | 204; 409 `{message}` (movable bayraqları), 400 (öz/nəsil valideyn) |
| `DELETE /pages/{id}` | | 204; 409 `{message}` (`removable=false` və ya uşaqlı + `removableAll=false`) |
| `GET /pages/{id}/assets` | | `PageAsset[]` |
| `POST /pages/{id}/assets` | `{ mediaId, translations?, groupLabel? }` | 200 `PageAsset` (başlıq default `originalName`) |
| `PUT /pages/{id}/assets/{assetId}` | `{ translations, groupLabel }` | 200 `PageAsset` |
| `PUT /pages/{id}/assets/order` | `{ assetIds: [..tam siyahı..] }` | 204; 400 natamam siyahı |
| `DELETE /pages/{id}/assets/{assetId}` | | 204 (**assetId**) |

## 5. Media

```ts
MediaItem = { id, originalName, mimeType, sizeBytes, width: null, height: null, createdAt }
```

| Endpoint | Sorğu | Cavab |
| --- | --- | --- |
| `GET /media?page&pageSize=24&search` | | paged `MediaItem` |
| `POST /media` | multipart, sahə `file`; icazəli: jpg jpeg png gif webp svg pdf xlsx xls docx doc zip rar xml; ≤250 MB | 200 `{ id, originalName, mimeType, sizeBytes, createdAt }`; eyni bayt → mövcud qeyd; 400 `{message}` |
| `DELETE /media/{id}` | | 204; **409** `{ message: "File is attached to content; detach it first." }` |

`url` sahəsi **yoxdur** — panel önizləmə göstərmir (ikon). Redaktora daxil edilən ünvan `/media/{id}`.

## 6. Konfiqurasiya ilə idarə olunan CRUD resursları

Ümumi forma: `GET <path>` (siyahı), `GET <path>/{id}`, `POST <path>` (201), `PUT <path>/{id}` (200),
`DELETE <path>/{id}` (204). Sorğu parametrləri və detail sahələri:

| Resurs | Envelope | Sorğu param | Detail / upsert sahələri (★ = translations) | Status |
| --- | --- | --- | --- | --- |
| `/laws` | paged(20) | `search, categoryId, status` | `categoryId, type(1\|2), status, publishedAt?`, ★`title, description?`; detail + `assets[]` | ✓ |
| `/law-categories` | array | | `sortOrder, isActive`, ★`name` | |
| `/press-releases` | paged(20) | `search, status` | `status, publishedAt?`, ★`title, content?`; detail + `assets[]` | ✓ |
| `/meas-documents` | paged(20) | `search(dqn), emitentId, infoTypeId, status` | `emitentId, infoTypeId, regDate, dqn, mediaId?, status` (sahə adı `regDate` — `MeasDocumentsController.cs` `RegDate`); detail `media: {originalName…}` | ✓ |
| `/meas-emitents`, `/meas-info-types` | array | | `isActive`, ★`name` | |
| `/organization/divisions` | array | | `sortOrder, isActive, mediaId?`, ★`name, description?` | |
| `/organization/offices` | array | | `sortOrder, isActive`, ★`name, address?, phone?` | |
| `/organization/staff` | array | `type` | `type, sortOrder, isActive, phone?, photoMediaId?`, ★`fullName, position?, receptionDays?, bio?` | |
| `/money-marks` | paged(20) | `type, categoryId, status` | `categoryId, type, frontMediaId?, rearMediaId?, sortOrder, status`, ★`title, description?, securityFeatures?` | ✓ |
| `/money-mark-categories` | array | | `sortOrder, isActive`, ★`name` | |
| `/money-mark-news` | paged(20) | `search, status` | `status, publishedAt?`, ★`title, content?` | ✓ |
| `/galleries` | paged(20) | | `eventDate?, sortOrder, isActive`, ★`title`; detail + `images[{id, mediaId, originalName, sortOrder}]`; list `imageCount, title` | |
| `/videos` | paged(20) | | `youtubeUrl, publishedAt?, sortOrder, isActive`, ★`title` | |
| `/video-streams` | items | | `streamUrl, isLive, startsAt?`, ★`title`; cavabda əlavə `createdAt, updatedAt` (spec 006) | |
| `/banners` | items | | `mediaId?, sortOrder, isActive, startsAt?, endsAt?`, ★`title?, link?` (hamısı optional) | |
| `/image-popups` | items | | `title, isActive`, ★`mediaId?, link?, altText?` (ən azı bir dildə `mediaId`); cavabda əlavə `activatedAt, createdAt, updatedAt`, ★`mediaName` (spec 009, [kontrakt](../../009-image-popup/contracts/admin-api.md)) | |
| `/news-slider` | items | | `newsDate, mediaId?, sortOrder, isActive`, ★`title, description?, link?` | |
| `/running-lines` | items | | `isActive, startsAt?, endsAt?`, ★`text` | |
| `/homepage-links` | items | | `sortOrder, isActive`, ★`title, url` | |
| `/homepage-publications` | items | | `mediaId?, publishedAt?, sortOrder, isActive`, ★`title, url?` | |
| `/info-lines` | paged(50), **qruplu** `items: [{ alias, lines: InfoLine[] }]` | `alias` (like) | `alias, year?, sortOrder, isActive`, ★`title, value?`; `GET/POST/PUT /{id}` tək sətir | |
| `/users` | paged(20) | `search` | list `{id, username, email, roleCode, isActive, createdAt}`; detail `+ roleId, updatedAt`; create `{username,email,password,roleId}`; update `{email,roleId,isActive}` | |
| `/yield-curves` | paged(20) | | list `{id, curveDate, hasParameters, yieldsCount, updatedAt}`; detail `{curveDate, parameters: {beta0,beta1,beta2,lambda}\|null, yields: [{period, yield}]}` | |

"Status ✓" = `status: 'draft'|'scheduled'|'published'|'archived'` (pages: `scheduled` yoxdur).
`type` dəyərləri: laws `1` qanun / `2` qayda; money-marks `1` əskinas / `2` sikkə; staff `1` idarə
heyəti / `2` rəhbərlik (köhnə paneldəki xəritə).

Xüsusi status kodları: `/users` bütövlükdə `[Authorize(Roles="admin")]` → 403 boş; users create 409
`{message}` (username/email məşğul); delete 409 (öz hesabı / son admin); şifrə siyasəti 400
`{message}`: ≥8 simvol, böyük, kiçik, rəqəm, xüsusi simvol.

## 7. Sənəd/şəkil alt-resursları

| Valideyn | Attach | Detach | Sıra | Açar |
| --- | --- | --- | --- | --- |
| press-releases, laws | `POST /{id}/assets {mediaId}` → **204** | `DELETE /{id}/assets/{mediaId}` | yoxdur | mediaId |
| pages | `POST /{id}/assets {mediaId, translations?, groupLabel?}` → 200 DTO | `DELETE /{id}/assets/{assetId}` | `PUT /{id}/assets/order {assetIds}` | assetId |
| galleries | `POST /{id}/images {mediaId}` → 200 `{id, mediaId, sortOrder}`; 409 "Already attached." | `DELETE /{id}/images/{imageId}` | `PUT /{id}/images/order {imageIds}` | imageId |

## 8. Maliyyə resursları

| Endpoint | Sorğu | Cavab |
| --- | --- | --- |
| `GET /currency-rates[?date=YYYY-MM-DD]` | | `{ date: string\|null, rates: [{ currencyCode, nominal, nameAz, rate }] }` (omit → son vərəq; boş baza → `date:null, rates:[]`) |
| `PUT /currency-rates` | `{ date, rates: [{ currencyCode, rate }] }` | 204; upsert per (date,code), göndərilməyən kod silinmir; 400 boş/təkrar/naməlum kod |
| `DELETE /currency-rates?date=` | | 204; bare 404 |
| `GET /currency-rates/dates?page&pageSize` | | paged `{ date, count }` (yeni → köhnə) |
| `GET /currencies` | | items `{ code, nominal, sortOrder, isActive, showOnHomepage, nameAz, nameEn }` |
| `PUT /currencies/{code}` | `{ showOnHomepage, sortOrder, isActive }` | 204; 404 `{message}` |
| `GET /azir?from&to&term&page&pageSize=50` | | paged `{ id, valueDate, term, rate, updatedAt }` |
| `POST /azir` (upsert valueDate+term) | `{ valueDate, term, rate }` | 200 `{ id, valueDate, term, rate }` |
| `DELETE /azir/{id}` | | 204 |
| `GET /inflation[?year=]` | | array `{ id, year, month, parameterCode, value, updatedAt }` |
| `POST /inflation` (upsert year+month+code) | `{ year, month(1–12), parameterCode, value }` | 200 |
| `DELETE /inflation/{id}` | | 204 |
| `POST /yield-curves` / `PUT /{id}` | `{ curveDate, parameters\|null, yields: [{period, yield}] }` | 201/200 detail; 409 təkrar tarix; 400 təkrar period |
| `GET /settings` | | items `{ key, value: JSON, updatedAt }` |
| `PUT /settings/{key}` | `{ value: <istənilən JSON> }` | 200 `{ key, value, updatedAt }` (upsert); 400 `value` yoxdursa |
| `PUT /users/{id}/password` | `{ newPassword }` | 204 |

## 9. Sabit xəritələr (endpoint yoxdur)

| Xəritə | Dəyər |
| --- | --- |
| Rollar | `1 admin`, `2 moderator`, `3 meas_manager` (seed sırası; `GET /roles` yoxdur) |
| Locale-lər | `az`, `en` (`GET /locales` yoxdur) |
| Info-line alias-ları | `homepage_indicators, corridor_min, corridor_max, corridor_percent, money_reserve_usd, money_base, nots_volume, nots_levels_28, nots_levels_84, nots_levels_168, nots_levels_252, bank_credit, bank_nation` |
| AZIR term | `1D, 1W, 1M` (API sərbəst string qəbul edir) |
| İnflyasiya parametr kodu | `cpi_yoy, target` (API sərbəst string) |

## 10. CORS

Dev: `Cors:Origins = ["http://localhost:5173"]`, any header/method, credentials yoxdur. Panel
dev-də Vite proxy ilə eyni origin-dən sorğu göndərir (CORS-a ehtiyac qalmır); deploy-da API
`Cors__Origins__0` panel origin-i olmalıdır (`TODO(devops)`, API tərəfində).
