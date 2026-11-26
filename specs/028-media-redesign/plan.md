# Implementation Plan: "Media" giriş səhifəsi və ümumi şablon (Figma)

**Branch**: `feature/028-media-redesign` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/028-media-redesign/spec.md`

## Summary

`web-cbar-new`-də `/media` Figma "Media" giriş səhifəsinə çevrilir: breadcrumb + paylaşma,
CMS ağacından sol menyu, CMS "Media" səhifəsinin başlığı və giriş mətni. Bunun üçün spec 024-ün
"Haqqımızda" şablonu bölmə-agnostik `widgets/section-shell`-ə çevrilir (About davranışı
dəyişmir). Bu gün `/media`-da olan qalereya/video/canlı yayım grid-ləri `/media/galleries` və
`/media/videos`-a köçür. Backend və admin panel dəyişmir.

Əsas texniki qərarlar ([research.md](./research.md)):

- **Şablon ümumiləşir, yenidən yazılmır** (R1): `about-shell` → `section-shell`, `buildSectionShell({ section })`,
  bölmə kökü `SECTION_TITLES[section]` ilə tapılır, Kopya qaydası ümumi `isSectionCopy`.
- **`/media` statik route qalır, CMS səhifəsini slug ilə oxuyur** (R2): `getPage(locale, 'media')`.
  Slug az/en eyni olduğu üçün (`media`) xüsusi xəritə lazım deyil.
- **Grid-lər öz ünvanlarına köçür** (R3): `views/media-galleries`, `views/media-videos`;
  `FEATURE_ROUTES` yenilənir; CMS `navUrl` redaktor işidir.
- **Proxy matcher** (R4): `media` istisnası `media/\d+`-a daralır.
- **i18n** (R5): şablon açarları `about.json`-dan yeni `section.json`-a köçür; `about.json`-da
  About-a məxsus açarlar qalır.
- **Köhnə ünvanlar** (R6): `/gallery/photos…`, `/videos` → `legacyRedirect()`-ə əlavə.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 16 App Router (`src/proxy.ts`)

**Primary Dependencies**: `@cbar/lib-react-ui-kit` (`breadcrumb`, `icon-button`, `icons`, `card`),
Tailwind 4, react-i18next. **Yeni dependency yoxdur.**

**Storage**: N/A. Backend və DB dəyişmir.

**Testing**: Vitest + Testing Library + MSW (`onUnhandledRequest: 'error'`), `npm run verify`
(Node 22 ilə də). Vizual müqayisə əl ilə (quickstart §3).

**Target Platform**: Next standalone Node server (SSR), 320–1920px, JS-siz baxış

**Project Type**: web application, yalnız `product-rest/web-cbar-new`

**Performance Goals**: giriş səhifəsi 3 → 2 API sorğusu. Qalereya/video siyahısı: mövcud
sorğu + ağac (ağac onsuz da layout üçün oxunur və keşlidir).

**Constraints**: `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də. Yeni `'use client'`
yoxdur. Kit token-ləri dəyişmir. `globals.css` route B bloku toxunulmazdır.

**Scale/Scope**: 1 Figma səhifəsi × 3 breakpoint; 1 widget rename (4 istehlakçı view), 1 view
yenidən yazılır (`media`), 2 yeni view + 2 yeni route, 1 view şablona salınır (`gallery`),
1 CMS view şərti (`cms-page`), proxy matcher + 1 legacy xəritə, yeni i18n namespace `section`.

## Constitution Check

Workspace konstitusiyası (**WS**) və web-cbar-new konstitusiyası (**W**).

