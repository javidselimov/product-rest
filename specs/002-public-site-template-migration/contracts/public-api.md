# Contract: `api-cbar` public API (saytın istehlak etdiyi hissə)

**Faza 1** | Tarix: 2026-09-14 | Mənbə: `web-cbar/src/lib/api.ts` (30 funksiya), `api-cbar/src/Cbar.WebApi/Controllers/*`

Bu kontrakt **dəyişmir** (root konstitusiya VII.3). Sayt eyni yolları, eyni sorğu parametrlərini
və eyni parametr qurma qaydasını göndərir (spec FR-002, SC-002). Cavab formaları
[data-model.md](../data-model.md)-də. Bütün sorğular `GET`, `Accept: application/json`,
serverdən (`API_URL` + yol), keşsiz.

## 1. Ümumi qaydalar

- Baza: `{API_URL}` (məsələn `http://localhost:5139`); yollar `/api/v1/…` ilə tam yazılır.
- `locale` parametri məzmun endpoint-lərində məcburidir; `azir`, `inflation`, `yield-curves`
  endpoint-lərində **yoxdur**.
- Siyahı envelope-u: `{ items, total, page, pageSize }`. `page` 1-dən başlayır, `pageSize` default 10.
- Detal endpoint-ləri: mövcud deyil və ya bu dildə görünmür → **404** → sayt `null` → `notFound()`.
  Siyahı endpoint-ləri xəta verəndə (5xx, şəbəkə) sayt siyahı daxilində xəta vəziyyəti göstərir.
- Slug və tarix `encodeURIComponent` ilə; optional parametr yalnız dəyər `!= null` (tarix üçün
  truthy) olanda əlavə olunur.
- Media: `/media/{id}` nisbi ünvanları `{API_URL}/media/{id}`-yə çevrilir (serverdə); CMS HTML
  daxilindəki `href="/media/…"` və `src="/media/…"` də eyni qayda ilə.
- Xarici keçid (kontrakt, root VII.1): `{API_URL}/currencies/{DD.MM.YYYY}.xml` — sayt yalnız keçid
  verir, məzmununa toxunmur.

## 2. Endpoint-lər

| # | Funksiya (feature/api) | Yol və parametrlər | Cavab | 404 → null |
| --- | --- | --- | --- | --- |
| 1 | `getPressReleases(locale, page=1, pageSize=10, type?)` | `/api/v1/press-releases?locale&page&pageSize[&type]` | `ListEnvelope<PressReleaseListItem>` | — |
| 2 | `getPressRelease(locale, slug)` | `/api/v1/press-releases/{slug}?locale` | `PressReleaseDetail` | ✓ |
| 3 | `getPagesTree(locale)` | `/api/v1/pages/tree?locale` | `PageNode[]` | — |
| 4 | `getPage(locale, slug)` | `/api/v1/pages/{slug}?locale` | `PageDetail` | ✓ |
| 5 | `getHomepage(locale)` | `/api/v1/homepage?locale` | `Homepage` | — |
| 6 | `getCurrencies(locale, date?)` | `/api/v1/currencies?locale[&date]` | `CurrencySheet` | ✓ |
| 7 | `getLaws(locale, page=1, categoryId?, type?, pageSize=10)` | `/api/v1/laws?locale&page&pageSize[&categoryId][&type]` | `ListEnvelope<LawListItem>` | — |
| 8 | `getLaw(locale, slug)` | `/api/v1/laws/{slug}?locale` | `LawDetail` | ✓ |
| 9 | `getLawCategories(locale)` | `/api/v1/law-categories?locale` | `LawCategory[]` | — |
| 10 | `getMeas(locale, page=1, emitentId?, infoTypeId?, pageSize=10)` | `/api/v1/meas?locale&page&pageSize[&emitentId][&infoTypeId]` | `ListEnvelope<MeasItem>` | — |
| 11 | `getMeasEmitents(locale)` | `/api/v1/meas-emitents?locale` | `MeasEmitent[]` | — |
| 12 | `getMeasInfoTypes(locale)` | `/api/v1/meas-info-types?locale` | `MeasInfoType[]` | — |
| 13 | `getStaff(locale, type?)` | `/api/v1/organization/staff?locale[&type]` | `StaffMember[]` | — |
| 14 | `getStaffMember(locale, id)` | `/api/v1/organization/staff/{id}?locale` | `StaffMember` | ✓ |
| 15 | `getDivisions(locale)` | `/api/v1/organization/divisions?locale` | `Division[]` | — |
| 16 | `getOffices(locale)` | `/api/v1/organization/offices?locale` | `Office[]` | — |
| 17 | `getMoneyMarks(locale, type?, categoryId?)` | `/api/v1/money-marks?locale[&type][&categoryId]` | `MoneyMarkListItem[]` | — |
| 18 | `getMoneyMark(locale, slug)` | `/api/v1/money-marks/{slug}?locale` | `MoneyMarkDetail` | ✓ |
| 19 | `getMoneyMarkCategories(locale)` | `/api/v1/money-mark-categories?locale` | `MoneyMarkCategory[]` | — |
| 20 | `getMoneyMarkNews(locale, page=1, pageSize=10)` | `/api/v1/money-mark-news?locale&page&pageSize` | `ListEnvelope<MoneyMarkNewsListItem>` | — |
| 21 | `getMoneyMarkNewsItem(locale, slug)` | `/api/v1/money-mark-news/{slug}?locale` | `MoneyMarkNewsDetail` | ✓ |
| 22 | `getGalleries(locale, page=1, pageSize=10)` | `/api/v1/galleries?locale&page&pageSize` | `ListEnvelope<GalleryListItem>` | — |
| 23 | `getGallery(locale, id)` | `/api/v1/galleries/{id}?locale` | `GalleryDetail` | ✓ |
| 24 | `getVideos(locale, page=1, pageSize=10)` | `/api/v1/videos?locale&page&pageSize` | `ListEnvelope<VideoItem>` | — |
| 25 | `getVideoStreams(locale)` | `/api/v1/video-streams?locale` | `VideoStream[]` | — |
| 26 | `getAzir(from?, to?, term?)` | `/api/v1/azir[?from&to&term]` (parametr yoxdursa `?` də yoxdur) | `AzirValue[]` | — |
| 27 | `getInflation(year?)` | `/api/v1/inflation[?year]` | `InflationParameter[]` | — |
| 28 | `getYieldCurveLatest()` | `/api/v1/yield-curves/latest` | `YieldCurve` | ✓ |
| 29 | `getYieldCurve(date)` | `/api/v1/yield-curves/{date}` | `YieldCurve` | ✓ |
| 30 | `searchSite(locale, q)` | `/api/v1/search?q&locale` | `SearchResponse` | — |

