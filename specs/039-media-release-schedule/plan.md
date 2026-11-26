# Implementation Plan: Məlumatların yayımlanması qrafiki — admin paneldən idarə olunan məzmun növü

**Branch**: `main` (ayrıca branch açılmır, 034/038 kimi) | **Date**: 2026-11-11 | **Spec**: [spec.md](spec.md)

**Input**: `specs/039-media-release-schedule/spec.md`, istifadəçi qərarları 2026-11-11 (9 + 3)

## Summary

Səhifə 130-dakı əl cədvəli admin paneldə ayrıca məzmun növü olur: qruplar, dövrilik lüğəti və sətirlər (CSR/038 nümunəsi). Saytda `/{locale}/media/release-schedule` Media şablonunda başlıq və giriş mətnini CMS səhifəsindən, cədvəli yeni public endpoint-dən alır; axtarış serverdə `?q=` ilə işləyir. "Qrafikə uyğun ↗" pul siyasəti qərarlarının qrafikini modalda açır; tarixlər yeni cədvəldən yox, Tədbirlərdən ("Qərar" növü, spec 034) gəlir və eyni endpoint onları hazır verir. Köhnə cədvəl miqrasiya ilə köçür, köhnə ünvanlar yeni route-a 308 ilə yönləndirilir.

## Technical Context

**Language/Version**: C# / .NET 10; TypeScript strict, React 19, Next.js 16, Vite

**Primary Dependencies**: EF Core + Npgsql; `@cbar/lib-react-ui-kit` (Dialog, Button, input), TanStack Router + Query, RHF + Zod; Next App Router

**Storage**: PostgreSQL — 6 yeni cədvəl; mövcud `events` yalnız oxunur

**Testing**: API-lərdə test yoxdur (`dotnet build` + PGlite ilə real SQL + əl ilə); frontendlərdə Vitest + MSW, `npm run verify`

**Target Platform**: Linux konteynerlər, CBAR GitLab pipeline

**Project Type**: Web, 4 müstəqil komponent

**Performance Goals**: Səhifə bir API sorğusu ilə (+ ağac + CMS səhifəsi) qurulur; admindəki dəyişiklik saytda 1 dəqiqədən az (`cachedJson` 10 s)

**Constraints**: Mövcud cədvəllərə `ALTER TABLE` yoxdur; `Cbar.Domain` bayt-bayt eyni; miqrasiya adları unikal; brauzer API çağırmır; endpoint-lər spec-first; magic number yoxdur (spec 032); `dangerouslySetInnerHTML` yalnız `widgets/cms-content`

**Scale/Scope**: 2–5 qrup, ~10 dövrilik, 20–40 sətir, ildə ~8 qərar tarixi, 2 dil

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Maddə | Yoxlama | Nəticə |
|---|---|---|
| I | Əvəz edilən Yii2 hissəsi: xüsusi controller yoxdur, səhifə 72 adi `pages/index`-dir. Səhifə 60 dəyişmir. Səssiz itki yoxdur: məzmun köçür, ünvan yönləndirilir | Keçir |
| II | Dörd komponent = dörd MR, sıra aşağıdadır, paylaşılan kod yoxdur | Keçir |
| III | Yazan yalnız `api-cbar-admin`; public filtr tam (status, `deleted_at`, `show_*`, aktivlik); JWT + icazə + audit; frontendlər yalnız öz cütlərini çağırır | Keçir |
| IV | Portlar və start sırası dəyişmir | Keçir |
| V | `Cbar.Domain` hər iki nüsxədə; `0022`, `0023`, `BEGIN` yox, `IF NOT EXISTS`; `_translations` cədvəlləri; slug yoxdur, çünki sətrin ünvanı yoxdur | Keçir |
| VI | Admin kit + FSD + `ModuleConfig`; TipTap dəyişmir | Keçir |
| VII | Yeni route-lar; mövcud endpoint-lər dəyişmir; `page-72/*` və səhifə 130-un slug ünvanları 308 xəritəsindədir (`contracts/ui-contract.md` §Ünvanlar) | Keçir |
| VIII | Build + PGlite ilə real SQL + `quickstart.md`, iki API birlikdə. VIII.1-in "`dev.ps1` ilə stack" addımı əvəzlənir — Complexity Tracking | Keçir (sapma ilə) |

