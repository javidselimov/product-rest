---
description: "Şəkilli popup: implementasiya tapşırıqları"
---

# Tasks: Şəkilli popup (admin bölməsi + ictimai saytda popup)

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: SC-003 avtomatik testləri tələb edir. Frontend-lərdə Vitest + MSW testləri yazılır, hər biri implementasiyadan əvvəl və ya onunla birlikdə. API-lərdə test yığını yoxdur (Maddə VIII.1). Onlar test mühitində curl ilə yoxlanılır, çünki lokalda .NET SDK yoxdur.

**Yollar** repo kökünə nisbətəndir (`commonrabc/`). Qısaltmalar:
- `ADM-API` = `product-rest/api-cbar-admin`
- `WEB-API` = `product-rest/api-cbar`
- `ADM` = `product-rest/web-cbar-admin-new/src`
- `WEB` = `product-rest/web-cbar-new/src`

**MR xəritəsi** (plan.md):

| MR | Proyekt | Tapşırıqlar |
| --- | --- | --- |
| MR 1 | `ADM-API` | T003-T006, T010-T014 |
| MR 2 | `WEB-API` | T007, T030-T031 |
| MR 3 | `ADM` | T001, T015-T024 |
| MR 4 | `WEB` | T002, T032-T047 |

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: Mövcud vəziyyəti ölçmək. Başlanğıcda iki qapı yaşıl olmalıdır ki, sonrakı qırmızı nəticə bu feature-ə aid olsun.

- [X] T001 [P] `product-rest/web-cbar-admin-new`-də `npm run verify` işlət və nəticəni qeyd et (baseline)
- [X] T002 [P] `product-rest/web-cbar-new`-də `npm run verify` işlət və nəticəni qeyd et (baseline)

---

## Phase 2: Foundational (sxem və domain modeli)

**Purpose**: Bütün hekayələrin asılı olduğu cədvəllər və EF modeli.

**⚠️ CRITICAL**: US1 API və US2 API bu faza bitmədən başlaya bilməz.

- [X] T003 `ADM-API/db/migrations/0006-image-popups.sql` faylını yarat. Tərkibi:
  - `image_popups` və `image_popup_translations` cədvəlləri, sütunlar, FK-lar və `UNIQUE (popup_id, locale)` [data-model.md](./data-model.md)-dakı kimi;
  - indeks `(is_active, activated_at DESC)`;
  - hər şey `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` ilə, `BEGIN`/`COMMIT` olmadan;
  - `0005-inflation-settings.sql` üslubunda `cbar_web_ro` yoxlaması ilə qorunan `GRANT SELECT` (hər iki cədvələ);
  - başlıqda qısa ingilis dilində şərh.
- [X] T004 [P] `ADM-API/src/Cbar.Domain/Entities/ImagePopup.cs` faylını yarat.
  - `ImagePopup`: `int Id`, `string Title = null!`, `bool IsActive = true`, `DateTimeOffset? ActivatedAt`, `int? CreatedBy`, `DateTimeOffset CreatedAt`, `DateTimeOffset UpdatedAt`, `List<ImagePopupTranslation> Translations = []`.
  - `ImagePopupTranslation`: `long Id`, `int PopupId`, `ImagePopup Popup = null!`, `string Locale = null!`, `long? MediaId`, `MediaAsset? Media`, `string? Link`, `string? AltText`.
  - Üslub `Entities/Homepage.cs`-dəki `Banner` ilə eyni olsun: auto-property və namespace.
- [X] T005 `ADM-API/src/Cbar.Domain/CbarDbContext.cs` faylını yenilə:
  - `public DbSet<ImagePopup> ImagePopups => Set<ImagePopup>();` sətrini `Banners`-in yanına əlavə et.
  - `OnModelCreating`-də `VideoStreamTranslation` blokunun (l.418-424) üslubunda iki blok yaz:
    - `ImagePopup` → `ToTable("image_popups")`;
    - `ImagePopupTranslation` → `ToTable("image_popup_translations")`, `HasOne(x => x.Popup).WithMany(x => x.Translations).HasForeignKey(x => x.PopupId)`, `HasIndex(x => new { x.PopupId, x.Locale }).IsUnique()`.

  T004-dən asılıdır.