Parametr qurma nüansları (köhnə kodla eyni saxlanılır):
- #1, #6, #13, #27: şablon birləşdirmə (`&type=${type}` yalnız `type != null`; `&date=` yalnız truthy).
- #7, #10, #17, #26: `URLSearchParams`, optional dəyərlər `.set` ilə yalnız `!= null` olanda.
- #26: `params.size > 0` olanda `?` əlavə olunur.

## 3. Səhifə → çağırış xəritəsi (SC-002 müqayisə cədvəli)

| Route | Çağırışlar |
| --- | --- |
| `[locale]/layout` | #3 |
| `/` | #5, #6 (bugün), #1 (1, 5), #27, #26, #22 (1, 6), #24 (1, 6), #28; sonra #6 (1–5 gün geri, ilk tapılan), #2 (ilk reliz) |
| `/press-releases` | #1 (page, 10, type?) |
| `/press-releases/[slug]` | #2 |
| `/laws` | #7, #9 |
| `/laws/[slug]` | #8 |
| `/securities` | #10, #11, #12 |
| `/currencies` | #6 (date?) |
| `/statistics` | #26 (parametrsiz), #27 (cari il), #28 |
| `/national-currency` | #17 (type — həmişə, default 1; categoryId?), #19 |
| `/national-currency/[slug]` | #18 |
| `/national-currency/news` | #20 (page) |
| `/national-currency/news/[slug]` | #21 |
| `/organization` | `?section=` üzrə **bir** çağırış — board: #13 (type 1); management: #13 (type 2); divisions: #15; offices: #16 — + #3 (sol menyu) |
| `/organization/staff/detail/[id]` | #14, #3 (sol menyu) |
| `/media` | #25, #22 (1, 10), #24 (1, 10) — hər üçü `Promise.allSettled` ilə, biri uğursuz olanda digərləri render olunur |
| `/media/galleries/[id]` | #23 |
| `/search` | #30 (`q` boş deyilsə) |
| `/[...slug]` | #4 (son seqment) |

## 4. Xəta cavabları

`api-cbar` `ProblemDetails` və ya boş gövdə qaytara bilər; sayt gövdəni istifadəçiyə göstərmir
(`normalizeApiError` → `AppError`, i18n `errors:*` mesajı). Rate limit (429, 1000/dəq/IP) SSR
serverinin IP-si üçün ümumi məhdudiyyətdir — bir səhifə baxışı ~10 sorğu edir; `X-Forwarded-For`
ötürülmür (köhnə saytla eyni).

## 5. MSW handler-ləri (`shared/testing/handlers/<feature>.ts`)

Hər endpoint üçün bir handler, yol və parametrlər yuxarıdakı cədvəllə eyni, cavablar
data-model.md §10 fikstürlərindən; `404` ssenariləri detal handler-lərində `slug === 'yoxdur'`
ilə; `onUnhandledRequest: 'error'` — cədvəldə olmayan sorğu testi uğursuz edir.
