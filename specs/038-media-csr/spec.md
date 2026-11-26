# Feature Specification: KSM layihələri — admin paneldən idarə olunan məzmun növü

**Feature Branch**: `038-media-csr`

**Created**: 2026-11-06

**Status**: Draft

**Input**: "Bunun məntiqini necə deyişə bilərik, ayrıca səhifəyə link kimi edək, xəbərlərdə olduğu kimi, sonra orada şəkil və mətnləri əlavə etmək hissəsi əlavə edək. Contentlə bunu idarə etmək nə dərəcədə düzdür və səliqəlidir, anlamıram, plan edək və mənə kömək et, bu səliqəsizliyin qarşısını alaq." Sonrakı qərarlar: saytda görünüş Figma kimi modal qalır, etiket idarə olunan kateqoriya siyahısıdır, iş speckit ilə aparılır.

**Figma**: section `1675:56713`. Səhifə: desktop `1801:60649`, tablet `1801:61310`, mobil `1801:61706`. Kart `1801:4920`. Modal `1801:5457`–`1801:5673`. Ölçülər: `contracts/ui-contract.md`.

**Hazırkı vəziyyət** (2026-11-06): dörd layihənin hamısı bir CMS səhifəsində axın mətni kimi durur. İlk iterasiya (commit olunmayıb) kart və modalı həmin səhifədəki cədvəl + başlıq sırasından qurur və Figma ilə ölçülüb tutuşdurulub. Görünüş hazırdır, problem məzmunun idarə olunmasındadır: cədvəl sətirləri ilə başlıqların sayı fərqlənsə bütün səhifə köhnə görünüşə qayıdır, şəkil və etiket üçün ayrıca sahə yoxdur.

**Əvəz edilən köhnə hissə** (Maddə I.2): `product-host`-da KSM üçün xüsusi controller, view və ya model yoxdur, köhnə saytda bu adi CMS səhifəsidir. Səhifənin ünvanı və menyu yeri dəyişmir, heç bir URL ləğv edilmir.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Redaktor layihəni formadan idarə edir (Priority: P1)

Redaktor admin paneldə "KSM layihələri" bölməsini açır, mövcud layihənin mətnini və şəkillərini dəyişir və ya yeni layihə əlavə edir. HTML, cədvəl və başlıq sırası barədə heç nə bilmək lazım deyil: hər məlumatın öz sahəsi var.

**Why this priority**: Dəyişikliyin əsas səbəbi budur. Redaktorun səhvi səhifənin görünüşünü pozmamalıdır.

**Independent Test**: Admin paneldə iki dildə layihə yaratmaq, dərc etmək və saytda yeni kartı görmək.

**Acceptance Scenarios**:

1. **Given** "KSM layihələri" bölməsi, **When** redaktor az və en sahələrini doldurub layihəni dərc edir, **Then** yeni kart saytda hər iki dildə görünür.
2. **Given** layihə qaralamadadır, **When** ziyarətçi KSM səhifəsini açır, **Then** həmin kart görünmür.
3. **Given** layihənin 9 fotosu var, **When** redaktor fotoların sırasını dəyişib saxlayır, **Then** modalda fotolar yeni sıra ilə göstərilir.
4. **Given** bir neçə layihə, **When** redaktor sıra dəyərini dəyişir, **Then** kartlar saytda həmin sıra ilə düzülür.
5. **Given** məcburi sahə boşdur, **When** redaktor saxlamağa çalışır, **Then** forma həmin sahəni göstərir və məlumat saxlanmır.
6. **Given** layihə silinir, **When** ziyarətçi səhifəni açır, **Then** kart görünmür, səhifənin qalanı dəyişmir.

---

### User Story 2 - Ziyarətçi layihələri görür və oxuyur (Priority: P1)

Ziyarətçi Media bölməsində KSM səhifəsini açır, giriş mətnini və KSM Konsepsiyası faylını görür, layihə kartlarından birinə klikləyir və layihənin başlığını, fotolarını, mətnini və keçidlərini modalda oxuyur.

