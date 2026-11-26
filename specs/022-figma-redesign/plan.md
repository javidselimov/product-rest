# Implementation Plan: Public saytın Figma dizaynına keçidi

**Branch**: `feature/022-figma-redesign` | **Date**: 2026-10-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-figma-redesign/spec.md`

## Summary

`web-cbar-new`-in ana səhifəsi və bütün səhifələrin shell-i (header, mega-menyu, planşet/mobil
menyu, footer) Figma "cbar website (Copy)" dizaynına pixel-perfect uyğunlaşdırılır. Data qatı
əsasən dəyişmir: mövcud widget-lər yeni layout-a düzülür və yenidən stillənir. Dizaynda olub
data mənbəyi olmayan 3 blok (Strategiya və sənədlər, Təqvim, Elanlar) müvəqqəti statik
məzmunla gəlir. Dizaynda olmayan 4 blok gizlədilir, kodda qalır. Tünd tema ləğv olunur.

Əsas texniki qərarlar ([research.md](./research.md)):

- Rənglər: kitin `tokens.css` primitivləri Figma-nın rənglərini artıq daşıyır (#004976, #4BC7B5,
  #222, #D4D4D4, #E5E5E5, #F9F9F9). App-level semantik token-lər `globals.css`-də bu
  primitivlərə istinad edir. Hex/rgba literalı yalnız kitdə olmayan 3 dəyər üçündür (D-2): R1.
- DM Sans: `public/fonts/dm-sans/` variable woff2 (latin + latin-ext) + `@font-face` `unicode-range`. Kənar sorğu yoxdur: R2.
- Tam enli bölmələr: `app/[locale]/(content)/` route group-u konteyneri digər səhifələrə verir,
  ana səhifə konteynersiz qalır. URL-lər dəyişmir: R3.
- Breakpoint-lər: yeni `tab` (744) və `desk` (1360) əlavə olunur. Mövcud `sm/md/lg/xl`-ə
  toxunulmur, digər səhifələr dəyişmir: R4.
- Mega-menyu: mövcud CSS hover/focus-within modeli saxlanılır. Yalnız panel quruluşu tam enli
  sütunlara çevrilir: R5.
- Gizli bloklar: `views/home/blocks.ts`-də bayraqlar. Loader söndürülmüş blokun sorğusunu
  göndərmir: R6.

## Technical Context

**Language/Version**: TypeScript 5, React 19, Next.js 16 (App Router, `src/proxy.ts`)

**Primary Dependencies**: `@cbar/lib-react-ui-kit` (Tabs, Button, Card, Sheet, icons), Tailwind 4,
ECharts (mövcud), react-i18next. **Yeni runtime dependency yoxdur**. DM Sans font faylları statik
asset-dir (OFL 1.1), npm paketi deyil.

**Storage**: N/A (backend dəyişmir)

**Testing**: Vitest + Testing Library + MSW (`onUnhandledRequest: 'error'`), `npm run verify`.
Vizual müqayisə əl ilə: brauzer ekran görüntüsü və Figma `figma_png` exportu yanaşı.

**Target Platform**: Next standalone Node server (SSR), müasir brauzerlər, 320–1920px

**Project Type**: web application (yalnız frontend komponenti `product-rest/web-cbar-new`)

**Performance Goals**: ana səhifə sorğu sayı artmır (SC-004). Video sorğusu gizli blokla birlikdə
düşür. Font `display: swap` ilə yüklənir və preload olunur, layout sürüşməsi `adjustFontFallback` ilə azaldılır.

**Constraints**: JS-siz naviqasiya (spec 002 FR-006/FR-010), CSP dəyişmir, rənglər yalnız
semantik token-lərdən (D-2 istisnası ilə), `globals.css` route B bloku toxunulmazdır.

**Scale/Scope**: shell (7 fayl), home view və loader, 11 home widget, 3 yeni widget, ~10 route
qovluğunun `(content)` group-una köçürülməsi, i18n (az/en), testlər.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Workspace konstitusiyası (`.specify/memory/constitution.md`) və web-cbar-new konstitusiyası
(`product-rest/web-cbar-new/.specify/memory/constitution.md`).

| Maddə | Yoxlama | Status |
|---|---|---|
| WS I.2 `product-host` referansı | Spec `HomeController::actionIndex`, `views/home/index.php`, `layouts/header.php`, `footer.php`, `menu/*`-ni sadalayır | ✅ |
| WS I.3 səssiz itki yoxdur | Nəşrlər, faydalı linklər, sürətli keçidlər, video tabı **gizlədilir, ləğv edilmir** (FR-015). Kod və testlər qalır | ✅ |
| WS I.5 informasiya arxitekturası | Menyu strukturu CMS ağacından qalır. Yalnız görünüş dəyişir | ✅ |
| WS II.3 çox proyekt | Yalnız `web-cbar-new`: bir MR, deploy sırası yoxdur | ✅ |
| WS VII kontraktlar | API kontraktları dəyişmir. Public URL-lər dəyişmir (route group URL-ə təsir etmir) | ✅ |
| WS VIII icra ilə verification | quickstart: `verify`, `local:testcbar`, 3 enlikdə vizual müqayisə | ✅ |
| W II yeni runtime dependency | Yoxdur. Font statik asset-dir (R2) | ✅ |
| W III.1 kit control-ları | Tabs, Button, Sheet kit-dəndir. Mega-menyu panelı semantik `<nav>/<ul>/<a>`-dır, control deyil (spec 002 R9 kimi) | ✅ |
| W III.3 yalnız semantik rəng | Komponentlərdə hex yoxdur. Token faylında 3 literal: **D-2** (təsdiqlənib 2026-10-12) | ⚠️ D-2 |
| W III.4 route B bloku | Toxunulmur. Yeni token-lər və `@theme` bloku ondan sonra gəlir. `@custom-variant dark` qalır | ✅ |
| W III.6 dark mode | Tema seçimi ləğv olunur, `.dark` class-ı heç vaxt qoyulmur. Hydration riski azalır | ✅ |
| W IV FSD | Yeni widget-lər `widgets/home-cards`-də, mock `views/home`-da. Import yalnız aşağıya | ✅ |
| W IV.2 nazik route | `(content)/layout.tsx` yalnız konteyner `<div>`-dir, məntiq yoxdur | ✅ |
| W VI test | Mock yalnız MSW (kontrakt). Gizli bloklar üçün mövcud widget testləri qalır | ✅ |
| W VIII.6 cookie | `ui-theme` cookie-si ləğv olunur, `docs/cookies.md` və `cookies.ts` registri yenilənir | ✅ |
| W XI server/client | Yeni `'use client'` yalnız `statistics-tabs` və `news-tabs`-dadır (kit Tabs). CLAUDE.md siyahısı yenilənir | ✅ |

**Gate nəticəsi**: keçir. Yeganə sapma D-2-dir, istifadəçi tərəfindən təsdiqlənib.

**Post-design re-check (Phase 1-dən sonra)**: [contracts/ui-contract.md](./contracts/ui-contract.md)
və [data-model.md](./data-model.md) yuxarıdakı cədvələ uyğundur. Yeni pozuntu yaranmayıb.
D-2 R1-də 3 literal ilə məhdudlaşdırılıb.

## Project Structure

### Documentation (this feature)

```text
specs/022-figma-redesign/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R8
├── data-model.md        # view model dəyişiklikləri, mock tipləri, blok bayraqları
├── quickstart.md        # verification addımları
├── contracts/
│   └── ui-contract.md   # token-lər, breakpoint-lər, Figma node → komponent xəritəsi
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (`product-rest/web-cbar-new`)

```text
src/
├── app/
│   ├── fonts.css                 # YENİ: 2 × @font-face 'DM Sans' (unicode-range), R2
│   ├── globals.css               # app token-ləri + @theme (container, breakpoint), dark bloku silinir
│   ├── layout.tsx                # tema cookie oxuma silinir, font class-ı <html>-ə
│   └── [locale]/
│       ├── layout.tsx            # dəyişmir
│       ├── page.tsx              # ana səhifə: konteynersiz
│       ├── error.tsx, loading.tsx, not-found.tsx
│       └── (content)/            # YENİ route group
│           ├── layout.tsx        # site konteyneri (1320 + padding + py)
│           └── [...slug]/ currencies/ laws/ media/ national-currency/
│               organization/ press-releases/ search/ securities/ statistics/   # köçürülür (git mv)
├── shell/
│   ├── site-shell.tsx            # <main> konteynersiz
│   ├── site-header.tsx           # üst zolaq + nav, ThemeToggle çıxır
│   ├── mega-menu.tsx             # tam enli panel, sütunlar
│   ├── mobile-nav.tsx            # Figma tablet/mob menyu
│   ├── site-footer.tsx           # 4 sütun + alt zolaq
│   ├── header-search.tsx, language-switcher.tsx   # restyle
│   └── theme-toggle.tsx(+test)   # SİLİNİR
├── shared/config/
│   ├── contacts.ts               # topLinks, usefulLinks (footer), callCenter
│   └── cookies.ts                # THEME_COOKIE silinir
├── shared/model/ui-store.ts      # SİLİNİR (yalnız tema saxlayırdı)
├── providers/app-providers.tsx   # tema prop-u və hydrateTheme çıxır
├── views/home/
│   ├── index.tsx                 # yeni sıra: first screen → statistics → media → promo → strategy|calendar
│   ├── loader.ts                 # blok bayraqlarına görə sorğu, tiplər optional
│   ├── blocks.ts                 # YENİ: HOME_BLOCKS bayraqları
│   └── mock.ts                   # YENİ: TODO(api) strategiya, təqvim, elanlar (az/en)
├── widgets/hero-slider/          # restyle
├── widgets/home-cards/
│   ├── currency-card, inflation-card, corridor-card     # 424 sütun, Figma kartları
│   ├── statistics-tabs.tsx       # YENİ ('use client', kit Tabs)
│   ├── info-widget, money-market-card, yield-curve-card # tab panelləri kimi restyle
│   ├── news-tabs.tsx             # Xəbərlər · Elanlar · Qalereya
│   ├── strategy-docs.tsx         # YENİ
│   ├── event-calendar.tsx        # YENİ
│   └── links-grid.tsx            # dəyişmir (gizli bloklar), PromoBannerCard coin banner kimi restyle
└── locales/{az,en}/home.json, nav.json, footer.json   # yeni etiketlər
docs/cookies.md                   # ui-theme silinir
CLAUDE.md                         # 'use client' siyahısı, tema qeydi, (content) group
```

**Structure Decision**: tək komponent (`web-cbar-new`). FSD qatları dəyişmir. Yeganə struktur
dəyişikliyi `(content)` route group-udur (R3).

## Mərhələlər (hər biri ayrıca commit, sonunda `npm run verify`)

1. **Fundament**: font, token-lər, `@theme`, `(content)` group, `<main>` konteyneri, dark mode silinməsi.
   Bu mərhələdən sonra bütün səhifələr əvvəlki kimi görünür, yalnız font və 1320 en dəyişir.
2. **Header + mega-menyu** (desktop).
3. **Footer** (3 breakpoint).
4. **Ana səhifə blokları** (desktop): bayraqlar, loader, yeni widget-lər, mock, i18n, testlər.
5. **Planşet və mobil**: menyu "opened" vəziyyəti, home və footer-in 744/390 variantları.
6. **Yekun**: vizual müqayisə (quickstart §3), CLAUDE.md, business_logic sync qeydi.

## Complexity Tracking

| Pozuntu | Niyə lazımdır | Daha sadə alternativ niyə rədd edildi |
|---|---|---|
| W III.3: token faylında 3 literal (D-2) | Figma-da #F5F5F5 bölmə fonu, header kölgəsi `rgba(0,0,0,.09)` və hero gradienti kitin primitivlərində yoxdur. Pixel-perfect tələbi (istifadəçi qərarı) | Ən yaxın kit dəyəri (#F0F0F0, `--ui-shadow-md`) vizual fərq yaradır. Kitə əlavə etmək `showcase-ui` dəyişikliyi və yeni kit relizi tələb edir (sonrakı addım kimi tövsiyə olunur, R1) |
