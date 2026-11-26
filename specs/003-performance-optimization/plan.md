# Implementation Plan: `web-cbar-new` public saytının performans optimizasiyası

**Branch**: `003-performance-optimization` | **Date**: 2026-09-22 | **Spec**: [spec.md](./spec.md)

## Summary

Səkkiz fazaya bölünmüş, hər biri müstəqil shippable və verification ilə bitən iş.
Dörd texniki qərar planın onurğasıdır:

1. **Media same-origin proxy** — `src/app/media/[id]/route.ts` `{API_URL}/media/{id}`-dən
   stream edir. Bu, `next/image`-i heç bir `remotePatterns` konfiqurasiyası olmadan
   mümkün edir (build-time/runtime env ziddiyyəti aradan qalxır), CSP-yə toxunmur
   (`img-src 'self'` onsuz da var) və brauzer→API birbaşa əlaqəsini kəsir.
2. **`app-error.ts` bölgüsü** — zod-dan asılı parse funksiyaları `server-only` fayla
   köçür, `AppError` class-ı təmiz qalır. TanStack Query yığında qalır.
3. **ECharts leaf import** — `echarts/lib/chart/line` tipli modullar özləri
   `use(install)` çağırır, ona görə `core.use([...])` bloku silinir.
4. **`unstable_cache` sarğısı** — `src/server/cached.ts`-də bir yerdə; feature `api/`
   qatları onu işlədir, route-lardan `force-dynamic` silinir.

## Technical Context

**Dil/Versiya**: TypeScript 5.9 (strict), C# / .NET (api-cbar)
**Framework**: Next.js 16.3.4 (App Router, Turbopack, `output: 'standalone'`), React 19.2
**Qrafik**: `echarts@6.1.0` — exports map-ında 113 açar, `./lib/chart/*` və
`./lib/component/*` yolları mövcuddur (yoxlandı)
**Şəkil**: `next/image` default loader; `sharp` + `@img` artıq standalone çıxışa trace
olunur (yoxlandı)
**Keş**: `unstable_cache` (`next/cache`) — layihə `cacheComponents` flag-ını işlətmir,
ona görə `use cache` deyil, `unstable_cache` (mənbə:
`node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`)
**Test**: Vitest + RTL + MSW; `npm run verify` = setup:check → check:self-contained →
lint → typecheck → test → build
**Hədəf**: Node 22, Docker standalone image, port 3001

## Constitution Check

`web-cbar-new/.specify/memory/constitution.md` v2.0.0 üzrə:

| Maddə | Status | Qeyd |
| --- | --- | --- |
| I — Dil qaydaları | ✅ | Bütün şərhlər və sənədlər Azərbaycan dilində |
| II — Texnologiya yığını (kilidli) | ✅ | **Yeni runtime dependency yoxdur.** TanStack Query, zod, axios, RHF — hamısı qalır. `next/image` framework-ün öz hissəsidir |
| III — UI Kit müqaviləsi | ✅ | Kit komponentlərinə toxunulmur; `globals.css` route B bloku toxunulmur |
| IV — Arxitektura (FSD) | ✅ | Yeni `src/server/cached.ts` mövcud `src/server/` qatına düşür; `src/app/media/[id]/route.ts` Next routing qatıdır və nazikdir |
| V — State ayrımı | ✅ | Server state TanStack Query qalır (silinmir); yalnız import zənciri təmizlənir |
| VI — Test və verification | ✅ | Hər faza `npm run verify` ilə bitir; dəyişən test mock-ları yenilənir |
| VII — Error handling | ✅ | Xəta axını dəyişmir (Maddə VII.2); blok-səviyyə `ErrorState`-lər qorunur; `loading.tsx` query vəziyyətlərini əvəz etmir, tamamlayır (VII.4) |
| VIII — Konfiqurasiya | ✅ | `API_URL` runtime env olaraq qalır — D1-in əsas səbəbi budur |
| IX — Spec-driven proses | ✅ | Bu sənəd o prosesin özüdür |
| X — Təhlükəsizlik | ⚠️ | Media proxy yeni giriş nöqtəsidir → FR-007 (yalnız rəqəmli id) SSRF qapısını bağlayır. CSP dəyişmir. Xəta mesajı istifadəçiyə çatmır (VII.3) |
| XI — Server/Client sərhədi | ✅ | D2 məhz bu sərhədi **bərpa edir**: zod server tərəfdə qalır |

