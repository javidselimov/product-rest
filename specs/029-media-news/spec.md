# Feature Specification: Media → "Xəbərlər" və "Elanlar" siyahı və detal səhifələri (Figma)

**Feature Branch**: `029-media-news`

**Created**: 2026-11-02

**Status**: Draft

**Input**: User description: "web-cbar-new-də Media → Xəbərlər səhifəsini Figma-ya uyğun hazırlamaq;
konstruksiya, API forması və ya entity quruluşu uyğun deyilsə admin və backend kodunda da
dəyişiklik etmək." İstifadəçi qərarları (2026-11-02): **əhatə — siyahı + detal**; Elanlar eyni
şablonu alır; **backend boşluqları əhatəyə daxildir** (public API filtrləri, admin-də "Növ").

Spec 028-in "Əhatədən kənar" bəndinin ("Xəbərlər / Elanlar siyahı və detal dizaynı, tarix filtri,
admin formasında `type` sahəsinin olmaması") davamıdır.

**Mənbə dizayn**: Figma faylı "cbar website (Copy)", səhifə "Media" (`1045:17243`), section
"Xəbərlər" (`1333:30585`):

| Səhifə | Desktop 1728 | Tablet 744 | Mobil 390 |
|---|---|---|---|
| Xəbərlər (siyahı) | `1047:18001` | `1658:13579` | `1658:14258` |
| Xəbər detalı, qısa mətn | `1298:18113` | `1658:14818` | `1658:15384` |
| Xəbər detalı, uzun mətn | `1298:18943` | `1658:15831` | `1658:16398` |

Siyahının desktop ölçüləri (`1048:21678`): başlıq "Xəbərlər" 32/44 SemiBold; başlıq–filtr 36;
filtr sətri (`1048:18772`) 984×44: axtarış "Bölmə üzrə axtarış" 312×44, tarix aralığı
"from dd.mm.yyyy - to dd.mm.yyyy" 312×44 (aralarında 24), sağda "Filtrləri təmizlə" (14/20
Medium, alt xətli) və "Axtar" primary düyməsi 144×44 r4; filtr–grid 60; kart grid-i 3 sütun, hər
iki istiqamətdə 24 boşluq; kart (`card / press-release`) 312 en: şəkil 312×197 (boş fon
`#E5E5E5`, `cover`), şəkil–mətn 24, tarix 16/28 SemiBold `#787878`, tarix–başlıq 16, başlıq 20/28
SemiBold `#222222`; grid–paginasiya 60, paginasiya sağa düzlənib (32 hündürlük, aktiv səhifə
`#4BC7B5`). Detal (`1298:19683`): başlıq 32/44 SemiBold `#333333`; başlıq–şəkil 36; örtük şəkli
984×502 (`cover`); şəkil–mətn 32; tarix 14/28 Regular `#787878`; tarix–mətn 24; mətn 16/28;
mətn–qalereya 36; fotoqalereya (`1652:36210`): böyük şəkil 984×601, altında 44×44 sol/sağ ox
düymələri arasında 180×124 miniatür zolağı (aralarında 24, seçilmiş miniatürdə 2px çərçivə),
böyük şəkil–zolaq 48. Breadcrumb detalda dörd səviyyədir: "Ana səhifə › Media › Xəbərlər ›
{başlıq}".

**Əhatə olunan proyektlər** (Konstitusiya Maddə II — hər biri ayrıca MR):

- `web-cbar-new`: Xəbərlər/Elanlar siyahısı və detalı Media bölməsinin şablonunda (spec 028
  `widgets/section-shell`), filtr, kart grid-i, paginasiya, detal və fotoqalereya.
- `api-cbar`: public siyahı endpoint-inə axtarış və tarix aralığı filtrləri (spec-first, OpenAPI).
- `api-cbar-admin`: admin siyahısına "Növ" filtri (spec-first, OpenAPI).
- `web-cbar-admin-new`: press-reliz formasına "Növ" seçimi, siyahıya "Növ" sütunu və filtri.
- **Sxem dəyişmir**: `press_releases.type` artıq var, migration və entity dəyişikliyi yoxdur.

**Deploy sırası**: `api-cbar` (yeni filtrlər, köhnə çağırışlara təsirsizdir) → `web-cbar-new`;
`api-cbar-admin` → `web-cbar-admin-new`. Hər API dəyişikliyi geriyə uyğundur, ona görə sıra
pozulsa da heç nə qırılmır; sadəcə filtr işləmir.

**`product-host` istinadı (Konstitusiya Maddə I.2)**:

| Köhnə | Nə edir |
|---|---|
| `visitor/controllers/PressReleasesController.php` `actionIndex` + `models/PressReleasesForm.php` | Siyahı: `type` (1/2), `dateFrom`/`dateTo` (`d/m/Y`) filtri |
| `visitor/controllers/PressReleasesController.php` `actionDetail` | Detal (`press-release-{id}/{slug}`) |

Köhnə sayt tarix aralığı ilə süzməyə imkan verirdi, yeni stack-də bu itib — bu spec onu bərpa
edir (Maddə I.3). Köhnədə `dateFrom` default olaraq cari ayın 1-i idi; yeni siyahı default olaraq
filtrsizdir (bax Assumptions).

**Hazırkı vəziyyət (koddan oxunub, 2026-11-02)**:

- `/{locale}/press-releases` spec 002 görünüşündədir: `PageTitle` + "Hamısı / Relizlər / Elanlar"
  düymələri + şaquli `ContentList` + paginasiya (10). Media şablonu (breadcrumb, paylaşma, sol
  menyu) yoxdur. `type` olmadıqda hər iki növ qarışıq göstərilir.
- Detal `/{locale}/press-releases/{slug}`: başlıq, tarix, CMS mətni, qoşmalar, "geri" linki.
  Örtük şəkli və fotoqalereya yoxdur; şəkillər qoşma siyahısında fayl kimi görünür.
- Ana səhifənin "Xəbərlər" tabı yalnız `type=1` göstərir, amma "Hamısına bax" linki tipsiz
  `/press-releases`-ə aparır — orada elanlar da qarışıq çıxır.
- Public API siyahısı yalnız `locale`, `page`, `pageSize`, `type` qəbul edir; axtarış və tarix
  filtri yoxdur. Siyahı kartı üçün şəkil artıq gəlir (ilk şəkil qoşması).
- Admin API siyahısı `search` və `status` qəbul edir, `type` qəbul etmir. Yaratma/redaktə DTO-su
  `type`-ı qəbul edir, amma admin formasında bu sahə yoxdur və forma yalnız elan olunmuş sahələri
  göndərir. **Gizli bug (plan zamanı tapılıb)**: DTO-da `short Type` göndərilməyəndə `0` olur, ona
  görə admin paneldə yaradılan və ya redaktə olunan hər yazı `type=0` alır və nə Xəbərlər, nə də
  Elanlar siyahısına düşür. Test mühitində (2026-11-02) 43 yazının 20-si `type=1`, 23-ü `type=2`,
  `type=0` yoxdur — hələ heç kim admin-dən saxlamayıb, data korlanmayıb.
- Public detal cavabında `type` yoxdur — detal səhifəsi yazının Xəbər, yoxsa Elan olduğunu
  bilmir (breadcrumb və aktiv menyu bəndi üçün lazımdır).
- Silinmiş yazılar: `PressRelease` üçün qlobal soft-delete filtri var; public sorğular
  tərcümələrdən naviqasiya ilə gedir. Filtrin bu yolda da tətbiq olunduğu gözlənilir, amma
  ölçülməyib — FR-016.

## Clarifications

### Session 2026-11-02

- Q: Əhatə — yalnız siyahı, yoxsa siyahı + detal? → A: **Siyahı + detal**, hər biri üç
  breakpoint-də. Elanlar (`type=2`) eyni şablonu alır. → **031 ilə dəyişdirildi** (2026-11-03):
  Elanlar Figma-da şəkilsizdir (siyahı kartı `1048:23221`, detal `1298:20343`) —
  `specs/031-announcements-layout/`.
- Q: Admin-də "Növ" seçimi və API-dəki boşluqlar daxildir? → A: **Bəli**: public API-yə axtarış
  və tarix filtri, admin-də "Növ" (forma, sütun, filtr), soft-delete yoxlaması.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Ziyarətçi xəbərlər siyahısını Figma şablonunda görür (Priority: P1)

Ziyarətçi Media menyusundan "Xəbərlər"i açır. Breadcrumb ("Ana səhifə › Media › Xəbərlər"),
paylaşma düymələri, solda Media alt-bölmə menyusu ("Xəbərlər" aktiv), sağda "Xəbərlər" başlığı,
filtr sətri, ən yenidən köhnəyə 3 sütunlu kart grid-i (şəkil, tarix, başlıq) və paginasiya görünür.

**Why this priority**: Bölmənin əsas səhifəsidir və Media menyusunun birinci bəndidir; filtrsiz də
tək başına dəyər verir.

**Independent Test**: `/az/press-releases?type=1` və `/en/...` 1728, 744, 390 enlərində
`1047:18001` / `1658:13579` / `1658:14258` ilə ölçü-ölçü müqayisə olunur; kart klikləri detala,
paginasiya digər səhifəyə aparır.

**Acceptance Scenarios**:

1. **Given** dərc olunmuş 20 xəbər var, **When** ziyarətçi siyahını açır, **Then** ilk səhifədə 9
   kart (3×3) ən yeni tarixdən başlayaraq görünür, paginasiya 3 səhifə göstərir.
2. **Given** xəbərin şəkil qoşması yoxdur, **When** kart göstərilir, **Then** şəkil yerində boz
   (`#E5E5E5`) boşluq qalır, kartların hündürlüyü sətirdə pozulmur.
3. **Given** ziyarətçi `/az/press-releases?type=2` açır, **When** səhifə yüklənir, **Then**
   başlıq və breadcrumb "Elanlar"dır, menyuda "Elanlar" aktivdir, yalnız elanlar görünür.
4. **Given** ziyarətçi tipsiz `/az/press-releases` açır (ana səhifənin "Hamısına bax" linki),
   **When** səhifə yüklənir, **Then** Xəbərlər (`type=1`) siyahısı göstərilir.
5. **Given** mobil en (390), **When** siyahı açılır, **Then** kartlar bir sütunda, filtr sahələri
   bir-birinin altında, menyu Figma `1658:14258`-dəki yerdədir.

---

### User Story 2 — Ziyarətçi xəbərləri açar söz və tarix aralığı ilə süzür (Priority: P2)

Ziyarətçi "Bölmə üzrə axtarış" sahəsinə söz yazır və/və ya tarix aralığı seçir, "Axtar" basır.
Siyahı yalnız uyğun xəbərləri göstərir; "Filtrləri təmizlə" siyahını ilkin halına qaytarır.

**Why this priority**: Köhnə saytda olan, yeni stack-də itmiş funksiyadır (tarix aralığı); xəbər
arxivi minlərlə yazıdır və filtrsiz konkret xəbəri tapmaq çətindir.

**Independent Test**: Məlum başlıq və tarixlərlə dərc olunmuş xəbərlər üzərində filtr
kombinasiyaları yoxlanır; nəticə URL-də saxlanır və linki açan başqa şəxs eyni siyahını görür.

**Acceptance Scenarios**:

1. **Given** başlığında "Dünya Bankı" olan 3 xəbər var, **When** ziyarətçi "dünya bankı" yazıb
   "Axtar" basır, **Then** yalnız həmin 3 xəbər görünür (böyük-kiçik hərfə həssas deyil).
2. **Given** 01.09.2026–30.09.2026 aralığı seçilib, **When** "Axtar" basılır, **Then** yalnız bu
   günlərdə (hər iki gün daxil, Bakı vaxtı ilə) dərc olunmuş xəbərlər görünür.
3. **Given** axtarış və tarix birlikdə doldurulub, **When** "Axtar" basılır, **Then** hər iki şərtə
   uyğun xəbərlər görünür, paginasiya filtrli nəticənin sayına görədir.
4. **Given** filtrli siyahının 2-ci səhifəsi açıqdır, **When** ziyarətçi paginasiyada 3-ə keçir,
   **Then** filtrlər saxlanılır.
5. **Given** filtr aktivdir, **When** "Filtrləri təmizlə" basılır, **Then** sahələr boşalır və
   filtrsiz siyahının 1-ci səhifəsi göstərilir.
6. **Given** heç bir xəbər filtrə uyğun deyil, **When** nəticə gəlir, **Then** "Heç nə tapılmadı"
   mesajı görünür, filtr sahələri doldurulmuş qalır.
7. **Given** JavaScript söndürülüb, **When** ziyarətçi axtarış sözü yazıb formanı göndərir,
   **Then** süzülmüş siyahı yenə gəlir.

---

### User Story 3 — Ziyarətçi xəbər detalını örtük şəkli və fotoqalereya ilə oxuyur (Priority: P2)

Ziyarətçi kartı açır. Breadcrumb "Ana səhifə › Media › Xəbərlər › {başlıq}", solda Media menyusu,
sağda başlıq, böyük örtük şəkli, tarix, mətn, xəbərin digər şəkilləri varsa altda fotoqalereya
(böyük şəkil + miniatür zolağı, ox düymələri), şəkil olmayan qoşmalar (PDF və s.) siyahı kimi
görünür.

**Why this priority**: Siyahıdakı hər kart buraya aparır; bugünkü detalda şəkillər fayl kimi
görünür, bu Figma-dan ən böyük fərqdir.

**Independent Test**: Bir, bir neçə və sıfır şəkilli xəbərlər üç breakpoint-də `1298:18113` /
`1298:18943` və tablet/mobil cütləri ilə müqayisə olunur.

**Acceptance Scenarios**:

1. **Given** xəbərin 5 şəkil qoşması var, **When** detal açılır, **Then** birinci şəkil örtük
   kimi başlığın altındadır, qalan 4 şəkil fotoqalereyadadır.
2. **Given** fotoqalereya göstərilir, **When** ziyarətçi miniatürə və ya ox düyməsinə basır (və ya
   klaviaturada sol/sağ oxla), **Then** böyük şəkil dəyişir, seçilmiş miniatür vurğulanır.
3. **Given** xəbərin yalnız bir şəkli var, **When** detal açılır, **Then** örtük şəkli görünür,
   fotoqalereya bloku göstərilmir.
4. **Given** xəbərin şəkli yoxdur, **When** detal açılır, **Then** başlıqdan sonra birbaşa tarix
   və mətn gəlir, boş şəkil yeri qalmır.
5. **Given** xəbərə PDF qoşulub, **When** detal açılır, **Then** PDF qoşmalar siyahısında
   yüklənə bilən fayl kimi görünür, qalereyaya düşmür.
6. **Given** slug yoxdur, dərc olunmayıb və ya silinib, **When** detal açılır, **Then** 404.

---

### User Story 4 — Redaktor yazının növünü (Xəbər / Elan) seçir və siyahıda süzür (Priority: P3)

Redaktor admin paneldə press-reliz yaradanda və ya redaktə edəndə "Növ" sahəsində "Xəbər" və ya
"Elan" seçir. Siyahıda "Növ" sütunu görünür və növə görə filtr var.

**Why this priority**: Bu olmadan redaktor yeni elan yarada bilmir (hamısı xəbər olur) və saytdakı
"Elanlar" səhifəsi yeni məzmun almır. Siyahı/detal üçün şərt deyil, ona görə P3-dür.

**Independent Test**: Admin paneldə "Elan" növlü yazı yaradılır, dərc olunur və saytda yalnız
`/press-releases?type=2`-də görünür; admin siyahısında "Elan" filtri onu tapır.

**Acceptance Scenarios**:

1. **Given** redaktor yeni yazı formasını açır, **When** forma göstərilir, **Then** "Növ" sahəsi
   "Xəbər" seçilmiş halda görünür.
2. **Given** redaktor "Elan" seçib yadda saxlayır, **When** yazı yenidən açılır, **Then** "Elan"
   seçilmiş qalır.
3. **Given** siyahıda həm xəbər, həm elan var, **When** redaktor "Növ: Elan" filtrini seçir,
   **Then** yalnız elanlar görünür, sayğac buna uyğundur.
4. **Given** mövcud yazının növü dəyişdirilir, **When** yadda saxlanır, **Then** audit jurnalında
   dəyişiklik qeyd olunur (mövcud audit davranışı).

---

### Edge Cases

- Tarix aralığında yalnız "from" və ya yalnız "to" doldurulub: açıq uclu aralıq kimi işləyir.
- "from" "to"-dan sonradır: nəticə boşdur və "Heç nə tapılmadı" görünür; xəta səhifəsi yox.
- URL-də səhv format tarix (`?from=abc`) və ya mövcud olmayan səhifə (`?page=999`): səhv parametr
  nəzərə alınmır; mövcud olmayan səhifə boş nəticə + paginasiya göstərir, 500 yox.
- Axtarış sözü çox uzundur (məs. 500 simvol) və ya `%`, `_` kimi simvollar var: təhlükəsiz
  süzülür (simvollar hərfi axtarılır), xəta vermir.
- Yazının cari dildə tərcüməsi yoxdur: o dilin siyahısında görünmür (mövcud davranış).
- Xəbərin başlığı çox uzundur: kartda tam göstərilir, sətir hündürlüyü kartlar arasında
  düzlənmir (Figma `HUG`); detalda başlıq sətirlərə bölünür.
- Gələcək tarixə planlaşdırılmış (embargo) xəbər: nə siyahıda, nə detalda görünür.
- Şəkil fayllarının ölçüləri müxtəlifdir: örtük və kart şəkilləri sabit nisbətdə kəsilir (`cover`),
  qalereyanın böyük şəkli tam görünür (`contain`).
- API əlçatmazdır: siyahıda mövcud xəta mesajı, detalda xəta səhifəsi; şablon (menyu, breadcrumb)
  qalır.
- Ziyarətçi paylaşma düyməsinə basır: filtrli siyahıda cari URL (filtrlərlə) paylaşılır.

## Requirements *(mandatory)*

### Functional Requirements

**Siyahı (web-cbar-new)**

- **FR-001**: Xəbərlər və Elanlar siyahısı Media bölməsinin ümumi şablonunda göstərilməlidir:
  breadcrumb, paylaşma düymələri, sol Media menyusu (cari bənd vurğulanır) — spec 028-in
  şablonu dəyişmədən.
- **FR-002**: `type=1` və ya tipsiz ünvan "Xəbərlər", `type=2` "Elanlar" siyahısıdır; başlıq,
  breadcrumb-ın son bəndi və səhifənin `<title>`-ı buna uyğun olmalıdır. "Hamısı / Relizlər /
  Elanlar" düymələri götürülür.
- **FR-003**: Kartlar ən yeni dərc tarixindən başlayaraq 3 sütunda (tablet və mobil Figma-ya görə)
  göstərilməli, hər kartda şəkil (və ya boz boşluq), `dd.mm.yyyy` formatında tarix və başlıq olmalı,
  bütün kart detala aparan bir link olmalıdır.
- **FR-004**: Səhifə başına 9 kart göstərilməli, paginasiya UI kit-in Figma-dakı görünüşü ilə
  olmalı və bütün aktiv filtrləri saxlamalıdır.
- **FR-005**: Filtr sətri axtarış sahəsi ("Bölmə üzrə axtarış"), tarix aralığı sahəsi, "Filtrləri
  təmizlə" linki və "Axtar" düyməsindən ibarət olmalıdır; filtr vəziyyəti URL-də saxlanmalı
  (paylaşıla və əlfəcin edilə bilən), JavaScript olmadan da işləməlidir.
- **FR-006**: Axtarış başlıq üzrə, cari dildə, böyük-kiçik hərfə həssas olmadan, alt-sətir
  uyğunluğu ilə işləməlidir; tarix aralığı dərc tarixinə görə, hər iki ucu daxil, Bakı vaxtı ilə
  süzməlidir.
- **FR-007**: Nəticə boş olduqda "Heç nə tapılmadı" mesajı göstərilməli, filtr sahələri
  doldurulmuş qalmalıdır.
- **FR-008**: Bütün yeni interfeys mətnləri (filtr etiketləri, placeholder-lər, boş nəticə,
  qalereya düymələrinin ekran oxuyucu adları) az və en dillərində olmalıdır.

**Detal (web-cbar-new)**

- **FR-009**: Detal Media şablonunda göstərilməlidir; breadcrumb "Ana səhifə › Media ›
  {Xəbərlər|Elanlar} › {başlıq}", sol menyuda yazının növünə uyğun bənd aktivdir.
- **FR-010**: Yazının şəkil qoşmalarından birincisi (qoşma sırası ilə) örtük şəkli kimi başlığın
  altında göstərilməli; şəkil yoxdursa bu blok göstərilməməlidir.
- **FR-011**: Örtükdən sonrakı şəkil qoşmaları fotoqalereyada göstərilməlidir: böyük şəkil,
  miniatür zolağı, əvvəlki/növbəti düymələri; miniatür klikləri və klaviatura (sol/sağ ox, Tab)
  ilə idarə olunmalı, cari şəkil ekran oxuyucuya bildirilməlidir. Örtükdən sonra şəkil yoxdursa
  qalereya göstərilməməlidir.
- **FR-012**: Şəkil olmayan qoşmalar mövcud qoşmalar siyahısında qalmalıdır; şəkillər oradan
  çıxarılmalıdır (təkrar göstərilməməlidir).
- **FR-013**: Detalın CMS mətni mövcud təhlükəsiz HTML yolundan keçməlidir (dəyişmir).

**Public API (api-cbar)**

- **FR-014**: Public siyahı endpoint-i əlavə olaraq axtarış sözünü və tarix aralığının başlanğıc
  və son gününü qəbul etməli (hamısı istəyə bağlıdır); verilməyəndə davranış bugünkü kimidir.
  Dəyişiklik əvvəl OpenAPI spesifikasiyasında edilir (spec-first), sonra koda keçir.
- **FR-015**: API səhv formatlı tarixə 400 qaytarmalı, heç bir halda 500 qaytarmamalıdır;
  axtarış sözündəki `%` və `_` hərfi simvol kimi axtarılmalı, söz uzunluğu məhdudlaşdırılmalıdır.
  Sayt səhv URL parametrini API-yə ötürmür (onu nəzərə almır).
- **FR-016**: Soft-delete olunmuş yazının nə siyahıda, nə detalda görünmədiyi real sorğu ilə
  yoxlanmalı; görünürsə sorğuya açıq şərt əlavə edilməlidir.
- **FR-017**: Siyahı və detal cavablarına yalnız yeni sahə əlavə oluna bilər (`type`), mövcud
  sahələr dəyişməməlidir — ana səhifə və digər istehlakçılar qırılmamalıdır.

**Admin (api-cbar-admin, web-cbar-admin-new)**

- **FR-018**: Admin siyahı endpoint-i növ filtrini qəbul etməlidir (istəyə bağlı, spec-first).
- **FR-019**: Admin panelin press-reliz formasında "Növ" seçimi (Xəbər / Elan) olmalı, yeni yazıda
  default "Xəbər" olmalıdır; siyahıda "Növ" sütunu və filtri olmalıdır. Etiketlər az və en
  dillərində olmalıdır.
- **FR-020**: Admin cavablarının Zod sxemləri `type` sahəsini qəbul etməli və yoxlamalıdır.
- **FR-020a**: Admin API heç vaxt `1` və `2`-dən başqa növ yazmamalıdır: səhv dəyərə 400
  qaytarmalı; növ göndərilməyəndə yeni yazı "Xəbər" olmalı, mövcud yazının növü isə dəyişmədən
  qalmalıdır (köhnə panel versiyası ilə də data korlanmır). Admin panel `type`-ı həmişə göndərir.

**Ümumi**

- **FR-021**: Sxem dəyişməməlidir: yeni migration, yeni cədvəl və ya `Cbar.Domain` dəyişikliyi
  olmamalıdır.

### Key Entities

- **Press-reliz (PressRelease)**: növü (1 = Xəbər, 2 = Elan), statusu, dərc tarixi, soft-delete
  tarixi; dil üzrə tərcümələri (başlıq, slug, mətn) və sıralı qoşmaları (media faylları) var.
  Mövcud entity-dir, dəyişmir.
- **Qoşma (PressReleaseAsset)**: yazıya bağlı media faylı və sıra nömrəsi. Şəkil tipli
  qoşmalar örtük + qalereya, qalanları fayl siyahısı kimi göstərilir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Siyahı və detal üç breakpoint-də (1728, 744, 390) Figma ilə ölçülüb müqayisə
  olunur; kart, filtr sətri, başlıq, örtük, qalereya ölçülərində fərq ≤ 2px, qəbul edilmiş
  fərqlər `visual-diff.md`-də səbəbi ilə yazılıb.
- **SC-002**: Ziyarətçi məlum başlıqlı xəbəri axtarış sahəsi ilə bir cəhddə, 2 klikdən az
  addımla tapır; tarix aralığı köhnə saytdakı nəticə ilə eyni sayda xəbər qaytarır (eyni məlumat
  üzərində).
- **SC-003**: Filtrli siyahının linki başqa brauzerdə açılanda eyni nəticə göstərilir (100%).
- **SC-004**: Redaktor admin paneldən "Elan" yaradıb dərc edir və o, 1 dəqiqə ərzində saytdakı
  Elanlar siyahısında görünür, Xəbərlər siyahısında görünmür.
- **SC-005**: Silinmiş yazı heç bir public ünvanda görünmür (siyahı, detal, ana səhifə) — real
  sorğu ilə yoxlanılıb.
- **SC-006**: Hər iki frontend-in gate-i (`npm run verify`) yaşıldır. Yeni testlər funksionaldır:
  istifadəçinin etdiyini (filtr göndərmək, "Filtrləri təmizlə", paginasiyada filtrin saxlanması,
  miniatür/ox/klaviatura ilə qalereyada keçid, admin-də "Növ" seçib yadda saxlamaq) və gördüyünü
  (boş nəticə mesajı, örtük/qalereya/qoşma bölgüsü, tipsiz ünvanın Xəbərlər olması) MSW üzərindən
  real API kontraktı ilə yoxlayır. Hər test müvafiq davranış qırılanda düşür; render/snapshot/class
  testləri yazılmır. Hər iki API `dotnet build` keçir, OpenAPI lint + bundle təmizdir.
- **SC-007**: Ana səhifə, axtarış və digər mövcud press-reliz istehlakçıları dəyişiklikdən sonra
  əvvəlki kimi işləyir (reqressiya yoxdur).

## Əhatədən kənar

- Legacy `press-release-{id}/{slug}` və `press-releases/{type}` ünvanlarının yönləndirilməsi
  (id → slug axtarışı tələb edir; ayrıca spec).
- Ünvanın `/media/news` kimi dəyişdirilməsi — `/press-releases` qalır (CMS `navUrl`-ları və
  xarici linklər buna aparır).
- Mətn üzrə tam mətn axtarışı (Meilisearch) — axtarış yalnız başlıq üzrədir.
- Detalda "Oxşar xəbərlər", sorğu (PressReleaseQuestion) blokunun yenidən dizaynı.
- Fotoqalereyanın tam ekran (lightbox) rejimi — spec 009-un image-popup-u varsa ondan istifadə
  plan mərhələsində qərarlaşdırılır, yeni lightbox yazılmır.
- Admin-də ayrıca "örtük şəkli" sahəsi — örtük ilk şəkil qoşmasıdır, redaktor sıranı mövcud qoşma
  bölməsindən idarə edir.

## Assumptions

- Figma "cbar website (Copy)" yekun dizayndır; ölçülər node-lardan götürülür (yuxarıdakı cədvəl).
- Media menyusundakı "Xəbərlər" və "Elanlar" bəndləri CMS-də `/press-releases?type=1` və
  `?type=2`-yə aparır (spec 028, test mühitindən ölçülüb); menyunun cari bəndi `type` parametrinə
  görə müəyyən edilir.
- Səhifə başına 9 kart — Figma-da 3×3 grid; köhnə 10 grid-ə uyğun gəlmir.
- Siyahı default olaraq filtrsizdir (köhnə saytın "cari ayın 1-i" default-u götürülmür): yeni
  ziyarətçi ən son xəbərləri tarix seçmədən görür. Bu, Maddə I.3 baxımından funksiya itkisi deyil
  — filtr mövcuddur.
- Tipsiz `/press-releases` Xəbərlər (`type=1`) göstərir; bugünkü "hər iki növ qarışıq" görünüşü
  götürülür, çünki Figma-da "Hamısı" yoxdur və ana səhifənin "Hamısına bax" linki məhz xəbərlər
  tabındandır.
- Tarixlər Bakı vaxtı (UTC+4) ilə gün sərhədinə görə süzülür; URL-də tarix formatı plan
  mərhələsində mövcud `shared/lib/search-params` konvensiyasına görə seçilir.
- Kit-də tarix aralığı seçici varsa o istifadə olunur; yoxdursa iki tarix sahəsi Figma-nın bir
  sahə görünüşündə birləşdirilir — plan mərhələsində kit yoxlanılır.
- Örtük şəkli üçün ayrıca sahə yoxdur; ilk şəkil qoşması örtükdür. Bu, mövcud siyahı kartının
  şəkil məntiqi ilə eynidir.
- Figma-dakı iki detal variantı eyni şablondur (fərq mətnin uzunluğu və qalereyadır), ayrıca
  rejim tələb etmir.
- Detal H1 rəngi `#333333` vs şablonun `#222222`-si — spec 028-dəki kimi şablon dəyişmir, fərq
  `visual-diff.md`-də qeyd olunur.
