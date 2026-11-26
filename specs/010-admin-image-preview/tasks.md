---

description: "Admin paneldə şəkillərin önizləməsi — tapşırıqlar"
---

# Tasks: Admin paneldə şəkillərin önizləməsi (preview)

**Input**: `specs/010-admin-image-preview/` — [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/admin-api.md](./contracts/admin-api.md), [contracts/ui.md](./contracts/ui.md), [quickstart.md](./quickstart.md)

**Tests**: Daxil edilib. Panel template konstitusiyası (Maddə VI.1) hər feature üçün test tələb edir.
Testlər `renderApp` + MSW ilə real istifadəçi axınını yoxlayır. Mock assert-i qadağandır.
API-də avtomatik test yoxdur (workspace Maddə VIII.1), onun yoxlaması `curl`-dur (quickstart §1).

**Organization**: İki MR var, deploy sırası belədir: **MR 1 `api-cbar-admin` → MR 2 `web-cbar-admin-new`**.
Endpoint ortaq əsas olduğu üçün API Foundational fazasındadır. Panel işi user story-lərə bölünür.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralel icra oluna bilər (fərqli fayl, tamamlanmamış tapşırıqdan asılı deyil)
- **[Story]**: US1 / US2 / US3 (spec.md)

## Path Conventions

- API: `product-rest/api-cbar-admin/src/Cbar.AdminApi/`
- Panel: `product-rest/web-cbar-admin-new/src/`
- Kod şərhləri ingiliscədir (template Maddə I.2). UI mətnləri `t()` ilə verilir, az/en hər ikisi məcburidir.
- AZ hərfli JSON yalnız Edit/Write alətləri ilə yazılır, shell redirection istifadə olunmur (Maddə V.5).

---

## Phase 1: Setup

**Purpose**: Yeni dependency və layihə strukturu yoxdur. Yalnız başlanğıc vəziyyət yoxlanılır.

- [X] T001 `product-rest/web-cbar-admin-new`-də `npm run verify` icra et. Başlanğıcda gate-in yaşıl olduğunu qeyd et, sonrakı regressiyalar bununla müqayisə olunacaq (SC-007). Qırmızıdırsa, səbəbi bu feature-dan əvvəl tasks.md "Notes"-a yaz.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API endpoint-i (MR 1) və panelin önizləmə əsası. Bu ikisi olmadan heç bir user story görünən nəticə vermir.

**⚠️ CRITICAL**: Phase 2 bitməmiş US fazalarına başlanmır.

### MR 1 — `api-cbar-admin`

- [X] T002 `product-rest/api-cbar-admin/src/Cbar.AdminApi/Services/MediaStorage.cs`-ə `public Task GetAsync(string key, Func<Stream, CancellationToken, Task> callback, CancellationToken ct)` əlavə et.
  - Metod `_minio.GetObjectAsync(new GetObjectArgs().WithBucket(_bucket).WithObject(key).WithCallbackStream(callback), ct)` çağırır.
  - `ObjectNotFoundException`/`BucketNotFoundException` tutulmur, çağırana ötürülür.
- [X] T003 `product-rest/api-cbar-admin/src/Cbar.AdminApi/Controllers/MediaController.cs`-ə `[HttpGet("{id:long}/preview")] Preview(long id, CancellationToken ct)` əlavə et ([contracts/admin-api.md](./contracts/admin-api.md)). Addımlar:
  1. `db.MediaAssets.AsNoTracking()`-dən `StorageKey, OriginalName, MimeType, ChecksumSha256` seç. Soft-delete global filtrlə gizlənir. Yoxdursa: `Cache-Control: no-store` + `404 { message: "Not found." }`.
  2. `MimeType` `image/` ilə başlamırsa: `Cache-Control: private, max-age=31536000, immutable` + `415 { message: "Preview is available for images only.", mimeType }`. Baytlar oxunmur.
  3. `ETag = "\"{ChecksumSha256}\""`. `If-None-Match` uyğundursa (`*` və ya weak müqayisə): `304`, `ETag` + `Cache-Control`. Bu, `api-cbar` `MediaController.MatchesIfNoneMatch`-in davranışıdır, kod deyil davranış köçürülür (Maddə II.4).
  4. `storage.GetAsync(key, async (stream, token) => { … }, ct)`. Callback-in **içində** bu header-lər qoyulur, sonra `stream.CopyToAsync(Response.Body, token)`:
     - `Content-Type`, `Content-Disposition: inline` (`SetHttpFileName(OriginalName)`);
     - `ETag`, `Cache-Control: private, max-age=31536000, immutable`;
     - `X-Content-Type-Options: nosniff`;
     - `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`.
  5. **`Content-Length` qoyma**: `size_bytes` miqrasiya sətirlərində yanlışdır. Bunu şərhdə qeyd et.
  6. `ObjectNotFoundException`/`BucketNotFoundException` → `404`. Uğurda `new EmptyResult()`.
  7. Controller `[Authorize]`-u saxlanılır. Audit yazılmır, çünki bu oxumadır.
