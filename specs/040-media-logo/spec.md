# Feature Specification: Mərkəzi Bankın loqosu — Figma görünüşü, məzmun və fayllar admin paneldən

**Feature Branch**: `040-media-logo`

**Created**: 2026-11-11

**Status**: Implemented

**Input**: "Bunu elə edək ki adminkadan tam idarə etmək olsun, əlavə deploy və ya başqa ehtiyac yaranmasın. Speckit ilə
icra edək, sonda dokumentasiya faylı da əlavə edək. Loqoları sonra özüm əlavə edəcəm admin paneldən. Səhifənin redirect
linki də necə olmalıdırsa onu da deyərsən." Yanaşma A seçilib: adi CMS səhifəsi və onun faylları, backend dəyişikliyi yoxdur.

**Figma**: `Media - Loqotip · Desktop` `2067:2284` (1728), məzmun frame-i `2071:2843`, 984 en, bloklar arası 36:

- H1 `2071:2845`: "Mərkəzi Bankın loqosu", 32/600.
- Hero `2071:3012`: 984×320, fon `#F9F9F9`, radius 4, ortada rəngli horizontal loqo, en 520.
- "Loqo versiyaları" `2071:3013`: başlıq 24/600, rəng `#222222`, başlıqdan şəbəkəyə 20. Şəbəkə `2071:3017`: 4 kart,
  hər biri 231×282, gap 20, ağ fon, haşiyə `#E5E5E5` (INSIDE), radius 4. Kartda önizləmə, ad 15/600 lh20, izah 13/400 lh19.
- Yükləmə sətri `2071:2815`: 3 kart, hər biri ~315 en, gap 20, padding 20, daxili gap 12, haşiyə `#E5E5E5`, radius 4.
  Kartda format çipi (pill, radius 100, haşiyə `#CCD1D6`, padding 4/12, 13/700), ölçü 13/400 `#787878`, düymə "↓ Yüklə"
  (fon `#E9FAF7`, radius 4, padding 8/12, gap 6, 13/600).
- Breadcrumb "Ana səhifə › Media › Mərkəzi Bankın loqosu", paylaşma düymələri `2068:111187` və sol menyu `2068:111159`
  mövcud bölmə şablonundandır.

**Tablet və mobil**: tablet `2076:113861` (744), mobil `2076:114736` (iPhone 13). Ölçülər `contracts/ui-contract.md`-də olacaq.

**Hazırkı vəziyyət** (test API, 2026-11-11): səhifə CMS-də artıq var: id `553`, Media kökünün uşağı, başlıq
"Mərkəzi Bankın Logosu", slug `merkezi-bankin-logosu`. EN tərcüməsi boşdur (ağacda az başlığı görünür), məzmun boşdur,
fayl yoxdur. Şablon və sol menyu artıq işləyir, səhifə boş görünür. Köhnə cbar.az-da belə səhifə yox idi.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Jurnalist və ya tərəfdaş loqonu tapır və yükləyir (Priority: P1)

İstifadəçi Media bölməsində "Mərkəzi Bankın loqosu" səhifəsini açır, loqonun hansı versiyasının harada işləndiyini görür
və lazım olan formatda faylı yükləyir.

**Why this priority**: Səhifənin əsas məqsədi budur. Bu gün səhifə boşdur.

**Independent Test**: Versiya cədvəli və faylları olan səhifəni az və en dilində açmaq, Figma ilə tutuşdurmaq, hər
"Yüklə" düyməsi ilə faylı endirmək.

**Acceptance Scenarios**:

1. **Given** məzmun və fayllar doldurulub, **When** səhifə açılır, **Then** başlıq, Hero, "Loqo versiyaları" başlığı, versiya kartları və yükləmə kartları Figma sırası ilə görünür.
2. **Given** ağ loqo versiyası, **When** kart göstərilir, **Then** önizləmə tünd fonda görünür, loqo oxunur.
3. **Given** yükləmə kartı, **When** istifadəçi "Yüklə"-yə klikləyir, **Then** fayl brauzerdə endirilir, səhifədən çıxmadan.
4. **Given** yükləmə kartı, **When** səhifə açılır, **Then** kartda format adı və faylın ölçüsü görünür.
5. **Given** en dili, **When** səhifə açılır, **Then** bütün redaksiya mətni en məzmunundan, düymə etiketi en dilindədir.