- [X] T006 `ADM-API/src/Cbar.AdminApi/Controllers/MediaController.cs` faylında `Delete` metodunun `inUse` SQL-inə (l.118-133) bu sətri əlavə et: `OR EXISTS (SELECT 1 FROM image_popup_translations WHERE media_id = {id})`. Mövcud sütun düzülüşünü saxla (R14).
- [X] T007 `ADM-API/src/Cbar.Domain`-dakı `Entities/ImagePopup.cs` və `CbarDbContext.cs` fayllarını `WEB-API/src/Cbar.Domain`-a bayt-bayt köçür. Sonra `diff -r product-rest/api-cbar-admin/src/Cbar.Domain product-rest/api-cbar/src/Cbar.Domain` boş çıxmalıdır (Maddə V.1). T005-dən asılıdır.

**Checkpoint**: Sxem və model hazırdır. MR 1-in admin API hissəsi (US1) və MR 2 (US2) başlaya bilər.

---

## Phase 3: User Story 1 — Redaktor şəkilli popup-ı idarə edir (Priority: P1) 🎯 MVP

**Goal**:
- Admin API-də `api/v1/image-popups` CRUD.
- Paneldə sidebar bəndi, siyahı, forma (hər dil üçün şəkil, link və alt mətn) və status düyməsi.

**Independent Test**:
- Panel `:5174`-də MSW ilə testlər keçir.
- Test mühitində yazı yaratmaq, redaktə etmək, status dəyişmək və silmək olur. `audit_log`-da `image_popups.*` sətirləri görünür. Sayt lazım deyil.

### Admin API (MR 1)

- [X] T010 [US1] `ADM-API/src/Cbar.AdminApi/Controllers/ImagePopupsController.cs` yarat. `[ApiController] [Authorize] [Route("api/v1/image-popups")]`, `(CbarDbContext db, AuditService audit)`.
  - **DTO-lar**: `ImagePopupTranslationDto(long? MediaId, string? Link, string? AltText)` və `ImagePopupUpsertDto(string Title, bool IsActive, Dictionary<string, ImagePopupTranslationDto> Translations)`.
  - **Endpoint-lər** [contracts/admin-api.md](./contracts/admin-api.md)-dakı kimi:
    - `GET` → `{ items }`, sıra `id DESC`, `Include(Translations).ThenInclude(Media)`;
    - `GET {id:int}`;
    - `POST` → `CreatedAtAction`;
    - `PUT {id:int}`;
    - `DELETE {id:int}` → `204`.
  - **`ToDetailDto`**: `Id, Title, IsActive, ActivatedAt, CreatedAt, UpdatedAt, Translations = ToDictionary(Locale, { MediaId, MediaName = Media?.OriginalName, Link, AltText })`.
  - **Tətbiq**: `ApplyTranslations` `BannersController.cs:117-133` nümunəsi ilə yazılır: upsert + `RemoveAll`. `CreatedBy = CurrentUserId()` (`InfoLinesController.cs:130-134` helper-i).
- [X] T011 [US1] `ImagePopupsController.cs`-də validasiya əlavə et: `400 { message }`, mesajlar contracts cədvəlindəki kimi. Yoxlanılanlar:
  - boş `Title`, uzunluq ≤ 500;
  - naməlum locale (`db.Locales`-də yoxdur);
  - ən azı bir tərcümədə `MediaId` olmalıdır;
  - hər `MediaId` mövcud olmalı və silinməmiş olmalıdır (`DeletedAt == null`);
  - `MimeType` `image/` ilə başlamalıdır;
  - `Link`: boş, `^https?://` və ya `/` ilə başlayır, amma `//` ilə yox; ≤ 1000;
  - `AltText` ≤ 500.

  Boş sətirləri `null`-a normallaşdır.
- [X] T012 [US1] `ImagePopupsController.cs`-də `activated_at` qaydasını yaz (R3):
  - `POST`: `IsActive` doğrudursa `ActivatedAt = DateTimeOffset.UtcNow`;
  - `PUT`: yalnız `!entity.IsActive && dto.IsActive` olanda yenilə, digər hallarda dəyişmə.