- [ ] T004 MR 1 yoxlaması. Lokalda .NET SDK yoxdur, ona görə: SDK olan mühitdə `dotnet build`, yoxdursa MR pipeline build-i. Deploy-dan sonra [quickstart.md §1](./quickstart.md) `curl` ssenariləri: 200 + başlıqlar, 401, 415, 404, 304. Nəticəni MR təsvirinə yaz.

### MR 2 — panel əsası (`web-cbar-admin-new`)

- [X] T005 [P] `src/shared/testing/fixtures/media.ts`-ə ən azı bir şəkil fixture-ı üçün test baytları əlavə et. `export const mediaPreviewBytes: Record<number, { body: string; type: string }>` olsun, id 1 və 2 üçün kiçik etibarlı SVG mətni (`image/svg+xml`). Ayrıca ən azı bir PNG fixture (`image/png`, 1×1 base64) `mediaFixtures`-ə yeni id ilə əlavə et. Mövcud id-lər dəyişmir. Bu fixture-lardan asılı testlərin (`media-library.test.tsx`, picker) sayları dəyişirsə, eyni tapşırıqda yenilə.
- [X] T006 `src/shared/testing/handlers/media.ts`-ə `http.get('/api/v1/media/:id/preview', …)` əlavə et (contracts/ui.md §4). `mediaStore.all()`-da id:
  - yoxdur → 404 (`message(404, 'Not found.')` köməkçisi və ya `HttpResponse.json(..., {status:404})`);
  - `image/` deyil → 415 `{ message, mimeType }`;
  - əks halda → `new HttpResponse(body, { headers: { 'Content-Type': type } })`.
  Asılılıq: T005.
- [X] T007 [P] `src/shared/testing/setup.ts`-də jsdom üçün polyfill ver: `URL.createObjectURL` (yoxdursa `blob:mock/<sayğac>` qaytarır) və `URL.revokeObjectURL` (no-op). Şərhdə izah et ki, bu, ağır brauzer API-nin əvəzidir və assert olunmur. `IntersectionObserver` polyfill-i **vermə**: hook onun olmamasını "görünür" kimi qəbul edir (T010).
- [X] T008 [P] `src/features/media/api/media.keys.ts`-ə `preview: (id: number) => ['media', 'preview', id] as const` əlavə et.
- [X] T009 `src/features/media/api/media.service.ts`-ə `export type PreviewResult = { kind: 'image'; blob: Blob } | { kind: 'notImage' } | { kind: 'unavailable' }` və `async preview(id: number): Promise<PreviewResult>` əlavə et:
  - `apiClient.get<Blob>(\`/media/${id}/preview\`, { responseType: 'blob' })`;
  - `blob.type` `image/` ilə başlamırsa → `notImage` (X.2: cavab tipi yoxlanılır);
  - tutulan xəta `isAppError(e) && e.status === 415` → `notImage`;
  - digər hər xəta (404, 5xx, şəbəkə) → `unavailable`;
  - 401-i interceptor özü idarə edir (refresh + bir təkrar). Refresh rədd edilsə, ümumi çıxış axını işləyir və nəticə `unavailable` olur.
  - Faylın başındakı şərhə endpoint-i əlavə et.
  Asılılıq: T008.
- [X] T010 [P] `src/features/media/hooks/use-in-view.ts` yarat: `useInView<T extends Element>(rootMargin = '200px'): [RefCallback<T>, boolean]`.
  - `IntersectionObserver` yoxdursa (jsdom/SSR), dərhal `true` qaytarır.
  - Bir dəfə görünən kimi `true` qalır və observer-i ayırır.
  - Yeni dependency yoxdur.
