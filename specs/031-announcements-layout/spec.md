# Feature Specification: Elanlar — Figma-dakı şəkilsiz kart və detal

**Feature Branch**: `031-announcements-layout`

**Created**: 2026-11-03

**Status**: Draft

**Input**: Spec 029 (Clarifications, 2026-11-02) "Elanlar (`type=2`) eyni şablonu alır" deyib: Elanlar
siyahısı xəbər kartı (`card / press-release` `1048:20711`, şəkil 312×197) ilə, detal isə örtük +
fotoqalereya ilə render olunur. Figma-da isə Elanlar fərqlidir:

- **Siyahı** `Media - Elanlar` `1048:21679` → kart `1048:23221`: **312×96, yalnız tarix + başlıq**,
  şəkil qutusu yoxdur. Tablet `1658:17103` 2×320 (kart 120 hündür, padding 16, radius 4, stroke
  gizli); mobil `1658:17608` 1×342, eyni kart. Filtr, paginasiya və H1 xəbərlərlə eynidir.
- **Detal** `Media - Elanlar -Elan` `1298:20343`: başlıq → (şəkil frame-i `1298:20356`
  **`visible:false`**) → tarix → mətn. Qalereya yoxdur.
- Ana səhifədə "Elanlar" (`3173:361585`) yalnız tab etiketidir, ayrıca kart dizaynı yoxdur.

Elanlar ayrıca entity deyil — `press_releases.type = 2`; şəkil sahə deyil, qoşmaların ilk `image/*`-i
(029 FR-010, 030). Deməli dəyişiklik yalnız render + redaktor izahıdır; sxem və API toxunulmur.

**Hazırkı vəziyyət** (2026-11-03): `/press-releases?type=2` xəbər kartları ilə çıxır (şəkilsiz elanlarda
boz placeholder qutusu); elan detalında şəkil qoşması varsa örtük/qalereya göstərilir; admin paneldə
elanın qoşma bölməsi "Örtük"/"Qalereya" nişanları və xəbər izahı ilə gəlir.

**İstifadəçi qərarları (2026-11-03)**: Figma-ya uyğun — Elanlar şəkilsizdir (siyahı və detal); şəkil
qoşmaları itməsin deyə detalda **qoşma siyahısında** (yüklənə bilən fayl kimi) qalır; API dəyişmir; ana
səhifə Elanlar tabı dəyişmir; yeni spec 031 (029-un "eyni şablon" qərarını əvəz edir).

**Əhatə olunan proyektlər** (Konstitusiya Maddə II — hər biri ayrıca MR):

- `web-cbar-new`: əsas iş — siyahı kartının mətn variantı, detalda örtük/qalereyanın söndürülməsi.
- `web-cbar-admin-new`: elan redaktəsində nişanlar götürülür, bölmə izahı dəyişir; sıralama qalır.
- `api-cbar`, `api-cbar-admin`: **dəyişmir** — `imageUrl` type 2 üçün də hesablanır, sayt istifadə etmir.
- **Sxem dəyişmir.**

**Deploy sırası**: asılılıq yoxdur (iki müstəqil frontend MR-ı).

**`product-host` istinadı (Konstitusiya Maddə I.2)**:

| Köhnə | Nə edir |
|---|---|
| `visitor/controllers/PressReleasesController.php` `actionIndex` (`type=2`) | Elanlar xəbərlərlə eyni siyahı şablonunda idi; şəkil göstərilmirdi, çünki elanlarda şəkil yüklənmirdi |
| `actionDetail` | Elan detalı: başlıq, tarix, mətn, qoşmalar; ilk şəkil böyük göstərilirdi (varsa) |

Yeni stack Figma-nı izləyir: elanlarda şəkil heç bir halda göstərilmir, qoşma kimi qalır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi Elanlar siyahısını mətn kartları ilə görür (Priority: P1)

Ziyarətçi Media menyusundan "Elanlar"ı açır. Breadcrumb, H1, filtr və paginasiya xəbərlərlə eynidir,
amma hər kart yalnız tarix (`dd.mm.yyyy`) və başlıqdır — şəkil qutusu və boz placeholder yoxdur.
Desktop-da 3 sütun × 312, aralıq 24; tablet 2 × 320, mobil 1 × 342; `desk`-dən aşağı kartın 16px
daxili boşluğu və 4px radiusu var. Bütün kart bir linkdir (başlıq adını verir).