- [X] T013 [US1] `ImagePopupsController.cs`-də audit əlavə et:
  - `image_popups.create`: `BannersController.cs:65-70` kimi tranzaksiya + iki `SaveChangesAsync`;
  - `image_popups.update`: `before = ToDetailDto(entity)`, `after = dto`;
  - `image_popups.delete`;
  - entity tipi `"image_popup"`.
- [X] T014 [US1] `specs/001-admin-template-migration/contracts/admin-api.md` faylına (varsa, admin API kontraktlarının toplandığı yer) `/image-popups` bölməsi əlavə et, [contracts/admin-api.md](./contracts/admin-api.md)-yə istinad et.

### Admin panel (MR 3)

- [X] T015 [P] [US1] `ADM/features/crud/components/crud-form-page.tsx` (l.280-285): `mediaNameKey` `{locale}` yer tutucusu saxlayırsa və sahə `perLocale`-dirsə, onu cari tabın dili ilə əvəz et (`field.mediaNameKey.replace('{locale}', locale)`) və sonra `getByPath` çağır (R6). `ADM/shared/crud/types.ts:67`-dəki `mediaNameKey` JSDoc-una `{locale}` dəstəyini yaz. Mövcud modullar dəyişmir.
- [X] T016 [P] [US1] `ADM/shared/testing/fixtures/image-popups.ts` yarat. İki yazı olsun: biri aktiv, hər iki dildə şəkil; digəri deaktiv, yalnız az. `mediaName` doludur. `ADM/shared/testing/handlers/image-popups.ts` də yarat:
  - `createCrudStore({ path: '/image-popups', envelope: 'items', seed, applyBody })`, `handlers/live-streams.ts` nümunəsi ilə;
  - `applyBody` `isActive` false → true olanda `activatedAt` yazır.

  Handler-i `ADM/shared/testing/handlers/index.ts`-də qeydiyyatdan keçir.
- [X] T017 [P] [US1] `ADM/features/image-popups/model/schemas.ts` yarat. `z.looseObject`: `id`, `title`, `isActive`, `activatedAt?`, `createdAt?`, `updatedAt?`, `translations: translationsSchema(z.looseObject({ mediaId: z.number().nullable().optional(), mediaName: z.string().nullable().optional(), link: z.string().nullable().optional(), altText: z.string().nullable().optional() }))`.
- [X] T018 [P] [US1] `ADM/features/image-popups/model/link-rule.ts` yarat: `withLinkRule(field, messageKey)`, `ADM/.../youtube-url.ts:34-47` üslubunda. Hər dil üçün `translations.<locale>.<field>` yoxlanılır: boş, `^https?://` və ya `/` + ikinci simvol `/` deyil. Xəta `path: ['translations', locale, field]` altına yazılır. Test də yaz: `ADM/features/image-popups/model/link-rule.test.ts`. Hallar: `javascript:`, `//x`, `/az`, `https://x`, boş.
- [X] T019 [US1] `ADM/features/image-popups/api/image-popups.keys.ts` (`IMAGE_POPUPS_MODULE_ID = 'image-popups'`, `crudKeys`) və `image-popups.service.ts` yarat. `setActive(row, isActive)` metodu `apiClient.put('/image-popups/${id}', { title, isActive, translations })` göndərir. Tərcümələr `{ mediaId, link, altText }`-ə endirilir, `mediaName` göndərilmir.
- [X] T020 [US1] `ADM/features/image-popups/components/image-popup-status-toggle.tsx` yarat. `live-streams/components/live-status-toggle.tsx`-in surəti olsun: `useMutation` + toast + `invalidateQueries(imagePopupsKeys.all)`, etiket `common:status.active|inactive`.
- [X] T021 [US1] `ADM/features/image-popups/model/module.ts` yarat. `defineModule<ImagePopupRow, '/image-popups'>`:
  - `ns: 'imagePopups'`, `apiPath` və `basePath` `'/image-popups'`, `listEnvelope: 'items'`.
  - **Sütunlar** ([contracts/ui.md](./contracts/ui.md)):
    - `title`;
    - şəkil: custom, `az.mediaName ?? en.mediaName ?? '—'`;
    - dillər: custom, şəkli olan dillər üçün `az`/`en` nişanları;
    - `createdAt` və `updatedAt` `date`;
    - `isActive`: custom → `ImagePopupStatusToggle`.
  - **Sahələr**:
    - `title` (text, required);
    - `mediaId` (media, `perLocale`, `required`, `mediaNameKey: 'translations.{locale}.mediaName'`);
    - `link` (text, `perLocale`, placeholder);
    - `altText` (text, `perLocale`, help);
    - `isActive` (checkbox, `defaultValue: true`).
  - `schema: withLinkRule('link', 'imagePopups:validation.link')`, `rowLabel: row.title`.

  T017-T020-dən asılıdır.
