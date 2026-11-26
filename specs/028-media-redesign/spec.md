# Feature Specification: "Media" bölməsinin giriş səhifəsi və ümumi şablonu (Figma)

**Feature Branch**: `028-media-redesign`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "web-cbar-new-də Media səhifəsini Figma-ya uyğun yenidən hazırlamaq;
admin panel və API tərəfdə lazım olan dəyişiklikləri də planlamaq." İstifadəçi qərarı
(2026-11-02): **əhatə A** — yalnız Media giriş səhifəsi (landing) və bölmənin ümumi şablonu
(breadcrumb, paylaşma, sol alt-bölmə menyusu), üç breakpoint. Alt bölmələrin (Xəbərlər, Elanlar,
Müsahibələr və çıxışlar, Tədbirlər, Qalereya, Media sorğuları, KSM, Yayım qrafiki, Loqo) Figma
dizaynları **sonrakı spec-lərdir**.

**Mənbə dizayn**: Figma faylı "cbar website (Copy)", səhifə "Media" (`1045:17243`), section
"Media" (`1650:36209`):

| Səhifə | Desktop 1728 | Tablet 744 | Mobil 390 |
|---|---|---|---|
| Media (giriş) | `1045:17244` | `1658:12660` | `1658:13179` |

Komponentlər: `subcategories / Media` `1559:62331` (mobil `1714:30068`), `breadcrumb`
`1298:18812`, `social links` `1045:17247`, `content` `1045:17249` (başlıq `1045:17251`, mətn
`1083:26758`). Tablet frame-in blokları: `Page context` `1658:12852`, `Section navigation`
`1658:12886`, `Content` `1658:12912`. Mobil: `Content` `1658:13251` (`Page tools` `1658:13252`).

Eyni Figma səhifəsindəki digər section-lar (`Xəbərlər` `1333:30585`, `Elanlar` `1333:30586`,
`Müsahibələr və çıxışlar` `1333:30587`, `Tədbirlər` `2293:2349` / gizli `1643:29160`, `Qalereya`
`1647:35084`, `Media sorğuları` `1647:35649`, `Korporativ sosial məsuliyyət` `1675:56713`,
`Məlumatların yayımlanması qrafiki` `1713:29376`, `Mərkəzi Bankın loqosu` `2138:119629`,
`Bölmə filtri — çox kateqoriya olduqda` `2323:124130`, `Menyu (overlay)` `2522:44936`) **əhatəyə
daxil deyil**.

**Əhatə olunan proyektlər**:

- `web-cbar-new`: Media giriş səhifəsi, bölmənin ümumi şablonu, qalereya/video siyahılarının
  öz ünvanlarına köçməsi.
- `api-cbar`, `api-cbar-admin`, `web-cbar-admin-new`: **dəyişmir**. Menyu və giriş mətni artıq
  CMS səhifə ağacından və CMS səhifəsindən gəlir. Yeni API sahəsi, məzmun tipi, migration yoxdur.
  Figma-dakı menyu adları redaktor işidir (bax "Redaktor tapşırıqları").

**Asılılıq**: spec 022 (shell, 1320 konteyner, DM Sans, 390/744/1728), spec 024 (ümumi şablon
`widgets/about-shell` — bu spec onu bölmə-agnostik edir). 022 "About us və Media Figma
səhifələrini" öz əhatəsindən çıxarmışdı.

**`product-host` istinadı (Konstitusiya Maddə I.2)**: bu feature aşağıdakıların görünüşünü əvəz edir.

| Köhnə | Nə edir |
|---|---|
| `visitor/controllers/PagesController.php` `actionIndex` (səhifə 77 "Media") | Media giriş səhifəsi: sol ağac + giriş mətni |
| `visitor/modules/gallery/controllers/PhotosController.php` `actionIndex` | Fotoqalereya siyahısı (`/gallery/photos`) |
| `visitor/controllers/VideosController.php` `actionIndex` | Video siyahısı (`/videos`) |

**Hazırkı vəziyyət (test mühitindən ölçülüb, 2026-11-02)**:

- CMS ağacında "Media" kökü: **id 77, slug `media` (az və en eyni)**, giriş mətni 952 (az) /
  778 (en) simvol — Figma `1083:26758`-dəki mətn məhz budur. 9 uşaq: `press-relizler`
  (`navUrl /press-releases?type=1`), `elanlar` (`/press-releases?type=2`),
  `teqdimat-ve-meruzeler` (boş), `korporativ-sosial-mesuliyyet`, `fotoqalereya`
  (`/media#galleries`), `videoqalereya` (`/media#videos`), `tedbirler` (6 uşaq),
  `informasiya-sorgusu`, `inzibati-islere-baxan-vezifeli-sexsler`. Həmçinin redaktor surəti
  "Media (Kopya)" (`media-copy`, 9 uşaq) kökün uşağıdır.
- `/{locale}/media` statik route-dur: `PageTitle` + lövbər düymələri + canlı yayım kartı +
  qalereya grid-i (10) + video grid-i (10). Breadcrumb, paylaşma, sol menyu yoxdur. CMS giriş
  mətni heç vaxt göstərilmir — statik route CMS səhifəsini kölgələyir.
- Media ağacının digər CMS səhifələri (KSM, Tədbirlər, …) spec 002-nin ümumi görünüşü ilə
  (köhnə sol ağac, mavi başlıq zolağı) render olunur.
- `/media#galleries` tipli `navUrl` heç vaxt "cari" ola bilmir (hash ünvan uyğunlaşmır), ona
  görə sol menyuda Fotoqalereya/Videoqalereya aktiv göstərilə bilməz.
- Bare `/media` (locale-siz) `az`-a yönləndirilmir: proxy matcher-i `/media/{id}` fayl proxy-si
  üçün bütün `media…` yollarını kənarda saxlayır.
- Spec 024-ün şablonu Figma Media frame-ləri ilə **eyni ölçülərdədir** (alətlər sırası 100,
  menyu 312 + 24 + məzmun 984, menyu p20 r4 `#F5F5F5`, link 16/600 lh28, H1 32/600 lh44, mətn
  16/400 lh28, başlıq–mətn 36; tablet px40, menyu 664, pb32; mobil px24, menyu 342, pt16 pb64).
  Yeni şablon yazılmır, mövcudu ümumiləşir.

## Clarifications

### Session 2026-11-02

- Q: Əhatə — yalnız giriş səhifəsi, mövcud entity-li alt bölmələr də, yoxsa bütün 9 alt bölmə?
  → A: **Yalnız giriş səhifəsi + bölmənin ümumi şablonu (A).** Alt bölmələr sonrakı spec-lərdir.
- Q: Responsive? → A: Desktop 1728, tablet 744, mobil 390 — üçü də.
- Q: Format? → A: spec-kit (`specs/028-media-redesign/`), 024 şablonu üzrə.
- Q: `/media`-da bu gün olan qalereya/video/canlı yayım grid-ləri hara gedir? → A: **İtmir**
  (Maddə I.3). Mövcud kartlar olduğu kimi öz siyahı ünvanlarına köçür: `/{locale}/media/galleries`
  və `/{locale}/media/videos` (canlı yayım bloku videoların başında). Giriş səhifəsi Figma-dakı
  kimi yalnız başlıq + giriş mətni olur. Qalereya/video siyahılarının Figma dizaynı (`Qalereya`
  section-u) sonrakı spec-dir — bu spec-də onlar yalnız yeni şablona salınır.
- Q: Sol menyunun məzmunu? → A: CMS ağacından ("Media" kökünün uşaqları), About-dakı kimi.
  Figma-dakı 9 ad (Xəbərlər, Elanlar, Müsahibələr və çıxışlar, Tədbirlər, Qalereya, Media
  sorğuları, Korporativ sosial məsuliyyət, Məlumatların yayımlanması qrafiki, Mərkəzi Bankın
  loqosu) kodda yazılmır; redaktor səhifələri adlandırır/sıralayır/yaradır. Kod nə varsa onu
  göstərir.