**Why this priority**: Figma-dakı yeganə görünən fərq; test mühitində 23 elan var və hamısı şəkilsiz
boz qutu ilə çıxır.

**Independent Test**: MSW ilə `type=2` siyahısı (fikstürdə bir elanın `imageUrl`-i var) → kartlarda
`<img>` yoxdur, link + tarix var; `type=1` davranışı dəyişmir (şəkilsiz xəbərdə boz qutu qalır).

**Acceptance Scenarios**:

1. **Given** `/az/press-releases?type=2`, **When** səhifə açılır, **Then** hər kart link + tarix +
   başlıqdır, heç bir kartda `<img>` və şəkil qutusu yoxdur — API `imageUrl` göndərsə də.
2. **Given** `/az/press-releases` (xəbərlər), **Then** kartlar 029 §2.1 kimidir (şəkil qutusu, şəkilsizdə
   boz placeholder).
3. **Given** 1728 en, **Then** kart 312 en, tarix → başlıq 16, sütun arası 24; 744 və 390-da kart
   padding 16 (±2px).

### User Story 2 — Elan detalında örtük və qalereya yoxdur, fayllar qoşmadadır (Priority: P1)

Ziyarətçi elanı açır: başlıq, tarix, mətn, qoşmalar. Elana şəkil bağlanıbsa belə örtük və fotoqalereya
göstərilmir; şəkil fayl sətri kimi (ikon + ad + ölçü) qoşma siyahısındadır, API sırası ilə.

**Independent Test**: MSW-də 1 şəkil + 1 PDF-li elan → `press-release-cover` yoxdur, "Fotoqalereya"
bölgəsi yoxdur, qoşmalar siyahısında 2 link (`/media/{id}`) API sırası ilə; xəbər detalı dəyişmir.

**Acceptance Scenarios**:

1. **Given** şəkil + PDF qoşmalı elan, **When** detal açılır, **Then** örtük və qalereya yoxdur; qoşma
   siyahısında şəkil və PDF fayl sətri kimidir.
2. **Given** 5 şəkilli xəbər (029 fikstürü), **Then** örtük + 4 miniatürlü qalereya + PDF — dəyişməyib.
3. **Given** tək şəkilli xəbər, **Then** yalnız örtük, qalereya yoxdur, qoşma bölməsi yoxdur.

### User Story 3 — Redaktor elanın qoşmalarında nişan görmür, izah elana uyğundur (Priority: P2)

Redaktor elanı (`type` 2) redaktə edir: "Şəkillər və sənədlər" bölməsində "Örtük"/"Qalereya" nişanları
yoxdur; izah "Elanlarda şəkil göstərilmir; bütün fayllar saytda qoşma siyahısı kimi görünür. Sıranı
oxlarla dəyişin." Sıralama düymələri qalır (saytdakı qoşma sırasını idarə edir). Xəbərdə 030 davranışı
dəyişmir.

**Independent Test**: MSW-də şəkil + PDF-li elan redaktəsi → nişan yoxdur, elan izahı var, "yuxarı"
düyməsi aktivdir; xəbərdə (3 şəkil + PDF) nişanlar və xəbər izahı qalır.

### Edge Cases

- Elanın `imageUrl`-i var (API hesablayır) → siyahı kartı onu oxumur; sxem dəyişmir.
- Elanda yalnız şəkil qoşmaları var (PDF yox) → qoşma bölməsi şəkil fayl sətirləri ilə göstərilir
  (miniatür zolağı yox).
- Redaktor elanı xəbərə çevirir (`type` 1) → eyni qoşmalar növbəti yükləmədə örtük/qalereya olur;
  paneldə nişanlar refetch-dən sonra görünür.
- 029-dan əvvəlki API (`type` yoxdur) → xəbər sayılır, 029 davranışı.

## Requirements *(mandatory)*

### Functional Requirements

**Sayt (`web-cbar-new`)**

- **FR-001**: `NewsGrid` `variant: 'photo' | 'text'` (defolt `photo`). `text`: şəkil qutusu render
  olunmur (`imageUrl` nəzərə alınmır), kart `flex-col gap-4`; `desk`-dən aşağı `p-4 rounded-xs` (kit
  `rounded-xs` = 4px); desktop-da padding yoxdur. Tarix 16/600 lh28 `text-muted-foreground`, başlıq
  20/600 lh28 `text-foreground`, hover `text-primary`. `data-variant` atributu testlər üçün.