**Why this priority**: İctimai nəticə budur və Figma ilə uyğun qalmalıdır.

**Independent Test**: Doldurulmuş layihələrlə səhifəni az və en dilində, üç ekran ölçüsündə açmaq, ölçüləri `contracts/ui-contract.md` ilə tutuşdurmaq.

**Acceptance Scenarios**:

1. **Given** dörd dərc olunmuş layihə, **When** səhifə açılır, **Then** giriş mətni, fayl sətri, "Layihələrimiz" başlığı və dörd kart Figma sırası ilə görünür.
2. **Given** kart, **When** ziyarətçi ona klikləyir, **Then** kateqoriya, modal başlığı, fotolar və mətn olan pəncərə açılır.
3. **Given** bir neçə fotolu layihə, **When** ziyarətçi kiçik şəkli seçir, **Then** böyük foto və sayğac dəyişir.
4. **Given** fotosuz layihə, **When** modal açılır, **Then** qalereya sahəsi göstərilmir.
5. **Given** modal açıqdır, **When** ziyarətçi bağlama düyməsini və ya Escape-i basır, **Then** modal bağlanır və fokus karta qayıdır.
6. **Given** layihə yalnız bir dildə görünən işarələnib, **When** səhifə digər dildə açılır, **Then** həmin kart görünmür.

---

### User Story 3 - Redaktor kateqoriyaları idarə edir (Priority: P2)

Redaktor layihə etiketlərini (Maliyyə savadlılığı, Təhsil, Ekologiya, Səhiyyə) bir siyahıda az və en dilində saxlayır, layihədə isə sadəcə seçir.

**Why this priority**: Eyni etiketin fərqli yazılmasının qarşısını alır, amma layihə idarəsi onsuz da başlaya bilər.

**Independent Test**: Kateqoriyanın adını dəyişmək və bütün bağlı kartlarda yeni adı görmək.

**Acceptance Scenarios**:

1. **Given** kateqoriya, **When** redaktor onun adını dəyişir, **Then** ona bağlı bütün kart və modallarda yeni ad görünür.
2. **Given** kateqoriyaya bağlı layihə var, **When** redaktor onu silməyə çalışır, **Then** əməliyyat aydın mesajla rədd edilir.
3. **Given** KSM kateqoriyası yaradılıb, **When** ziyarətçi Tədbirlər səhifəsini açır, **Then** bu kateqoriya tədbir filtrində görünmür.

---

### User Story 4 - Mövcud məzmun əl işi olmadan köçür (Priority: P2)

Dəyişiklik yayımlananda dörd mövcud layihə mətn və fotoları ilə yeni bölməyə keçir, KSM səhifəsində giriş mətni və fayl qalır. Redaktor heç nəyi yenidən yazmır.

**Why this priority**: Yayım günü səhifə boş qalmamalı və məzmun təkrarlanmamalıdır.

**Independent Test**: Köhnə məzmunlu bazaya köçürməni tətbiq edib səhifəni yoxlamaq, sonra ikinci dəfə tətbiq edib dublikat olmadığını görmək.

**Acceptance Scenarios**:

1. **Given** köhnə məzmunlu səhifə, **When** köçürmə tətbiq olunur, **Then** dörd layihə az və en dilində dərc olunmuş olur, hər layihənin mətni bir dəfə görünür.
2. **Given** köçürmə tətbiq olunub, **When** səhifənin mətninə baxılır, **Then** CMS-dəki mətn dəyişməyib, saytda isə köhnə siyahı görünmür.
3. **Given** köçürmə artıq tətbiq olunub, **When** yenidən işləyir, **Then** dublikat layihə və ya kateqoriya yaranmır.

---

### Edge Cases

