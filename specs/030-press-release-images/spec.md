# Feature Specification: Xəbər şəkilləri — sıralama, örtük və fotoqalereya (admin)

**Feature Branch**: `030-press-release-images`

**Created**: 2026-11-03

**Status**: Draft

**Input**: Spec 029 xəbər detalını Figma `1298:18943` üzrə qurub: ilk şəkil qoşması = örtük
(984×502), qalan şəkil qoşmaları = alt fotoqalereya (`widgets/photo-gallery`, Figma `1652:36210`),
PDF və digər fayllar = qoşma siyahısı. Sayt tərəfi hazırdır və testlidir, amma fotoqalereya real
həyatda heç vaxt görünməyib, çünki redaktorun onu yaratmaq üçün aləti yoxdur.

**Hazırkı vəziyyət** (2026-11-03):

1. Admin paneldə xəbərin "Sənədlər" bölməsi (`features/assets/components/assets-section.tsx`) yalnız
   bağla / ayır edir — **sıralama yoxdur**; redaktor hansı şəklin örtük, hansının qalereya olduğunu
   görmür; "Sənəd" adı şəkil əlavə etməyə işarə etmir.
2. Admin API-də `press-releases/{id}/assets` üçün **order endpoint-i yoxdur** (qalereyalarda
   `PUT galleries/{id}/images/order` var — hazır nümunə).
3. Test mühitində heç bir xəbərin 1-dən çox şəkli yoxdur → `specs/029-media-news/visual-diff.md`
   qalereyanı "ölçülməyib" qeyd edib.

**İstifadəçi qərarları (2026-11-03)**: şəkillər **qoşma olaraq qalır** (ayrıca "şəkil" sahəsi və ya
cədvəl yaranmır; `press_release_assets.sort_order` artıq var); **yeni spec 030**, 029-a toxunulmur
(yalnız onun `visual-diff.md`-sinə faktiki ölçmə yazılır).

**Əhatə olunan proyektlər** (Konstitusiya Maddə II — hər biri ayrıca MR):

- `api-cbar-admin`: 1 yeni endpoint `PUT /api/v1/press-releases/{id}/assets/order` (spec-first).
- `web-cbar-admin-new`: xəbər redaktəsində qoşma bölməsi — sıralama düymələri, "Örtük"/"Qalereya"
  nişanları, bölmənin adı və izahı.
- `web-cbar-new`: **kod dəyişmir**; real çoxşəkilli xəbərdə fotoqalereya Figma ilə ölçülür.
- `api-cbar`: **dəyişmir** — detal `assets` artıq `SortOrder, Id` sırası ilə gəlir.
- **Sxem dəyişmir**: migration, entity, `Cbar.Domain` dəyişikliyi yoxdur.

**Deploy sırası**: `api-cbar-admin` (yeni endpoint, geriyə uyğun) → `web-cbar-admin-new`. Sıra
pozulsa panel sıralama düyməsində 404 göstərir, başqa heç nə qırılmır.

**`product-host` istinadı (Konstitusiya Maddə I.2)**:

| Köhnə | Nə edir |
|---|---|
| `admin/.../PressReleases` forması (029 cədvəli) | Şəkillər də qoşma kimi yüklənirdi; sıra yükləmə ardıcıllığı idi, dəyişdirmək mümkün deyildi |
| `visitor/controllers/PressReleasesController.php` `actionDetail` | Detalda ilk şəkil böyük, qalanı sadə siyahı |

Köhnə saytda da "örtük = ilk şəkil" qaydası var idi, amma redaktor sıranı idarə edə bilmirdi. Yeni
stack sıranı açıq edir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Redaktor şəkilləri sıralayır və hansının örtük / qalereya olduğunu görür (Priority: P1)

Redaktor xəbərin redaktə səhifəsində "Şəkillər və sənədlər" bölməsini açır. Hər şəkil qoşmasının
yanında nişan var: ilk şəkildə "Örtük", qalan şəkillərdə "Qalereya"; PDF və digər fayllarda nişan
yoxdur. Hər sətirdə "yuxarı" / "aşağı" düymələri var; klik sıranı dəyişir, bölmə yenidən yüklənir və
nişanlar yeni sıraya görə yerini dəyişir.

