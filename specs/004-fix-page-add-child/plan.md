# Implementation Plan: Səhifə ağacında alt səhifə əlavə edəndə yaranan xətanın düzəldilməsi

**Branch**: `004-fix-page-add-child` | **Date**: 2026-09-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-fix-page-add-child/spec.md`

## Summary

Deploy olunmuş admin panelində "Haqqımızda" sətrinin **+** düyməsi bəzən "Nəsə
səhv getdi" ekranı açır. Ölçmə nəticəsi (research R1): xəta **məlumatda deyil**.
Eyni test API ilə lokal panel və mock API ilə tam aplikasiya xətasız işləyir.
Xəta yalnız deploy olunmuş build-də çıxır və təkrar cəhddə keçir. **+**
düyməsinin yeni yüklədiyi yeganə kod faylı mətn redaktorunun `React.lazy`
chunk-ıdır. Route chunk-ları TanStack `lazyRouteComponent` ilə yüklənir və fayl
tapılmayanda səhifəni bir dəfə özü yeniləyir; redaktorun `React.lazy`-sində isə
bu mexanizm yoxdur. `test` branch-i hər commit-də avtomatik deploy olunur
(2026-09-20-dən bəri 8 commit). Hər deploy köhnə hash-li chunk-ları silir və
açıq qalmış tab onları tapmayanda xəta ekranına düşür. `index.html` də no-cache
başlığı olmadan verilir.

Düzəliş yalnız `web-cbar-admin-new` repo-sundadır (**bir MR**):

1. **Chunk yükləmə möhkəmliyi**: Vite `vite:preloadError` hadisəsi və redaktorun
   lazy import-u → bir dəfəlik `location.reload()` (sessionStorage qoruyucusu ilə, dövrəsiz).
2. **nginx**: `index.html` üçün `Cache-Control: no-cache`, beləliklə yenilənmə
   həmişə yeni build-i gətirir.
3. **Diaqnostika**: router xəta ekranı xətanı log-a ötürür; `logger.error`
   production-da da konsola yazır (token/şəxsi məlumatsız). Səbəb bir daha
   gizli qalmır.
4. **Menyu görünürlüyü paneli** (US4): səhifə formunda hər dil üçün
   "ictimai menyuda görünəcək / görünməyəcək — səbəb" göstəricisi. Qaydalar
   `api-cbar` `GET /pages/tree` filtrinin və `web-cbar-new` `nav.ts`-in birəbir
   əksidir ([contracts/menu-visibility.md](./contracts/menu-visibility.md)).
   `web-cbar-new` və `api-cbar`-da dəyişiklik **yoxdur**.

## Technical Context

**Language/Version**: TypeScript 5.x strict, React 19.2
**Primary Dependencies**: Vite 8.2, TanStack Router 1.170 (`lazyRouteComponent` reload-on-missing-module daxildir), TanStack Query, RHF + Zod, TipTap 3.31 (lazy chunk ~485 kB), `@cbar/lib-react-ui-kit`
**Storage**: N/A (yalnız `sessionStorage`-da reload qoruyucu açarı; sensitive data yoxdur)
**Testing**: Vitest + RTL + MSW (`npm run verify`); deploy ssenarisi əl ilə test mühitində (quickstart)
**Target Platform**: Brauzer; nginx statik (Docker, `default.conf`), `BUILD_ENV` ilə build-time API URL
**Project Type**: SPA (admin paneli)
**Performance Goals**: Yeni asılılıq və bundle artımı yoxdur (bir neçə sətir)
**Constraints**: Reload yalnız bir dəfə (sonsuz dövrə qadağandır); raw xəta istifadəçiyə göstərilmir (Maddə VII.3); menyu qaydaları `api-cbar` ilə sinxron qalır
**Scale/Scope**: 4 fayl dəyişir + 2 yeni kiçik modul + testlər; `default.conf`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Workspace konstitusiyası v1.0.0 (root) və panel konstitusiyası v1.3.0 (`web-cbar-admin-new/.specify/memory/constitution.md`):

| Maddə | Status | Qeyd |
| --- | --- | --- |
| Root I — `product-host` referansdır | ✅ | Yii2 admin-in səhifə ağacı (`admin/controllers` səhifə CRUD, alt səhifə əlavə) funksiyası bərpa olunur; yeni funksiya itmir |
| Root II — Müstəqil proyektlər | ✅ | Yalnız `web-cbar-admin-new` dəyişir → bir MR. `web-cbar-new`/`api-cbar` yalnız oxunur |
| Root III — Admin/client ayrılığı | ✅ | Panel `api-cbar`-ı çağırmır; menyu qaydaları **kod paylaşmadan**, sənədləşdirilmiş kontrakt kimi təkrarlanır |
| Root IV — Start/port | ✅ | Dəyişmir |
| Root V — Sxem/migration | ✅ | Sxem dəyişikliyi yoxdur |
| Root VII — Xarici kontraktlar | ✅ | `.gitlab-ci.yml`/`.ci-cd` toxunulmur; `default.conf` yalnız cache başlığı alır |
| Root VIII / Panel VI — Verification | ✅ | `npm run verify` + test mühitində iki deploy ilə əl ssenarisi (quickstart) |
| Panel II — Stack kilidli | ✅ | Yeni dependency yoxdur |
| Panel IV — FSD | ✅ | Chunk qoruyucusu `shared/lib`; bootstrap qoşulması `app`; görünürlük qaydası `features/pages/model` |
| Panel VII — Error handling | ✅ | Global boundary render xətaları üçün qalır; log genişlənir, amma raw mesaj ekrana çıxmır (VII.3), token log-a düşmür (VII.5) |
| Panel X.3 — Sensitive data | ✅ | `sessionStorage`-da yalnız reload qoruyucu (timestamp); şəxsi məlumat yoxdur |

Pozuntu yoxdur, Complexity Tracking boşdur. **Post-design re-check**: dəyişməyib ✅.

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-page-add-child/
├── plan.md              # Bu fayl
├── research.md          # Faza 0: kök səbəb ölçmələri və qərarlar
├── data-model.md        # Faza 1: menyu görünürlüyü modeli
├── quickstart.md        # Faza 1: yoxlama ssenariləri
├── contracts/
│   └── menu-visibility.md  # api-cbar filtri + web-cbar-new nav qaydaları (istehlak kontraktı)
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (`web-cbar-admin-new/`)

```text
default.conf                                   # + index.html üçün Cache-Control: no-cache
src/main.tsx                                   # + installChunkReloadGuard() bootstrap-da
src/shared/lib/chunk-reload.ts                 # YENİ: isChunkLoadError, reloadOnce, installChunkReloadGuard
src/shared/lib/chunk-reload.test.ts            # YENİ
src/shared/lib/logger.ts                       # error() production-da da console.error
src/app/providers/error-boundary.tsx           # RouterErrorFallback xətanı logger-ə ötürür; chunk xətasında reloadOnce
src/features/rich-text/index.ts                # lazy import → chunk xətasında reloadOnce
src/features/pages/model/menu-visibility.ts    # YENİ: menuVisibility(values, depth) → hər dil üçün {visible, reasons}
src/features/pages/model/menu-visibility.test.ts  # YENİ
src/features/pages/components/page-form.tsx    # + görünürlük paneli (useWatch), valideyn dərinliyi ağacdan
src/features/pages/pages.test.tsx              # + ssenarilər (görünürlük paneli, + düyməsi real route ağacında)
src/locales/{az,en}/pages.json                 # + menuVisibility.* açarları
```

**Structure Decision**: Tək proyekt (`web-cbar-admin-new`), mövcud FSD qatları.
`web-cbar-new`, `api-cbar`, `api-cbar-admin` toxunulmur.

## Deploy sırası

Yalnız bir komponent: `web-cbar-admin-new` MR → `test` (avtomatik deploy) → test
mühitində quickstart §2–§3 → `master`. API və ictimai sayt deploy-u tələb olunmur.

## Complexity Tracking

Pozuntu yoxdur.
