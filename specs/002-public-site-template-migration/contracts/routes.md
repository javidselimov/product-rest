# Contract: URL-lər, yönləndirmə, sorğu parametrləri və i18n

**Faza 1** | Tarix: 2026-09-14 | Mənbə: `web-cbar/src/app/**`, `web-cbar/src/proxy.ts`, `Header.tsx`, `t.ts`

Public URL-lər köhnə saytla **eynidir** (root konstitusiya VII.2, spec FR-001). Bu sənəd
`/speckit-tasks` üçün route inventarı, yönləndirmə cədvəli, sorğu parametrləri və i18n
namespace kontraktıdır.

## 1. Route inventarı (`src/app/[locale]/…`)

| # | Yol | View | Loader girişi | Metadata | 404 |
| --- | --- | --- | --- | --- | --- |
| 1 | `/` | `home` | locale | brand | — |
| 2 | `/press-releases` | `press-releases` | `type?`, `page` | `content:pressReleases` | — |
| 3 | `/press-releases/[slug]` | `press-release` | slug | reliz başlığı | ✓ |
| 4 | `/laws` | `laws` | `categoryId?`, `type?`, `page` | `content:laws` | — |
| 5 | `/laws/[slug]` | `law` | slug | qanun başlığı | ✓ |
| 6 | `/securities` | `securities` | `emitentId?`, `infoTypeId?`, `page` | `finance:securities` | — |
| 7 | `/currencies` | `currencies` | `date?` | `finance:officialRates` + tarix | — |
| 8 | `/statistics` | `statistics` | locale (parametr yoxdur) | `home:statistics` | — |
| 9 | `/national-currency` | `money-marks` | `type?`, `categoryId?` | `content:nationalCurrency` | — |
| 10 | `/national-currency/[slug]` | `money-mark` | slug | nişan başlığı | ✓ |
| 11 | `/national-currency/news` | `money-mark-news` | `page` | `content:news` | — |
| 12 | `/national-currency/news/[slug]` | `money-mark-news-item` | slug | xəbər başlığı | ✓ |
| 13 | `/organization` | `organization` | `section` (board \| management \| divisions \| offices; default board), `copy` | `organization:title` | — |
| 14 | `/organization/staff/detail/[id]` | `staff-member` | id (int) | ad, soyad | ✓ (id rəqəm deyilsə də) |
| 15 | `/media` | `media` | locale (parametr yoxdur) | `media:title` | — |
| 16 | `/media/galleries/[id]` | `gallery` | id (int) | qalereya başlığı | ✓ |
| 17 | `/search` | `search` | `q` | `search:title` | — |
| 18 | `/[...slug]` | `cms-page` | son seqment (decode) | səhifə başlığı | ✓ |

Xüsusi fayllar: `[locale]/layout.tsx` (ağac + qabıq), `[locale]/error.tsx`,
`[locale]/not-found.tsx` (i18n, kit), `app/not-found.tsx` (dəstəklənməyən locale),
`app/layout.tsx` (html lang/class). Hər səhifə `export const dynamic = 'force-dynamic'`.
Route səviyyəli `loading.tsx` **yoxdur** — Suspense axını `notFound()`-un 404 statusunu
`200`-ə çevirir (research R13, D7); köhnə saytla eyni.
Bütün `params`/`searchParams` `await` ilə oxunur (Next 16).

**Slug qaydası**: `decodeURIComponent` sonra API-yə `encodeURIComponent` ilə; catch-all yalnız
**son** seqmenti slug sayır (aralıq seqmentlər yoxlanılmır — köhnə davranış). Slug-da AZ hərfləri
hər iki formada işləyir.

## 2. Yönləndirmə cədvəli (`src/proxy.ts`)

| Giriş | Nəticə |
| --- | --- |
| `/` | 307 → `/az` |
| `/laws?type=law&page=2` | 307 → `/az/laws?type=law&page=2` (sorğu qorunur) |
| `/az`, `/az/…`, `/en/…` | ötür |
| `/ru`, `/ru/laws`, `/pt-BR/x` | ötür → `app/not-found.tsx` (404) |
| `/_next/…`, `/api/…`, `/favicon.ico`, `/site/logo-az.svg` | matcher-dən kənar, toxunulmur |

Hər keçən sorğuda: `x-locale` header, `x-nonce`, `Content-Security-Policy` (nonce-lu, template
fallback-ı əvəz edir). Cookie yazılmır. Sessiya yoxlaması yoxdur.

## 3. Slug → feature route xəritəsi (`shell/nav.ts#FEATURE_ROUTES`)

| CMS slug (az \| en) | Route |
| --- | --- |
| `press-relizler` \| `press-releases` | `/press-releases` |
| `fotoqalereya` \| `photo-gallery` | `/media` |
| `videoqalereya` \| `video-gallery` | `/media` |
| `teskilati-struktur-ve-idareetme` \| `organizational-structure-and-management` | `/organization` |
| `tedavulde-olan-pul-nisanlari` \| `currency-in-circulation` | `/national-currency` |
| `merkezi-bankin-huquqi-esaslari` \| `legal-framework-of-the-central-bank` | `/laws` |