Kənarlaşmalar D1–D4 spec.md-də qeydə alınıb.

## Project Structure

### Documentation (this feature)

```
specs/003-performance-optimization/
├── spec.md        # NƏ / NİYƏ
├── plan.md        # bu sənəd — NECƏ
└── tasks.md       # fazalara bölünmüş icra siyahısı
```

Root-da `OPTIMIZASIYA-PLANI.md` — gündəlik tracker; ölçmə nəticələri ora yazılır.

### Source Code

**MR #1 — `api-cbar`** (Faza 1)

```
api-cbar/src/Cbar.WebApi/
├── Controllers/MediaController.cs   # ETag, Cache-Control, 304, Content-Length
└── Program.cs                       # AddResponseCompression + UseResponseCompression
```

**MR #2 — `web-cbar-new`** (Faza 2–8)

```
web-cbar-new/
├── next.config.ts                        # images bloku (formats)
├── public/site/                          # SVGO loqolar; ölü PNG-lər silinir
└── src/
    ├── app/
    │   ├── media/[id]/route.ts            # YENİ — media proxy (Faza 5a)
    │   └── [locale]/loading.tsx           # YENİ — streaming (Faza 7)
    ├── proxy.ts                           # matcher-ə `media` istisnası (Faza 5a)
    ├── server/
    │   ├── api-client.ts                  # import hədəfi dəyişir (Faza 3)
    │   └── cached.ts                      # YENİ — unstable_cache sarğısı (Faza 6)
    ├── shared/
    │   ├── api/app-error.ts               # zod-suz qalır (Faza 3)
    │   ├── api/app-error-parse.ts         # YENİ — server-only, zod-lu (Faza 3)
    │   └── lib/cms-html.ts                # rewriteMediaUrls → lazy inject (Faza 5b)
    ├── entities/content/lib/media-url.ts  # relativ yol qaytarır (Faza 5b)
    ├── features/*/api/*.api.ts            # cached() sarğısı (Faza 6)
    ├── providers/query-client.ts          # zod-suz import (Faza 3)
    ├── widgets/chart-card/chart.tsx       # ECharts leaf import (Faza 4)
    └── views/**, widgets/**               # <img> → <Image> (Faza 5c)
```

## Faza sırası və asılılıqlar

```
Faza 0 (sənədlər)
   │
   ├──► Faza 1 (api-cbar)          ── müstəqil, MR #1
   │
   └──► Faza 2 (asset təmizliyi)   ── müstəqil
        Faza 3 (zod bölgüsü)       ── müstəqil
        Faza 4 (ECharts)           ── müstəqil
             │
             ▼
        Faza 5 (media proxy + next/image)   ── Faza 1-dən faydalanır, asılı deyil
             │
             ▼
        Faza 6 (keşləmə)
             │
             ▼
        Faza 7 (streaming)
             │
             ▼
        Faza 8 (i18n, opsional)
```

Faza 2, 3, 4 bir-birindən asılı deyil və istənilən sırada edilə bilər. Faza 5 böyükdür
və üç alt-hissəyə bölünüb (5a proxy, 5b URL, 5c komponentlər) ki, yarımçıq qalanda
aydın nöqtədə dayanmaq mümkün olsun.

## Əsas texniki qərarlar

### 1. Niyə media proxy, niyə `remotePatterns` deyil

`images.remotePatterns` build zamanı `.next/required-server-files.json`-a serialize
olunur (bu checkout-da yoxlandı). `API_URL` isə **runtime** env-dir — root `CLAUDE.md`
bunu açıq şəkildə tələb edir: "one image promotes between environments". İkisi bir
araya gəlmir: ya hər mühit üçün ayrı image, ya `hostname: '**'` (açıq image proxy,
təhlükəsizlik riski).