- [X] T022 [US1] Aşağıdakı faylları yarat və ya yenilə:
  - `ADM/locales/az/imagePopups.json` və `ADM/locales/en/imagePopups.json`: `title`, `entity`, `description`, `fields.*` (`title`, `image`, `link`, `altText`, `languages`), `placeholders.link`, `help.altText`, `validation.link`;
  - namespace-i `ADM/shared/i18n/index.ts`-də qeydiyyatdan keçir: `liveStreams`-in 4 yerindəki kimi (l.23, 47, 83, 109);
  - `ADM/locales/{az,en}/nav.json`-a `imagePopups` label və description əlavə et ([contracts/ui.md](./contracts/ui.md)).

  Az hərfli fayllar yalnız Write/Edit alətləri ilə yazılır (Maddə V.5).
- [X] T023 [US1] Route və nav qoşulması:
  - `ADM/app/routes/index.ts`: `// Media` blokunda `...createCrudRoutes(authLayoutRoute, registerModule(imagePopupsModule))`, `liveStreams`-dən sonra;
  - `ADM/app/routes/nav.ts`: `NavKey`-ə `'imagePopups'`, bənd `{ path: '/image-popups', key: 'imagePopups', icon: ImageIcon, group: 'media' }`, `liveStreams`-dən dərhal sonra.
- [X] T024 [US1] `ADM/features/image-popups/image-popups.test.tsx` yarat, `live-streams.test.tsx` quruluşu ilə. Ssenarilər:
  1. siyahıda başlıq, fayl adı, dil nişanları və status görünür;
  2. şəkilsiz saxlama `validation.requiredOneLocale` xətası verir və POST getmir;
  3. `javascript:` link xəta verir;
  4. az şəkli və link ilə yaratma düzgün body ilə POST göndərir;
  5. redaktədə hər tabda fayl adı görünür (`#id` yox);
  6. status toggle PUT göndərir, `isActive` tərsinə çevrilir, siyahı yenilənir;
  7. toggle xətası toast göstərir;
  8. silmə dialoqu DELETE göndərir.

  Sonra `product-rest/web-cbar-admin-new`-də `npm run verify` işlət.

**Checkpoint**: US1 müstəqil işləyir: panel testləri keçir, API test mühitində curl ilə yoxlanılır ([quickstart.md](./quickstart.md) §2-3).

---

## Phase 4: User Story 2 — Ziyarətçi öz dilində şəkilli popup görür (Priority: P1)

**Goal**:
- Public endpoint.
- Sayt layout-da popup-ı alır və `ImagePopupDialog`-da göstərir: yalnız şəkil, dairəvi ×, dilə görə şəkil, link, səhifəyə görə bağlanma qeydi.

**Independent Test**: Saytda Vitest testləri US2-nin 1-10 ssenarilərini əhatə edir. Test mühitində aktiv popup olanda [quickstart.md](./quickstart.md) §4-ün 1-9 və 11-13 addımları keçir.

### Public API (MR 2)