Üstünlük: `navUrl` → `FEATURE_ROUTES` → `/{locale}/{slug}`. `VISIBLE_SECTIONS = 8`, `MAX_DEPTH = 3`.

## 4. Sorğu parametrləri

data-model.md §7 cədvəli kontraktdır. Əlavə qaydalar:
- `page` diapazondan kənar → API boş `items` qaytarır → boş vəziyyət mesajı, səhifələmə
  `totalPages`-ə görə.
- Filtr formaları GET ilə eyni yola göndərir; `page` filtr dəyişəndə sıfırlanır (formada
  `page` sahəsi yoxdur).
- Dil dəyişəndə yol seqmenti dəyişir, sorğu parametrləri olduğu kimi qalır.
- Statistika və media səhifələri sorğu parametri oxumur (köhnə saytla eyni); media tabları
  kit `Tabs` ilə görünüş vəziyyətidir, JS-siz üç bölmə ardıcıl görünür.

## 5. Xarici keçidlər (dəyişməz)

- XML: `{API_URL}/currencies/{DD.MM.YYYY}.xml` (məzənnə səhifəsi).
- Media faylları: `{API_URL}/media/{id}` (əlavələr, şəkillər, CMS HTML daxili).
- E-CBAR düyməsi, onlayn müraciət, sorğu platforması, sosial şəbəkələr:
  `shared/config/contacts.ts`-də (dəyərlər köhnə `Header.tsx`/`Footer.tsx`-dən köçürülür).
- Telefon: `tel:966` (başlıq), altlıqda `(+994 12) 966`, `(+994 12) 493 5058`, mətbuat `966` daxili `572`.

## 6. i18n namespace kontraktı (`src/locales/{az,en}/`)

| Namespace | Məzmun (açar qrupları) | Köhnə mənbə |
| --- | --- | --- |
| `common` | `brand.{name,short}`, `actions.{retry,search,close,readMore,back,all,download}`, `states.{loading,empty,error}`, `language.*`, `theme.*`, `pagination.{page,of,previous,next}`, `dateLocale` | `t.ts`: `bankName`, `readMore`, `back`, `next`, `prev`, `page`, `all`, `empty`, `dateLocale` |
| `nav` | `home`, `menu`, `more`, `search.{placeholder,submit}`, `hotline`, `ecbar`, `skipToContent` | `t.ts`: `home`, `menu`, `hotline`, `hotlineNumber` |
| `footer` | `navigation`, `contact`, `address`, `phone`, `press`, `internal`, `onlineFeedback`, `questionary`, `allRightsReserved`, `social.*` | `Footer.tsx` lokal `content`, `t.ts`: `contact`, `address`, `allRightsReserved` |
| `home` | `keyIndicators`, `officialRates`, `aznCurrency`, `interestCorridor`, `inflation`, `currentInflation`, `targetInflation`, `moneyMarket`, `azirName`, `azirRates`, `yieldCurve`, `monetaryIndicators`, `moneyMarketNotes`, `bankingSector`, `latestNews`, `publications`, `quickLinks`, `usefulLinks`, `fullList`, `statistics` | `t.ts` maliyyə açarları + `page.tsx` lokal obyektlər |
| `content` | `pressReleases`, `announcements`, `laws`, `regulations`, `category`, `type`, `attachments`, `date`, `news`, `nationalCurrency`, `banknotes`, `coins`, `securityFeatures`, `childPages`, `loadError` | `t.ts`: `pressReleases`, `laws`, `nationalCurrency`, `attachments`, `date`, `loadError`; siyahı səhifələri lokal obyektlər |
| `finance` | `securities`, `emitent`, `infoType`, `regDate`, `dqn`, `file`, `officialRates`, `nominal`, `code`, `currency`, `rate`, `xml`, `noSheet`, `azir`, `term.*`, `inflation`, `year`, `yieldCurve`, `period`, `yield` | `currencies`, `securities`, `statistics` səhifələri |
| `organization` | `title`, `board`, `management`, `divisions`, `offices`, `position`, `receptionDays`, `days`, `phone`, `bio` | `organization` səhifələri, `t.ts`: `organization`, `days` |
| `media` | `title`, `galleries`, `videos`, `streams`, `photos`, `watchVideo`, `images`, `live` | `t.ts`: `media`, `photos`, `videos`, `watchVideo` |
| `search` | `title`, `placeholder`, `results`, `noResults`, `emptyQuery`, `types.{page,press-release,law,money-mark,staff,other}` | `search` səhifəsi |
| `errors` | `loadError`, `contract`, `notFound.{title,description,home}`, `unexpected`, `retry` | `error.tsx`, `t.ts`: `loadError` |

Kit UI mətnləri: `shared/i18n/ui-messages.ts` (31 açar, az/en) — `UIMessagesProvider`.
Paritet testi: hər namespace-də `en` açarları `az` ilə eynidir, boş dəyər yoxdur.

## 7. Cookie-lər

| Ad | Məqsəd | Atributlar | Kim yazır |
| --- | --- | --- | --- |
| `ui-theme` | `light` \| `dark` | `Path=/; Max-Age=1il; SameSite=Lax; Secure` (https) | `ThemeToggle` (client) |

Başqa cookie yoxdur (`NEXT_LOCALE` və sessiya cookie-si silinir).