- [X] T011 `src/features/media/hooks/use-media-preview.ts` yarat: `useMediaPreview(id: number | null, { enabled }: { enabled: boolean })` → `useQuery({ queryKey: mediaKeys.preview(id!), queryFn: () => mediaService.preview(id!), enabled: enabled && id != null, staleTime: Infinity, gcTime: 5 * 60_000, retry: false })`. Həmçinin `useObjectUrl(blob?: Blob): string | undefined` export et: `useEffect`-də `createObjectURL`, cleanup-da `revokeObjectURL`. Hər komponentin öz ünvanı olur (research R2). Asılılıq: T009.
- [X] T012 [P] `src/locales/az/media.json` və `src/locales/en/media.json`-a `preview` bölməsini əlavə et ([contracts/ui.md §3](./contracts/ui.md)): `open`, `unavailable`, `close`, `loading`. Dəyərlər cədvəldəki kimidir. `npm run check:i18n` keçməlidir.
- [X] T013 `src/features/media/components/media-lightbox.tsx` yarat: `MediaLightbox({ open, onClose, blob, name })`.
  - Kit `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` (subpath import) istifadə olunur. Başlıq `name`-dir.
  - İçində `<img src={useObjectUrl(blob)} alt={name} className="max-h-[80vh] max-w-full object-contain mx-auto">` olur.
  - Esc, "×" və overlay ilə bağlanma, həmçinin fokusun qayıtması kit davranışıdır.
  - Yalnız semantik rənglər istifadə olunur. Daxili düymə varsa, `type="button"` olur.
  Asılılıq: T011.
- [X] T014 `src/features/media/components/media-preview.tsx` yarat ([contracts/ui.md §1](./contracts/ui.md)): props `mediaId`, `name`, `mimeType`, `size: 'sm' | 'md'` (48/96 px kvadrat), `zoomable = true`. Davranış:
  - `mediaId == null` → `null`.
  - Mime məlumdur və `!isImageMime` → sorğusuz `iconForMime` ikonu.
  - Əks halda `useInView` ref + `useMediaPreview(mediaId, { enabled: inView })`:
    - loading → kit `Skeleton`, `aria-label={t('preview.loading')}`;
    - `image` → `<img src={objectUrl} alt={name ?? \`#${mediaId}\`} className="size-full object-contain">`;
    - `notImage` → `iconForMime(mimeType)` ikonu;
    - `unavailable` → `ImageIcon` + `title`/`aria-label={t('preview.unavailable')}`.
  - Çərçivə: `bg-muted rounded-md border overflow-hidden shrink-0 flex items-center justify-center`.
  - `zoomable` və `image` vəziyyətində çərçivə `<button type="button" aria-label={t('preview.open', { name })}>` olur və `MediaLightbox`-ı açır.
  - SVG yalnız `<img>` ilə göstərilir. `dangerouslySetInnerHTML`, `<object>` və `<iframe>` yoxdur (FR-014).
  Asılılıq: T010, T011, T012, T013.

**Checkpoint**: Əsas hazırdır. `MediaPreview` heç yerə qoşulmayıb, mövcud testlər yaşıl qalmalıdır.

---

## Phase 3: User Story 1 — Formada seçilmiş şəkil (Priority: P1) 🎯 MVP

**Goal**: Şəkil sahəsi olan hər CRUD formasında, yaratma və redaktə rejimində, seçilmiş şəklin önizləməsi görünür. Seçim, dəyişmə və təmizləmə önizləməni saxlamadan yeniləyir. Az/en tablarında hərəsi öz şəklini göstərir.

**Independent Test**: Şəkli olan banner-i redaktə üçün aç → önizləmə görünür. Başqa şəkil seç → dəyişir. "Təmizlə" → yox olur. Şəkilli popup-da az/en tabları fərqli şəkil göstərir. PDF bağlı MEAS sənədində ikon görünür.

### Tests for User Story 1 ⚠️

> Əvvəl yaz və implementasiyadan əvvəl qırmızı olduğunu gör.

- [X] T015 [US1] `src/features/media/media-preview.test.tsx` yarat. `renderApp` + MSW ilə US1 ssenariləri. Marşrutlar və sahə adları mövcud `homepage.test.tsx`, `image-popups.test.tsx`, `meas.test.tsx`-dən götürülür:
  - (a) media id 1 olan homepage qeydini redaktə üçün aç → `findByRole('img', { name: <fixture adı> })`;
  - (b) yeni qeyd → "Seç" → seçicidən şəkil fixture-ı → img görünür;
  - (c) "Dəyiş" ilə id 2 seç → img `alt` yeni ad olur;
  - (d) "Təmizlə" → img yoxdur;
  - (e) image-popup redaktəsində az və en tablarında fərqli `alt`;
  - (f) PDF (id 3) bağlı sahə → `img` yoxdur, fayl adı mətni görünür;
  - (g) mövcud olmayan media id → `preview.unavailable` aria mətni, forma saxlanılır (submit uğurlu).
  Fixture-da lazımi qeyd yoxdursa, `shared/testing/fixtures/*`-ə əlavə et.

