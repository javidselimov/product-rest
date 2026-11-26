# Implementation Plan: Media → Tədbirlər

**Branch**: `main` (istifadəçi qərarı) | **Date**: 2026-11-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/034-media-events/spec.md`

## Summary

Tədbirlər CMS səhifə ağacından ayrıca məzmun növünə çevrilir. `api-cbar-admin` yeni cədvəllərə sahib olur, panel onları idarə edir,
`api-cbar` süzülmüş oxuma verir, sayt Figma-dakı siyahı və detalı göstərir, ana səhifə Təqvimi mock-dan çıxır.
Köhnə 6 tədbir ilkin tarixlə avtomatik yaranır və CMS səhifələrinə bağlı qalır; 18 səhifə olduğu kimi qalır.

Plan mərhələsinin iki nəticəsi ilkin planı dəyişdi (`research.md` R3, R4): səhifələr gizlədilmir, çünki API gizli valideynin uşaqlarını
kök kimi qaytarır, və menyu keçidi üçün redaktor addımı lazım deyil.

## Technical Context

**Language/Version**: C# / .NET 10; TypeScript strict, Next.js 16 + React 19; React 19 + Vite

**Primary Dependencies**: EF Core + Npgsql, `@cbar/lib-react-ui-kit`, Tailwind 4, TanStack Router/Query, RHF + Zod, react-i18next. **Yeni dependency yoxdur.**

**Storage**: PostgreSQL, yeni 4 cədvəl (`data-model.md`); yeni fayl saxlanması yoxdur

**Testing**: Vitest + RTL + MSW (iki frontend); API-lərdə test layihəsi yoxdur: `dotnet build` + endpoint icrası

**Target Platform**: GitLab pipeline, K8s; sayt Node standalone, panel nginx

**Project Type**: Dörd müstəqil web komponenti

**Performance Goals**: Mövcud bölmələrlə eyni: sorğu hər səhifə açılışında, keşsiz; siyahı bir API çağırışı + ağac + bölmələr

**Constraints**: `cbar_web_ro` yalnız SELECT; mövcud cədvəllərə `ALTER` yoxdur; filtrlər JS-siz; magic number yoxdur (spec 032)

**Scale/Scope**: İldə onlarla tədbir; 6 köhnə tədbir; 4 komponent, 2 miqrasiya, ~9 endpoint

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Maddə | Status | Qeyd |
|---|---|---|
| I `product-host` referansdır | ✅ | Paritet cədvəli spec başlığında; heç nə ləğv olunmur, köhnə səhifələr qalır |
| II Dörd proyekt | ✅ | Dörd MR, tasks ayrı bölmələrdə |
| III Admin/client ayrılığı | ⚠️ | III.3 `PublishedAt` embargo-su tətbiq olunmur, aşağıda əsaslandırılır. Qalan filtrlər var; audit var |
| IV Start/deploy sırası | ✅ | `api-cbar-admin` → `api-cbar` → panel → sayt |
| V Sxem | ✅ | Domain bayt-bayt eyni; `0018`, `0019` unikal (`api-cbar`-da miqrasiya yoxdur); az/en tərcümə cədvəlləri; UTF-8 alətlər |
| VI Admin template | ✅ | CRUD mühərriki genişlənir, Rich text extension-ı dəyişmir, roundtrip lazım deyil |
| VII Xarici kontraktlar | ✅ | Yalnız yeni route-lar; XML feed-ə toxunulmur; köhnə URL-lər açıq qalır |
| VIII Real verification | ⚠️ | Stack bu maşında qalxmır (Docker), canlı icra test deploy-undan sonradır, aşağıda |

Post-design: nəticə eynidir, yeni pozuntu yoxdur.

## Project Structure

### Documentation (this feature)

```text
specs/034-media-events/
├── spec.md, plan.md, research.md, data-model.md, quickstart.md
├── contracts/ (public-api.md, admin-api.md, ui-contract.md)
├── checklists/requirements.md
└── tasks.md            # /speckit-tasks yaradır
```

### Source Code

```text
product-rest/
├── api-cbar-admin/
│   ├── db/migrations/0018-events.sql, 0019-events-legacy-seed.sql
│   ├── openapi/paths/events.yaml (+ openapi.yaml, components)
│   └── src/
│       ├── Cbar.Domain/Entities/Event.cs, CbarDbContext.cs
│       └── Cbar.AdminApi/ Authorization/Permissions.cs, Controllers/{Events,EventCategories}Controller.cs
├── api-cbar/
│   ├── openapi/paths/events.yaml
│   └── src/ Cbar.Domain (eyni), Cbar.WebApi/Controllers/EventsController.cs, SearchController.cs
├── web-cbar-admin-new/src/
│   ├── shared/crud/ (time, searchable), features/crud/components/field-control.tsx
│   ├── features/events/, pages/events/ (`LookupGate`, laws nümunəsi)
│   └── app/routes/{index,nav}.ts, locales/{az,en}/, shared/testing/handlers/
└── web-cbar-new/src/
    ├── app/[locale]/(content)/media/events/{page.tsx,[slug]/page.tsx}
    ├── features/events/{api,model}/, views/{media-events,media-event}/
    ├── shell/nav.ts, widgets/section-shell/model.ts
    ├── views/home/{mock,loader}.ts, widgets/home-cards/event-calendar.tsx
    └── locales/{az,en}/media.json, shared/testing/{fixtures,handlers}/