Faza 1-dən sonra yenidən yoxlandı: dəyişiklik yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/039-media-release-schedule/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-api.md
│   ├── public-api.md
│   └── ui-contract.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/
├── db/migrations/0022-release-schedule.sql, 0023-release-schedule-seed.sql
├── openapi/paths/release-schedule.yaml, components/schemas/release-schedule.yaml, openapi.yaml
└── src/
    ├── Cbar.Domain/Entities/ReleaseSchedule.cs, CbarDbContext.cs
    └── Cbar.AdminApi/
        ├── Authorization/Permissions.cs
        └── Controllers/ReleaseScheduleItemsController.cs, ReleaseScheduleGroupsController.cs,
                        ReleaseSchedulePeriodicitiesController.cs

product-rest/api-cbar/
├── openapi/paths/release-schedule.yaml, components/schemas/release-schedule.yaml, openapi.yaml
└── src/
    ├── Cbar.Domain/            # eyni
    └── Cbar.WebApi/Controllers/ReleaseScheduleController.cs

product-rest/web-cbar-admin-new/src/
├── features/release-schedule/  # api/keys, model/{schemas,module,constants}.ts, release-schedule.test.tsx
├── pages/release-schedule/index.tsx
├── app/routes/index.ts, nav.ts
├── locales/{az,en}/releaseSchedule.json, nav.json
├── shared/i18n/index.ts
└── shared/testing/{fixtures,handlers}/release-schedule.ts, handlers/index.ts

product-rest/web-cbar-new/src/
├── app/[locale]/(content)/media/release-schedule/{page,loading}.tsx
├── views/media-release-schedule/{index,loader,constants,skeleton}.tsx|ts, index.test.tsx
├── features/release-schedule/{api/release-schedule.api.ts, model/{schemas,search,intro,decisions,year-suffix,constants}.ts}
├── widgets/release-schedule-table/   # cədvəl + mobil kart (server)
├── widgets/decisions-dialog/         # 'use client' modal + noscript fallback
├── widgets/list-filter/list-filter.tsx   # `dates` prop
├── entities/page-node/lib/tree.ts, shell/nav.ts, proxy.ts
├── locales/{az,en}/media.json
└── shared/testing/{fixtures,handlers}/release-schedule.ts, app/metadata.test.ts
```

**Structure Decision**: Mövcud dörd komponent, yeni layihə yoxdur.

## Deploy sırası

Hamısı bir yayımda, startup sırası ilə: `api-cbar-admin` (`0022`, `0023`, CRUD) → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`.

Ara vəziyyətlər: `web-cbar-new` yayımlanmayana qədər səhifə 130 köhnə görünüşündə qalır (CMS mətni dəyişmir). Sayt yayımlanıb, `api-cbar` köhnədirsə və ya `0023` hələ işləməyibsə, sətir gəlmir: səhifə başlıq və CMS səhifəsinin bütün mətni (köhnə əl cədvəli daxil) ilə açılır, axtarış və yeni cədvəl göstərilmir (FR-012, FR-018). Sətirlər gələn kimi yeni cədvələ keçir; heç bir ara vəziyyətdə məzmun itmir.

Yayımdan sonra redaktor işi (`web-cbar-new/docs/media-cms-guide.md`): səhifə 130-u Media altına keçirmək və giriş mətnini Figma-dakı cümlə ilə yeniləmək; Tədbirlərdə cari ilin "Qərar" tarixlərini yoxlamaq.

## Complexity Tracking

| Sapma | Niyə lazımdır | Sadə alternativ niyə rədd edilib |
|---|---|---|
| Maddə VIII.1: stack `dev.ps1` ilə qaldırılmır, API-lər PGlite üzərində real SQL ilə yoxlanır | `dev.ps1`/`dev.sh` köhnəlib (root `CLAUDE.md`: komponentləri kökdə və silinmiş seed fayllarını gözləyir), bu maşında Docker işləmir | `dev.ps1`-i bu spec-də yeniləmək əhatədən kənardır və Docker olmadan yenə işləməz. Əvəzində: `dotnet build` + PGlite-da bütün miqrasiyalar və endpoint-lər (`quickstart.md` §1–3), `cbar_web_ro` ilə read-only yoxlaması, frontendlərdə `npm run verify`, test mühitində əl ilə yoxlama (T055, T056) |