- [X] T030 [US2] `WEB-API/src/Cbar.WebApi/Controllers/MediaContentController.cs`-də `video-streams`-in (l.103-119) yanına `[HttpGet("image-popups")] GetImagePopups([FromQuery] string locale = "az")` əlavə et.
  - **Filtr** (`data-model.md` → "Public seçim"): `p.IsActive`, `locale` üçün tərcümə var, `MediaId != null`, `Media.DeletedAt == null`.
  - **Sıra**: `ActivatedAt DESC` (null-lar sonda), sonra `Id DESC`. `Take(1)`.
  - **Proyeksiya**: `{ id, imageUrl = $"/media/{mediaId}", link, altText }`.
  - **Cavab**: `Ok(items)`, sadə massiv ([contracts/public-api.md](./contracts/public-api.md)).
- [ ] T031 [US2] Test mühitində curl ilə yoxla ([quickstart.md](./quickstart.md) §2):
  - `?locale=az` bir element qaytarır;
  - yalnız az şəkli olanda `?locale=en` `[]` qaytarır;
  - deaktiv edəndən sonra `[]` qayıdır.

  MR 1 deploy olunmayıbsa, bu addım gözləyir.

### Sayt (MR 4): ümumi bağlanma məntiqi

- [X] T032 [P] [US2] `WEB/shared/lib/popup-dismissal.ts` yarat: `createPopupDismissal(prefix)` → `{ key(id, pathname), isDismissed(id, pathname), markDismissed(id, pathname) }`. Məntiq, `normalizePath`, try/catch və JSDoc `WEB/features/live-stream/model/dismissal.ts`-dən köçürülür. Test də yaz: `WEB/shared/lib/popup-dismissal.test.ts`. Hallar:
  - iki fərqli prefix bir-birinə təsir etmir;
  - sondakı `/` normallaşır;
  - `sessionStorage` exception atanda xəta çıxmır.
- [X] T033 [US2] `WEB/features/live-stream/model/dismissal.ts` faylını `createPopupDismissal('cbar:live-stream:dismissed')` üzərindən yenidən yaz. Export adları və imzalar dəyişmir: `dismissalKey`, `isDismissed`, `markDismissed`. Mövcud `live-stream.test.ts` və `live-stream-dialog.test.tsx` dəyişmədən keçməlidir. T032-dən asılıdır.

### Sayt (MR 4): popup

- [X] T034 [P] [US2] `WEB/features/image-popup/model/image-popup.ts` yarat:
  - Zod `imagePopupSchema`: `id` number, `imageUrl` string, `link` və `altText` string nullable optional;
  - tip `ImagePopup`;
  - `toImagePopup(list): ImagePopup | null`, `list[0] ?? null` qaytarır.

  Test: `image-popup.test.ts`.
- [X] T035 [P] [US2] `WEB/features/image-popup/model/store.ts` yarat: Zustand `{ open, setOpen }`, `features/live-stream/model/store.ts` kimi. Həmçinin `WEB/features/image-popup/model/dismissal.ts` yarat: `createPopupDismissal('cbar:image-popup:dismissed')`, `imagePopupDismissalKey`, `isImagePopupDismissed`, `markImagePopupDismissed`. T032-dən asılıdır.
- [X] T036 [US2] `WEB/features/image-popup/api/image-popup.api.ts` yarat, `import 'server-only'` ilə:
  - `const fetchImagePopups = cachedJson(z.array(imagePopupSchema), { keyPrefix: 'image-popups', tag: 'media' })`;
  - `export function getImagePopups(locale: Locale) { return fetchImagePopups(`/api/v1/image-popups?locale=${locale}`) }`.

  Nümunə: `WEB/features/media/api/media.api.ts`.
- [X] T037 [US2] `WEB/locales/{az,en}/media.json` (və ya layihədə `media` namespace-inin real yeri) faylına bu açarları əlavə et:
  - `imagePopup.title`: "Elan" / "Announcement";
  - `imagePopup.openLink`: "Ətraflı" / "Learn more";
  - `imagePopup.newTab`: "(yeni tabda açılır)" / "(opens in a new tab)".