| Maddə | Yoxlama | Status |
|---|---|---|
| WS I.2 `product-host` referansı | Spec `PagesController::actionIndex` (səhifə 77), `gallery/PhotosController`, `VideosController` sadalayır | ✅ |
| WS I.3 səssiz itki yoxdur | Grid-lər `/media`-dan çıxır, amma `/media/galleries`, `/media/videos`-da eyni datayla qalır (FR-011). "İnzibati işlər…" bəndi menyuda qalır | ✅ |
| WS I.5 informasiya arxitekturası | Menyu, breadcrumb və giriş mətni CMS-dən. Yeni ünvanlar yalnız siyahılar üçün | ✅ |
| WS II.3 çox proyekt | Yalnız `web-cbar-new`, bir MR. API/admin dəyişmir | ✅ |
| WS V.4 redaksiya mətni API-dən | Giriş mətni və menyu adları CMS-dən; kodda yalnız chrome etiketləri (`section.json`, `media.json`) | ✅ |
| WS VII.2 public URL-lər | Mövcud ünvanlar qalır; `/media/galleries`, `/media/videos` əlavə; köhnə `gallery/photos`, `videos` 308 ilə xəritələnir | ✅ |
| WS VIII icra ilə verification | quickstart: `verify`, `local:testcbar`, 3 enlikdə ölçmə, JS-siz | ✅ |
| W I.2 hardcoded UI string yoxdur | Yeni etiketlər `locales/{az,en}/section.json`, `media.json` | ✅ |
| W IX.4 spec-siz kod yoxdur | Bu spec | ✅ |
| W XI client sərhədi | Yeni `'use client'` yoxdur (`print-button` köçür, dəyişmir) | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/028-media-redesign/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── visual-diff.md
├── tasks.md
├── checklists/requirements.md
└── contracts/ui-contract.md
```

### Source Code (`product-rest/web-cbar-new/src`)

```text
entities/page-node/lib/tree.ts            SECTION_TITLES, sectionRoot, isSectionCopy, sectionKeyOf (about* qalır)
widgets/section-shell/                    ← widgets/about-shell (git mv): model.ts, section-shell.tsx,
                                            section-nav.tsx, page-tools.tsx, share-buttons.tsx, print-button.tsx
views/media/                              giriş səhifəsi (CMS səhifə + şablon)
views/media-galleries/                    YENİ — qalereya kartları (mövcud markup), şablon
views/media-videos/                       YENİ — canlı yayım + video kartları, şablon
views/gallery/                            şablona salınır, BackLink silinir
views/cms-page/                           about → section (About blokları yalnız 'about')
views/{organization,division,staff-member} import adları
app/[locale]/(content)/media/galleries/page.tsx   YENİ
app/[locale]/(content)/media/videos/page.tsx      YENİ
shell/nav.ts                              FEATURE_ROUTES
proxy.ts                                  matcher, legacyRedirect
locales/{az,en}/section.json              YENİ; about.json-dan köçən açarlar
shared/testing/fixtures/media-section.ts  YENİ — test API Media ağacı + səhifə
```

## Mərhələlər (hər biri bir commit, `npm run verify` ilə bitir)

1. **Şablonun ümumiləşməsi** — `tree.ts` köməkçiləri, `section-shell` rename, `section.json`,
   istehlakçı view-ların import-ları, testlərin yenilənməsi. Görünüş dəyişmir.
   Commit: `refactor(web-cbar-new): 028 section-agnostic page shell`
2. **Media giriş səhifəsi** — `views/media` CMS səhifə + şablon; `cms-page` Media ağacı üçün
   şablon; fikstür + testlər. Commit: `feat(web-cbar-new): 028 media landing`
3. **Siyahılar və ünvanlar** — `media-galleries`, `media-videos`, `gallery` şablonda,
   `FEATURE_ROUTES`, proxy matcher, legacy xəritə, testlər.
   Commit: `feat(web-cbar-new): 028 media lists and legacy routes`
4. **Yekun** — brauzer ölçmələri (`visual-diff.md`), redaktor qeydi, CLAUDE.md, tracker.
   Commit: `docs(web-cbar-new): 028 media visual diff and editor notes`

## Complexity Tracking

Yoxdur — konstitusiya pozuntusu və ya əlavə mürəkkəblik tələb edən qərar yoxdur.