- Q: "Media (Kopya)" alt ağacı? → A: About-dakı kimi: Kopya səhifəsi açılanda menyu Kopya
  kökündən qurulur, orijinalda menyu dəyişmir.
- Q: Figma H1 rəngi `#333333`, About şablonunda `#222222` (`text-foreground`)? → A: Şablon
  dəyişmir, fərq `visual-diff.md`-də qəbul edilmiş fərq kimi qeyd olunur.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi Media giriş səhifəsini Figma şablonunda görür (Priority: P1)

Ziyarətçi "Media" bölməsini açır. Header altında solda breadcrumb ("Ana səhifə › Media"), sağda
paylaşma düymələri (Facebook, LinkedIn, WhatsApp, e-poçt, çap) görünür. Solda boz fonlu
alt-bölmə menyusu (bölmənin CMS uşaqları), sağda "Media" başlığı və CMS-dəki giriş mətni var.

**Why this priority**: Bölmənin giriş nöqtəsidir və Figma-dakı yeganə "A" əhatəli səhifədir.
Həm də şablonun bölmə-agnostik olmasını sübut edir — sonrakı Media spec-ləri bunun üstündə
qurulur.

**Independent Test**: `/az/media` və `/en/media` 1728, 744, 390 enlərində `1045:17244` /
`1658:12660` / `1658:13179` ilə yanaşı müqayisə olunur. Breadcrumb, menyu linkləri, paylaşma
linkləri işləyir.

**Acceptance Scenarios**:

1. **Given** ziyarətçi `/az/media` açır, **When** səhifə yüklənir, **Then** breadcrumb iki
   səviyyədir ("Ana səhifə" link, "Media" cari və link deyil); H1 CMS səhifəsinin başlığıdır
   ("Media"); məzmun CMS "Media" səhifəsinin giriş mətnidir, Figma tipoqrafiyası ilə (16/400
   lh28, mobildə 14/400).
2. **Given** desktop en, **When** səhifə açılır, **Then** solda 312px menyu, sağda 984px məzmun,
   aralarında 24px; alətlər sırası 100px hündürlükdə; H1 32/600 lh44, H1-dən mətnə 36px.
3. **Given** sol menyu, **When** render olunur, **Then** bəndlər CMS "Media" kökünün uşaqlarıdır,
   ağacdakı sırada, hər biri öz ünvanına (`navUrl` və ya `/{locale}/{slug}`) aparır. Giriş
   səhifəsində heç bir bənd aktiv deyil. Uşağı olan bənd (məs. "Tədbirlər") caret ilə göstərilir
   (Figma `menu link`), açılışı About-dakı qayda ilə (aktiv zəncir).
4. **Given** ziyarətçi paylaşma düymələrindən birini basır, **When** Facebook/LinkedIn/WhatsApp
   seçilir, **Then** `/az/media`-nın mütləq ünvanı ilə həmin şəbəkənin paylaşma pəncərəsi yeni
   tabda açılır; e-poçt poçt proqramını, çap çap dialoqunu açır.
5. **Given** planşet (744) və ya mobil (390) en, **When** səhifə açılır, **Then** breadcrumb və
   paylaşma alt-alta, menyu başlıqdan əvvəl tam enli boz qutu (744-də 664, 390-da 342), kənar
   boşluq 40 / 24, mobildə H1 22/600. Üfüqi sürüşmə yoxdur.
6. **Given** `/en/media`, **When** səhifə açılır, **Then** breadcrumb "Home › Media", məzmun en
   CMS mətni, menyu en ağacından.

---

### User Story 2 — Media ağacının digər CMS səhifələri və qalereya/video siyahıları eyni şablondadır (Priority: P2)

Ziyarətçi menyudan "Korporativ sosial məsuliyyət" (CMS səhifəsi) və ya "Fotoqalereya" /
"Videoqalereya" seçir. Hər biri eyni şablonda açılır: breadcrumb "Ana səhifə › Media › …", sol
menyuda cari bənd vurğulanır, məzmun sağdadır. Qalereya və video siyahıları bu günkü kartlarla,
amma öz ünvanlarında (`/media/galleries`, `/media/videos`) göstərilir. Qalereya detalı da
şablondadır, breadcrumb-ın son elementi qalereyanın adıdır.