```

Sənədlər: `dokumentasiyalar/tedbirler-guide.md`, `web-cbar-new/docs/media-cms-guide.md`, `CLAUDE.md`-lər, `business_logic/`.

**Structure Decision**: Mövcud komponent strukturu saxlanılır, yeni proyekt yoxdur. Tədbirlər press-reliz və qalereya modullarının
qurulduğu yerlərdə yaşayır.

## İş paketləri (deploy sırası ilə)

1. **`api-cbar-admin`**: OpenAPI → miqrasiyalar → Domain → icazələr → iki controller.
2. **`api-cbar`**: Domain surəti → OpenAPI → `EventsController` → `SearchController`.
3. **`web-cbar-admin-new`**: `time` və axtarışlı `select` → Bölmələr → Tədbirlər.
4. **`web-cbar-new`**: `features/events` → menyu → siyahı → detal → Təqvim.
5. **Sənədlər və redaktor işi**: təlimat, business-logic və OpenAPI sync, təxmini tarixlərin yoxlanması, bölmələr.

## Riskler

- **Prod slug-ları ölçülməyib**: `0019` səhifəni tapmasa tədbir yaranmır. Menyu alt ağacı gizli olduğu üçün o səhifə naviqasiyadan görünməz olar.
  Azaldılması: quickstart Q6, redaktor paneldən əlavə edir.
- **Təqvim boşalır**: deploy-dan sonra gələcək tədbir yoxdursa blok görünmür. Bu, mock tarixlərindən yaxşıdır, amma redaktor
  dekabr qərar tarixini daxil etməlidir.
- **Təxmini tarixlər** dərc olunmuş görünür: Heydər Əliyev 100 il, AMB 20 il. Redaktor yoxlaması deploy-dan sonrakı addımdır.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| III.3: tədbirdə `PublishedAt` embargo-su yoxdur | Gələcək tədbir görünməlidir, bu funksiyanın əsasıdır. Dərc nəzarəti `Status` ilədir | `PublishedAt` sahəsi əlavə etmək: `Status`-u təkrarlayır, redaktora dəyəri olmayan ikinci tarix verir |
| VIII.1: stack lokal Docker ilə qalxmır | Docker bu maşında işləmir | API-lər PGlite (WASM Postgres) üzərində işlədildi: 0001–0019, admin və public endpoint-lər, Edge-də sayt. Qalan canlı icra test mühitindədir (quickstart Q4–Q6) |