- [X] T038 [US2] `WEB/widgets/image-popup/image-popup-dialog.tsx` yarat, `'use client'`, props `{ popup: ImagePopup | null }`.
  - **Görünüş** (R9, FR-016/017):
    - `Dialog` + `DialogContent`, `data-slot="image-popup-dialog"`, `aria-describedby={undefined}`;
    - class-lar: `p-0 gap-0 w-fit max-w-[calc(100%-2rem)] sm:max-w-[min(50vw,720px)] overflow-hidden rounded-lg border-0 bg-transparent shadow-xl` + close düyməsi üçün `[&_[data-slot=dialog-close]]:top-2 [&_[data-slot=dialog-close]]:right-2 [&_[data-slot=dialog-close]]:size-7 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-white [&_[data-slot=dialog-close]]:opacity-100 [&_[data-slot=dialog-close]]:shadow`;
    - `DialogTitle className="sr-only"`, mətni `altText ?? t('imagePopup.title')`;
    - `<img src={mediaUrl(popup.imageUrl)} alt={altText ?? ''} decoding="async" className="block h-auto max-h-[85vh] w-auto max-w-full" onError={...}>`.
  - **Link**:
    - `http(s)` → `<a target="_blank" rel="noopener noreferrer">` + `sr-only` `newTab`;
    - `/…` → `next/link`;
    - klik `markImagePopupDismissed` + `setOpen(false)` edir;
    - link yoxdursa, `<img>` sarılmır.
  - **Açılma**: `useEffect([popupId, pathname])`: `!isImagePopupDismissed` olanda `setOpen(true)`. US3 şərti T045-də əlavə olunur.
  - **Bağlanma**: `onOpenChange(false)` → `markImagePopupDismissed`. `onError` → yalnız `setOpen(false)`, qeyd yazılmır.
  - `useTranslation('media')` importu `live-stream-dialog.tsx`-dəki kimi.
- [X] T039 [US2] Qoşulma:
  - `WEB/app/[locale]/layout.tsx`: `Promise.all`-a `getImagePopups(locale).catch(() => [])` əlavə et, `SiteShell`-ə `imagePopup={toImagePopup(popups)}` ötür;
  - `WEB/shell/site-shell.tsx`: `imagePopup?: ImagePopup | null` prop (default `null`), `<ImagePopupDialog popup={imagePopup} />` `LiveStreamDialog`-dan sonra;
  - `product-rest/web-cbar-new/CLAUDE.md`-dəki client komponent siyahısına `ImagePopupDialog`-u əlavə et.
- [X] T040 [US2] `WEB/widgets/image-popup/image-popup-dialog.test.tsx` yarat, `live-stream-dialog.test.tsx` quruluşu ilə: `navigationState.pathname`, `sessionStorage.clear()`, store reset, `renderApp`. Ssenarilər (US2):
  1. popup açılır, `img` doğru `src` və `alt` ilə;
  2. `popup=null` olanda heç nə render olunmur;
  3. × basılır → qeyd yazılır, eyni pathname-də remount olanda açılmır;
  4. başqa pathname-də açılır;
  5. A → B → A: A-da açılmır;
  6. `sessionStorage.clear()` (yeni sessiya) → açılır;
  7. fərqli `id` ilə yeni popup eyni səhifədə açılır;
  8. xarici link `target="_blank"` və `rel` ilə, daxili link eyni tabda; klik qeyd yazır və bağlayır;
  9. link yoxdursa `<a>` yoxdur;
  10. `img` üçün `fireEvent.error` → bağlanır, qeyd yazılmır;
  11. `[data-slot="dialog-close"]` mövcuddur;
  12. Esc bağlayır və qeyd yazır.
- [ ] T041 [US2] `product-rest/web-cbar-new`-də `npm run verify` işlət.

**Checkpoint**: US2 müstəqil işləyir. Canlı yayım yoxdursa, şəkilli popup tam funksionaldır.

---

## Phase 5: User Story 3 — Canlı yayımla növbələşmə (Priority: P2)

**Goal**: Hər iki popup aktiv olanda əvvəl canlı yayım açılır, şəkilli popup yalnız o bağlanandan sonra açılır (Q2, FR-013, R10).

**Independent Test**: Vitest-də iki dialoq birlikdə render olunur, US3-ün 1-2 ssenariləri keçir. Brauzerdə [quickstart.md](./quickstart.md) §4 addım 10 keçir.