**Why this priority**: Giriş səhifəsindən çıxan grid-lərin itməməsi (Maddə I.3) və menyunun
"cari" vəziyyətinin real işləməsi. Dizayn dəyişikliyi deyil, yerləşdirmə dəyişikliyidir.

**Independent Test**: `/az/korporativ-sosial-mesuliyyet`, `/az/media/galleries`,
`/az/media/videos`, `/az/media/galleries/{id}` açılır; breadcrumb və aktiv menyu bəndi yoxlanır;
kart sayı və məzmunu bu günkü `/media` ilə eynidir.

**Acceptance Scenarios**:

1. **Given** Media ağacının CMS səhifəsi (məs. KSM), **When** açılır, **Then** About şablonu ilə
   eyni görünüş (breadcrumb, paylaşma, menyu, H1, Figma tipoqrafiyalı məzmun, əlavələr); köhnə
   sol ağac və mavi başlıq zolağı yoxdur. About-a məxsus bloklar (tarix kartları, timeline və s.)
   Media səhifələrinə tətbiq olunmur — məzmun adi mətn kimi qalır.
2. **Given** `/az/media/galleries`, **When** açılır, **Then** bu gün `/media#galleries`-də görünən
   qalereya kartları eyni say və məzmunla, şablon içində, H1 ağacdakı bəndin adıdır
   ("Fotoqalereya"); sol menyuda həmin bənd aktivdir (redaktor `navUrl`-ı `/media/galleries`
   edəndən sonra; edilməyibsə aktiv deyil, amma səhifə işləyir).
3. **Given** `/az/media/videos`, **When** açılır, **Then** canlı yayım kartı (varsa) və video
   kartları bu günkü kimi, şablon içində.
4. **Given** qalereya və ya video siyahısı sorğusu uğursuz olur, **When** səhifə açılır, **Then**
   şablon (breadcrumb, menyu, H1) qalır, məzmun yerində saytın standart xəta vəziyyəti görünür.
5. **Given** `/az/media/galleries/{id}`, **When** açılır, **Then** şablon içində şəkil grid-i;
   breadcrumb "Ana səhifə › Media › Fotoqalereya › {qalereya adı}"; köhnə "Mediaya qayıt" linki
   yerinə breadcrumb-dan "Fotoqalereya"ya qayıdılır.
6. **Given** CMS ağacında `fotoqalereya` bəndinin `navUrl`-ı boşdursa, **When** header menyusu
   qurulur, **Then** bənd `/{locale}/media/galleries`-ə aparır (`videoqalereya` →
   `/media/videos`); `navUrl` doludursa o üstündür.

---

### User Story 3 — Kənar hallar: Kopya ağacı, boş ağac, boş CMS, locale-siz ünvan (Priority: P3)

**Acceptance Scenarios**:

1. **Given** "Media (Kopya)" alt ağacının səhifəsi açılır, **When** menyu qurulur, **Then** menyu
   Kopya kökünün uşaqlarından qurulur, breadcrumb "Ana səhifə › Media › Media (Kopya) › …".
   Orijinal Media səhifələrində menyu dəyişmir (Kopya kök bir bənd kimi görünür — bu günkü
   About davranışı).
2. **Given** ağac sorğusu uğursuz olur, **When** `/az/media` açılır, **Then** menyu boşdur
   (göstərilmir), breadcrumb "Ana səhifə › Media", məzmun yenə göstərilir.
3. **Given** CMS-də `media` slug-lı səhifə yoxdur (boş baza), **When** `/az/media` açılır,
   **Then** H1 saytın "Media" etiketidir, məzmun boşdur, səhifə xəta vermir.
