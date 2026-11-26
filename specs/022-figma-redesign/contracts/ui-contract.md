# UI Contract: 022 Figma redizaynı

Bu sənəd dizayn ilə kod arasındakı müqavilədir: hansı token, breakpoint və Figma node hansı
komponentə uyğundur. Vizual yoxlama (quickstart §3) bu cədvəllərə qarşı aparılır.

## 1. Token-lər (`src/app/globals.css`, route B blokundan sonra)

| App token | Dəyər | Tailwind | Figma |
|---|---|---|---|
| `--site-text` | `var(--foreground)` | `text-foreground` (mövcud) | #222 |
| `--site-brand` | `var(--primary)` | `bg-primary` (mövcud) | #004976 |
| `--site-accent` | `var(--ui-color-secondary-500)` | `bg-site-accent` | #4BC7B5 |
| `--site-divider` | `var(--ui-color-neutral-300)` | `border-site-divider` | #D4D4D4 |
| `--site-surface` | `var(--ui-color-neutral-50)` | `bg-site-surface` | #F9F9F9 |
| `--site-surface-muted` | **literal** (D-2) | `bg-site-surface-muted` | #F5F5F5 |
| `--site-shadow-header` | **literal** (D-2) | `shadow-site-header` | `0 4px 20px rgba(0,0,0,.09)` |
| `--site-shadow-panel` | **literal** (D-2), header ilə eyni forma, .10 | `shadow-site-panel` | `0 4px 20px rgba(0,0,0,.1)` |
| `--site-gradient-brand` | **literal** (D-2), yalnız istifadə olunan node tapılanda əlavə olunur | `bg-site-gradient-brand` (utility) | #0B4A7A → #053A64 |
| `--ui-font-sans` | kitin dəyəri (`'DM Sans', …`) dəyişmir, ailə `fonts.css`-də | `font-sans` | DM Sans |

D-2 literalları oklch-də yazılır (kitin konvensiyası), şərhdə Figma hex-i ilə.

## 2. Layout

| Ad | Dəyər | İstifadə |
|---|---|---|
| `--container-site` | 82.5rem (1320) | `max-w-site` |
| `--breakpoint-tab` | 46.5rem (744) | `tab:` |
| `--breakpoint-desk` | 85rem (1360) | `desk:` |
| Kənar boşluq | mobil 16, planşet 40 (Figma tablet-dən dəqiqləşir), desktop auto | `px-4 tab:px-10 desk:px-0` |
| Home bölmələri arası | 80 | `gap-20` |

## 3. Tipoqrafiya (DM Sans)

| Rol | Ölçü/sətir | Çəki | Nümunə |
|---|---|---|---|
| Hero başlıq | 40/54 | 700 | slayder başlığı |
| Hero alt mətn | 24/36 | 400 | |
| Bölmə başlığı (H2) | 32/44 | 600 | İcmal göstəricilər, Media, Təqvim |
| Kart başlığı | 20/28 | 600 | AZN məzənnəsi, mega panel başlığı, xəbər başlığı |
| Böyük rəqəm | 36/40 | 800 | 15301.3 |
| Kart rəqəmi | 22–24/28 | 700 | 1.7000, 5.5% |
| Sütun başlığı / nav | 16/28, nav 14 | 600 | |
| Mətn | 16/28 | 400 | |
| Kiçik | 14/28, 12 | 400–500 | tarix, teq |
| Mobil H1/H2/H3 | 22/28, 20, 16 | 600 | Figma text style-ları |

## 4. Figma node → komponent

| Figma | node | Komponent |
|---|---|---|
| Desktop home | `813:25078` | `views/home/index.tsx` |
| first screen | `1083:26736` | `HeroSlider` + sağ sütun |
| AZN məzənnəsi | `809:24614` | `CurrencyCard` |
| inflyasiya | `809:24678` | `InflationCard` |
| faiz dəhlizi | `809:24733` | `CorridorCard` |
| statistics (set) | `212:3234`, tablet `1072:24780`, mobil `1075:26138` | `StatisticsTabs` |
| tabsList | `812:24785` | kit `Tabs` (`TabsList`) |
| media | `813:25084` | `NewsTabs` |
| card / press-release | `314:1926` | `NewsTabs` kartı (default + hover/active) |
| News card tablet / mobil | `831:4140` / `847:9079` | `NewsTabs` kartı (tab/mobil) |
| coin banner | `813:26806` | `PromoBannerCard` |
| strategy and calendar | `813:25096` | `StrategyDocs` + `EventCalendar` |
| calendar | `382:1551` | `EventCalendar` sətri |
| menu (header) | `12:1065` | `SiteHeader` |
| nav menu / nav link | `9:28` / `9:10` | `MegaMenu` nav çubuğu |
| language / call center | `12:1058` / `12:1053` | `LanguageSwitcher` / hotline linki |
| mega panel | `16:4067`, nümunə `1083:26783` | `MegaMenu` panel |
| tablet menu / menu for tablet / menu - mob | `821:2320` / `820:2151` / `839:8335` | `MobileNav` |
| footer / tablet / mobil | `813:24811` / `834:5609` / `847:9688` | `SiteFooter` |

`OLD` adlı variantlar nəzərə alınmır.

### Figma-dan təsdiqlənmiş sapmalar

| Tarix | Yer | Figma | Kod | Səbəb |
|---|---|---|---|---|
| 2026-10-19 | Ana səhifə birinci ekranı (`813:25367`), yalnız `desk:` | slayder + sağ panel sabit 744px, altında 80px boz zolaq | sıra Figma ölçüsündə (744, panel 424, sağ boşluq 5.3%) qurulur və `zoom: var(--hero-scale)` ilə bütövlükdə miqyaslanır; `--hero-scale` = (ekran − header) / 744, min 0.5, panel ≤ enin 40%-i (`public/scripts/hero-scale.js`, `widgets/hero-scale`). Boz zolaq yoxdur | İstifadəçi qərarı: brauzer zoom-u nə olursa olsun, header-dən sonra ekranda yalnız slayder + panel mütənasib görünsün, aşağı bölmələr scroll-da. JS-siz miqyas 1 (Figma). Planşet/mobil Figma kimi |

## 5. Davranış müqaviləsi (dəyişməyən)

- Mega-menyu JS-siz açılır (hover, focus-within), keçiddən sonra bağlanır (`data-closed`).
- Dil dəyişdiricisi adi `<a>`-dır (spec 007, tam yüklənmə).
- Axtarış GET formasıdır (`/{locale}/search?q=`).
- Canlı yayım düyməsi yalnız aktiv yayım olanda görünür (spec 006). Figma-da yeri yoxdur, üst zolaqda E-CBAR-dan əvvəl yerləşir.
- Skip-link (`#content`) qalır.
