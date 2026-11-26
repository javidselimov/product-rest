# Data Model: 022 Figma redizaynı

Backend və API kontraktları **dəyişmir**. Burada yalnız `web-cbar-new`-in view model-i
(`views/home/loader.ts` → `HomeViewData`) və yeni müvəqqəti tiplər təsvir olunur.

## 1. Blok bayraqları — `views/home/blocks.ts`

| Açar | Default | Təsir |
|---|---|---|
| `publications` | `false` | view `Publications`-ı render etmir (data `/homepage`-dən gəlir, sorğu yoxdur) |
| `usefulLinks` | `false` | view `UsefulLinks`-i render etmir |
| `quickLinks` | `false` | view `QuickLinks`-i render etmir |
| `videosTab` | `false` | loader `/videos` sorğusunu göndərmir. `feedTabs`-da video tabı yoxdur |

Qayda: bayraq `true` olanda blok spec 002-dəki davranışla geri qayıdır (widget və testlər
toxunulmazdır). Gələcəkdə tab kimi qaytarmaq üçün dəyişiklik bu fayldan və view-dan başlayır.

## 2. `HomeViewData` dəyişiklikləri

| Sahə | Əvvəl | İndi |
|---|---|---|
| `hero` | `HeroSlide[]` | dəyişmir (slayder: başlıq, alt mətn, link, şəkil) |
| `currency`, `corridor`, `inflation` | — | dəyişmir. Birinci ekranın sağ sütunu |
| `moneyMarket`, `yieldCurve`, `monetary`, `notes`, `banking` | dashboard + aside | dəyişmir. "İcmal göstəricilər" tablarının data-sı (§3) |
| `feedTabs` | press · photos · videos | **news · announcements · gallery** (§4) |
| `promo` | `PromoBanner \| null` | dəyişmir. Coin banner yerində |
| `publications`, `usefulLinks`, `quickLinks` | göstərilir | dəyişmir, **göstərilmir** (§1) |
| `strategyDocs` | — | **YENİ** `StrategyDoc[]` (mock, §5) |
| `calendar` | — | **YENİ** `CalendarEvent[]` (mock, §5) |
| `errors.videos` | `boolean` | qalır. `videosTab=false` olanda həmişə `false` |

## 3. "İcmal göstəricilər" tabları

Tab sırası Figma-dakı kimidir. Data mövcud sahələrdəndir:

| Tab (az / en) | key | Mənbə | Komponent |
|---|---|---|---|
| Monetar / Monetary | `monetary` | `monetary` (infoLines `monetary`) | `InfoWidget` (Figma: böyük rəqəm + vahid + etiket) |
| Gəlirlilik əyrisi / Yield curve | `yield-curve` | `yieldCurve` | `YieldCurveCard` |
| Pul bazarı / Money market | `money-market` | `moneyMarket` (AZIR) | `MoneyMarketCard` |
| Mərkəzi Bankın notları / CBA notes | `notes` | `notes` (rows + grid) | `InfoWidget` |
| Maliyyə sektoru / Financial sector | `financial-sector` | `banking` | `InfoWidget` |

Qaydalar: data-sı boş olan tab göstərilmir. Bloku xəta verən tab panelində `ErrorState`
göstərilir. Bütün tablar boşdursa bölmə render olunmur. "Daha ətraflı" aktiv tabın bölməsinə
aparır (`/statistics`, `/statistics/azir` və s., ünvanlar mövcud loader-dəki kimi).

## 4. Media tabları — `FeedTab`

`FeedTab`/`FeedItem` tipi dəyişmir.

| key | label (az/en) | items | viewAllHref |
|---|---|---|---|
| `news` | Xəbərlər / News | press-relizlər, ilk 4 | `/{locale}/press-releases` |
| `announcements` | Elanlar / Announcements | mock `Announcement[]` → `FeedItem` (`kind: 'image'`, `imageUrl: null`) | mövcud elan CMS səhifəsi (R7) |
| `gallery` | Qalereya / Gallery | qalereyalar | `/{locale}/media` |

## 5. Müvəqqəti tiplər — `views/home/mock.ts` (`TODO(api)`)

```ts
type StrategyDoc = {
  key: string
  title: string          // 600 18/24
  summary: string        // 400 16/28
  coverUrl: string       // /site/home/strategy-*.png
  href: string           // CMS səhifəsi
}

type CalendarEvent = {
  key: string
  date: string           // ISO YYYY-MM-DD → gün (800 24) + ay adı (500 14), locale-ə görə formatlanır
  time: string | null    // "11:00"
  tag: 'press-conference' | 'press-release'   // etiket i18n-dən
  title: string
  href: string | null
}

type Announcement = {
  key: string
  date: string           // ISO
  title: string
  href: string
}
```

Bütün mətnlər az və en üçün ayrıca verilir (`getHomeMocks(locale)`). Bir dildə boş olan
element həmin dildə göstərilmir. Keçmiş tarixli təqvim tədbirləri göstərilmir, sıralama tarix
artan qaydadadır, ən çox 3 tədbir göstərilir.

## 6. Sayt konfiqurasiyası — `shared/config/contacts.ts`

| Açar | Məzmun | Mənbə |
|---|---|---|
| `topLinks` | Karyera, Media, Əlaqə (az/en href) | Figma header üst zolağı |
| `externalLinks.ecbar` | mövcud | dəyişmir |
| `usefulLinks` (footer) | 8 xarici link: Sorğu platforması, MEAS, maliyyə məhsulları axtarışı, Maliyyə savadlılığı portalı, Virtual Təhsil Platforması, Daşınar əmlak reyestri, BMBR Komissiyası, Dövlət xidmətləri portalı | Figma footer. URL-lər köhnə saytın footer-indən (`views/layouts/footer.php`) götürülür |
| `contacts` | mövcud + `press.extension` Figma-da `2243`, kodda `572` | **fərq**: köhnə sayt yoxlanılır, düzgün dəyər saxlanılır (tasks-da qeyd) |