4. **Given** ziyarətçi locale-siz `/media` və ya `/media/galleries` açır, **When** sorğu gəlir,
   **Then** `/az/media` / `/az/media/galleries`-ə yönləndirilir. `/media/{rəqəm}` fayl proxy-si
   əvvəlki kimi yönləndirilmir.
5. **Given** köhnə cbar.az ünvanları `/gallery/photos`, `/gallery/photos/detail/{id}`, `/videos`
   (dil `?language=` ilə), **When** açılır, **Then** 308 ilə `/{locale}/media/galleries`,
   `/{locale}/media/galleries/{id}`, `/{locale}/media/videos`-a yönəlir.

---

### Edge Cases

- **Məzmun yalnız bir dildə doludur**: `/en/media` boş məzmunla, amma şablon və menyu ilə açılır.
- **Menyuda hash `navUrl`** (`/media#galleries`, redaktor hələ dəyişməyib): link işləyir
  (`/az/media#galleries` → giriş səhifəsi), aktiv vurğu olmur. Təlimatda redaktora yeni ünvan
  göstərilir.
- **Menyuda çox bənd / uzun ad** ("Məlumatların yayımlanması qrafiki"): sətir keçidi, menyu eni
  dəyişmir (Figma-da bu bənd 2 sətirdir, 56px).
- **Çap**: header, footer, menyu, paylaşma gizlənir (024 qaydası).
- **"Media" kökü ağacda başlıqla tapılmır** (redaktor adı dəyişib): About ilə eyni mexanizm —
  bölmə kökü başlıq dəsti ilə tanınır; tapılmasa menyu boş, səhifə işləyir. Dəst az/en üçün
  "Media"dır.

## Requirements *(mandatory)*

### Functional Requirements

**Ümumi şablon (bölmə-agnostik)**

- **FR-001**: Spec 024-ün ümumi şablonu (breadcrumb + paylaşma sırası, sol alt-bölmə menyusu,
  başlıq, məzmun) "Haqqımızda"dan asılı olmamalı, istənilən CMS kök bölməsi üçün qurula
  bilməlidir. About səhifələrinin görünüşü və davranışı dəyişmir (reqressiya yoxdur).
- **FR-002**: Bölmə kökü CMS ağacında başlıq dəsti ilə tanınır (About üçün mövcud dəst, Media
  üçün az/en "Media"). Hər bölmənin "(Kopya)" / "(Copy)" surəti About-dakı qayda ilə dəstəklənir.
- **FR-003**: Breadcrumb CMS ağacındakı yoldan qurulur; son element cari səhifədir, link deyil,
  `aria-current="page"` daşıyır. Feature səhifələri (qalereya siyahısı, detal) yolu uyğun CMS
  qovşağından davam etdirir; ağacda olmayan son səviyyə (qalereya adı) `trail` kimi əlavə olunur.
- **FR-004**: Paylaşma düymələri cari səhifənin mütləq ünvanını paylaşır (024 FR-003 ilə eyni).
- **FR-005**: Şablonun chrome etiketləri (breadcrumb "Ana səhifə", paylaşma, menyu `aria-label`)
  bölmə-agnostik i18n namespace-indədir; About-a məxsus etiketlər About namespace-ində qalır.

**Media giriş səhifəsi**

- **FR-006**: `/{locale}/media` CMS "Media" səhifəsini (slug `media`) göstərməlidir: H1 =
  səhifə başlığı, məzmun = səhifənin HTML-i (mövcud təhlükəsiz hazırlama ilə), əlavələr varsa
  əlavələr bloku. Şablon Figma `1045:17244` / `1658:12660` / `1658:13179` ölçülərindədir.
- **FR-007**: Sol menyu "Media" kökünün uşaqlarından qurulur (ağac sırası, `navUrl` üstün,
  2 səviyyə). Giriş səhifəsində heç bir bənd aktiv deyil; breadcrumb "Ana səhifə › Media".
- **FR-008**: CMS səhifəsi tapılmasa səhifə xəta vermir: H1 saytın "Media" etiketi, məzmun boş,
  şablon qalır. Ağac tapılmasa menyu göstərilmir, breadcrumb iki səviyyə qalır.