- [X] T045 [US3] `WEB/widgets/image-popup/image-popup-dialog.tsx`-ə `liveStreamId?: number` prop əlavə et.
  - Açılma şərti: `!liveOpen && (liveStreamId === undefined || isDismissed(liveStreamId, pathname))`.
    - `liveOpen = useLiveStreamStore(s => s.open)`;
    - `isDismissed` `features/live-stream/model/dismissal`-dandır.
  - `liveOpen` effekt asılılıqlarına əlavə olunur.
  - `WEB/shell/site-shell.tsx`: `<ImagePopupDialog popup={imagePopup} liveStreamId={liveStream?.id} />`.
  - `LiveStreamDialog` dəyişmir.
- [X] T046 [US3] `WEB/widgets/image-popup/image-popup-coexistence.test.tsx` yarat. `LiveStreamDialog` və `ImagePopupDialog` birlikdə render olunur. Ssenarilər:
  1. təmiz sessiya: yalnız canlı yayım dialoqu görünür;
  2. canlı yayımın × düyməsi basılır → şəkilli popup açılır;
  3. hər ikisi bağlanıb, remount olur → heç biri açılmır;
  4. canlı yayım əvvəlcədən bağlanıb → yalnız şəkilli popup açılır;
  5. canlı yayım yoxdur → şəkilli popup dərhal açılır.
- [ ] T047 [US3] `product-rest/web-cbar-new`-də `npm run verify` işlət.

**Checkpoint**: Bütün hekayələr işləyir.

---

## Phase 6: Polish & Cross-Cutting

- [X] T050 [P] `specs/008-admin-rbac-four-eyes/`-də (plan və ya tasks mövcud olan faylda) qeyd əlavə et: `image_popups.read|create|update|delete` icazələri kataloqa daxil edilməlidir (R13).
- [X] T051 [P] `product-rest/web-cbar-new/CLAUDE.md` və `product-rest/web-cbar-admin-new/CLAUDE.md`-yə bir sətirlik istinad əlavə et: şəkilli popup, spec 009, `popup-dismissal` ümumi modulu. Mövcud format saxlanılır.
- [ ] T052 Brauzerdə əl ilə yoxlama: [quickstart.md](./quickstart.md) §3 (panel) və §4 (sayt, 1-13). Nümunə ekran şəkli ilə vizual müqayisə: masaüstü və 375px mobil. Nəticəni bu faylın sonuna "Son yoxlama" bölməsi kimi yaz.
- [X] T053 Deploy sırasını MR təsvirlərinə yaz: MR 1 → MR 2 → MR 3 → MR 4. MR 2-nin təsvirində `Cbar.Domain` diff-inin sıfır olduğunu qeyd et (T007).

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)**: asılılığı yoxdur.
- **Phase 2 (Foundational)**: T003 → T004 → T005 → T007. T006 T005-dən sonra gəlir. US1 API (T010+) və US2 API (T030) bu fazanı gözləyir.
- **US1**:
  - admin API: T010 → T011 → T012 → T013;
  - panel (T015-T024) API-yə kod baxımından bağlı deyil, çünki MSW işlədir. Phase 2 ilə paralel başlaya bilər.
- **US2**:
  - public API (T030) T007-dən asılıdır; T031 MR 1 və MR 2-nin deploy-unu gözləyir;
  - sayt hissəsi (T032-T041) MSW və mock ilə API-dən asılı deyil.
- **US3**: T038 və T039-dan (US2) asılıdır.
- **Polish**: bütün hekayələrdən sonra. T052 hər 4 MR-ın test mühitində deploy olunmasını gözləyir.

### User story dependencies

- **US1 və US2** frontend səviyyəsində bir-birindən asılı deyil.
- **Məlumat baxımından** US2 real mühitdə US1-in yaratdığı yazıya ehtiyac duyur. Testlərdə bu, fixture ilə əvəz olunur.
- **US3** US2-nin dialoqunu genişləndirir.

### Parallel opportunities

- T001 ∥ T002
- T004 ∥ T003
- Panel: T015 ∥ T016 ∥ T017 ∥ T018
- Sayt: T032 ∥ T034 (sonra T035)
- Bütöv MR 3 (panel) ∥ MR 4 (sayt) ∥ MR 1 (admin API)