Same-origin route handler hər üç problemi birdən həll edir:
- `next/image` default `localPatterns` (`pathname: "**"`) ilə konfiqurasiyasız işləyir
- CSP-də `img-src 'self'` onsuz da var → dəyişiklik yoxdur
- FR-006 bərpa olunur: brauzer `api-cbar` origin-ini heç vaxt görmür

### 2. `src/proxy.ts` matcher tələsi

Mövcud matcher: `['/((?!_next|api|.*\\..*).*)']`. `/media/12` uzantısız olduğu üçün
bu matcher-ə **düşür**; `localeFromPathname` null qaytarır, `LOCALE_LIKE` regex-i
`media` sözünü tutmur (5 hərf) → proxy onu `/az/media/12`-yə redirect edər və route
handler heç vaxt çağırılmaz. Matcher-ə `media` istisnası **məcburidir**:
`['/((?!_next|api|media|.*\\..*).*)']`.

### 3. ECharts leaf modullarının self-registration-ı

`echarts/lib/component/grid.js` faylının son sətri:

```js
import { use } from '../extension.js';
import { install } from './grid/install.js';
use(install);
```

Yəni leaf modul özünü qeydiyyatdan keçirir və `core.use([...])` çağırışı artıq
lazım deyil. `import()` yalnız yan təsir üçündür; qaytardığı namespace işlədilmir.
`echarts/core` eyni `lib/extension.js` registry-sindən istifadə edir, ona görə
`core.init()` qeydiyyatdan keçmiş modulları görür.

### 4. `app-error.ts` bölgüsünün sərhədi

| Qalır (`app-error.ts`, zod-suz) | Köçür (`app-error-parse.ts`, `server-only`) |
| --- | --- |
| `AppErrorKind` tipi | `apiErrorPayloadSchema` |
| `FALLBACK_MESSAGE` | `ApiErrorPayload` tipi |
| `AppError` class-ı | `schemaMismatch` |
| `kindFromStatus` | `normalizeApiError` |
| | `parseOrThrow` |

İstehlakçılar: `src/server/api-client.ts` → `app-error-parse` (+ `AppError` tipi üçün
`app-error`); `src/providers/query-client.ts` → yalnız `app-error`;
`src/shared/ui/error-state.tsx` → onsuz da `import type` işlədir, dəyişmir.

## Complexity Tracking

| Əlavə olunan mürəkkəblik | Niyə lazımdır | Nəyə alternativ idi |
| --- | --- | --- |
| Media proxy route (yeni şəbəkə hop-u) | `next/image` + runtime `API_URL` ziddiyyəti; FR-006 | `remotePatterns` + hər mühit üçün ayrı image, ya da açıq image proxy |
| İkinci xəta faylı (`app-error-parse.ts`) | zod-u client bundle-dan çıxarmaq | `query-client.ts`-də `AppErrorKind` string-lərini əl ilə təkrarlamaq (kövrək) |
| `cached()` sarğısı | 9 feature `api/` qatında `unstable_cache` çağırışını təkrarlamamaq | Hər modulda ayrıca `unstable_cache` |

## Risklər

| Risk | Azaltma |
| --- | --- |
| SVGO loqonu vizual pozar | Faza 2-də hər iki dil × hər iki tema gözlə yoxlanılır; git-dən geri qaytarmaq asandır |
| ECharts leaf import bir qrafiki qırar | Faza 4 verification-ı hər üç qrafiki + tema keçidini əhatə edir |
| `next/image` `object-contain` düzümlərini pozar | Faza 5c cədvəlində hər fayl ayrıca keçilir; `fill` yalnız konteyner ölçüsü məlum olanda |
| 60 s keş redaktoru narahat edər | SC-010 ölçülür; lazım gələrsə `revalidateTag` + webhook ayrı specdə |
| Media proxy `api-cbar` yükünü Next serverinə köçürər | `next/image` optimizer nəticəni özü keşləyir (`minimumCacheTTL`), upstream-ə yalnız cache miss-də gedir |