- **FR-009**: Səhifə başlığı (`<title>`) CMS səhifəsinin başlığından gəlir; `alternates`
  az/en qalır.

**Media ağacının CMS səhifələri**

- **FR-010**: Media kökünün altındakı CMS səhifələri (KSM, Tədbirlər və uşaqları, İnformasiya
  sorğusu, …) eyni şablonda, Figma tipoqrafiyası ilə adi məzmun kimi göstərilməlidir. About-un
  strukturlu blokları (slug → layout) yalnız About bölməsinə tətbiq olunur. Digər bölmələr
  (Pul siyasəti və s.) bu spec-də dəyişmir.

**Qalereya və video siyahıları**

- **FR-011**: Qalereya kartları `/{locale}/media/galleries`, video kartları və canlı yayım bloku
  `/{locale}/media/videos` ünvanlarında, şablon içində göstərilməlidir. Kartların görünüşü,
  sayı (10) və datası bu günkü ilə eynidir; dizayn bu spec-də dəyişmir.
- **FR-012**: Bu səhifələrin H1-i CMS ağacındakı müvafiq bəndin adıdır (`navUrl` ilə
  uyğunlaşan bənd); bənd tapılmasa saytın "Fotoqalereyalar" / "Videolar" etiketi. Sol menyuda
  həmin bənd aktivdir.
- **FR-013**: Qalereya detalı (`/media/galleries/{id}`) şablonda açılır; breadcrumb-ın son
  elementi qalereyanın adıdır; "Mediaya qayıt" linki silinir (breadcrumb əvəz edir).
- **FR-014**: Header/footer naviqasiyasında `fotoqalereya` / `photo-gallery` → `media/galleries`,
  `videoqalereya` / `video-gallery` → `media/videos` (feature route xəritəsi); CMS `navUrl`
  doludursa o üstündür.

**Ünvanlar**

- **FR-015**: Locale-siz `/media…` səhifə yolları (`/media`, `/media/galleries`, …) `az`-a
  yönləndirilməlidir; `/media/{rəqəm}` fayl proxy-si yönləndirilmir.
- **FR-016**: Köhnə ünvanlar `/gallery/photos`, `/gallery/photos/detail/{id}`, `/videos`
  (istəyə görə `/az/…`, `/en/…` prefiksi, `?language=`) 308 ilə yeni ünvanlara yönəlir.
  Mövcud yeni ünvanlar dəyişmir.

**Ümumi**

- **FR-017**: Bütün yeni etiketlər az və en dillərində olmalıdır; redaksiya mətni kodda
  yazılmır (Maddə V.4).
- **FR-018**: Səhifələr serverdə tam render olunur, CMS dəyişiklikləri dərhal görünür. Giriş
  səhifəsi 2 API sorğusu (səhifə + ağac) edir — bu gün 3 idi (yayım, qalereya, video).
- **FR-019**: Bir H1, menyu `nav[aria-label]`, breadcrumb `nav` + `ol`, paylaşma linklərinin
  `aria-label`-ı, klaviatura ilə idarəetmə (024 FR-022 ilə eyni).

### Key Entities

- **Bölmə kökü**: CMS ağacında başlığı ilə tanınan üst qovşaq (About, Media). Menyu və
  breadcrumb bundan qurulur.
- **Media səhifə qovşağı**: başlıq, slug, `navUrl`, alt qovşaqlar.
- **Media CMS səhifəsi**: başlıq, HTML məzmun, əlavələr (slug `media`).
- **Qalereya / Video / Canlı yayım**: mövcud siyahı modelləri, dəyişmir.

## Success Criteria *(mandatory)*

- **SC-001**: `/az/media` 1728, 744, 390 enlərində Figma frame-ləri ilə müqayisədə blok sırası,
  ölçü (±2px) və tipoqrafiya baxımından uyğundur; hər fərq `visual-diff.md`-də qeyd olunub.