---

### User Story 2 - Redaktor loqoları və faylları admin paneldən idarə edir (Priority: P1)

Redaktor kod dəyişikliyi və deploy olmadan versiya kartlarını (şəkil, ad, izah, fon) və yükləmə fayllarını admin
panelin səhifə redaktorunda əlavə edir, dəyişir, silir, dəyişiklik saytda dərhal görünür.

**Why this priority**: İstifadəçinin açıq tələbidir. Real loqoları istifadəçi sonra özü yükləyəcək.

**Independent Test**: Admin paneldə versiya cədvəlinə şəkil qoyub və səhifəyə fayl yükləyib yadda saxlamaq, saytı
yeniləyib kartı və yükləmə kartını görmək.

**Acceptance Scenarios**:

1. **Given** cədvəlin sətrinə şəkil qoyulub, **When** yadda saxlanır, **Then** uyğun versiya kartında şəkil görünür.
2. **Given** cədvəlin birinci sətrinin şəkli dəyişdirilib, **When** yadda saxlanır, **Then** Hero-da yeni şəkil görünür.
3. **Given** səhifəyə yeni fayl yüklənib və adı "SVG" yazılıb, **When** yadda saxlanır, **Then** yeni yükləmə kartı "SVG" çipi və faylın ölçüsü ilə görünür.
4. **Given** fayl silinib və ya sırası dəyişdirilib, **When** yadda saxlanır, **Then** yükləmə kartları həmin sıranı izləyir.
5. **Given** sətrin fon xanasında "tünd" yazılıb, **When** yadda saxlanır, **Then** kartın önizləmə fonu tünd olur.
6. **Given** hazır HTML mənbə rejiminə yapışdırılıb, **When** səhifə yadda saxlanıb yenidən açılır, **Then** cədvəl, şəkillər və başlıq itmir.
7. **Given** Sənədlər blokunda üç format arxivi var (`SVG`: bütün versiyaların SVG-ləri, `PNG`: bütün versiyalar bütün ölçülərdə, `PDF`: bütün versiyaların PDF-ləri), **When** istifadəçi "PNG" kartında "Yüklə"-yə klikləyir, **Then** bir ZIP endirilir və içində bütün versiyaların bütün ölçüdə PNG faylları olur. SVG və PDF kartları eyni qaydada işləyir.

---

### User Story 3 - Hazır məzmunun yerləşdirilməsi (Priority: P2)

İstifadəçi hər dil üçün hazır HTML faylını redaktora yapışdırır, sonra hər sətrə öz loqo şəklini qoyur.

**Why this priority**: Bir dəfəlik iş, amma səhifə əl ilə yığılmadan Figma quruluşunu alır.

**Independent Test**: Faylı test mühitində səhifəyə yapışdırıb saytı açmaq. Şəkillər qoyulana qədər də kartlar düzgün
quruluşda görünür.

**Acceptance Scenarios**:

1. **Given** repo kökündəki `merkezi-bankin-logosu-html/`, **When** `az.html` və `en.html` yapışdırılır, **Then** hər iki dildə 4 versiya kartı ad və izahla görünür, şəkil yerləri boş qutudur.

---

### Edge Cases