- **FR-002**: `PressReleasesView` `data.type === '2'` → `variant="text"`, əks halda `photo`. Loader,
  filtr, paginasiya, H1 dəyişmir.
- **FR-003**: `splitPressReleaseAssets(assets, { photos })` — `photos: false` → `cover: null,
  gallery: [], attachments: assets` (API sırası). Detal loader-i `release.type !== '2'` ötürür.
- **FR-004**: `Attachments` opsional `imagesAsFiles` prop-u: şəkil faylları miniatür zolağı əvəzinə adi
  fayl sətri kimi siyahıya düşür. `PressReleaseView` elanda `imagesAsFiles` verir. Defolt davranış
  (about, digər səhifələr) dəyişmir.
- **FR-005**: Testlər funksional, mövcud fikstürlərlə: siyahı (type=2 `img` yoxdur, type=1 dəyişmir),
  detal (elan: örtük/qalereya yox, şəkil qoşma linki; tək şəkilli xəbər: yalnız örtük), `split-assets`
  yeni parametr.
- **FR-006**: `CLAUDE.md` §3 Media bəndinə Elanlar qeydi.

**Admin panel (`web-cbar-admin-new`)**

- **FR-010**: `PressReleaseAttachmentsSection` `detail.type === 2` olanda `badgeFor` ötürmür,
  `descriptionKey` `pressReleases:attachments.descriptionAnnouncement`; `reorderable` qalır.
- **FR-011**: `locales/{az,en}/pressReleases.json` `attachments.descriptionAnnouncement`; `check:i18n`
  açar bərabərliyi.
- **FR-012**: Funksional test: elan redaktəsində nişan yoxdur + elan izahı + sıralama düyməsi aktiv;
  xəbərdə 030 testləri dəyişmədən keçir. Fikstürdə bir elanda şəkil + PDF.

**API-lər və sxem**

- **FR-020**: `api-cbar`, `api-cbar-admin` kod dəyişmir; `imageUrl` type 2 üçün də hesablanır.
  OpenAPI-yə toxunulmur.

### Key Entities

- **PressRelease** (`press_releases.type`: 1 Xəbər, 2 Elan) — render qərarı yalnız bu sahəyə baxır.
- **MediaAsset / AttachedAsset** — dəyişmir.

## Success Criteria *(mandatory)*

- **SC-001**: `/az/press-releases?type=2` 1728/744/390-da Figma `1048:23221` / `1658:17103` /
  `1658:17608` ilə ±2px (kart eni, tarix → başlıq 16, sütun arası 24, tablet/mobil padding 16) —
  `visual-diff.md`.
- **SC-002**: Elan detalında (şəkilli elan varsa) `press-release-cover` və "Fotoqalereya" yoxdur; şəkil
  qoşma siyahısındadır. Xəbər detalı 029 `visual-diff.md` ölçülərini saxlayır.
- **SC-003**: `web-cbar-new` və `web-cbar-admin-new` `npm run verify` yaşıl (Node 24, testlər Node 22-də də).
- **SC-004**: Qanunlar (laws) və xəbər qoşma testləri dəyişmədən keçir.

## Əhatədən kənar

- Ana səhifə "Elanlar" tabı (Figma-da elan kartı yoxdur).
- API-də `imageUrl`-in type 2 üçün söndürülməsi (lazımsız sorğu yükü deyil — eyni sorğudadır).
- Elanlar üçün ayrıca route və ya entity.
- Alternativ qərar (detalda örtüyü saxlamaq, gizli frame "opsional" sayılsın) — istifadəçi istəsə
  yalnız FR-003/FR-004 geri alınır, siyahı kartı + admin izahı qalır.

## Assumptions

- Figma-da gizli frame (`visible:false`) "göstərilmir" deməkdir, "opsional" yox (istifadəçi qərarı).
- Elanlarda şəkil qoşması nadirdir; olanda yüklənə bilən fayl kimi qalması məlumat itkisinin qarşısını alır.
- Kit `rounded-xs` 4px-dir (024 tapıntısı).
