# Contract: `web-cbar-new` — marşrutlar, yönləndirmə, export, mətnlər

## 1. Səhifə: `/{locale}/statistics/azir`

| Parametr | Format | Default | Səhv olanda |
|---|---|---|---|
| `dateFrom` | `YYYY-MM-DD` | bu gün − 60 (Asia/Baku) | `format` xətası, default aralıq göstərilir |
| `dateTo` | `YYYY-MM-DD` | bu gün; gələcək tarix bu günə endirilir | eyni |
| (birlikdə) | `from ≤ to`, aralıq ≤ 3653 gün | — | `order` / `tooLong` xətası, default aralıq |

- Yalnız `dateFrom` verilibsə, `dateTo` bu gün sayılır (US4-ün 3-cü ssenarisi).
- Parametr `string[]` gələrsə, birincisi götürülür (`first()`).
- Səhifə hissələri ayrıca `{ data, error }` alır: qrafik + cədvəl (eyni sorğu), statistika. Biri yıxılsa, digəri göstərilir (FR-017).
- `generateMetadata`: başlıq + `alternates.languages` (`az` ↔ `en`, eyni query ilə).
- "Yüklə" linki: `<a href="/{locale}/statistics/azir/export?dateFrom=…&dateTo=…">` (cari effektiv aralıq). JS lazım deyil.

## 2. Export: `GET /{locale}/statistics/azir/export`

Route handler. Parametrlər və parser səhifədəki ilə eynidir.

| Hal | Cavab |
|---|---|
| Uğur | `200`, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="AZIR-1D_2026-01-01_2026-01-31.xlsx"; filename*=UTF-8''AZIR-1D_2026-01-01_2026-01-31.xlsx`, `Cache-Control: private, max-age=60` |
| Səhv parametr | `400` `text/plain` (lokal mətn). Səhifə səhv aralıq üçün link yaratmır, bu hal yalnız əl ilə yazılmış URL-də olur |
| api-cbar əlçatmaz | `502` `text/plain` |

Fayl strukturu: [xlsx.md](./xlsx.md).

## 3. Köhnə URL xəritəsi (Konstitusiya VII.2): `src/proxy.ts` → `legacyRedirect()`

Locale redirect-dən **əvvəl** işləyir. Status **308**.

| Köhnə | Yeni |
|---|---|
| `/indeks/rates` | `/az/statistics/azir` |
| `/indeks/rates?language=en` | `/en/statistics/azir` |
| `/az/indeks/rates`, `/en/indeks/rates` (ehtiyat üçün) | `/{az\|en}/statistics/azir` |
| `…?dateFrom=01/09/2026&dateTo=30/09/2026` (`d/m/Y`, `%2F` də ola bilər) | `…?dateFrom=2026-09-01&dateTo=2026-09-30` |
| `…?export=true` (+ tarixlər) | `/{locale}/statistics/azir/export?…` |
| səhv `d/m/Y` dəyəri | parametr atılır (default aralıq) |

- Uyğunlaşma: `^/(az|en)?/?indeks/rates/?$`, böyük-kiçik hərfə həssas deyil.
- Digər query parametrləri atılır.
- `/indeks/chart-data` (köhnə AJAX) və `/indeks/all` (köhnədə artıq söndürülüb) xəritəyə daxil deyil. Onlar mövcud davranışla CMS 404-ə düşür; bu, açıq qərardır (Konstitusiya I.3).

## 4. Ana səhifə kartı

- `money-market-card`: 1D dəyəri `isReservePlan`-dırsa `7,25%*` və kartın altında footnote olur.
- Düymə `/{locale}/statistics/azir`-ə aparır.
- Kartın sorğusu: `getAzir()` əvəzinə `?from={bu gün − 60}` (bütün müddətlər üzrə). Kartın göstərdiyi son dəyərlər dəyişmir.

## 5. Mətnlər (`locales/{az,en}/finance.json` → `azirPage.*`, `home.json` → kart)

| Açar | az | en |
|---|---|---|
| `azirPage.title` | Banklararası Təminatsız Pul Bazarında İstinad Faiz Dərəcəsi - AZIR | Benchmark rate in the unsecured interbank money market – AZIR |
| `azirPage.methodologyAlert` | 15 may 2025-ci il tarixindən etibarən AZIR indeksləri Mərkəzi Bankın İdarə Heyətinin 06 may 2025-ci il tarixində təsdiqlədiyi metodologiya əsasında açıqlanır. | Starting from May 15, 2025, the AZIR indices are calculated based on the methodology approved by the Board of the Central Bank of Azerbaijan on May 6, 2025. |
| `azirPage.filter.from` / `.to` / `.submit` | Başlanğıc tarix / Son tarix / Göstər | From / To / Show |
| `azirPage.filter.error.format` | Tarix düzgün deyil. | The date is not valid. |
| `azirPage.filter.error.order` | Başlanğıc tarix son tarixdən sonra ola bilməz. | The start date cannot be after the end date. |
| `azirPage.filter.error.tooLong` | Aralıq 10 ildən uzun ola bilməz. | The range cannot exceed 10 years. |
| `azirPage.download` | Yüklə | Download |
| `azirPage.columns.date` / `.rate` / `.volume` / `.count` | Tarix / Faiz / Əqdlərin həcmi (mln. AZN) / Əqdlərin sayı | Date / Interest rate / Value of transactions (mln. AZN) / Number of transactions |
| `azirPage.reserveFootnote` (+ `home:azirReserveFootnote`) | *Ehtiyat plan əsasında hesablanmışdır | *Calculated on the basis of the contingency plan |
| `azirPage.empty` | Seçilmiş dövr üçün məlumat yoxdur. | No data for the selected period. |
| `azirPage.summary.title` | AZIR indeksi ilə bağlı məlumatlar | Information about the 1D AZIR index |
| `azirPage.summary.lastDate` | Yenilənmə tarixi | Renewal date |
| `azirPage.summary.lastRate` | Faiz indeksi, %-lə | Interest rate, % |
| `azirPage.summary.rateChangeSinceMonthEnd` | Ötən ayın sonundan faiz fərqi | Interest rate change since previous month-end |
| `azirPage.summary.rateChangeSinceYearEnd` | Ötən ilin sonundan faiz fərqi | Interest rate change since previous year-end |
| `azirPage.summary.lastMinRate` | Son əməliyyat günündə minimum faiz | Minimum interest rate on the last transaction day |
| `azirPage.summary.lastMaxRate` | Son əməliyyat günündə maksimum faiz | Maximum interest rate on the last transaction day |
| `azirPage.summary.lastVolume` | Əməliyyat həcmi, mln. manatla | Value of transactions, mln AZN |
| `azirPage.summary.volumeChangeSinceMonthEnd` | Ötən ayın sonundan dəyişim | Change since previous month-end |
| `azirPage.summary.volumeMin` | Son 1 ildə minimum həcm | Minimum value for the past 1 year |
| `azirPage.summary.volumeMax` | Son 1 ildə maksimum həcm | Maximum value for the past 1 year |
| `azirPage.summary.lastVolumeUsd` | Əməliyyat həcminin dollarla ifadəsi, mln. USD | Value of transactions in US dollars, mln USD |
| `azirPage.export.sheetNotes` | Qeydlər | Notes |
| `azirPage.export.reserveDates` | Ehtiyat plan əsasında hesablanmış günlər | Days calculated on the basis of the contingency plan |

İngiliscə mətnlərin çoxu köhnədə yox idi (açar mətni göstərilirdi). Footnote-un en mətni redaksiya təsdiqinə qədər müvəqqətidir.
