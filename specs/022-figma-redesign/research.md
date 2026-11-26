# Research: 022 Figma redizaynı

Mənbə ölçmələri 2026-10-12, Figma bridge (`figma_node`, `figma_text`, `figma_styles`,
`figma_variables`) və `web-cbar-new` kodu üzərində.

## R1 — Rəng token-ləri (D-2)

**Ölçmə**: Figma faylında **variables yoxdur** (`figma_variables` → 0 kolleksiya). Paint style-ı
yalnız bir gradient var ("Linear", #0B4A7A → #053A64). Rənglər node-lardan yığılıb. Kitin
`dist/tokens.css`-i "CBAR Design System" Figma faylından generasiya olunub və Figma rənglərinin
çoxunu eyni hex ilə daşıyır:

| Figma | Harada | Kit primitivi | Kit semantik |
|---|---|---|---|
| #222222 | əsas mətn | `--ui-color-neutral-800` | `--foreground` |
| #004976 | footer fonu, əsas göy | `--ui-color-brand-500` | `--primary` |
| #4BC7B5 | footer xətti, aksent | `--ui-color-secondary-500` | — |
| #D4D4D4 | mega-menyu xətti, kart çərçivəsi | `--ui-color-neutral-300` | — |
| #E5E5E5 | kart çərçivəsi | `--ui-color-neutral-200` | `--border` |
| #F9F9F9 | tabsList, dəhliz kartı fonu | `--ui-color-neutral-50` | `--card` |
| #F5F5F5 | Media bölməsi, birinci ekran fonu | **yoxdur** (yaxını #F0F0F0) | — |
| `0 4 20 rgba(0,0,0,.09/.10)` | header, mega panel kölgəsi | **yoxdur** (`--ui-shadow-*` başqa formadır) | — |
| gradient #0B4A7A→#053A64 | style "Linear" | **yoxdur** | — |

**Decision**: `globals.css`-də route B blokundan sonra app-level semantik token-lər
(`--site-surface-muted`, `--site-divider`, `--site-accent`, `--site-footer`, `--site-shadow-header`,
`--site-gradient-brand`…) kit primitivlərinə `var(--ui-color-*)` ilə istinad edir. Literal yalnız
cədvəldəki 3 "yoxdur" sətri üçündür. Tailwind-ə `@theme inline` ilə `bg-site-surface-muted` və s.
kimi verilir. Komponentlərdə hex yoxdur.

**Rationale**: Kit token-i Figma-nı artıq əks etdirir. Literal sayı minimuma enir, kit yenilənəndə
rənglər avtomatik izləyir.

**Alternatives**: (a) bütün Figma hex-lərini app token-i kimi yazmaq: kitlə dublikat, drift riski;
(b) ən yaxın kit dəyəri: pixel-perfect pozulur; (c) kitə əlavə: düzgün uzunmüddətli yol,
`showcase-ui`-yə ayrıca təklif kimi qeyd olunur, bu feature-u bloklamır.

## R2 — DM Sans

**Ölçmə**: kit `--ui-font-sans: 'DM Sans', …` təyin edir, amma fontu göndərmir. App də yükləmir,
ona görə sistem fontu görünür. Figma 400/500/600/700/800 çəkilərini işlədir. Azərbaycan hərfləri
(ə U+0259, ğ, ı, ş, İ) latin-ext alt dəstindədir.

**Decision** (icrada dəqiqləşdi, 2026-10-12): DM Sans variable woff2 (`wght` 100–1000) iki alt
dəstdə, latin və latin-ext, `public/fonts/dm-sans/`-də `OFL.txt` ilə. `src/app/fonts.css`-də iki
`@font-face`, hər biri öz `unicode-range`-i ilə, ailə adı `'DM Sans'`. Bu ad kitin
`--ui-font-sans`-ına artıq uyğundur, token dəyişmir. Latin faylı root layout-da
`react-dom` `preload()` ilə preload olunur. Fayllar `@fontsource-variable/dm-sans` 5.3.0
tarball-ından (`npm pack`) bir dəfə götürülüb, paket dependency deyil.

İlkin plan `next/font/local` idi. **Rədd edildi**: o, fayl başına `unicode-range` vermir. İki alt dəst
eyni çəki və stil ilə elan olunanda brauzer yalnız birini götürür və ə/ğ/ş fallback şriftə düşür.

**Rationale**: build zamanı şəbəkə tələb etmir (CI və korporativ proxy), kənar origin yoxdur, CSP
dəyişmir, self-hosted və preload olunur.

**Alternatives**: `next/font/google`: build-də Google-a sorğu gedir, CI/proxy riski var.
`@fontsource` runtime paketi: yeni dependency və CSS import-u. Statik çəkilər (5 fayl × 2 subset): daha ağır.

## R3 — Tam enli bölmələr

**Ölçmə**: `shell/site-shell.tsx` `<main className="mx-auto max-w-7xl px-4 py-8">`. Bütün route-lar
bu konteynerdədir. Figma home-da Media bölməsinin fonu və birinci ekranın fonu 1728 enindədir.
View-ların özləri əlavə `mx-auto max-w-*` istifadə edir.

**Decision**: `<main>` konteynersiz olur. `app/[locale]/(content)/layout.tsx` digər route-ları
site konteynerinə (`max-w-site px-4 py-8`) bükür. Route qovluqları `git mv` ilə group-a köçür.
Ana səhifə (`[locale]/page.tsx`) group-dan kənardadır və bölmələr öz konteynerini daxildə açır.
`error.tsx`, `loading.tsx`, `not-found.tsx` `[locale]`-də qalır və öz konteynerini alır.

**Rationale**: URL dəyişmir, digər səhifələrin vizualı dəyişmir (yalnız 1280 → 1320), `100vw`
hack-i və onun Windows-da yaratdığı üfüqi sürüşmə (SC-002) yoxdur.

**Alternatives**: CSS full-bleed (`mx-[calc(50%-50vw)]`): scrollbar üfüqi sürüşmə yaradır.
`x-pathname` başlığı ilə shell-də şərt: proxy və layout arasında gizli əlaqə yaradır.

## R4 — Breakpoint-lər və konteyner

**Ölçmə**: Figma frame-ləri 390 / 744 / 1728. Kontent 1320 (1728-də 204 kənar boşluq). App Tailwind
default breakpoint-lərini işlədir, digər səhifələr `sm/md/lg`-yə söykənir.

**Decision**: `@theme`-ə `--breakpoint-tab: 46.5rem` (744), `--breakpoint-desk: 85rem` (1360 = 1320 + 2×20),
`--container-site: 82.5rem` (1320) əlavə olunur. Yeni komponentlər `tab:` və `desk:` işlədir,
mövcud breakpoint-lər dəyişmir. Mobil kənar boşluq 16px, planşet 40px (Figma tablet frame-dən
yoxlanılacaq, T-mərhələ 5).

**Alternatives**: `md`-ni 744-ə dəyişmək: bütün digər səhifələri sürüşdürür.

## R5 — Mega-menyu

**Ölçmə**: Figma paneli 1320 en, padding 30/60, kölgə `0 4 20 rgba(0,0,0,.1)`. Bölmə başlığı
600 20/28, altında 1px #D4D4D4. 4 sütun, hər biri 262 en, space-between. Sütun başlığı 600 16/28,
bəndlər 400 14/28, gap 8. Mövcud kod CSS `group-hover`/`group-focus-within` ilə JS-siz açılır,
klikdən sonra `NavSectionItem` `data-closed` qoyur. Ağac dərinliyi 3-dür: bölmə → sütun → bənd.

**Decision**: modeli saxlamaq. `LEVEL_2` flyout-u header-in altında `left-0 right-0` mövqeli tam
enli panelə çevrilir (header `relative`). Daxildə `max-w-site` konteyner, bölmə başlığı, xətt və
`grid grid-cols-4` sütunlar. 3-cü səviyyə artıq flyout deyil, sütun daxilində siyahıdır. 4-dən çox
sütun növbəti sətirə keçir. Overflow ("digər") menyusu eyni paneldən istifadə edir.

**Alternatives**: Radix NavigationMenu / kit menyusu: JS tələb edir, spec 002 FR-010 pozulur.

## R6 — Gizli bloklar

**Ölçmə**: `publications`, `links` (quick/useful) `GET /homepage` cavabının içindədir, əlavə sorğu
yoxdur. Video tabı ayrıca `GET /videos` sorğusudur.

**Decision**: `views/home/blocks.ts`:
`HOME_BLOCKS = { publications: false, usefulLinks: false, quickLinks: false, videosTab: false } as const`.
View bayrağa görə render edir. Loader `videosTab` söndürülüdürsə `/videos` sorğusunu göndərmir.
`HomeViewData`-da sahələr qalır (`videos` boş massiv olur). Widget-lər (`links-grid.tsx`) və onların
testləri dəyişmir. Gizli blokların view testləri bayrağın söndürülü olduğunu yoxlayır, blok testləri
widget səviyyəsində qalır.

**Alternatives**: env dəyişəni: runtime konfiqurasiya tələb etmir, istifadəçi qərarı kodda olmalıdır.
Silmək: istifadəçi rədd edib.

## R7 — Müvəqqəti statik bloklar

**Decision**: `views/home/mock.ts` (server tərəfi, `getHomeMocks(locale)`): strategiya kartları,
təqvim tədbirləri, elanlar az/en. Hər export `TODO(api): spec <gələcək>` şərhi ilə. Şəkillər
(sənəd üz qabıqları, coin banner fallback-ı yoxdur) `public/site/home/`-də statik. Loader mock-u
`HomeViewData`-ya birləşdirir ki, view gələcəkdə API data-sı ilə eyni tipi alsın. Linklər mövcud
CMS səhifələrinə gedir (məs. `/az/…strategiya…`). Ünvanlar quickstart-da test mühitində yoxlanılır.

## R8 — Tünd temanın ləğvi

**Ölçmə**: `app/layout.tsx` `ui-theme` cookie-sini oxuyub `<html class="dark">` qoyur.
`shell/theme-toggle.tsx`, `shared/config/cookies.ts` (`THEME_COOKIE`, `parseTheme`),
`shared/model/ui-store.ts`, `docs/cookies.md`. `globals.css`-də `html.dark { color-scheme: dark }`.

`ui-store.ts` yalnız tema saxlayır. `providers/app-providers.tsx` `hydrateTheme(theme)` çağırır.
App kodunda 2 `dark:` class-ı var (header loqosu).

**Decision**: `theme-toggle.tsx`(+test), `ui-store.ts` (tam), `app-providers`-dəki tema prop-u və
hydrate çağırışı, `THEME_COOKIE`/`parseTheme`/`ThemePreference`, `html.dark` qaydası və loqonun
`dark:` class-ları silinir. `UI_COOKIE_MAX_AGE` başqa istifadəçi yoxdursa silinir. `@custom-variant dark`
(route B) qalır, `.dark` heç vaxt qoyulmadığı üçün kitin `dark:` qaydaları işə düşmür. Köhnə
cookie brauzerdə qalsa da oxunmur. Cookie registrindən (`cookies.ts` şərhi, `docs/cookies.md`)
`ui-theme` çıxır. Müyəssərlik widget-inin `accw` cookie-si qalır.