**Why this priority**: Saytın fotoqalereyası yalnız bu alətlə doldurula bilər; nişansız redaktor
saytda nə görünəcəyini təxmin etməli olur.

**Independent Test**: MSW ilə 3 şəkil + 1 PDF olan xəbəri açmaq, 2-ci şəklin "yuxarı" düyməsinə
basmaq → `PUT …/assets/order` gövdəsində tam `mediaIds` siyahısı yeni sıra ilə; refetch-dən sonra
"Örtük" nişanı həmin şəklə keçir.

**Acceptance Scenarios**:

1. **Given** 3 şəkil + 1 PDF bağlı xəbər, **When** redaktə səhifəsi açılır, **Then** 1-ci şəkildə
   "Örtük", 2–3-cü şəkillərdə "Qalereya", PDF-də nişan yoxdur.
2. **Given** eyni xəbər, **When** 2-ci şəklin "yuxarı" düyməsinə klik, **Then** API-yə tam sıra
   göndərilir (204), "Sıra yeniləndi" bildirişi çıxır, siyahı yeni sıradadır, "Örtük" 2-ci şəklə
   keçib.
3. **Given** eyni xəbər, **Then** ilk sətirin "yuxarı" və son sətirin "aşağı" düyməsi deaktivdir;
   sorğu gedərkən bütün sıralama düymələri deaktivdir.
4. **Given** API sıranı rədd edir (400 `message`), **When** klik, **Then** mesaj bölmənin içində
   `Alert` kimi görünür, siyahı dəyişmir.
5. **Given** qanun (laws) redaktəsi, **Then** sənəd bölməsində sıralama düymələri və nişanlar
   **yoxdur** (reqressiya — ortaq komponent genişlənir, davranış dəyişmir).

### User Story 2 — Redaktor bir neçə şəkli ardıcıl əlavə edir (Priority: P2)

Redaktor "Sənəd əlavə et" ilə kitabxanadan ardıcıl bir neçə şəkil seçir; hər biri siyahının sonuna
əlavə olunur (`sort_order` = max + 1, mövcud davranış). Bölmənin başlığı "Şəkillər və sənədlər",
izahı "İlk şəkil saytda örtük, qalan şəkillər fotoqalereyadır; fayllar siyahı kimi görünür" —
redaktora şəkil əlavə etməyin mümkün və mənalı olduğunu deyir.

**Why this priority**: Mövcud bağla axını işləyir; dəyişiklik yalnız mətn və niyyətin aydınlığıdır.

**Independent Test**: Redaktə səhifəsində bölmənin başlığı və izahı yeni mətndədir; əlavə edilən
şəkil siyahının sonunda "Qalereya" nişanı ilə görünür.

**Acceptance Scenarios**:

1. **Given** 1 şəkli olan xəbər, **When** kitabxanadan ikinci şəkil seçilir, **Then** siyahının sonuna
   düşür və "Qalereya" nişanı alır; birinci "Örtük" olaraq qalır.
2. **Given** şəkilsiz, 1 PDF-li xəbər, **When** şəkil əlavə olunur, **Then** PDF-dən sonra gəlir, amma
   şəkillər arasında birinci olduğu üçün "Örtük" nişanı alır (sayt da ilk **şəkli** örtük götürür,
   mövqeyindən asılı olmayaraq).

### User Story 3 — Saytda fotoqalereya real datada Figma ilə ölçülür (Priority: P2)

Admin API deploy olunandan sonra test mühitində bir xəbərə 4–5 şəkil bağlanıb sıralanır; sayt
(`local:testcbar`, :3002) detalda örtük + fotoqalereya göstərir; 1728/744/390 enlərində
`getBoundingClientRect` ilə Figma `1652:36210` dəyərləri yoxlanır və nəticə
`specs/029-media-news/visual-diff.md`-dəki "ölçülməyib" abzasını əvəz edir.

**Why this priority**: 029-un yeganə ölçülməmiş bloku; kod dəyişikliyi gözlənilmir, amma fərq > 2px
çıxarsa 030 task-ı kimi düzəlir.

