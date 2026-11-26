# Implementation Plan: Media → Xəbərlər / Elanlar (Figma)

**Branch**: `feature/029-media-news` | **Date**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/029-media-news/spec.md`

## Summary

`/press-releases` siyahısı və detalı Figma "Xəbərlər" dizaynına keçir və spec 028-in Media
şablonuna (`widgets/section-shell`) salınır: filtr sətri (axtarış + tarix aralığı + "təmizlə"),
3 sütunlu kart grid-i (9/səhifə), detalda örtük şəkli və fotoqalereya. Xəbərlər (`type=1`, tipsiz
ünvan da) və Elanlar (`type=2`) eyni şablondur. Bunun üçün `api-cbar` siyahısına `q`/`from`/`to`
filtrləri və cavablara `type` sahəsi, `api-cbar-admin` siyahısına `type` filtri əlavə olunur;
admin paneldə "Növ" seçimi, sütunu və filtri yaranır. Plan zamanı tapılan gizli bug — admin-dən
saxlanan hər yazının `type=0` alması — admin API-də nullable `type` + validasiya ilə bağlanır.
Sxem dəyişmir.

Əsas texniki qərarlar ([research.md](./research.md)):

- **Ünvanlar qalır, tipsiz = Xəbərlər** (R1); detal növü API-dəki yeni `type` sahəsindən (R2).
- **Tarix aralığı = iki native `<input type="date">` bir çərçivədə** (R3) — JS-siz GET forması,
  kitin `DateRangePicker`-i `name` daşımır. Placeholder fərqi `visual-diff.md`-yə.
- **Filtr sətri view-a məxsusdur** (R4), ümumi `FilterForm` dəyişmir.
- **Yeni widget-lər**: `widgets/news-grid` (server), `widgets/photo-gallery` (yeganə yeni
  `'use client'`) (R5, R7). Yeni dependency yoxdur.
- **API filtrləri**: `ILIKE` + escape, Bakı `+04:00` gün sərhədi, `from`/`to` `DateOnly` (R8).
- **Soft-delete ölçülür, fərz edilmir**: `ToQueryString()` (R9).
- **Admin `type`**: `short?` — `null` POST-da 1, PUT-da köhnə dəyər; səhv → 400 (R10).
- **Testlər funksionaldır** (R12): istifadəçi əməli → görünən nəticə, MSW real kontraktla.

## Technical Context

**Language/Version**: C# / .NET 10 (iki API); TypeScript 5 strict — Next.js 16 App Router + React 19
(`web-cbar-new`), React 19 + Vite (`web-cbar-admin-new`)

**Primary Dependencies**: EF Core + Npgsql; `@cbar/lib-react-ui-kit` 0.4.0 (`button`, `input`
`inputVariants`, `icon-button`, `pagination`, `icons`), Tailwind 4, react-i18next, Zod, TanStack
Query (admin). **Yeni dependency yoxdur.**

**Storage**: PostgreSQL (`press_releases`, `press_release_translations`, `press_release_assets`) —
dəyişmir. Şəkillər MinIO `/media/{id}` proxy ilə.

**Testing**: Vitest + Testing Library + `userEvent` + MSW (`onUnhandledRequest: 'error'`), hər iki
frontend-də `npm run verify`, Node 22 ilə də. API-lərdə test layihəsi yoxdur: `dotnet build`,
OpenAPI lint/bundle/contract/drift, `ToQueryString`, deploy-dan sonra `curl` (quickstart §2).

**Target Platform**: Next standalone Node server (SSR, JS-siz baxış), nginx-də SPA (admin),
Kubernetes-də .NET API-lər

**Project Type**: web application — 4 komponent, 4 MR

**Performance Goals**: siyahı səhifəsi 2 API sorğusu (siyahı + keşli ağac), detal 2 (detal + ağac)
— bugünkü qədər. Filtrli sorğu `press_releases_pub_idx` istifadə edir; `ILIKE` ən çox bir neçə min
sətir üzrə.

**Constraints**: `dangerouslySetInnerHTML` yalnız `widgets/cms-content`; rənglər yalnız semantik
token; `globals.css` route B bloku toxunulmazdır; public API read-only rol; geriyə uyğun API
(Maddə VII.3); kod şərhləri ingiliscə, toxunulan fayllarda azərbaycanca şərhlər ingiliscəyə
çevrilir (yaddaş qaydası).

**Scale/Scope**: Figma 3 frame × 3 breakpoint; web-cbar-new: 2 view yenidən yazılır, 2 yeni widget,
1 view-a məxsus filtr komponenti, API funksiyası + sxem, i18n, 1 token; api-cbar: 1 controller
(2 action); api-cbar-admin: 1 controller (3 action) + DTO; admin panel: 1 modul konfiqi + sxem +
i18n + MSW handler.

## Constitution Check

Workspace konstitusiyası (**WS**), web-cbar-new (**W**) və admin template konstitusiyası (**A**).

| Maddə | Yoxlama | Status |
|---|---|---|
| WS I.2 `product-host` referansı | Spec `PressReleasesController::actionIndex/actionDetail`, `PressReleasesForm` sadalayır | ✅ |
| WS I.3 səssiz itki yoxdur | Köhnə `dateFrom/dateTo` filtri bərpa olunur. "Hamısı" düyməsi götürülür — tipsiz ünvan Xəbərlərdir, Elanlar öz bəndindədir; spec Assumptions-da açıq qərar. Köhnə default "ayın 1-i" ləğvi açıq yazılıb | ✅ |
| WS I.5 informasiya arxitekturası | Menyu, breadcrumb CMS ağacından; ünvanlar dəyişmir | ✅ |
| WS II.3 çox proyekt | 4 ayrı MR, deploy sırası quickstart §5 və contracts | ✅ |
| WS III.2 read-only | `api-cbar` yalnız SELECT; yeni yazma yoxdur | ✅ |
| WS III.3 public filtrlər | Published + embargo + soft-delete (R9 ilə **ölçülür**) + locale tərcüməsi | ✅ |
| WS III.4 audit | Admin yazma yolları dəyişmir, `AuditService` qalır | ✅ |
| WS IV.2 start/deploy sırası | `api-cbar-admin` → `api-cbar` → admin panel → sayt; aralıq vəziyyətlər uyğun (nullable `type`) | ✅ |
| WS V.1/V.2 Domain, migration | Dəyişmir (FR-021) | ✅ |
| WS V.4 i18n | Yeni chrome etiketləri az/en `content.json`, `pressReleases.json`; redaksiya mətni API-dən | ✅ |
| WS VI.4 admin MSW real kontrakt | Handler `type` filtri və 400 qaydası ilə real API kimi | ✅ |
| WS VI.5 rich-text | Editor dəyişmir | ✅ (N/A) |
| WS VII.2 public URL-lər | Ünvanlar eyni; legacy `press-release-{id}` xəritəsi əhatədən kənar (028-dən "notdoneyet", ayrıca spec) | ✅ |
| WS VII.3 API geriyə uyğunluq | Yalnız yeni istəyə bağlı parametr və yeni cavab sahəsi | ✅ |
| WS VIII icra ilə verification | quickstart §1–4; Docker yoxdur → API icrası test mühitində deploy-dan sonra (açıq yazılıb) | ✅ |
| W kit / token | Kit subpath import; 1 yeni semantik site token (`site-image-placeholder`) | ✅ |
| W I.2 hardcoded string yoxdur | Bütün etiketlər locale JSON-da | ✅ |
| W IX.4 spec-siz kod yoxdur | Bu spec | ✅ |
| W XI client sərhədi | Bir yeni `'use client'` (`photo-gallery`, state tələb edir), CLAUDE.md siyahısına yazılır | ✅ |
| W D6 filtrlər JS-siz | Native GET forması, native date input | ✅ |
| A `npm run verify` | Admin gate | ✅ |
| Spec-first endpoint qaydası | OpenAPI əvvəl, sonra controller; route dəyişmir | ✅ |

**Post-design re-check (Phase 1-dən sonra)**: dəyişiklik yoxdur. Nullable `type` qərarı WS IV.2
sırasını pozmadan bug-ı bağlayır; yeni client modul bir dənədir və əsaslandırılıb.

## Project Structure

### Documentation (this feature)

```text
specs/029-media-news/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── visual-diff.md            (implementasiya sonunda)
├── tasks.md                  (/speckit-tasks)
├── checklists/requirements.md
└── contracts/
    ├── public-api.md
    ├── admin-api.md
    └── ui-contract.md
