# Implementation Plan: Müyəssərlik menyusu (ictimai saytda widget + admindən aktiv/deaktiv)

**Branch**: `007-accessibility-widget` | **Date**: 2026-09-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-accessibility-widget/spec.md`

## Summary

Dövlətin rəsmi müyəssərlik widget-inin (`accessibility.cert.gov.az`) **yoxlanılmış surəti** `web-cbar-new`-in öz serverindən verilir. Surətdə yalnız ikon və şrift ünvanları dəyişdirilir (research R1). Widget mövcud `settings` cədvəlindəki `accessibility.widget` açarı ilə idarə olunur:

- admin panel bu açarı keçid ilə yazır;
- `api-cbar` onu dar bir public endpoint ilə oxuyur;
- ictimai sayt açar aktiv olanda layout-da nonce-lu `defer` skript teqi render edir.

Yeni cədvəl, migration, dependency və ya CSP genişlənməsi yoxdur.

| Proyekt | Dəyişiklik | MR | Deploy sırası |
| --- | --- | --- | --- |
| `api-cbar` | `SiteSettingsController`: `GET api/v1/site-settings/accessibility-widget` | 1 | 1 |
| `web-cbar-admin-new` | Ayarlar səhifəsinin yuxarısında keçid kartı | 2 | 2 (asılı deyil) |
| `web-cbar-new` | vendor faylları, ayar API-si, layout-da skript teqi, dil dəyişdiricisi `<a>`, cookie registri, çap CSS-i | 3 | 3 |
| `api-cbar-admin` | **dəyişmir**: mövcud `SettingsController` | — | — |

Sıra pozulsa da heç nə sınmır: endpoint yoxdursa, sayt `false`-a düşür (data-model cədvəli).

## Technical Context

**Language/Version**:
- `api-cbar`: C# / .NET, EF Core;
- frontend-lər: TypeScript strict, React 19;
- `web-cbar-new`: Next.js 16 App Router;
- `web-cbar-admin-new`: Vite + TanStack Router.

**Primary Dependencies**:
- mövcudlar: `@cbar/lib-react-ui-kit` (`Switch`, `Card`), TanStack Query, Zod, axios;
- vendor asset: `acc-widget.min.js` (npm paketi deyil, runtime dependency sayılmır, D-1).

**Storage**: PostgreSQL `settings` cədvəli (mövcud), bir sətir. Ziyarətçi seçimləri widget-in `accw` sessiya cookie-sindədir.

**Testing**:
- Vitest + RTL + MSW (hər iki frontend);
- `api-cbar` üçün avtomatik test yoxdur, test mühitində `curl` ilə (quickstart §3).

**Target Platform**:
- Node standalone server (`web-cbar-new`);
- nginx statik (admin);
- Linux konteyner (`api-cbar`).

**Project Type**: web — bir public API + iki frontend.

**Performance Goals**: widget ilk göstərilməni gecikdirmir (`defer`, 34 KB). Ayar sorğusu 60 s keşlənir.

**Constraints**:
- CSP dəyişmir (nonce + `strict-dynamic`);
- `accessibility.cert.gov.az`-a heç bir brauzer sorğusu getmir;
- root layout client-ə çevrilmir;
- `'use client'` siyahısı genişlənmir.

**Scale/Scope**: 1 ayar, 1 endpoint, 1 admin kartı, 18 route-un hamısında bir teq.

Açıq texniki sual yoxdur. Qalan yeganə empirik risk nonce hidratasiya xəbərdarlığıdır (R2). Onun fallback-i müəyyəndir.

## Constitution Check

*GATE: Phase 0-dan əvvəl yoxlanılıb, Phase 1-dən sonra təkrar yoxlanılıb.*

### Workspace konstitusiyası (`.specify/memory/constitution.md`)

| Maddə | Yoxlama | Nəticə |
| --- | --- | --- |
| I.2–I.3 `product-host` istinadı | Spec-də açıq yazılıb: menyu `product-host`-da yoxdur, yeni funksiyadır | ✅ |
| II.3 Hər proyekt ayrı MR, deploy sırası | Cədvəldə 3 MR və sıra var | ✅ |
| II.4 Yalnız HTTP + DB əlaqəsi | Admin → admin API. Sayt → public API. Paylaşılan fayl yoxdur. | ✅ |
| III.1 Çarpaz çağırış yoxdur | `web-cbar-new` yalnız `api-cbar`, admin yalnız `api-cbar-admin` | ✅ |
| III.2 `api-cbar` read-only | Yalnız `SELECT` (`AsNoTracking`) | ✅ |
| III.3 Public filtr | Yalnız bir açar, yalnız `enabled` sahəsi. Ümumi settings endpoint-i yoxdur. | ✅ |
| III.4 JWT + audit | Mövcud `SettingsController` (`[Authorize]`, `AuditService`) | ✅ |
| IV Portlar və start sırası | Dəyişmir | ✅ |
| V.1–V.2 Domain və migration | `Cbar.Domain` dəyişmir, migration yoxdur | ✅ |
| V.4 Chrome etiketləri iki dildə | Admin mətnləri az/en. Widget öz tərcümələrini daşıyır. | ✅ |
| V.5 UTF-8 | Fayllar yalnız redaktor alətləri ilə yazılır | ✅ |
| VII.3 Public endpoint geriyə uyğundur | Yalnız yeni route əlavə olunur | ✅ |
| VIII Verification | `npm run verify` ×2 + quickstart ssenariləri. `dotnet build` pipeline-da. | ✅ (SDK-sız lokal məhdudiyyət qeyd olunub) |

### `web-cbar-new` konstitusiyası (v2.0.0)

| Maddə | Yoxlama | Nəticə |
| --- | --- | --- |
| II Yeni runtime dependency | npm paketi yoxdur | ✅ |
| IV FSD | `features/accessibility-widget/api` + `widgets/accessibility-widget` + `shell`. `@/server` importu yalnız `features/*/api`-də. | ✅ |
| VI Test | api funksiyası, widget teqi, layout inteqrasiyası, dil dəyişdiricisi, vendor invariantı üçün testlər var | ✅ |
| VIII.6 Cookie registri | `accw` `docs/cookies.md`-yə yazılır (R9) | ✅ |
| **X.4 Üçüncü tərəf runtime script qadağası** | Vendor skript | ⚠️ **D-1** (spec Deviations, research R10) |
| X.1 `innerHTML` | Yalnız vendor kodunda | ⚠️ D-1-ə daxildir |
| X.6 Müdafiə başlıqları zəifləmir | CSP dəyişmir, testlər dəyişmir | ✅ |
| XI.1 `'use client'` minimal | Yeni client komponenti yoxdur. Dil dəyişdiricisi onsuz da client-dir. | ✅ |
| XI.3 Server → client yalnız props | Teq server komponentidir | ✅ |
| XI.5 Hidratasiya xəbərdarlığı | Ölçüldü: xəbərdarlıq yoxdur, D-2 lazım olmadı (R2, T035). | ✅ |

### `web-cbar-admin-new` konstitusiyası

| Maddə | Yoxlama | Nəticə |
| --- | --- | --- |
| II–III Stack və UI kit | Kit `Switch`/`Card`, subpath import, semantik rənglər | ✅ |
| IV FSD | Kart `features/settings` daxilindədir, cross-feature import yoxdur | ✅ |
| VI Test | MSW ilə `settings.test.tsx` genişlənir: yox → deaktiv, toggle → PUT, xəta → geri qayıtma, səhv forma → deaktiv | ✅ |
| VII Error handling | Toast + server vəziyyəti, `AppError` | ✅ |
| X Səlahiyyət | Mövcud modelin səviyyəsində `<Can permission="settings.manage">`. Server tərəfdə rol yoxlaması əvvəldən yoxdur, əhatədən kənardır (R8). | ✅ (məhdudiyyət qeyd olunub) |

**Gate nəticəsi**: keçir. Pozuntular əsaslandırılıb (Complexity Tracking).

## Project Structure

### Documentation (this feature)

```text
specs/007-accessibility-widget/
├── spec.md
├── plan.md              # bu fayl
├── research.md          # R1–R12
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── public-api.md    # api-cbar → web-cbar-new
│   ├── admin-setting.md # web-cbar-admin-new → api-cbar-admin (mövcud)
│   └── widget-embed.md  # skript teqi, vendor faylları, CSP
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
api-cbar/src/Cbar.WebApi/Controllers/
└── SiteSettingsController.cs                  # YENİ: GET api/v1/site-settings/accessibility-widget

web-cbar-admin-new/src/
├── features/settings/
│   ├── model/accessibility-widget.ts          # YENİ: ACCESSIBILITY_WIDGET_KEY, dəyər sxemi, parse
│   ├── components/accessibility-widget-card.tsx # YENİ: Card + Switch, useSettingsList/useSettingSave
│   └── settings.test.tsx                      # genişlənir
├── pages/settings/index.tsx                   # kart cədvəldən yuxarıda
├── shared/testing/fixtures/settings.ts        # (lazım olsa) fixture
└── locales/{az,en}/settings.json              # accessibilityWidget.* açarları

web-cbar-new/
├── public/vendor/accw/
│   ├── acc-widget.min.js                      # yamaqlı surət (R1)
│   ├── accw-icon.png
│   ├── fonts/OpenDyslexic3-Regular.{woff,ttf}, OFL.txt
│   └── VENDOR.md
├── src/features/accessibility-widget/
│   ├── api/accessibility-widget.api.ts        # server-only, cachedJson
│   ├── api/accessibility-widget.api.test.ts
│   └── model/schemas.ts
├── src/widgets/accessibility-widget/
│   ├── accessibility-widget-script.tsx        # server komponenti, <script defer nonce data-accw-*>
│   └── accessibility-widget-script.test.tsx
├── src/app/[locale]/layout.tsx                # Promise.all + nonce → SiteShell prop
├── src/shell/site-shell.tsx                   # teqi render edir
├── src/shell/language-switcher.tsx (+ test)   # Link → <a> (R4)
├── src/shared/testing/handlers/…              # yeni handler + index qeydiyyatı
├── src/app/globals.css                        # @media print gizlətmə
├── docs/cookies.md                            # accw
├── CLAUDE.md                                  # vendor istisnası, D-1 qeydi
└── (lazım olsa) .prettierignore, eslint ignores, check-self-contained istisnası (R11)
```

**Structure Decision**: mövcud üç proyektin öz strukturu saxlanılır. Feature spec 006 nümunəsini izləyir: layout-da server tərəfdə oxuma, shell-də render, admin-də mövcud feature-in genişlənməsi.

## Design notes

```
app/[locale]/layout.tsx (server)
  ├─ headers().get(NONCE_HEADER) → nonce
  └─ Promise.all([... , getAccessibilityWidget().catch(() => ({ enabled: false }))])
       └─ SiteShell (server)
            ├─ … header / main / footer / LiveStreamDialog
            └─ enabled && <AccessibilityWidgetScript nonce locale />   (server, teq)
                    └─ <script src="/vendor/accw/acc-widget.min.js" defer nonce data-accw-*>
```

- **Widget init bir dəfədir.** App Router naviqasiyasında layout remount olmur. Widget konteyneri `body`-dədir, React ağacından kənardır.
- **Dil dəyişikliyi tam yüklənmədir** (R4), ona görə `data-accw-lang` hər zaman aktualdır.
- **Admin kartı optimistik deyil.** Keçidin vəziyyəti həmişə son server cavabıdır. Sorğu gedərkən `disabled`-dir.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| web-cbar-new X.4: üçüncü tərəf runtime script (D-1) | Dövlət saytları üçün WCAG 2.1 tələbi. Widget rəsmi dövlət alətidir və istifadəçinin açıq tələbidir. | Özümüz menyu yazmaq ayrıca, böyük feature-dir və rəsmi widget-lə uyğunluğu itirir. Rəsmi hostdan birbaşa yükləmək (Q2-A rədd) CSP-ni genişləndirir və nəzarətsiz kod gətirir. |
| X.1: vendor kodunda `innerHTML` | Widget-in öz DOM qurması, statik şablonlardır | Vendor kodu yenidən yazmaq surəti "rəsmi kod" olmaqdan çıxarır (R1) |
| ~~(şərti) XI.5: nonce hidratasiya xəbərdarlığı~~ — **lazım olmadı** (T035: React `node.nonce` xassəsini müqayisə edir, R2) | Brauzer `nonce` dəyərini DOM-dan gizlədir | `next/script` widget-in `readystatechange` init-ini qaçırır (R2) |