- **SC-002**: 390–1920px aralığında Media səhifələrində üfüqi sürüşmə yoxdur.
- **SC-003**: Bu gün `/media`-da görünən qalereya və video kartlarının 100%-i yeni ünvanlarda
  görünür (say və məzmun eyni).
- **SC-004**: About bölməsinin bütün səhifələri (`/az/haqqimizda`, `/az/organization?section=…`,
  bio, şöbə) dəyişikliyə qədərki kimi açılır — mövcud About testləri yaşıl qalır, əl yoxlaması
  fərq göstərmir.
- **SC-005**: Giriş səhifəsinin API sorğu sayı 3-dən 2-yə düşür; digər səhifələr əvvəlkindən
  artıq sorğu etmir (qalereya/video siyahısı: +1 ağac sorğusu, şablon üçün).
- **SC-006**: Frontend gate (`npm run verify`) yaşıldır, test sayı azalmır; yeni testlər menyu
  mənbəyini, breadcrumb-ı, Kopya və boş ağac hallarını, proxy matcher-i və köhnə ünvanları əhatə
  edir.
- **SC-007**: Redaktor CMS-də Media uşağının adını dəyişəndə və ya yeni uşaq əlavə edəndə menyu
  kod dəyişikliyi olmadan yenilənir.

## Redaktor tapşırıqları (koddan kənar, Figma adlarına çatmaq üçün)

Admin paneldə "Media" (id 77) ağacında:

| Figma bəndi | CMS-də bu gün | Tapşırıq |
|---|---|---|
| Xəbərlər | "Press-relizlər" (`/press-releases?type=1`) | ad → "Xəbərlər" / "News" (istəyə görə) |
| Elanlar | "Elanlar" | — |
| Müsahibələr və çıxışlar | "Təqdimat və məruzələr" (boş) | ad dəyişdir, məzmun sonrakı spec |
| Tədbirlər | "Tədbirlər" (6 uşaq) | — |
| Qalereya | "Fotoqalereya" (`/media#galleries`), "Videoqalereya" (`/media#videos`) | `navUrl` → `/media/galleries`, `/media/videos`; birləşdirmə sonrakı spec |
| Media sorğuları | "İnformasiya sorğusu" | ad dəyişdir |
| Korporativ sosial məsuliyyət | var | — |
| Məlumatların yayımlanması qrafiki | yoxdur | yeni CMS səhifəsi (məzmun sonrakı spec) |
| Mərkəzi Bankın loqosu | yoxdur | yeni CMS səhifəsi |
| — | "İnzibati işlərə baxan vəzifəli şəxslər" | Figma-da yoxdur; qalır (Maddə I.3), qərar redaksiyanındır |

Bu dəyişikliklər edilməyənə qədər menyu bugünkü adlarla görünür — səhifə işləyir.

## Əhatədən kənar (gələcək spec-lər)

- Xəbərlər / Elanlar siyahı və detal dizaynı (`1333:30585`, `1333:30586`), tarix filtri,
  admin formasında `type` sahəsinin olmaması (Explore tapıntısı, 2026-11-02).
- Qalereya (foto/video siyahı və detal) dizaynı (`1647:35084`), paginasiya, video detalı.
- Tədbirlər (kateqoriyalar, keçmiş/gələcək, detal), Müsahibələr və çıxışlar, Media sorğuları,
  KSM interaktiv səhifə, Yayım qrafiki, Loqo — yeni entity-lər və admin modulları tələb edir.
- "Bölmə filtri" komponenti (`2323:124130`).
- Legacy `press-release-{id}/{slug}`, `press-releases/{type}` yönləndirmələri (notdoneyet).

## Assumptions

- Figma "cbar website (Copy)" yekun dizayndır; ölçülər node-lardan götürülür.
- Figma menyusundakı adlar məzmun qərarıdır; sayt CMS ağacını olduğu kimi göstərir.
- Figma giriş mətni CMS-dəki mətnlə eynidir (ölçülüb); fərq varsa redaktor CMS-də düzəldir.
- Kit, token-lər və 022-nin D-2 sapması dəyişmir.