- Layihə API-si hələ deploy olunmayıb və ya xəta verir: səhifə açılır, giriş mətni və fayl görünür, başlıq və kartlar görünmür.
- Dərc olunmuş layihə yoxdur: "Layihələrimiz" başlığı göstərilmir.
- Kart şəkli yoxdur: kartda boş boz sahə qalır, ilk qalereya şəkli varsa o istifadə olunur.
- Layihənin bir fotosu var: sayğac və kiçik şəkillər göstərilmir.
- 6-dan çox foto: kiçik şəkil zolağı üfüqi sürüşür, seçilən şəkil görünən sahəyə gəlir.
- Layihənin bir dildə mətni boşdur: həmin dildə görünmür.
- Kateqoriya deaktiv edilib: bağlı layihələr saytda etiketi ilə görünməyə davam edir. Formada seçim siyahısı Tədbirlərdəki kimi bütün kateqoriyaları göstərir.
- Layihəyə bağlı foto media kitabxanasından silinmək istənir: əməliyyat fayl istifadədə olduğu üçün rədd edilir.
- JavaScript yoxdur: modal açılmır, layihə mətnləri səhifədə oxuna bilir.
- Uzun mətn: modal pəncərəsi sürüşür, bağlama düyməsi görünən qalır.
- Axtarışda layihə tapılır: nəticə KSM səhifəsinə aparır, modal avtomatik açılmır.

## Requirements *(mandatory)*

### Functional Requirements

**Admin panel**

- **FR-001**: Redaktor layihələri ayrıca bölmədə siyahı kimi görə, yarada, redaktə edə və silə bilməlidir.
- **FR-002**: Hər layihənin az və en üçün kart başlığı, qısa təsvir, modal başlığı və zəngin mətni olmalıdır. Ən azı bir dil məcburidir; dolu dildə kart başlığı, qısa təsvir və modal başlığı boş ola bilməz, zəngin mətn boş ola bilər.
- **FR-003**: Qısa təsvir çoxsətirli sahədə yazılmalıdır.
- **FR-004**: Hər layihə bir kateqoriyaya bağlı olmalıdır, kateqoriya siyahıdan seçilir.
- **FR-005**: Layihənin istəyə görə bir kart şəkli olmalıdır, qalereyadan asılı olmadan.
- **FR-006**: Redaktor layihəyə fotolar əlavə edə, silə və onları sıralaya bilməlidir.
- **FR-007**: Redaktor layihənin sırasını, dərc statusunu və hər dildə görünüşünü təyin edə bilməlidir.
- **FR-008**: Redaktor kateqoriyaları az və en adı, sıra və aktivlik ilə idarə edə bilməlidir.
- **FR-009**: Layihəyə bağlı kateqoriya silinə bilməz, redaktor aydın mesaj görməlidir.
- **FR-010**: Bu bölmələrə giriş və yazı mövcud rol-icazə qaydası ilə idarə olunmalı, dəyişikliklər audit jurnalına düşməlidir.
- **FR-011**: Layihənin istifadə etdiyi şəkillər media kitabxanasından silinməkdən qorunmalıdır.

**Sayt**

- **FR-012**: KSM səhifəsi Figma görünüşünü saxlamalıdır: giriş mətni, fayl sətri, bölmə başlığı, kart şəbəkəsi (`contracts/ui-contract.md`).
- **FR-013**: Giriş mətni və fayl CMS səhifəsindən, kartlar və modal yeni bölmədən gəlməlidir.
- **FR-014**: Saytda yalnız dərc olunmuş, silinməmiş və cari dildə görünən layihələr redaktorun sırası ilə göstərilməlidir.
- **FR-015**: Karta klik modal açmalıdır. Layihənin ayrıca ünvanı olmur.
- **FR-016**: Modal kateqoriyanı, modal başlığını, fotoları (varsa), mətni və keçidləri göstərməlidir.
- **FR-017**: Layihə fotoları ümumi Qalereya siyahısında görünməməlidir.
- **FR-018**: KSM kateqoriyaları tədbir kateqoriyalarından ayrı olmalıdır.
- **FR-019**: Layihə məlumatı alınmayanda səhifə xəta verməməli, CMS hissəsi göstərilməlidir.
- **FR-020**: JavaScript olmadan layihə başlıqları və mətnləri səhifədə oxuna bilməlidir.
- **FR-021**: Layihə mətni sayt axtarışında tapılmalı, nəticə KSM səhifəsinə aparmalıdır.
- **FR-022**: Bütün chrome mətnlər az və en dilində olmalıdır, redaksiya mətni yalnız admin paneldən gəlməlidir.