### Implementation for User Story 1

- [X] T016 [US1] `src/features/media/components/media-id-field.tsx`-i dəyiş:
  - `pickedMime` state əlavə et. `onPick`-də `item.mimeType`, "Təmizlə"-də `null`.
  - Konteynerin əvvəlinə `value ? <MediaPreview mediaId={Number(value)} name={name} mimeType={pickedMime ?? undefined} size="md" /> : null` qoy.
  - Mövcud `#id · ad` span-ı və düymələr dəyişmir (FR-006).
  - Fayl başındakı şərhi yenilə.
  - `field-control.tsx` və modul konfiqləri **dəyişmir** (research R6). Asılılıq: T014.
- [X] T017 [US1] `src/entities/media/model/types.ts` başındakı "panel önizləmə göstərmir" şərhini yenilə: önizləmə artıq `GET /media/{id}/preview` vasitəsilədir (spec 010).
- [X] T018 [US1] T015 testlərini yaşıla çıxar. `npm run test -- media` və təsir olunan `homepage`, `image-popups`, `meas`, `money-marks`, `organization` testləri keçməlidir.

**Checkpoint**: US1 tam işləyir. MVP olaraq ayrıca demo və deploy oluna bilər.

---

## Phase 4: User Story 2 — Seçərkən və bağlayarkən önizləmə (Priority: P2)

**Goal**: Media seçicidə, qalereya şəkillərində və qeydlərin əlavə faylları siyahısında şəkil faylları ikon əvəzinə önizləmə ilə görünür.

**Independent Test**: Seçicini aç → şəkillər önizləmə ilə, PDF/XLSX ikonla görünür. Qalereyanı redaktə et → sətirlərdə önizləmə var. Səhifəyə bağlanmış şəkil əlavəsi önizləmə ilə görünür.

### Tests for User Story 2 ⚠️

- [X] T019 [US2] `src/features/media/media-preview.test.tsx`-ə US2 bloku əlavə et:
  - (a) seçici dialoqunda şəkil fixture-ları üçün `img`, PDF/XLSX üçün `img` yoxdur;
  - (b) seçici kartına klik seçim edir, lightbox açmır;
  - (c) qalereya redaktəsində bağlanmış şəkillər `img` ilə görünür (`galleries.test.tsx` marşrutu);
  - (d) səhifə/qanun/press-reliz əlavələri siyahısında şəkil əlavəsi `img`, PDF ikon ilə görünür.

### Implementation for User Story 2

- [X] T020 [P] [US2] `src/features/media/components/media-picker-dialog.tsx`: kartdakı `iconForMime` ikonunu `<MediaPreview mediaId={item.id} name={item.originalName} mimeType={item.mimeType} size="md" zoomable={false} />` ilə əvəz et. Kart düyməsinin klik və `disabledIds` davranışı dəyişmir. Başlıq şərhindəki "API URL vermir — mime ikonu" ifadəsini yenilə.
- [X] T021 [P] [US2] `src/features/galleries/components/gallery-images-section.tsx`: sətir ikonunu `<MediaPreview mediaId={image.mediaId} name={image.originalName ?? undefined} size="sm" />` ilə əvəz et. Bu sxemdə mime yoxdur, qərarı server verir.
- [X] T022 [P] [US2] `src/features/assets/components/assets-section.tsx`: `iconForMime(asset.mimeType)` ikonunu `<MediaPreview mediaId={asset.mediaId} name={asset.originalName ?? undefined} mimeType={asset.mimeType} size="sm" />` ilə əvəz et. Bu dəyişiklik pages/laws/press-releases əlavələrini birlikdə əhatə edir. İstifadəsiz qalan import-ları sil.
- [X] T023 [US2] T019 və mövcud `galleries`, `pages`, `laws`, `press-releases`, `media` testlərini yaşıla çıxar. Asılılıq: T020–T022.

**Checkpoint**: US1 və US2 bir-birindən asılı olmadan işləyir.

---

## Phase 5: User Story 3 — Böyük baxış və media kitabxanası (Priority: P3)

**Goal**: Önizləməyə klik şəkli lightbox-da tam ölçüdə açır. Media kitabxanası səhifəsində şəkillər önizləmə ilə görünür.