- Cədvəl yoxdur və ya qaydaya uymur (sətirdə 3–4 xana deyil, ad boşdur): bütün cədvəl adi cədvəl kimi qalır, Hero və kartlar yoxdur, mətn itmir.
- Sətirdə şəkil yoxdur: kart boş önizləmə qutusu ilə göstərilir. Birinci sətrin şəkli yoxdursa Hero göstərilmir.
- Sətirdə bir neçə şəkil var: yalnız birincisi götürülür.
- Fon xanası boşdur və ya tanınmır: açıq fon.
- Səhifədə ikinci cədvəl var: yalnız birincisi versiya cədvəlidir, qalanı adi məzmundur.
- Versiya sayı 4-dən fərqlidir (1–8): kartlar şəbəkədə sətirlərə bölünür. 8-dən çox: cədvəl adi cədvəl qalır.
- Səhifənin faylı yoxdur: yükləmə sətri göstərilmir.
- Faylın adı yazılmayıb: çipdə faylın uzantısı böyük hərflə (məs. "ZIP") görünür.
- Faylın ölçüsü məlum deyil (0 və ya yoxdur): ölçü sətri göstərilmir, kart eyni hündürlükdə qalır.
- Bir loqo versiyası dəyişib: redaktor həmin formatların arxivini yenidən yığır, köhnə faylı Sənədlərdən silib yenisini yükləyir. Sayt arxivin içini yoxlamır.
- Uzun versiya adı və ya izah kartdan çıxmır, sətrə bölünür.
- Bir dilin tərcüməsi boşdur: mövcud ümumi davranış qalır, xüsusi hal yoxdur.
- Redaktor slug-ı dəyişib: qayda işləmir, səhifə adi məzmun kimi qalır, mətn itmir. Fayllar adi fayl siyahısı kimi qalır.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Səhifə mövcud Media bölmə şablonunda (breadcrumb, paylaşma, sol menyu) və mövcud CMS ünvanında qalmalıdır. Yeni marşrut, yönləndirmə və menyu kodu əlavə olunmamalıdır.
- **FR-002**: Başlıq, bölmə başlığı ("Loqo versiyaları"), versiya adı, izahı, şəkli və yükləmə kartının adı yalnız CMS məzmunundan və səhifənin fayllarından gəlməlidir. Kodda yalnız düymə etiketi ("Yüklə" / "Download") və əlçatanlıq etiketləri ola bilər.
- **FR-003**: Yuxarı səviyyədəki birinci cədvəl, hər sətri 3–4 xanalı və sətir sayı 1–8 olduqda, versiya kartlarına çevrilməlidir: 1-ci xana şəkil, 2-ci ad, 3-cü izah, 4-cü fon. Ad boş ola bilməz.
- **FR-004**: Fon xanası "tünd" / "dark" (böyük-kiçik hərf fərqi olmadan) olduqda önizləmə tünd fonda, qalan hallarda açıq fonda göstərilməlidir.
- **FR-005**: Birinci versiyanın şəkli Hero-da böyük ölçüdə göstərilməlidir. Ayrıca Hero şəkli tələb olunmamalıdır.
- **FR-006**: Qaydaya uymayan cədvəl tam olaraq adi məzmun kimi qalmalıdır, heç bir mətn atılmamalıdır. Cədvəldən əvvəlki məzmun kartlardan yuxarıda, sonrakı aşağıda qalmalıdır.
- **FR-007**: Səhifənin hər faylı redaktorun qoyduğu sıra ilə bir yükləmə kartı olmalıdır: çipdə faylın adı (yoxdursa uzantı), ölçü dilə uyğun formatda (az "1,2 MB", en "1.2 MB"), endirmə düyməsi.
- **FR-008**: Bu səhifədə fayllar adi fayl siyahısı kimi təkrar göstərilməməlidir, yalnız yükləmə kartlarıdır.
- **FR-009**: Qayda yalnız bu səhifəyə tətbiq olunmalıdır (az və en slug-ı ilə). Media bölməsinin digər səhifələri dəyişməməlidir.
- **FR-010**: Görünüş desktop-da Figma `2071:2843`-ə, tablet və mobildə uyğun frame-lərə uymalıdır. Dar ekranda kartlar daha az sütuna düşməlidir.
- **FR-011**: Önizləmə şəkli kartda proporsiyasını saxlamalı, kəsilməməli, kartdan çıxmamalıdır. Şəklin `alt` mətni yoxdursa versiya adı işlənməlidir.
- **FR-012**: Admin redaktoru bu səhifənin cədvəlini, şəkillərini və başlığını yadda saxlama zamanı itirməməlidir. Bu, avtomatik yoxlama (layout guard) ilə qorunmalıdır.
- **FR-013**: Hər iki dil üçün hazır HTML repo kökündə `merkezi-bankin-logosu-html/`-də olmalıdır, yapışdırma addımları ilə birlikdə.
- **FR-014**: Redaktor təlimatı olmalıdır: `dokumentasiyalar/` altında ayrıca fayl və `web-cbar-new/docs/media-cms-guide.md`-də bölmə. Təlimat səhifəni tapmağı, slug-ı, cədvəl qaydasını, şəkil qoymağı və fayl yükləməyi izah etməlidir.
- **FR-015**: API, verilənlər bazası və admin panel kodunda funksional dəyişiklik edilməməlidir. Admin paneldə yalnız layout fikstürü və roundtrip testi əlavə olunur.
- **FR-016**: Bir formatın bütün loqoları bir kliklə endirilməlidir: hər format (SVG, PNG, PDF) bir yükləmə kartıdır və onun faylı həmin formatda bütün versiyaları (PNG üçün bütün ölçüləri) daxil edən ZIP arxividir. Arxivi redaktor hazırlayır, sayt onu FR-007 qaydası ilə adi fayl kimi verir. Redaktor təlimatı (FR-014) arxivin tərkibini, fayl adlarını və yenilənməsini izah etməlidir.