```

### Source Code

```text
product-rest/api-cbar/
  openapi/paths/press-releases.yaml           q, from, to; type təsviri
  openapi/components/schemas/press-releases.yaml   item + detail: type
  src/Cbar.WebApi/Controllers/PressReleasesController.cs   filtrlər, type, (R9 lazımdırsa DeletedAt)

product-rest/api-cbar-admin/
  openapi/paths/press-releases.yaml           list: type; upsert: type nullable + 400
  openapi/components/parameters.yaml          PressReleaseType
  src/Cbar.AdminApi/Controllers/PressReleasesController.cs   type filtri, short? Type, validasiya

product-rest/web-cbar-admin-new/src/
  features/press-releases/model/{schemas,module}.ts   type sahəsi/sütunu/filtri
  features/press-releases/model/types.ts (YENİ və ya module.ts daxilində)  PRESS_RELEASE_TYPE_OPTIONS
  shared/testing/handlers/press-releases.ts   type filtri, 400 qaydası
  shared/testing/fixtures/…                   type dəyərləri
  locales/{az,en}/pressReleases.json
  features/press-releases/**/*.test.tsx       funksional testlər

product-rest/web-cbar-new/src/
  features/press-releases/api/press-releases.api.ts    obyekt parametrlər (q, from, to, type, page, pageSize)
  features/press-releases/model/schemas.ts             type sahəsi; splitPressReleaseAssets (+ test)
  views/press-releases/{index.tsx,loader.ts,news-filter.tsx}   yenidən yazılır, SectionShell
  views/press-release/{index.tsx,loader.ts}            yenidən yazılır, SectionShell, örtük, qalereya
  views/home/loader.ts                                 yeni API imzası
  widgets/news-grid/{news-grid.tsx,index.ts}           YENİ
  widgets/photo-gallery/{photo-gallery.tsx,index.ts}   YENİ ('use client')
  app/globals.css                                      --site-image-placeholder
  app/[locale]/(content)/press-releases/page.tsx       metadata başlığı növə görə
  locales/{az,en}/content.json                         news.* açarları
  shared/testing/{handlers,fixtures}/press-releases.ts filtrləri real API kimi süzür, type, şəkil qoşmaları
  ../CLAUDE.md                                         'use client' siyahısı