**Independent Test**: `visual-diff.md`-də qalereya cədvəli dolub; hər sətirdə Figma və sayt dəyəri,
fərq ≤ 2px (və ya qəbul edilmiş fərqlər cədvəlində səbəbi ilə).

**Acceptance Scenarios**:

1. **Given** 4 şəkil + 1 PDF bağlı dərc olunmuş xəbər, **When** `/az/press-releases/{slug}` açılır,
   **Then** örtük 1-ci şəkildir, slider-də 3 miniatür var, PDF qoşmalar siyahısındadır.
2. **Given** eyni xəbər, **When** `curl …/api/v1/press-releases/{slug}`, **Then** `assets` sırası
   admin paneldəki sıra ilə eynidir.
3. **Given** 1728 en, **Then** böyük şəkil 984×601, miniatür 180×124, miniatürlər arası 24, oxlar
   44×44, böyük şəkil → zolaq 48, mətn → qalereya 36 (±2px).

### Edge Cases

- `mediaIds` natamamdır, artıq id var və ya yad (bağlı olmayan) id var → 400 `message`, heç nə
  dəyişmir (atomik).
- `mediaIds` eyni dəst, eyni sıra → 204, `sort_order` yenidən 1..n yazılır (idempotent).
- Xəbər yoxdur və ya soft-delete olunub → 404.
- Bağlı media sətri silinib (`AssetRef` media sahələri null) → nişan yoxdur (mime bilinmir), sıralama
  işləyir.
- Eyni anda iki redaktor: sonuncu PUT qalib gəlir; `audit_log` hər ikisini `before`/`after` ilə
  saxlayır.
- Şəkil olmayan qoşmalar şəkillərdən əvvəl dayana bilər — sayt ilk **şəkli** örtük götürür, panelin
  nişanı eyni qaydanı tətbiq edir (mövqe yox, "şəkillər arasında birinci").

## Requirements *(mandatory)*

### Functional Requirements

**Admin API (`api-cbar-admin`)**

- **FR-001**: `PUT /api/v1/press-releases/{id}/assets/order`, gövdə `{ "mediaIds": [int64…] }`,
  icazə `press_releases.update`. `mediaIds` xəbərin bağlı media id-lərinin **tam dəsti** olmalıdır
  (hər biri bir dəfə); `sort_order` siyahı sırası ilə 1, 2, 3… yazılır → 204.
- **FR-002**: Dəst uyğun gəlmirsə (azdır, artıqdır, təkrar və ya yad id) → 400 `problem+json`,
  `message: "mediaIds must contain exactly the press release's attached media ids."` Xəbər yoxdursa
  → 404.
- **FR-003**: Hər uğurlu sıralama `audit_log`-a `press_releases.reorder_assets` kimi yazılır
  (`before`: köhnə `mediaIds` sırası, `after`: gövdə).
- **FR-004**: Endpoint spec-first-dir: `openapi/` əvvəl (`PressReleaseAssetOrder` sxemi,
  `assetsOrder` path-i), lint + bundle, sonra controller; `route-diff.mjs` fərqsiz.
- **FR-005**: `POST …/assets` (sona əlavə, `max+1`) və `DELETE …/assets/{mediaId}` dəyişmir.

**Admin panel (`web-cbar-admin-new`)**

- **FR-010**: Xəbər redaktəsində qoşma bölməsinin başlığı "Şəkillər və sənədlər", izahı "İlk şəkil
  saytda örtük, qalan şəkillər fotoqalereyadır; fayllar siyahı kimi görünür" (az/en).
- **FR-011**: Hər sətirdə "yuxarı"/"aşağı" `IconButton`-ları (kit `ArrowUpIcon`/`ArrowDownIcon`);
  ilk sətirin "yuxarı", son sətirin "aşağı" düyməsi deaktiv; sorğu gedərkən hamısı deaktiv.
- **FR-012**: Klik indeks dəyişimi edib **tam** `mediaIds` siyahısını `PUT {assetsPath}/order`-ə
  göndərir; uğurda detail invalidasiya olunur (siyahı serverdən gəlir), "Sıra yeniləndi" toast-u;
  xətada API `message`-i (yoxdursa "Sıra yenilənmədi") bölmə içində `Alert`.
