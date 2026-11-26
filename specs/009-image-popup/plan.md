# Implementation Plan: Şəkilli popup (admin bölməsi + ictimai saytda popup)

**Branch**: `009-image-popup` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-image-popup/spec.md`

## Summary

- Yeni məzmun tipi yaradılır: `image_popups` və `image_popup_translations`. Hər dilin öz şəkli, linki və alt mətni olur.
- Admin API-də CRUD yazılır, public API-də bir oxuma endpoint-i.
- Paneldə deklarativ CRUD modulu olacaq, sidebar-da ayrıca bənd kimi.
- Sayt layout-da popup-ı serverdə alır və `ImagePopupDialog`-da göstərir. Bu dialoq canlı yayım popup-ının (spec 006) bağlanma məntiqini ümumiləşdirilmiş formada işlədir və onunla növbələşir.

## Technical Context

**Language/Version**:
- API-lər: C# / .NET, EF Core + Npgsql.
- Frontend-lər: TypeScript strict. Panel React 19 + Vite, sayt Next.js 16 App Router.

**Primary Dependencies**:
- API-lər: `EFCore.NamingConventions` (snake_case), `AuditService`.
- Panel: `@cbar/lib-react-ui-kit`, TanStack Router + Query, RHF + Zod, react-i18next.
- Sayt: eyni UI kit (`dialog`), Zustand, `unstable_cache` (`server/cached.ts`).

**Storage**:
- PostgreSQL: 2 yeni cədvəl, migration `0006-image-popups.sql`.
- Şəkillər mövcud `media_assets` + MinIO ilə saxlanılır, public tərəfə `/media/{id}` proxy-si ilə verilir.

**Testing**:
- Panel və sayt: Vitest + RTL + MSW (`npm run verify`).
- API-lər: avtomatik test yoxdur (Maddə VIII.1). Test mühitində curl ilə yoxlanılır, çünki lokalda .NET SDK yoxdur.

**Target Platform**: Linux konteynerlər (CBAR GitLab pipeline). Brauzerlər: masaüstü və mobil.

**Project Type**: web: 2 API + 2 frontend.

**Performance Goals**:
- Popup sorğusu layout-da hər səhifədə gedir, ona görə 60 saniyə keşlənir (R12).
- Popup olmayanda səhifəyə əlavə şəbəkə sorğusu və vizual dəyişiklik olmur (SC-005).

**Constraints**:
- Brauzer API-yə birbaşa getmir (FR-009).
- CSP dəyişmir (`img-src 'self'`).
- `Cbar.Domain` hər iki API-də bayt-bayt eynidir.

**Scale/Scope**: Eyni anda bir neçə yazı ola bilər, public tərəfə 1 yazı çıxır. 1 yeni admin ekranı, 1 yeni dialoq.

## Constitution Check

*GATE: Phase 0-dan əvvəl yoxlanıldı, Phase 1-dən sonra təkrar yoxlanıldı.*

| Maddə | Status | Qeyd |
| --- | --- | --- |
| I.2 `product-host` istinadı | ✅ | Qarşılığı yoxdur, spec bunu açıq yazır. `Banners` ayrıca funksiyadır və dəyişmir |
| I.3 səssiz itki | ✅ | Heç nə ləğv olunmur |
| II.3 ayrı MR-lar + deploy sırası | ✅ | 4 MR, sıra aşağıda |
| III.1 çarpaz çağırış yoxdur | ✅ | Panel yalnız admin API-yə müraciət edir. Buna görə siyahıda thumbnail yoxdur (R5) |
| III.2 yeganə yazan | ✅ | Migration `api-cbar-admin`-dədir. `api-cbar` yalnız SELECT edir, `cbar_web_ro`-ya qorunan GRANT verilir |
| III.3 public filtr | ✅ | `is_active` + dil + media soft-delete. Bu tipdə `Status/ShowAz/PublishedAt` sütunları yoxdur, `video_streams` ilə eyni səviyyədir |
| III.4 JWT + audit | ✅ | `[Authorize]`. `image_popups.*` audit hadisələri yazılır |
| IV port və sıra | ✅ | Yeni port və proyekt yoxdur |
| V.1 `Cbar.Domain` eyni | ✅ | Eyni fayl hər iki kopyada. Diff sıfır olmalıdır, bu, tasks-da ayrıca yoxlama addımıdır |
| V.2 migration qaydaları | ✅ | Append-only, `IF NOT EXISTS`, `BEGIN` yoxdur, ad unikaldır |
| V.3 ikidillilik | ✅ | `<entity>_translations` `(popup_id, locale)` açarı ilə |
| V.4 i18n paritet | ✅ | `imagePopups.json`, `nav.json` və `media.json` hər iki dildə |
| V.5 UTF-8 | ✅ | Az hərfli fayllar yalnız redaktorla yazılır |
| VI şablon yığını | ✅ | `defineModule` işlənir, yeni asılılıq yoxdur |
| VII kontraktlar | ✅ | Mövcud endpoint dəyişmir, yalnız yeni route əlavə olunur |
| VIII verification | ✅ | `npm run verify` ×2 + quickstart. API build test mühitində yoxlanılır, bu, sənədləşdirilmiş məhdudiyyətdir |
| Template X.3 / D-1 sessionStorage | ✅ (D-1) | Saxlanılan yeganə şey həssas olmayan "bağlandı" bayrağıdır, 006 D-1 ilə eyni |

Pozuntu yoxdur, Complexity Tracking boşdur.

## İş paketləri (MR) və deploy sırası

| # | Proyekt | Dəyişiklik | Asılılıq |
| --- | --- | --- | --- |
| 1 | `api-cbar-admin` | Aşağıdakılar: | — |
| | | migration `0006-image-popups.sql` | |
| | | `Cbar.Domain/Entities/ImagePopup.cs` + `CbarDbContext` | |
| | | `ImagePopupsController` | |
| | | `MediaController.Delete` istinad siyahısı | |
| 2 | `api-cbar` | `Cbar.Domain` (MR 1 ilə bayt-bayt eyni) + `MediaContentController.GetImagePopups` | MR 1 deploy olunmalıdır, çünki cədvəl orada yaranır |
| 3 | `web-cbar-admin-new` | `features/image-popups` + nav/route/i18n + `crud-form-page` `{locale}` dəstəyi (R6) | MR 1 |
| 4 | `web-cbar-new` | Aşağıdakılar: | MR 2 |
| | | `shared/lib/popup-dismissal` refaktoru | |
| | | `features/image-popup` | |
| | | `widgets/image-popup` | |
| | | layout və `SiteShell` bağlantısı | |

MR 3 və 4 paralel yazıla bilər: hər ikisi MSW ilə test olunur.

## Project Structure

### Documentation (this feature)

```text
specs/009-image-popup/
├── plan.md
├── research.md          # R1–R14 qərarları
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── admin-api.md
│   ├── public-api.md
│   └── ui.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code