---

## Parallel Example: User Story 1 (panel)

```text
Task: "T015 crud-form-page {locale} dəstəyi — ADM/features/crud/components/crud-form-page.tsx"
Task: "T016 MSW fixture + handler — ADM/shared/testing/{fixtures,handlers}/image-popups.ts"
Task: "T017 Zod sxemi — ADM/features/image-popups/model/schemas.ts"
Task: "T018 link qaydası + test — ADM/features/image-popups/model/link-rule.ts"
```

## Parallel Example: User Story 2 (sayt)

```text
Task: "T032 popup-dismissal + test — WEB/shared/lib/popup-dismissal.ts"
Task: "T034 imagePopupSchema + toImagePopup — WEB/features/image-popup/model/image-popup.ts"
```

---

## Implementation Strategy

### MVP (US1)

1. Phase 1 + Phase 2 → sxem hazırdır.
2. US1 → redaktor popup-ları idarə edə bilir.
3. **STOP və VALIDATE**: panel testləri, test mühitində curl.

### Incremental delivery

1. MR 1 (admin API) + MR 3 (panel) → US1 test mühitində.
2. MR 2 (public API) + MR 4 US2 hissəsi → saytda popup.
3. MR 4-ə US3 əlavə olunur → növbələşmə. İstəsəniz, US3 MR 4-ün içində, eyni MR-da gedə bilər.
4. Polish → əl ilə yoxlama, sənədlər.

---

## Notes

- `[P]` = fərqli fayl, tamamlanmamış tapşırıqdan asılılıq yoxdur.
- API tapşırıqlarının build-i lokalda mümkün deyil. Kod `BannersController` və `VideoStreamsController` ilə sətir-sətir müqayisə olunaraq yazılır, build test mühitində yoxlanılır.
- Heç bir tətbiq olunmuş migration redaktə edilmir. `0006` adı hər iki API repo-sunda unikaldır.

## MR qeydləri (T053)

Deploy sırası məcburidir: **MR 1 → MR 2 → MR 3 → MR 4**.

- **MR 1 — `api-cbar-admin`**: migration `0006-image-popups.sql`, `ImagePopup` entity-si, `ImagePopupsController`, `MediaController` silmə qoruması. Əvvəl deploy olunur: cədvəli bu yaradır.
- **MR 2 — `api-cbar`**: `GET /api/v1/image-popups`. `Cbar.Domain` iki kopya arasında byte-byte eynidir (`diff -r` boş). Bu MR-ın `CbarDbContext` diff-i əvvəlki `refresh_tokens` → `admin_refresh_tokens` uyğunlaşdırmasını da daşıyır; bu zərərsizdir, çünki WebApi `RefreshToken` işlətmir. MR 1-dən əvvəl deploy olunsa, sorğu cədvəl olmadığı üçün 500 qaytarır, sayt isə popup-sız işləyir (`catch(() => [])`).
- **MR 3 — `web-cbar-admin-new`**: "Şəkilli popup-lar" menyusu. MR 1 olmadan siyahı xəta göstərir.
- **MR 4 — `web-cbar-new`**: popup dialoqu, ümumi `popup-dismissal`, canlı yayımla növbə.

## Yoxlama vəziyyəti (2026-09-30)

- Sayt: popup testləri 37/37; bütün suite 655/655 keçir.
- `npm run verify` (T041/T047) **tam keçmir**. Səbəb bu feature-dan əvvəlki iki problemdir:
  - lint: `react-i18next` dərin import qaydası 14 mövcud faylda pozulur. Yeni `image-popup-dialog.tsx` eyni pattern-i işlədir (T038 tələbi), buna görə 15-ci xəta odur. Qalan bütün lint qaydaları təmizdir.
  - typecheck və build: `vitest.config.mts` — `defineConfig` `vitest/config`-də tapılmır. Bu, feature-dan əvvəl də eyni idi. Next kompilyasiyası uğurlu keçir.
- T031 və T052 test mühitində deploy-dan sonra edilir.