- **FR-013**: Nişan: `isImageMime` olan qoşmalar arasında birinci → "Örtük", digər şəkillər →
  "Qalereya", şəkil olmayanlar → nişansız. Kit `Badge` (`size="sm" variant="subtle"`).
- **FR-014**: Ortaq `AssetsSection` **opsional** `reorderable`, `badgeFor`, `descriptionKey`
  prop-ları ilə genişlənir; defolt davranış dəyişmir — qanunlar (laws) bölməsi əvvəlki kimi qalır.
- **FR-015**: Siyahının `aria-label`-i bölmənin başlığıdır (nişan və düymələr rolla tapılır).
- **FR-016**: MSW handler `PUT /press-releases/:id/assets/order` real kontraktı təkrarlayır (dəst
  yoxlaması → 400 `message`; `assets` yenidən sıralanır → 204); fikstürdə bir xəbərdə 3 şəkil + 1 PDF.
- **FR-017**: Kod şərhləri ingiliscə; toxunulan fayllarda azərbaycanca şərhlər çevrilir.

**Sayt (`web-cbar-new`) və public API (`api-cbar`)**

- **FR-020**: Kod dəyişmir. Detal `assets` sırası `SortOrder, Id`-dir (029 FR); örtük = ilk şəkil,
  qalereya = qalan şəkillər, qoşmalar = qalanı.
- **FR-021**: Real çoxşəkilli xəbərdə fotoqalereya 1728/744/390-da ölçülür; nəticə
  `specs/029-media-news/visual-diff.md`-də cədvəl kimi; fərq > 2px → bu spec-in tasks-ına düzəliş
  task-ı.

**Ümumi**

- **FR-030**: Sxem dəyişmir — `press_release_assets.sort_order` mövcuddur; migration yoxdur.

### Key Entities

- **PressReleaseAsset** (`press_release_assets`): `PressReleaseId`, `MediaId`, `SortOrder` —
  sıralama yalnız `SortOrder`-i yenidən yazır.
- **AttachedAsset** (panel): `mediaId`, `originalName`, `mimeType`, `sizeBytes` — nişan `mimeType`-dan.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor 4 şəkilli xəbərdə örtüyü 3 klikdən çox olmadan dəyişə bilir (hər klik bir
  sıra addımıdır) və nəticəni nişandan dərhal görür.
- **SC-002**: Test mühitində ən azı bir xəbərin saytda görünən fotoqalereyası var (029-dan bəri
  birinci) və `visual-diff.md`-də ölçülüb.
- **SC-003**: `curl` ilə public detal `assets` sırası admin paneldəki sıra ilə 100% eynidir.
- **SC-004**: Qanunlar bölməsi testləri dəyişmədən keçir (sıralama düyməsi görünmür).
- **SC-005**: `api-cbar-admin` build 0 xəta, OpenAPI lint/bundle təmiz, route-diff fərqsiz;
  `web-cbar-admin-new` `npm run verify` yaşıl (Node 24 və 22).

## Əhatədən kənar

- Drag-and-drop sıralama (kitdə DnD yoxdur; oxlar kifayətdir).
- Ayrıca "örtük" sahəsi və ya "şəkil / sənəd" tipli qoşma növü (istifadəçi qərarı: qoşma qalır).
- Qanunlar və digər bölmələrdə sıralama (prop var, açılmır).
- Saytda lightbox, qalereya üçün başlıq/alt yazı.
- Çoxlu faylı bir dəfəyə seçmək (media seçici tək seçimlidir).

## Assumptions

- `press_releases.update` icazəsi olan redaktor sıralama edə bilər (bağla/ayır ilə eyni).
- `api-cbar` detalı `OrderBy(SortOrder).ThenBy(Id)` ilə gəlir (029-da yoxlanıb) — dəyişmir.
- Kit `Badge` subpath-i (`@cbar/lib-react-ui-kit/badge`) mövcuddur və paneldə artıq işlənir.
- Media seçicisi artıq bağlı faylları söndürür, ona görə eyni şəkli iki dəfə bağlamaq mümkün deyil
  (API 409 da qaytarır).