**Independent Test**: Formada önizləməyə klik et → lightbox açılır. Esc, "×" və fon bağlayır, forma dəyişmir. Media kitabxanasında şəkil kartları önizləmə ilə görünür.

### Tests for User Story 3 ⚠️

- [X] T024 [US3] `src/features/media/media-preview.test.tsx`-ə US3 bloku əlavə et:
  - (a) form sahəsində `button[name=preview.open]` klik → `dialog` görünür və içində `img` var;
  - (b) Esc → dialoq bağlanır, fokus trigger düyməsinə qayıdır;
  - (c) lightbox açılıb-bağlandıqdan sonra forma submit olunmayıb, sahə dəyəri dəyişməyib;
  - (d) `/media-library` səhifəsində şəkil kartlarında `img`, sənədlərdə yoxdur (`media-library.test.tsx` marşrutu).

### Implementation for User Story 3

- [X] T025 [US3] Lightbox-un form daxilində submit etmədiyini və fokusun qayıtdığını təsdiqlə. Lazım gələrsə, `src/features/media/components/media-preview.tsx` və `media-lightbox.tsx`-də `type="button"` və `onOpenChange` axınını düzəlt. Kit-də bug varsa, `node_modules`-da yamaqlama, CLAUDE.md "Kit qaydaları"na görə qeyd et. Asılılıq: T014.
- [X] T026 [P] [US3] `src/features/media/components/media-grid.tsx`: kartdakı mime ikonunu `<MediaPreview mediaId={item.id} name={item.originalName} mimeType={item.mimeType} size="md" />` ilə əvəz et. Başlıq şərhindəki "önizləmə əvəzinə mime ikonu" ifadəsini yenilə.
- [X] T027 [US3] T024 və `media-library.test.tsx`-i yaşıla çıxar.