```

**Structure Decision**: Dörd mövcud komponent, hər biri öz MR-ı. Yeni proyekt və ya paylaşılan kod
yoxdur. Frontend FSD qatları: widget-lər (`news-grid`, `photo-gallery`) yalnız `entities`/`shared`
import edir; `splitPressReleaseAssets` `features/press-releases/model`-dədir (loader işlədir).

## Mərhələlər (hər biri bir commit, öz gate-i ilə bitir)

1. **api-cbar-admin** — OpenAPI (list `type`, upsert nullable `type` + 400) → controller.
   Gate: lint/bundle/contract/drift + `dotnet build`.
   Commit: `fix(api-cbar-admin): 029 press release type filter and validation`
2. **api-cbar** — OpenAPI (`q`, `from`, `to`, `type` sahəsi) → controller; R9 `ToQueryString`
   yoxlaması. Gate: eyni. Commit: `feat(api-cbar): 029 press release search and date filters`
3. **web-cbar-admin-new** — sxem, modul, i18n, MSW, funksional testlər. Gate: `npm run verify`.
   Commit: `feat(web-cbar-admin-new): 029 press release type field`
4. **web-cbar-new, siyahı** — API funksiyası, fikstür/handler, `news-grid`, filtr, view/loader,
   token, i18n, testlər. Gate: `npm run verify` (+ Node 22).
   Commit: `feat(web-cbar-new): 029 news list in media section`
5. **web-cbar-new, detal** — `splitPressReleaseAssets`, `photo-gallery`, detal view/loader,
   CLAUDE.md. Gate: eyni. Commit: `feat(web-cbar-new): 029 news detail with photo gallery`
6. **Yekun** — `local:testcbar` ilə 3 enlikdə ölçmə → `visual-diff.md`, spec tracker, business-logic
   sync qeydi. Commit: `docs(specs): 029 visual diff`

Toxunulan hər faylda azərbaycanca şərhlər ingiliscəyə çevrilir.

## Complexity Tracking

Yoxdur — konstitusiya pozuntusu yoxdur. Bir yeni client modul (`photo-gallery`) Maddə XI daxilində
əsaslandırılıb (state).