### Key Entities

- **Loqo versiyası**: redaktorun cədvəl sətrindən alınan görüntü. Şəkil (istəyə bağlı), ad, izah (istəyə bağlı), fon (açıq/tünd). Ayrıca saxlanmır.
- **Yükləmə faylı**: səhifənin mövcud faylı (admin paneldə səhifənin "Sənədlər" bloku). Ad hər dil üçün, növ, ölçü, sıra.
- **Loqo səhifəsi**: mövcud CMS səhifəsi `553`, az və en tərcüməsi ilə.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Desktop-da Hero, versiya kartları, yükləmə kartları, aralıqlar və şrift ölçüləri Figma rəqəmləri ilə 1 px dəqiqliyində uyğundur.
- **SC-002**: Redaktor loqo şəklini və ya yükləmə faylını kod dəyişikliyi və deploy olmadan 2 dəqiqədən az vaxtda dəyişə bilir.
- **SC-003**: Saytda görünən redaksiya mətninin və faylların 100%-i admin paneldən dəyişdirilə bilir.
- **SC-004**: Hazır HTML yapışdırılıb yadda saxlandıqdan sonra cədvəl sətirlərinin, şəkillərin və başlıqların 100%-i qalır.
- **SC-005**: Hər "Yüklə" düyməsi düzgün faylı endirir, digər Media səhifələrinin görünüşü dəyişmir.

## Assumptions

- Mövcud `553` səhifəsi işlədilir, yenisi yaradılmır. az slug `merkezi-bankin-logosu` qalır. EN tərcüməsi doldurulanda slug `central-bank-logo` olur. Hər ikisi və onların `-copy` variantı qeydiyyata alınır.
- Ünvan: `/az/media/merkezi-bankin-logosu`, `/en/media/central-bank-logo`. Köhnə saytda səhifə olmadığı üçün köhnə ünvandan yönləndirmə yoxdur.
- Hər yükləmə kartı bir fayldır. Bir formatda bütün versiyalar ZIP arxivi kimi verilir (FR-016). Sayt arxivi özü yığmır: bu, ayrıca feature olardı (fayllar tək-tək yüklənir, sayt formatlara görə qruplaşdırıb ZIP-i anında yaradır) və 2026-11-12-də rədd edilib, çünki loqo faylları nadir dəyişir.
- Arxivin ölçüsü admin API-nin yükləmə limiti (`MediaController`, 250 MB) daxilindədir.
- Hero ayrıca sahə deyil, birinci versiyanın şəklidir.
- Başlıq "Mərkəzi Bankın Logosu"-nu Figma yazılışına ("Mərkəzi Bankın loqosu") çevirmək redaktor işidir, slug dəyişmir.
- EN mətni Figma-da yoxdur, `en.html`-dəki qaralama tərcümədir və redaksiya yoxlamasından keçməlidir.
- Real loqo şəkillərini və faylları istifadəçi özü yükləyir, spec-in icrası canlı məzmunu yazmır.
- Admin API EPS və AI qəbul etmir (`MediaUploadRules.AllowedTypes`: SVG, PNG, JPG, PDF, ZIP…). EPS ZIP arxivində verilir, backend dəyişmir.
- Faylların ölçüsü yükləmə zamanı yazılır. Köhnə miqrasiya olunmuş faylların ölçüsü etibarsız ola bilər, bu səhifənin faylları isə yeni yüklənəcək.