**Köçürmə**

- **FR-023**: Dörd mövcud layihə və dörd kateqoriya yayım zamanı avtomatik yaradılmalıdır.
- **FR-024**: Mövcud fotolar layihələrə bağlanmalıdır. Foto tapılmayan mühitdə layihə fotosuz yaradılır və redaktor admin paneldən əlavə edir.
- **FR-025**: Köçürmə CMS səhifəsinin mətnini dəyişməməlidir. Layihələr gələndə sayt köhnə siyahını səhifədə göstərməməli, layihə olmayanda köhnə mətn görünməlidir.
- **FR-026**: Köçürmə təkrar işlədikdə dublikat yaratmamalıdır.

### Key Entities *(include if feature involves data)*

- **KSM layihəsi**: bir sosial layihə. Kateqoriya, kart şəkli, sıra, dərc statusu, dillər üzrə görünüş; silinmə qeydi saxlanır.
- **Layihə tərcüməsi**: bir dil üçün kart başlığı, qısa təsvir, modal başlığı, zəngin mətn.
- **Layihə fotosu**: layihəyə bağlı media faylı və onun sırası.
- **KSM kateqoriyası**: sıra və aktivlik; dillər üzrə ad. Tədbir kateqoriyasından asılı deyil.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor yeni layihəni fotoları ilə birlikdə 5 dəqiqədən az vaxtda dərc edə bilir, HTML və ya cədvəl yazmadan.
- **SC-002**: Redaktorun heç bir form daxiletməsi KSM səhifəsinin Figma düzülüşünü pozmur: indiki "bütün səhifə köhnə görünüşə qayıdır" halı aradan qalxır.
- **SC-003**: Köçürmədən sonra dörd layihənin bütün mətni hər iki dildə əl işi olmadan görünür, heç bir layihə mətni təkrarlanmır.
- **SC-004**: Səhifənin görünüşü üç ekran ölçüsündə (1728, 744, 390) `contracts/ui-contract.md`-dəki ölçülərə uyğundur.
- **SC-005**: Admindəki dəyişiklik saytda 1 dəqiqədən az vaxtda görünür.
- **SC-006**: Layihə xidməti əlçatan olmayanda KSM səhifəsi xətasız açılır.

## Assumptions

- Görünüş ilk iterasiyadakı kimi qalır, Figma-dan qəbul edilmiş fərqlər `contracts/ui-contract.md`-dədir.
- Modal başlığı boş buraxıla bilməz: Figma-da kart başlığından fərqlidir, ona görə ayrıca məcburi sahədir.
- Fotolar birinci saxlamadan sonra əlavə olunur, Press-relizlərdə də belədir.
- "(Kopya)" səhifələri köçürmə ilə dəyişmir və köhnə mətnin ehtiyat nüsxəsi kimi qalır.
- EN kart mətnləri CMS-də yox idi, qaralama kimi hazırlanıb (seed `0021`), redaktor yoxlamalıdır. Maliyyə və Ekologiya kartları üçün şəkil yoxdur, redaktor əlavə edir.
- Komponentlər ayrıca yayımlanır, sıra: `api-cbar-admin`, `api-cbar`, `web-cbar-admin-new`, `web-cbar-new`. Hamısı bir yayımda gedir, ayrıca ikinci yayım yoxdur.
- Legacy URL yönləndirməsi lazım deyil: səhifənin ünvanı dəyişmir.