**Checkpoint**: Bütün user story-lər işləyir.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T028 [P] `product-rest/web-cbar-admin-new/CLAUDE.md`-yə qısa qeyd əlavə et. Məzmun: media önizləməsi `features/media/components/media-preview.tsx`-dədir, mənbə `GET /media/{id}/preview`-dur (blob + query keşi, token URL-də deyil), spec 010-a link. Mövcud mətn qısa qalmalıdır.
- [X] T029 `npm run verify`: lint, check:kit, check:i18n, tsc -b, test, build. Hamısı yaşıl olmalıdır, T001 ilə müqayisədə regressiya olmamalıdır (SC-007).
- [ ] T030 [quickstart.md §2](./quickstart.md) əl ilə yoxlama cədvəlinin 13 addımını icra et: MR 1 test mühitinə çıxandan sonra `npm run local:testcbar` (:5175), və ya lokal stack. Xüsusilə yoxla: Network-də token URL-də olmasın (#12), təkrar endirmə olmasın (#11), inline `<svg>` olmasın (#13). Nəticəni MR 2 təsvirinə yaz.
- [ ] T031 `npm run roundtrip` icra **olunmur**: rich-text editor toxunulmur. MR 2 təsvirində bunu qeyd et.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (T001)**: asılılıq yoxdur.
- **Phase 2**:
  - MR 1 (T002 → T003 → T004) panel kodundan asılı deyil.
  - Panel əsası (T005–T014) MSW ilə MR 1 deploy olunmadan yazıla və test oluna bilər.
  - **Real mühitdə** panel MR 1-dən sonra deploy olunur.
- **Phase 3–5**: T014-dən sonra başlayır. US-lər bir-birindən asılı deyil, ardıcıllıq prioritetə görədir.
- **Phase 6**: istənilən US dəsti bitəndən sonra.

### Task-level

- T005 → T006
- T008 → T009 → T011 → T013 → T014
- T010, T012 → T014
- T014 → T016, T020, T021, T022, T025, T026
- Hər US-in testi (T015/T019/T024) implementasiyadan əvvəl yazılır, yaşıla çıxarma tapşırığı (T018/T023/T027) sonda gəlir.

### User Story Dependencies

- **US1 (P1)**: yalnız Phase 2.
- **US2 (P2)**: yalnız Phase 2. `MediaIdField`-dən asılı deyil.
- **US3 (P3)**: lightbox Phase 2-dədir (T013/T014). Formada yoxlanması US1-in sahəsini istifadə edir. US1 olmadan T024(a–c) seçici xaricindəki istənilən `zoomable` önizləmə ilə, məsələn qalereya sətri ilə yoxlanıla bilər.

### Parallel Opportunities

- Phase 2: T005, T007, T008, T010, T012 bir-birindən asılı deyil. MR 1 (T002–T003) bütün panel işi ilə paralel gedir.
- US2: T020, T021, T022 fərqli fayllardır.
- US3: T026 T025 ilə paralel gedir.
- US2 və US3, T014-dən sonra US1 ilə paralel gedə bilər. Yeganə ortaq fayl test faylıdır (`media-preview.test.tsx`), onu ayrı `describe` bloklarında saxla.

---

## Parallel Example: Phase 2 və US2

```bash
# Phase 2 — eyni anda:
Task: "T002–T003 MediaStorage.GetAsync + MediaController.Preview (api-cbar-admin)"
Task: "T005 fixtures/media.ts — preview baytları"
Task: "T007 setup.ts — createObjectURL polyfill"
Task: "T008 media.keys.ts — preview açarı"
Task: "T010 hooks/use-in-view.ts"
Task: "T012 locales/{az,en}/media.json — preview.*"

# US2 — T014-dən sonra eyni anda:
Task: "T020 media-picker-dialog.tsx"
Task: "T021 gallery-images-section.tsx"
Task: "T022 assets-section.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. T001 → Phase 2 (MR 1 + panel əsası).
2. Phase 3 (US1) → `npm run verify` → quickstart §2 addım 1–6.
3. MR 1 deploy → MR 2 (yalnız US1) deploy. Redaktorlar formalarda şəkli görür.

### Incremental Delivery

1. Əsas + US1 → MVP.
2. US2 (seçici, qalereya, əlavələr) → verify → deploy.
3. US3 (lightbox yoxlaması + kitabxana) → verify → deploy.
4. Hər addım əvvəlkini sındırmır. Bütün dəyişikliklər `MediaPreview`-u əlavə edir, mövcud mətn və düymələr qalır.

---

## Notes

- `field-control.tsx`, `crud-form-page.tsx`, modul konfiqləri, `Cbar.Domain`, migration-lar, `api-cbar` və köhnə `web-cbar-admin` **toxunulmur**.
- Commit/push yalnız istifadəçi istəyəndə edilir. Deploy GitLab-dadır (`test` branch → test mühiti).
- [P] fərqli fayl deməkdir, tamamlanmamış asılılıq yoxdur.

### İcra qeydləri (/speckit-implement, 2026-10-01)

- **T001**: başlanğıcda `tsc -b` qırmızı idi (TS2305 `defineConfig`). Səbəb bu feature deyil: lokal `node_modules/vitest/config.d.ts` özünə istinad edirdi (`export * from 'vitest/config'`). Fayl npm keşindəki `vitest@4.1.11` tarball-ından bərpa olundu (repoya aid deyil). Bundan sonra baseline: 53 fayl / 445 test yaşıl.
- **T005**: PNG fixture əlavə **edilmədi**. Mövcud siyahı saylarına təsir etməsin deyə yalnız id 1/2 üçün SVG baytları (`mediaPreviewBytes`, sətir) var. Server mime-ı `Content-Type`-a yazır, PNG/SVG fərqi panel üçün eynidir.
- **T007**: `createObjectURL`/`revokeObjectURL` **şərtsiz** əvəzlənir: Node-un native versiyası jsdom `Blob`-unu rədd edir. Qlobal IO polyfill-i (kit/floating-ui üçün) saxlanılıb. Lazy-load testləri `shared/testing/in-view#mockAllInView` ilə yalnız lazım olan faylda IO-nu "görünür" edir.
- **T011/T013**: `useObjectUrl` əvəzinə `useBlobImageRef` + `PreviewImage`. Lightbox `open/onClose` deyil, `DialogTrigger asChild` ilə açılır, çünki kit fokusu yalnız öz trigger-inə qaytarır (T025). `preview.close` açarı yoxdur: kit "×"-in öz etiketi var (contracts/ui.md §3 yeniləndi).
- **T014**: mime ikonu `createElement(iconForMime(...))` ilə render olunur (`react-hooks/static-components` lint qaydası).
- **T029**: `npm run verify` yaşıl. 54 fayl / 454 test (+1 fayl, +9 test), build OK.
- **T004, T030, T031** açıq qalır: API-nin build/curl yoxlaması (lokalda .NET SDK yoxdur), test mühitində əl ilə yoxlama və MR təsvirindəki qeyd MR-lar açılanda edilir.