```text
product-rest/api-cbar-admin/
├── db/migrations/0006-image-popups.sql                    # yeni
└── src/
    ├── Cbar.Domain/Entities/ImagePopup.cs                  # yeni (api-cbar ilə eyni)
    ├── Cbar.Domain/CbarDbContext.cs                        # DbSet + 2 Entity bloku
    └── Cbar.AdminApi/Controllers/
        ├── ImagePopupsController.cs                        # yeni
        └── MediaController.cs                              # Delete: istinad siyahısı

product-rest/api-cbar/src/
├── Cbar.Domain/…                                           # MR 1 ilə eyni
└── Cbar.WebApi/Controllers/MediaContentController.cs       # GET image-popups

product-rest/web-cbar-admin-new/src/
├── features/image-popups/
│   ├── api/image-popups.{keys,service}.ts
│   ├── components/image-popup-status-toggle.tsx
│   ├── model/{module,schemas,link-rule}.ts
│   └── image-popups.test.tsx
├── features/crud/components/crud-form-page.tsx             # mediaNameKey {locale}
├── shared/testing/{handlers/image-popups.ts,fixtures/image-popups.ts,handlers/index.ts}
├── shared/i18n/index.ts                                    # namespace qeydiyyatı
├── locales/{az,en}/{imagePopups,nav}.json
└── app/routes/{index,nav}.ts

product-rest/web-cbar-new/src/
├── shared/lib/popup-dismissal.ts (+ .test.ts)              # yeni, 006 məntiqindən
├── features/live-stream/model/dismissal.ts                 # re-export (API dəyişmir)
├── features/image-popup/
│   ├── api/image-popup.api.ts                              # server-only, cachedJson
│   └── model/{image-popup,store,dismissal}.ts
├── widgets/image-popup/image-popup-dialog.tsx (+ .test.tsx)
├── shell/site-shell.tsx                                    # imagePopup prop
├── app/[locale]/layout.tsx                                 # Promise.all-a əlavə
└── locales (media namespace): imagePopup.{title,openLink,newTab}
```

**Structure Decision**: Mövcud 4 proyektin FSD və controller strukturu saxlanılır. Yeni qovluqlar yalnız bu feature-in öz modulu üçündür. Kod sahəsinə toxunan ümumi dəyişikliklər ikidir:
- `crud-form-page` `{locale}` dəstəyi;
- `popup-dismissal` refaktoru.

İkisi də geriyə uyğundur.

## Əsas qərarlar (ətraflı: research.md)

- **R3, seçim**: `activated_at DESC`. Yenidən aktivləşdirmə popup-ı önə çıxarır, adi redaktə çıxarmır.
- **R4, public forma**: 0 və ya 1 elementli massiv. `200 []` qayıdır, 404 və 204 yox.
- **R5, thumbnail yoxdur**: admin API bayt vermir, çarpaz çağırış qadağandır. Siyahıda fayl adı və dil nişanları göstərilir.
- **R9, dialoq**: kitin `DialogContent`-i + restyle olunmuş öz bağla düyməsi. `DialogTitle` `sr-only` olur.
- **R10, növbələşmə**: şəkilli popup `useLiveStreamStore.open` və canlı yayımın bağlanma qeydini oxuyur. Canlı yayım kodu dəyişmir.
- **R12, keş**: 60 saniyə. SC-002 buna uyğun düzəldildi.

## Spec-ə edilən düzəlişlər (plan zamanı)

- **FR-006**: "önizləmə (az şəkli…)" ifadəsi "şəkil faylının adı + dil nişanları" ilə əvəz olundu (R5).
- **SC-002**: "dərhal" yerinə "ən çox 60 saniyə ərzində" yazıldı (R12, spec 003 SC-010).

## Risklər

| Risk | Təsir | Azaltma |
| --- | --- | --- |
| MR 2 MR 1-dən əvvəl deploy olunur | `api-cbar` sorğusu cədvəl tapmır, 500 qaytarır. Layout `.catch(() => [])` edir, sayt popup-sız işləyir | Deploy sırası MR təsvirində yazılır |
| `Cbar.Domain` kopyaları fərqlənir | Model uyğunsuzluğu | Tasks-da `diff -r` addımı |
| Spec 008 (RBAC) sonra gəlir | Yeni controller icazə kataloqunda olmur | 008 tasks-ına `image_popups.*` qeydi (R13) |
| Kitin close düyməsinin selektoru dəyişir | Düymə standart görünüşə qayıdır | Test `data-slot="dialog-close"`-un mövcudluğunu yoxlayır |

## Complexity Tracking

Pozuntu yoxdur.
